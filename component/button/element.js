import React, { Component } from "react";
import { Button } from 'react-native-elements';
import PropTypes from "prop-types";
import Colors from "../../styles/Colors";
import Fonts from "../../styles/Fonts";
class BtnElement extends Component {
    render() {
        const {
            rounded,
            backgroundColor,
            marginTop,
            borderRadius,
            onPress,
            title,
            titleColor,
            iconName,
            iconColor,
            style
        } = this.props;
        return (
            <Button
                rounded={rounded}
                buttonStyle={[{ marginTop, borderRadius, backgroundColor }, style]}
                icon={{ name: iconName, color: iconColor }}
                titleStyle={{ ...Fonts.h8_b, color: titleColor }}
                title={title}
                onPress={onPress} />
        )
    }
}
BtnElement.propTypes = {
    rounded: PropTypes.bool,
    backgroundColor: PropTypes.string,
    marginTop: PropTypes.number,
    borderRadius: PropTypes.number,
    onPress: PropTypes.func,
    title: PropTypes.string,
    titleColor: PropTypes.string,
    iconName: PropTypes.string,
    iconColor: PropTypes.string,
    style: PropTypes.any
};

BtnElement.defaultProps = {
    rounded: true,
    backgroundColor: Colors.darkPrimary.main,
    marginTop: 12,
    borderRadius: 24,
    onPress: () => { },
    title: "",
    titleColor: Colors.white,
    iconName: "people",
    iconColor: Colors.white,
    style: null
};
export default BtnElement;