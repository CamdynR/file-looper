FileLooper
=================

`FileLooper` is a simple lightweight task runner. Easily add Plugins (tasks) to run on select files to modify the file contents or name.


Why?
----

I found the runners I was using had a lot of overhead and features I never touched, so I wanted something small with just what I needed. Made this for myself, thought I should share it.

General Overview
----------------

When the `FileLooper` is run it will start by deleting the old `dist` directory (if one is specified). It will then create a new `dist` directory, recursively copying the `src` directory to do so. 

Afterwards it will gather a list of every file inside of the new `dist` directory, look at the list of plugins you have added to your looper, and apply the plugins to each file that meet the conditions you set.

Adding a plugin is as simple as inputting a function into the `.addPlugin()` method of your `FileLooper`. A `file` interface is provided for you in your plugins to easily interact with each file.


Installation
------------

    npm install file-looper



Getting Started
-----

Both `import` and `require()` are supported, so you can use either syntax:

`Import:`

```js
import FileLooper from 'file-looper';
```

`Require():`

```js
const { FileLooper } = require('file-looper');
```

Once you've imported / required it, `FileLooper` is a class, so to create a new one you simply

```js
const looper = new FileLooper('src', 'dist');
```

The `constructor` currently takes two parameters, as shown above:
- `src` directory (of type `string`, relative to your project)
- `dist` directory (_optional_ - of type `string`, relative to your project)
  - If no `dist` is specified then `src` is modified directly

`FileLooper` has two methods: `addPlugin` and `run`

Adding a Plugin (`.addPlugin()`)
-------------

To add a plugin to your `FileLooper`, you use the `addPlugin` method. This method takes two parameters: `plugin <function>` and `options <object> (optional)`. Here's a simple demo:

```js
import FileLooper from 'file-looper';

const looper = new FileLooper('src', 'dist');

// Pass in the file parameter to interact with the current file in the loop
looper.addPlugin(file => {
  minifyHTML(file.dataStr);
  file.renameFile = {
    extension: '.min.html'
  };
}, {
  // You can reference this ID in .run() if you want to only run this Plugin
  id: 'html-minifier',
  // You can reference these categories later if, for example, you only want
  // to run Plugins with one (or more) of these categories
  categories: ['minify','html'],
   // only applies this plugin to .html files
  onlyDo: {
    extensions: ['html']
  }
});
```

