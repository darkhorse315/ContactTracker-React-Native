import { onShowAlert } from "../utils/Utils";
import Mailer from 'react-native-mail';
var RNFS = require('react-native-fs');
import { appName } from '../styles/Scaling';
import { multiGetStorageInfo } from "../utils/Storage";
export default class SendExport {

    constructor() {

    }

    async createExportFile(keys) {
        let csvString = '';
        let lines = ['"Name", "Phone Numbers", "Emails", "City", "Events", "Created At"'];
        let stores = await multiGetStorageInfo(keys);
        stores.map((result, i, store) => {

            if (result[1] != null) {
                // get at each store's key/value so you can work with it
                // let key = store[i][0];
                let value = store[i][1];
                let contactInfoObj = JSON.parse(value);

                let fullName = '"' + contactInfoObj.fullName + '"';
                let phoneNumberList = '"' + contactInfoObj.phoneNumbers + '"';
                let emailList = '"' + contactInfoObj.emailAddresses + '"';
                let city = '"' + contactInfoObj.city + '"';

                let eventNameList = [];
                contactInfoObj.eventList.map((event) => {
                    eventNameList.push(event.title);
                });
                let eventList = '"' + eventNameList.toString() + '"';
                let createdAt = '"' + new Date(contactInfoObj.createdAt) + '"';
                lines.push(fullName + "," + phoneNumberList + "," + emailList + "," + city + "," + eventList + "," + createdAt);
            }
        });

        csvStr = lines.join('\n');
        // create a path you want to write to
        var path = RNFS.DocumentDirectoryPath + '/ContactTracker.csv';
        // write the file
        RNFS.writeFile(path, csvStr, 'utf8')
            .then((success) => {
                // console.log('FILE WRITTEN!');
                this._handleEmail(path);
                // return RNFS.unlink(path)
                //     .then(() => {
                //         console.log('FILE DELETED');
                //     })
                //     // `unlink` will throw an error, if the item to unlink does not exist
                //     .catch((err) => {
                //         console.log(err.message);
                //     });
            })
            .catch((err) => {
                console.log(err.message);
                onShowAlert("Error", err.message)
            });

    }

    _handleEmail = (path) => {

        console.log("sending");
        Mailer.mail({
            subject: appName + ' export',
            body: appName + '<b> Export</b>',
            isHTML: true,
            attachment: {
                path: path,  // The absolute path of the file from which to read data.
                type: 'text',   // Mime Type: jpg, png, doc, ppt, html, pdf
                name: 'ContactTracker.csv',   // Optional: Custom filename for attachment
            }
        }, (error, event) => {
            if (error == 'not_available') { error = "It looks like you haven't set up an email address on this phone. Please add a mail account and try again."; }
            onShowAlert("Error", error)
        });
    }
}