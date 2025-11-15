// app/home.tsx
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from 'expo-local-authentication';
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { clearWholeData, loadDecryptedEntries } from "../../utils/loadDetailsUtil";
import { globalStyles } from "../../utils/styles/globalStyles";

export default function Home() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [inputFilter, setInputFilter] = useState("");
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const toggleMenu = () => setMenuVisible(!menuVisible);
  const closeMenu = () => setMenuVisible(false);
  const pageName = "HomePage";

  useFocusEffect(
    useCallback(() => {
      loadEntries();
      setInputFilter('');
    }, [])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Mini Vault",
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: 16, marginRight: 16, }}>
          {/* Action buttons */}
          <TouchableOpacity onPress={toggleMenu}>
            <Ionicons name="reorder-three-outline" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      ),
      headerTintColor: "#1B2329"
    });
  }, [navigation, menuVisible]);

  useEffect(() => {
    filterData();
  }, [entries, inputFilter]);

  const loadEntries = async () => {
    try {
      const dataEntries = await loadDecryptedEntries(pageName);
      if (dataEntries) {
        setEntries(JSON.parse(dataEntries));
      } else {
        setEntries([]); // fallback if empty
      }
    } catch (err) {
    }
  };

  const checkDetails = async (item: any) => {
    const authResult = await authenticate();
    if (authResult) {
      router.push({
        pathname: "/modals/details",
        params: { details: JSON.stringify(item) },
      });
    }
  };

  //method to filter data
  const filterData = () => {
    // console.log("input value was : ", inputFilter);
    if (inputFilter != "") {
      const filtered = entries.filter((item: any) =>
        (item.appName?.toLowerCase().includes(inputFilter.toLowerCase()) || item.cardName?.toLowerCase().includes(inputFilter.toLowerCase()))
      );
      setFilteredEntries(filtered);
    }
    else {
      setFilteredEntries(entries);
    }
  };

  // To clear whole Data
  const clearData = async () => {
    Alert.alert(
      "Clear Data",
      "Are you sure you want to clear the entire data?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await clearWholeData(pageName);
              loadEntries();
            } catch (error) {
              Alert.alert("Error", "Unexpected error occurred while deleting record.");
            }

          },
        },
      ]
    );
  };

  const authenticate = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();

    if (!compatible) {
      console.log('Device does not support biometrics');
    } else if (!enrolled) {
      console.log('No biometrics enrolled on device');
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Please Authenticate',
      fallbackLabel: 'Use Passcode',
      disableDeviceFallback: false,
    });

    if (result.success) { return true } else { return false }
  };
  const renderItem = ({ item }: { item: any }) => (

    <View style={globalStyles.homePageCard}>
      {item.appName ? (
        <>
          <Text style={globalStyles.title}>{item.appName}</Text>
          <Text style={globalStyles.username}>{item.username || "-"}</Text>
        </>
      ) : (
        <>
          <Text style={globalStyles.title}>{item.cardName}</Text>
          <Text style={globalStyles.username}>{String(item.cardNumber).slice(15) || "-"}</Text>
        </>
      )}
      {/* Column 3: Icon */}
      <TouchableOpacity onPress={() => checkDetails(item)}>
        <Ionicons name="finger-print-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* ---- Dropdown Menu ---- */}
      {menuVisible && (
        <>
          {/* Overlay to close when tapping outside */}
          <TouchableOpacity style={styles.overlay} onPress={closeMenu} />
          <View style={styles.dropdown}>
            {/* <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                console.log("Import tapped");
                closeMenu();
              }}
            >
              <Text style={styles.menuText}>Import</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                console.log("Export tapped");
                closeMenu();
              }}
            >
              <Text style={styles.menuText}>Export</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                clearData();
                closeMenu();
              }}
            >
              <Text style={styles.menuText}>Clear Data</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ---- Main Content ---- */}

      <View style={globalStyles.container}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#ccc" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search apps or cards"
            placeholderTextColor="#fff"
            style={styles.searchInput}
            keyboardType="default"
            value={inputFilter}
            onChangeText={setInputFilter}
            onBlur={filterData}
          />
        </View>
        {filteredEntries.length !== 0 ? (
          <FlatList
            data={filteredEntries}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={globalStyles.innerContainer}
          />

        ) : (
          <View style={globalStyles.centercontainer}>
            <Text style={globalStyles.mainInfo}>
              Currently there is no data to display.{"\n"}
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  dropdown: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 16,
    color: "#2c3e50",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  itemBox: {
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B2329",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
});