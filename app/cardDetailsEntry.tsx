// app/cardDetailsEntry.tsx
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { loadDecryptedEntries, uploadEncryptedEntries } from "../utils/loadDetailsUtil";
import { globalStyles } from "../utils/styles/globalStyles";

export default function CardDetailsEntry() {
  const [cardName, setCardName] = useState('');
  const [number, setNumber] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validThrough, setValidThrough] = useState('');
  const [cvv, setCvv] = useState('');
  const [pin, setPin] = useState('');
  const [entries, setEntries] = useState([]);
  const pageName = "cardDetailsEntry";

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  const loadEntries = async () => {
    try {
      const dataEntries = await loadDecryptedEntries(pageName);
      if (dataEntries) {
        setEntries(JSON.parse(dataEntries));
      } else {
        setEntries([]); // fallback if empty
      }
    }
    catch (err) {
      console.error('Failed to load entries in cardDetailsEntry', err);
    }
  };

  const handlecardNumber = (text: string) => {
    // Remove non-digit characters
    const digits = text.replace(/\D/g, '');
    // Limit to 16 digits
    const limited = digits.slice(0, 16);
    // Add dashes every 4 digits
    const formatted = limited.match(/.{1,4}/g)?.join('-') || '';
    setNumber(formatted);
  };

  const handleValidFrom = (text: string) => {
    // Remove non-digit characters
    const digits = text.replace(/\D/g, '');
    // Limit to 16 digits
    const limited = digits.slice(0, 4);
    // Add dashes every 4 digits
    const formatted = limited.match(/.{1,2}/g)?.join('/') || '';
    setValidFrom(formatted);
  };

  const handleValidThrough = (text: string) => {
    // Remove non-digit characters
    const digits = text.replace(/\D/g, '');
    // Limit to 16 digits
    const limited = digits.slice(0, 4);
    // Add dashes every 4 digits
    const formatted = limited.match(/.{1,2}/g)?.join('/') || '';
    setValidThrough(formatted);
  };

  const saveDetails = async () => {
    const isNamePresent = entries.some(
      (item: any) => item.appName === cardName || item.cardName === cardName
    );
    if (isNamePresent) {
      Alert.alert("Validation Error", "Card name already present.");
      return;
    }
    if (!cardName.trim() || !number.trim() || !validFrom.trim() || !validThrough.trim() || !cvv.trim() || !pin.trim()) {
      Alert.alert("Validation Error", "All fields are required.");
      return;
    }
    if (number.length != 19) {
      Alert.alert("Validation Error", "Card number must be 16 digits.");
      return;
    }
    if (validFrom.length != 5 || validThrough.length != 5) {
      Alert.alert("Validation Error", "Valid From and Valid Through should be digits.");
      return;
    }
    if (cvv.length !== 3) {
      Alert.alert("Validation Error", "CVV must be 3 digits.");
      return;
    }
    const cardEntity = {
      cardName: cardName,
      cardNumber: number,
      from: validFrom,
      to: validThrough,
      cvv: cvv,
      pin: pin
    }
    console.log("add card Entity: " , cardEntity);
    const updatedEntries = [cardEntity, ...entries]
    try {
      const isSuccess = await uploadEncryptedEntries(JSON.stringify(updatedEntries), pageName);
      if (isSuccess) {
        await loadEntries();
        Alert.alert("Success", "Details added successfully!", [{ text: "OK" }]);
      } else {
        Alert.alert("Input Error", "Please set Safety Key");
      }
      await ClearDetails();
    } catch (e) {
      console.error('Failed to upload the entries', e);
    }
  }

  const ClearDetails = () => {
    setCardName("")
    setNumber("")
    setValidFrom("")
    setValidThrough("")
    setCvv("")
    setPin("")
  }

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={globalStyles.container}
      keyboardShouldPersistTaps="handled"
      // extraScrollHeight={80} // how much to scroll up
      enableOnAndroid
    >
      <ScrollView contentContainerStyle={[
        globalStyles.innerContainer,
        { paddingBottom: Platform.OS === "ios" ? 0 : 0 }
      ]}
        keyboardShouldPersistTaps="handled">
        <View style={globalStyles.innerContainer}>

          <Text style={globalStyles.PageTitle}>Enter Card Details</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Card Name"
            placeholderTextColor='#fff'
            keyboardType="default"
            value={cardName}
            onChangeText={setCardName}
          />
          <TextInput
            style={globalStyles.input}
            placeholder="Card Number"
            placeholderTextColor='#fff'
            keyboardType="numeric"
            value={number}
            onChangeText={handlecardNumber}
          />
          <TextInput
            style={globalStyles.input}
            placeholder="Valid From (MM/YY)"
            placeholderTextColor='#fff'
            keyboardType="numeric"
            value={validFrom}
            onChangeText={handleValidFrom}
          />
          <TextInput
            style={globalStyles.input}
            placeholder="Valid Through (MM/YY)"
            placeholderTextColor='#fff'
            keyboardType="numeric"
            value={validThrough}
            onChangeText={handleValidThrough}
          />
          <TextInput
            style={globalStyles.input}
            placeholder="CVV"
            placeholderTextColor='#fff'
            keyboardType="numeric"
            value={cvv}
            onChangeText={setCvv}
          />
          <TextInput
            style={globalStyles.input}
            placeholder="Pin"
            placeholderTextColor='#fff'
            keyboardType="numeric"
            value={pin}
            onChangeText={setPin}
          />
          <TouchableOpacity style={globalStyles.linkButton} onPress={saveDetails}>
            <Text style={globalStyles.linkText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAwareScrollView>

  );
}