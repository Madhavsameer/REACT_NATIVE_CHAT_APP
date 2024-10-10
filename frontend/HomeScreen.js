import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';   

const HomeScreen = ({ navigation }) => {
  const logout    = async () => {
    await AsyncStorage.removeItem('username');
    navigation.replace('Register');
  };

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
        onPress={logout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:    '#f0f0f0', // Light gray background   
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333', // Darker text color
  },
  button: {
    backgroundColor: '#4CAF50', // Green background
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
    width: '80%',
  },
});

export default HomeScreen;