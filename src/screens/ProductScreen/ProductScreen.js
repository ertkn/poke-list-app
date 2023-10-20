import {View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import CustomTouchableOpacity from '../../components/touchableOpacity';
import axios from 'axios';
import navStrings from '../../constants/navStrings';
import literals from '../../constants/literals';
import getSearchParamFromURL from '../../components/getSearchParamFromURL';
import windowMeasure from '../../constants/windowMeasure';

const InnerComponent = ({item, textStyle, viewStyle, upCase = false}) => {
  return (
    <View style={[styles.txtBoxStyle, viewStyle]}>
      <Text style={[styles.titleStyle, textStyle]}>{upCase ? item : item.toUpperCase()}</Text>
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
  const [searchBarValue, setSearchBarValue] = useState('');
  const [isPokeExist, setIsPokeExist] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [pokeSearch, setPokeSearch] = useState({});

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
        console.log('Fetching has failed... ' + err);
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

  const searchFilterFunction = text => {
    // Check if searched text is not blank
    if (text) {
      // Inserted text is not blank
      // Filter the masterDataSource and update FilteredDataSource
      const newData = masterDataSource.filter(function (item) {
        // Applying filter for the inserted text in search bar
        const itemData = item.title ? item.title.toUpperCase() : ''.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredDataSource(newData);
      setSearch(text);
    } else {
      // Inserted text is blank
      // Update FilteredDataSource with masterDataSource
      setFilteredDataSource(masterDataSource);
      setSearch(text);
    }
  };

  async function searchPokeFunc(searchBarValue) {
    setIsLoadingSearch(true);
    const pokeSearchJson = {};
    const pokeUrl = literals.POKE_URL + searchBarValue;
    console.log('pokeUrl', pokeUrl);
    axios
      .get(pokeUrl)
      .then(async pokeRes => {
        setIsPokeExist(true);
        pokeSearchJson.url = literals.POKE_URL + searchBarValue;
        pokeSearchJson.name = pokeRes.data.name;
        setPokeSearch(pokeSearchJson);
        setIsLoadingSearch(false);
      })
      .catch(async err => {
        pokeExistFlag = false;
        setIsPokeExist(false);
        console.log('err', err);
        console.log('isPokeExist err: ', isPokeExist);
        await showAlert();
      })
      .finally(() => {
        setIsLoadingSearch(false);
      });
  }

  useEffect(() => {
    console.log('pokeSearch: %o', pokeSearch);
    if (pokeSearch.name && pokeSearch.url && isPokeExist) {
      pokeNavFunc(navigation, pokeSearch);
    }

    return () => {
      console.log('\n');
      console.log('routes to poke details...');
    };
  }, [pokeSearch]);

  const isEmpty = str => !str?.length;

  const showAlert = async () => {
    Alert.alert(
      'Pokemon Search Result',
      'There is no such that pokemon...' + 'Please try something else!',
      [
        {
          text: 'OK',
          style: 'default',
          onPress: () => {
            setIsLoadingSearch(false);
          },
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {
          setIsLoadingSearch(false);
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <View style={styles.container}>
          <View style={styles.searchBarContainer}>
            <TextInput
              style={[styles.textInputStyle, isEmpty(searchBarValue) ? {flex: 0.95} : {}]}
              onChangeText={text => setSearchBarValue(text)}
              value={searchBarValue}
              underlineColorAndroid="transparent"
              placeholder="Search Poke"
              placeholderTextColor="black"
            />
            {isEmpty(searchBarValue) || isLoadingSearch ? (
              <></>
            ) : (
              <CustomTouchableOpacity
                buttonStyle={[{margin: '1%', height: '100%', flex: 0.15, paddingRight: '2%'}]}
                onPress={async () => {
                  console.log('searchBarValue: ', searchBarValue);
                  if (searchBarValue && searchBarValue !== '' && searchBarValue.length !== 0) {
                    await searchPokeFunc(searchBarValue);
                  }
                }}>
                <InnerComponent
                  item={'Search'}
                  textStyle={styles.searchButtonTextStyle}
                  viewStyle={styles.searchButtonViewStyle}
                  upCase={true}
                />
              </CustomTouchableOpacity>
            )}
          </View>
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
                buttonStyle={styles.customButtonStyle}>
                <InnerComponent
                  upCase={true}
                  item={'< Prev'}
                  textStyle={styles.customSearchTextInputStyle}
                  viewStyle={styles.customSearchViewStyle}
                />
              </CustomTouchableOpacity>
            )}
            {offset > 100 && (
              <CustomTouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  goToTop();
                }}
                buttonStyle={styles.customButtonStyle}>
                <InnerComponent
                  upCase={true}
                  item={'Reset'}
                  textStyle={styles.customSearchTextInputStyle}
                  viewStyle={styles.customSearchViewStyle}
                />
              </CustomTouchableOpacity>
            )}
            {nextPokeUrl && (
              <CustomTouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  goToNext();
                }}
                buttonStyle={styles.customButtonStyle}>
                <InnerComponent
                  upCase={true}
                  item={'Next >'}
                  textStyle={styles.customSearchTextInputStyle}
                  viewStyle={styles.customSearchViewStyle}
                />
              </CustomTouchableOpacity>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchButtonTextStyle: {
    textAlign: 'center',
    fontSize: 12,
    marginVertical: '0%',
    marginHorizontal: '0%',
  },
  searchButtonViewStyle: {
    height: '100%',
    marginVertical: '0%',
    marginHorizontal: '0%',
    justifyContent: 'center',
    backgroundColor: '#d6c4c4',
  },
  customSearchTextInputStyle: {
    textAlign: 'center',
    fontSize: 15,
    marginVertical: '0%',
    marginHorizontal: '1%',
    paddingVertical: '0%',
    paddingHorizontal: '1%',
  },
  customSearchViewStyle: {
    marginVertical: '0%',
    marginHorizontal: '1%',
    justifyContent: 'center',
    height: '75%',
  },
  customButtonStyle: {
    marginHorizontal: '1%',
    height: '100%',
    justifyContent: 'center',
  },

  container: {
    // backgroundColor: '#f1f1f1',
    flex: 1,
  },

  searchBarContainer: {
    flexDirection: 'row',
    // flexWrap: 'wrap',
    justifyContent: 'flex-start',
    height: (windowMeasure.windowHeight * 5) / 100,
    width: windowMeasure.windowWidth,
    marginBottom: '2.5%',
    marginTop: '0.5%',
  },

  paginationButtonContainer: {
    // alignContent: 'center',
    // alignItems: 'center',
    // verticalAlign: 'middle',
    // textAlign: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    height: (windowMeasure.windowHeight * 5.5) / 100,
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

  textInputStyle: {
    flex: 0.9,
    height: (windowMeasure.windowHeight * 5) / 100,
    // maxHeight: '10%',
    // minHeight: '5%',
    borderRadius: 20,
    // borderWidth: 1,
    paddingLeft: '4%',
    margin: 5,
    marginLeft: '3%',
    // borderColor: '#009688',
    backgroundColor: '#d6c4c4', //ada3a3
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

/* console.log('pokeResDataResults: ', pokeRes.data.name);


// const temp = true;
setIsPokeExist(current => true);
pokeExistFlag = true;
setPokeSearch(pokeRes.data);
console.log(
  'then isPokeExist: %o pokeSearch.url: %o pokeSearch.name: %o',
  isPokeExist,
  pokeSearch.url,
  pokeSearch,
);
 */

// pokeNavFunc(navigation, pokeSearch);

/* if (pokeTempJson.name && pokeTempJson.url) {
                      console.log('pokeTempJson IN: %o', pokeTempJson);
                      pokeNavFunc(navigation, pokeTempJson);
                    } */

/* if (isPokeExist && pokeSearch.name) {
                      console.log('isPokeExist OUT', isPokeExist);
                      console.log(
                        'pokeSearch.name OUT %o pokeSearch.name OUT %o',
                        pokeSearch.name,
                        pokeSearch.url,
                      );
                      pokeNavFunc(navigation, {
                        name: pokeSearch.name,
                        url: literals.POKE_URL + searchBarValue,
                      });
                      setSearchBarValue();
                    } */
