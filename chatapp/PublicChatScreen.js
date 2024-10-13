import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { io } from 'socket.io-client';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

// Initialize socket connection
const socket = io('https://react-native-chat-app.onrender.com');

const PublicChatScreen = () => {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Add loading state

    useEffect(() => {
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

        // Fetch all public messages when the component mounts
        const fetchPublicMessages = async () => {
            try {
                const response = await axios.get('https://react-native-chat-app.onrender.com/messages/public');
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching public messages:', error);
            } finally {
                setIsLoading(false); // Stop loading indicator
            }
        };

        fetchPublicMessages(); // Fetch public messages

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
            // Emit the message through the socket
            socket.emit('public message', { username, message });

            // Clear the input field after sending the message
            setMessage(''); 
        }
    };

    if (isLoading) {
        return <ActivityIndicator size="large" color="#0000ff" />; // Show loading indicator
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Public Chat Room</Text>

            {/* Display the logged-in user's username */}
            <Text style={styles.usernameDisplay}>Logged in as: {username}</Text>

            {/* Messages Display Section */}
            <View style={styles.messagesDisplay}>
                <ScrollView style={styles.messagesList}>
                    {messages.map((msg, index) => (
                        <View key={index} style={styles.messageContainer}>
                            {msg.username === username ? (
                                <View style={styles.outgoingMessage}>
                                    <Text style={styles.username}>{msg.username}: </Text>
                                    <Text>{msg.message}</Text>
                                </View>
                            ) : (
                                <View style={styles.incomingMessage}>
                                    <Text style={styles.username}>{msg.username}: </Text>
                                    <Text>{msg.message}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Message Input Section */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a public message..."
                    value={message}
                    onChangeText={setMessage}
                    onSubmitEditing={sendPublicMessage}  // Send message on pressing Enter
                />
                <Button title="Send Public" onPress={sendPublicMessage} disabled={!message} />
            </View>
        </View>
    );
};

// Combined styles for the PublicChatScreen component
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginRight: 10,
        paddingHorizontal: 8,
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
    messageContainer: {
        marginBottom: 10,
    },
    outgoingMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#d1f7c4',
        borderRadius: 10,
        padding: 10,
        maxWidth: '75%',
    },
    incomingMessage: {
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 10,
        maxWidth: '75%',
    },
    username: {
        fontWeight: 'bold',
    },
});

export default PublicChatScreen;
