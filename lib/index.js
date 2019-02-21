#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const commander = require('commander');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
const cwd = process.cwd();
const templatePath = __dirname + '/template';
var projectRootPath = './'; //project root path

/**
 * get app root path
 * @return {} []
 */
const getProjectAppPath = function (rootPath) {
    return path.resolve(rootPath + 'app');
};

/**
 * get date time
 * @return {} []
 */
const getDateTime = function () {
    const fn = function (d) {
        return ('0' + d).slice(-2);
    };
    let d = new Date();
    let date = d.getFullYear() + '-' + fn(d.getMonth() + 1) + '-' + fn(d.getDate());
    let time = fn(d.getHours()) + ':' + fn(d.getMinutes()) + ':' + fn(d.getSeconds());
    return date + ' ' + time;
};

const isFile = function (p) {
    if (!fs.existsSync(p)) {
        return false;
    }
    let stats = fs.statSync(p);
    return stats.isFile();
};

const isBoolean = function (obj) {
    return toString.call(obj) === '[object Boolean]';
};

/**
 * 是否是对象
 *
 * @param  {[type]}
 * @return {Boolean}
 */
const isObject = function (obj) {
    if (Buffer.isBuffer(obj)) {
        return false;
    }
    return Object.prototype.toString.call(obj) === '[object Object]';
};

const isDir = function (p) {
    if (!fs.existsSync(p)) {
        return false;
    }
    let stats = fs.statSync(p);
    return stats.isDirectory();
};

