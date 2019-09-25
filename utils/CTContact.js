import { NativeModules } from 'react-native';
import { contactNotesDelimiter, oldContactNotesDelimiter, emptyLinesBeforeDelimiter, appName } from '../styles/Scaling';
const Contacts = NativeModules.Contacts;
import { getAllStorageKeys, getStorageInfo, multiGetStorageInfo, setStorageInfo, multiSetStorageInfo, restoreAllKeys } from "./Storage";
import constant from "./Constant";
import { onShowAlert, openLink } from "./Utils";
export default class CTContact {
  constructor(contactID, contactName) {
    this.contactID = contactID;
    this.contactName = contactName;
  }
  static async updateContact(contactInfo) {
    await this.permissionCheckContacts();
    console.log('CTContact -> updateContact = ', contactInfo)
    let contactId = contactInfo.contactID;
    await setStorageInfo(contactId, contactInfo);
    console.log('contactInfoObj => ', contactInfo);
    Contacts.getContactsMatchingString(contactInfo.fullName, (err, contacts) => {
      //update the first record
      if (err) {
        onShowAlert("Error", err.message || "Error matching contacts");
      }
      let foundContact = false;
      contacts.forEach((contact) => {
        if (!foundContact && contact.recordID === contactId) {
          foundContact = true;
          console.log('found contact ' + contactId);
          console.log(contact);
          let idx = contact.note.indexOf(contactNotesDelimiter);
          if (idx == -1) { idx = contact.note.indexOf(oldContactNotesDelimiter); }
          if (idx >= 0) {
            contact.note = contact.note.substring(0, idx) + contactNotesDelimiter + "\n" + JSON.stringify(contactInfo);
            Contacts.updateContact(contact, (err) => {
              console.log("update contacts =>", contact, err)
            });
          } else {
            let spaceAboveDelimiter = '';
            for (let i = 0; i < emptyLinesBeforeDelimiter; i++) {
              spaceAboveDelimiter += "\n";
            }
            contact.note = contact.note + spaceAboveDelimiter + contactNotesDelimiter + "\n" + JSON.stringify(contactInfo);
            Contacts.updateContact(contact, (err) => {
              console.log("update contacts =>", contact, err)
              if (err) {
                onShowAlert("Error", err.message || "Error updating contacts")
              }
            });
          }
        }
      });
    });
  }

  static getInitContact(contactId, fullName) {
    let dateTimeNow = new Date();
    let offsetInHours = dateTimeNow.getTimezoneOffset() / 60;
    let d = new Date();
    d.setHours(d.getHours() + offsetInHours);

    let initContact =
    {
      "contactID": contactId,
      "latitude": null,
      "longitude": null,
      "geocodePosition": null,
      "city": 'Not set',
      "fullName": fullName,
      "firstName": fullName,
      "lastName": fullName,
      "emailAddresses": [],
      "phoneNumbers": [],
      "tag": false,
      tagList: [],
      "createdAt": Date.now(),
      "createdYear": d.getFullYear(),
      "createdMonth": d.getMonth() + 1,
      event: false,
      eventList: []
    };
    return initContact;
  }

  /**
   * 
   */
  saveContact = async (contactInfo, curDate, totalContacts, callback) => {
    await this.permissionCheckContactsLocal();
    contactID = this.contactID;
    contactName = this.contactName;
    let callbackCalled = false;
    console.log('CTC saveContact storage0', contactID, contactInfo);
    await setStorageInfo(contactID, contactInfo);
    if (!callbackCalled) {
      callbackCalled = true;
      callback(true, contactInfo, null);
    }
    // update contact in phonebook
    Contacts.getContactsMatchingString(contactInfo.fullName, async (err, contacts) => {
      //update the first record
      if (err) {
        onShowAlert("Error", err.message || "Error fetching contacts");
      }
      let foundContact = false;
      contacts.forEach(async (contact) => {
        if (contact.recordID === contactID) {
          foundContact = true;
          // console.log(contact);  
          let formattedAddress = (contactInfo.geocodePosition == null ? 'Not set' : contactInfo.geocodePosition.formattedAddress);
          let notes = "Added by " + appName + "\nMy location:\n" + formattedAddress + "\n";
          notes += "\nDate:\n" + new Date(contactInfo.createdAt);
          // notes += (contactInfo.event ? ("\nConcurrent Events:\n" + contactInfo.event.title) : "");
          if (contactInfo.event) {
            notes += "\nConcurrent Events:\n";
            contactInfo.eventList.forEach((event) => {
              notes += event.title + "\n";
            });
          }

          contact.emailAddresses.forEach((emailObj) => { contactInfo.emailAddresses.push(emailObj.email) });
          contact.phoneNumbers.forEach((phoneObj) => { contactInfo.phoneNumbers.push(phoneObj.number) });
          contactInfo.fistName = contact.givenName;
          contactInfo.lastName = contact.familyName;
          console.log('CTC saveContact storage1', contactID, contactInfo);
          await setStorageInfo(contactID, contactInfo);

          let spaceAboveDelimiter = '';
          for (let i = 0; i < emptyLinesBeforeDelimiter; i++) {
            spaceAboveDelimiter += "\n";
          }
          contact.note = notes + spaceAboveDelimiter + contactNotesDelimiter + "\n" + JSON.stringify(contactInfo);
          Contacts.updateContact(contact, (err) => {
            if (!callbackCalled) {
              callbackCalled = true;
              callback(true, contactInfo, null);
            }
          });
        }
      });
      if (!foundContact) { console.log('!foundContact') };
    })
    return false;
  }


