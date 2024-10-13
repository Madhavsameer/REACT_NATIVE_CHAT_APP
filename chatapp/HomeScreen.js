import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation, setIsLoggedIn }) => {
    const logout = async () => {
        await AsyncStorage.removeItem('username');
        setIsLoggedIn(false); // Update the isLoggedIn state
        navigation.replace('Register'); // Navigate to Register screen
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Welcome To Smart Chat😊</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Public Chat')}
            >
                <Text style={styles.buttonText}>Public Chat Room</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Private Chat')}
            >
                <Text style={styles.buttonText}>Private Chat Room</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, styles.logoutButton]}
                onPress={logout}
            >
                <Text style={styles.buttonText}>Logout</Text>

                
            </TouchableOpacity>

            <Text style={styles.heade}>Designed & Developed by Madhav Sameer</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f5',
        padding: 20,
    },
    heade:{
        marginTop:300

    },
    header: {
        fontSize: 24,
        marginBottom: 40,
        fontWeight: 'bold',
        color: '#2C3E50',
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 15,
        width: '80%',
        elevation: 5, // Shadow effect on Android
        shadowColor: '#000', // Shadow color for iOS
        shadowOffset: { width: 0, height: 2 }, // Shadow offset
        shadowOpacity: 0.2, // Shadow opacity
        shadowRadius: 3, // Shadow blur radius
    },
    logoutButton: {
        backgroundColor: '#E74C3C', // Red background for logout
    },
    buttonText: {
        color: '#FFFFFF', // White text color
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default HomeScreen;
