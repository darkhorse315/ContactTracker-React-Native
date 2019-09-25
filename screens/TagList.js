import React from "react";
import { SafeAreaView, Dimensions, Animated, Text, View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { TabView, TabBar, PagerPan } from "react-native-tab-view";
import SendExport from './SendExport';


import { verticalScale, moderateScale } from '../styles/Scaling';
import Colors from '../styles/Colors';
import Fonts from '../styles/Fonts';
import CTContact from '../utils/CTContact';

import { getAllStorageKeys, getStorageInfo, multiGetStorageInfo, setStorageInfo } from "../utils/Storage";
import constant from "../utils/Constant";
import Nav from "../component/nav";
import Icon from "react-native-vector-icons/FontAwesome5"
const initialLayout = {
    height: 0,
    width: Dimensions.get("window").width
};
const routes = [
    { key: "Alphabet", title: "Alphabet" },
    { key: "Sort", title: "Sort Date" }
];
class TagList extends React.PureComponent {
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
    constructor(props) {
        super(props);
        // results 1: loading, 2: no results, 3: found results
        this.state = {
            index: 0,
            routes,
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
            contactTagsSortedByAddedTime: [],
            contactTagsSortedAlphabetically: [],
            selectedTags: [],
            selectedBtnGrpIdx: 1,
        };
        this._onForward = this._onForward.bind(this);
        this.updateBtnGrpIndex = this.updateBtnGrpIndex.bind(this);
        this._isChoosingTagEnabled = true;
        this._navigate = this._navigate.bind(this);
        this._renderItem = this._renderItem.bind(this);
        this._parseByTagResult = this._parseByTagResult.bind(this);
    }
    async componentDidMount() {
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
    }
    async _parseByTagResult() {
        let rows = [];
        let totalFound = 0;
        let settingsObj = await getStorageInfo(constant.KEY_SETTINGS);
        rows = settingsObj.contactTags
        let contactTagsSortedByAddedTime = rows.slice().reverse();
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
                contactTagsSortedByAddedTime, contactTagsSortedAlphabetically
            });
        }
        this.updateBtnGrpIndex(0);
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
        this.forceUpdate()
    }

    _renderItem(key) {
        let color = Colors.secondBlack;
        let name = "circle";
        if (this.state.selectedTags.indexOf(key) > -1) {
            color = Colors.selectGreen;
            name = "check-circle";
        } else {
            color = Colors.secondBlack;
            name = "circle";
        }
        return (
            <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: 'center', paddingHorizontal: 8 }}>
                <Text style={[styles.listItemText, { flex: 7, color }]}>{key}</Text>
                <Icon name={name} color={color} size={20}></Icon>
            </View>
        )
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
    handleTabIndexChange = index => {
        this.setState({ index });
        this.updateBtnGrpIndex(index);
    };
    renderTabLabel = props => ({ route }) => {
        return (
            <Animated.View>
                <Animated.Text
                    style={[
                        { ...Fonts.h8_b },
                        { color: Colors.darkPrimary.heavy }
                    ]}
                >
                    {route.title}
                </Animated.Text>
            </Animated.View>
        );
    };
    renderTabHeader = props => {
        return (
            <TabBar
                {...props}
                style={styles.tabcontainer}
                styles={styles.barStyles}
                indicatorStyle={[styles.indicatorStyle]}
                renderLabel={this.renderTabLabel(props)}
            />
        )
    }
    renderPager = props => <PagerPan {...props} />;
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
            return (
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={styles.container}>
                        <TabView
                            navigationState={this.state}
                            renderScene={() => {
                                return (
                                    <FlatList style={{ marginTop: 16, marginBottom: 30, paddingHorizontal: 16 }}
                                        data={this.state.resultList}
                                        extraData={this.state.selectedTags}
                                        renderItem={
                                            ({ item }) =>
                                                <TouchableOpacity
                                                    contactID={item.val}
                                                    style={[styles.listItemContainer]}
                                                    onPress={() => {

                                                        this._selectedTagChanged(item.key)

                                                    }}
                                                    hitSlop={{ top: 12, left: 36, bottom: 0, right: 0 }}
                                                    underlayColor='#fff'>
                                                    {this._renderItem(item.key)}
                                                </TouchableOpacity>
                                        }
                                    />
                                )
                            }}
                            renderTabBar={this.renderTabHeader}
                            onIndexChange={this.handleTabIndexChange}
                            renderPager={this.renderPager}
                            initialLayout={initialLayout}
                            keyboardDismissMode="on-drag"
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
    },
    tabcontainer: {
        backgroundColor: Colors.grey.veryLight,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 3.00,
        elevation: 3,
    },
    barStyles: {
        height: 42,
    },
    indicatorStyle: {
        backgroundColor: Colors.darkPrimary.heavy,
        height: 2
    }
});
export default TagList;
