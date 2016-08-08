# gulp-requirejs-rev-replace

A gulp plugin to replace requirejs modules based on revision manifest.

## Installation

Install package with NPM and add it to your development dependencies:

`npm install gulp-requirejs-rev-replace --save-dev`

## Usage

You can generate your manifest with `gulp-rev`. When generating your requirejs config, use the manifest option and pass in the stream to your manifest(s).

```js
gulp.src('path/to/config.js')
    .pipe(configRevReplace({
        manifest: gulp.src('path/to/manifest.json')
    }))
    .pipe(gulp.dest('dist/config.js'));
```

Given an example manifest:

```json
{
  "vendor/raphael/raphael.button.js": "vendor/raphael/raphael-8e8859afcd.button.js",
  "vendor/raphael/raphael.curve.js": "vendor/raphael/raphael-0c24a27b6f.curve.js"
}
```

With the original require config:

```js
require.config({
    'rabix-raphael.button': 'path/to/vendor/raphael/raphael.button',
    'rabix-raphael.curve': 'path/to/vendor/raphael/raphael.curve',
});
```

It will generate the following config:

```js
require.config({
    'rabix-raphael.button': 'path/to/vendor/raphael/raphael-8e8859afcd.button',
    'rabix-raphael.curve': 'path/to/vendor/raphael/raphael-0c24a27b6f.curve',
});
```
