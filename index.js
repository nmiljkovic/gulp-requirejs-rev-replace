var PluginError = require('gulp-util').PluginError;
var transformConfig = require('gulp-requirejs-transformconfig');
var through = require('through2');
var combine = require('stream-combiner');
var isUndefined = require('lodash.isundefined');
var escapeStringRegexp = require('escape-string-regexp');
var path = require('path');
var Config = require('./config');

var sourcemapRegex = /\.map$/;

function createErrorPassthrough(error) {
    var err = createError(error);
    return through.obj(function (file, encoding, cb) {
        cb(err, file);
    });
}

function createError(error) {
    return new PluginError('gulp-requirejs-rev-replace', error);
}

module.exports = function (options) {
    options = Object.assign({
        stripExtensions: ['.js'],
        insertNewModule: function (config, moduleName, modulePath) {
            config.replaceModule(moduleName, modulePath);
        }
    }, options);

    /**
     * The array is shared between the two processors,
     * because transformConfig does not support async computation.
     *
     * @type {Array}
     */
    var replacements = [];

    return combine(
        collectManifest(options, replacements),
        replacePaths(options, replacements)
    );
};

/**
 * Reads the provided manifest and populates the replacements array.
 *
 * @param {Object} options
 * @param {Stream} options.manifest
 * @param {Array} replacements
 * @return {*}
 */
function collectManifest(options, replacements) {
    if (isUndefined(options.manifest)) {
        return createErrorPassthrough('Must provide a manifest stream.');
    }

    var ended = false, queued = [];
    options.manifest.on('data', function (file) {
        var manifest = JSON.parse(file.contents.toString());
        Object.keys(manifest).forEach(function (original) {
            replacements.push({
                original: original,
                revisioned: manifest[original]
            });
        });
    });

    options.manifest.on('end', function () {
        ended = true;
        queued.forEach(function (cb) {
            cb();
        });
    });

    return through.obj(function alias(file, encoding, cb) {
        if (ended) {
            return end();
        }

        queued.push(end);

        function end() {
            cb(null, file);
        }
    });
}

/**
 * Replaces the require config paths with entries from replacements or inserts new module aliases.
 *
 * @param {Object} options
 * @param {Array} options.stripExtensions
 * @param {Function} options.insertNewModule
 * @param {Array} replacements
 */
function replacePaths(options, replacements) {
    return transformConfig(function (config) {
        var configWrapper = new Config(config);

        replacements = replacements.filter(function (replacement) {
            return !replacement.original.match(sourcemapRegex);
        });

        if (isUndefined(config.paths)) {
            config.paths = {};
        }

        replacements.forEach(function (replacement) {
            if (sourcemapRegex.test(replacement.original)) {
                // ignore sourcemaps
                return;
            }

            var origModulePath = stripExtensions(replacement.original, options.stripExtensions),
                newModulePath = stripExtensions(replacement.revisioned, options.stripExtensions);

            var existingModule = configWrapper.findModuleByPath(origModulePath);

            if (existingModule !== null) {
                var newPath = existingModule.path.replace(origModulePath, newModulePath);
                configWrapper.replaceModule(existingModule.module, newPath);
                return;
            }

            options.insertNewModule(configWrapper, origModulePath, newModulePath);
        });

        return config;
    });
}

function stripExtensions(filename, extensions) {
    var parsed = path.parse(filename);

    if (extensions.indexOf(parsed.ext) === -1) {
        return filename;
    }

    var extensionRegex = new RegExp(escapeStringRegexp(parsed.ext) + '$');
    return filename.replace(extensionRegex, '');
}
