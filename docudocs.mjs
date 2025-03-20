/*!
 * Copyright (c) Friendly Captcha GmbH 2023.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
// Rewrites the markdown docs files making them more suitable for docusaurus.
// Heavily inspired by the docs build script in the faast.js repository (Apache-2.0 license)

import fsExtra from "fs-extra";
import { createInterface } from "readline";
import { join, parse, dirname } from "path";

const { readdir, createReadStream, writeFile, mkdir, rm } = fsExtra;

async function main() {
  const dir = "./dist/docs/markdown";
  const outDir = "./dist/docs/docusaurus";

  await mkdir(outDir, { recursive: true });
  await writeFile(
    join(outDir, "_category_.json"),
    JSON.stringify({
      label: "SDK Reference",
      position: 100,
    })
  );
  console.log(join(outDir, "_category_.json"));
  const docFiles = await readdir(dir);
  for (const docFile of docFiles) {
    try {
      const { name: id, ext } = parse(docFile);
      if (ext !== ".md") {
        continue;
      }

      const docPath = join(dir, docFile);
      const outDocPath = join(outDir, id + ".md");
      const input = createReadStream(docPath);
      const output = [];
      const lines = createInterface({
        input,
        crlfDelay: Infinity,
      });

      let title = "";
      lines.on("line", (line) => {
        let skip = false;
        if (!title) {
          const titleLine = line.match(/## (.*)/);
          if (titleLine) {
            title = titleLine[1];
          }
        }
        const homeLink = line.match(/\[Home\]\(.\/index\.md\) &gt; (.*)/);
        if (homeLink) {
          // Skip the breadcrumb for the toplevel index file.
          if (id !== "friendly-captcha-sdk") {
            output.push(homeLink[1]);
          }
          skip = true;
        }
        // See issue #4. api-documenter expects \| to escape table
        // column delimiters, but docusaurus uses a markdown processor
        // that doesn't support this. Replace with an escape sequence
        // that renders |.
        if (line.startsWith("|")) {
          line = line.replace(/\\\|/g, "&#124;");
        }

        // api-documenter escapes markdown links, so we need to unescape them
        // to display them correctly in docusaurus.
        if (line.match(/\\\[(.*?)\\\]\((.*?)\)/)) {
          line = line.replace(/\\\[(.*?)\\\]\((.*?)\)/, "[$1]($2)");
        }

        if (!skip) {
          output.push(line);
        }
      });

      await new Promise((resolve) => lines.once("close", resolve));
      input.close();

      let hide = id.includes(".");
      // console.log(id, hide)

      const header = [
        "---",
        `id: ${id}`,
        `title: ${title.split(" ")[0]}`,
        `hide_title: true`,
        ...(hide ? [`sidebar_class_name: sidebar-hidden`] : []),
        "---",
      ];

      await writeFile(outDocPath, header.concat(output).join("\n"));
    } catch (err) {
      console.error(`Could not process ${docFile}: ${err}`);
    }
  }
}

main();
