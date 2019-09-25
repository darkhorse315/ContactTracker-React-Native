import { StyleSheet } from "react-native";
import Colors from "../../../styles/Colors";
import Fonts from "../../../styles/Fonts";
export default StyleSheet.create({
  input: {
    ...Fonts.h7_b,
    textAlign: "left",
    textAlignVertical: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    color: Colors.black,
    borderRadius: 8
  },
  defaultStyle: {
    borderColor: Colors.inputBorder
  },
  validStyle: {
    borderColor: Colors.inputBorder
  },
  focusStyle: {
    borderColor: Colors.primary.main
  },
  label: {
    marginVertical: 8,
    color: Colors.secondBlack,
    ...Fonts.h7_sb
  },
  placeholder: {
    ...Fonts.h7,
    color: Colors.textMuted,
    textAlignVertical: "center",
    paddingBottom: 0,
    paddingTop: 0
  }
});
