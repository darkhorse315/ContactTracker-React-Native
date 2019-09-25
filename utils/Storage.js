import AsyncStorage from '@react-native-community/async-storage';
import constant from "./Constant";
export const getStorageInfo = async key => {
  try {
    var res = await AsyncStorage.getItem(key);
    return JSON.parse(res);
  } catch (error) {
    console.log("get storage error", key, error)
    return null;
  }
};
export const setStorageInfo = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.log("set storage error", key, error)
    return false;
  }
};
export const removeStorageInfo = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.log("set storage error", key, error)
    return false;
  }
};
export const multiGetStorageInfo = async (keys) => {
  try {
    const res = await AsyncStorage.multiGet(keys);
    return res;
  } catch (error) {
    console.log("multi set storage error", keys, error)
    return null
  }
}
export const getAllStorageKeys = async () => {
  try {
    const res = await AsyncStorage.getAllKeys();
    return res;
  } catch (error) {
    console.log("get storage keys error", error)
    return [];
  }
}
export const multiSetStorageInfo = async (keyValuePairs) => {
  try {
    await AsyncStorage.multiSet(keyValuePairs)
    return true;
  } catch (error) {
    console.log("multi set storage error", keyValuePairs, error)
    return false;
  }
};
export const multiRemoveStorageInfo = async (keys) => {
  try {
    await AsyncStorage.multiRemove(keys)
    return true;
  } catch (error) {
    console.log("multi remove storage error", keys, error)
    return false;
  }
};
export const clearInfo = async () => {
  console.log("clear storage info")
  await AsyncStorage.clear();
  return;
};
export const restoreAllKeys = async () => {
  let allKeys = await getAllStorageKeys();
  var index = allKeys.indexOf(constant.KEY_SETTINGS);
  if (index >= 0) {
    allKeys.splice(index, 1);
  }
  index = allKeys.indexOf(constant.KEY_IN_APP_UNLOCKED);
  if (index >= 0) {
    allKeys.splice(index, 1);
  }
  index = allKeys.indexOf(constant.KEY_RATE);
  if (index >= 0) {
    allKeys.splice(index, 1);
  }
  index = allKeys.indexOf(constant.ORIGIN_PURCHASE_DATE_MS);
  if (index >= 0) {
    allKeys.splice(index, 1);
  }
  index = allKeys.indexOf(constant.TRANSACTION_ID);
  if (index >= 0) {
    allKeys.splice(index, 1);
  }
  return allKeys
}