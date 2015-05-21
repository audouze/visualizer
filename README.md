ES6 Prototyping Boilerplate
=======================================================

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

## Use / Requirements

Clone the repository and remove the `git` history

```sh
git clone --depth=1 https://github.com/Ircam-RnD/es6-prototyping-boilerplate.git destination_folder
rm -rf !$/.git
npm install
```

- [http://stackoverflow.com/questions/11497457/git-clone-without-git-directory](http://stackoverflow.com/questions/11497457/git-clone-without-git-directory)

The boilerplate uses `babel` and `browserify` in order to transpile from es6 / CommonJS syntax to browser compliant es5.

**These packages should be installed globally and linked into your project**

```sh
sudo npm link babel
sudo npm link browserify
# and...
npm run watch
```

For more information, see:
- [https://babeljs.io/](https://babeljs.io/)
- [http://browserify.org/](http://browserify.org/)

## System Install / Update

install node from [https://nodejs.org/download/](https://nodejs.org/download/)

```sh
sudo npm install -g n
n stable
sudo npm install -g npm-workspace
sudo npm install -g browserify
sudo npm install -g babel
```

- [https://babeljs.io/docs/usage/runtime/](https://babeljs.io/docs/usage/runtime/)
- [https://www.npmjs.com/package/npm-workspace](https://www.npmjs.com/package/npm-workspace)

## TODOS

- install `sass` ?
