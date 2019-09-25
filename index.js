import { AppRegistry } from 'react-native';
import App from "./router";
import { name as AppName } from "./app.json";
AppRegistry.registerComponent(AppName, () => App);