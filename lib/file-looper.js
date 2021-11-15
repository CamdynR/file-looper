// file-looper.js

import fs from 'fs-extra';
import path from 'path';
import { JSDOM } from 'jsdom';

export default class FileLooper {
  /**
   * Initializes the FileLooper object, creates the plugins array
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
   *                           numLoops: {number},
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
    const numLoops = options?.numLoops ? options?.numLoops : 1;
    for (let i = 0; i < numLoops; i++) {

      // If the user specified a dist directory & it exists, remove it
      if (this.dist != this.src && fs.existsSync(this.dist)) {
        fs.rmSync(this.dist, { recursive: true });
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
          loopNumber: {
            value: i + 1,
            writable: false
          },
          fullFilePath: {
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

        // If the file is HTML, add an HTMLDocument using JSDOM
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
          // Evaluate whether the plugin should be run
          const runPlugin = shouldPluginRun(file, plugin?.options, options);
          // Conditionally run the plugin
          if (runPlugin) plugin.function(file);
        });

        // Grab the data string to write to the file
        let dataToWrite = file.dataStr;
        // If the document property was used, use that string instead
        if (file.useDoc && file.document) {
          dataToWrite = file.document.documentElement.outerHTML;
        }

        // Rename the file if the user specified
        if (file?.renameFile) {
          // Grab the filePath without the filename + extension
          let newFilePath = filePath.split(this.delimiter);
          newFilePath.pop();
          newFilePath = newFilePath.join(this.delimiter);
          // Add the new fileName
          if (file.renameFile?.fileName) {
            newFilePath += this.delimiter + file.renameFile.fileName;
          } else {
            newFilePath += this.delimiter + file.fileName;
          }
          // Add the new file extension if specified
          if (file.renameFile?.extension) {
            if (!file.renameFile.extension.startsWith('.')) {
              newFilePath += '.';
            }
            newFilePath += file.renameFile.extension;
          } else {
            newFilePath += '.' + file.extension;
          }
          // Rename the file
          fs.renameSync(filePath, newFilePath);
          // Update filePath for writeFile() below
          filePath = newFilePath;
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

/**
 * Determines whether or not a plugin should run based on the plugin
 * and run options
 * @param {object} file The file object created on each loop
 * @param {object} pluginOptions The options given for the plugin upon creation
 * @param {object} runOptions The options given for the run() func upon call
 * @return {boolean} True if the plugin should run on this file, false if not
 */
function shouldPluginRun(file, pluginOptions, runOptions) {
  const pluginOptEvaled = evalPluginOptions(file, pluginOptions);
  const runOptEvaled = evalRunOptions(pluginOptions, runOptions);
  return pluginOptEvaled && runOptEvaled;
}

/**
 * Determines whether or not a plugin should run based on the plugin options
 * @param {object} file The file object created on each loop
 * @param {object} options The options given for the plugin upon creation
 * @return {boolean} True if the plugin should run on this file, false if not
 */
function evalPluginOptions(file, options) {
  if (!options) return true;

  let onlyDoEvaled = true;
  if (options?.onlyDo) {
    onlyDoEvaled = evalPluginOnlyDo(file, options.onlyDo);
  }

  let excludeEvaled = true;
  if (options?.exclude) {
    // Exclude is just the opposite of onlyDo, so invert onlyDo
    excludeEvaled = !evalPluginOnlyDo(file, options.exclude);
  }

  return onlyDoEvaled && excludeEvaled;
}

/**
 * Determines whether or not a plugin should run based on the plugin onlyDo opt
 * @param {object} file The file object created on each loop
 * @param {object} onlyDo The onlyDo opt given for the plugin upon creation
 * @return {boolean} True if the plugin should run on this file, false if not
 */
function evalPluginOnlyDo(file, onlyDo) {
  for (const [key, val] of Object.entries(onlyDo)) {
    for (let i = 0; i < val.length; i++) {
      if (typeof val[i] != 'string' && !(val[i] instanceof RegExp)) continue;
      switch (key) {
        case 'fullFilePaths':
          // Treat as string to match
          if (typeof val[i] == 'string') {
            if (val[i] == file.fullFilePath) return true;
            // Treat as RegEx to test()
          } else {
            if (val[i].test(file.fullFilePath)) return true;
          }
          break;
        case 'fullFileNames':
          if (typeof val[i] == 'string') {
            if (val[i] == file.fullFileName) return true;
          } else {
            if (val[i].test(file.fullFileName)) return true;
          }
          break;
        case 'fileNames':
          if (typeof val[i] == 'string') {
            if (val[i] == file.fileName) return true;
          } else {
            if (val[i].test(file.fileName)) return true;
          }
          break;
        case 'directories':
          // Grab the fileDirectory from the filepath by removing the last
          // /filename.css (or whatever the filename is) from the end
          // of the file path.
          let fileDirectory = file.fullFilePath.split(this.delimiter);
          fileDirectory.pop();
          fileDirectory = fileDirectory.join(this.delimeter);
          // Since the fileDirectory is the absolute file path, check to
          // make sure it ends with the passed in directory in case they use
          // relative (but also works with absolute)
          if (fileDirectory.endsWith(val[i])) return true;
          break;
        case 'extensions':
          if (typeof val[i] == 'string') {
            if (val[i] == file.extension) return true;
          } else {
            if (val[i].test(file.extension)) return true;
          }
      }
    }
  }
  return false;
}

/**
 * Determines whether or not a plugin should run based on the run() options
 * @param {object} pluginOptions The options given for the plugin upon creation
 * @param {object} runOptions The options given for the run() func upon call
 * @return {boolean} True if the plugin should run on this file, false if not
 */
function evalRunOptions(pluginOptions, runOptions) {
  if (!pluginOptions || !runOptions) return true;

  const pluginId = pluginOptions?.id;
  const pluginCategories = pluginOptions?.categories;
  const onlyDo = runOptions?.onlyDo;
  const onlyDoIds = runOptions?.onlyDo?.id;
  const onlyDoCategories = runOptions?.onlyDo?.categories;
  const exclude = runOptions?.exclude;
  const excludeIds = runOptions?.exclude?.id;
  const excludeCategories = runOptions?.exclude?.categories;

  // Evaluate onlyDo options from run() options
  let onlyDoEvaled = true;
  if (onlyDo) {
    // Evaluate onlyDo ID list from run() options
    let onlyDoIdMatched = false;
    if (onlyDoIds) {
      onlyDoIdMatched = onlyDoIds.includes(pluginId);
    }
    // Evaluate onlyDo category list from run() options
    let onlyDoCategoryMatched = false;
    if (onlyDoCategories) {
      onlyDoCategoryMatched = onlyDoCategories.some(category => {
        return pluginCategories.includes(category)
      });
    }
    onlyDoEvaled = onlyDoIdMatched || onlyDoCategoryMatched;
  }

  // Evalute exclude options from run() options
  let excludeEvaled = true;
  if (exclude) {
    // Evaluate excluded ID list from run() options
    let excludeIdMatched = false;
    if (excludeIds) {
      excludeIdMatched = !excludeIds.includes(pluginId);
    }
    // Evaluate excluded categories list from run() options
    let excludeCategoryMatched = false;
    if (excludeCategories) {
      excludeCategoryMatched = excludeCategories.some(category => {
        !pluginCategories.includes(category)
      });
    }
    excludeEvaled = excludeIdMatched || excludeCategoryMatched;
  }

  // Only pass if onlyDo and excluded let the plugin run
  return onlyDoEvaled && excludeEvaled;
}