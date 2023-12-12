import fs from "fs";
import filepath from "path";

// This script is run before publishing to npm, it copies some files into the dist folder and copies a slimmed down version of package.json
// into that folder too, along with some readme files. This is so that we can only publish the contents of the dist folder to npm, that way
// we don't have `/dist/` in any import paths.

(() => {
  const source = fs.readFileSync("package.json").toString("utf-8");
  const pkg = JSON.parse(source);
  delete pkg.scripts;
  delete pkg.devDependencies;
  delete pkg.files;
  delete pkg.ava;
  if (pkg.main.startsWith("dist/")) {
    pkg.main = pkg.main.slice(5);
  }

  const outFolder = "dist";

  for (const file of ["LICENSE.md", "README.md", "CHANGELOG.md"]) {
    fs.copyFileSync(file, filepath.join(outFolder, file));
  }

  fs.writeFileSync(filepath.join(outFolder, "/package.json"), Buffer.from(JSON.stringify(pkg, null, 2), "utf-8"));
  fs.writeFileSync(filepath.join(outFolder, "/version.txt"), Buffer.from(sourceObj.version, "utf-8")); // Useful for CI/CD tagging of version.
})();
