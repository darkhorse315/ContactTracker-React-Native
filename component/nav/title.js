import React from "react";
import { Text } from "react-native";
import styles from "./styles"
import Label from "../Label";
class NavText extends React.PureComponent {
    render() {
        const { state, title } = this.props;
        return (            
            <Label size={6} type="bold" style={{textAlign : 'center'}}>{state === undefined ? title : state.title ? state.title : title}</Label>
        );
    }
}
export default NavText;
