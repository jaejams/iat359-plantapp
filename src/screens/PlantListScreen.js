import { useState, useEffect, useCallback } from "react"; // Import useEffect
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore"; // Import Firestore methods
import { db } from "../firebaseConfig.js";
import { useRoute, useFocusEffect } from "@react-navigation/native";


export default function PlantListScreen({ navigation }) {
    const [plants, setPlants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); // Added state for error handling
    const route = useRoute();

    // These filter parameters will be passed via navigation
    // The query is structured as a regular JavaScript object containing parameters
    const filterParams = route.params?.filters; // filter objects are passed through 'filters' parameter

    function formatDate(date) {
        if (!date) return "No date data available";
        return date.toLocaleString(); // Simple readable format
    }
    useFocusEffect(
        useCallback(() => {
            // This code runs every time the screen comes into focus
            console.log("In PlantListScreen now--received filter parameters:", filterParams);
            fetchPlants();

        }, [filterParams]) // this is dependency array, fetchPlants depends on 'filterParams'. If params change, callback's redefined. 

    );

    //Function to retrieve all plants or filtered plants from Firestore.
    // This uses async/await, which is necessary for interacting with external APIs/services. 
    async function fetchPlants() {
        setIsLoading(true);
        setError(null);
        try {
            let q = collection(db, "plants"); // Start with the base collection reference
            let isFiltered = false;

            // Check if filter parameters exist and apply them
            if (filterParams) {
                const whereArr = [];
                // Apply filters only if they are present in the passed object
                if (filterParams.name) whereArr.push(where("name", "==", filterParams.name));
                if (filterParams.type) whereArr.push(where("type", "==", filterParams.type));
                if (filterParams.location) whereArr.push(where("location", "==", filterParams.location));

                // If any filters were added, create the query
                if (whereArr.length > 0) {
                    q = query(collection(db, "plants"), ...whereArr);
                    isFiltered = true;
                }
            }

            if (isFiltered) {
                console.log("PlantListScreen: Executing FILTERED query.");
            } else {
                console.log("PlantListScreen: Executing ALL plants query (no filters provided).");
            }

            // The process uses asynchronous functions to handle an operation that takes some time to complete
            const querySnapshot = await getDocs(q); // Pause until data is fetched 

            if (querySnapshot.empty) {
                console.log("No matching plants found.");
                setPlants([]);
                setIsLoading(false);
                return;
            }


            const fetchedPlants = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                fetchedPlants.push({
                    id: doc.id,
                    name: data.name,
                    type: data.type,
                    location: data.location,
                    dateAdded: data.dateAdded ? data.dateAdded.toDate() : null,  // converting firestore timestamp
                });
            });

            console.log(`PlantListScreen: Successfully fetched ${fetchedPlants.length} plants.`);


            setPlants(fetchedPlants);
            setIsLoading(false);

        } catch (error) {
            console.error("Error fetching plants:", error);
        }
    }

    // Use useEffect to run fetchPlants immediately after the initial render of the component
    // This hook is used for 'side effects' such as connecting to a database/API 

    // Component to render each item in the FlatList
    const renderPlantItem = ({ item }) => (
        <View style={styles.plantItem}>
            <Text style={styles.plantName}>🌱 {item.name} 🌱</Text>
            <Text style={styles.plantDetail}>Type: {item.type}</Text>
            <Text style={styles.plantDetail}>Location: {item.location}</Text>
            <Text style={styles.plantDetail}>
                Time Added: {formatDate(item.dateAdded)}
            </Text>
        </View>
    );


    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>My Plant Collection</Text>

            {isLoading ? (
                <Text style={styles.loadingText}>Loading plants...</Text>
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : plants.length > 0 ? (
                // FlatList is the component for rendering lists of data
                <FlatList
                    style={styles.flatlist}
                    data={plants}
                    renderItem={renderPlantItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            ) : (
                <Text style={styles.emptyText}>No plants found matching the criteria.</Text>
            )}
            <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.buttons}>
                <Text style={styles.buttonText}>Back to Home</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({

    buttons: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#d46c35",
        height: 50,
        padding: 10,
        marginVertical: 8,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    flatlist: {
        flex: 1,
        width: '100%'

    },
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        padding: 10,
        alignItems: "center",
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#2C3E50",
        textAlign: "center",
        marginVertical: 15,
    },
    listContainer: {
        paddingBottom: 20,
    },
    plantItem: {
        backgroundColor: "#FFFFFF",
        padding: 15,
        marginVertical: 8,
        borderRadius: 10,
        borderLeftWidth: 5,
        borderLeftColor: "#d46c35",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 2,
    },
    plantName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#34495E",
        marginBottom: 5,
    },
    plantDetail: {
        fontSize: 14,
        color: "#7F8C8D",
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#E74C3C',
    },
    errorText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: 'red',
        fontWeight: 'bold',
    }
});