import AsyncStorage from "@react-native-async-storage/async-storage";
import { decrypt, encrypt } from "./cryptoUtils";

const ENC_ENTRIES = 'EncEntries';
const PASS_STORAGE_KEY = 'StorageKey';

export const loadDecryptedEntries = async (applicationName?: string): Promise<string> => {
  try {
    const pin = await AsyncStorage.getItem(PASS_STORAGE_KEY)
    const encryptData = await AsyncStorage.getItem(ENC_ENTRIES);
    var decrypted;
    if (encryptData != null && pin != null) {
      // console.log("loading encryptData entries in add card file before decrypt:" + encryptData + ":");
      decrypted = decrypt(encryptData, pin);
      // console.log("loading decrypted entries in add card file after decrypt:" + decrypted + ":");
      return decrypted;
    }
  } catch (err) {
    console.error('Failed to load entries in file name', err);
  }
  return "";
};

export const uploadEncryptedEntries = async (inputData: string, applicationName?: string): Promise<boolean> => {
  try {
    const pin = await AsyncStorage.getItem(PASS_STORAGE_KEY)
    // console.log("input data before encrypt:" + inputData + ":");
    var encryptedData;
    if (pin != null) {
      encryptedData = encrypt(inputData, pin);
    } else {
      return false;
    }
    // console.log("Encrypted entries after encrypt:" + encryptedData + ":");
    if (encryptedData != null) {
      await AsyncStorage.setItem(ENC_ENTRIES, encryptedData);
    }
  } catch (err) {
    console.error('Failed to upload entries in file name', err);
    return false;
  }
  return true;
};

export const deleteEntry = async (appNameToBeDeleted: string, applicationName?: string): Promise<boolean> => {
  try {
    const storedData = await loadDecryptedEntries(applicationName);
    if (!storedData) {
      return false;
    }
    const parsedData = JSON.parse(storedData);
    const updatedData = parsedData.filter(
      (item: any) => item.appName !== appNameToBeDeleted && item.cardName !== appNameToBeDeleted
    );
    const isSuccess = await uploadEncryptedEntries(JSON.stringify(updatedData), applicationName);
    return isSuccess;
  } catch (err) {
    console.error('Failed to load entries in file name', err);
    return false;
  }
};

export const editEntry = async (record: any, applicationName?: string): Promise<boolean> => {
  try {
    const nameToBeUpdated = record?.appName || record?.cardName;

    const storedData = await loadDecryptedEntries(applicationName);
    if (!storedData) {
      return false;
    }
    const parsedData = JSON.parse(storedData);
    const filteredData = parsedData.filter(
      (item: any) => item.appName !== nameToBeUpdated && item.cardName !== nameToBeUpdated
    );
    const newData = [JSON.parse(JSON.stringify(record)), ...filteredData]
    const isSuccess = await uploadEncryptedEntries(JSON.stringify(newData), applicationName);
    return isSuccess;
  } catch (err) {
    console.error('Failed to load entries in file name', err);
    return false;
  }
};

export const createPassKeyinStorage = async (passKey:string, applicationName?: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(PASS_STORAGE_KEY, JSON.stringify(passKey));
    return true;
  } catch (err) {
    console.error('Failed to set passkey in file name', err);
    return false;
  }
};

export const clearWholeData = async (applicationName?: string): Promise<boolean> => {
  try {
    await AsyncStorage.clear();
    console.log("Clearing the whole data");
  } catch (err) {
    console.error('Failed to load entries in file name', err);
    return false;
  }
};

