import FileLooper from './lib/fil-looper.js';

// Create the FileLoop object - src required, dist optional, config optional
const looper = new FileLooper('src', 'dist', {});

// Add a plugin function
looper.addPlugin(file => {
  // Some code here
  // file properties:
  //   Readonly:
  //   - runNumber (runs start at 1)
  //   - fullPath (absolute path of file)
  //   - relativePath (relative path of file)
  //   - fullFileName (w extension)
  //   - fileName (no extension)
  //   - extension
  //   Mutable:
  //   - dataStr (file contents as a string)
  //   - document (JSDOM object, HTML only)
  //   - useDoc
  //   - renameFile (rename the file)
  //     - fileName (without extension)
  //     - extension (optional)
}, {
  id: '',
  categories: [],
  onlyDo: {
    fullFilePaths: [],
    fullFileNames: [],
    fileNames: [],
    directories: [],
    extensions: []
  },
  exclude: {
    fullFilePath: [],
    fullFileNames: [],
    fileNames: [],
    directories: [],
    extensions: []
  }
});

// Run the loop, config optional
//   - numLoops (optional) how many loops to complete, 1 by default
//   - onlyDo (optional) only do the plugins that match these options
//      - id (optional) only run the plugins with this id
//      - categories (optional) only run the plugins with those categories
//   - exclude (optional) only do the 
looper.run({
  numLoops: 1,
  onlyDo: {
    id: [],
    categories: []
  },
  exclude: {
    id: [],
    categories: []
  }
});