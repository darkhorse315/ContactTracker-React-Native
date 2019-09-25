/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Image,
  View,
  ScrollView,
  NativeModules,
  SafeAreaView,
  Dimensions,
  AppState
} from 'react-native';
var Contacts = NativeModules.Contacts;
import { getStorageInfo, setStorageInfo } from "../utils/Storage";
import constant from "../utils/Constant";
import CTContact from '../utils/CTContact';
import { version, build } from '../styles/Scaling';
import { validateSubscribe } from "../utils/InAppUtils";
import { setPostion, openLink, onShowAlert } from "../utils/Utils";
import { styles } from './styles';
import Geocoder from 'react-native-geocoder';
const width = Dimensions.get('window').width;
export default class Splash extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      header: null
    }
  }
  constructor(props) {
    super(props);
    this.setModalVisible = this.setModalVisible.bind(this);
    this.navigate = this.navigate.bind(this);
    this.permissionCheckLocaltion = this.permissionCheckLocaltion.bind(this);
    this.permissionCheckContacts = this.permissionCheckContacts.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.onSelectSubmit = this.onSelectSubmit.bind(this);
    this.onGetStarted = this.onGetStarted.bind(this);
  }
  async componentDidMount() {
    this.permissionCheckLocaltion();
    this.permissionCheckContacts();
  }
  async onGetStarted() {
    let settingsObj = await getStorageInfo(constant.KEY_SETTINGS);
    if (settingsObj === null) {
      settingsObj = {}
      settingsObj.contactTags = ['Friends', 'Work'];
      settingsObj.selectedCalendars = [];
      settingsObj.totalContacts = 0;
      settingsObj.version = version;
      settingsObj.build = build;
      await setStorageInfo(constant.KEY_SETTINGS, settingsObj);
    } else {
      ctContact = new CTContact(-1, '', {});
      ctContact.restoreContacts(null);
    }
    validateSubscribe();
    AppState.addEventListener('change', this._handleAppStateChange);
  }
  _handleAppStateChange = (nextAppState) => {
    if (nextAppState === "active") {
      validateSubscribe();
    }
  };
  navigate(scene) {
    this.props.navigation.navigate(scene);
  }
  async permissionCheckLocaltion() {
    navigator.geolocation.requestAuthorization();
    this.onGetCurrentPosition();
  }
  async permissionCheckContacts() {
    const checkRes = await CTContact.checkContactPermission();
    if (checkRes.error !== null) {
      this.permissionCheckContacts();
    } else if (checkRes.permission === "authorized") {
      this.onGetStarted();
    } else if (checkRes.permission === "denied") {
      onShowAlert(
        "Alert",
        "The app can’t tag your contacts without permission to your contacts. Tap settings and set the permissions and then try again",
        () => { openLink("app-settings:") },
        () => { },
        "Settings");
    } else if (checkRes.permission === "undefined") {
      const deniedPermission = await CTContact.requestContactPermission();
      if (deniedPermission.permission === "authorized") {
        this.onGetStarted();
      } else if (deniedPermission.permission === "denied") {
        onShowAlert(
          "Alert",
          "The app can’t tag your contacts without permission to your contacts. Tap settings and set the permissions and then try again",
          () => { openLink("app-settings:") },
          () => { },
          "Settings");
      }
    }
  }
  onGetCurrentPosition() {
    navigator.geolocation.watchPosition(
      (position) => {
        var contactPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log("current watchPosition", position);
        Geocoder.geocodePosition(contactPosition).then(res => {
          console.log("current watchPosition contactPosition", res);
          setPostion(res.length > 0 ? res[0] : null)
        }).catch((err) => {
          console.log(err);
        });
      },
      (error) => {
        console.log(error);
      },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 1000 },
    );
  }
  onSelectChange = selectedCalendarIDs => {
    this.setState({ selectedCalendarIDs });
  };

  async onSelectSubmit() {
    const { selectedCalendarIDs } = this.state;
    if (selectedCalendarIDs && selectedCalendarIDs.length > 0) {
      let settingsObj = await getStorageInfo(constant.KEY_SETTINGS);
      if (settingsObj != null) {
        settingsObj.selectedCalendars = selectedCalendarIDs;
        await setStorageInfo(constant.KEY_SETTINGS, settingsObj);
        this.setState({
          chooseCalendarsModalVisible: false,
        }, function () {
          ctContact = new CTContact(-1, '', {});
          ctContact.restoreContacts(this.setModalVisible)
        }.bind(this));
      } else {
      }
    }
  }
  setModalVisible(visible, text) {
    setTimeout(() => {
      this.navigate("MainScene");
    }, 1000);
  }
  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.scrollContainer}>
          <View style={{ flex: 1, width: '100%', marginTop: '60%' }}>
            <Image style={{ alignSelf: 'center' }} width={width * 0.45} height={width * 0.45} source={require('../img/icon.png')} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}