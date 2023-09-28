import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import navStrings from '../constants/navStrings';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import ProductScreen from '../screens/ProductScreen/ProductScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen/ProductDetailScreen';

const Stack = createNativeStackNavigator();

function Route() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={navStrings.HOME}>
        <Stack.Screen
          name={navStrings.HOME}
          component={HomeScreen}
          options={screenOption}
        />
        <Stack.Screen
          options={pokeListScreenOption}
          name={navStrings.PRODUCT}
          component={ProductScreen}
        />
        <Stack.Screen
          options={pokeDetailScreenOption}
          name={navStrings.PRODUCT_DETAILS}
          component={ProductDetailScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function screenOption() {
  return (options = {
    headerBackButtonMenuEnabled: true,
    headerShown: false,
    title: 'Home',
  });
}

function pokeListScreenOption() {
  return (options = {
    headerBackButtonMenuEnabled: true,
    headerShown: true,
    title: 'Poke List',
  });
}

function pokeDetailScreenOption() {
  return (options = {
    headerBackButtonMenuEnabled: true,
    headerShown: true,
    title: 'Poke Detail',
  });
}

export default Route;
