import { StyleSheet } from 'react-native';
import { moderateScale, verticalScale } from '../styles/Scaling';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // flexGrow: 1, 
    flexDirection: 'column',
    paddingLeft: 10,
    paddingRight: 10,
    // marginTop: verticalScale(10),
    marginBottom: verticalScale(10),
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: '#FFFFFF',
  },
  appName: {
    fontFamily: 'HelveticaNeue-Light',
    fontSize: moderateScale(16),
    textAlign: 'center',
    margin: 0,
  },
  instructionText: {
    fontFamily: 'HelveticaNeue-Light',
    "color": "#494949",
    fontSize: moderateScale(16),
    // textAlign: 'center',
    "alignSelf": "center",
    marginTop: verticalScale(5),
    marginLeft: 10,
    marginRight: 10
  },
  buttonTextStyle: {
    fontFamily: 'HelveticaNeue-Light',
    color: '#fff',
    fontSize: moderateScale(18),
    textAlign: 'center',
    paddingLeft: 10, paddingRight: 10
  },
  buttonStyle: {

    marginRight: 10,
    marginLeft: 10,
    marginTop: verticalScale(10),
    paddingTop: verticalScale(5),
    paddingBottom: verticalScale(5),
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 10,
    backgroundColor: '#000',
    alignSelf: 'center',
  },
  buttonFullStyle: {
    width: '90%',
  },
  buttonLargeStyle: {
    marginRight: 40,
    marginLeft: 40,
    marginBottom: verticalScale(10),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(8),
    paddingLeft: 25,
    paddingRight: 25,
    borderRadius: 10,
    width: '80%',
  },
  buttonLargeTextStyle: {
    fontSize: moderateScale(24),
    paddingLeft: 12, paddingRight: 12
  },
  settingsButtonTextStyle: {
    fontFamily: 'HelveticaNeue-Light',
    color: '#111', fontSize: moderateScale(16),
    textAlign: 'center', paddingLeft: 10, paddingRight: 10
  },
  settingsButtonStyle: {

    marginRight: 40,
    marginLeft: 40,
    marginTop: verticalScale(10),
    paddingTop: verticalScale(5),
    paddingBottom: verticalScale(5),
    borderRadius: 10,
    backgroundColor: '#eee',
  },
});

export { styles };