import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const RegisterScreen = ({ navigation, setIsLoggedIn }) => {
    const [username, setUsername] = useState('');

    const registerUser = async () => {
        if (!username.trim()) {
            Alert.alert('Error', 'Please enter a username.');
            return;
        }

        try {
            await AsyncStorage.setItem('username', username);
            await axios.post('https://react-native-chat-app.onrender.com/users/register', { username });

            Alert.alert('Success', 'Registration successful!');

            // Call the function to set isLoggedIn to true
            setIsLoggedIn(true);
            navigation.replace('Home'); // Navigate to Home screen
        } catch (error) {
            console.error('Error registering user:', error);
            Alert.alert('Error', 'Failed to register. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Register</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <Button title="Register" onPress={registerUser} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        fontSize: 24,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 8,
        width: '100%',
    },
});

export default RegisterScreen;
