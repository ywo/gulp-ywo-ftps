var through = require('through2');
var gutil = require('gulp-util');
var FTPS = require('ywo-ftps');
var _ = require('lodash');
var PATH = require('path');

const PLUGIN_NAME = require('./package.json').name;
var defaults = {
    host: '127.0.0.1',
    username: 'root',
    password: '***',
    protocol: 'sftp',
    root : '/home/ywo',
    port: 22,
}
module.exports = function (options) {
    var cfg = _.merge({}, defaults, options);
    var ftps = new FTPS(cfg);
    return through.obj(function (file, enc, cb) {
        var _this = this;
        if (file.isNull()) {
            _this.push(file);
            return cb();
        }
        var relativePath = cfg.localPath.replace(cfg.localRoot, '')
        var remotePath = PATH.join(cfg.remote_path, relativePath);
        ftps.put(cfg.localPath, remotePath).exec(function(err, result){
            if(result.error) {
                new gutil.PluginError(PLUGIN_NAME, result.error);
            } else {
                gutil.log('send success', relativePath);
            }
            ftps = null;
            _this.push(file);
            cb();
        });
    });
};