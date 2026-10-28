/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
// Checks TypeScript sources for language features and APIs that the targeted old browsers lack, as set in a config file.
// Usage: `node lint-compat.mjs [--config <file>]`, the config defaults to `lint-compat.config.mjs` in the current
// directory. Silence a finding with a `// compat-ignore: reason` comment on the same or the previous line.
//
import ts from "typescript";
import path from "path";
import { pathToFileURL } from "url";

const ignoreComment = "compat-ignore";
// A suppression must say why, e.g. `// compat-ignore: feature-checked above`.
const ignoreWithReason = /compat-ignore:\s*\S/;

function hasAsyncModifier(node) {
  return !!node.modifiers && node.modifiers.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword);
}

function isMethodCall(node, names) {
  return (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    names.includes(node.expression.name.text)
  );
}

function isDeclaredOn(nameNode, owners, checker) {
  const symbol = checker.getSymbolAtLocation(nameNode);
  const declarations = (symbol && symbol.declarations) || [];
  return declarations.some(
    (d) =>
      d.parent &&
      (ts.isInterfaceDeclaration(d.parent) || ts.isClassDeclaration(d.parent)) &&
      d.parent.name &&
      owners.includes(d.parent.name.text),
  );
}

// Built-in syntax checks, enabled by id in the config. Each returns a message for a violating node.
const syntaxChecks = {
  // esbuild only needs `Object.getOwnPropertyDescriptors` when properties follow a spread, but we flag every spread.
  objectSpread: (node) =>
    ts.isSpreadAssignment(node) &&
    "Object spread `{...x, key: v}` compiles to a helper that calls `Object.getOwnPropertyDescriptors`, assign the fields one by one",
  objectRest: (node) =>
    ts.isBindingElement(node) &&
    !!node.dotDotDotToken &&
    ts.isObjectBindingPattern(node.parent) &&
    "Object rest `{...rest} = x` needs a large helper",
  arraySpread: (node) =>
    ts.isSpreadElement(node) &&
    ts.isArrayLiteralExpression(node.parent) &&
    "Array spread `[...x]` needs a large helper, use `concat` or `slice`",
  nullishCoalescing: (node) =>
    ts.isBinaryExpression(node) &&
    (node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken ||
      node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionEqualsToken) &&
    "`??` is not supported",
  optionalChaining: (node) =>
    (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node) || ts.isCallExpression(node)) &&
    !!node.questionDotToken &&
    "`?.` is not supported",
  asyncAwait: (node) =>
    (ts.isFunctionLike(node) && hasAsyncModifier(node) && "`async` functions are not transpiled, use Promises") ||
    (ts.isAwaitExpression(node) && "`await` is not transpiled, use Promises"),
  generators: (node) =>
    ((ts.isFunctionLike(node) && !!node.asteriskToken) || ts.isYieldExpression(node)) &&
    "Generators are not transpiled",
  forOf: (node) => ts.isForOfStatement(node) && "`for ... of` is not supported, use a for loop",
  regexLookbehind: (node) =>
    ts.isRegularExpressionLiteral(node) &&
    /\(\?<[=!]/.test(node.text) &&
    "Regex lookbehind `(?<=`/`(?<!` cannot be transpiled",
  regexSticky: (node) =>
    ts.isRegularExpressionLiteral(node) &&
    node.text.slice(node.text.lastIndexOf("/") + 1).includes("y") &&
    "The sticky regex flag `y` is not supported",
  mapSetConstructorArgs: (node) =>
    ts.isNewExpression(node) &&
    ts.isIdentifier(node.expression) &&
    (node.expression.text === "Map" || node.expression.text === "Set") &&
    !!node.arguments &&
    node.arguments.length > 0 &&
    "`Map`/`Set` constructor arguments are not supported in Safari 7.1 and 8",
  mainElement: (node) =>
    isMethodCall(node, ["createElement"]) &&
    node.arguments.length > 0 &&
    ts.isStringLiteralLike(node.arguments[0]) &&
    node.arguments[0].text === "main" &&
    "The `<main>` element is not supported, use a div",
  eventListenerOptions: (node) =>
    isMethodCall(node, ["addEventListener", "removeEventListener"]) &&
    node.arguments.length > 2 &&
    ts.isObjectLiteralExpression(node.arguments[2]) &&
    "IE11 reads an options object as `useCapture = true` and ignores `once`/`passive`, pass a boolean",
  // Old browsers ignore the extra arguments, e.g. `classList.add("a", "b")` only adds `a`.
  classListMultipleArgs: (node, { checker }) =>
    isMethodCall(node, ["add", "remove", "toggle"]) &&
    node.arguments.length > 1 &&
    isDeclaredOn(node.expression.name, ["DOMTokenList"], checker) &&
    "`classList." +
      node.expression.name.text +
      "` with more than one argument ignores the rest in IE11, call it once per class",
};

