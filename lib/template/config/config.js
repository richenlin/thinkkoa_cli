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
            root: 'controller',
            prefix: '', //设置为/支持子目录
        },
        'middlewares': {
            root: 'middleware',
            prefix: '',
        },
        'models': {
            root: 'model',
            prefix: '',
        },
        'services': {
            root: 'service',
            prefix: '',
        }
    }

};