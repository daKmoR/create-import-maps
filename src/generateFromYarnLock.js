import * as lockfile from "@yarnpkg/lockfile";
import path from "path";
import prompts from "prompts";
import { findProductionDependencies } from "./findProductionDependencies";
import { flattenYarnLock } from "./flattenYarnLock";

function yarnLockToImports(deps, targetPath = process.cwd()) {
  const imports = {};
  Object.keys(deps).forEach(depName => {
    try {
      const result =
        "/" +
        path.relative(
          targetPath,
          require.resolve(depName, { paths: [targetPath] })
        );
      imports[depName] = result;
      imports[depName + "/"] = path.dirname(result) + "/";
    } catch {
      imports[depName] = undefined;
    }
  });
  return imports;
}

function findAllParentDeps(findFor, deps) {
  const parentDeps = [];
  Object.keys(deps).forEach(key => {
    const dep = deps[key];
    if (dep.dependencies && Object.keys(dep.dependencies).includes(findFor)) {
      const depName = key.slice(0, key.lastIndexOf("@"));
      parentDeps.push(depName);
    }
  });
  return parentDeps;
}

function findPathToVersion(depName, version, deps) {
  const targetPath = process.cwd();
  const rootVersionPath = require.resolve(depName + "/package.json", {
    paths: [targetPath]
  });
  const { version: rootVersion } = require(rootVersionPath);

  if (rootVersion !== version) {
    const parents = findAllParentDeps(depName, deps);

    for (let i = 0; i < parents.length; i += 1) {
      const parent = parents[i];
      const parentPath = require.resolve(parent, {
        paths: [targetPath]
      });
      const subVersionPath = require.resolve(depName + "/package.json", {
        paths: [parentPath]
      });
      const { version: subVersion } = require(subVersionPath);
      if (subVersion === version) {
        const result = path.relative(
          targetPath,
          require.resolve(depName, { paths: [parentPath] })
        );
        return `/${result}`;
      }
    }
  }

  const result = path.relative(
    targetPath,
    require.resolve(depName, {
      paths: [targetPath]
    })
  );
  return `/${result}`;
}

async function askForVersionSelection(depName, versions) {
  const choices = [];
  versions.forEach(version => {
    choices.push({
      title: version,
      value: version
    });
  });

  const answers = await prompts([
    {
      type: "select",
      name: "selectedVersion",
      message: `Could not find compatible versions for ${depName}. Which one to choose?`,
      choices
    }
  ]);
  return answers.selectedVersion;
}

export async function resolvePathsAndConflicts(
  flatDeps,
  deps,
  resolveMap = {},
  targetPath = process.cwd()
) {
  const resolvedDeps = {};

  for (const depName of Object.keys(flatDeps)) {
    const depData = flatDeps[depName];
    if (Array.isArray(depData)) {
      const selectedVersion = Object.keys(resolveMap).includes(depName)
        ? resolveMap[depName]
        : await askForVersionSelection(depName, depData);
      resolvedDeps[depName] = findPathToVersion(depName, selectedVersion, deps);
    } else {
      const depPath = require.resolve(depName, {
        paths: [targetPath]
      });

      const result = path.relative(targetPath, depPath);
      resolvedDeps[depName] = result;
    }
  }
  return resolvedDeps;
}

export async function generateFromYarnLock(
  yarnLockString,
  packageJson,
  targetPath = process.cwd()
) {
  const yarnLock = lockfile.parse(yarnLockString);

  const deps = await findProductionDependencies(
    yarnLock.object,
    packageJson,
    targetPath
  );
  let flatDeps = flattenYarnLock(deps);
  const importMapResolutions = packageJson.importMapResolutions
    ? packageJson.importMapResolutions
    : {};
  flatDeps = await resolvePathsAndConflicts(
    flatDeps,
    deps,
    importMapResolutions,
    targetPath
  );
  const imports = yarnLockToImports(flatDeps, targetPath);
  return { imports };
}
