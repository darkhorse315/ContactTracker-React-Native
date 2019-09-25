import React from "react";
import { View, Platform } from "react-native";
import Modal from "react-native-modal";
import Colors from "../../styles/Colors";
class ModalCustom extends React.PureComponent {
  render() {
    const { isVisible, onClose, children, style } = this.props;
    return (
      <Modal
        isVisible={isVisible}
        animationIn="slideInDown"
        // animationInTiming={400}
        animationOut="slideOutDown"
        // animationOutTiming={400}
        onBackButtonPress={onClose}
        onBackdropPress={onClose}
        style={[
          {
            width: "95%",
            // maxHeight : '90%',
            marginHorizontal: 10,
            alignItems: 'center'
          },
          style
        ]}
      >
        <View
          style={{
            backgroundColor: Colors.white,
            width: "100%",
            borderRadius: 10,
            paddingBottom: 16
          }}
        >
          {children}
        </View>
      </Modal>
    );
  }
}
export default ModalCustom;
