

import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
} from "react-native";
import { collection, addDoc, serverTimestamp} from "firebase/firestore";
import { db } from "../firebaseConfig.js";
import ToastManager, { Toast } from 'toastify-react-native' 


export default function HomeScreen({ navigation }) {
    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [location, setLocation] = useState("");

    const [filterName, setFilterName] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterLocation, setFilterLocation] = useState("");

    const [results, setResults] = useState("");

    function clearFields() {
        setName("");
        setType("");
        setLocation("");
    }

    // Insert new plant into Firestore
    async function insertNewPlant() {
        try {
            const docRef = await addDoc(collection(db, "plants"), {
                name,
                type,
                location,
                dateAdded: serverTimestamp(),     // New field as task #5
            });
            console.log("Document written with ID: ", docRef.id);
            clearFields();
            Toast.success(`Plant "${name}" in "${location}" location inserted into db.`);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }


    // Retrieve all plants
    async function getPlants() {
        navigation.navigate("PlantList");
    }

    // Filter plants based on name, type, or location
    async function filterPlants() {
        const filters = {};
        if (filterName) filters.name = filterName;
        if (filterType) filters.type = filterType;
        if (filterLocation) filters.location = filterLocation;

        if (Object.keys(filters).length === 0) {
            Toast.error('Please enter at least one filter category.');
            return;
        }

        // Navigate to PlantListScreen, passing the filters object
        // The parameters are passed in the navigation prop's navigate method

        console.log("What filters am I using form homescreen to plantlistscreen?", filters);

        navigation.navigate("PlantList", { filters: filters });
    }

    return (
        <ScrollView style = {styles.scrollView} contentContainerStyle={styles.container}>
            <Text style={styles.titleText}>Click below to see all plants.</Text>
            <TouchableOpacity onPress={getPlants} style={styles.buttons}>
                <Text style={styles.buttonText}>Show ALL Plants</Text>
            </TouchableOpacity>

            <Text style={styles.titleText}>Add plants to the list! </Text>
            <TextInput
                style={styles.input}
                onChangeText={setName}
                value={name}
                placeholder="Enter plant name"
            />
            <TextInput
                style={styles.input}
                onChangeText={setType}
                value={type}
                placeholder="Enter plant type"
            />
            <TextInput
                style={styles.input}
                onChangeText={setLocation}
                value={location}
                placeholder="Enter plant location"
            />

            <TouchableOpacity onPress={insertNewPlant} style={styles.buttons}>
                <Text style={styles.buttonText}>Add Plant</Text>
            </TouchableOpacity>


            <Text style={styles.titleText}>Filter the plant list by below category. </Text>
            <View style={styles.filterInputsContainer}>
                <TextInput
                    style={styles.filterInputs}
                    onChangeText={setFilterName}
                    value={filterName}
                    placeholder="Plant Name"
                />
                <TextInput
                    style={styles.filterInputs}
                    onChangeText={setFilterType}
                    value={filterType}
                    placeholder="Type"
                />
                <TextInput
                    style={styles.filterInputs}
                    onChangeText={setFilterLocation}
                    value={filterLocation}
                    placeholder="Location"
                />
            </View>
            <TouchableOpacity onPress={filterPlants} style={styles.buttons}>
                <Text style={styles.buttonText}>Filter Plants</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({

    scrollView: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },

    container: {
        padding: 5,
        alignItems: "center",
    },
    titleText: {
        marginTop: 20,
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 24,
        color: "#2C3E50",
        marginBottom: 10,
    },
    input: {
        width: "90%",
        height: 50,
        borderWidth: 1,
        borderColor: "#B0BEC5",
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        paddingHorizontal: 15,
        marginVertical: 8,
        fontSize: 16,
    },
    buttons: {
        width: "90%",
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
    filterInputsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        width: "90%",
    },
    filterInputs: {
        width: "32%",
        height: 50,
        borderWidth: 1,
        borderColor: "#B0BEC5",
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        paddingHorizontal: 15,
        marginVertical: 8,
        fontSize: 14,
    },
    outputText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#2C3E50",
        marginBottom: 5,
        marginTop: 15,
    },
    resultsText: {
        width: "90%",
        fontSize: 16,
        color: "#2C3E50",
        textAlign: "center",
        padding: 10,
        borderWidth: 2,
    },
});
