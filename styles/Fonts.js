import { StyleSheet } from "react-native";
import { moderateScale, normalize } from "./Scaling";
const fontSize = {
  h3: moderateScale(38),
  h4: moderateScale(27.2),
  h5: moderateScale(24),
  h6: moderateScale(20),
  h7: moderateScale(16),
  h8: moderateScale(14),
  h9: moderateScale(12.8),
  h10: moderateScale(11.4),
  h11: moderateScale(10),
};
const fontWeight = {
  Thin: "100",
  UltraLight: "200",
  Light: "300",
  Regular: "400",
  Medium: "500",
  SemiBold: "600",
  Bold: "700",
  Heavy: "800",
  Black: "900"
};
export const fontFamily = {
  Heavy: "Avenir-Black",
  HeavyItalic: "Avenir-BlackOblique",
  Bold: "Avenir-Heavy",
  BoldItalic: "Avenir-HeavyOblique",
  Medium: "Avenir-Medium",
  MediumItalic: "Avenir-MediumOblique",
  Regular: "Avenir-Book",
  RegularItalic: "Avenir-BookOblique",
  Light: "Avenir-Light",
  LightItalic: "Avenir-LightOblique"
};
export default StyleSheet.create({
  h3: {
    fontFamily: fontFamily.Regular,
    fontWeight: fontWeight.Regular,
    fontSize: fontSize.h3
  },
  h3_s: {
    fontFamily: fontFamily.Heavy,
    fontWeight: fontWeight.Heavy,
    fontSize: fontSize.h3
  },
  h3_b: {
    fontFamily: fontFamily.Bold,
    fontWeight: fontWeight.Bold,
    fontSize: fontSize.h3
  },
  h3_m: {
    fontFamily: fontFamily.Medium,
    fontWeight: fontWeight.Medium,
    fontSize: fontSize.h3
  },
  h3_l: {
    fontFamily: fontFamily.Light,
    fontWeight: fontWeight.Light,
    fontSize: fontSize.h3
  },
  h3_lineHeight: {
    lineHeight: normalize(1.45 * fontSize.h3)
  },
  h4: {
    fontFamily: fontFamily.Regular,
    fontWeight: fontWeight.Regular,
    fontSize: fontSize.h4
  },
  h4_s: {
    fontFamily: fontFamily.Heavy,
    fontWeight: fontWeight.Heavy,
    fontSize: fontSize.h4
  },
  h4_b: {
    fontFamily: fontFamily.Bold,
    fontWeight: fontWeight.Bold,
    fontSize: fontSize.h4
  },
  h4_m: {
    fontFamily: fontFamily.Medium,
    fontWeight: fontWeight.Medium,
    fontSize: fontSize.h4
  },
  h4_l: {
    fontFamily: fontFamily.Light,
    fontWeight: fontWeight.Light,
    fontSize: fontSize.h4
  },
  h4_lineHeight: {
    lineHeight: normalize(1.45 * fontSize.h4)
  },
  h5: {
    fontFamily: fontFamily.Regular,
    fontWeight: fontWeight.Regular,
    fontSize: fontSize.h5
  },
  h5_s: {
    fontFamily: fontFamily.Heavy,
    fontWeight: fontWeight.Heavy,
    fontSize: fontSize.h5
  },
  h5_b: {
    fontWeight: fontFamily.Bold,
    fontWeight: fontWeight.Bold,
    fontSize: fontSize.h5
  },
  h5_m: {
    fontFamily: fontFamily.Medium,
    fontWeight: fontWeight.Medium,
    fontSize: fontSize.h5
  },
  h5_l: {
    fontFamily: fontFamily.Light,
    fontWeight: fontWeight.Light,
    fontSize: fontSize.h5
  },
  h5_lineHeight: {
    lineHeight: normalize(1.45 * fontSize.h5)
  },
  h6: {
    fontFamily: fontFamily.Regular,
    fontWeight: fontWeight.Regular,
    fontSize: fontSize.h6
  },
  h6_s: {
    fontFamily: fontFamily.Heavy,
    fontWeight: fontWeight.Heavy,
    fontSize: fontSize.h6
  },
  h6_b: {
    fontFamily: fontFamily.Bold,
    fontWeight: fontWeight.Bold,
    fontSize: fontSize.h6
  },
  h6_m: {
    fontFamily: fontFamily.Medium,
    fontWeight: fontWeight.Medium,
    fontSize: fontSize.h6
  },
  h6_l: {
    fontFamily: fontFamily.Light,
    fontWeight: fontWeight.Light,
    fontSize: fontSize.h6
  },
  h6_lineHeight: {
    lineHeight: normalize(1.45 * fontSize.h6)
  },
  h7: {
    fontFamily: fontFamily.Regular,
    fontWeight: fontWeight.Regular,
    fontSize: fontSize.h7
  },
  h7_s: {
    fontFamily: fontFamily.Heavy,
    fontWeight: fontWeight.Heavy,
    fontSize: fontSize.h7
  },
  h7_b: {
    fontFamily: fontFamily.Bold,
    fontWeight: fontWeight.Bold,
    fontSize: fontSize.h7
  },
  h7_m: {
    fontFamily: fontFamily.Medium,
    fontWeight: fontWeight.Medium,
    fontSize: fontSize.h7
  },
  h7_l: {
    fontFamily: fontFamily.Light,
    fontWeight: fontWeight.Light,
    fontSize: fontSize.h7
  },
  h7_lineHeight: {
    lineHeight: normalize(1.45 * fontSize.h7)
  },
  h8: {
    fontFamily: fontFamily.Regular,
    fontWeight: fontWeight.Regular,
    fontSize: fontSize.h8
  },
  h8_s: {
    fontFamily: fontFamily.Heavy,
    fontWeight: fontWeight.Heavy,
    fontSize: fontSize.h8
  },
  h8_b: {
    fontFamily: fontFamily.Bold,
    fontWeight: fontWeight.Bold,
    fontSize: fontSize.h8
  },
  h8_m: {
    fontFamily: fontFamily.Medium,
    fontWeight: fontWeight.Medium,
    fontSize: fontSize.h8
  },
  h8_l: {
    fontFamily: fontFamily.Light,
    fontWeight: fontWeight.Light,
    fontSize: fontSize.h8
  },
  h8_lineHeight: {
    lineHeight: normalize(1.45 * fontSize.h8)
  },
  h9: {
    fontFamily: fontFamily.Regular,
    fontWeight: fontWeight.Regular,
    fontSize: fontSize.h9
  },
  h9_s: {
    fontFamily: fontFamily.Heavy,
    fontWeight: fontWeight.Heavy,
    fontSize: fontSize.h9
  },
  h9_b: {
    fontFamily: fontFamily.Bold,
    fontWeight: fontWeight.Bold,
    fontSize: fontSize.h9
  },
  h9_m: {
    fontFamily: fontFamily.Medium,
    fontWeight: fontWeight.Medium,
    fontSize: fontSize.h9
  },
  h9_l: {
    fontFamily: fontFamily.Light,
    fontWeight: fontWeight.Light,
    fontSize: fontSize.h9
  },
  h9_lineHeight: {
    lineHeight: normalize(1.45 * fontSize.h9)
  },
  h10: {
    fontFamily: fontFamily.Regular,
    fontWeight: fontWeight.Regular,
    fontSize: fontSize.h10
  },
  h10_s: {
    fontFamily: fontFamily.Heavy,
    fontWeight: fontWeight.Heavy,
    fontSize: fontSize.h10
  },
  h10_b: {
    fontFamily: fontFamily.Bold,
    fontWeight: fontWeight.Bold,
    fontSize: fontSize.h10
  },
  h10_m: {
    fontFamily: fontFamily.Medium,
    fontWeight: fontWeight.Medium,
    fontSize: fontSize.h10
  },
  h10_l: {
    fontFamily: fontFamily.Light,
    fontWeight: fontWeight.Light,
    fontSize: fontSize.h10
  },
  h10_lineHeight: {
    lineHeight: normalize(1.45 * fontSize.h10)
  },
  h11: {
    fontFamily: fontFamily.Regular,
    fontWeight: fontWeight.Regular,
    fontSize: fontSize.h11
  },
  h11_s: {
    fontFamily: fontFamily.Heavy,
    fontWeight: fontWeight.Heavy,
    fontSize: fontSize.h11
  },
  h11_b: {
    fontFamily: fontFamily.Bold,
    fontWeight: fontWeight.Bold,
    fontSize: fontSize.h11
  },
  h11_m: {
    fontFamily: fontFamily.Medium,
    fontWeight: fontWeight.Medium,
    fontSize: fontSize.h11
  },
  h11_l: {
    fontFamily: fontFamily.Light,
    fontWeight: fontWeight.Light,
    fontSize: fontSize.h11
  },
  h11_lineHeight: {
    lineHeight: normalize(1.45 * fontSize.h11)
  },
});
