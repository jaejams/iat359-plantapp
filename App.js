// import { createNativeStackNavigator} from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // reference https://reactnavigation.org/docs/bottom-tab-navigator/
import { Ionicons } from "@expo/vector-icons"; // reference: https://ionic.io/ionicons

import HomeScreen from "./src/screens/HomeScreen";
import PlantListScreen from "./src/screens/PlantListScreen";

// reference: https://www.npmjs.com/package/toastify-react-native#demo
import { MaterialIcons } from '@expo/vector-icons'; //Toastify uses Material icons. 
import ToastManager, { Toast } from 'toastify-react-native'

const Tab = createBottomTabNavigator();

export default function App() {
    // reference: https://reactnavigation.org/docs/bottom-tab-navigator/
    return (
        <>
            <NavigationContainer> 

                <Tab.Navigator
                    initialRouteName="Home"
                    screenOptions={({ route }) => ({
                        tabBarIcon: ({ focused, color, size }) => {
                            let iconName;

                            if (route.name === "Home") {
                                iconName = focused ? "home" : "home-outline";

                            } else if (route.name === "PlantList") {
                                iconName = focused ? "leaf" : "leaf-outline";
                            }

                            return <Ionicons name={iconName} size={size} color={color} />;
                        },
                        tabBarActiveTintColor: 'green',
                        tabBarInactiveTintColor: 'gray',
                    })

                    }
                >
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