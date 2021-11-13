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
    this.dist = dist;
    this.options = options;
    this.plugins = [];
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
  run(options) {
    
  }
}