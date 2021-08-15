import { View, Image, Text } from "@tarojs/components";

import "./YfwModal.less";

const YfwModal = props => {
  const { icon, title, content, cancelBtn, confirmBtn,infoBtn ,isOpen } = props;
  let _pic = icon ? iconType(icon) : "";
  return (
    <View className="_wrapper" style={`visibility:${isOpen ? 'visible':'hidden'}`}>
      <View className="modalWrapper">
        {icon && (
          <View className="icon_wrapper">
            <Image className="icon" src={_pic}></Image>
          </View>
        )}
        
        {title && (
          <View className={`title ${icon ? "title_icon" : "title_no_icon"}`}>
            {title}
          </View>
        )}
        {content && (
          <View
            className={`content ${icon ? "content_icon" : "content_no_icon"}`}
          >
            {content}
          </View>
        )}
        <View className="btn">
          {cancelBtn && !infoBtn && (
            <View className="cancelBtn" onClick={props.cancelFn}>
              {cancelBtn}
            </View>
          )}
          {confirmBtn && !infoBtn && (
            <View className="confirmBtn" onClick={props.confirmFn}>
              {confirmBtn}
            </View>
          )}
          {infoBtn && (
            <View className="cancelBtn" onClick={props.infoFn}>
              {infoBtn}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
export default YfwModal;

const iconType = type => {
  let result
  switch (type) {
    case "success":
      result = require("../../images/success.png");
      break;
    case "warning":
      result = require("../../images/warning.png");
      break;
    case "error":
      result = require("../../images/error.png");
      break;
    default:
      result = require("../../images/success.png");
  }
  return result
};
