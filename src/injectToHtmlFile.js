import fs from 'fs';
import path from 'path';

/**
 * Injects the importmap to the bottom of the body of a html file if specified.
 * @param {String} fileName
 * @param {String} importMap
 */
export default function injectToHtmlFile(fileName, importMap) {
  if(!fileName.endsWith('.html')) {
    console.log('Please enter a valid .html file.');
  } else {
    let htmlFile = fs.readFileSync(path.join(process.cwd(), path.sep, fileName), 'utf-8');

    if(htmlFile.includes('<script type="importmap">')) {
      htmlFile = htmlFile.replace(/<script type="importmap">(.|\n)*?<\/script>/, `<script type="importmap">${importMap}</script>`);
    } else {
      htmlFile = htmlFile.replace('</head>', `<script type="importmap">${importMap}</script></head>`);
    }

    fs.writeFileSync(path.join(process.cwd(), path.sep, fileName), htmlFile, 'utf-8');
  }
}
