const path = require('path');
const rollup = require('rollup');
const { expect } = require('chai');
const importMapResolvePlugin = require('../src/rollup-plugin-import-map-resolve');

describe('rollup-plugin-import-map-resolve', () => {
  it('works for a simple project', async () => {
    const importMap = {
      imports: {
        "lit-element": "/node_modules/lit-element/lit-element.js",
        "lit-element/": "/node_modules/lit-element/",
        "lit-html": "/node_modules/lit-html/lit-html.js",
        "lit-html/": "/node_modules/lit-html/",
        "@example/a": "/packages/a/a.js",
        "@example/a/": "/packages/a/",
        b: "/packages/b/b.js",
        "b/": "/packages/b/"
      },
    };

    const inputOptions = {
      input: path.join(__dirname, 'assets/exampleNested/app.js'),
      plugins: [
        importMapResolvePlugin(importMap, { rootDir: path.join(__dirname, 'assets/exampleNested') })
      ]
    };

    const bundle = await rollup.rollup(inputOptions);
    const expectedModules = [
      'node_modules/lit-html/lib/template-result.js',
      'node_modules/lit-html/lit-html.js',
      'node_modules/lit-html/lib/shady-render.js',
      'node_modules/lit-element/lib/updating-element.js',
      'node_modules/lit-element/lit-element.js',
      'app.js',
    ].map(id => path.join(__dirname, 'assets/exampleNested/', id));
    const modules = bundle.cache.modules.map(m => m.id);
    expect(modules).to.deep.equal(expectedModules);
  });
});