import chai from "chai";
import path from "path";
import fs from "fs";
import {
  generateFromYarnLock,
  resolvePathsAndConflicts
} from "../src/generateFromYarnLock";

const { expect } = chai;

describe("resolvePathsAndConflicts", () => {
  it("will resolve conflicts via a resolution map", async () => {
    const flattened = await resolvePathsAndConflicts(
      {
        "lit-html": ["0.14.0", "1.1.0"]
      },
      {
        "lit-element@^2.0.0": {
          version: "2.1.0",
          dependencies: {
            "lit-html": "^1.0.0"
          }
        },
        "lit-html@^0.14.0": {
          version: "0.14.0"
        },
        "lit-html@^1.0.0": {
          version: "1.1.0"
        }
      },
      {
        "lit-html": "1.1.0"
      },
      `${__dirname}/assets/exampleNestedResolution/`
    );

    expect(flattened).to.deep.equal({
      "lit-html": "/node_modules/lit-element/node_modules/lit-html/lit-html.js"
    });
  });
});

describe("generateFromYarnLock", () => {
  it("creates an import map for a flat yarn.lock file", async () => {
    const targetPath = `${__dirname}/assets/example/`;
    const yarnLockString = fs.readFileSync(`${targetPath}/yarn.lock`, "utf-8");
    const packageJson = JSON.parse(
      fs.readFileSync(`${targetPath}/package.json`, "utf-8")
    );

    const importMap = await generateFromYarnLock(
      yarnLockString,
      packageJson,
      targetPath
    );

    expect(importMap).to.deep.equal({
      imports: {
        "lit-element": "/node_modules/lit-element/lit-element.js",
        "lit-element/": "/node_modules/lit-element/",
        "lit-html": "/node_modules/lit-html/lit-html.js",
        "lit-html/": "/node_modules/lit-html/"
      }
    });
  });

  it("creates a flat import map for nested dependencies if possible", async () => {
    const targetPath = `${__dirname}/assets/exampleNested/`;
    const yarnLockString = fs.readFileSync(`${targetPath}/yarn.lock`, "utf-8");
    const packageJson = JSON.parse(
      fs.readFileSync(`${targetPath}/package.json`, "utf-8")
    );

    const importMap = await generateFromYarnLock(
      yarnLockString,
      packageJson,
      targetPath
    );

    expect(importMap).to.deep.equal({
      imports: {
        "lit-element": "/node_modules/lit-element/lit-element.js",
        "lit-element/": "/node_modules/lit-element/",
        "lit-html": "/node_modules/lit-html/lit-html.js",
        "lit-html/": "/node_modules/lit-html/"
      }
    });
  });

  it("creates a flat import map for nested dependencies if resolutions are provided", async () => {
    const targetPath = `${__dirname}/assets/exampleNestedResolution/`;
    const yarnLockString = fs.readFileSync(`${targetPath}/yarn.lock`, "utf-8");
    const packageJson = JSON.parse(
      fs.readFileSync(`${targetPath}/package.json`, "utf-8")
    );

    const importMap = await generateFromYarnLock(
      yarnLockString,
      packageJson,
      targetPath
    );

    expect(importMap).to.deep.equal({
      imports: {
        "lit-element": "/node_modules/lit-element/lit-element.js",
        "lit-element/": "/node_modules/lit-element/",
        "lit-html":
          "/node_modules/lit-element/node_modules/lit-html/lit-html.js",
        "lit-html/": "/node_modules/lit-element/node_modules/lit-html/"
      }
    });
  });
});
