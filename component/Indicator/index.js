import React from "react";
import { Modal, StyleSheet, ActivityIndicator, View } from "react-native";
import Label from "../Label";

const Indicator = ({ visible, text }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={() => { }}
        >
            <View style={styles.container}>
                <View style={styles.innerContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Label size={7} style={styles.text}>{text}</Label>
                </View>
            </View>
        </Modal>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center'
    },
    innerContainer: {
        backgroundColor: 'rgba(250, 250, 255, 0.9)',
        minWidth: '50%',
        paddingBottom: 20,
        paddingTop: 20,
        borderRadius: 10
    },
    text: {
        backgroundColor: 'transparent',
        alignSelf: 'center',
        paddingRight: 5,
        paddingLeft: 5,
        paddingBottom: 10
    }
})
export default Indicator;
