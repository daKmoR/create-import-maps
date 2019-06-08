import glob from "glob";
import path from "path";
import fs from "fs";

export async function findPackageJsons(_globString, root = process.cwd()) {
  const globString = path.join(root, _globString);

  return new Promise(resolve => {
    const packageJsonPaths = [];
    glob(globString, {}, (er, files) => {
      files.forEach(wsPackagePath => {
        if (fs.lstatSync(wsPackagePath).isDirectory()) {
          const packageJsonPath = path.join(wsPackagePath, "package.json");
          if (fs.existsSync(packageJsonPath)) {
            packageJsonPaths.push(packageJsonPath);
          }
        }
      });
      resolve(packageJsonPaths);
    });
  });
}

export async function findWorkspaceProdutionDependenies(
  packageJson,
  root = process.cwd()
) {
  let deps = packageJson.dependencies ? packageJson.dependencies : {};
  if (packageJson.workspaces) {
    for (const globString of packageJson.workspaces) {
      const packageJsonPaths = await findPackageJsons(globString, root);
      packageJsonPaths.forEach(packageJsonPath => {
        const packageJsonString = fs.readFileSync(packageJsonPath, "utf-8");
        const wsPackageJson = JSON.parse(packageJsonString);
        deps = {
          ...deps,
          ...wsPackageJson.dependencies
        };
      });
    }
  }

  const finalDeps = {};
  Object.keys(deps).forEach(depName => {
    finalDeps[depName] = true;
  });

  return finalDeps;
}

/**
 *
 * @param {*} deps
 * @param {*} packageJson
 */
export async function findProductionDependencies(
  deps,
  packageJson,
  root = process.cwd()
) {
  // const prodDeps = packageJson.dependencies ? packageJson.dependencies : {};
  const prodDeps = await findWorkspaceProdutionDependenies(packageJson, root);

  let redo = false;
  do {
    let requestRedo = false;
    Object.keys(deps).forEach(key => {
      const depName = key.slice(0, key.lastIndexOf("@"));

      if (prodDeps[depName]) {
        const value = deps[key];
        if (value.dependencies) {
          Object.keys(value.dependencies).forEach(newDep => {
            if (!prodDeps[newDep]) {
              prodDeps[newDep] = value.dependencies[newDep];
              requestRedo = true;
            }
          });
        }
      }
    });

    redo = requestRedo ? true : false;
  } while (redo === true);

  // we now know all production dependencies - one more pass to gather them
  const result = {};
  Object.keys(deps).forEach(key => {
    const depName = key.slice(0, key.lastIndexOf("@"));
    if (prodDeps[depName]) {
      result[key] = deps[key];
    }
  });

  return result;
}
