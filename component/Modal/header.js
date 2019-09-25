import React from "react";
import { View, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import Label from "../Label";
import styles from "./styles";
import Colors from "../../styles/Colors";
class ModalHeader extends React.PureComponent {
  render() {
    const { title, onClose } = this.props;
    return (
      <View style={styles.headerContainer}>
        <Label size={7} type="bold" style={styles.textTitle} numberOfLines={1}>
          {title}
        </Label>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Icon
            name="times"
            size={20}
            color={Colors.secondBlack}
            light
          />
        </TouchableOpacity>
      </View>
    );
  }
}
export default ModalHeader;
