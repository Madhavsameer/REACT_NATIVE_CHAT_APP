import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { io } from 'socket.io-client';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import    moment from 'moment';    // For formatting timestamps

// Initialize socket connection
const socket = io('https://react-native-chat-app.onrender.com');

const ChatHistoryScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const route = useRoute();

  // Get recipient from route params
  const { recipient } = route.params;

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        setUsername(storedUsername); // Set sender username from storage
      } catch (error) {
        console.error('Error fetching username from storage:', error);
      }
    };

    fetchUsername();

    // Fetch chat history only if username is available
    if (username) {
      const fetchChatHistory = async () => {
        setIsLoading(true); // Start loading indicator
        try {
          const response = await fetch(`https://react-native-chat-app.onrender.com/messages/private/${username}/${recipient}`);

          if (!response.ok) {
            throw new Error(`Failed to fetch chat history: ${response.statusText}`);
          }

          const data = await response.json();

          // Validate data structure before updating state
          if (!Array.isArray(data)) {
            throw new Error('Invalid response: Expected an array.');
          }

          setMessages(data);
          setIsLoading(false); // Stop loading indicator
        } catch (error) {
          console.error('Error fetching chat history:', error);
          setIsLoading(false); // Stop loading indicator
        }
      };

      fetchChatHistory();
    }

    // Listen for incoming private messages
    socket.on('private message', (privateMessage) => {
      setMessages((prevMessages) => [...prevMessages, privateMessage]); // Update messages with new private message
    });

    return () => {
      socket.off('private message'); // Cleanup listener on unmount
    };
  }, [username, recipient]); // Dependencies for useEffect

  const sendPrivateMessage = () => {
    if (message) {
      socket.emit('private message', { username, message, recipient });
      setMessage(''); // Clear input field after sending
    }
  };

  // Function to format timestamps
  const formatTimestamp = (timestamp) => {
    return moment(timestamp).fromNow();
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" /> // Show loading indicator
      ) : (
        <>
          <Text style={styles.header}>Welcome {username} chat with {recipient}...😍</Text>
          <ScrollView style={styles.messagesList}>
            {messages.map((msg, index) => (
              <View key={index} style={styles.messageContainer}>
                {msg.username === username ? (
                  <View style={styles.outgoingMessage}>
                    <Text>{msg.message}</Text>
                    <Text style={styles.timestamp}>{formatTimestamp(msg.timestamp)}</Text>
                  </View>
                ) : (
                  <View style={styles.incomingMessage}>
                    <Image source={{ uri: msg.avatar }} style={styles.avatar} /> // Add avatar
                    <Text>{msg.message}</Text>
                    <Text style={styles.timestamp}>{formatTimestamp(msg.timestamp)}</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <TextInput
            style={styles.input}
            placeholder={`Type a private message...`}
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={sendPrivateMessage} // Send message on pressing Enter
          />
          <Button title="Send Private" onPress={sendPrivateMessage} disabled={!message} />
        </>
      )}
    </View>
  );
};

// Styles for the ChatHistoryScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  messagesList: {
    flexGrow: 1,
    marginBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  incomingMessage: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 10,
    marginLeft: 10,
  },
  outgoingMessage: {
    backgroundColor: '#dcf8c8',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
});

export default ChatHistoryScreen;