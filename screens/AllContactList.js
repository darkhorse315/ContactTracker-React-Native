import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    SectionList,
    NativeModules,
    SafeAreaView
} from 'react-native';
import SystemSetting from "react-native-system-setting";
import { NavigationEvents } from "react-navigation";
const ContactsWrapper = NativeModules.ContactsWrapper;
import { Icon, SearchBar } from 'react-native-elements';
import CTContact from '../utils/CTContact';
import { moderateScale, verticalScale } from '../styles/Scaling';
import AlphabetListView from 'react-native-alphabetlistview';
import { getAllStorageKeys, getStorageInfo, setStorageInfo, multiRemoveStorageInfo, restoreAllKeys } from "../utils/Storage";
import { onShowAlert, getPosition, setPostion } from "../utils/Utils";
import constant from "../utils/Constant";
import Nav from "../component/nav";
import Label from "../component/Label";
import Colors from '../styles/Colors';
import Fonts from '../styles/Fonts';
import Indicator from '../component/Indicator';
export default class AllContactListScene extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const { params } = navigation.state;
        return {
            headerTitle: <Nav.NavTitle state={params} title="All Contacts"></Nav.NavTitle>,
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
        this.state = {
            constactList: [{ key: "Loading..." }],
            results: 1,
            contactIds: [],
            fullData: [],
            sectionListData: [],
            matchingSectionListData: [],
            firstRun: false,
            isLoading: false,
            locationError: null,
            loadingText: "",
            data: {},
            showExport: false,
            showAlpha: true,
            inappunlocked: false,
            totalContacts: 0,
            rated: false,
            searchText: ""
        };
        this._navigate = this._navigate.bind(this);
        this.onStart = this.onStart.bind(this);
        this.onRestore = this.onRestore.bind(this);
        this.onReload = this.onReload.bind(this);
        this.setVisible = this.setVisible.bind(this);
        this._editAppContact = this._editAppContact.bind(this);
        this._editPhoneContact = this._editPhoneContact.bind(this);
    }

    async componentDidMount() {
        this.onStart();
        this.onRestore(true);
    }
    async  onStart() {
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

        if (this.state.showAlpha) {
            CTContact.getAllDataAndContactIdsAlphabetList().then((dataAndContactIds) => {
                this.setState({ fullData: dataAndContactIds[0], data: dataAndContactIds[0], contactIds: dataAndContactIds[1] });
            });
        } else {
            CTContact.getAllDataAndContactIds().then((dataAndContactIds) => {
                this._populateList(dataAndContactIds[0], null);
            }).catch(error => {
                console.log(error);
                onShowAlert("Error", "Error getting contacts")
            });
        }
        const rightIcon = require('../img/plus-48.png');
        const passProps = {
            title: "All Contacts",
            tintColor: '#0000FF',
            rightButtonIcon: rightIcon,
            index: 1, firstRun: this.state.firstRun, showExport: false,
        };
        passProps.leftButtonTitle = 'Home';
        passProps.rightButtonTitle = "➕";
        passProps.onLeftButtonPress = () => {
            const passProps = {
                title: 'When We Met',
                index: 2,
                navigationBarHidden: true,
            };
            this._navigate('HomeScene', passProps);

        };
        passProps.onRightButtonPress = () => {
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

        };
        this.props.navigation.setParams(passProps);
    }
    async onRestore(loading) {
        this.setState({ isLoading: true, loadingText: "Rescan contact..." });
        let keys = await restoreAllKeys();
        console.log("Restore all keys", keys);
        await multiRemoveStorageInfo(keys)
        ctContact = new CTContact(-1, '', {});
        ctContact.restoreContacts(this.setVisible);
    }
    setVisible() {
        setTimeout(() => {
            this.setState({ isLoading: false });
        }, 1000);
    }
    onReload = navigationEvent => {
        if (navigationEvent.type == "didFocus") {
            this.onStart();
        }
    };
    _navigate(scaneName, passProps) {
        this.props.navigation.navigate(scaneName, passProps);
    }
    _populateList(data, filteredData) {
        let dataWithItems = [];
        let contactIds = [];
        if (filteredData == null) {
            data.forEach(dataItem => {
                if (dataItem.data.length > 0) {
                    dataWithItems.push(dataItem);
                    dataItem.data.forEach(contactIdAndName => {
                        contactIds.push(contactIdAndName.key);
                    });
                }
            });
        } else {
            filteredData.forEach(dataItem => {
                if (dataItem.data.length > 0) {
                    dataWithItems.push(dataItem);
                    dataItem.data.forEach(contactIdAndName => {
                        contactIds.push(contactIdAndName.key);
                    });
                }
            });
        }
        if (dataWithItems.length > 0) {
            this.setState({ results: 3, fullData: data, sectionListData: dataWithItems, contactIds: contactIds });
        } else {
            this.setState({ results: 2 });
        }
    }

    _searchTextChange = (text) => {
        this.setState({
            searchText: text
        });
        if (this.state.showAlpha) {
            if (text.length > 0) {
                CTContact.getContactsByMatchingStringAlphabetList(this.state.fullData, text).then((filteredDataAndContactIds) => {
                    this.setState({ data: filteredDataAndContactIds.filteredData, contactIds: filteredDataAndContactIds.contactIds });
                });
            } else {
                this.setState({ data: this.state.fullData });
            }
        } else {
            if (text.length > 0) {
                CTContact.getContactsByMatchingString(this.state.fullData, text).then((filteredDataAndContactIds) => {
                    this._populateList(this.state.fullData, filteredDataAndContactIds.filteredDataItems);
                });
            } else {
                this._populateList(this.state.fullData, null);
            }
        }
    }

    _saveContact = (contactID, contactName) => {
        console.log("_saveContact ", contactID, contactName);
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
        let currentLocaltion = getPosition();
        console.log('all contact currentLocation', currentLocaltion);
        if (currentLocaltion === null) {
            this._saveContactToApp(contactInfo, d, contactID, contactName);
        } else {
            contactInfo.latitude = currentLocaltion.position.lat;
            contactInfo.longitude = currentLocaltion.position.lng;
            contactInfo.geocodePosition = currentLocaltion;
            contactInfo.city = currentLocaltion.locality;
            this._saveContactToApp(contactInfo, d, contactID, contactName);
        }
    }

    async _saveContactToApp(contactInfo, contactDate, contactID, contactName) {
        try {
            const settingsObj = await getStorageInfo(constant.KEY_SETTINGS);
            let totalContacts = settingsObj.totalContacts ? settingsObj.totalContacts + 1 : 1;
            settingsObj.totalContacts = totalContacts;
            await setStorageInfo(constant.KEY_SETTINGS, settingsObj)
            this.setState({ totalContacts: settingsObj.totalContacts });
            ctContact = new CTContact(contactID, contactName);
            ctContact.saveContact(contactInfo, contactDate, totalContacts, this.saveContactResult.bind(this));
        } catch (error) {
            this.setState({
                locationError: error.message || 'Error adding contact',
                isLoading: false,
                loadingText: ''
            }, () => setTimeout(() => onShowAlert("Error", 'Error adding contact'), 10));
        }
    }

    saveContactResult(success, contactInfo, error) {
        console.log("saveContactResult ", success, contactInfo, error);
        this.setState({ isLoading: false, loadingText: '' }, () => {
            if (success) {
                if (this.state.showAlpha) {
                    CTContact.getAllDataAndContactIdsAlphabetList().then((dataAndContactIds) => {
                        this.setState({ fullData: dataAndContactIds[0], data: dataAndContactIds[0], contactIds: dataAndContactIds[1] });
                    });
                } else {
                    CTContact.getAllDataAndContactIds().then((dataAndContactIds) => {
                        this._populateList(dataAndContactIds[0], null);
                    });
                }
                setTimeout(() =>
                    onShowAlert('Contact Added!',
                        'Add tag for this contact?',
                        () => {
                            const passProps = { title: "Add Tag", contactID: contactID }
                            this._navigate('ContactTagScene', passProps);
                        }, () => { }, 'Add Tag', 'Skip')
                    , 100);
            } else {
                setTimeout(() => onShowAlert("Error", error), 100);
            }
        });
    }

    async _editPhoneContact(contactID) {
        ContactsWrapper.editContact(contactID)
            .then(async (contact) => {
                let contactInfoObj = await getStorageInfo(contactID);
                contactInfoObj.fullName = contact.name;
                await setStorageInfo(contactID, contactInfoObj)
            })
            .catch(async (error) => {
                this.onRestore(false);
                if (error.code == "E_CONTACT_EXCEPTION") {
                    onShowAlert('Error', 'Couldn\'t find contact')
                }
            });
    }

    _editAppContact(contactId, contactFullName) {
        const passProps = { title: 'Edit Contact', contactId: contactId, contactFullName: contactFullName }
        this._navigate('EditContactScene', passProps)
    }

    _renderSectionHeader = ({ section }) => {
        return (
            <View style={styles.sectionHeader}>
                <Label size={7} type="bold">{section.key}</Label>
            </View>
        )
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <Label size={5} type="bold" style={{ textAlign: 'left', marginBottom: 16 }}>Contacts</Label>
                    <SearchBar
                        value={this.state.searchText}
                        autoCorrect={false}
                        autoComplete="false"
                        round
                        lightTheme
                        inputStyle={{ ...Fonts.h7, color: Colors.secondBlack }}
                        containerStyle={{ borderRadius: 12 }}
                        onChangeText={this._searchTextChange}
                        onClearText={() => { }}
                        icon={{ type: 'font-awesome', name: 'search' }}
                        placeholder='Type Here...' />
                    <View style={{ flex: 1, marginTop: 16 }}>
                        {
                            this.state.results === 2 ? (
                                <View style={{ marginTop: 100, alignItems: 'center', justifyContent: 'center' }}>
                                    <Label size={7} color={Colors.red} style={{ textAlign: 'center' }}>No Contacts</Label>
                                </View>
                            ) : this.state.showAlpha === true ? (
                                <AlphabetListView
                                    data={this.state.data}
                                    cellProps={{ editPhoneContact: this._editPhoneContact, editAppContact: this._editAppContact, navigation: this.props.navigation }}
                                    cell={Cell}
                                    renderFooter={() => <View style={{ flex: 1, height: moderateScale(30) }}></View>}
                                    cellHeight={33}
                                    sectionListItem={SectionItem}
                                    sectionHeader={SectionHeader}
                                    sectionHeaderHeight={22.5}
                                />
                            ) : (
                                        <>
                                            <SectionList
                                                style={{ marginBottom: 30 }}
                                                sections={this.state.sectionListData}
                                                renderItem={({ item }) =>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#aaa', paddingHorizontal: 8 }}>
                                                        <TouchableOpacity
                                                            contactID={item.key}
                                                            style={[{ flex: 1 }]}
                                                            onPress={(contactID) => this._editPhoneContact(item.key)}
                                                            hitSlop={{ top: 12, left: 36, bottom: 0, right: 0 }}
                                                            underlayColor='#fff'>
                                                            <Label size={7} color={Colors.grey.darker} style={{ paddingRight: 10 }}>{item.name}</Label>
                                                        </TouchableOpacity>
                                                        <Icon
                                                            raised
                                                            name='info'
                                                            color='#ee3333'
                                                            size={14}
                                                            containerStyle={{ alignSelf: 'flex-end' }}
                                                            type='font-awesome'
                                                            onPress={() => {
                                                                const passProps = { title: 'Edit Contact', contactId: item.key, contactFullName: item.name };
                                                                this._navigate('EditContactScene', passProps)
                                                            }} />

                                                    </View>
                                                }
                                                renderSectionHeader={this._renderSectionHeader}
                                            />
                                            <Indicator visible={this.state.isLoading} text={this.state.loadingText}></Indicator>
                                        </>
                                    )
                        }
                    </View>
                </View>
                <NavigationEvents onDidFocus={this.onReload} />
            </SafeAreaView>
        );
    }
}

