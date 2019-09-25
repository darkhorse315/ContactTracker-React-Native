import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    SectionList,
    SafeAreaView,
    NativeModules
} from 'react-native';

const ContactsWrapper = NativeModules.ContactsWrapper;
import { Icon } from 'react-native-elements'
import { moderateScale, verticalScale } from '../styles/Scaling';
import SendExport from './SendExport';
import CTContact from '../utils/CTContact';
import { onShowAlert } from "../utils/Utils";
import { getAllStorageKeys, getStorageInfo, multiGetStorageInfo, setStorageInfo, multiRemoveStorageInfo, restoreAllKeys } from "../utils/Storage";
import constant from "../utils/Constant";
import Nav from "../component/nav";
import Fonts from '../styles/Fonts';
import Label from '../component/Label';
import Colors from '../styles/Colors';
import Indicator from '../component/Indicator';

export default class ContactListScene extends React.Component {

    static navigationOptions = ({ navigation }) => {
        const { params } = navigation.state;
        return {
            headerTitle: <Nav.NavTitle state={params} title="Contacts"></Nav.NavTitle>,
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
            constactList: [{ key: "Loading..." }],
            results: 1,
            contactIDs: [],
            sectionListData: [],
            isLoading: false,
            loadingText: "",
        };
    }

    componentDidMount() {
        this.loadAll()
    }

