import {View, Text, StyleSheet, FlatList, ActivityIndicator, Button} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import CustomTouchableOpacity from '../../components/touchableOpacity';
import axios from 'axios';
import navStrings from '../../constants/navStrings';
import literals from '../../constants/literals';
import getSearchParamFromURL from '../../components/getSearchParamFromURL';

const InnerComponent = ({item, textStyle, viewStyle}) => {
  return (
    <View style={[styles.txtBoxStyle, viewStyle]}>
      <Text style={[styles.titleStyle, textStyle]}>{item.toUpperCase()}</Text>
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
  const [currentUrl, setCurrentUrl] = useState(literals.POKE_LIST_URL);
  const [poke, setPoke] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setErrorFlag] = useState(false);
  const [nextPokeUrl, setNextPokeUrl] = useState();
  const [prevPokeUrl, setPrevPokeUrl] = useState();
  const [offset, setOffSet] = useState();

  async function getPokeAxios(controller) {
    axios
      .get(currentUrl, {signal: controller.signal})
      .then(response => {
        console.log('\n');
        console.log('fetching poke data...');
        setPoke(response.data.results);
        setNextPokeUrl(response.data.next);
        setPrevPokeUrl(response.data.previous);

        console.log(response.data.next);

        const params = getSearchParamFromURL(response.data.next, 'offset');
        console.log('params: ', params);
        setOffSet(params);
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

  function goToNext() {
    setCurrentUrl(nextPokeUrl);
  }
  function goToPrev() {
    setCurrentUrl(prevPokeUrl);
  }
  function goToTop() {
    setCurrentUrl(url);
  }

  useEffect(() => {
    const controller = new AbortController();
    getPokeAxios(controller);
    return () => {
      console.log('\n');
      console.log('fetching pokemon detail ended!');
      controller.abort;
    };
  }, [hasError, currentUrl]);

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <View style={styles.container}>
          <FlatList
            data={poke}
            renderItem={({item}) => (
              <CustomTouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  pokeNavFunc(navigation, item);
                }}
                styles={styles.buttonStyle}>
                <InnerComponent item={item.name} />
              </CustomTouchableOpacity>
            )}
            keyExtractor={item => item.url}
          />
          <View style={styles.paginationButtonContainer}>
            {prevPokeUrl && (
              <CustomTouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  goToPrev();
                }}
                buttonStyle={styles.buttonStyle}>
                <InnerComponent item={'< Prev'} textStyle={{textAlign: 'center'}} />
              </CustomTouchableOpacity>
            )}
            {offset > 100 && (
              <CustomTouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  goToTop();
                }}
                buttonStyle={styles.buttonStyle}>
                <InnerComponent item={'Reset!'} textStyle={{textAlign: 'center'}} />
              </CustomTouchableOpacity>
            )}
            {nextPokeUrl && (
              <CustomTouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  goToNext();
                }}
                buttonStyle={styles.buttonStyle}>
                <InnerComponent item={'Next >'} textStyle={{textAlign: 'center'}} />
              </CustomTouchableOpacity>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  paginationButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    height: '7%',
  },
  buttons: {
    width: '12%',
    height: '12%',
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
    padding: 2.5,
    margin: 3.5,
    borderRadius: 0,
    // height:'100%',
    // borderWidth: 0.5,
    // borderColor: 'green',
  },
});

export default ProductScreen;

/*   const getSearchParamFromURL = (url, param) => {
    const include = url.includes(param);

    if (!include) return null;

    const params = url.split(/([&,?,=])/);
    const index = params.indexOf(param);
    const value = params[index + 2];
    return value;
  }; */
