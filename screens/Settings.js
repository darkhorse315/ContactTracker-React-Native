import React from 'react';
import PropTypes from 'prop-types';
import {
    StyleSheet, ScrollView, SafeAreaView, View, NativeModules
} from 'react-native';
import { NavigationEvents } from "react-navigation";
import MultiSelect from '../component/multiSelect';
import CTContact from '../utils/CTContact';
import { getStorageInfo, setStorageInfo } from "../utils/Storage";
import { validateRestoreSubscribe } from "../utils/InAppUtils";
import { onShowAlert } from "../utils/Utils";
import constant from "../utils/Constant";
import Nav from "../component/nav";
import Label from '../component/Label';
import BtnElement from "../component/button/element";
import Colors from '../styles/Colors';
const { InAppUtils } = NativeModules;
var productIdentifier = "org.reactjs.native.example.ContactTracker.yearlySubscription";
import Indicator from '../component/Indicator';
export default class SettingsScene extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const { params } = navigation.state;
        return {
            headerTitle: <Nav.NavTitle state={params} title="Settings"></Nav.NavTitle>,
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
            allCalendars: [],
            selectedCalendars: [],
            allTags: [],
            selectedTags: [],
            start_trial_ms: undefined,
            purchasible: false,
            sending: false
        }
        this.onReload = this.onReload.bind(this);
        this.onLoadProduct = this.onLoadProduct.bind(this);
        this.onSubscribe = this.onSubscribe.bind(this);
    }

    async  componentDidMount() {
        CTContact.getAllTags().then(tags => {
            let items = [];
            tags.forEach(tag => {
                items.push({ id: tag, name: tag });
            });
            if (this._isMounted) {
                this.setState({ allTags: items });
            }
        });
        this._isMounted = true;
        const start_trial_ms = await getStorageInfo(constant.ORIGIN_PURCHASE_DATE_MS);
        this.setState({
            start_trial_ms
        });
        this.onLoadProduct();
    }
    onLoadProduct() {
        InAppUtils.canMakePayments((enabled) => {
            this.setState({
                purchasible: enabled
            })
        });
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    onReload = async navigationEvent => {
        if (navigationEvent.type == "didFocus") {
            const start_trial_ms = await getStorageInfo(constant.ORIGIN_PURCHASE_DATE_MS);
            this.setState({
                start_trial_ms
            })
        }
    };
    onSubscribe() {
        this.setState({
            sending: true
        })
        InAppUtils.restorePurchases((error, response) => {
            console.log("Purchase", error, response);
            this.setState({
                sending: false
            })
            if (error) {
                onShowAlert("Ituns Error", "Could not connect to itunes store.");
            } else {
                if (response.length === 0) {
                    onShowAlert('No Purchases', "We didn't find any purchases to restore.");
                    return;
                } else {
                    let expireDateMS = undefined;
                    let sortedRes = response.sort((a, b) => (a.transactionDate > b.transactionDate) ? -1 : 1);
                    for (const index in sortedRes) {
                        const purchase = sortedRes[index];
                        if (purchase.productIdentifier === productIdentifier) {
                            validateRestoreSubscribe();
                            setTimeout(() => {
                                onShowAlert('Restore Successful', 'Successfully restores your purchases.');
                            }, 1000);
                            break;
                        }
                    }
                }
            }
        });
    }
    onSelectedItemsChange = async selectedItems => {
        let settingsObj = await getStorageInfo(constant.KEY_SETTINGS);
        settingsObj.selectedCalendars = selectedItems;
        await setStorageInfo(constant.KEY_SETTINGS, settingsObj)
    };
    onSelectedTagItemsChange = selectedItems => {
        this.setState({ selectedTags: selectedItems });
    }

    _deleteTags() {
        CTContact.deleteTags(this.state.selectedTags);
        let items = [];
        this.state.allTags.forEach(tagItem => {
            if (this.state.selectedTags.indexOf(tagItem.id) == -1) {
                items.push(tagItem);
            }
        });
        this.setState({ allTags: items, selectedTags: [] });
    }

    render() {
        const {
            start_trial_ms, purchasible
        } = this.state;
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView>
                    <View style={styles.container}>
                        <View style={styles.headerContainer}>
                            <Label size={7} style={{ textAlign: 'left' }}>Select tag's to delete</Label>
                            <BtnElement
                                iconName="delete"
                                title='Delete  '
                                backgroundColor={Colors.grey.veryLight}
                                titleColor={Colors.red}
                                iconColor={Colors.red}
                                marginTop={0}
                                onPress={() => { this._deleteTags(); }} />

                        </View>
                        <View style={styles.selectContainer}>
                            <MultiSelect
                                hideTags
                                items={this.state.allTags}
                                uniqueKey="id"
                                onSelectedItemsChange={this.onSelectedTagItemsChange}
                                onSubmitPressed={this.onSubmitTagButtonPressed}
                                selectedItems={this.state.selectedTags}
                                selectText="Select tag(s)"
                                searchInputPlaceholderText="Search Items..."
                                tagRemoveIconColor="#CCC"
                                tagBorderColor="#CCC"
                                tagTextColor="#CCC"
                                selectedItemTextColor="#F33"
                                selectedItemIconColor="#F00"
                                itemTextColor="#000"
                                searchInputStyle={{ color: '#CCC' }}
                                submitButtonColor="#CCC"
                                submitButtonText="Submit"
                            />
                        </View>
                        {
                            purchasible === true && (
                                <View style={{ paddingHorizontal: 24, marginTop: 84 }}>
                                    <BtnElement
                                        title="Restore purchase"
                                        iconName="payment"
                                        onPress={this.onSubscribe} />
                                </View>

                            )
                        }
                    </View>
                </ScrollView>
                <NavigationEvents onDidFocus={this.onReload} />
                <Indicator visible={this.state.sending} text={""}></Indicator>
            </SafeAreaView>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        paddingTop: 24,
        paddingBottom: 30
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        marginBottom: 12,
        paddingHorizontal: 24
    },
    selectContainer: {
        flex: 1,
        paddingHorizontal: 14
    }
});