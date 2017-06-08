/**
 * Config
 * @return
 */

module.exports = {
    /*app config*/
    app_port: 3000, 
    encoding: 'utf-8', //输出数据的编码
    language: 'zh-cn', //默认语言设置 zh-cn en

    /*auto-load config*/
    loader: {
        'controllers': {
            root: 'controller', //建议不要修改
            prefix: '', //设置为/支持子目录
        },
        'middlewares': {
            root: 'middleware', //建议不要修改
            prefix: '', //设置为/支持子目录
        },
        'models': {
            root: 'model', //建议不要修改
            prefix: '', //设置为/支持子目录
        },
        'services': {
            root: 'service', //建议不要修改
            prefix: '', //设置为/支持子目录
        }
    }

};