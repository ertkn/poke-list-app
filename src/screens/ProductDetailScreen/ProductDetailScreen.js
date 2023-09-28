import {View, Text, StyleSheet, ActivityIndicator, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import axios from 'axios';

const ProductDetailScreen = ({route, navigation}) => {
  const pokeNameAndURL = route.params;
  const {url} = pokeNameAndURL;

  const [abilityError, setAbilityError] = useState(false);
  const [abilityDefinitionError, setAbilityDefinitionError] = useState(false);
  const [loading, setLoading] = useState(true);

  let [pokeImage, setPokeImage] = useState('');
  let pokeAbilityURL = [];
  let [pokeAbilityDefinition, setPokeAbilityDefinition] = useState([]);
  const [pokeShortDefinitionObject, setPokeShortDefinitionObject] = useState('');

  async function getAbilityURLFunc(pokeAbilityArr, controller) {
    return await pokeAbilityArr.map(async (val, idx) => {
      // console.log(' val.ability.url: ', val.ability.url);
      pokeAbilityURL = [...pokeAbilityURL, val.ability.url];

      /*       var tempFunc = new Promise((resolve, reject) => {
        if (pokeAbilityURL[idx]) {
          console.log('first', pokeAbilityURL[idx]);
          resolve();
        }
      });

      tempFunc.then(async () => {
        tempVal = val.ability.url;
        await axios
          .get(tempVal, {signal: controller.signal})
          .then(async response => {
            // console.log('response.data.effectEntries: ', response.data['effect_entries']);
            let tempJson = {};
            let shortEffect = await response.data['effect_entries'];
            console.log('NAME[%o] %o', await response.data.name, idx);

            shortEffect.map(async (newVal, idx) => {
              const langName = await newVal.language.name;
              if (langName === 'en') {
                tempJson['name'] = await response.data.name;
                tempJson['definition'] = await newVal['short_effect'];

                setPokeAbilityDefinition(prev => [...prev, tempJson]);
              }
            });
          })
          .catch(err => {
            if (controller.abort) {
              console.log('ABILITY Data fetching cancelled');
            } else {
              console.log('ABILITY Data fetching cancelled for unknown issue...');
            }
            setAbilityDefinitionError(true);
            setLoading(true);
            console.log(err);
          })
          .finally(() => {
            setLoading(false);
          });
      }); */
    });
  }

  async function getAbility(controller, defController) {
    await axios
      .get(url, {signal: controller.signal})
      .then(async response => {
        setPokeImage(await response.data.sprites.other['official-artwork']['front_default']);

        const pokeAbilityArr = await response.data.abilities; //gets result like -> [{ability:{'name','url'}}{ability:{'name','url'}}]
        await getAbilityURLFunc(pokeAbilityArr, defController);

        setLoading(false);
        await setPokeShortDefinitionObject(pokeAbilityURL);
        console.log('pokeAbility: ', pokeAbilityURL);
      })
      .catch(err => {
        if (controller.abort) {
          console.log('Data fetching cancelled');
        }
        setAbilityError(true);
        setLoading(true);
        console.log(err);
      });
  }

  async function getAbilityAsync(controller = new AbortController(), defController) {
    await getAbility(controller, defController);
  }

  useEffect(() => {
    console.log('DETAILS HERE...');
    setAbilityError(false);
    setLoading(true);
    setAbilityDefinitionError(false);
    const controller = new AbortController();
    const defController = new AbortController();

    getAbilityAsync(controller, defController);

    return () => {
      console.log('\n');
      console.log('fetching cancelled.');
      controller.abort;
    };
  }, [abilityError]);

    async function getAbilityDefinition(controller) {
    setPokeAbilityDefinition([]);

    if (loading === false) {
      pokeShortDefinitionObject.map(async (val, idx) => {
        await axios
          .get(val, {signal: controller.signal})
          .then(async response => {
            let tempJson = {};
            let shortEffect = await response.data['effect_entries'];
            console.log('NAME[%o] %o', await response.data.name, idx);

            shortEffect.map(async (newVal, idx) => {
              const langName = await newVal.language.name;
              if (langName === 'en') {
                tempJson['name'] = await response.data.name;
                tempJson['definition'] = await newVal['short_effect'];

                setPokeAbilityDefinition(prev => [...prev, tempJson]);
              }
            });
          })
          .catch(err => {
            if (controller.abort) {
              console.log('ABILITY Data fetching cancelled');
            } else {
              console.log('ABILITY Data fetching cancelled for unknown issue...');
            }
            setAbilityDefinitionError(true);
            setLoading(true);
            console.log(err);
          })
          .finally(() => {
            setLoading(false);
          });
      });
    }
  }

  async function getAbilityDefinitionAsync(defController = new AbortController()) {
    console.log('loading is %o\n ', loading);
    if (loading === false) {
      await getAbilityDefinition(defController);
    }
  }

  useEffect(() => {
    setAbilityDefinitionError(false);
    const defController = new AbortController();
    getAbilityDefinitionAsync(defController);

    return () => {
      console.log('\n');
      console.log('ability fetching cancelled.');
      defController.abort;
    };
  }, [abilityDefinitionError, abilityError, pokeShortDefinitionObject]);

  return (
    <SafeAreaView style={styles.pageContainer}>
      {loading ? (
        <ActivityIndicator size={'large'} />
      ) : (
        <View style={styles.pokePageContainerStyle}>
          <Image
            style={styles.tinyLogo}
            source={{
              uri: pokeImage,
            }}
          />
          <Text style={styles.pokeTitleStyle}>
            {
              pokeNameAndURL.name.toUpperCase() // Title of the Pokemon
            }
          </Text>
          <View style={styles.pokeAbilityContainer}>
            <Text style={styles.pokeAbilityTitleStyle}>Abilities</Text>

            {pokeAbilityDefinition.map((ability = {}, idx = 0) => {
              return (
                <Text key={idx} style={styles.abilityTitleStyle}>
                  {ability.name}
                  <Text key={idx.idx} style={styles.shortEffectStyle}>
                    {'\n' + ability.definition}
                  </Text>
                </Text>
              );
            })}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#74976b',
  },

  pokePageContainerStyle: {
    justifyContent: 'flex-start',
    padding: 16,
    backgroundColor: '#633131',
    flex: 1,
  },

  tinyLogo: {
    width: '100%',
    height: '40%',
    resizeMode: 'center',
    backgroundColor: '#bcd6e0',
  },

  pokeTitleStyle: {
    justifyContent: 'center',
    textAlign: 'center',
    backgroundColor: '#30b0e2',
    color: '#000000',
    paddingVertical: '2%',
    paddingHorizontal: '2%',
    fontSize: 24,
    letterSpacing: -0.75,
    fontWeight: '800',
  },

  pokeAbilityContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: '3%',
    backgroundColor: '#f1bfbf',
  },

  pokeAbilityTitleStyle: {
    color: '#000000',
    paddingVertical: '2%',
    paddingHorizontal: '2%',
    fontSize: 24,
    letterSpacing: -0.5,
    fontWeight: '500',
  },

  abilityTitleStyle: {
    textTransform: 'capitalize',
    color: '#000000',
    paddingVertical: '2%',
    paddingHorizontal: '2%',
    backgroundColor: '#bcd6e0',
    letterSpacing: -0.5,
    textAlign: 'left',
    fontSize: 20,
    fontWeight: '500',
  },

  shortEffectStyle: {
    fontStyle: 'italic',
    textTransform: 'lowercase',
    color: '#000000',
    paddingVertical: '2%',
    paddingHorizontal: '2%',
    backgroundColor: '#bcd6e0',
    letterSpacing: -0,
    textAlign: 'left',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ProductDetailScreen;
