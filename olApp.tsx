import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FurnitureItem = ({item, index, deleteFurniture, editFurniture}) => (
  <View style={styles.itemContainer}>
    <View>
      <Text style={styles.itemText}>Name: {item.name}</Text>
      <Text style={styles.itemText}>Type: {item.type}</Text>
      <Text style={styles.itemText}>Price: {item.price}</Text>
    </View>
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => editFurniture(index)}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteFurniture(index)}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const App = () => {
  const [furniture, setFurniture] = useState({name: '', type: '', price: ''});
  const [furnitures, setFurnitures] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const checkIsFocusedHandler = () => {
    setTimeout(() => {
      let result = inputRef?.current?.isFocused();
      if (result) {
        editText();
      }
    }, 0);
  };

  const editText = useCallback(() => {
    inputRef.current?.setNativeProps({
      placeholderTextColor: 'black',
      style: {
        height: 40,
        borderColor: 'green',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 25,
      },
    });
  }, []);

  const FurnitureInput = ({furniture, setFurniture, saveFurniture}) => (
    <View style={styles.inputContainer}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder="Furniture Name"
        value={furniture.name}
        onChangeText={text => setFurniture(prev => ({...prev, name: text}))}
        onFocus={checkIsFocusedHandler}
      />
      <TextInput
        style={styles.input}
        placeholder="Furniture Type"
        value={furniture.type}
        onChangeText={text => setFurniture(prev => ({...prev, type: text}))}
        onFocus={checkIsFocusedHandler}
      />
      <TextInput
        style={styles.input}
        placeholder="Furniture Price"
        keyboardType="numeric"
        value={furniture.price}
        onChangeText={text => setFurniture(prev => ({...prev, price: text}))}
        onFocus={checkIsFocusedHandler}
      />
      <TouchableOpacity
        style={[
          styles.saveButton,
          {backgroundColor: isConnected ? 'green' : 'red'},
        ]}
        onPress={saveFurniture}>
        <Text style={styles.saveButtonText}>Add Furniture</Text>
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(prevState => {
        if (prevState !== state.isConnected) {
          if (state.isConnected) {
            loadFurnitures();
          }
          return state.isConnected;
        }
        return prevState;
      });
    });

    return () => unsubscribe();
  }, []);

  const loadFurnitures = useCallback(async () => {
    try {
      setLoading(true);
      const storedFurnitures = await AsyncStorage.getItem('furnitures');
      if (storedFurnitures) {
        setFurnitures(JSON.parse(storedFurnitures));
      }
    } catch (error) {
      console.error('Failed to load furniture items:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveFurniture = async () => {
    if (
      !furniture.name.trim() ||
      !furniture.type.trim() ||
      !furniture.price.trim()
    ) {
      Alert.alert('Please enter all furniture details');
      return;
    }

    let newFurnitures = [...furnitures];
    if (editingIndex !== null) {
      newFurnitures[editingIndex] = furniture;
    } else {
      newFurnitures = [...newFurnitures, furniture];
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (isConnected) {
      setFurnitures(newFurnitures);
    }
    setFurniture({name: '', type: '', price: ''});
    setEditingIndex(null);

    try {
      await AsyncStorage.setItem('furnitures', JSON.stringify(newFurnitures));
    } catch (error) {
      console.error('Failed to save furniture item:', error);
    }
  };

  const deleteFurniture = async index => {
    const newFurnitures = furnitures.filter((_, i) => i !== index);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFurnitures(newFurnitures);

    try {
      await AsyncStorage.setItem('furnitures', JSON.stringify(newFurnitures));
    } catch (error) {
      console.error('Failed to delete furniture item:', error);
    }
  };

  const editFurniture = index => {
    setFurniture(furnitures[index]);
    setEditingIndex(index);
  };

  const filteredFurniture = furnitures.filter(
    item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'#f5f5f5'} barStyle={'dark-content'} />
      <Text style={styles.title}>
        Furniture{' '}
        <Text style={[styles.title, {color: isConnected ? 'green' : 'red'}]}>
          Shop
        </Text>
      </Text>
      <FurnitureInput
        furniture={furniture}
        setFurniture={setFurniture}
        saveFurniture={saveFurniture}
      />
      <TextInput
        style={styles.input}
        placeholder="Search Furniture..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Text style={styles.listTitle}>Furniture List:</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredFurniture}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => (
            <FurnitureItem
              item={item}
              index={index}
              deleteFurniture={deleteFurniture}
              editFurniture={editFurniture}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  itemContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  editButton: {
    marginRight: 10,
    backgroundColor: '#FFD700',
    padding: 10,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
  },
  status: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
});

export default App;
