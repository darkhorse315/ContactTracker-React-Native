import React, { Component } from 'react';
import { SafeAreaView, ScrollView, TextInput, StyleSheet, View, TouchableOpacity } from 'react-native';
import { verticalScale, moderateScale } from '../styles/Scaling';
import Autocomplete from 'react-native-autocomplete-input';
import { FormValidationMessage } from 'react-native-elements';
import MultiSelect from '../component/multiSelect';
import CTContact from '../utils/CTContact';
import { onShowAlert, showMessageWithType } from "../utils/Utils";
import { getAllStorageKeys, getStorageInfo, multiGetStorageInfo, setStorageInfo, restoreAllKeys } from "../utils/Storage";
import constant from "../utils/Constant";
import Nav from "../component/nav";
import BtnElement from "../component/button/element";
import Label from '../component/Label';
import Modal from "../component/Modal";
import ModalHeader from "../component/Modal/header";
import Colors from '../styles/Colors';
import Fonts from '../styles/Fonts';
import Hub from "../component/Hub";
export default class EditContactScene extends Component {
    static navigationOptions = ({ navigation }) => {
        const { params } = navigation.state;
        return {
            headerTitle: <Nav.NavTitle state={params} title="Edit"></Nav.NavTitle>,
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
            contactId: this.props.navigation.getParam('contactId'),
            contactFullName: this.props.navigation.getParam('contactFullName'),
            contactFirstName: '',
            contactLastName: '',
            city: '',
            allAppTags: [],
            contactTags: [],
            selectedContactTags: [],
            nameError: false,
            cityError: false,
            addTagModalVisible: false,
            newTag: '',
            cities: [],
            inappunlocked: false,
            isHub: false
        }
        this.onClose = this.onClose.bind(this);
    }

    async componentDidMount() {
        const inappunlocked = await getStorageInfo(constant.KEY_IN_APP_UNLOCKED);
        this.setState({ inappunlocked: inappunlocked === null ? false : inappunlocked })

        let contact = await getStorageInfo(this.state.contactId);
        if (contact == null) {
            contact = CTContact.getInitContact(this.state.contactId, this.state.contactFullName);
        }
        let city = contact.city.toLowerCase() == 'not set' ? '' : contact.city;
        this.setState({ contactFirstName: contact.firstName, contactLastName: contact.lastName, city: city });

        let settingsObj = await getStorageInfo(constant.KEY_SETTINGS);
        let items = [];
        let selectedItems = [];
        let allAppTags = [];
        settingsObj.contactTags.forEach((contactTag, idx) => {
            items.push({ id: contactTag, name: contactTag });
            allAppTags.push(contactTag);
            if (contact.tagList.indexOf(contactTag) > -1) {
                selectedItems.push(contactTag);
            }
        });
        this.setState({ contactTags: items, selectedContactTags: selectedItems, allAppTags: allAppTags });

        let keys = await restoreAllKeys();
        let stores = await multiGetStorageInfo(keys);
        const cities = ["A", "AB", "ABC"];
        stores.map((result, i, store) => {
            let contactInfoObj = JSON.parse(store[i][1]);
            if (cities.indexOf(contactInfoObj.city) == -1) {
                cities.push(contactInfoObj.city);
            }
        });
        this.setState({ cities });
    }

    componentWillUnmount() {
    }

    _onSelectedTagsChange = selectedItems => {
        this.setState({ selectedContactTags: selectedItems });
    }

    async _addNewTag() {
        let newTag = this.state.newTag;
        let currentContactTags = this.state.allAppTags;

        if (newTag.trim().length == 0) {
            onShowAlert("Warning", 'No tag entered');
            return;
        }
        else if (currentContactTags.findIndex(item => newTag.toLowerCase() === item.toLowerCase()) > -1) {
            onShowAlert("Warning", 'Same Tag already exists');
            return;
        } else {
            currentContactTags.unshift(newTag);
            let settingsObj = await getStorageInfo(constant.KEY_SETTINGS);
            settingsObj.contactTags = currentContactTags;
            settingsObj.tag = true;
            await setStorageInfo(constant.KEY_SETTINGS, settingsObj);
            let multiSelectItems = this.state.contactTags.slice();
            multiSelectItems.unshift({ id: newTag, name: newTag });
            let selectedItems = this.state.selectedContactTags.slice();
            selectedItems.unshift(newTag);
            this.setState({ addTagModalVisible: false, allAppTags: currentContactTags, contactTags: multiSelectItems, selectedContactTags: selectedItems });
            setTimeout(() => {
                this.setState({
                    isHub: true
                }, () => {
                    setTimeout(() => {
                        this.setState({
                            isHub: !this.state.isHub
                        })
                    }, 1000)
                })
            }, 500)
        }
    }

    async _saveContact() {

        this.setState({ cityError: false, nameError: false });
        let fullName = this.state.contactFullName;
        let contactId = this.state.contactId;
        let contactInfoObj = await getStorageInfo(contactId);
        if (contactInfoObj == null) {
            contactInfoObj = CTContact.getInitContact(this.state.contactId, fullName);
        }
        if (this.state.selectedContactTags.length > 0) {
            contactInfoObj.tag = true;
        } else {
            contactInfoObj.tag = true;
        }
        contactInfoObj.fullName = fullName;
        contactInfoObj.tagList = this.state.selectedContactTags;
        contactInfoObj.city = this.state.city;
        CTContact.updateContact(contactInfoObj);
        this.props.navigation.goBack();
    }

