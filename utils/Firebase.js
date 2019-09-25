import firebase from 'react-native-firebase';
import { NetInfo } from "react-native";
import DeviceInfo from 'react-native-device-info';
import SystemSetting from "react-native-system-setting";
import { getUTCToday } from "./InAppUtils";
import { setStorageInfo, getStorageInfo } from "./Storage";
import NavigationService from "./navservice";
import constant from "./Constant";
const deviceId = DeviceInfo.getUniqueID();
export const setOnline = () => {
    firebase.database().goOnline();
}
export const checkStartTime = async () => {
    NetInfo.isConnected.fetch().then(async isConnected => {
        if (isConnected) {
            SystemSetting.isAirplaneEnabled().then((enable) => {
                console.log("isConnected", enable, isConnected);
                if (enable) {
                    checkStartTimeLocal();
                } else {
                    checkStartTimeFireBase();
                }
            });
        } else {
            checkStartTimeLocal();
        }
    });

}
export const checkStartTimeFireBase = async () => {
    const ref = firebase.database().ref(`users/${deviceId}/`);
    return ref.once('value').then(function (snapshot) {
        if (snapshot.val() !== null) {
            const startTimeMs = Number(snapshot.val().startTimeMs);
            const remainDays = getRemainday(startTimeMs);
            console.log("check start time", snapshot.val().startTimeMs, remainDays);
            setStorageInfo(constant.ORIGIN_PURCHASE_DATE_MS, startTimeMs);
            if (remainDays >= constant.FREE_TRIAL_DAYS) {
                NavigationService.navigate("PayScene")
            } else {
                NavigationService.navigate("MainScene")
            }
        } else {
            setStartTime(getUTCToday());
            NavigationService.navigate("MainScene")
        }
    });
}
export const checkStartTimeLocal = async () => {
    let startTimeMs = await getStorageInfo(constant.ORIGIN_PURCHASE_DATE_MS);
    if (!startTimeMs) {
        startTimeMs = getUTCToday();
    }
    const transaction_id = await getStorageInfo(constant.TRANSACTION_ID);
    if (transaction_id) {
        NavigationService.navigate("MainScene")
    } else {
        const remainDays = getRemainday(startTimeMs);
        console.log("check start time", startTimeMs, remainDays);
        if (remainDays >= constant.FREE_TRIAL_DAYS) {
            NavigationService.navigate("PayScene")
        } else {
            NavigationService.navigate("MainScene")
        }
    }
}
export const setStartTime = async (startTimeMs) => {
    setStorageInfo(constant.ORIGIN_PURCHASE_DATE_MS, startTimeMs);
    const ref = firebase.database().ref(`users/${deviceId}/`);
    ref.set({
        startTimeMs,
        deviceId
    });
}
export const updateStartTime = async (startTimeMs) => {
    setStorageInfo(constant.ORIGIN_PURCHASE_DATE_MS, startTimeMs);
    const ref = firebase.database().ref(`users/${deviceId}/`);
    ref.set({
        startTimeMs,
        deviceId
    });
}
export const logEvent = async (key, info) => {
    console.log(key, info);
    firebase.analytics().logEvent(key, { deviceId, info });
}
export const getRemainday = (startTimeMs) => {
    const currentMs = getUTCToday();
    const remainDays = Math.floor(((currentMs - startTimeMs) / constant.ONE_DAY));
    console.log("remain days", remainDays);
    if (remainDays < 0) {
        return 0;
    }
    return remainDays;
}


