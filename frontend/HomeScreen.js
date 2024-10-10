import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation, onLogout }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Welcome</Text>
            <Button
                style={styles.button}
                title="Public Chat Room"
                onPress={() => navigation.navigate('Public Chat')}
            />
            <Button
                style={styles.button}
                title="Private Chat Room"
                onPress={() => navigation.navigate('Private Chat')}
            />
            <Button
                style={[styles.button, { backgroundColor: 'red' }]}
                title="Logout"
                onPress={onLogout} // Call the logout function passed from App
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: 20,
    },
    header: {
        fontSize: 24,
        marginBottom: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        marginBottom: 5,
        width: '80%',
    },
});

export default HomeScreen;
