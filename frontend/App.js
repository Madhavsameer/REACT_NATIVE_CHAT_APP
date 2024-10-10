import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const API_BASE_URL = ''; // Replace with your backend URL

const App = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [selectedUser, setSelectedUser] = useState(''); // For selecting user to message

  // Fetch users from the backend
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch messages from the backend
  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Set the username and fetch the data
  const handleUsernameSubmit = () => {
    if (username.trim()) {
      setIsUsernameSet(true);
      fetchUsers(); // Fetch users once the username is set
      fetchMessages(); // Fetch messages once the username is set
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (message.trim() && username) {
      try {
        const chatMessage = { username, message, recipient: selectedUser };
        await fetch(`${API_BASE_URL}/send-message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chatMessage),
        });
        setMessage(''); // Clear input after sending
        fetchMessages(); // Refresh messages
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      {!isUsernameSet ? (
        <>
          <Text style={styles.title}>Set Your Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username..."
            value={username}
            onChangeText={(text) => setUsername(text)}
          />
          <Button title="Submit" onPress={handleUsernameSubmit} />
        </>
      ) : (
        <>
          <Text style={styles.title}>Chat App</Text>
          <View style={styles.userListContainer}>
            <Text style={styles.subtitle}>Users:</Text>
            <ScrollView style={styles.userList}>
              {users.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={{
                    ...styles.userItem,
                    backgroundColor: user.username === selectedUser ? '#eee' : '#fff',
                  }}
                  onPress={() => setSelectedUser(user.username)}
                >
                  <Text>{user.username}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.messageContainer}>
            <Text style={styles.subtitle}>Messages:</Text>
            <ScrollView style={styles.messages}>
              {messages.map((msg, index) => (
                <View key={index} style={styles.message}>
                  <Text>
                    <Text style={styles.username}>{msg.username}: </Text>
                    {msg.message}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter your message..."
            value={message}
            onChangeText={(text) => setMessage(text)}
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
    justifyContent: 'center',
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  userListContainer: {
    marginBottom: 20,
  },
  userList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  messageContainer: {
    marginBottom: 20,
  },
  messages: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  message: {
    marginBottom: 10,
  },
  username: {
    fontWeight: 'bold',
  },
});

export default App;
