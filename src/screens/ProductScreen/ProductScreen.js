import {View, Text, StyleSheet, FlatList, ActivityIndicator} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import CustomTouchableOpacity from '../../components/touchableOpacity';
import axios from 'axios';
import navStrings from '../../constants/navStrings';
import literals from '../../constants/literals';

const InnerComponent = ({item}) => {
  return (
    <View style={styles.txtBoxStyle}>
      <Text style={styles.titleStyle}>{item.name.toUpperCase()}</Text>
    </View>
  );
};

const pokeNavFunc = (nav, pokeData) => {
  console.log('\n');
  console.log('ROUTES TO POKE DETAIL PAGE...');
  console.log(
    '********************************************%o********************************************',
    pokeData.name,
  );
  nav.navigate(navStrings.PRODUCT_DETAILS, pokeData);
};

const ProductScreen = ({navigation}) => {
  const url = literals.POKE_LIST_URL;
  const [poke, setPoke] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setErrorFlag] = useState(false);

  async function getPokeAxios(controller) {
    axios
      .get(url, {signal: controller.signal})
      .then(response => {
        console.log('\n');
        console.log('fetching poke data...');
        setPoke(response.data.results);
      })
      .catch(err => {
        if (controller.abort) {
          console.log('Data fetching cancelled');
        } else {
          setErrorFlag(true);
          setLoading(false);
        }
        console.log(err);
      })
      .finally(() => {
        console.log('POKES READY!');
        setLoading(false);
      });
  }

  useEffect(() => {
    const controller = new AbortController();
    getPokeAxios(controller);
    return () => {
      console.log('\n');
      console.log('fetching pokemon detail ended!');
      controller.abort;
    };
  }, [url, hasError]);

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={poke}
          renderItem={({item}) => (
            <CustomTouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                pokeNavFunc(navigation, item);
              }}
              styles={styles.buttonStyle}>
              <InnerComponent item={item} />
            </CustomTouchableOpacity>
          )}
          keyExtractor={item => item.url}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  listContainer: {
    backgroundColor: '#c6d64d',
    marginVertical: '1.5%',
    marginHorizontal: '3%',
  },

  titleStyle: {
    fontSize: 20,
    color: '#000000',
    letterSpacing: -1,
    fontWeight: '600',
    marginVertical: '4%',
    marginHorizontal: '4%',
  },

  txtBoxStyle: {
    marginVertical: '1.5%',
    marginHorizontal: '3%',
    borderRadius: 15,
    backgroundColor: '#cadbec',
  },

  buttonStyle: {
    padding: 40,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'green',
  },
});

export default ProductScreen;