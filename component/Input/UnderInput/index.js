import React from "react";
import PropTypes from "prop-types";
import { View, TextInput, Platform } from "react-native";
import Colors from "../../../styles/Colors";
import styles from "./styles";
import Label from "../../Label";

class CustomInput  extends React.PureComponent {
  constructor(props) {
    super(props);    
    this.state = {
      txtValue: props.value,
      isFocus: false
    };
  }
  componentWillReceiveProps(nextProps, nextState) {    
    this.setState({
      txtValue: nextProps.value
    });
  }
  initSetting() {
    this.setState({
      txtValue: "",
      isFocus: false
    });
  }
  decimalMatch = value => value && value.match(/^\d*\.?\d*$/);
  render() {
    const {
      isGreenUnder,
      label,
      labelColor,
      des,
      placeholder,
      keyType,
      onChangeText,
      name,
      style,
      multiline,
      styleText,
      editable
    } = this.props;
    const { txtValue, isFocus } = this.state;    
    return (
      <View style={[style, { marginBottom: 16 }]}>
        {label && (
          <Label
            size={7}
            type="bold"
            color={labelColor}
            style={styles.label}
            numberOfLines={1}
            ellipsizeMode="clip"
          >
            {label}
          </Label>
        )}
        <TextInput
          onChangeText={value => {
            this.setState({
              txtValue: value
            });
            onChangeText(value, name);
          }}
          onFocus={() => {
            this.setState({
              isFocus: true
            });
          }}
          onEndEditing={() => {
            this.setState({
              isFocus: isGreenUnder
            });
          }}
          value={txtValue}
          placeholder={placeholder}
          style={[
            styles.input,
            isGreenUnder && txtValue !== ""
              ? styles.validStyle
              : isFocus
              ? styles.focusStyle
              : null,
            styleText
          ]}          
          placeholderTextColor={Colors.textMuted}
          keyboardType={
            keyType === "numeric" && Platform.OS === "ios"
              ? "decimal-pad"
              : keyType
          }
          numberOfLines={multiline ? 4 : 1}
          multiline={multiline}
          maxLength={250}
          autoFocus={false}
          editable={editable}
        />
        {des && (
          <Label color={Colors.inputDark} size={9}>
            {des}
          </Label>
        )}
      </View>
    );
  }
}
CustomInput.propTypes = {
  name: PropTypes.string.isRequired,
  keyType: PropTypes.string,
  label: PropTypes.string,
  labelColor: PropTypes.string,
  des: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChangeText: PropTypes.func,
  style: PropTypes.any,
  styleText: PropTypes.any,
  multiline: PropTypes.bool,
  isGreenUnder: PropTypes.bool,
  editable: PropTypes.bool
};

CustomInput.defaultProps = {
  keyType: "default",
  label: null,
  labelColor : Colors.secondBlack,
  des: null,
  placeholder: null,
  style: null,
  value: "" || 0,
  onChangeText: () => {},
  multiline: false,
  isGreenUnder: false,
  styleText: null,
  editable: true
};

export default CustomInput;
