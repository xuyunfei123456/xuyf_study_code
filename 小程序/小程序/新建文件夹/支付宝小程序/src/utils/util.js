import {
  config
} from '../config.js'

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}


//正则判断
function Regular(str, reg) {
  if (reg.test(str))
    return true;
  return false;
}

//是否为中文
function IsChinese(str) {
  var reg = /^[\u0391-\uFFE5]+$/;
  return Regular(str, reg);
}

function getImgUrl(img, widthHeight) {
  if (img.indexOf('default') > 0){
    return config.cdn_url + img;
  }
  return config.cdn_url + img + '_' + widthHeight + '.jpg';
}

module.exports = {
  formatTime,
  IsChinese,
  getImgUrl
}