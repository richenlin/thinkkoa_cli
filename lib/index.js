#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const commander = require('commander');

const cwd = process.cwd();
const templatePath = __dirname + '/template';
var projectRootPath = './'; //project root path

/**
 * get app root path
 * @return {} []
 */
const getProjectAppPath = function (rootPath) {
    return rootPath + 'app';
};

var APP_PATH = getProjectAppPath(projectRootPath);

/**
 * get date time
 * @return {} []
 */
const getDateTime = function () {
    const fn = function (d) {
        return ('0' + d).slice(-2);
    };
    var d = new Date();
    var date = d.getFullYear() + '-' + fn(d.getMonth() + 1) + '-' + fn(d.getDate());
    var time = fn(d.getHours()) + ':' + fn(d.getMinutes()) + ':' + fn(d.getSeconds());
    return date + ' ' + time;
};

const isFile = function (p) {
    if (!fs.existsSync(p)) {
        return false;
    }
    var stats = fs.statSync(p);
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
    var stats = fs.statSync(p);
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
 * 继承
 * from jquery.具有深度克隆
 * @returns {*}
 */
const extend = function () {
    var args = [].slice.call(arguments),
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
    var i = 0,
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
    var filepath = path.resolve(__dirname, '../package.json');
    var version = JSON.parse(fs.readFileSync(filepath)).version;
    return version;
};


/**
 * get app name
 * @return {} []
 */
const getAppName = function () {
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
const loadFiles = function (ext, callback, g) {
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
const isThinkApp = function (projectRootPath) {
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
const _checkEnv = function () {
    if (!isThinkApp('./')) {
        console.log();
        console.log('current path is not thinknkoa project.');
        process.exit();
    }
    console.log();
};

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
    copyFile('README.md', projectRootPath + 'README.md');
    copyFile('index.js', projectRootPath + 'index.js');

    console.log('create' + ' : ' + projectRootPath + '/static');
    mkdir(projectRootPath + path.sep + 'static');
    mkdir(projectRootPath + path.sep + 'static' + path.sep + 'js');
    mkdir(projectRootPath + path.sep + 'static' + path.sep + 'css');
    mkdir(projectRootPath + path.sep + 'static' + path.sep + 'images');
    copyFile('favicon.ico', projectRootPath + path.sep + 'static' + path.sep + 'favicon.ico');

    APP_PATH = getProjectAppPath(projectRootPath);

    console.log('create' + ' : ' + APP_PATH);
    mkdir(APP_PATH + path.sep + 'controller');
    // mkdir(APP_PATH + path.sep + 'model');
    // mkdir(APP_PATH + path.sep + 'service');
    mkdir(APP_PATH + path.sep + 'config');
    mkdir(APP_PATH + path.sep + 'view');

    copyFile('controller' + path.sep + 'index.js', APP_PATH + path.sep + 'controller' + path.sep + 'index.js');

    copyFile('config' + path.sep + 'config.js', APP_PATH + path.sep + 'config' + path.sep + 'config.js');
    let conf = 'middleware.js';
    if (commander.multi) {
        conf = 'multi_middleware.js';
    }
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

const createController = function (controller) {
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


const createModel = function (model) {
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
        copyFile('model' + path.sep + 'model.js', APP_PATH + path.sep + 'model' + path.sep + module + path.sep + model + '.js', {
            '<modelName>': model
        });
    } else {
        copyFile('model' + path.sep + 'model.js', APP_PATH + path.sep + 'model' + path.sep + model + '.js', {
            '<modelName>': model
        });
    }
};

const createMiddleware = function (middleware) {
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
        copyFile('middleware' + path.sep + 'middleware.js', APP_PATH + path.sep + 'middleware' + path.sep + module + path.sep + middleware + '.js');
    } else {
        copyFile('middleware' + path.sep + 'middleware.js', APP_PATH + path.sep + 'middleware' + path.sep + middleware + '.js');
    }

};


const createService = function (service) {
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
        copyFile('service' + path.sep + 'service.js', APP_PATH + path.sep + 'service' + path.sep + module + path.sep + service + '.js');
    } else {
        copyFile('service' + path.sep + 'service.js', APP_PATH + path.sep + 'service' + path.sep + service + '.js');
    }

};

const migrateCMD = function () {
    _checkEnv();

    // projectRootPath = path.dirname(APP_PATH);
    projectRootPath.indexOf('./') > -1 && (projectRootPath = projectRootPath.replace('./', ''));

    if (!isDir(APP_PATH)) {
        console.log('project app path  `' + APP_PATH + '` is not exist.\n');
        process.exit();
    }
    var thinkkoa = require(path.resolve(projectRootPath) + '/node_modules/thinkkoa/index.js');
    if (!thinkkoa) {
        console.log('cant find module `thinkkoa`, please run `npm install thinkkoa`\n');
        process.exit();
    }
    var app = new thinkkoa({
        root_path: projectRootPath,
        app_path: APP_PATH,
        app_debug: true
    });
    
    var thinkorm = require(path.resolve(projectRootPath) + '/node_modules/thinkorm/index.js');
    if (!thinkorm) {
        console.log('cant find module `thinkorm`, please run `npm install thinkorm`\n');
        process.exit();
    }
    thinkkoa.loader.loadConfigs(app);
    var middleware_config = app.configs.middleware.config;
    if (middleware_config && middleware_config.model && middleware_config.model.db_type) {
        var config = extend({
            db_type: 'mysql', // 数据库类型,支持mysql,mongo,postgressql
            db_host: '127.0.0.1', // 服务器地址
            db_port: 3306, // 端口
            db_name: '', // 数据库名
            db_user: '', // 用户名
            db_pwd: '', // 密码
            db_prefix: '', // 数据库表前缀
            db_charset: '', // 数据库编码默认采用utf8
            db_nums_per_page: 20, //查询分页每页显示的条数
            db_ext_config: { //数据库连接时候额外的参数
                db_log_sql: true, //打印sql
                read_write: false, //读写分离(mysql, postgresql)
                db_pool_size: 10, //连接池大小
                db_replicaset: '', //mongodb replicaset
                db_conn_url: '', //数据链接
            }
        }, middleware_config.model);
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


commander.version(getVersion()).usage('[command] <options ...>');

commander.option('-r, --rest', 'create rest controller, used in `controller` command');
commander.option('-m, --multi', 'project multi mode (true, false), default is false, used in `new` command');
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

//migrate model structure to database
commander.command('migrate').description('migrate model structure to database').action(function () {
    migrateCMD();
});

commander.parse(process.argv);