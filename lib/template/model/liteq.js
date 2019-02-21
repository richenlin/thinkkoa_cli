/**
 * Model
 * @return
 */
const liteQ = require('liteq');

module.exports = class extends liteQ {
    init(config){
        // 模型名称
        this.modelName = '<modelName>';
        // 表主键
        this.pk = 'id';
    }
};