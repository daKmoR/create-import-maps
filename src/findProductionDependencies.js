export function findProductionDependencies(deps, { dependencies }) {
  const prodDeps = dependencies;

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