function memberViolation(node, rules, { checker }) {
  if (!ts.isPropertyAccessExpression(node)) return undefined;
  const name = node.name.text;
  for (const rule of rules) {
    if (rule.names.includes(name) && isDeclaredOn(node.name, rule.owners, checker)) {
      return rule.message.replace("{name}", name);
    }
  }
  return undefined;
}

// References to built-in globals, unless a local declaration shadows them.
function globalViolation(node, rules, { checker, program }) {
  if (!ts.isIdentifier(node)) return undefined;
  const rule = rules.find((r) => r.names.includes(node.text));
  if (!rule) return undefined;
  const parent = node.parent;
  if (parent && ((ts.isPropertyAccessExpression(parent) && parent.name === node) || ts.isTypeReferenceNode(parent))) {
    return undefined;
  }
  const symbol = checker.getSymbolAtLocation(node);
  const declarations = (symbol && symbol.declarations) || [];
  // The built-in `globalThis` symbol has no declarations at all.
  const isBuiltIn =
    declarations.length === 0
      ? node.text === "globalThis"
      : declarations.some((d) => program.isSourceFileDefaultLibrary(d.getSourceFile()));
  return isBuiltIn ? rule.message.replace("{name}", node.text) : undefined;
}

/**
 * Returns the violations in `fileNames`, type checked with `options`, for a `config` as in `lint-compat.config.mjs`.
 * @returns {{file: string, line: number, column: number, message: string}[]}
 */
export function lintCompat(fileNames, options, config) {
  const unknown = config.syntax.filter((id) => !syntaxChecks[id]);
  if (unknown.length > 0) throw new Error("Unknown syntax checks: " + unknown.join(", "));

  const program = ts.createProgram(fileNames, options);
  const ctx = { checker: program.getTypeChecker(), program };
  const violations = [];

  for (const fileName of fileNames) {
    const sourceFile = program.getSourceFile(fileName);
    if (!sourceFile) continue;

    // Each `compat-ignore` covers its own line and the next one.
    const ignores = [];
    sourceFile.text.split("\n").forEach((text, line) => {
      if (text.includes(ignoreComment)) ignores.push({ line, hasReason: ignoreWithReason.test(text), used: false });
    });
    const fileViolations = [];

    const visit = (node) => {
      let message;
      for (let i = 0; i < config.syntax.length && !message; i++) message = syntaxChecks[config.syntax[i]](node, ctx);
      message = message || memberViolation(node, config.members, ctx) || globalViolation(node, config.globals, ctx);
      if (message) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        const ignore = ignores.find((i) => i.hasReason && (i.line === line || i.line === line - 1));
        if (ignore) ignore.used = true;
        else fileViolations.push({ file: fileName, line: line + 1, column: character + 1, message });
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);

    for (const ignore of ignores) {
      if (!ignore.hasReason || !ignore.used) {
        const message = ignore.hasReason
          ? "This `compat-ignore` suppresses nothing, remove it"
          : "A `compat-ignore` needs a reason, e.g. `// compat-ignore: feature-checked above`";
        fileViolations.push({ file: fileName, line: ignore.line + 1, column: 1, message });
      }
    }
    fileViolations.sort((a, b) => a.line - b.line || a.column - b.column);
    violations.push(...fileViolations);
  }
  return violations;
}

/** Loads a config file and the files and compiler options of the project it points at. */
export async function loadProject(configPath) {
  const config = (await import(pathToFileURL(path.resolve(configPath)).href)).default;
  const root = path.dirname(path.resolve(configPath));
  const tsconfig = ts.readConfigFile(path.join(root, config.tsconfig), ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(tsconfig.config, ts.sys, root);
  const fileNames = parsed.fileNames.filter((f) => {
    const rel = path.relative(root, f).split(path.sep).join("/");
    return (
      !rel.endsWith(".d.ts") &&
      config.include.some((d) => rel.startsWith(d)) &&
      !config.exclude.some((d) => rel.startsWith(d))
    );
  });
  return { fileNames, options: parsed.options, config };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const configFlag = process.argv.indexOf("--config");
  const configPath = configFlag === -1 ? "lint-compat.config.mjs" : process.argv[configFlag + 1];
  const { fileNames, options, config } = await loadProject(configPath);
  const violations = lintCompat(fileNames, options, config);
  for (const v of violations) {
    console.error(`${path.relative(process.cwd(), v.file)}:${v.line}:${v.column}: ${v.message}`);
  }
  if (violations.length > 0) {
    console.error(
      `\n${violations.length} compatibility issue(s), see the README. Silence a deliberate one with a \`// ${ignoreComment}: reason\` comment.`,
    );
    process.exit(1);
  }
  console.log(`No compatibility issues in ${fileNames.length} files.`);
}
