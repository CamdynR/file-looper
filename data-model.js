import FileLoop from './lib/fil-loop.js';

// Create the FileLoop object - src required, dist optional, config optional
const loop = new FileLoop('src', 'dist', {});

// Add a plugin function
loop.addPlugin(file => {
  // Some code here
  // file properties:
  //   - fullPath
  //   - relativePath
  //   - fullFileName (w extension)
  //   - fileName (no extension)
  //   - extension
  //   - data (file contents as a string)
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
//   - numRuns (optional) how many loops to complete, 1 by default
//   - onlyDo (optional) only do the plugins that match these options
//      - id (optional) only run the plugins with this id
//      - categories (optional) only run the plugins with those categories
//      - directories (optional) only run the plugins with those directoriess
//      - extensions (optional) only run the plugins with those extensions
//      - regex (optional) only run the plugins with those regex
loop.run({
  numRuns: 1,
  onlyDo: [
    {
      id: '',
      categories: []
    }
  ],
  exclude: [
    {
      id: '',
      categories: []
    }
  ]
});