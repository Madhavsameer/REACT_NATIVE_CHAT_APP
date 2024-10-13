import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, SectionList } from 'react-native';
import { io } from 'socket.io-client';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import    { useNavigation } from '@react-navigation/native';   

// Initialize socket connection
const socket = io('https://react-native-chat-app.onrender.com');

const PrivateChatScreen = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); // Store all messages
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [recipient, setRecipient] = useState(null); // State to keep track of selected recipient
  const navigation = useNavigation(); // Get navigation object

  useEffect(() => {
    // Retrieve sender username from AsyncStorage
    const fetchUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);    // Set sender username from storage
        } else {
          console.error('No username found in storage');
        }
      } catch (error) {
        console.error('Error fetching username from storage:', error);
      }
    };

    fetchUsername(); // Fetch username when component mounts

    // Fetch all registered users from the backend
    axios.get('https://react-native-chat-app.onrender.com/users')
      .then(response => {
        setUsers(response.data); // Store registered users
      })
      .catch(error => console.error('Error fetching users:', error));

    // Listen for private messages
    socket.on('private message', (privateMessage) => {
      setMessages((prevMessages) => [...prevMessages, privateMessage]);
    });

    // Clean up socket listeners when component unmounts
    return () => {
      socket.off('private message');
    };
  }, []);

  const sendPrivateMessage = () => {
    if (message && recipient) {
      socket.emit('private message', { username, message, recipient });
      setMessage(''); // Clear the input field after sending the message
    }
  };

  // Function to filter messages based on the recipient
  const getChatHistoryForRecipient = (recipient) => {
    return messages.filter((msg) =>
      (msg.username === recipient && msg.recipient === username) ||
      (msg.username === username && msg.recipient === recipient)
    );
  };

  // Filter users based on the search term
  const filteredUsers = users.filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()));   

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Private Chat Room</Text>

      {/* Search Input Section */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by username..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {/* Recipient Selection Section */}
      <SectionList
        sections={[
          {
            title: 'Select Recipient',
            data: filteredUsers,
          },
        ]}
        keyExtractor={(item) => item.username}
        renderItem={({ item }) => (
          <Text
            style={styles.userListLi}
            onPress={() => {
              setRecipient(item.username); // Set selected recipient
              // Navigate to ChatHistoryScreen with messages and recipient as parameters
              navigation.navigate('ChatHistory', {
                messages: getChatHistoryForRecipient(item.username), // Pass filtered chat history
                recipient: item.username,
              });
            }}
          >
            {item.username}
          </Text>
        )}
      />

      {/* Message Input Section */}
      {recipient && ( // Only show input when a recipient is selected
        <View style={styles.messageContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a private message..."
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={sendPrivateMessage} // Send message on pressing Enter
          />
          <Button title="Send Private" onPress={sendPrivateMessage} />
        </View>
      )}
    </View>
  );
};

// Styles for the PrivateChatScreen component
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
    fontWeight: 'bold', // Added bold font weight for emphasis
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    borderRadius: 5, // Added rounded corners for a smoother look
  },
  recipientContainer: {
    marginBottom: 20,
  },
  userListLi: {
    marginVertical: 5,
    fontSize: 18,
    color: 'blue', // Change color to indicate clickable item
    textDecorationLine: 'underline', // Underline to indicate it's clickable
    padding: 10, // Add padding for better touch feedback
    backgroundColor: '#e0f7fa', // Light background color
    borderRadius: 5, // Rounded corners
    shadowColor: '#000', // Shadow for elevation
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1, // Elevation for Android
  },
  messageContainer: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    borderRadius: 5, // Added rounded corners for a smoother look
    backgroundColor: '#f0f0f0', // Light background color
    shadowColor: '#000', // Shadow for elevation
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1, // Elevation for Android
  },
  sendButton: {
    backgroundColor: '#007AFF', // Blue color
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PrivateChatScreen;