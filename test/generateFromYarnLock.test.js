import chai from "chai";
import path from "path";
import {
  generateFromYarnLock,
  resolvePathsAndConflicts
} from "../src/generateFromYarnLock";
import exampleLockFile from "./assets/exampleLockFile.js";

const { expect } = chai;

// describe("resolvePathsAndConflicts", () => {
//   it("will resolve path and ask if needed", async () => {
//     const flattened = resolvePathsAndConflicts(
//       {
//         "lit-html": ["1.0.0", "1.1.0"]
//       },
//       {
//         "lit-element@^2.0.1": {
//           version: "2.1.0",
//           dependencies: {
//             "lit-html": "^1.0.0"
//           }
//         },
//         "lit-html@^1.0.0": {
//           version: "1.0.0"
//         },
//         "test-wc-card@^0.0.3": {
//           version: "0.0.3",
//           dependencies: {
//             "lit-html": "^1.0.0"
//           }
//         }
//       },
//       {
//         "lit-html": "1.1.0"
//       },
//       "./assets/exampleWorkspace"
//     );

//     expect(flattened).to.deep.equal({
//       "lit-html": "/node_modules/lit-element/node_modules/lit-html/lit-html.js"
//     });
//   });
// });

describe("generateFromYarnLock", () => {
  it("creates an import map for a yarn.lock file", async () => {
    const importMap = await generateFromYarnLock(
      exampleLockFile,
      {
        dependencies: { "test-wc-card": "^0.0.3" }
      },
      `${__dirname}/assets/example`
    );

    expect(importMap).to.deep.equal({
      imports: {
        "lit-element": "/node_modules/lit-element/lit-element.js",
        "lit-element/": "/node_modules/lit-element/",
        "lit-html": "/node_modules/lit-html/lit-html.js",
        "lit-html/": "/node_modules/lit-html/",
        "test-wc-card": "/node_modules/test-wc-card/index.js",
        "test-wc-card/": "/node_modules/test-wc-card/"
      }
    });
  });
});
