/**
 * Middleware
 * @return
 */

const {helper} = require('thinkkoa');
const defaultOpt = {
    //默认配置项
};

module.exports = function (options, app) {
    options = helper.extend(defaultOpt, options);
    return function (ctx, next) {
        return next();
    };
};