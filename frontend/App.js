import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './HomeScreen';
import RegisterScreen from './RegisterScreen';
import PublicChatScreen from './PublicChatScreen';
import PrivateChatScreen from './PrivateChatScreen';
import ChatHistoryScreen from './ChatHistoryScreen';

const Stack = createNativeStackNavigator();

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkLogin = async () => {
            const userId = await AsyncStorage.getItem('username');
            setIsLoggedIn(!!userId); // Update state based on userId existence
        };
        checkLogin();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('username');
        setIsLoggedIn(false); // Update state to false on logout
    };

    const handleRegister = () => {
        setIsLoggedIn(true); // Update state to true after registration
    };

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={isLoggedIn ? "Home" : "Register"}>
                {!isLoggedIn ? (
                    <Stack.Screen name="Register">
                        {props => <RegisterScreen {...props} onRegister={handleRegister} />}
                    </Stack.Screen>
                ) : (
                    <>
                        <Stack.Screen name="Home">
                            {props => <HomeScreen {...props} onLogout={handleLogout} />}
                        </Stack.Screen>
                        <Stack.Screen name="Public Chat" component={PublicChatScreen} />
                        <Stack.Screen name="Private Chat" component={PrivateChatScreen} />
                        <Stack.Screen name="ChatHistory" component={ChatHistoryScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
