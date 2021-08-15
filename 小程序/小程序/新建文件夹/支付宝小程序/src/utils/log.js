import {
  HTTP
} from '../utils/http.js'
const http = new HTTP()
function _add(level, message, exception) {
  http.post("guest.sys.log.add", {
    level: level,
    message: message,
    exception: exception,
    from:'taro'
  });
}

function trace(message, exception) {
  _add("trace", message, exception);
}

function debug(message, exception) {
  _add("debug", message, exception);
}

function info(message, exception) {
  _add("info", message, exception);
}

function warn(message, exception) {
  _add("warn", message, exception);
}

function error(message, exception) {
  _add("error", message, exception);
}


module.exports = {
  trace,
  debug,
  info,
  warn,
  error
}