  async restoreContacts(callback) {
    console.log("Restore contact started1");
    const resCheck = await this.permissionCheckContactsLocal();
    console.log("Restore contact started2", resCheck);
    let keyValuePairs = [];
    let tagList = new Set();
    Contacts.getAllWithoutPhotos(async (err, contacts) => {
      // console.log(contacts);
      if (err) {
        onShowAlert("Error", err.message || "Error fetching contacts without photo");
      }
      contacts.forEach((contact) => {
        let idx = contact.note.indexOf(contactNotesDelimiter);
        if (idx == -1) {
          idx = contact.note.indexOf(oldContactNotesDelimiter);
          if (idx >= 0) {
            // update to new app name
            console.log('new app name change');
            let re = new RegExp(oldContactNotesDelimiter, 'g');
            contact.note = contact.note.replace(re, contactNotesDelimiter);
            Contacts.updateContact(contact, (err) => {

            });
          }
        }
        //
        let contactJSONStartIdx = -1;
        if (idx >= 0) {
          contactJSONStartIdx = idx + contactNotesDelimiter.length;
          let iPhoneRecordId = contact.recordID;
          ctContactJSON = contact.note.substring(contactJSONStartIdx);
          try {
            ctContactObj = JSON.parse(ctContactJSON);
            // console.log(ctContactObj);
            if (this._validateCTContactObj(ctContactObj)) {
              // add contact in app
              ctContactObj.contactID = iPhoneRecordId;
              ctContactObj.firstName = contact.givenName;
              ctContactObj.lastName = contact.familyName;
              ctContactObj.fullName = (contact.givenName + " " + contact.familyName).trim();
              ctContactObj.tagList.forEach(tag => {
                tagList.add(tag);
              });
              keyValuePairs.push([iPhoneRecordId, JSON.stringify(ctContactObj)]);
            } else {
              console.log('Invalid ctContact found');
              console.log(ctContactObj);
            }

          } catch (e) {
            console.log('Invalid ctContact JSON found');
            console.log(ctContactJSON);
          }
        } else {
          // non contact tracker contact          
        }
      });

      console.log('restoreContacts ---- 1');

      console.log('restoreContacts ---- 2');

      if (keyValuePairs.length > 0) {
        await multiSetStorageInfo(keyValuePairs);

        let settingsObj = await getStorageInfo(constant.KEY_SETTINGS);
        if (tagList.size > 0) {
          settingsObj.contactTags = Array.from(tagList);
        } else {
          console.log('No tags were found');
        }
        settingsObj.totalContacts = keyValuePairs.length;
        console.log('CTC restoreContacts storage', constant.KEY_SETTINGS, settingsObj);
        await setStorageInfo(constant.KEY_SETTINGS, settingsObj);
        if (callback != null) {
          console.log('restoreContacts ---- 3');
          callback(false, '');
        }
      } else {
        console.log('No matching contacts were found');
        if (callback != null) {
          console.log('restoreContacts ---- 3');
          callback(false, '');
        }
      }
    });
  }


  static async getAllTags() {
    let settingsObj = await getStorageInfo(constant.KEY_SETTINGS);
    return settingsObj.contactTags;
  }

  // static async deleteTag(tag) {
  static async deleteTags(tags) {
    await this.permissionCheckContacts();
    let settingsObj = await getStorageInfo(constant.KEY_SETTINGS);
    tags.forEach(tag => {
      let idx = settingsObj.contactTags.indexOf(tag);
      if (idx > -1) {
        settingsObj.contactTags.splice(idx, 1);
      }
    });
    console.log('CTC deleteTags storage1', constant.KEY_SETTINGS, settingsObj);
    await setStorageInfo(constant.KEY_SETTINGS, settingsObj);
    let keys = await restoreAllKeys();
    let stores = await multiGetStorageInfo(keys);
    let keyValuePairs = [];
    stores.map((result, i, store) => {
      let contactInfoObj = JSON.parse(store[i][1]);
      let foundTag = false;
      tags.forEach(tag => {
        let idx = contactInfoObj.tagList.indexOf(tag);
        if (idx > -1) {
          foundTag = true;
          contactInfoObj.tagList.splice(idx, 1);
        }
      });
      if (foundTag) {
        if (contactInfoObj.tagList.length == 0) {
          contactInfoObj.tag = false;
        }
        keyValuePairs.push([contactInfoObj.contactID, JSON.stringify(contactInfoObj)]);
        CTContact.updateContact(contactInfoObj);
      }
    });
    if (keyValuePairs.length > 0) {
      await multiSetStorageInfo(keyValuePairs);
      console.log('Tags have been removed from ' + keyValuePairs.length + ' contacts');
    }
  }

