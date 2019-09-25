const isDev = false;
export default {
  KEY_SETTINGS: "settings",
  KEY_IN_APP_UNLOCKED: "inappunlocked",
  KEY_RATE: "rated",
  KEY_TITLE: "title",
  TRANSACTION_ID: "transaction_id",
  TESTFLIGHT: "TESTFLIGHT",
  SHARED_SEC: "061fde631eb0406795918fb20ab9ef05",
  ORIGIN_PURCHASE_DATE_MS: "origin_purchase_date_ms",
  FREE_TRIAL_DAYS: isDev ? 1 : 30, // if dev ? hour : day
  ONE_DAY: isDev ? 3600000 : 86400000, // if dev ? hour : day,
  UNIT_TRIAL: isDev ? "hour" : "day", // if dev ? hour : day,  
  currentPosition: null
}