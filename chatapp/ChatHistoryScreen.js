import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import { io } from 'socket.io-client';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

// Initialize socket connection
const socket = io('https://react-native-chat-app.onrender.com');

const ChatHistoryScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const route = useRoute();
  const { recipient } = route.params;
  const flatListRef = useRef(null); // Create a ref for FlatList

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        setUsername(storedUsername);
      } catch (error) {
        console.error('Error fetching username from storage:', error);
      }
    };

    fetchUsername();

    const fetchChatHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://react-native-chat-app.onrender.com/messages/private/${username}/${recipient}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch chat history: ${response.statusText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Invalid response: Expected an array.');
        }

        setMessages(data);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchChatHistory();
    }

    const handlePrivateMessage = (privateMessage) => {
      // Check if the message is for the current chat
      if (
        privateMessage.username === username ||
        privateMessage.recipient === username
      ) {
        setMessages((prevMessages) => [...prevMessages, privateMessage]);
      }
    };

    // Listen for incoming private messages
    socket.on('private message', handlePrivateMessage);

    return () => {
      socket.off('private message', handlePrivateMessage); // Cleanup the listener on unmount
    };
  }, [username, recipient]);

  const sendPrivateMessage = () => {
    if (message) {
      const privateMessage = {
        username,
        message,
        recipient,
        timestamp: new Date().toISOString(),
      };
      socket.emit('private message', privateMessage); // Send message via socket
      setMessages((prevMessages) => [...prevMessages, privateMessage]); // Update messages locally
      setMessage(''); // Clear input field after sending
    }
  };

  // Function to format timestamps
  const formatTimestamp = (timestamp) => {
    return moment(timestamp).fromNow();
  };

  const renderItem = ({ item }) => (
    <View style={styles.messageContainer}>
      {item.username === username ? (
        <View style={styles.outgoingMessage}>
          <Text>{item.message}</Text>
          <Text style={styles.timestamp}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
      ) : (
        <View style={styles.incomingMessage}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <Text>{item.message}</Text>
          <Text style={styles.timestamp}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
      )}
    </View>
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
    }
  }, [messages]);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Text style={styles.header}>
            Welcome {username}, chat with {recipient}...😍
          </Text>
          <FlatList
            ref={flatListRef} // Attach ref to FlatList
            data={messages.slice().reverse()} // Reverse messages array to show the latest at the bottom
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            style={styles.messagesList}
          />
          <TextInput
            style={styles.input}
            placeholder={`Type a private message...`}
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={sendPrivateMessage}
          />
          <Button
            title="Send Private"
            onPress={sendPrivateMessage}
            disabled={!message}
          />
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
