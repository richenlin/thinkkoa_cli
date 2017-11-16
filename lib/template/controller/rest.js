/**
 * Controller
 * @return
 */
const {controller, helper} = require('thinkkoa');

module.exports = class extends controller.restful {
    //构造方法
    init(ctx){
        //调用父类构造方法
        super.init(ctx);
    }
    //可以在前置方法内做权限判断等操作
    __before(){
        //此处必须调用父类的__before方法
        super.__before();
    }
};