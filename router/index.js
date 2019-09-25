/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { createAppContainer, createStackNavigator, createSwitchNavigator } from "react-navigation";
import { Platform } from "react-native";
import FlashMessage from "react-native-flash-message";
import KeyboardManager from 'react-native-keyboard-manager';
import { setOnline } from "../utils/Firebase";
Platform.OS === 'ios' && KeyboardManager.setToolbarPreviousNextButtonEnable(true);
Platform.OS === 'ios' && KeyboardManager.setEnable(true);
Platform.OS === 'ios' && KeyboardManager.setEnableDebugging(false);
Platform.OS === 'ios' && KeyboardManager.setKeyboardDistanceFromTextField(10);
Platform.OS === 'ios' && KeyboardManager.setPreventShowingBottomBlankSpace(true);
Platform.OS === 'ios' && KeyboardManager.setEnableAutoToolbar(true);
Platform.OS === 'ios' && KeyboardManager.setToolbarDoneBarButtonItemText("Done");
Platform.OS === 'ios' && KeyboardManager.setToolbarManageBehaviour(0);
Platform.OS === 'ios' && KeyboardManager.setShouldToolbarUsesTextFieldTintColor(false);
Platform.OS === 'ios' && KeyboardManager.setShouldShowToolbarPlaceholder(true);
Platform.OS === 'ios' && KeyboardManager.setOverrideKeyboardAppearance(false);
Platform.OS === 'ios' && KeyboardManager.setShouldResignOnTouchOutside(true);
Platform.OS === 'ios' && KeyboardManager.resignFirstResponder();

import NavigationService from "../utils/navservice";
//Home Stack
import AllContactListScene from '../screens/AllContactList';
import HomeScene from '../screens/HomeScene';
import EditContactScene from '../screens/EditContact';
import ContactTagScene from '../screens/ContactTag';
import CityListScene from '../screens/CityList';
import TagListScene from '../screens/TagList';
import SettingsScene from "../screens/Settings";
import HelpScene from "../screens/HelpScene";
import ContactListScene from "../screens/ContactList";
import PaymentScene from "../screens/PaymentScene";

// Load Stack
import SplashScene from "../screens/Splash";
const LoadStack = createStackNavigator({
    SplashScene
});
const PaymentStack = createStackNavigator({
    PaymentScene
})

const HomeStack = createStackNavigator({
    AllContactListScene,
    PaymentScene,
    HomeScene,
    EditContactScene,
    ContactTagScene,
    CityListScene,
    TagListScene,
    SettingsScene,
    HelpScene,
    ContactListScene
});

const MainStack = createAppContainer(
    createSwitchNavigator({
        LoadScene: LoadStack,
        MainScene: HomeStack,
        PayScene: PaymentStack
    }, {
            initialRouteName: "LoadScene"
        })
)
class Router extends React.PureComponent {
    componentDidMount() {
        console.log("Router rendered")
        setOnline();
    }
    render() {
        return (
            <>
                <MainStack
                    ref={navigateRef => {
                        NavigationService.setTopLevelNavigator(navigateRef);
                    }}
                />
                <FlashMessage position="top" animated={true}></FlashMessage>
            </>
        )
    }
}
export default Router;