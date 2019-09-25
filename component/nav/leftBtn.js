import React from "react";
import { TouchableOpacity, Image, Text } from "react-native";
import styles from "./styles"
import Icon from "react-native-vector-icons/FontAwesome5";
import { NavigationActions } from "react-navigation"
import Colors from "../../styles/Colors";
class NavLeftButton extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    render() {
        const { state, navigation } = this.props;
        return (
            state === undefined ? null :
                state.leftButtonTitle || state.leftButtonIcon ?
                    <TouchableOpacity style={styles.leftContainer} onPress={state.onLeftButtonPress}>
                        {state.leftButtonIcon ?
                            <Image style={styles.image} source={state.leftButtonIcon}></Image> :
                            <Text style={styles.leftTitle}>{state.leftButtonTitle}</Text>
                        }
                    </TouchableOpacity> :
                    <TouchableOpacity style={styles.leftContainer} onPress={() => {
                        navigation.goBack()
                    }}>
                        <Text style={[styles.leftTitle, { color: Colors.button }]}><Icon name="chevron-left" size={16} color={Colors.button}></Icon>{" "}Back</Text>
                    </TouchableOpacity>
        );
    }
}
export default NavLeftButton;
