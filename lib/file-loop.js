// file-loop.js

import fs from 'fs-extra';

export class FileLoop {
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
    this.splitToken = null;
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
    const numRuns = options.numRuns || 1;
    for (let i = 0; i < numRuns; i++) {

      // If the user specified a dist directory & it exists, remove it
      if (this.dist != this.src && fs.existsSync(this.dist)) {
        fs.rmdirSync(this.dist, { recursive: true });
      }

      // Recursively search subdirs in src to gather absolute filepaths
      const filePaths = getFiles(this.src);

      // Iterate over each absolute file path
      filePaths.forEach(filePath => {

        // Get the split token for which one the directory structure uses
        if (!this.splitToken) {
          this.splitToken = '/';
          if (!filePath.includes('/')) this.splitToken = '\\';
        }

        // Grab the file name of the current file
        const fullFileName = filePath.split(this.splitToken).pop();
        let fileNameSplit = fullFileName.split('.');
        const extension = fileNameSplit.pop();
        const fileName = fileNameSplit.join('.');

        // TODO - Get relativePath
        const relativePath = null
        
        // Grab the data from the file
        const data = fs.readFileSync(filePath);

        // File Data object to pass into each function
        const file = {
          fullPath: filePath,
          relativePath: relativePath,
          fullFileName: fullFileName,
          fileName: fileName,
          extension: extension,
          data: data
        };

        // Call each plugin and pass in the file object
        this.plugins.forEach(plugin => {
          // TODO - filter each plugin and only execute 
          //        when specified in options
          plugin(file);
        });
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
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );
  return Array.prototype.concat(...files);
}