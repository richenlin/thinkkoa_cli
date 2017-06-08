/**
 * Middleware
 * @return
 */

module.exports = function (options) {
    return function (ctx, next) {
        return next();
    }
};