import React from 'react';
import { SafeAreaView, DatePickerIOS, Text, View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { moderateScale, verticalScale } from '../styles/Scaling';
import SendExport from './SendExport';
import { ButtonGroup } from 'react-native-elements';
import BtnElement from "../component/button/element";
import Label from '../component/Label';
import { getAllStorageKeys, getStorageInfo, multiGetStorageInfo, restoreAllKeys } from "../utils/Storage";
import constant from "../utils/Constant";
import Nav from "../component/nav";
import Colors from '../styles/Colors';
import Icon from "react-native-vector-icons/FontAwesome5"
import Fonts from '../styles/Fonts';
export default class CityListScene extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      headerTitle: <Nav.NavTitle state={params} title="Cities"></Nav.NavTitle>,
      headerRight: (
        <Nav.NavRightBtn state={params}></Nav.NavRightBtn>
      ),
      headerLeft: (
        <Nav.NavLeftBtn state={params} navigation={navigation}></Nav.NavLeftBtn>
      )
    }
  }
  constructor(props, context) {
    super(props, context);
    // results 1: loading, 2: no results, 3: found results
    this.state = {
      resultList: [{ key: "Loading..." }],
      results: 1,
      startDate: new Date(),
      showStartDatePicker: false,
      startButtonTitle: "Start",
      endDate: new Date(),
      showEndDatePicker: false,
      endButtonTitle: "End",
      // contactIDs will be used to export from ContactList.js
      contactIDs: [],
      // will be used for listType 5 where multiple tags can be selected
      contactTagsSortedByAddedTime: [],
      contactTagsSortedAlphabetically: [],
      selectedTags: [],
      selectedBtnGrpIdx: 1,
    };
    this._onForward = this._onForward.bind(this);
    this.updateBtnGrpIndex = this.updateBtnGrpIndex.bind(this);
    this._isChoosingTagEnabled = true;
    this._navigate = this._navigate.bind(this);
  }
  async componentDidMount() {
    if (this.props.navigation.getParam('listType') == 5) {
      let passProps = {
        index: this.props.navigation.getParam('index'),
        title: 'By Tag',
        listType: this.props.navigation.getParam('listType')
      };
      passProps.rightButtonTitle = 'View';
      passProps.onRightButtonPress = () => {
        if (this.state.selectedTags.length > 0) {
          this._onForward(this.state.selectedTags);
        }
      };
      this.props.navigation.setParams(passProps);
      this._parseByTagResult();

    } else if (this.props.navigation.getParam('listType') == 7) {

    } else {
      let keys = await restoreAllKeys();
      // 2541D17B-B6F0-4EAF-BB75-8353D1D67B57:ABPerson      
      if (keys.length == 0) {
        this.setState({ results: 2 });
      } else {
        switch (this.props.navigation.getParam('listType')) {
          case 1:
            this._parseCitiesResult(keys);
            break;
          case 2:
            this._parseEventsResult(keys);
            break;
          case 3:
            this._parseByAddedTimeResult(keys);
            break;
        }
      }
    }
    this._renderItem = this._renderItem.bind(this);
  }
  async _parseCitiesResult(keys) {
    const rows = [];
    let totalFound = 0;
    keys.forEach(async (key) => {
      let contactInfoJson = await getStorageInfo(key);
      totalFound++;
      if (contactInfoJson.city != undefined) {
        rows.push(contactInfoJson.city);
        if (totalFound == keys.length) {
          let unique = [...new Set(rows)].sort();
          let reformattedArray = unique.map(function (obj) {
            return { "key": obj };
          });
          if (reformattedArray.length == 0) {
            this.setState({ resultList: reformattedArray, results: 2 });
          } else {
            this.setState({ resultList: reformattedArray, results: 3 });
          }
        }
      }
    });
  }

  async _parseByTagResult() {
    let rows = [];
    let totalFound = 0;
    let settingsObj = await getStorageInfo(constant.KEY_SETTINGS);
    rows = settingsObj.contactTags
    let contactTagsSortedByAddedTime = rows.slice();
    let contactTagsSortedAlphabetically = rows.slice().sort(function (a, b) {
      var nameA = a.toLowerCase(), nameB = b.toLowerCase();
      if (nameA < nameB) //sort string ascending
        return -1;
      if (nameA > nameB)
        return 1;
      return 0; //default return value (no sorting)
    });
    //
    let reformattedArray = rows.map(function (obj) {
      return { "key": obj };
    });
    if (reformattedArray.length == 0) {
      this.setState({ resultList: reformattedArray, results: 2 });
    } else {
      this.setState({
        resultList: reformattedArray, results: 3,
        contactTagsSortedByAddedTime: contactTagsSortedByAddedTime, contactTagsSortedAlphabetically: contactTagsSortedAlphabetically
      });
    }
  }

  async _parseEventsResult(keys) {

    const rows = [];
    let totalFound = 0;
    let stores = await multiGetStorageInfo(keys);
    stores.map((result, i, store) => {
      // get at each store's key/value so you can work with it
      let key = store[i][0];
      let contactInfo = store[i][1];
      if (JSON.parse(contactInfo).event) {
        let eventTitles = JSON.parse(contactInfo).eventList.map(event => event.title);
        rows.push.apply(rows, eventTitles);
      }
    });
    let unique = [...new Set(rows)].sort();
    let reformattedArray = unique.map(function (obj) {
      return { "key": obj };
    });
    if (reformattedArray.length == 0) {
      this.setState({ resultList: reformattedArray, results: 2 });
    } else {
      this.setState({ resultList: reformattedArray, results: 3 });
    }
  }
  _getMonthName(month) {
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1];
  }
  async _parseByAddedTimeResult(keys) {
    const rows = [];
    let monthYearList = [];
    let totalFound = 0;
    let reformattedArray = [];
    keys.forEach(async (key) => {
      let contactInfoObj = await getStorageInfo(key);
      totalFound++;
      if (contactInfoObj.createdYear != undefined && contactInfoObj.createdMonth != undefined) {
        let createdAt = contactInfoObj.createdAt;
        let createdYear = contactInfoObj.createdYear;
        let createdMonth = contactInfoObj.createdMonth;
        let item = this._getMonthName(createdMonth) + ' ' + createdYear;
        rows.push(createdAt);
        monthYearList[createdAt] = item;
        if (totalFound == keys.length) {
          rows.sort();
          let unique = new Set();
          rows.forEach((timestamp) => {
            monthYear = monthYearList[timestamp];
            if (!unique.has(monthYear)) {
              unique.add(monthYear);
              reformattedArray.push({ "key": monthYearList[timestamp] });
            }
          });
          //
          if (reformattedArray.length == 0) {
            this.setState({ resultList: reformattedArray, results: 2 });
          } else {
            this.setState({ resultList: reformattedArray, results: 3 });
          }
        }
      }
    });
  }

  _navigate(scaneName, passProps) {
    this.props.navigation.navigate(scaneName, passProps);
  }
  updateContactIDsFromChild(contactIDs) {
    this.setState({ contactIDs: contactIDs });
  }

  _selectedTagChanged(pressedTag) {
    this._isChoosingTagEnabled = false;
    let selectedTags = this.state.selectedTags;
    let idx = selectedTags.indexOf(pressedTag);
    if (idx > -1) {
      selectedTags.splice(idx, 1);
    } else {
      selectedTags.push(pressedTag);
    }
    this.setState({ selectedTags: selectedTags }, () => { this._isChoosingTagEnabled = true; });
  }

  _renderItem(key) {
    if (this.props.navigation.getParam('listType') == 5) {
      if (this.state.selectedTags.indexOf(key) > -1) {
        return (
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'center' }}>
            <Text style={[styles.listItemText, { color: '#1A1' }]}>{key}</Text>
            <Icon name="check" color="#1A1" size={16}></Icon>
          </View>
        );
      } else {
        return <Text style={styles.listItemText}>{key}</Text>;
      }
    } else {
      return <Text style={styles.listItemText}>{key}</Text>;
    }
  }

  _onForward(searchTerm, isDateRange, startDate, endDate) {
    let title = null;
    if (this.props.navigation.getParam('listType') == 5) {
      if (searchTerm.length > 1) {
        title = 'By Tags';
      } else {
        title = searchTerm[0];
      }
    } else {
      title = searchTerm;
    }
    let index = this.props.navigation.getParam('index');
    let nextIndex = ++index;
    let passProps = {
      index: nextIndex,
      listType: this.props.navigation.getParam('listType'),
      searchTerm: searchTerm,
      isDateRange: isDateRange ? true : false,
      startDate: startDate,
      endDate: endDate,
      updateContactIDsFromChild: this.updateContactIDsFromChild.bind(this),
      title: title,
      rightButtonTitle: 'Export',
      onRightButtonPress: () => {
        if (this.state.contactIDs.length > 0) {
          sendExport = new SendExport();
          sendExport.createExportFile(this.state.contactIDs);
        }
      }
    };
    this._navigate('ContactListScene', passProps);
  }

  updateBtnGrpIndex(selectedBtnGrpIdx) {

    this.setState({ selectedBtnGrpIdx });
    let rows = [];
    if (selectedBtnGrpIdx == 0) {
      // A-Z
      rows = this.state.contactTagsSortedAlphabetically;
    } else {
      rows = this.state.contactTagsSortedByAddedTime;
    }
    let reformattedArray = rows.map(function (obj) {
      return { "key": obj };
    });
    if (reformattedArray.length == 0) {
      this.setState({ resultList: reformattedArray, results: 2 });
    } else {
      this.setState({ resultList: reformattedArray, results: 3 });
    }
  }

  _getBtnGrp() {
    const buttons = ['A-Z', 'Latest first']
    const { selectedBtnGrpIdx } = this.state
    return <ButtonGroup
      onPress={this.updateBtnGrpIndex}
      selectedIndex={selectedBtnGrpIdx}
      buttons={buttons}
      containerStyle={{ height: 50 }}
    />
  }

  render() {
    if (this.state.results == 1) {
      return (
        <View style={{ marginTop: 80, alignItems: 'center', justifyContent: 'center' }}><Text style={styles.noContactsText}>Loading...</Text></View>
      );
    } else if (this.state.results == 2) {
      return (
        <View style={{ marginTop: 80, alignItems: 'center', justifyContent: 'center' }}><Text style={styles.noContactsText}>No Results</Text></View>
      );
    } else {
      let showDatePicker = null;
      let btnGrp = null;
      if (this.props.navigation.getParam('listType') == 5) {
        // By Tag
        btnGrp = this._getBtnGrp();
      }
      else if (this.props.navigation.getParam('listType') == 3) {

        showDatePicker = <View style={styles.datePickerCollapsedContainer}>
          <View>
            <Label size={7} style={{ marginTop: 16, textAlign: 'center' }} color={'#1CAADE'} onPress={() => {
              this.setState({ showStartDatePicker: !this.state.showStartDatePicker });
            }}>{"Start " + this.state.startDate.toDateString()} </Label>

            <Label size={7} style={{ marginTop: 10, textAlign: 'center' }} color={'#1CAADE'} onPress={() => {
              this.setState({ showEndDatePicker: !this.state.showEndDatePicker });
            }}>{"End " + this.state.endDate.toDateString()}</Label>

            <BtnElement
              iconName="timer"
              title='Show  '
              onPress={() => {
                let start = new Date(this.state.startDate.getTime());
                start.setHours(0, 0, 0, 0);

                let end = new Date(this.state.endDate.getTime());
                end.setHours(23, 59, 59, 999);
                this._onForward(this.state.startDate.toDateString(), true, start.getTime(), end.getTime());
              }} />
          </View>

        </View>;

        if (this.state.showStartDatePicker) {
          return (
            <View style={styles.container}>
              <View style={styles.datePickerContainer}>
                <DatePickerIOS
                  date={this.state.startDate}
                  onDateChange={date => this.setState({ startDate: date })}
                  mode="date"
                />
                <BtnElement
                  iconName="timer"
                  title='Set  '
                  onPress={() => { this.setState({ showStartDatePicker: !this.state.showStartDatePicker }); }} />
              </View>
            </View>
          )
        } else if (this.state.showEndDatePicker) {
          return (
            <View style={styles.container}>
              <View style={styles.datePickerContainer}>
                <BtnElement
                  iconName="timer"
                  title='Set  '
                  onPress={() => {
                    this.setState({ showEndDatePicker: !this.state.showEndDatePicker });
                  }} />
                <DatePickerIOS
                  date={this.state.endDate}
                  onDateChange={date => this.setState({ endDate: date })}
                  mode="date"
                />
              </View>
            </View>
          )
        }
      }
      return (
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.container}>
            {showDatePicker}
            {btnGrp}
            <FlatList style={{ marginTop: 16, marginBottom: 30 }}
              data={this.state.resultList}
              renderItem={
                ({ item }) =>
                  <TouchableOpacity
                    contactID={item.val}
                    style={[styles.listItemContainer]}
                    onPress={() => {
                      this._onForward(item.key);
                    }}
                    hitSlop={{ top: 12, left: 36, bottom: 0, right: 0 }}
                    underlayColor='#fff'>
                    {this._renderItem(item.key)}
                  </TouchableOpacity>
              }
            />
          </View>
        </SafeAreaView>
      )
    }
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingBottom: verticalScale(30),
    paddingHorizontal: 16
  },
  datePickerCollapsedContainer: {
    marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'
  },
  datePickerContainer: {
    marginTop: 10
  },
  button: {
    alignItems: 'center',
  },
  buttonTextStyle: {
    fontFamily: 'HelveticaNeue-Light',
    color: '#fff', fontSize: moderateScale(18),
    textAlign: 'center', paddingLeft: 10, paddingRight: 10
  },
  buttonStyle: {

    marginRight: 5,
    marginLeft: 5,
    marginTop: verticalScale(10),
    paddingTop: verticalScale(5),
    paddingBottom: verticalScale(5),
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 10,
    // width: '50%',
    backgroundColor: '#000',
  },
  listItemContainer: {
    marginBottom: verticalScale(5),
    borderBottomColor: '#AAA',
    borderBottomWidth: 1,
    paddingTop: verticalScale(5),
    paddingBottom: verticalScale(5),
  },
  listItemText: {
    ...Fonts.h7_m,
    paddingRight: 10,
    color: Colors.secondBlack,
  },
  noContactsText: {
    color: '#AAA',
    fontSize: moderateScale(20)
  }
});