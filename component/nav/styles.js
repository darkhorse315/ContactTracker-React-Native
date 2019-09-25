import { StyleSheet, Dimensions } from "react-native";
import Fonts from "../../styles/Fonts";
export default StyleSheet.create({
    title: {
        fontSize: 22,
        color: "black",
        textAlign: 'center',
    },
    image: {
        width: 16,
        height: 16,
    },
    leftTitle: {
        ...Fonts.h7,
        color: "black",        
        textAlign: 'left'
    },
    rightTitle: {
        ...Fonts.h7,
        color: "black",        
        textAlign: 'right'
    },
    leftContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginLeft: 16
    },
    rightContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginRight: 16
    },
});