    // autocomplete
    findCity(query) {
        if (query === '') {
            return [];
        }
        const { cities } = this.state;
        const regex = new RegExp(`${query.trim()}`, 'i');
        return cities.filter(city => city !== undefined && city.search(regex) >= 0);
    }
    onClose() {
        this.setState({ addTagModalVisible: false, newTag: '' })
    }
    render() {
        const { city } = this.state;
        const cities = this.findCity(city);
        const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();
        const filterCities = cities.length === 1 && comp(city, cities[0]) ? [] : cities;
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{
                    flexGrow: 1,
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    paddingBottom: 60,
                }} >
                    <View style={{ padding: 16 }}>
                        <Label size={7} type="medium" style={{ marginTop: 5, textAlign: 'center' }}>{this.state.contactFullName}</Label>
                        {this.state.nameError && <FormValidationMessage>{'First or last name is required'}</FormValidationMessage>}
                        <View style={[styles.autocompleteOuterContainer, { zIndex: 2 }]}>
                            <Label size={7} style={{ marginBottom: 12, textAlign: 'left' }}>Select a city</Label>
                            <Autocomplete
                                autoCapitalize="none"
                                autoCorrect={false}
                                containerStyle={styles.autocompleteContainer}
                                inputContainerStyle={styles.inputContaner}
                                data={filterCities}
                                defaultValue={city}
                                renderTextInput={() => {
                                    return (
                                        <TextInput
                                            style={styles.input}
                                            size={16}
                                            placeholderTextColor={Colors.textMuted}
                                            value={city}
                                            placeholder="City"
                                            onChangeText={text => this.setState({ city: text, cityError: false })}
                                        />
                                    )
                                }}
                                renderItem={({ item, index }) =>
                                    (
                                        <TouchableOpacity key={index} onPress={() => this.setState({ city: item })}>
                                            <Label size={8} style={{ textAlign: 'left', margin: 2 }}> {item}</Label>
                                        </TouchableOpacity>
                                    )}
                            />
                        </View>
                        <View style={{ paddingTop: 16 }}>
                            <BtnElement
                                iconName="save"
                                title='Save'
                                onPress={() => { this._saveContact(); }} />
                        </View>
                        {this.state.cityError && <FormValidationMessage>{'City field is required'}</FormValidationMessage>}
                        <View style={{ marginTop: verticalScale(16), flexDirection: 'row', zIndex: 1, alignItems: 'center', justifyContent: "space-between" }}>
                            <Label size={7} style={{ marginTop: 5, textAlign: 'center' }}>Select tags or </Label>
                            <BtnElement
                                iconName="add"
                                title='Add  '
                                onPress={() => {
                                    this.setState({ addTagModalVisible: true })
                                }} />
                        </View>
                        <View style={{ flex: 1, marginTop: 8 }}>
                            <MultiSelect
                                hideTags
                                hideSubmitButton
                                items={this.state.contactTags}
                                uniqueKey="id"
                                onSelectedItemsChange={this._onSelectedTagsChange}
                                selectedItems={this.state.selectedContactTags}
                                selectText="Select tag(s)"
                                searchInputPlaceholderText="Search Items..." />
                        </View>

                    </View>


                    <Modal isVisible={this.state.addTagModalVisible} onClose={this.onClose}>
                        <View
                            style={{
                                width: "100%"
                            }}
                        >
                            <ModalHeader title="Add New Tag" onClose={this.onClose} />
                            <View style={styles.modalContainer}>
                                <View style={{ backgroundColor: Colors.background, minWidth: '50%' }}>
                                    <TextInput
                                        style={styles.input}
                                        size={16}
                                        placeholderTextColor={Colors.textMuted}
                                        value={this.state.newTag}
                                        onChangeText={(text) => this.setState({ newTag: text })}
                                    />
                                </View>
                                <View style={{ marginTop: verticalScale(16), paddingHorizontal: verticalScale(16) }}>
                                    <BtnElement
                                        iconName="add"
                                        title='Add  '
                                        onPress={() => { this._addNewTag(); }} />
                                </View>
                            </View>

                        </View>
                    </Modal>
                    <Hub visible={this.state.isHub} iconName="check-circle" text="Success"></Hub>
                </ScrollView>
            </SafeAreaView>
        )
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
    modalContainer: {
        // flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minWidth: 200,
        padding: 16
    },
    autocompleteOuterContainer: {
        backgroundColor: Colors.white,
        flex: 1,
        marginTop: 16
    },
    instructionText: {
        fontFamily: 'HelveticaNeue-Light',
        "color": "#494949",
        fontSize: moderateScale(16),
        "alignSelf": "center",
        marginTop: verticalScale(5),
        marginLeft: 10,
        marginRight: 10
    },
    autocompleteContainer: {
        backgroundColor: Colors.white
    },
    inputContaner: {
        borderWidth: 0,
        borderRadius: 0,
        borderColor: Colors.white
    },
    itemText: {
        fontSize: 15,
        margin: 2
    },
    descriptionContainer: {
        // `backgroundColor` needs to be set otherwise the
        // autocomplete input will disappear on text input.
        backgroundColor: '#F5FCFF',
        marginTop: 8
    },
    infoText: {
        textAlign: 'center'
    },
    titleText: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 10,
        marginTop: 10,
        textAlign: 'center'
    },
    directorText: {
        color: 'grey',
        fontSize: 12,
        marginBottom: 10,
        textAlign: 'center'
    },
    openingText: {
        textAlign: 'center'
    },
    input: {
        height: 40,
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: Colors.grey.darker,
        textAlign: "left",
        backgroundColor: Colors.background,
        color: Colors.secondBlack,
        ...Fonts.h7
    }
});