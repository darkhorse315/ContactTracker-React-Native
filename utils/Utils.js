import { Linking, Alert } from "react-native";
import { showMessage } from "react-native-flash-message";
import Colors from "../styles/Colors";
import Constant from "./Constant";
export const openLink = async uri => {
    try {
        Linking.canOpenURL(uri).then(supported => {
            if (!supported) {
                alert("Can`t not open this link.");
            } else {
                Linking.openURL(uri);
            }
        });
    } catch (error) {
        alert(error);
    }
};
export const Capitalize = str => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const dateShortString = date => {
    const dateStr = new Date(date).toISOString().split("T")[0];
    return dateStr.split("-")[1] + "/" + dateStr.split("-")[2];
};

export const showMessageWithType = (
    type = "default",
    message = "",
    description = ""
) => {
    const bgColors = {
        default: Colors.btnSecondary,
        success: Colors.btnSecondary,
        error: Colors.secondRed,
        warning: Colors.yellow.main
    };
    const messageBody = {
        message: message,
        description: description,
        icon: { icon: "auto", position: "left" },
        backgroundColor: bgColors[type], // background color
        color: Colors.white, // text color
        type
    };
    showMessage(messageBody);
};
export const onShowAlert = (
    title = "",
    message = undefined,
    okAction = () => { },
    cancelAction = () => { },
    okLabel = "Ok",
    cancelLabel = undefined) => {
    if (cancelLabel) {
        Alert.alert(
            title,
            message,
            [
                { text: cancelLabel || 'Cancel', onPress: () => { cancelAction() } },
                { text: okLabel || 'OK', onPress: () => { okAction() } },
            ],
            { cancelable: true }
        )
    } else {
        Alert.alert(
            title,
            message,
            [
                { text: okLabel || 'OK', onPress: () => { okAction() } },
            ],
            { cancelable: true }
        )
    }
}
export const setPostion = (currentPosition) => {
    console.log("Current set position", currentPosition);
    Constant.currentPosition = currentPosition;
}
export const getPosition = () => {
    console.log("Current get position", Constant.currentPosition);
    return Constant.currentPosition;
}
