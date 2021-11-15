const { FileLooper } = require('../lib/file-looper.cjs');

const looper = new FileLooper('src', 'dist');

looper.addPlugin(file => {
  console.log(file.loopNumber);
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

looper.run({
  onlyDo: {
    categories: ['demo']
  }
});