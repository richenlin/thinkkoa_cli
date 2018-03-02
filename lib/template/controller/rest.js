/**
 * Controller
 * @return
 */
const {controller, helper} = require('thinkkoa');

module.exports = class extends controller.restful {
    //构造方法init代替constructor
    // init(ctx, app){
    //     // property
    // }
    
    //前置方法
    __before(){
        //可以在前置方法内做权限判断等操作
    }
};