/**
 * Middleware
 * @return
 */

module.exports = function (options, app) {
    return function (ctx, next) {
        return next();
    };
};