import React from 'react';
import {
    SafeAreaView,
    View,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    Keyboard,
    NativeModules
} from 'react-native';
import MultiSelect from '../component/multiSelect';
import { emptyLinesBeforeDelimiter, contactNotesDelimiter, oldContactNotesDelimiter } from '../styles/Scaling';
var Contacts = NativeModules.Contacts;
import { onShowAlert, showMessageWithType } from "../utils/Utils";
import { getStorageInfo, setStorageInfo } from "../utils/Storage";
import constant from "../utils/Constant";
import Nav from "../component/nav";
import Label from '../component/Label';
import Colors from '../styles/Colors';
import Fonts from '../styles/Fonts';
import BtnElement from "../component/button/element";
import Hub from "../component/Hub";
export default class ContactTagScene extends React.Component {

    static navigationOptions = ({ navigation }) => {
        const { params } = navigation.state;
        return {
            headerTitle: <Nav.NavTitle state={params} title="Contact Tag"></Nav.NavTitle>,
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

        this.state = {
            contactTags: [],
            contactTagItems: [],
            selectedContactTagItems: [],
            selectedTag: null,
            tagInput: "",
            addedContactID: this.props.navigation.getParam('contactID'),
            createTagBtnDisabled: true,
            status: 1,
            showSelector: false,
            isHub: false
        }
    }

    async  componentDidMount() {
        let settingsObj = await getStorageInfo(constant.KEY_SETTINGS);
        if (settingsObj.contactTags.length > 0) {
            let items = [];
            settingsObj.contactTags.forEach((contactTag, idx) => {
                items.push({ id: contactTag, name: contactTag });
            });
            this.setState({
                contactTags: settingsObj.contactTags, status: 2,
                createTagBtnDisabled: false, selectedTag: settingsObj.contactTags[0],
                contactTagItems: items
            });
        } else {
            this.setState({ contactTags: settingsObj.contactTags, status: 2, createTagBtnDisabled: false });
        }
    }
    async componentWillUnmount() {
        if (this.state.addedContactID != null && this.state.selectedContactTagItems.length > 0) {
            let contactID = this.state.addedContactID;
            let contactInfoObj = await getStorageInfo(contactID);
            contactInfoObj.tag = true;
            contactInfoObj.tagList = this.state.selectedContactTagItems;            //
            Contacts.getContactsMatchingString(contactInfoObj.fullName, (err, contacts) => {
                contacts.forEach((contact) => {
                    if (contact.recordID === contactID) {
                        // update notes with the new contact info
                        let idx = contact.note.indexOf(contactNotesDelimiter);
                        if (idx == -1) { idx = contact.note.indexOf(oldContactNotesDelimiter) }
                        if (idx >= 0) {
                            let tagsEntry = '';
                            if (contactInfoObj.tagList && contactInfoObj.tagList.length > 0) {
                                tagsEntry = "Tags: " + contactInfoObj.tagList.join(', ');

                                let spaceAboveDelimiter = '';
                                for (let i = 0; i < emptyLinesBeforeDelimiter; i++) {
                                    spaceAboveDelimiter += "\n";
                                }
                                let alreadyEmptyRowsAboveDelimiter = 0;
                                for (let i = idx; i > 1; i--) {
                                    if (contact.note.substring(i - 2, i - 1) == "\n") {
                                        alreadyEmptyRowsAboveDelimiter++;
                                    } else {
                                        break;
                                    }
                                }
                                contact.note = contact.note.substring(0, idx - alreadyEmptyRowsAboveDelimiter) + tagsEntry + spaceAboveDelimiter + contactNotesDelimiter + "\n" + JSON.stringify(contactInfoObj);
                                Contacts.updateContact(contact, (err) => {

                                });
                            }
                        }
                        return;
                    }
                });
            });
        }
    }

    async _addTag(tag) {
        // all contact tags
        let currentContactTags = this.state.contactTags;
        if (tag.trim().length == 0) {
            onShowAlert("Warning", 'No tag entered')
            this.setState({ createTagBtnDisabled: false });
            return;
        } else if (currentContactTags.indexOf(tag.trim()) > -1) {
            onShowAlert("Warning", 'Same Tag already exists')
            this.setState({ createTagBtnDisabled: false });
            return;
        } else {
            tag = tag.trim();
            currentContactTags.push(tag);
            let settingsObj = await getStorageInfo(constant.KEY_SETTINGS);
            settingsObj.contactTags = currentContactTags;
            settingsObj.tag = true;
            let items = [];
            currentContactTags.forEach((itTag, idx) => {
                // items.push({ id: itTag, name: itTag });
                items.unshift({ id: itTag, name: itTag });
            });
            await setStorageInfo(constant.KEY_SETTINGS, settingsObj);
            let selectedItems = this.state.selectedContactTagItems.slice();
            selectedItems.unshift(tag);
            this.setState({ createTagBtnDisabled: false, contactTagItems: items, tagInput: '' }, () => this._onSelectedTagsChange(selectedItems));
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

    _onSelectedTagsChange = async selectedItems => {
        let contactID = this.state.addedContactID;
        if (contactID == null) {
            return;
        }
        let contactInfoObj = await getStorageInfo(contactID);
        contactInfoObj.tag = true;
        contactInfoObj.tagList = selectedItems;
        await setStorageInfo(contactID, contactInfoObj);
        this.setState({ selectedContactTagItems: selectedItems });
    }

    render() {
        if (this.state.status == 1) {
            return (
                <View style={{ marginTop: 80, alignItems: 'center', justifyContent: 'center' }}><Text>Loading...</Text></View>
            );
        } else {
            return (
                <SafeAreaView style={{ flex: 1 }}>
                    <ScrollView keyboardShouldPersistTaps={'always'}>
                        <View style={styles.container}>
                            <Label size={7} type="medium" style={{ marginTop: 16, textAlign: 'left' }}>
                                Create a new tag for this contact
                            </Label>
                            <TextInput
                                style={styles.input}
                                size={16}
                                placeholderTextColor={Colors.textMuted}
                                autoCapitalize="none"
                                autoCorrect={false}
                                spellCheck={false}
                                placeholder="Type new tag ..."
                                onChangeText={(text) => this.setState({ tagInput: text })}
                                value={this.state.tagInput}
                            />
                            <BtnElement
                                iconName="add"
                                title='Create'
                                onPress={() => {
                                    if (!this.state.createTagBtnDisabled) {
                                        Keyboard.dismiss();
                                        this.setState({ createTagBtnDisabled: true }, () => this._addTag(this.state.tagInput));
                                    }
                                }} />

                            <Label size={7} type="medium" style={{ marginTop: 24, textAlign: 'left' }}>
                                Choose from existing tags
                            </Label>
                            <MultiSelect
                                hideTags
                                hideSubmitButton
                                fixedHeight
                                items={this.state.contactTagItems}
                                uniqueKey="id"
                                onPressSubmit={(show) => {
                                    this.setState({
                                        showSelector: !this.state.showSelector
                                    })
                                }}
                                onSelectedItemsChange={this._onSelectedTagsChange}
                                selectedItems={this.state.selectedContactTagItems}
                                selectText="Select tag(s)"
                                searchInputPlaceholderText="Search Items..."
                            />
                            <BtnElement
                                iconName="done"
                                title='Done'
                                onPress={() => this.props.navigation.goBack()} />
                            <Hub visible={this.state.isHub} iconName="check-circle" text="Success"></Hub>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            )
        }
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginVertical: 10,
        paddingBottom: 10,
        paddingHorizontal: 16
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
        ...Fonts.h7,
        marginTop: 12
    }
});