const chmod = function (p, mode) {
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
const mkdir = function (p, mode) {
    mode = mode || '0777';
    if (fs.existsSync(p)) {
        chmod(p, mode);
        return true;
    }
    let pp = path.dirname(p);
    if (fs.existsSync(pp)) {
        fs.mkdirSync(p, mode);
    } else {
        mkdir(pp, mode);
        mkdir(p, mode);
    }
    return true;
};

/**
 * 继承
 * from jquery.具有深度克隆
 * @returns {*}
 */
const extend = function () {
    let args = [].slice.call(arguments),
        deep = true,
        target = void 0;
    if (isBoolean(args[0])) {
        deep = args.shift();
    }
    if (deep) {
        target = Array.isArray(args[0]) ? [] : {};
    } else {
        target = args.shift();
    }
    target = target || {};
    let i = 0,
        length = args.length,
        options = void 0,
        name = void 0,
        src = void 0,
        copy = void 0;
    for (; i < length; i++) {
        options = args[i];
        if (!options) {
            continue;
        }
        for (name in options) {
            src = target[name];
            copy = options[name];
            if (src && src === copy) {
                continue;
            }
            if (deep) {
                if (isObject(copy)) {
                    target[name] = extend(src && isObject(src) ? src : {}, copy);
                } else if (Array.isArray(copy)) {
                    target[name] = extend([], copy);
                } else {
                    target[name] = copy;
                }
            } else {
                target[name] = copy;
            }
        }
    }
    return target;
};

/**
 * get version
 * @return {String} []
 */
const getVersion = function () {
    let filepath = path.resolve(__dirname, '../package.json');
    let version = JSON.parse(fs.readFileSync(filepath)).version;
    return version;
};


/**
 * get app name
 * @return {} []
 */
const getAppName = function () {
    let filepath = path.normalize(cwd + '/' + projectRootPath).replace(/\\/g, '');
    let matched = filepath.match(/([^\/]+)\/?$/);
    return matched[1];
};

/**
 * copy file
 * @param  {String} source []
 * @param  {String} target []
 * @return {}        []
 */
const copyFile = function (source, target, replace, showWarning) {

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

    let content = fs.readFileSync(templatePath + path.sep + source, 'utf8');
    //replace content
    if (replace) {
        for (let key in replace) {
            while (true) {
                let content1 = content.replace(key, replace[key]);
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
const loadFiles = function (ext, callback, g) {
    g = g || '';
    let tempDir = [], subDir = [], tempType = '', tempName = '', tempFile = '';
    for (let type in ext) {
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
const isThinkApp = function (projectRootPath) {
    if (isDir(projectRootPath)) {
        let filepath = projectRootPath + '.thinksrc';
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
const _checkEnv = function () {
    if (!isThinkApp('./')) {
        console.log();
        console.log('current path is not thinknkoa project.');
        process.exit();
    }

    updateNotifier({ pkg }).notify();
    console.log();
};
/**
 * 
 * 
 * @param {any} projectRootPath 
 */
const createProject = function (projectRootPath) {
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
    copyFile('apidoc.json', projectRootPath + 'apidoc.json', {
        '<APP_NAME>': getDateTime()
    });
    copyFile('README.md', projectRootPath + 'README.md');
    copyFile('index.js', projectRootPath + 'index.js');

    console.log('create' + ' : ' + projectRootPath + '/static');
    mkdir(projectRootPath + path.sep + 'static');
    // mkdir(projectRootPath + path.sep + 'static' + path.sep + 'js');
    // mkdir(projectRootPath + path.sep + 'static' + path.sep + 'css');
    // mkdir(projectRootPath + path.sep + 'static' + path.sep + 'images');
    copyFile('favicon.ico', projectRootPath + path.sep + 'static' + path.sep + 'favicon.ico');

    APP_PATH = getProjectAppPath(projectRootPath);
    console.log('create' + ' : ' + APP_PATH);
    mkdir(APP_PATH + path.sep + 'controller');
    // mkdir(APP_PATH + path.sep + 'middleware');
    // mkdir(APP_PATH + path.sep + 'model');
    // mkdir(APP_PATH + path.sep + 'service');
    mkdir(APP_PATH + path.sep + 'config');
    // mkdir(APP_PATH + path.sep + 'view' + path.sep + 'default');

    copyFile('controller' + path.sep + 'index.js', APP_PATH + path.sep + 'controller' + path.sep + 'index.js');
    // copyFile('middleware' + path.sep + 'view.js', APP_PATH + path.sep + 'middleware' + path.sep + 'view.js');
    // copyFile('view' + path.sep + 'index.html', APP_PATH + path.sep + 'view' + path.sep + 'default' + 'index_index.html');

    //config
    copyFile('config' + path.sep + 'config.js', APP_PATH + path.sep + 'config' + path.sep + 'config.js');
    copyFile('config' + path.sep + 'db.js', APP_PATH + path.sep + 'config' + path.sep + 'db.js');
    
    let conf = 'middleware.js';
    if (commander.multi) {
        conf = 'multi_middleware.js';
    }
    copyFile('config' + path.sep + conf, APP_PATH + path.sep + 'config' + path.sep + 'middleware.js');

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
/**
 * 
 * 
 * @param {any} controller 
 */
const createController = function (controller) {
    _checkEnv();

    let module = '';
    controller = controller.split('/');
    if (controller.length === 2) {
        module = controller[0];
        controller = controller[1];
    } else {
        controller = controller[0];
    }

    module = module.toLowerCase();
    controller = controller.toLowerCase();
    APP_PATH = getProjectAppPath(projectRootPath);
    mkdir(APP_PATH + path.sep + 'controller' + path.sep + module);

    let file = 'index.js';
    if (commander.rest) {
        file = 'rest.js';
        if (module) {
            copyFile('config' + path.sep + 'router.js', APP_PATH + path.sep + 'config' + path.sep + 'router.js', {
                '<controller>': controller,
                '<get>': '/' + module + '/' + controller + '/get',
                '<post>': '/' + module + '/' + controller + '/post',
                '<delete>': '/' + module + '/' + controller + '/delete',
                '<put>': '/' + module + '/' + controller + '/put'
            });
        } else {
            copyFile('config' + path.sep + 'router.js', APP_PATH + path.sep + 'config' + path.sep + 'router.js', {
                '<controller>': controller,
                '<get>': '/' + controller + '/get',
                '<post>': '/' + controller + '/post',
                '<delete>': '/' + controller + '/delete',
                '<put>': '/' + controller + '/put'
            });
        }

    }
    if (module) {
        copyFile('controller' + path.sep + file, APP_PATH + path.sep + 'controller' + path.sep + module + path.sep + controller + '.js');
    } else {
        copyFile('controller' + path.sep + file, APP_PATH + path.sep + 'controller' + path.sep + controller + '.js');
    }

};

/**
 * 
 * 
 * @param {any} model 
 */
const createModel = function (model) {
    _checkEnv();

    let module = '';
    model = model.split('/');
    if (model.length === 2) {
        module = model[0];
        model = model[1];
    } else {
        model = model[0];
    }

    module = module.toLowerCase();
    model = model.toLowerCase();
    APP_PATH = getProjectAppPath(projectRootPath);
    mkdir(APP_PATH + path.sep + 'model' + path.sep + module);

    let orm = commander.orm || 'thinkorm';
    if (module) {
        copyFile('model' + path.sep + orm + '.js', APP_PATH + path.sep + 'model' + path.sep + module + path.sep + model + '.js', {
            '<modelName>': model
        });
    } else {
        copyFile('model' + path.sep + orm + '.js', APP_PATH + path.sep + 'model' + path.sep + model + '.js', {
            '<modelName>': model
        });
    }
};
/**
 * 
 * 
 * @param {any} middleware 
 * @param {any} type 
 */
const createMiddleware = function (middleware, type) {
    _checkEnv();

    let module = '';
    middleware = middleware.split('/');
    if (middleware.length === 2) {
        module = middleware[0];
        middleware = middleware[1];
    } else {
        middleware = middleware[0];
    }
    type = type || 'middleware';
    // module = module.toLowerCase();
    middleware = middleware.toLowerCase();
    APP_PATH = getProjectAppPath(projectRootPath);
    mkdir(APP_PATH + path.sep + 'middleware');
    copyFile('middleware' + path.sep + type + '.js', APP_PATH + path.sep + 'middleware' + path.sep + middleware + '.js');

    console.log();
    console.log('  please modify /app/config/middlewate.js file:');
    console.log();
    console.log('  list: [..., "' + middleware + '"] //加载中间件' + middleware);
    console.log('  config: { //中间件配置 ');
    console.log('      ...');
    console.log('   }');

    console.log();
};

/**
 * 
 * 
 * @param {any} service 
 */
const createService = function (service) {
    _checkEnv();

    let module = '';
    service = service.split('/');
    if (service.length === 2) {
        module = service[0];
        service = service[1];
    } else {
        service = service[0];
    }

    module = module.toLowerCase();
    service = service.toLowerCase();
    APP_PATH = getProjectAppPath(projectRootPath);
    mkdir(APP_PATH + path.sep + 'service' + path.sep + module);
    if (module) {
        copyFile('service' + path.sep + 'service.js', APP_PATH + path.sep + 'service' + path.sep + module + path.sep + service + '.js');
    } else {
        copyFile('service' + path.sep + 'service.js', APP_PATH + path.sep + 'service' + path.sep + service + '.js');
    }

};

/**
 * 
 * 
 * @param {any} model 
 */
const migrateCMD = function (model){
    _checkEnv();
    
};

/**
 * 
 * 
 * @param {any} template 
 */
const createView = function (template) {
    _checkEnv();

    let module = '', controller = '', action = '';
    template = template.split('/');
    if (template.length === 3) {
        module = template[0];
        controller = template[1];
        action = template[2];
    } else if (template.length === 2){
        controller = template[0];
        action = template[1];
    } else {
        controller = template[0];
        action = 'index';
    }

    module = module.toLowerCase();
    controller = controller.toLowerCase();
    action = action.toLowerCase();

    APP_PATH = getProjectAppPath(projectRootPath);
    process.env.ROOT_PATH = path.resolve(projectRootPath);
    let middlewareConfig = require(APP_PATH + '/config/middleware.js');
    let viewPath = APP_PATH + path.sep + 'view', filename = '';
    if (module) {
        filename = path.sep + module;
    }
    if (middlewareConfig.config && middlewareConfig.config.view) {
        // view_path
        if (middlewareConfig.config.view.view_path) {
            viewPath = middlewareConfig.config.view.view_path;
        }
        // default_theme
        if (middlewareConfig.config.view.default_theme) {
            viewPath += path.sep + middlewareConfig.config.view.default_theme;
        }
        // file_depr
        if (middlewareConfig.config.view.file_depr === '_') {
            filename = controller ? filename + path.sep + controller + '_' + action : filename + path.sep + action;
        } else {
            filename = controller ? filename + path.sep + controller + path.sep + action : filename + path.sep + action;
        }
        //file_suffix
        if (middlewareConfig.config.view.file_suffix) {
            filename += middlewareConfig.config.view.file_suffix;
        } else {
            filename += '.html';
        }
    } else {
        viewPath += path.sep + 'default';
        filename = controller ? filename + path.sep + controller + '_' + action + '.html' : filename + path.sep + action + '.html';
    }
    console.log(viewPath + filename)
    mkdir(viewPath);
    if (module) {
        copyFile('view' + path.sep + 'index.html', viewPath + filename);
    } else {
        copyFile('view' + path.sep + 'index.html', viewPath + filename);
    }

    createMiddleware('view', 'view');
};





commander.version(getVersion()).usage('[command] <options ...>');

commander.option('-r, --rest', 'create rest controller, used in `think controller` command');
commander.option('-m, --multi', 'project multi mode (true, false), default is false, used in `think new` command');
commander.option('-o, --orm', 'used orm module (thinkorm, liteq), default is thinkorm, used in `think model` command');
//create project
commander.command('new <projectName>').description('create project').action(function (projectPath) {
    projectRootPath = path.normalize(projectPath + '/');
    createProject(projectRootPath);
});

//create controlelr
commander.command('controller <controllerName>').description('add controller').action(function (controller) {
    createController(controller);
});

//create service
commander.command('service <serviceName>').description('add service').action(function (service) {
    createService(service);
});

//create model
commander.command('model <modelName>').description('add model').action(function (model) {
    createModel(model);
});

//create middleware
commander.command('middleware <middlewareName>').description('add middleware').action(function (middleware) {
    createMiddleware(middleware);
});

//create view
commander.command('view <viewName>').description('add view template').action(function (template) {
    createView(template);
});

//migrate model structure to database
// commander.command('migrate').description('migrate model structure to database').action(function (model) {
//     migrateCMD(model);
// });

commander.parse(process.argv);