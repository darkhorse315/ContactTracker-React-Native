import React, { Component } from 'react';
import { View, WebView, ActivityIndicator, Dimensions, StyleSheet, SafeAreaView } from 'react-native';
import PropTypes from 'prop-types';
const { width, height } = Dimensions.get('window');
import Nav from "../component/nav";
export default class HelpScene extends Component {

    static navigationOptions = ({ navigation }) => {
        const { params } = navigation.state;
        console.log("Help nav state", params)
        return {
            headerTitle: <Nav.NavTitle state={params} title="Help"></Nav.NavTitle>,
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
        this.state = { visible: true };
    }

    hideSpinner() {
        this.setState({ visible: false });
    }

    render() {
        const showLoading = this.state.visible;

        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1, paddingBottom: 60 }}>
                    <WebView
                        onLoad={() => this.hideSpinner()}
                        // source={{ uri: 'https://github.com/facebook/react-native' }}
                        source={{ uri: 'https://www.tinywink.com/cc/faq.html' }}
                        style={{ flex: 1 }}
                    />
                    {showLoading && (
                        <View style={styles.loading}>
                            {/* <View style={{ flex: 1, justifyContent: 'center', flexDirection: 'column', alignItems: 'center', borderWidth: 2, borderStyle: 'solid', borderColor: 'red' }}> */}
                            <ActivityIndicator
                                color="#0000ff"
                                size="large"
                            />
                        </View>
                    )}
                </View>
            </SafeAreaView>
        );
    }
}
const styles = StyleSheet.create({
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        paddingTop: height / 3,
        alignItems: 'center',
        justifyContent: 'flex-start'
    }
})