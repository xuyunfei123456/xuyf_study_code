//过滤emoji表情
export const EMOJIS = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig;
//过滤非法JSON字符
export const JOSN = /[‘']/ig;
//限定输入纯数字
export const NUMBERS = /[^0-9]/ig
//限定输入身份证号
export const IDENTITY_CODE = /[^0-9xX]/g
//限定中英文
export const NAME = /[^\u4e00-\u9fa5a-zA-Z]/g
//限定中英文、带空格
export const NEWNAME = /[^\u4e00-\u9fa5a-zA-Z\s]/g
//校验身份证
// export const IDENTITY_VERIFY = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
export const IDENTITY_VERIFY = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$)/