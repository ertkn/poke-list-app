import {View, Text} from 'react-native';
import React from 'react';
import axios from 'axios';

GetPokeData = (url, poke) =>{
  const controller = AbortController;
  
  return axios
    .get(url, {signal: controller.signal})
    .then(response => {
      console.log('fetching poke data...');
      poke(response.data.results);
    })
    .catch(err => {
      if (controller.abort) {
        console.log('Data fetching cancelled');
      } else {
      }
      console.log('ERR: ',err);
    })
}
export default GetPokeData;
