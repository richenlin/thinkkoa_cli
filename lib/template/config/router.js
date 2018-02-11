/**
 * router config
 * @return
 */
module.exports = [
    ['/<controller>/:id', {
        get: '<get>',
        post: '<post>',
        put: '<put>',
        delete: '<delete>',
    }]
];