    async  loadAll() {
        if (this.props.navigation.getParam('listType') == 3 && this.props.navigation.getParam('isDateRange')) {
            this._searchByDateRange();
        } else {
            // 2541D17B-B6F0-4EAF-BB75-8353D1D67B57:ABPerson
            const data = [
                { key: 'A', data: [] }, { key: 'B', data: [] }, { key: 'C', data: [] }, { key: 'D', data: [] }, { key: 'E', data: [] },
                { key: 'F', data: [] }, { key: 'G', data: [] }, { key: 'H', data: [] }, { key: 'I', data: [] }, { key: 'J', data: [] },
                { key: 'K', data: [] }, { key: 'L', data: [] }, { key: 'M', data: [] }, { key: 'N', data: [] }, { key: 'O', data: [] },
                { key: 'P', data: [] }, { key: 'Q', data: [] }, { key: 'R', data: [] }, { key: 'S', data: [] }, { key: 'T', data: [] },
                { key: 'U', data: [] }, { key: 'V', data: [] }, { key: 'W', data: [] }, { key: 'X', data: [] }, { key: 'Y', data: [] },
                { key: 'Z', data: [] }
            ];
            const letterHeaders = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
            const contactIDs = [];
            let keys = await restoreAllKeys();
            let stores = await multiGetStorageInfo(keys);
            stores.map((result, i, store) => {
                let contactInfoObj = JSON.parse(store[i][1]);
                if (this.props.navigation.getParam('listType') == 1) {
                    // by city
                    let city = contactInfoObj.city;
                    if (city == this.props.navigation.getParam('searchTerm')) {
                        contactIDs.push(contactInfoObj.contactID);
                        let firstLetter = contactInfoObj.fullName.substring(0, 1).toUpperCase();
                        let position = letterHeaders.indexOf(firstLetter);
                        if (position == -1) {
                            // unknown character
                            letterHeaders.push(firstLetter);
                            position = letterHeaders.length - 1;
                            data.push({ key: firstLetter, data: [{ key: contactInfoObj.contactID, name: contactInfoObj.fullName }] });
                        } else {
                            data[position].data.push({ key: contactInfoObj.contactID, name: contactInfoObj.fullName });
                        }
                    }
                } else if (this.props.navigation.getParam('listType') == 2) {
                    // by event
                    let eventTitles = contactInfoObj.eventList.map(event => event.title);
                    if (eventTitles.indexOf(this.props.navigation.getParam('searchTerm')) > -1) {
                        contactIDs.push(contactInfoObj.contactID);
                        let firstLetter = contactInfoObj.fullName.substring(0, 1).toUpperCase();
                        let position = letterHeaders.indexOf(firstLetter);
                        if (position == -1) {
                            // unknown character
                            letterHeaders.push(firstLetter);
                            position = letterHeaders.length - 1;
                            data.push({ key: firstLetter, data: [{ key: contactInfoObj.contactID, name: contactInfoObj.fullName }] });
                        } else {
                            data[position].data.push({ key: contactInfoObj.contactID, name: contactInfoObj.fullName });
                        }
                    }
                } else if (this.props.navigation.getParam('listType') == 3) {
                    // by date
                    let monthAndYear = this._getMonthName(contactInfoObj.createdMonth) + ' ' + contactInfoObj.createdYear;
                    if (monthAndYear == this.props.navigation.getParam('searchTerm')) {
                        contactIDs.push(contactInfoObj.contactID);
                        let firstLetter = contactInfoObj.fullName.substring(0, 1).toUpperCase();
                        let position = letterHeaders.indexOf(firstLetter);
                        if (position == -1) {
                            // unknown character
                            letterHeaders.push(firstLetter);
                            position = letterHeaders.length - 1;
                            data.push({ key: firstLetter, data: [{ key: contactInfoObj.contactID, name: contactInfoObj.fullName }] });
                        } else {
                            data[position].data.push({ key: contactInfoObj.contactID, name: contactInfoObj.fullName });
                        }
                    }
                } else if (this.props.navigation.getParam('listType') == 5) {
                    // by tag
                    let tagList = contactInfoObj.tagList;
                    if (tagList == undefined)
                        return;
                    let found = tagList.some(r => this.props.navigation.getParam('searchTerm').includes(r))
                    if (found) {
                        contactIDs.push(contactInfoObj.contactID);
                        let firstLetter = contactInfoObj.fullName.substring(0, 1).toUpperCase();
                        let position = letterHeaders.indexOf(firstLetter);
                        if (position == -1) {
                            // unknown character
                            letterHeaders.push(firstLetter);
                            position = letterHeaders.length - 1;
                            data.push({ key: firstLetter, data: [{ key: contactInfoObj.contactID, name: contactInfoObj.fullName }] });
                        } else {
                            data[position].data.push({ key: contactInfoObj.contactID, name: contactInfoObj.fullName });
                        }
                    }
                } else if (this.props.navigation.getParam('listType') == 7) {
                    contactIDs.push(contactInfoObj.contactID);
                    let firstLetter = contactInfoObj.fullName.substring(0, 1).toUpperCase();
                    let position = letterHeaders.indexOf(firstLetter);
                    if (position == -1) {
                        // unknown character
                        letterHeaders.push(firstLetter);
                        position = letterHeaders.length - 1;
                        data.push({ key: firstLetter, data: [{ key: contactInfoObj.contactID, name: contactInfoObj.fullName }] });
                    } else {
                        data[position].data.push({ key: contactInfoObj.contactID, name: contactInfoObj.fullName });
                    }
                }
            });
            this._populateList(data, contactIDs);


        }
    }
    async _searchByDateRange() {
        const rows = [];
        const data = [
            { key: 'A', data: [] }, { key: 'B', data: [] }, { key: 'C', data: [] }, { key: 'D', data: [] }, { key: 'E', data: [] },
            { key: 'F', data: [] }, { key: 'G', data: [] }, { key: 'H', data: [] }, { key: 'I', data: [] }, { key: 'J', data: [] },
            { key: 'K', data: [] }, { key: 'L', data: [] }, { key: 'M', data: [] }, { key: 'N', data: [] }, { key: 'O', data: [] },
            { key: 'P', data: [] }, { key: 'Q', data: [] }, { key: 'R', data: [] }, { key: 'S', data: [] }, { key: 'T', data: [] },
            { key: 'U', data: [] }, { key: 'V', data: [] }, { key: 'W', data: [] }, { key: 'X', data: [] }, { key: 'Y', data: [] },
            { key: 'Z', data: [] }
        ];
        const letterHeaders = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        const contactIDs = [];
        let totalFetched = 0;
        let keys = await restoreAllKeys();
        let stores = await multiGetStorageInfo(keys);
        stores.map((result, i, store) => {
            let contactInfoObj = JSON.parse(store[i][1]);
            let createdAt = contactInfoObj.createdAt;
            if (createdAt >= this.props.navigation.getParam('startDate') && createdAt <= this.props.navigation.getParam('endDate')) {
                //
                rows.push(contactInfoObj.fullName);
                contactIDs.push(contactInfoObj.contactID);
                let firstLetter = contactInfoObj.fullName.substring(0, 1).toUpperCase();
                let position = letterHeaders.indexOf(firstLetter);
                if (position == -1) {
                    // unknown character
                    letterHeaders.push(firstLetter);
                    position = letterHeaders.length - 1;
                    data.push({ key: firstLetter, data: [{ key: contactInfoObj.contactID, name: contactInfoObj.fullName }] });
                } else {
                    data[position].data.push({ key: contactInfoObj.contactID, name: contactInfoObj.fullName });
                }
            }
        });
        this._populateList(data, contactIDs);
    }

