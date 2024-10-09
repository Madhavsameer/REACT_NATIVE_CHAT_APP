import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker'; // Updated import
import io from 'socket.io-client';

const socket = io('http://10.44.192.73:3000'); // Replace with your server's IP

const App = () => {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isUsernameSet, setIsUsernameSet] = useState(false);
    const [selectedUser, setSelectedUser] = useState(''); // New state for selected user
    const [userList, setUserList] = useState(['User1', 'User2', 'User3']); // Hardcoded user list

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const storedUsername = await AsyncStorage.getItem('username');
                if (storedUsername) {
                    setUsername(storedUsername);
                    setIsUsernameSet(true);
                }
            } catch (error) {
                console.error('Error fetching username:', error);
            }
        };

        fetchUsername();
        fetchMessages();

        socket.on('chat message', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => {
            socket.off('chat message');
        };
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await fetch('http://10.44.192.73:3000/messages');
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleUsernameSubmit = async () => {
        if (username.trim()) {
            try {
                await AsyncStorage.setItem('username', username.trim());
                setIsUsernameSet(true);
            } catch (error) {
                console.error('Error saving username:', error);
            }
        } else {
            Alert.alert('Error', 'Please enter a valid username');
        }
    };

    const sendMessage = async () => {
        if (message.trim() && username.trim() && selectedUser.trim()) {
            try {
                const response = await fetch('http://10.44.192.73:3000/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, message, recipient: selectedUser }), // Include recipient
                });

                if (response.ok) {
                    setMessage(''); // Clear the message input
                } else {
                    Alert.alert('Error', 'Failed to send message');
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to send message');
            }
        } else {
            Alert.alert('Error', 'Please enter your message and select a recipient');
        }
    };

    return (
        <View style={styles.container}>
            {!isUsernameSet ? (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your username..."
                        value={username}
                        onChangeText={setUsername}
                    />
                    <Button title="Submit Username" onPress={handleUsernameSubmit} />
                </>
            ) : (
                <>
                    <Picker
                        selectedValue={selectedUser}
                        onValueChange={(itemValue) => setSelectedUser(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select a user" value="" />
                        {userList.map((user, index) => (
                            <Picker.Item key={index} label={user} value={user} />
                        ))}
                    </Picker>

                    <FlatList
                        data={messages}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Text style={styles.message}>
                                <Text style={styles.boldText}>{item.username}:</Text> {item.message}
                            </Text>
                        )}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Type your message..."
                        value={message}
                        onChangeText={setMessage}
                    />
                    <Button title="Send" onPress={sendMessage} />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    message: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    boldText: {
        fontWeight: 'bold',
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 10,
    },
});

export default App;
