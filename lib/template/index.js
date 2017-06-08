/**
 * @license    
 * @version    
 */
const path = require('path');
const thinkkoa = require('thinkkoa');

//thinknode instantiation
const instance = new thinkkoa({
    root_path: __dirname,
    app_path: __dirname + path.sep + 'app',
    app_debug: true //线上环境切记要将debug模式关闭，即：APP_DEBUG:false
});

//... instance.app = koa


//app run
instance.run();
