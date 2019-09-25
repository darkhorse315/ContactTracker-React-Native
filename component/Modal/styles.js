import { StyleSheet , Dimensions} from "react-native";
import Colors from "../../styles/Colors";
export default StyleSheet.create({
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.modalBorder
  },
  textTitle: {
    height: 30,
    textAlign: "left",
    justifyContent: "center",
    paddingHorizontal: 7,
    width: Dimensions.get("window").width - 96
  },
  closeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8
  }
});
