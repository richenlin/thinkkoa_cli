#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var program = require('commander');

var cwd = process.cwd();
var templatePath = __dirname + '/template';
var projectRootPath = './'; //project root path
var APP_PATH = cwd + '/' + projectRootPath + '/src';

/**
 * get date time
 * @return {} []
 */
var getDateTime = function () {
    var fn = function (d) {
        return ('0' + d).slice(-2);
    };
    var d = new Date();
    var date = d.getFullYear() + '-' + fn(d.getMonth() + 1) + '-' + fn(d.getDate());
    var time = fn(d.getHours()) + ':' + fn(d.getMinutes()) + ':' + fn(d.getSeconds());
    return date + ' ' + time;
};

var isFile = function (p) {
    if (!fs.existsSync(p)) {
        return false;
    }
    var stats = fs.statSync(p);
    return stats.isFile();
};

var isBoolean = function (obj) {
    return toString.call(obj) === '[object Boolean]';
};

var isDir = function (p) {
    if (!fs.existsSync(p)) {
        return false;
    }
    var stats = fs.statSync(p);
    return stats.isDirectory();
};

var chmod = function (p, mode) {
    mode = mode || '0777';
    if (!fs.existsSync(p)) {
        return true;
    }
    return fs.chmodSync(p, mode);
};

/**
 * mkdir
 * @param  {String} dir []
 * @return {}     []
 */
var mkdir = function (p, mode) {
    mode = mode || '0777';
    if (fs.existsSync(p)) {
        chmod(p, mode);
        return true;
    }
    var pp = path.dirname(p);
    if (fs.existsSync(pp)) {
        fs.mkdirSync(p, mode);
    } else {
        mkdir(pp, mode);
        mkdir(p, mode);
    }
    return true;
};

/**
 * get version
 * @return {String} []
 */
var getVersion = function () {
    var filepath = path.resolve(__dirname, '../package.json');
    var version = JSON.parse(fs.readFileSync(filepath)).version;
    return version;
};

/**
 * get app root path
 * @return {} []
 */
var getProjectAppPath = function () {
    var path = projectRootPath;
    path += 'src';
    return path;
};

/**
 * get app name
 * @return {} []
 */
var getAppName = function () {
    var filepath = path.normalize(cwd + '/' + projectRootPath).replace(/\\/g, '');
    var matched = filepath.match(/([^\/]+)\/?$/);
    return matched[1];
};

/**
 * copy file
 * @param  {String} source []
 * @param  {String} target []
 * @return {}        []
 */
var copyFile = function (source, target, replace, showWarning) {

    if (showWarning === undefined) {
        showWarning = true;
    }

    if (isBoolean(replace)) {
        showWarning = replace;
        replace = '';
    }

    //if target file is exist, ignore it
    if (isFile(target)) {
        if (showWarning) {
            console.log('exist' + ' : ' + path.normalize(target));
        }
        return;
    }

    mkdir(path.dirname(target));

    //if source file is not exist
    if (!isFile(templatePath + path.sep + source)) {
        return;
    }

    var content = fs.readFileSync(templatePath + path.sep + source, 'utf8');
    //replace content
    if (replace) {
        for (var key in replace) {
            while (true) {
                var content1 = content.replace(key, replace[key]);
                if (content1 === content) {
                    content = content1;
                    break;
                }
                content = content1;
            }
        }
    }

    fs.writeFileSync(target, content);
    console.log('create' + ' : ' + path.normalize(target));
};

/**
 * load files
 * @param ext
 * @param callback
 * @param g
 */
var loadFiles = function (ext, callback, g) {
    g = g || '';
    var tempDir = [], subDir = [], tempType = '', tempName = '', tempFile = '';
    for (var type in ext) {
        (function (t) {
            ext[t] = ext[t] || [];
            ext[t].forEach(v => {
                if (isDir(v)) {
                    try {
                        tempDir = fs.readdirSync(v);
                    } catch (e) {
                        tempDir = [];
                    }
                    tempDir.forEach(f => {
                        tempFile = v + f;
                        if (isFile(tempFile) && (tempFile).indexOf('.js') === (tempFile.length - 3)) {
                            tempName = path.basename(f, '.js');
                            tempType = g === '' ? tempName : `${g}/${tempName}`;
                            callback(tempType, v + f, type);
                        }
                    });
                }
            });
        })(type);
    }
    tempDir = subDir = tempType = tempName = tempFile = null;
};

