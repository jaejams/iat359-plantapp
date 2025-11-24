// import { createNativeStackNavigator} from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // reference https://reactnavigation.org/docs/bottom-tab-navigator/

import HomeScreen from "./src/screens/HomeScreen";
import PlantListScreen from "./src/screens/PlantListScreen";

// reference: https://www.npmjs.com/package/toastify-react-native#demo
import ToastManager, { Toast } from 'toastify-react-native'

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <>
            <NavigationContainer>
                <Tab.Navigator initialRouteName="Home">
                    <Tab.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{ title: "Home Screen" }}
                    />
                    <Tab.Screen
                        name="PlantList"
                        component={PlantListScreen}
                        options={{ title: "Plant List Screen" }}
                    />
                </Tab.Navigator>
            </NavigationContainer>
            <ToastManager />
        </>

    );
}