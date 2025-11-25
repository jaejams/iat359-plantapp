import { useState, useEffect, useCallback } from "react"; // useState = Reat hook for adding & managing state in functional components. useCallback = hook to memoize a callback function, i.e. cache the result of a function. The result of a function will only be recreated if one of its dependencies change.  
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore"; // methods from the Firebase, which is noSQL, document-oriented database. Collection = gets a collection reference, getDocs = fetches documents from the database, query = constructs a query, where = adds filtering conditions
import { db } from "../firebaseConfig.js";
import { useRoute, useFocusEffect } from "@react-navigation/native"; // useRoute = access the route prop, key props provided to every screen component. useFocusEffect = run function every time the screen is in focus. 


export default function PlantListScreen({ navigation }) {
    const [plants, setPlants] = useState([]); // initializes the plants state variable as an array []. setPlants is the function to update it. 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const route = useRoute(); // hook to access the route object. I'll use route.params object to retrieve the passes parameters. 
    const [headerText, setHeaderText] = useState("My Plant Collection"); // headerText state variable initialized with the current state 'My Plant Collection'. 

    // These filter parameters will be passed via navigation
    const filterParams = route.params?.filters; // filter objects are passed through 'filters' parameter

    function formatDate(date) { 
        // reference: https://www.geeksforgeeks.org/javascript/how-to-get-month-and-date-of-javascript-in-two-digit-format/
        if (!date) return "No date data available";

        // If Firestore timestamp, then convert to a js date object. 
        if (date.toDate && typeof date.toDate === "function") {
            date = date.toDate();
        }

        // If string or number, then convert to a js date object. 
        if (!(date instanceof Date)) {
            date = new Date(date);
        }

        if (isNaN(date)) return "Invalid"; //check if the date is an invalid date using isNan() function as per https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isNaN

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
    useFocusEffect( // trigger the data to fetch every time the screen is in focus. 
        useCallback(() => {
            // This code runs every time the screen comes into focus
            console.log("In PlantListScreen now: received filter parameters:", filterParams);
            fetchPlants();

        }, [filterParams]) // this is dependency array, fetchPlants depends on 'filterParams'. If params change, callback's redefined. 

    );

    // Function to retrieve all plants or filtered plants from Firestore.
    // async functions = used to handle operations that take some time to complete; the program will continue running other operations while waiting for async tasks. Data fetching will take some time, so async function's used. 
    // This uses async/await. Await = used to pause execution of the async function until the result returns (i.e. promise resolves). 
    async function fetchPlants() {
        setIsLoading(true);
        setError(null);

        // {try...catch} in Javascript is used to handle errors in code. "Try" a block of code, then "catch" any errors. 
        try { // In Firestore, there's no tables or rows. Instead, data's stored in documents, which must be stored in collections. Each document contains a set of key-value pairs. 
            let q = collection(db, "plants"); // Start query reference 'q' to the base collection named "plants". "plants" is in the Firestore dababase 'db'. 
            let isFiltered = false;

            // Check if filter parameters exist and apply them
            if (filterParams) {
                const whereArr = [];
                // Apply filters only if they exist in the passed object
                if (filterParams.name) whereArr.push(where("nameLower", "==", filterParams.name)); // if 'name' filter exists, then push 'where("name", "==", filterParams.name)' to whereArr. 
                if (filterParams.type) whereArr.push(where("typeLower", "==", filterParams.type));
                if (filterParams.location) whereArr.push(where("locationLower", "==", filterParams.location));

                // If any filters were added, create the query
                if (whereArr.length > 0) {
                    q = query(collection(db, "plants"), ...whereArr); // combine collection(db, 'plants') i.e. base collection reference and spread array '...whereArr'
                    isFiltered = true;
                }
            }

            if (isFiltered) {
                console.log("PlantListScreen: Executing FILTERED query.");
                setHeaderText("Filtered Search Results"); // if the list's filtered, set the header text to this. 
            } else {
                console.log("PlantListScreen: Executing ALL plants query (no filters provided).");
                setHeaderText("All Plant Collections")
            }

            // The process uses asynchronous functions to handle an operation that takes some time to complete
            const querySnapshot = await getDocs(q); // await = pauses fetchPlants until the promise from getDocs is returned

            if (querySnapshot.empty) {
                console.log("No matching plants found.");
                setPlants([]);
                setIsLoading(false);
                return;
            }


            const fetchedPlants = [];

            // iterates over the results. forEach method processes each document returned by Firestore. 
            querySnapshot.forEach((doc) => {
                const data = doc.data();

                const dateValue = data.dateAdded
                    ? (typeof data.dateAdded.toDate === 'function' ? data.dateAdded.toDate() : data.dateAdded)
                    : null;
                fetchedPlants.push({
                    id: doc.id,
                    name: data.name,
                    type: data.type,
                    location: data.location,
                    dateAdded: dateValue,
                    // extracts Firestore timestamp from Firestore document, then converts it into a Javascript Date object. 
                });
            });

            console.log(`PlantListScreen: Successfully fetched ${fetchedPlants.length} plants.`);


            setPlants(fetchedPlants); // update setPlants with the fetched data 
            setIsLoading(false); // turn off setIsLoading. isLoading = state variable used to manage conditional rendering. 

        } catch (error) { // catches any errors that occur during the fetch() call or while parsing the response. 
            console.error("Error fetching plants:", error);
        }
    }


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
            <Text style={styles.headerText}>{headerText}</Text>

            {isLoading ? ( // if the list's loading, then display: 
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
        width: "95%",
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
        width: '95%'

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
        shadowOpacity: 0.3,
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
        color: '#ff1900ff',
    },
    errorText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: 'red',
        fontWeight: 'bold',
    }
});