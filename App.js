import React from 'react';
import Route from './src/navigation/Route';

import {StyleSheet, View} from 'react-native';

const App = () => {
  return (
    <View style={styles.sectionContainer}>
      <Route />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
    backgroundColor: '#55388a',
    // marginTop: 32,
    // paddingHorizontal: 24,
  },
});

export default App;

/* const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  }; */
