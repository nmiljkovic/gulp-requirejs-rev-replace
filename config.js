function Config(config) {
    this._config = config;
}

Config.prototype.findModuleByName = function (moduleName) {
    var regex = new RegExp('(^|\\/)' + moduleName + '($|\\/)');
    var paths = this._config.paths;

    for (var module in paths) {
        if (!paths.hasOwnProperty(module)) {
            continue;
        }

        if (regex.test(module)) {
            return {
                module: module,
                path: paths[module]
            };
        }
    }

    return null;
};

Config.prototype.findModuleByPath = function (modulePath) {
    var regex = new RegExp('(^|\\/)' + modulePath + '($|\\/)');
    var paths = this._config.paths;

    for (var module in paths) {
        if (!paths.hasOwnProperty(module)) {
            continue;
        }

        var path = paths[module];
        if (regex.test(path)) {
            return {
                module: module,
                path: path
            };
        }
    }

    return null;
};

Config.prototype.replaceModule = function (moduleName, modulePath) {
    this._config.paths[moduleName] = modulePath;
};

module.exports = Config;
