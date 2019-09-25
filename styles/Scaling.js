import { Dimensions } from 'react-native';
// import { Base64 } from 'js-base64';
const { width, height } = Dimensions.get('window');

//Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 270;
const guidelineBaseHeight = 500;

const scale = size => width / guidelineBaseWidth * size;
const verticalScale = size => height / guidelineBaseHeight * size;
const moderateScale = (size, factor = 0.5) => size;// + (scale(size) - size) * factor;
const normalize = (size) => Number(Number.parseFloat(size).toFixed(1));

const version = 1.26;
const build = 5;
//
const appName = 'When We Met';
const appNamePart1 = 'When We Met';
const appNamePart2 = 'Context';
const emptyLinesBeforeDelimiter = 5;
const contactNotesDelimiter = '——Contact Context do not change text below——';
const oldContactNotesDelimiter = '——Contact Tracker do not change text below——';

const googleApiKey = 'AIzaSyBt28mmg187wDrqkPQu6YOVrzjq3RrAX_c';
var base64 = require('base-64');
export {
    scale, verticalScale, moderateScale, version, build, normalize,
    emptyLinesBeforeDelimiter,
    contactNotesDelimiter,
    oldContactNotesDelimiter,
    appName, appNamePart1, appNamePart2, googleApiKey
};