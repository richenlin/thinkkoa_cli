/**
 * Service
 * @return
 */
const {base, helper} = require('thinkkoa');

module.exports = class extends base {
    init(params = {
        // 外部实例化service传递的参数需要申明在此
        //key: value
    }){
        this.params = params;
    }
    
};