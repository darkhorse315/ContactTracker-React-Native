import React from "react";
import { TouchableOpacity, Image, Text } from "react-native";
import styles from "./styles"
class NavRightButton extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    render() {
        const { state } = this.props;        
        return (
            state === undefined ? null :
                state.rightButtonIcon || state.rightButtonTitle ?
                    <TouchableOpacity style={styles.rightContainer} onPress={state.onRightButtonPress}>
                        {state.rightButtonIcon ? <Image style={styles.image} source={state.rightButtonIcon}></Image> : <Text style={styles.rightTitle}>{state.rightButtonTitle}</Text>}
                    </TouchableOpacity> : null

        );
    }
}
export default NavRightButton;
