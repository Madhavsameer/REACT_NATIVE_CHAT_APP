import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import io from 'socket.io-client';

// Backend API URL
const API_BASE_URL = 'https://react-native-chat-app.onrender.com'; // Replace with your backend URL

const ChatApp = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [recipient, setRecipient] = useState('all'); // Default is public chat
  const [isPrivate, setIsPrivate] = useState(false);
  const [socket, setSocket] = useState(null);

  // Connect to Socket.io
  useEffect(() => {
    const socketConnection = io(API_BASE_URL);
    setSocket(socketConnection);

    socketConnection.on('public message', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socketConnection.on('private message', (newMessage) => {
      if (newMessage.recipient === username || newMessage.username === username) {
        setPrivateMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    return () => {
      socketConnection.disconnect();
    };
  }, [username]);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  // Fetch public messages
  const fetchPublicMessages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/public`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching public messages:', error);
    }
  };

  // Fetch private messages between the user and recipient
  const fetchPrivateMessages = async (recipient) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/private/${username}/${recipient}`);
      const data = await response.json();
      setPrivateMessages(data);
    } catch (error) {
      console.error('Error fetching private messages:', error);
    }
  };

  // Register user
  const registerUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        fetchUsers();
        socket.emit('join', username); // Join the chat with the username
      } else {
        console.error('Username already exists or registration failed');
      }
    } catch (error) {
      console.error('Failed to register user:', error);
    }
  };

  // Handle sending a message (either public or private)
  const sendMessage = () => {
    if (isPrivate) {
      socket.emit('private message', { message, to: recipient });
      setPrivateMessages([...privateMessages, { username, message, recipient }]);
    } else {
      socket.emit('public message', { username, message });
      setMessages([...messages, { username, message }]);
    }
    setMessage('');
  };

  // Toggle between public and private chat
  const togglePrivateChat = (selectedUser) => {
    setRecipient(selectedUser);
    setIsPrivate(true);
    fetchPrivateMessages(selectedUser);
  };

  useEffect(() => {
    fetchUsers();
    fetchPublicMessages();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat App</Text>

      {/* User Registration */}
      {!username && (
        <View style={styles.registrationContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
          />
          <Button title="Register" onPress={registerUser} />
        </View>
      )}

      {/* Users List */}
      {username && (
        <View style={styles.chatContainer}>
          <ScrollView style={styles.userList}>
            <Text style={styles.userListHeader}>Users</Text>
            {users.map((user) => (
              <TouchableOpacity key={user._id} onPress={() => togglePrivateChat(user.username)}>
                <Text style={styles.userItem}>{user.username}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Messages List */}
          <View style={styles.messagesContainer}>
            <FlatList
              data={isPrivate ? privateMessages : messages}
              keyExtractor={(item, index) => index.toString()} // Change to a unique ID if available
              renderItem={({ item }) => (
                <View style={styles.messageItem}>
                  <Text>
                    <Text style={styles.username}>{item.username}</Text>: {item.message}
                  </Text>
                </View>
              )}
            />
          </View>

          {/* Message Input */}
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            value={message}
            onChangeText={setMessage}
          />
          <Button title="Send Message" onPress={sendMessage} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  registrationContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  chatContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  userList: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
  },
  userListHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  messagesContainer: {
    flex: 4,
    marginBottom: 10,
  },
  messageItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  username: {
    fontWeight: 'bold',
  },
});

export default ChatApp;
