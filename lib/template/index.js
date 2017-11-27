/**
 * @license    
 * @version    
 */
const path = require('path');
const thinkkoa = require('thinkkoa');

//thinkkoa instantiation
const app = new thinkkoa({
    root_path: __dirname,
    app_path: __dirname + path.sep + 'app',
    app_debug: true //线上环境切记要将debug模式关闭，即：app_debug:false
});

//... app is instances of koa


//app server
app.listen();