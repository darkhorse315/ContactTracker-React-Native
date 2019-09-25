import React, { Component } from "react";
import { Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
const { width } = Dimensions.get("window");

export default class ButtonRoundBlue extends Component {
    render() {
        return (
            <TouchableOpacity
                style={[styles.buttonRoundBlue, this.props.style, { backgroundColor: this.props.color ? this.props.color : '#1CAADE' }]}
                onPress={this.props.onPress}>
                <Text style={[styles.buttonRectangularText, this.props.textStyle]}>{this.props.text}</Text>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    "buttonRoundBlue": {
        "backgroundColor": "rgba(60,135,217,0.8)",
        "paddingTop": 12,
        "paddingRight": 12,
        "paddingBottom": 12,
        "paddingLeft": 12,
        "borderColor": "transparent",
        "alignSelf": "center",
        "borderRadius": 20,
        "marginTop": 12,
        "marginLeft": 10,
        "marginRight": 10,
        "width": width - 30
    },
    "buttonRectangularText": {
        "color": "#fff",
        "alignSelf": "center",
        "fontSize": 14
    },
})