import {
  config
} from '../config.js'
// const imageKeys = ['intro_image', 'img_url', 'imageurl', 'icon', 'image', 'imageurl', 'logo_image', 'intro_image_small','introImage','account_img_url']
function handleResponse(responseObj) {

  try {
    let type = Object.prototype.toString.call(responseObj);
    if (type === '[object Object]') {
      responseObj = convertObj(responseObj)
    } else if (type === '[object Array]') {
      responseObj = convertArray(responseObj)
    } else if (type === '[object String]') {
      responseObj = convertImg(responseObj)
    }

  } catch(e) {

  } finally {
    return responseObj
  }

}
function convertObj(object) {

  try {

    for (let key of Object.keys(object)) {
      let value = object[key];
      let type = Object.prototype.toString.call(value);

      if (type === '[object Object]') {
        object[key] = convertObj(value);
      } else if (type === '[object Array]') {
        object[key] = convertArray(value);
      } else if (type === '[object String]') {
        object[key] = convertImg(value);
      }

    }

  } catch (e) {

  } finally {
    return object;
  }

}


function convertArray(array){

  try {

    for (let i = 0; i < array.length; i++) {
      let object = array[i];
      let type = Object.prototype.toString.call(object);

      if (type === '[object Object]') {
        array[i] = convertObj(object);
      } else if (type === '[object Array]') {
        array[i] = convertArray(object);
      } else if (type === '[object String]') {
        array[i] = convertImg(object);
      }

    }

  } catch (e) {

  } finally {
    return array;
  }

}


function convertImg(img){

  let isImage = contantImage(img);

  if (isImage && img.includes('default')) {

    img = imgHander(img);
    return img;
  }

  if (img && isImage) {

    if (img.includes('yaofangwang')) {

      // img = img.replace('https', 'http');

    } else if (img.startsWith('file://')) {

      img = img.replace('file://', '');
      img = imgHander(img);

    } else {

      img = imgHander(img);
    }
  }

  return img

}


function imgHander(img){

  if (img.includes('yaofangwang')) {

    return img;
  }
  let cdn = config.cdn_url;

  if (img.startsWith('/')) {
    img = cdn + img;
  } else if (img.startsWith('http://192.168') || img.startsWith('https://192.168')) {
    img = img.replace('https', 'http')
    return img
  } else if (img.startsWith('http')){
    return img;
  }  else {
    img = cdn + '/' + img;
  }

  return img;
}


function contantImage(string){
  let filterImage = [".JPEG", ".jpeg", ".JPG", ".jpg", ".png", ".gif", ".webp", ".svg"]
  return filterImage.some(function (value) { return string.includes(value) });

}
module.exports = {
  handleResponse: handleResponse
}