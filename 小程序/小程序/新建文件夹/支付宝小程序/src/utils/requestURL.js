var util = require('util.js')
var md5 = require('md5.js')
var app_key = '5a0c4e12a21eb14143880da0cb8f44f4';
// var app_secret = 'b4-bf56-48da95-072d-58e502-965b9e-9e-ca';
var app_secret = 'f4a426d596c61dc986bd849b0edb397b';
var url = 'http://app.yaofangwang.com:18080/4000/4000/0/'

function build(para) {
    var timestamp = util.formatTime(new Date());

    var app_secret_arr = app_secret.split('-');
    var secret = '';
    for (var i = 0; i < app_secret_arr.length; i++) {
        secret += app_secret_arr[i];
    }

    var basePara = para + '&os=wx&app_version=2.30&timestamp=' + timestamp + '&app_key=' + app_key;
    var signPara = basePara + "&app_secret=" + secret;
    //console.log(signPara);
    var sign = md5.hexMD5(signPara);
    //console.log(sign);
    return url+para;
    // return url + basePara + "&sign=" + sign;
}

module.exports = {
    build: build
}
