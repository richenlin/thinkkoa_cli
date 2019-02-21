/**
 * Service
 * @return
 */
const {base, helper} = require('thinkkoa');

module.exports = class extends base {
    init(app){
        this.app = app;
    }
    
};