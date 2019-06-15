import chai from "chai";
import fs from "fs";
import { generateFromYarnLock } from "../src/generateFromYarnLock";

const { expect } = chai;

describe("postProcessImportMap", () => {
  it("applies overrides from the package.json to the importmap", async () => {
    const targetPath = `${__dirname}/assets/exampleApplyOverrides/`;
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
        "lit-html": "/foo",
        "std:kv-storage": [
          "/std:kv-storage",
          "/node_modules/kv-storage-polyfill/"
        ]
      }
    });
  });
})
