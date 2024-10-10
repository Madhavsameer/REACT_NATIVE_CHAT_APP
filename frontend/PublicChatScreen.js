import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import { io } from 'socket.io-client';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

// Initialize socket connection
const socket = io('https://react-native-chat-app.onrender.com');

const PublicChatScreen = () => {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // Retrieve username from AsyncStorage when the component mounts
        const fetchUsername = async () => {
            try {
                const storedUsername = await AsyncStorage.getItem('username');
                if (storedUsername) {
                    setUsername(storedUsername);
                } else {
                    console.error('No username found in storage');
                }
            } catch (error) {
                console.error('Error fetching username from storage:', error);
            }
        };

        fetchUsername(); // Fetch username

        // Fetch all registered users when the component mounts
        axios.get('https://react-native-chat-app.onrender.com/users')
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => console.error('Error fetching users:', error));

        // Listen for public messages
        socket.on('public message', (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        // Clean up the socket listeners on component unmount
        return () => {
            socket.off('public message');
        };
    }, []);

    const sendPublicMessage = () => {
        if (message) {
            socket.emit('public message', { username, message });
            setMessage(''); // Clear the input field after sending the message
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Public Chat Room</Text>

            {/* Display the logged-in user's username */}
            <Text style={styles.usernameDisplay}>Logged in as: {username}</Text>

            {/* Message Input Section */}
            <View style={styles.messageContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a public message..."
                    value={message}
                    onChangeText={setMessage}
                    onSubmitEditing={sendPublicMessage}  // Send message on pressing Enter
                />
                <Button title="Send Public" onPress={sendPublicMessage} />
            </View>

            {/* Messages Display Section */}
            <View style={styles.messagesDisplay}>
                <Text style={styles.header}>Messages</Text>
                <ScrollView style={styles.messagesList}>
                    {messages.map((msg, index) => (
                        <Text key={index} style={styles.message}>
                            <Text style={styles.username}>{msg.username}: </Text>{msg.message}
                        </Text>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

// Styles for the PublicChatScreen component
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    header: {
        fontSize: 24,
        marginBottom: 10,
        color: '#333',
    },
    usernameDisplay: {
        fontSize: 16,
        marginBottom: 10,
        color: '#555',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 8,
    },
    messageContainer: {
        marginBottom: 20,
    },
    messagesDisplay: {
        flex: 1,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        marginTop: 20,
        padding: 10,
    },
    messagesList: {
        flexGrow: 1,
    },
    message: {
        marginBottom: 5,
    },
    username: {
        fontWeight: 'bold',
    },
});

export default PublicChatScreen;
