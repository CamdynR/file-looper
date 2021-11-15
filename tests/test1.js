// test1.js

import FileLoop from '../lib/file-loop.js';

const fl = new FileLoop('src', 'dist');

fl.addPlugin(file => {
  console.log(file.runNumber);
  file.renameFile = {
    fileName: file.fileName,
    extension: `min.${file.extension}`
  }
}, {
  id: 'demoPlugin',
  categories: ['demo', 'plugin'],
  onlyDo: {
    extensions: ['html']
  }
});

fl.run({
  onlyDo: {
    categories: ['demo']
  }
});