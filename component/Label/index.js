import React from "react";
import PropTypes from "prop-types";
import { Text } from "react-native";
import styles from "./styles";
import Fonts from "../../styles/Fonts";
import Colors from "../../styles/Colors";
const fontSize = (size, type) => {
  const font = Fonts[`h${size}${fontType(type)}`];
  const lineHeight = styles[`h${size}`];
  return {
    ...font,
    ...lineHeight
  };
};

const fontType = type => {
  switch (type) {
    case "strong":
      return "_s";
    case "bold":
      return "_b";
    case "medium":
      return "_m";
    case "regular":
      return "";
    case "light":
      return "_l";
    case "title":
      return "_b";
    case "subTitle":
      return "_b";
    case "toggle":
      return "_m";
    default:
      return "";
  }
};

const Label = ({
  size,
  style,
  color,
  lineColor,
  children,
  onPress,
  type,
  numberOfLines
}) => (
    <Text
      onPress={onPress}
      style={[
        fontSize(size, type),
        { color },
        style,
        type === "anchor" && [styles.underLine, { color: lineColor }],
        type === "title" && styles.header,
        type === "subTitle" && styles.subTitle,
        type === "toggle" && styles.toggle,
        type === "header" && styles.navHeader
      ]}
      numberOfLines={numberOfLines}
      {...this.props}
    >
      {children}
    </Text>
  );

Label.propTypes = {
  text: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.any,
  color: PropTypes.string,
  lineColor: PropTypes.string,
  onPress: PropTypes.func,
  type: PropTypes.string,
  numberOfLines: PropTypes.number
};

Label.defaultProps = {
  text: "",
  size: 1,
  style: {},
  color: Colors.black,
  lineColor: Colors.primary.main,
  type: "regular",
  onPress: null,
  numberOfLines: null
};

export default Label;