  static async getContactsByMatchingString(fullData, match) {

    match = match.toLowerCase();

    let contactIds = [];
    let filteredDataItems = [];

    fullData.forEach(dataItem => {
      // console.log(dataItem);
      let key = dataItem.key;
      let data = dataItem.data;
      let filteredData = [];
      data.forEach(contactIdName => {
        let contactName = contactIdName.name;
        if (contactName.toLowerCase().indexOf(match) > -1) {
          filteredData.push({ key: contactIdName.key, name: contactName });
          contactIds.push(contactIdName.key);
        }
      });
      if (filteredData.length > 0) {
        filteredDataItems.push({ key: key, data: filteredData });
      }
    });

    return { filteredDataItems, contactIds };
  }

  static async getContactsByMatchingStringAlphabetList(fullData, match) {
    match = match.toLowerCase();

    let contactIds = [];
    let filteredData = {
      'A': [], 'B': [], 'C': [], 'D': [], 'E': [],
      'F': [], 'G': [], 'H': [], 'I': [], 'J': [],
      'K': [], 'L': [], 'M': [], 'N': [], 'O': [],
      'P': [], 'Q': [], 'R': [], 'S': [], 'T': [],
      'U': [], 'V': [], 'W': [], 'X': [], 'Y': [],
      'Z': []
    };

    // ToDo include unknown letters
    const letterHeaders = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    letterHeaders.forEach(letter => {
      if (undefined !== fullData[letter]) {

        fullData[letter].forEach(data => {

          let contactId = data.key;
          let contactName = data.name;
          if (contactName.toLowerCase().indexOf(match) > -1) {
            contactIds.push(contactId);
            console.log('Found ' + contactId);
            filteredData[letter].push({ key: contactId, name: contactName });
          }
        });
      }
    });
    letterHeaders.forEach(letter => {
      if (filteredData[letter].length == 0) {
        delete filteredData[letter];
      }
    });

    return { filteredData, contactIds };
  }

  static async getAllDataAndContactIdsAlphabetList() {
    await this.permissionCheckContacts();
    const data = {
      'A': [], 'B': [], 'C': [], 'D': [], 'E': [],
      'F': [], 'G': [], 'H': [], 'I': [], 'J': [],
      'K': [], 'L': [], 'M': [], 'N': [], 'O': [],
      'P': [], 'Q': [], 'R': [], 'S': [], 'T': [],
      'U': [], 'V': [], 'W': [], 'X': [], 'Y': [],
      'Z': []
    };
    const contactIds = [];
    const letterHeaders = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    var prom = new Promise((resolve, reject) => {
      Contacts.getAllWithoutPhotos((err, allPhoneContacts) => {
        if (err) {
          onShowAlert("Error", err.message || "Error getting contacts without photo");
        } else {
          allPhoneContacts.forEach(contact => {
            let contactId = contact.recordID;
            contactIds.push(contactId);
            let fullName = (contact.givenName + " " + contact.familyName).trim();
            let firstLetter = fullName.substring(0, 1).toUpperCase();
            if (undefined === data[firstLetter]) {
              // unknown character
              data[firstLetter] = [{ key: contactId, name: fullName }];
            } else {
              data[firstLetter].push({ key: contactId, name: fullName });
            }
          });
        }
        letterHeaders.forEach(letter => {
          if (data[letter].length == 0) {
            delete data[letter];
          }
        });
        resolve([data, contactIds]);
      });
    });
    return prom;
  }