    async  _populateList(data, contactIDs) {
        let dataWithItems = [];
        data.forEach(dataItem => {
            if (dataItem.data.length > 0) {
                dataWithItems.push(dataItem);
            }
        });
        setTimeout(() => {
            this.setState({ isLoading: false });
        }, 1000);
        this.setState({ results: (dataWithItems.length > 0 ? 3 : 2), sectionListData: dataWithItems }, () => {
            if (this.props.navigation.getParam('listType') == 7) {
                let passProps = {
                    title: "All Contacts",
                    listType: 7, searchTerm: 'ALL', isDateRange: false,
                    startDate: null, endDate: null
                };
                passProps.rightButtonTitle = 'Export';
                passProps.onRightButtonPress = () => {
                    if (contactIDs.length > 0) {
                        sendExport = new SendExport();
                        sendExport.createExportFile(contactIDs);
                    }
                };
                this.props.navigation.setParams(passProps);
            } else {
                // if not all contacts
                this.props.navigation.getParam('updateContactIDsFromChild')(contactIDs);
            }
        });
    }

    _getMonthName(month) {
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1];
    }

    async  _editContact(contactID) {
        ContactsWrapper.editContact(contactID)
            .then(async (contact) => {
                let contactInfoObj = await getStorageInfo(contactID);
                contactInfoObj.fullName = contact.name;
                await setStorageInfo(contactID, contactInfoObj)
            })
            .catch(async (error) => {
                this.setState({ isLoading: true, loadingText: "Rescan contact..." });
                let keys = await restoreAllKeys();
                await multiRemoveStorageInfo(keys);
                ctContact = new CTContact(-1, '', {});
                ctContact.restoreContacts(this.loadAll.bind(this));
                if (error.code == "E_CONTACT_EXCEPTION") {
                    onShowAlert('Error', error.message || 'Couldn\'t find contact')
                }
                return;
            });
    }

    _renderItem = ({ item, section }) => (
        <Label size={7} style={{ textAlign: 'left' }}>{`${item.name}(${section.key})`}</Label>
    )
    _renderSectionHeader = ({ section }) => {
        return (
            <View style={styles.sectionHeader}>
                <Label size={7} type="bold" style={{ textAlign: 'left' }}>{section.key}</Label>
            </View>
        )
    }
    render() {
        if (this.state.results == 2) {
            return (
                <View style={{ marginTop: 80, alignItems: 'center', justifyContent: 'center' }}>
                    <Label size={6} type="medium" style={{ textAlign: 'left', marginVertical: 16 }}>No Contacts</Label>
                </View>
            );
        } else {
            return (
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={styles.container}>
                        <Label size={5} type="bold" style={{ textAlign: 'left', marginVertical: 16 }}>Contacts</Label>
                        <SectionList
                            style={{ marginBottom: 30 }}
                            sections={this.state.sectionListData}
                            renderItem={({ item }) =>
                                <View style={styles.itemContainer}>
                                    <TouchableOpacity
                                        contactID={item.key}
                                        style={[styles.listItemContainer, { flex: 1 }]}
                                        onPress={(contactID) => this._editContact(item.key)}
                                        hitSlop={{ top: 12, left: 36, bottom: 0, right: 0 }}
                                        underlayColor='#fff'>
                                        <Label size={7} type="medium" color={Colors.secondBlack} style={{ paddingRight: 16 }}>{item.name}</Label>
                                    </TouchableOpacity>
                                    <Icon
                                        raised
                                        name='info'
                                        color='#ee3333'
                                        size={14}
                                        type='font-awesome'
                                        onPress={() => {
                                            const passProps = { title: 'Edit Contact', contactId: item.key, contactFullName: item.name };
                                            this.props.navigation.navigate('EditContactScene', passProps);
                                        }} />

                                </View>
                            }
                            renderSectionHeader={this._renderSectionHeader}
                        />
                        <Indicator visible={this.state.isLoading} text={this.state.loadingText}></Indicator>
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
        paddingLeft: 15,
        paddingRight: 10,
        paddingBottom: 20,
        marginBottom: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: Colors.grey.light
    },
    listItemContainer: {
        paddingLeft: 5,
    },
    listItemText: {
        ...Fonts.h7_m,
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
    }
});