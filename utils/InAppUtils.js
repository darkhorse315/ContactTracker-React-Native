import R from "ramda";
import { NativeModules, Platform } from "react-native";
const { InAppUtils } = NativeModules;
const ProdChecker = Platform.OS === "ios" ? NativeModules.ProdChecker : undefined;
import iapReceiptValidator from 'iap-receipt-validator';
import Constant from "./Constant";
import NavigationService from "./navservice";
import { setStorageInfo, removeStorageInfo } from "./Storage";
import { updateStartTime, checkStartTime, logEvent } from "./Firebase";
var isTestflight = false;
const product_id = "org.reactjs.native.example.ContactTracker.yearlySubscription";
Platform.OS === "ios" && ProdChecker.isTestflight().then(val => {
    if (val === "TESTFLIGHT") {
        isTestflight = false;
    } else {
        isTestflight = true;
    }
})
export const validateRestoreSubscribe = async () => {
    InAppUtils.receiptData(async (error, receiptData) => {
        if (error) {
            console.log("Restore error == > GetReceiptData_Failed", error)
        } else {
            const validateReceipt = iapReceiptValidator(Constant.SHARED_SEC, isTestflight);
            var validationData;
            try {
                validationData = await validateReceipt(receiptData);
            } catch (err) {
                console.log("Restore error == > GetValidationData_Failed", err)
                validationData = await validateReceipt(receiptData);
            }
            if (validationData !== null && validationData !== undefined && validationData['latest_receipt_info'] && validationData['latest_receipt_info'].length) {
                console.log("Restore In App Purchase stared", validationData)
                var filterData = [];
                for (const idx in validationData['latest_receipt_info']) {
                    const filterObj = validationData['latest_receipt_info'][idx];
                    if (filterObj.product_id === product_id) {
                        filterData.push(filterObj);
                    }
                }
                if (filterData.length > 0) {
                    const expireDateMS = Number(R.last(filterData).expires_date_ms);
                    const todayDateMS = getUTCToday();
                    console.log("Restore In App Purchase Check", R.last(filterData).transaction_id, { expireDateMS, todayDateMS })
                    if (expireDateMS > todayDateMS) {
                        console.log("Restore In App Purchase Valid", { expireDateMS, todayDateMS })
                        await setStorageInfo(Constant.ORIGIN_PURCHASE_DATE_MS, expireDateMS);
                        await setStorageInfo(Constant.TRANSACTION_ID, R.last(filterData).transaction_id);
                        updateStartTime(expireDateMS);
                        return;
                    } else {
                        console.log("Restore In App Purchase InValid", { expireDateMS, todayDateMS })
                        logEvent("Restore InvalidPurchase", R.last(filterData));
                    }
                }
            } else {
                console.log("Restore error == > GetValidationData_Failed", validationData)
            }
        }
        await removeStorageInfo(Constant.TRANSACTION_ID);
    });
}
export const validateSubscribe = async () => {
    InAppUtils.receiptData(async (error, receiptData) => {
        if (error) {
            console.log("error == > GetReceiptData_Failed", error)
            logEvent("ReceiptData_Failed", error);
        } else {
            const validateReceipt = iapReceiptValidator(Constant.SHARED_SEC, isTestflight);
            var validationData;
            try {
                validationData = await validateReceipt(receiptData);
            } catch (err) {
                console.log("error == > GetValidationData_Failed", err)
                logEvent("ValidationData_Failed", err);
                validationData = await validateReceipt(receiptData);
            }
            if (validationData !== null && validationData !== undefined && validationData['latest_receipt_info'] && validationData['latest_receipt_info'].length) {
                console.log("In App Purchase stared", validationData)
                var filterData = [];
                for (const idx in validationData['latest_receipt_info']) {
                    const filterObj = validationData['latest_receipt_info'][idx];
                    if (filterObj.product_id === product_id) {
                        filterData.push(filterObj);
                    }
                }
                if (filterData.length > 0) {
                    const expireDateMS = Number(R.last(filterData).expires_date_ms);
                    const todayDateMS = getUTCToday();
                    console.log("In App Purchase Check", { expireDateMS, todayDateMS })
                    if (expireDateMS > todayDateMS) {
                        console.log("In App Purchase Valid", R.last(filterData).transaction_id, { expireDateMS, todayDateMS })
                        await setStorageInfo(Constant.ORIGIN_PURCHASE_DATE_MS, expireDateMS);
                        await setStorageInfo(Constant.TRANSACTION_ID, R.last(filterData).transaction_id);
                        updateStartTime(expireDateMS);
                        logEvent("ValidPurhcase", R.last(filterData))
                        NavigationService.navigate("MainScene")
                        return;
                    } else {
                        console.log("In App Purchase InValid", { expireDateMS, todayDateMS })
                        logEvent("InvalidPurchase", R.last(filterData));
                        await setStorageInfo(Constant.ORIGIN_PURCHASE_DATE_MS, expireDateMS);
                        updateStartTime(expireDateMS);
                        await removeStorageInfo(Constant.TRANSACTION_ID);
                        NavigationService.navigate("PayScene");
                        return;
                    }
                }
            } else {
                console.log("error == > GetValidationData_Failed", validationData)
                logEvent("ValidationData_Failed", validationData)
            }
        }
        await removeStorageInfo(Constant.TRANSACTION_ID);
        checkStartTime();
    });
}
export const getUTCToday = () => {
    let todayEpoch = new Date().getTime();
    return todayEpoch;
};