/**
 * check is think app
 * @param  {String}  projectRootPath []
 * @return {Boolean}             []
 */
var isThinkApp = function (projectRootPath) {
    if (isDir(projectRootPath)) {
        var filepath = projectRootPath + '.thinksrc';
        if (isFile(filepath)) {
            return true;
        }
    }
    return false;
};

/**
 * check env
 * @return {} []
 */
var _checkEnv = function () {
    if (!isThinkApp('./')) {
        console.log();
        console.log('current path is not thinknkoa project.');
        process.exit();
    }
    console.log();
};

var createProject = function (projectRootPath) {
    if (isThinkApp(projectRootPath)) {
        console.log('path `' + projectRootPath + '` is already exist');
        process.exit();
    }

    mkdir(projectRootPath);
    copyFile('package.json', projectRootPath + 'package.json');
    copyFile('.eslintrc', projectRootPath + '.eslintrc');
    copyFile('.thinksrc', projectRootPath + '.thinksrc', {
        '<createAt>': getDateTime()
    });
    copyFile('pm2.json', projectRootPath + 'pm2.json', {
        '<ROOT_PATH>': projectRootPath,
        '<APP_NAME>': getAppName()
    });
    copyFile('README.md', projectRootPath + 'README.md');
    copyFile('index.js', projectRootPath + 'index.js');

    console.log('create' + ' : ' + projectRootPath + '/static');
    mkdir(projectRootPath + path.sep + 'static');
    mkdir(projectRootPath + path.sep + 'static' + path.sep + 'js');
    mkdir(projectRootPath + path.sep + 'static' + path.sep + 'css');
    mkdir(projectRootPath + path.sep + 'static' + path.sep + 'images');

    APP_PATH = projectRootPath + path.sep + 'src'

    console.log('create' + ' : ' + APP_PATH);
    mkdir(APP_PATH + path.sep + 'controller');
    // mkdir(APP_PATH + path.sep + 'model');
    // mkdir(APP_PATH + path.sep + 'service');
    mkdir(APP_PATH + path.sep + 'config');
    mkdir(APP_PATH + path.sep + 'view');

    copyFile('controller' + path.sep + 'index.js', APP_PATH + path.sep + 'controller' + path.sep + 'index.js');
    copyFile('config' + path.sep + 'config.js', APP_PATH + path.sep + 'config' + path.sep + 'config.js');
    copyFile('config' + path.sep + 'middleware.js', APP_PATH + path.sep + 'config' + path.sep + 'middleware.js');

    console.log();
    console.log('  enter path:');
    console.log('  $ cd ' + projectRootPath);
    console.log();

    console.log('  install dependencies:');
    console.log('  $ npm install');
    console.log();

    console.log('  run the app:');
    console.log('  $ npm start');

    console.log();
}

var createController = function (controller) {
    _checkEnv();

    var module = '';
    controller = controller.split('/');
    if (controller.length === 2) {
        module = controller[0];
        controller = controller[1];
    } else {
        controller = controller[0];
    }

    module = module.toLowerCase();
    controller = controller.toLowerCase();

    mkdir(APP_PATH + path.sep + 'controller' + path.sep + module);
    if (module) {
        copyFile('controller' + path.sep + 'index.js', APP_PATH + path.sep + 'controller' + path.sep + module  + path.sep + controller + '.js');
    } else {
        copyFile('controller' + path.sep + 'index.js', APP_PATH + path.sep + 'controller' + path.sep + controller + '.js');
    }

};


var createModel = function (model) {
    _checkEnv();

    var module = '';
    model = model.split('/');
    if (model.length === 2) {
        module = model[0];
        model = model[1];
    } else {
        model = model[0];
    }

    module = module.toLowerCase();
    model = model.toLowerCase();

    mkdir(APP_PATH + path.sep + 'model' + path.sep + module);
    if (module) {
        copyFile('model' + path.sep + 'model.js', APP_PATH + path.sep + 'model' + path.sep + module  + path.sep + model + '.js');
    } else {
        copyFile('model' + path.sep + 'model.js', APP_PATH + path.sep + 'model' + path.sep + model + '.js');
    }

};