class SectionHeader extends React.Component {
    render() {
        var viewStyle = {
            backgroundColor: '#ccc'
        };
        return (
            <View style={styles.sectionHeader}>
                <Label size={7} type="bold">{this.props.title}</Label>
            </View>
        );
    }
}

class SectionItem extends React.Component {
    render() {
        return (
            <Label size={7} type="bold">{this.props.title}</Label>
        );
    }
}

class Cell extends React.Component {
    render() {
        let contactId = this.props.item.key;
        let contactName = this.props.item.name;
        let cellProps = this.props;
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#aaa', paddingHorizontal: 8 }}>
                <TouchableOpacity
                    editPhoneContact={this.props.editPhoneContact}
                    style={[styles.listItemContainer, { flex: 1 }]}
                    onPress={() => {
                        return cellProps.editPhoneContact(contactId);
                    }}
                    hitSlop={styles.cellBtn}
                    underlayColor='#fff'>
                    <Label size={7} color={Colors.grey.medium}>{this.props.item.name}</Label>
                </TouchableOpacity>
                <Icon
                    raised
                    name='info'
                    color='#ee3333'
                    size={14}
                    type='font-awesome'
                    onPress={() => {
                        cellProps.editAppContact(cellProps.navigator, contactId, contactName);
                    }} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        padding: 16
    },
    listItemContainer: {
        marginBottom: verticalScale(5),
        paddingTop: verticalScale(5),
        paddingBottom: verticalScale(5),
        paddingLeft: 5,
    },
    listItemText: {
        fontSize: moderateScale(15),
        paddingRight: 10,
        color: '#555',
    },
    noContactsText: {
        color: '#AAA',
        fontSize: moderateScale(20)
    },
    sectionHeader: {
        paddingLeft: 5,
        paddingVertical: 6,
        flex: 1,
        backgroundColor: '#efefef',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    header: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    cellContainer: {
        height: 33,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#aaa',
        paddingRight: 20,
    },
    cellBtn: {
        top: 12,
        left: 36,
        bottom: 0,
        right: 0
    }
});