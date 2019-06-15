const path = require('path');

module.exports = function importMapResolvePlugin(importMap, { rootDir = process.cwd() } = {}) {
  const { imports } = importMap;
  const keys = Object.keys(imports);

  return {
    resolveId(id) {
      // simple 1on1 mapping ("lit-html": "/node_modules/lit-html/lit-html.js")
      if (keys.includes(id)) {
        return path.join(rootDir, imports[id]);
      }

      // partial mapping ("lit-html/": "/node_modules/lit-html/")
      const partialKey = keys.find(k => k.endsWith('/') && id.startsWith(k));
      if (partialKey) {
        const withoutPrefix = id.replace(partialKey, '');
        const returnValue = path.join(rootDir, imports[partialKey], withoutPrefix);
        return returnValue;
      }

      return null;
    }
  }
}