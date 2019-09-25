import { StyleSheet } from "react-native";
import Colors from "../../../styles/Colors";
import Fonts from "../../../styles/Fonts";
export default StyleSheet.create({
  input: {
    width: "100%",
    ...Fonts.h7,
    textAlignVertical: "center",
    paddingLeft: 0,
    paddingVertical: 8,
    borderBottomWidth: 1,
    color: Colors.inputDark,
    borderBottomColor: Colors.inputBorder
  },
  centerInput: {
    width: "100%",
    ...Fonts.h7,
    textAlign: "center",
    textAlignVertical: "center",
    paddingVertical: 8,
    paddingLeft: 0,
    borderBottomWidth: 1,
    color: Colors.inputDark,
    borderBottomColor: Colors.inputBorder,
    marginBottom: 16
  },
  defaultStyle: {
    borderBottomColor: Colors.inputBorder
  },
  validStyle: {
    borderBottomColor: Colors.btnSecondary
  },
  focusStyle: {
    borderBottomColor: Colors.primary.main
  },
  label: {
    marginVertical: 8
  },
  placeholder: {
    color: Colors.inputDark,
    ...Fonts.h7,
    textAlignVertical: "center",
    paddingBottom: 0,
    paddingTop: 0
  }
});