  static async getAllDataAndContactIds() {
    await this.permissionCheckContacts();
    const data = [
      { key: 'A', data: [] }, { key: 'B', data: [] }, { key: 'C', data: [] }, { key: 'D', data: [] }, { key: 'E', data: [] },
      { key: 'F', data: [] }, { key: 'G', data: [] }, { key: 'H', data: [] }, { key: 'I', data: [] }, { key: 'J', data: [] },
      { key: 'K', data: [] }, { key: 'L', data: [] }, { key: 'M', data: [] }, { key: 'N', data: [] }, { key: 'O', data: [] },
      { key: 'P', data: [] }, { key: 'Q', data: [] }, { key: 'R', data: [] }, { key: 'S', data: [] }, { key: 'T', data: [] },
      { key: 'U', data: [] }, { key: 'V', data: [] }, { key: 'W', data: [] }, { key: 'X', data: [] }, { key: 'Y', data: [] },
      { key: 'Z', data: [] }
    ];
    const contactIDs = [];
    const letterHeaders = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    var prom = new Promise((resolve, reject) => {
      Contacts.getAll((err, allPhoneContacts) => {
        if (err) {
          onShowAlert("Error", err.message || "Error getting all contacts");
        } else {
          allPhoneContacts.forEach(contact => {
            let contactId = contact.recordID;
            contactIDs.push(contactId);
            let fullName = (contact.givenName + " " + contact.familyName).trim();
            let firstLetter = fullName.substring(0, 1).toUpperCase();
            let position = letterHeaders.indexOf(firstLetter);
            if (position == -1) {
              // unknown character
              letterHeaders.push(firstLetter);
              position = letterHeaders.length - 1;
              data.push({ key: firstLetter, data: [{ key: contactId, name: fullName }] });
            } else {
              data[position].data.push({ key: contactId, name: fullName });
            }
          });
        }
        resolve([data, contactIDs]);
      });
    });
    return prom;
  }

  _validateCTContactObj(ctContactObj) {

    // console.log('_validateCTContactObj checking ' + JSON.stringify(ctContactObj));
    let propertyList = [
      'contactID',
      // 'contactIdentifier',
      'latitude',
      'longitude',
      'geocodePosition',
      'city',
      // 'contactIdx',
      'createdAt',
      'createdMonth',
      'createdYear',
      'emailAddresses',
      'event',
      'eventList',
      'fullName',
      'phoneNumbers',
      'tag',
      'tagList',
    ];
    let isMissingProperty = false;
    propertyList.forEach((property) => {
      if (!ctContactObj.hasOwnProperty(property)) {
        console.log('Not found ' + property)
        isMissingProperty = true;
      }
    });

    if (isMissingProperty || !Array.isArray(ctContactObj.tagList)) {
      return false;
    }

    return true;
  }
  static async checkContactPermission() {
    return new Promise((resolve, reject) => {
      Contacts.checkPermission((err, permission) => {
        if (err) {
          reject({ error: err, permission: null })
        } else {
          resolve({ error: null, permission: permission })
        }
      });
    });
  }
  static async requestContactPermission() {
    return new Promise((resolve, reject) => {
      Contacts.requestPermission((req_err, req_permission) => {
        if (req_err) {
          reject({ error: req_err, permission: null })
        } else {
          resolve({ error: null, permission: req_permission })
        }
      })
    });
  }
  static async permissionCheckContacts() {    
    const checkRes = await this.checkContactPermission();
    if (checkRes.error !== null) {
      this.permissionCheckContacts();
    } else if (checkRes.permission === "denied") {
      onShowAlert(
        "Alert",
        "The app can’t tag your contacts without permission to your contacts and location. Tap settings and set the permissions and then try again",
        () => { openLink("app-settings:") },
        () => { },
        "Settings");
    } else if (checkRes.permission === "undefined") {
      const deniedPermission = await this.requestContactPermission();
      if (deniedPermission.permission === "denied") {
        onShowAlert(
          "Alert",
          "The app can’t tag your contacts without permission to your contacts and location. Tap settings and set the permissions and then try again",
          () => { openLink("app-settings:") },
          () => { },
          "Settings");
      }
    }    
  }
  async checkContactPermissionLocal() {
    return new Promise((resolve, reject) => {
      Contacts.checkPermission((err, permission) => {
        if (err) {
          reject({ error: err, permission: null })
        } else {
          resolve({ error: null, permission: permission })
        }
      });
    });
  }
  async requestContactPermissionLocal() {
    return new Promise((resolve, reject) => {
      Contacts.requestPermission((req_err, req_permission) => {
        if (req_err) {
          reject({ error: req_err, permission: null })
        } else {
          resolve({ error: null, permission: req_permission })
        }
      })
    });
  }
  async permissionCheckContactsLocal() {    
    const checkRes = await this.checkContactPermissionLocal();
    if (checkRes.error !== null) {
      this.permissionCheckContactsLocal();
    } else if (checkRes.permission === "denied") {
      onShowAlert(
        "Alert",
        "The app can’t tag your contacts without permission to your contacts and location. Tap settings and set the permissions and then try again",
        () => { openLink("app-settings:") },
        () => { },
        "Settings");
    } else if (checkRes.permission === "undefined") {
      const deniedPermission = await this.requestContactPermissionLocal();
      if (deniedPermission.permission === "denied") {
        onShowAlert(
          "Alert",
          "The app can’t tag your contacts without permission to your contacts and location. Tap settings and set the permissions and then try again",
          () => { openLink("app-settings:") },
          () => { },
          "Settings");
      }
    }    
  }
}