var createMiddleware = function (middleware) {
    _checkEnv();

    var module = '';
    middleware = middleware.split('/');
    if (middleware.length === 2) {
        module = middleware[0];
        middleware = middleware[1];
    } else {
        middleware = middleware[0];
    }

    module = module.toLowerCase();
    middleware = middleware.toLowerCase();

    mkdir(APP_PATH + path.sep + 'middleware' + path.sep + module);
    if (module) {
        copyFile('middleware' + path.sep + 'middleware.js', APP_PATH + path.sep + 'middleware' + path.sep + module  + path.sep + middleware + '.js');
    } else {
        copyFile('middleware' + path.sep + 'middleware.js', APP_PATH + path.sep + 'middleware' + path.sep + middleware + '.js');
    }

};


var createService = function (service) {
    _checkEnv();

    var module = '';
    service = service.split('/');
    if (service.length === 2) {
        module = service[0];
        service = service[1];
    } else {
        service = service[0];
    }

    module = module.toLowerCase();
    service = service.toLowerCase();

    mkdir(APP_PATH + path.sep + 'service' + path.sep + module);
    if (module) {
        copyFile('service' + path.sep + 'service.js', APP_PATH + path.sep + 'service' + path.sep + module  + path.sep + service + '.js');
    } else {
        copyFile('service' + path.sep + 'service.js', APP_PATH + path.sep + 'service' + path.sep + service + '.js');
    }

};

var migrateCMD = function () {
    _checkEnv();

    // projectRootPath = path.dirname(APP_PATH);
    projectRootPath.indexOf('./') > -1 && (projectRootPath = projectRootPath.replace('./', ''));
    APP_PATH = cwd + '/' + projectRootPath + '/app';

    if (!isDir(APP_PATH)) {
        console.log('project app path  `' + APP_PATH + '` is not exist.\n');
        process.exit();
    }
    var thinkorm = require(path.resolve(projectRootPath) + '/node_modules/thinkorm/index.js');
    if (!thinkorm) {
        console.log('thinkorm is not install, please run `npm install thinkorm`\n');
        process.exit();
    }

    if (!isFile(APP_PATH + path.sep + 'config' + path.sep + 'config.js')) {
        console.log('project ' + APP_PATH + '/config/middleware.js is not exist.\n');
        process.exit();
    }

    if (!isFile(APP_PATH + path.sep + 'config' + path.sep + 'middleware.js')) {
        console.log('project ' + APP_PATH + '/config/middleware.js is not exist.\n');
        process.exit();
    }

    var middleware_config = thinkorm.require(APP_PATH + path.sep + 'config' + path.sep + 'middleware.js');
    
    if (middleware_config && middleware_config.config && middleware_config.config.model && middleware_config.config.model.db_type) {
        var config = middleware_config.config.model;
        config.db_ext_config && (config.db_ext_config.safe = false);
        var dirs = fs.readdirSync(APP_PATH + path.sep + 'model');
        dirs.forEach(function (dir) {
            if (isDir(dir)) {
                loadFiles({
                    'Model': [
                        APP_PATH + path.sep + 'model' + path.sep + dir
                    ]
                }, function (t, f, g) {
                    console.log(f);
                    thinkorm.setCollection(thinkorm.require(f), config);
                })
            } else {
                thinkorm.setCollection(thinkorm.require(APP_PATH + path.sep + 'model' + path.sep + dir), config);
            }

        });

        //数据结构迁移
        return thinkorm.migrate(config).then(function () {
            process.exit();
        });
    } else {
        console.log('config load error.\n');
        process.exit();
    }
};


program.version(getVersion()).usage('[command] <options ...>');
//create project
program.command('new <projectName>').description('create project').action(function(projectPath){
    projectRootPath = path.normalize(projectPath + '/');
    createProject(projectRootPath);
});

//create controlelr
program.command('controller <controllerName>').description('add controller').action(function(controller){
    createController(controller);
});

//create service
program.command('service <serviceName>').description('add service').action(function(service){
    createService(service);
});

//create model
program.command('model <modelName>').description('add model').action(function(model){
    createModel(model);
});

//create middleware
program.command('middleware <middlewareName>').description('add middleware').action(function(middleware){
    createMiddleware(middleware);
});

//migrate model structure to database
program.command('migrate').description('migrate model structure to database').action(function () {
    migrateCMD();
});

program.parse(process.argv);