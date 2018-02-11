/**
 * Middleware config
 * @return
 */
module.exports = {
    list: [], //加载的中间件列表
    config: { //中间件配置 
        router: {
            multi_modules: true, //开启多模块支持
            deny_modules: ['common'], //禁止访问的模块(多模块模式)
            default_module: 'home', //默认的模块
            deny_controller: [], //禁止访问的控制器
            default_controller: 'index', //默认控制器
            default_action: 'index', //默认方法
            prefix: [], // url prefix
            suffix: ['.jhtml'], // url suffix
            subdomain_offset: 2,
            subdomain: {}, //subdomain
        }
    }
};