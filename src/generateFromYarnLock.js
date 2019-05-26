import * as lockfile from "@yarnpkg/lockfile";
import path from "path";
import { findProductionDependencies } from "./findProductionDependencies";
import { flattenYarnLock } from "./flattenYarnLock";

function yarnLockToImports(deps) {
  const targetPath = process.cwd();
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
  const { version: rootVersion } = require(`${depName}/package.json`);
  const targetPath = process.cwd();

  if (rootVersion !== version) {
    const parents = findAllParentDeps(depName, deps);
    for (let i = 0; i < parents.length; i += 1) {
      const parent = parents[i];
      const parentPath = require.resolve(parent);
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

  const result = path.relative(targetPath, require.resolve(depName));
  return `/${result}`;
}

export function resolvePathsAndConflicts(flatDeps, deps, mapResolves = {}) {
  const resolvedDeps = {};
  const targetPath = process.cwd();

  Object.keys(flatDeps).forEach(depName => {
    const depData = flatDeps[depName];
    if (Array.isArray(depData)) {
      if (Object.keys(mapResolves).includes(depName)) {
        resolvedDeps[depName] = findPathToVersion(
          depName,
          mapResolves[depName],
          deps
        );
      } else {
        console.log(`ASK for ${depName}`, Versions);
      }
    } else {
      const result = path.relative(targetPath, require.resolve(depName));
      resolvedDeps[depName] = result;
    }
  });
  return resolvedDeps;
}

export function generateFromYarnLock(yarnLockString, options) {
  const yarnLock = lockfile.parse(yarnLockString);

  const deps = findProductionDependencies(yarnLock.object, options);
  let flatDeps = flattenYarnLock(deps);
  flatDeps = resolvePathsAndConflicts(flatDeps, deps);
  const imports = yarnLockToImports(flatDeps);

  return { imports };
}
