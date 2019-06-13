import chai from "chai";
import fs from "fs";
import sinon from "sinon";
import { indexHtml, indexHtmlWithImportMap } from './assets/exampleInjectToHtmlFile/utils';
import injectToHtmlFile from "../src/injectToHtmlFile";

const { expect } = chai;
const importMap = JSON.stringify({"imports": { "foo": "bar"}});
const indexHtmlPath = `${__dirname}/assets/exampleInjectToHtmlFile/index.html`;
const indexHtmlWithImportMapPath = `${__dirname}/assets/exampleInjectToHtmlFile/indexWithImportMap.html`;

describe("injectToHtmlFile", () => {
  afterEach(() => {
    fs.writeFileSync(`${__dirname}/assets/exampleInjectToHtmlFile/index.html`, indexHtml, 'utf-8');
    fs.writeFileSync(`${__dirname}/assets/exampleInjectToHtmlFile/indexWithImportMap.html`, indexHtmlWithImportMap, 'utf-8');
  });

  it("injects an importmap in a html file", () => {
    injectToHtmlFile('/test/assets/exampleInjectToHtmlFile/index.html', importMap);
    const result = fs.readFileSync(indexHtmlPath).toString();
    const importMapFromHtml = result.match(/<script type="importmap">(.|\n)*?<\/script>/)[0];
    expect(importMapFromHtml).to.equal(`<script type="importmap">${importMap}</script>`);
  });

  it("replaces an importmap if one already exists", () => {
    injectToHtmlFile('/test/assets/exampleInjectToHtmlFile/indexWithImportMap.html', importMap);
    const result = fs.readFileSync(indexHtmlWithImportMapPath).toString();
    const importMapFromHtml = result.match(/<script type="importmap">(.|\n)*?<\/script>/)[0];
    expect(importMapFromHtml).to.equal(`<script type="importmap">${importMap}</script>`);
  });

  it("logs a message if an incorrect file is input", () => {
    const consoleLogSpy = sinon.spy(console, 'log');
    injectToHtmlFile('/test/assets/exampleInjectToHtmlFile/incorrectFile.js', importMap);
    expect(consoleLogSpy.calledWith("Please enter a valid .html file.")).to.equal(true);
    consoleLogSpy.restore();
  });
});
