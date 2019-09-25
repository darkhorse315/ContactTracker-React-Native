import { StyleSheet, Dimensions } from 'react-native';
import Fonts from '../../styles/Fonts';
import Colors from "../../styles/Colors";
export default StyleSheet.create({
  h3: {
    ...Fonts.h3_lineHeight
  },
  h4: {
    ...Fonts.h4_lineHeight
  },
  h5: {
    ...Fonts.h5_lineHeight
  },
  h6: {
    ...Fonts.h6_lineHeight
  },
  h7: {
    ...Fonts.h7_lineHeight
  },
  h8: {
    ...Fonts.h8_lineHeight
  },
  h9: {
    ...Fonts.h9_lineHeight
  },
  h10: {
    ...Fonts.h10_lineHeight
  },
  h11: {
    ...Fonts.h9_lineHeight
  },
  underLine: {
    color: Colors.primary.main,
    textDecorationLine: "underline",
  },
  toggle: {
    paddingHorizontal: 7,
    paddingVertical: 7,
    textAlign: 'center',
    color: Colors.primary.light,
  },
  header: {
    backgroundColor: Colors.primary.light,
    color: Colors.white,
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 10
  },
  subTitle: {
    color: '#fff',
    marginLeft: 7.5
  },
  navHeader: {
    ...Fonts.h4_b,
    color: Colors.heading
  }
});
