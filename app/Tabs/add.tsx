// app/add.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { createPassKeyinStorage, uploadEncryptedEntries } from "../../utils/loadDetailsUtil";
import { globalStyles } from '../../utils/styles/globalStyles';
import CardDetailsEntry from '../cardDetailsEntry';
import PwdDetailsEntry from '../pwdDetailsEntry';

const PASS_STORAGE_KEY = 'StorageKey';
export default function Add() {

  const [entryType, setEntryType] = useState('passwords');
  const [passKey, setPassKey] = useState('');
  const [passKeyFound, setPassKeyFound] = useState(false);
  const pageName = 'addPage';
  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );
  const loadEntries = async () => {
    try {
      const data = await AsyncStorage.getItem(PASS_STORAGE_KEY);
      if (data != null) {
        setPassKeyFound(true);
        // For Debug
        // console.log("loading entries in add file: ", JSON.parse(data))
      } else {
        setPassKeyFound(false);
      }
    } catch (err) {
      console.error('Failed to load Pass Key', err);
    }
  }

  const createNewPassKey = async () => {
    if (passKey.length < 4) {
      Alert.alert("Validation Error", "Pin should be minimum 4 digits.");
      return;
    }
    const isAdded = await createPassKeyinStorage(passKey, pageName);
    if (isAdded) {
      Alert.alert("Success", "Successfully added the pin.");
      setPassKeyFound(true);
      setPassKey('');
      const appEntity = {
        appName: "Mini Vault",
        username: "Mini Vault",
        password: passKey,
      }
      const updatedEntries = [appEntity];
      const isSuccess = await uploadEncryptedEntries(JSON.stringify(updatedEntries), pageName);
      if(!isSuccess){
        Alert.alert("Error", "Failed to create an entry of pass Key.");
      }
    }
  }
  return (
    <View style={globalStyles.container}>
      {passKeyFound ? (
        <View style={{ flex: 1 }}>
          <View style={globalStyles.pickerWrapper}>
            <Picker
              selectedValue={entryType}
              onValueChange={(itemValue) => setEntryType(itemValue)}
              style={globalStyles.picker}
              dropdownIconColor='#fff'
            >
              <Picker.Item label="Passwords" value="passwords" />
              <Picker.Item label="Card Details" value="cardDetails" />
            </Picker>
          </View>

          <View style={{ flex: 1 }}>
            {entryType === "passwords" && <PwdDetailsEntry />}
            {entryType === "cardDetails" && <CardDetailsEntry />}
          </View>
        </View>)
        : (
          <View>
            <TextInput
              style={[globalStyles.input, { marginTop: 20 }]}
              placeholder="Set Safety Pin"
              placeholderTextColor="#fff"
              keyboardType="numeric"
              value={passKey}
              onChangeText={setPassKey}
            />
            <TouchableOpacity style={globalStyles.linkButton} onPress={createNewPassKey}>
              <Text style={globalStyles.linkText}>Set Safety Pin</Text>
            </TouchableOpacity>
          </View>
        )}
    </View>
  );
}
