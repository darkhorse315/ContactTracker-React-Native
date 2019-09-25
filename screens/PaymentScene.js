import React from "react";
import { NativeModules, View, Dimensions, ScrollView, StyleSheet } from "react-native";
import Label from "../component/Label";
import BtnElement from "../component/button/element";
import Colors from "../styles/Colors";
import Nav from "../component/nav";
import Indicator from "../component/Indicator";
import { onShowAlert, openLink } from "../utils/Utils";
import Constant from "../utils/Constant";
const { InAppUtils } = NativeModules;
var productIdentifier = "org.reactjs.native.example.ContactTracker.yearlySubscription";
const height = Dimensions.get('window').height - 64;
const identifier = [
    productIdentifier,
]
class Payment extends React.PureComponent {
    static navigationOptions = ({ navigation }) => {
        const { params } = navigation.state;
        return {
            headerTitle: <Nav.NavTitle state={params} title="Payment"></Nav.NavTitle>,
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
            loading: false,
            sending: false,
            price: 11.99,
            currencySymbol: "$",
            currencyCode: "USD",
            priceString: "$ 10.99",
            title: ""
        };
        this.onSubscribe = this.onSubscribe.bind(this);
    }
    async componentDidMount() {
        this.setState({
            loading: true
        });
        InAppUtils.canMakePayments((enabled) => {
            if (enabled) {
                InAppUtils.loadProducts(identifier, (error, products) => {
                    this.setState({
                        loading: false
                    });
                    if (error) {
                        onShowAlert("Error", error.message || "Error getting products from apple store")
                    } else {
                        console.log("In App Utils products", error, products)
                        if (products && products.length > 0) {
                            const product = products[0];
                            this.setState({
                                currencySymbol: product.currencySymbol,
                                priceString: product.priceString,
                                currencyCode: product.currencyCode,
                                price: product.price
                            })
                        } else {
                            onShowAlert("Warning", "There is no any product in app store")
                        }
                    }
                })
            } else {
                onShowAlert("Warning", "In App Purchase disabled")
                this.setState({
                    loading: false
                });
            }
        });
    }
    onSubscribe() {
        this.setState({
            sending: true
        })
        InAppUtils.purchaseProduct(productIdentifier, (error, response) => {
            console.log("Purchase", error, response);
            this.setState({
                sending: false
            })
            if (response && response.productIdentifier) {
                console.log("In App Utils subscribe response", response)
            } else if (error) {
                onShowAlert(error.message || "Error", " In App Purchase is invalid, Please try again");
            } else {
                onShowAlert("Error", "In App Purchase failed, Please try again");
            }
        });
    }
    render() {
        const {
            price,
            currencySymbol
        } = this.state;
        const priceStr = `${currencySymbol}${price}`;
        return (
            <ScrollView>
                <View style={{ paddingBottom: 32 }}>
                    {this.state.loading ? (
                        <View style={styles.noMatchView}>
                            <Label size={7} style={{ textAlign: 'center' }}>Loading ...</Label>
                        </View>
                    ) : (
                            <View style={{ marginTop: 24, height: height }}>
                                <View style={styles.containerTop}>
                                    <Label
                                        size={6}
                                        type="bold"
                                        color={Colors.secondBlack}
                                        style={{
                                            width: '100%',
                                            textAlign: 'center'
                                        }}
                                        numberOfLines={1}
                                    >
                                        Yearly Subscription
                                </Label>
                                    <BtnElement
                                        title="Subscribe"
                                        marginTop={36}
                                        iconName="payment"
                                        onPress={this.onSubscribe} />
                                    <Label
                                        size={7}
                                        type="medium"
                                        color={Colors.secondBlack}
                                        style={{ width: '100%', textAlign: 'center', marginTop: 8 }}>
                                        Only {priceStr} / year.
                                </Label>
                                    <Label
                                        size={7}
                                        type="medium"
                                        color={Colors.secondBlack}
                                        style={{ width: '100%', textAlign: 'center' }}>
                                        You have come to the end of your {Constant.FREE_TRIAL_DAYS} {Constant.UNIT_TRIAL} free trial! Subscribe to continue enjoying the organizational benefits of When We Met.
                                </Label>
                                </View>
                                <View style={styles.containerBottom}>
                                    <Label
                                        size={9}
                                        color={Colors.secondBlack}
                                        style={{ width: '100%', textAlign: 'center' }}>
                                        When We Met subscription automatically renews yearly for {priceStr} unless it is cancelled at least 24h before current period ends. Your Apple ID will be charged for renewal within 24h prior to the end of the current period. You can manage or turn off auto-renew by going to your Account Settings on the App Store after purchase. Read our <Label
                                            size={9}
                                            type="bold"
                                            color={Colors.primary.main}
                                            onPress={() => {
                                                openLink("https://tinywink.com/terms.html");
                                            }}
                                        >Terms</Label> and <Label
                                            size={9}
                                            type="bold"
                                            color={Colors.primary.main}
                                            onPress={() => {
                                                openLink("https://tinywink.com/privacy.html");
                                            }}
                                        >Privacy Policy.</Label>
                                    </Label>
                                </View>
                            </View>
                        )}
                </View>
                <Indicator visible={this.state.sending} text=""></Indicator>
            </ScrollView>
        )
    }
}
export default Payment;
const styles = StyleSheet.create({
    noMatchView: {
        width: "100%",
        height: Dimensions.get('window').height - 128,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    containerTop: {
        flex: 1.3,
        borderBottomColor: Colors.lightBorder,
        borderBottomWidth: 1,
        marginHorizontal: 24,
        justifyContent: 'flex-end',
        paddingBottom: 36
    },
    containerBottom: {
        flex: 1,
        marginHorizontal: 24,
        paddingTop: 36,
        paddingBottom: 10,
        alignItems: 'center',
        justifyContent: 'flex-start'
    }
});