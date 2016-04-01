ES6 Prototyping Boilerplate
=======================================================

> A client-side es6 boilerplate for rapid prototyping

## Available Commands

```
npm run [command]
```

- `transpile`: transpile all files from `es6` folder to `dist` folder
- `bundle`:
  * run `transpile` command
  * creates a browserified bundle _(entry point: `dist/main.js`)_
- `watch`:
  * creates a static file server
  * transpile files in `es6` folder on save
  * rebundle application on page load
- `serve`: run the static file server only _(kind of presentation mode)_

## Usage

Clone the repository and remove the `git` history

```sh
git clone --depth=1 https://github.com/Ircam-RnD/es6-prototyping-boilerplate.git dest_directory
cd dest_directory
rm -rf !$/.git  # remove git history
npm install
```

This boilerplate uses [https://babeljs.io/](https://babeljs.io/) and [http://browserify.org/](http://browserify.org/).

