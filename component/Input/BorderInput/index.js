import React from "react";
import PropTypes from "prop-types";
import { View, TextInput, Dimensions } from "react-native";
import Label from "../../Label";
import Colors from "../../../styles/Colors";
import styles from "./styles";
class BorderInput extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      txtValue: props.value,
      isFocus: false
    };
  }
  render() {
    const {
      label,
      value,
      placeholder,
      keyType,
      onChange,
      onBulr,
      name,
      width,
      multiline,
      styleText,
      autoCapitalize,
      styleContainer
    } = this.props;
    const { txtValue, isFocus } = this.state;
    const textValue = value === null ? txtValue : value;
    return (
      <View style={styleContainer}>
        {label && (
          <Label
            size={7}
            type="bold"
            style={styles.label}
            numberOfLines={1}
            ellipsizeMode="clip"
          >
            {label}
          </Label>
        )}
        <TextInput
          onChangeText={value1 => {
            this.setState({
              txtValue: value1
            });
            onChange(value1, name);
          }}
          onFocus={() => {
            this.setState({
              isFocus: true
            });
          }}
          onEndEditing={() => {
            this.setState({
              isFocus: false
            });
            onBulr()
          }}
          onBulr={onBulr}
          value={textValue}
          placeholder={placeholder}
          style={[
            styles.input,
            isFocus ? styles.focusStyle : styles.defaultStyle,
            { width },
            styleText
          ]}
          placeholderTextColor={Colors.textMuted}
          keyboardType={keyType}
          numberOfLines={multiline ? 4 : 1}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
        />
      </View>
    );
  }
}
BorderInput.propTypes = {
  name: PropTypes.string.isRequired,
  keyType: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBulr: PropTypes.func,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  styleText: PropTypes.any,
  styleContainer: PropTypes.any,
  multiline: PropTypes.bool,
  label: PropTypes.string,
  autoCapitalize: PropTypes.string,
};

BorderInput.defaultProps = {
  keyType: "default",
  label: null,
  placeholder: null,
  value: null,
  onChange: () => { },
  onBulr: () => { },
  width: Dimensions.get("window").width * 0.75,
  styleText: null,
  styleContainer: null,
  multiline: false,
  autoCapitalize: "sentences"
};

export default BorderInput;
