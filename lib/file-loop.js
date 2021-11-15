// file-loop.js

import fs from 'fs-extra';
import path from 'path';
import { JSDOM } from 'jsdom';

export default class FileLoop {
  /**
   * Initializes the FileLoop object, creates the plugins array
   * @param {string} src The relative path of the src directory
   * @param {string} dist (optional) The relative path of the dist directory
   * @param {object} options (optional) Options object for user preferences
   *                         Current Options: none
   */
  constructor(src, dist, options) {
    this.src = src;
    this.dist = dist || src;
    this.options = options;
    this.plugins = [];
    this.delimiter = null;
  }

  /**
   * Stores the give plugin function and options for later use in run()
   * @param {function} plugin The function to run for the given plugin
   * @param {object} options The options categorizing & telling when to run.
   *                         Current Options: {
   *                           id: {string},
   *                           categories: {array of strings},
   *                           onlyDo: {
   *                             directories:  {array of strings},
   *                             extensions:  {array of strings},
   *                             regex:  {array of strings},
   *                           }
   *                           skip: {
   *                             directories:  {array of strings},
   *                             extensions:  {array of strings},
   *                             regex:  {array of strings},
   *                           }
   *                         }
   */
  addPlugin(plugin, options) {
    this.plugins.push({
      function: plugin,
      options: options
    });
  }

  /**
   * Executes the loop and begins the run cycle, following the options given
   * @param {object} options The options describing how the loop should run
   *                         Current Options: {
   *                           numRuns: {number},
   *                           onlyDo: [
   *                             {
   *                               id: {string},
   *                               categories:  {array of strings},
   *                               directories:  {array of strings},
   *                               extensions:  {array of strings},
   *                               regex:  {array of strings},
   *                             }
   *                             ... (n number of objects in this array)
   *                           ]
   *                         }
   */
  async run(options) {

    // Loop through the number of times specified in the options or just once
    const numRuns = options?.numRuns ? options?.numRuns : 1;
    for (let i = 0; i < numRuns; i++) {

      // If the user specified a dist directory & it exists, remove it
      if (this.dist != this.src && fs.existsSync(this.dist)) {
        fs.rmdirSync(this.dist, { recursive: true });
      }

      // If the user specified a dist directory, create it now
      if (this.dist != this.src) {
        fs.copySync(this.src, this.dist, { recursive: true });
      }

      // Recursively search subdirs in src to gather absolute filepaths
      const filePaths = await getFiles(this.dist);

      // Iterate over each absolute file path
      filePaths.forEach(filePath => {

        const file = {};

        // Get the split token for which one the directory structure uses
        if (!this.delimiter) {
          this.delimiter = '/';
          if (!filePath.includes('/')) this.delimiter = '\\';
        }

        // Grab the file name of the current file
        const fullFileName = filePath.split(this.delimiter).pop();
        let fileNameSplit = fullFileName.split('.');
        const extension = fileNameSplit.pop();
        const fileName = fileNameSplit.join('.');

        // TODO - Get relativePath
        // const relativePath = null;

        // Grab the data from the file
        const dataStr = fs.readFileSync(filePath);

        Object.defineProperties(file, {
          fullPath: {
            value: filePath,
            writable: false
          },
          // relativePath: {
          //   value: relativePath,
          //   writable: false
          // },
          fullFileName: {
            value: fullFileName,
            writable: false
          },
          fileName: {
            value: fileName,
            writable: false
          },
          extension: {
            value: extension,
            writable: false
          },
          dataStr: {
            value: dataStr,
            writable: true
          }
          // TODO - Rename file
        });

        // If the file is HTML, add an HTMLDocument
        if (extension.toLowerCase() == 'html') {
          const dom = new JSDOM(dataStr);
          // Define the document and useDoc properties in file
          Object.defineProperties(file, {
            document: {
              value: dom.window.document,
              writable: true
            },
            // useDoc is a boolean to determine whether to use the dataStr
            // or the document (true for document) when writing to file
            useDoc: {
              value: false,
              writable: true
            }
          });
        }

        // Call each plugin and pass in the file object
        this.plugins.forEach(plugin => {
          // TODO - filter each plugin and only execute 
          //        when specified in options
          plugin.function(file);
        });

        // Grab the data string to write to the file
        let dataToWrite = file.dataStr;
        // If the document property was used, use that string instead
        if (file.useDoc) {
          dataToWrite = file.document.documentElement.outerHTML;
        }
        // Write to the file
        fs.writeFileSync(filePath, dataToWrite);
      });
    }
  }
}

/**
 * Recursively collect the file paths of all of the files in a given dir
 * @param {string} dir The relative directory to search for files within
 * @returns {array} An array of absolute file paths for every file located
 *                  within the given dir
 */
async function getFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );
  return Array.prototype.concat(...files);
}