As you add in your Plugins, they will all be run in the order you added them (since they are just pushed to an array, you can view this array at `.plugins` in your `FileLooper`. 

Here are all of the options and configurations available to you in the `addPlugin` method

  - `plugin <function>` This is the function that will be executed when this plugin is run. Here you can modify the contents of the given file, rename it, log anything to the console, whatever you would like to do. This function has one parameter:
    - `file <object>` Your interface for interacting with the current file in the loop. It has the following properties for you to use:
      - ReadOnly:
        - `loopNumber <number>` By default the `run()` method only does one loop, but if you specify multiple loops this will keep track of what number loop you are on. It starts incrementing at `1`.
        - `fullPath <string>` The absolute path of the current file
        - `relativePath <string>` (not implemented yet) The path of the current file relative to your project
        - `fullFileName <string>` The file name (_with the file extension_) of the current file
        - `fileName <string>` The file name (_without the file extension_) of the current file
        - `extension <string>` The file extension of the current file
      - Writeable:
        - `dataStr <string>` (optional) The contents, as a string, of the current file. The final result of your manipulation of this `string` will be written to the given file. By default this will be used for `HTML` files unless specified with the `useDoc` attribute.
        - `document <JSDOM document>` (optional) Only available if the current file is an `HTML` file. This is a `JSDOM` representation of the current file. The contents of the file was input into a `JSDOM` Object, and then the `dom.window.document` of that object was returned to you here. This provides an interface to more easily query elements and manipulate them.
        - `useDoc <boolean>` (optional) Set this variable to `true` if you would like `FileLooper` to ignore the `dataStr` property and use the `document` property (only applicable for `HTML` files). This is WriteOnly as it contains no data by default.
        - `renameFile <object>` (optional) An interface provided for renaming the current file. This is WriteOnly as it contains no data by default.
          - `fileName <string>` (optional) The name you would like to rename the current file to (**do not include extension**). If not specified, the same filename will be kept.
          - `extension <string>` (optional) The new extension you would like to give to the current file. You can add the `.` before hand or not, your choice.
  - `options <object>` (optional) This allows you to add an `id` and / or `categories` to your Plugin so you can select which Plugins you'd like to run in the `run()` method. This also lets you specify on which `files` & `directories` this plugin should be applied to. The allowed properties (all of which are optional):
    - `id <string>` (optional) A unique ID for your plugin, used by `run()` to filter which Plugins you'd like to run
    - `categories <array of strings>` (optional) Similar to `id`, allows you to filter which Plugins you'd like to run by giving this Plugin categories (e.g. you add the string `minify` to this array of categories, and then in `run()` you specify to `onlyDo` the Plugins with the `minify` category)
    - `onlyDo <object>` (optional) Allows you to only run this Plugin on the files that meet the criteria in this Object
      - `fullFilePaths <array of strings or RegExp>` (optional) The absolute path of any file(s) you would like to apply this plugin to
      - `fullFileNames <array of strings or RegExp>` (optional) The file name(s) (including the file extension) of any file you would like to apply this plugin to
      - `fileNames <array of strings or RegExp>` (optional) The file name(s) (excluding the file extension) of any file you would like to apply this plugin to
      - `directories <array of strings or RegExp>` (optional) The directory / directories of files you would like to apply this plugin to
      - `extensions <array of strings or RegExp>` (optional) The file extension of the file(s) you would like to apply this plugin to
    - `exclude <object>` (optional) The opposite of `onlyDo`, any file that meets the criteria in this object will not have this Plugin applied to it
      - `fullFilePaths <array of strings or RegExp>` (optional) The absolute path of any file(s) you would like to **NOT** apply this plugin to
      - `fullFileNames <array of strings or RegExp>` (optional) The file name(s) (including the file extension) of any file you would like to **NOT** apply this plugin to
      - `fileNames <array of strings or RegExp>` (optional) The file name(s) (excluding the file extension) of any file you would like to **NOT** apply this plugin to
      - `directories <array of strings or RegExp>` (optional) The directory / directories of files you would like to **NOT** apply this plugin to
      - `extensions <array of strings or RegExp>` (optional) The file extension of the file(s) you would like to **NOT** apply this plugin to


Running the `FileLoop` (`.run()`)
-------

Once you have added all of your Plugins to your `FileLooper`, you use the `run` method to execute run the `FileLooper` as you might expect. The `run()` method does not return any data, but it is `asynchronous` so make sure to watch out for that when calling it.

The `run` method takes one (optional) parameter: `options <object>`. Here is simple demo:

```js
import FileLooper from 'file-looper';

const looper = new FileLooper('src', 'dist');

looper.addPlugin(file => {
  minifyHTMLPlugin(file);
}, {
  id: 'html-minifier',
  categories: ['minify','html'],
  onlyDo: {
    extensions: ['html']
  }
});

looper.addPlugin(file => {
  minifyCSSPlugin(file);
}, {
  id: 'css-minifier',
  categories: ['minify','css'],
  onlyDo: {
    extensions: ['css']
  }
});

// This will run all Plugins with the 'minify' category,
// but will exclude the Plugin that has the id 'css-minifier'
looper.run({
  onlyDo: {
    categories: ['minify']
  }
  exclude: {
    id: ['css-minifier']
  }
}).then(() => {
  console.log('FileLooper has finished running!');
});
```

Here are all of the options and configurations available to you in the `run` method (all of which are optional)

  - `numLoops <number>` (optional) The number of loops you would like to execute. Useful if you have Plugins that need other Plugins to apply to every file before hand. Defaults to 1 if not specified.
  - `onlyDo <object>` (optional) Allows you to only run the Plugins that meet the criteria in this Object
    - `id <array of strings>` (optional) Only the Plugins that have IDs contained in this array will be run
    - `categories <array of strings>` (optional) Only the Plugins that have categories contained in this array will be run. Only one category needs to match for the Plugin to run.
  - `exclude <object>` (optional) Allows you to exclude any Plugin from running so long as it meets the criteria of this object (the opposite of `onlyDo`)
    - `id <array of strings>` (optional) The Plugins that have IDs contained in this array will be **NOT** be run
    - `categories <array of strings>` (optional) The Plugins that have categories contained in this array will **NOT** be run. Only one category needs to match for the Plugin to **NOT** run.

_Quick Note_: For both `run` and `addPlugin` options, if both `onlyDo` and `exclude` are specified then only the Plugins that match **both** creteria will be run.


License
-------

Licensed under ISC