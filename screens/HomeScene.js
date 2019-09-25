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
  StyleSheet
} from 'react-native';
import { onShowAlert, getPosition, setPostion } from "../utils/Utils";
import SystemSetting from "react-native-system-setting";
import { NavigationEvents } from "react-navigation";
const ContactsWrapper = NativeModules.ContactsWrapper;
import CTContact from '../utils/CTContact';
import { verticalScale, appNamePart1 } from '../styles/Scaling';
import { styles as globalStyles } from './styles';
import BtnElement from "../component/button/element";

import { getStorageInfo, setStorageInfo } from "../utils/Storage";
import constant from "../utils/Constant";
import { getRemainday } from "../utils/Firebase";
import Nav from "../component/nav";
import Label from '../component/Label';
import Fonts from '../styles/Fonts';
import Colors from '../styles/Colors';
import Indicator from '../component/Indicator';

export default class HomeScene extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      headerTitle: <Nav.NavTitle state={params} title="When We Met"></Nav.NavTitle>,
      headerRight: (
        <Nav.NavRightBtn state={params}></Nav.NavRightBtn>
      ),
      headerLeft: (
        <Nav.NavLeftBtn state={params} navigation={navigation}></Nav.NavLeftBtn>
      )
    }
  }
  constructor(props) {
    super(props);
    this.items = [];
    this.state = {
      locationError: null,
      modalVisible: false,
      firstRun: this.props.navigation.getParam('firstRun'),
      selectedCalendarIDs: [],
      addedContactID: null,
      isLoading: false,
      loadingText: '',
      inappunlocked: false,
      totalContacts: 0,
      rated: false,
      start_trial_ms: null,
      transaction_id: null
    }
    this._onForward = this._onForward.bind(this);
    this._navigate = this._navigate.bind(this);
    this.onReload = this.onReload.bind(this);
  }
  async componentDidMount() {
    const inappunlocked = await getStorageInfo(constant.KEY_IN_APP_UNLOCKED);
    this.setState({ inappunlocked: inappunlocked === null ? false : inappunlocked })

    const rated = await getStorageInfo(constant.KEY_RATE);
    this.setState({ rated: rated === null ? false : rated })
    const settingsObj = await getStorageInfo(constant.KEY_SETTINGS);
    if (settingsObj === null) {
      this.setState({
        firstRun: true
      })
    }
    this.setState({ totalContacts: settingsObj.totalContacts });

    const start_trial_ms = await getStorageInfo(constant.ORIGIN_PURCHASE_DATE_MS);
    const transaction_id = await getStorageInfo(constant.TRANSACTION_ID);
    console.log("start_trial_ms", start_trial_ms, transaction_id);
    this.setState({
      start_trial_ms, transaction_id
    });
  }

  onReload = async navigationEvent => {
    if (navigationEvent.type == "didFocus") {
      const start_trial_ms = await getStorageInfo(constant.ORIGIN_PURCHASE_DATE_MS);
      const transaction_id = await getStorageInfo(constant.TRANSACTION_ID);
      console.log("start_trial_ms", start_trial_ms, transaction_id);
      this.setState({
        start_trial_ms, transaction_id
      })
    }
  };

  onSelectedItemsChange = selectedCalendarIDs => {
    this.setState({ selectedCalendarIDs });
  };

  _navigate(scaneName, passProps) {
    this.props.navigation.navigate(scaneName, passProps);
  }
  _onForward(listType, contactID) {
    let title = 'City List';
    let index = this.props.navigation.getParam('index');
    let nextIndex = ++index;
    if (listType == 8) {
      title = 'Help';
      const passProps = { title: title };
      this._navigate("HelpScene", passProps);
    } else if (listType == 4) {
      // settings screen
      title = 'Settings';
      const passProps = { title: title };
      this._navigate("SettingsScene", passProps);

    } else if (listType == 6) {
      title = 'Add Tag';
      const passProps = { title: title, contactID: contactID };
      this._navigate("ContactTagScene", passProps);
    } else {
      let passProps = { index: nextIndex, title: title, listType: listType };
      // CityListScene     
      if (listType == 2) {
        passProps.title = "By Event";
      } else if (listType == 7) {
        let passProps1 = { index: 1, firstRun: this.state.firstRun, showExport: true, title: 'All Contacts', };
        this._navigate('AllContactListScene', passProps1)
        return;
      } else if (listType == 3) {
        passProps.title = "By Date";
      } else if (listType == 5) {
        passProps.title = "By Tag";
        passProps.rightButtonTitle = 'View';
        passProps.onRightButtonPress = () => {
        };
        this._navigate('TagListScene', passProps);
        return;
      }
      this._navigate('CityListScene', passProps);
    }
  }

  _saveContact = (contactID, contactName) => {

    this.setState({ isLoading: true, locationError: null, loadingText: "Adding contact..." });

    let dateTimeNow = new Date();
    let offsetInHours = dateTimeNow.getTimezoneOffset() / 60;
    let d = new Date();
    d.setHours(d.getHours() + offsetInHours);

    let contactInfo =
    {
      "contactID": contactID,
      "latitude": null,
      "longitude": null,
      "geocodePosition": null,
      "city": 'Not set',
      "fullName": contactName,
      "emailAddresses": [],
      "phoneNumbers": [],
      "tag": false,
      tagList: [],
      "createdAt": Date.now(),
      "createdYear": d.getFullYear(),
      "createdMonth": d.getMonth() + 1,
      event: false,
      eventList: []
    };
    const currentLocation = getPosition();
    console.log('home currentLocation', currentLocation);
    if (currentLocation === null) {
      this._saveContactToApp(contactInfo, d, contactID, contactName);
    } else {
      contactInfo.latitude = currentLocation.position.lat;
      contactInfo.longitude = currentLocation.position.lng;
      contactInfo.geocodePosition = currentLocation;
      contactInfo.city = currentLocation.locality;
      this._saveContactToApp(contactInfo, d, contactID, contactName);
    }
  }

  async _saveContactToApp(contactInfo, contactDate, contactID, contactName) {
    const settingsObj = await getStorageInfo(constant.KEY_SETTINGS);
    if (settingsObj !== null) {
      let totalContacts = settingsObj.totalContacts ? settingsObj.totalContacts + 1 : 1;
      settingsObj.totalContacts = totalContacts;
      await setStorageInfo(constant.KEY_SETTINGS, settingsObj);
      this.setState({ totalContacts: settingsObj.totalContacts });
      ctContact = new CTContact(contactID, contactName);
      ctContact.saveContact(contactInfo, contactDate, totalContacts, this.saveContactResult.bind(this));
    } else {
      this.setState({
        locationError: 'Error adding contact',
        isLoading: false,
        loadingText: ''
      }, () => setTimeout(() => onShowAlert('Error', 'Error adding contact'), 250));
    }
  }

  saveContactResult(success, contactInfo, error) {
    this.setState({ isLoading: false, loadingText: '' }, () => {
      if (success) {
        setTimeout(() =>
          onShowAlert(
            'Contact Added!',
            'Add tag for this contact?',
            () => this._onForward(6, contactInfo.contactID),
            () => { },
            'Add Tag',
            "Skip"
          ), 10);
      } else {
        setTimeout(() => onShowAlert('Error', error), 10);
      }
    });
  }
  render() {
    const { start_trial_ms, transaction_id } = this.state;
    let remainDays = undefined;
    if (start_trial_ms) {
      remainDays = constant.FREE_TRIAL_DAYS - getRemainday(start_trial_ms);
    }
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={[globalStyles.container, { paddingHorizontal: 24 }]} contentContainerStyle={styles.container}>
          <View style={styles.innerContainer}>
            <View style={styles.imageContainer}>
              <Image style={styles.image} source={require('../img/icon.png')} />
            </View>
            <BtnElement
              backgroundColor={Colors.darkPrimary.black}
              marginTop={36}
              iconName="add"
              title='Add Contact'
              onPress={() => {
                SystemSetting.isLocationEnabled().then((enable) => {
                  if (enable) {
                    ContactsWrapper.getEmail()
                      .then((email) => {
                        this._saveContact(email.identifier, email.name);
                      })
                      .catch((error) => {
                        console.log("ERROR MESSAGE: ", error.message);
                      });
                  } else {
                    onShowAlert('Are you sure?',
                      'When We Met works best when you share your location so we can auto tag your city when you add a contact. You can set this now by tapping settings below, or set it later in your system settings.',
                      () => {
                        openLink("app-settings:")
                      }, () => {
                        ContactsWrapper.getEmail()
                          .then((email) => {
                            this._saveContact(email.identifier, email.name);
                          })
                          .catch((error) => {
                            console.log("ERROR MESSAGE: ", error.message);
                          });
                      }, 'Settings', 'Add Later')
                  }
                });
              }} />
            <Label size={7} style={{ textAlign: 'center', marginTop: 16 }}>View Contacts:</Label>
            <BtnElement
              backgroundColor={Colors.darkPrimary.heavy}
              iconName='people'
              title='All Contacts'
              onPress={() => { this._onForward(7); }} />
            <BtnElement
              backgroundColor={Colors.darkPrimary.main}
              iconName="location-city"
              title='By City'
              onPress={() => { this._onForward(1); }} />
            <BtnElement
              backgroundColor={Colors.darkPrimary.light}
              iconName="date-range"
              title='By Date'
              onPress={() => { this._onForward(3); }} />
            <BtnElement
              backgroundColor={Colors.darkPrimary.ultraLight}
              iconName="local-offer"
              title='By Tag'
              onPress={() => { this._onForward(5); }} />
            <View style={styles.bottomContainer}>
              <BtnElement
                backgroundColor={Colors.grey.medium}
                iconName="settings"
                title='Settings  '
                onPress={() => { this._onForward(4); }} />
              <BtnElement
                backgroundColor={Colors.grey.medium}
                iconName="help"
                title='Help    '
                onPress={() => { this._onForward(8); }} />
            </View>
            {
              start_trial_ms !== null && transaction_id === null && (
                <Label size={7} style={styles.bottomLabel} color={Colors.primary.main} onPress={() => {
                  this.props.navigation.navigate("PaymentScene", {});
                }}>
                  You have {remainDays} {constant.UNIT_TRIAL}s left in your {constant.FREE_TRIAL_DAYS} {constant.UNIT_TRIAL} free trial. Upgrade now!
                </Label>
              )
            }
          </View>
          <Indicator visible={this.state.isLoading} text={this.state.loadingText}></Indicator>
        </ScrollView >
        <NavigationEvents onDidFocus={this.onReload} />
      </SafeAreaView >
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    flexGrow: 1
  },
  innerContainer: {
    marginTop: verticalScale(16),
    paddingBottom: 30
  },
  imageContainer: {
    marginTop: verticalScale(8),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottomContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-evenly",
    marginTop: 16
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: 'contain'
  },
  bottomLabel: {
    marginTop: 16,
    paddingHorizontal: 24,
    textAlign: 'center'
  }
});

