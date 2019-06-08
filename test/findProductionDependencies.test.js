import chai from "chai";
import {
  findProductionDependencies,
  findWorkspaceProdutionDependenies,
  findPackageJsons
} from "../src/findProductionDependencies.js";

const { expect } = chai;

describe("findProductionDependencies", () => {
  it("returns only production dependencies", async () => {
    const packageJson = {
      dependencies: {
        "test-wc-card": "^0.0.3"
      }
    };

    const graph = {
      "lit-element@^2.0.1": {
        version: "2.1.0",
        dependencies: {
          "lit-html": "^1.0.0"
        }
      },
      "lit-html@1.0.0": {
        version: "1.0.0"
      },
      "test-wc-card@^0.0.3": {
        version: "0.0.3",
        dependencies: {
          "lit-element": "^2.0.1"
        }
      },
      "type-detect@^4.0.0": {
        version: "4.0.8"
      }
    };

    const deps = await findProductionDependencies(graph, {
      dependencies: packageJson.dependencies
    });

    expect(deps).to.deep.equal({
      "lit-element@^2.0.1": {
        version: "2.1.0",
        dependencies: {
          "lit-html": "^1.0.0"
        }
      },
      "lit-html@1.0.0": {
        version: "1.0.0"
      },
      "test-wc-card@^0.0.3": {
        version: "0.0.3",
        dependencies: {
          "lit-element": "^2.0.1"
        }
      }
    });
  });
});

describe("findWorkspaceProdutionDependenies", () => {
  it("returns an object with all production dependencies", async () => {
    const packageJson = {
      dependencies: {
        "test-wc-card": "^0.0.3"
      },
      workspaces: ["./assets/exampleWorkspace/*"]
    };
    const wsDeps = await findWorkspaceProdutionDependenies(
      packageJson,
      __dirname
    );
    expect(wsDeps).to.deep.equal({
      "test-wc-card": true,
      "lit-html": true,
      "lit-element": true
    });
  });
});

describe("findPackageJsons", () => {
  it("returns a list of pathes to package.jsons", async () => {
    const packageJson = {
      workspaces: ["./assets/exampleWorkspace/*"]
    };
    const wsDeps = await findPackageJsons(packageJson.workspaces[0], __dirname);
    expect(wsDeps).to.deep.equal([
      `${__dirname}/assets/exampleWorkspace/a/package.json`,
      `${__dirname}/assets/exampleWorkspace/b/package.json`
    ]);
  });
});
