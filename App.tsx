import React, {useCallback, useRef} from 'react';
import {Button, TextInput, View} from 'react-native';

const App = () => {
  const inputRef = useRef<TextInput>(null);

  const editText = useCallback(() => {
    inputRef.current?.setNativeProps({
      text: 'Hello world!',
      placeholderTextColor: 'black',
      style: {
        height: 100,
        borderColor: 'green',
        borderWidth: 2,
        borderRadius: 15,
        paddingHorizontal: 12,
        fontSize: 18,
        marginBottom: 20,
      },
    });
  }, []);

  // Moved lastCall outside so that it retains its value between calls

  // function throttle(callback, delay) {
  //   let lastCall = 0;
  //   return function (...args) {
  //     const now = Date.now();
  //     if (now - lastCall >= delay) {
  //       lastCall = now;
  //       callback(...args);
  //     }
  //   };
  // }

  function printName() {
    console.log('Saurabh Soni');
  }

  // const call = throttle(printName, 5000);

  const debounce = (callback, delay) => {
    let lastArgs = null;
    let timer = null;

    return function (...args) {
      lastArgs = args;
      clearTimeout(timer);
      timer = setTimeout(() => {
        callback(...lastArgs);
        lastArgs = null;
      }, delay);
    };
  };

  const call = debounce(printName, 5000);

  return (
    <View style={{flex: 1, padding: 20}}>
      <TextInput
        ref={inputRef}
        placeholder="enter here"
        style={{
          height: 50,
          borderColor: 'red',
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 10,
          fontSize: 16,
          marginBottom: 20,
        }}
      />
      <Button title="Change Style" onPress={() => call()} />
    </View>
  );
};

export default App;
