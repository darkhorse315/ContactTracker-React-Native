import React from "react";
import { Modal, StyleSheet, Animated, View } from "react-native";
import Label from "../Label";
import Icon from "react-native-vector-icons/FontAwesome5";
import Colors from "../../styles/Colors";
class Hub extends React.PureComponent {
    constructor(props) {
        super(props);
        this.springValue = new Animated.Value(0.9);
        this.spring = this.spring.bind(this);
    }
    componentDidMount() {
        this.spring();        
    }
    spring() {
        this.springValue.setValue(0.9);
        Animated.spring(this.springValue, {
            toValue: 1,
            friction: 1
        }).start();
    }
    render() {
        const {
            iconName, text, visible
        } = this.props;
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={visible}
                onRequestClose={() => { }}
            >
                <View style={styles.container}>
                    <View style={styles.innerContainer}>
                        <Animated.View style={{
                            width: 44,
                            height: 44,
                            alignItems: 'center',
                            transform: [{ scale: this.springValue }]
                        }}>
                            <Icon name={iconName} color={Colors.green.main} size={36} light></Icon>
                        </Animated.View>
                        <Label size={7} style={styles.text}>{text}</Label>
                    </View>
                </View>
            </Modal>
        )
    }
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
        minWidth: '35%',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center'
    },
    text: {
        backgroundColor: 'transparent',
        alignSelf: 'center',
        paddingRight: 5,
        paddingLeft: 5,
        paddingBottom: 10
    }
})
export default Hub;
