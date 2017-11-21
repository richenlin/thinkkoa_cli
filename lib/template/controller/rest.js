/**
 * Controller
 * @return
 */
const {controller, helper} = require('thinkkoa');

module.exports = class extends controller.restful {
    //构造方法
    init(ctx, app){
        //调用父类构造方法
        super.init(ctx, app);
    }
    //可以在前置方法内做权限判断等操作
    __before(){
        
    }
};