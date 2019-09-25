import { NavigationActions, StackActions, DrawerActions } from "react-navigation";
let _navigator;
function setTopLevelNavigator(navigatorRef) {
    _navigator = navigatorRef;
}
function navigate(routeName, params) {
    _navigator.dispatch(
        NavigationActions.navigate({
            routeName,
            params,
        }),
    );
}
function back() {
    _navigator.dispatch(NavigationActions.back());
}
function push(routeName, params) {
    _navigator.dispatch(
        StackActions.push({
            routeName,
            params,
        }),
    );
}
function openDrawer() {
    _navigator.dispatch(
        DrawerActions.openDrawer()
    );
}
export default {
    navigate,
    setTopLevelNavigator,
    back,
    push,
    openDrawer
};
