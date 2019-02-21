/**
 * Model
 * @return
 */
const {model, helper} = require('thinkorm');

module.exports = class extends model {
    init(config, app){
        // 模型名称
        this.modelName = '<modelName>';
        // 数据表字段信息
        this.fields = {
            id: {
                type: 'integer',
                pk: true
            }
        };
        // 数据验证
        this.validations = {};
    }
};