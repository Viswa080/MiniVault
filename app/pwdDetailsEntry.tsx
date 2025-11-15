// UserDetailsForm.tsx
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { loadDecryptedEntries, uploadEncryptedEntries } from "../utils/loadDetailsUtil";
import { globalStyles } from "../utils/styles/globalStyles";

type ExtraField = { id: number; label: string; value: string };

export default function test() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [appName, setAppName] = useState("");

  // The list of user-added key/value extras
  const [extras, setExtras] = useState<ExtraField[]>([]);

  // The temporary inputs that appear when user clicks "Add More"
  const [showAddInputs, setShowAddInputs] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const [entries, setEntries] = useState([]);
  const pageName = "pwdDwtailsEntry";

  useFocusEffect(
    useCallback(() => {
      setShowAddInputs(false)
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
    } catch (err) {
      console.error('Failed to load entries in pwdDetailsEntry', err);
    }
  };

  const addField = () => {
    const labelTrimmed = newLabel.trim();
    if (!labelTrimmed) {
      Alert.alert("Validation", "Please enter a field name.");
      return;
    }

    // Prevent collisions with username/password keys
    const reserved = ["username", "password"];
    if (reserved.includes(labelTrimmed.toLowerCase())) {
      Alert.alert("Invalid field name", `Please use above field for adding ${labelTrimmed}`);
      return;
    }

    const existingIndex = extras.findIndex((e) => e.label.toLowerCase() === labelTrimmed.toLocaleLowerCase());
    if (existingIndex >= 0) {
      // Ask whether to overwrite
      Alert.alert(
        "Field exists",
        `A field named "${labelTrimmed}" already exists. Overwrite its value?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Overwrite",
            onPress: () => {
              setExtras((prev) =>
                prev.map((e, i) => (i === existingIndex ? { ...e, value: newValue } : e))
              );
              clearNewInputs();
            },
          },
        ]
      );
      return;
    }

    // Add new field
    setExtras((prev) => [
      ...prev,
      { id: Date.now(), label: labelTrimmed, value: newValue },
    ]);
    clearNewInputs();
  };

  const clearNewInputs = () => {
    setNewLabel("");
    setNewValue("");
    setShowAddInputs(false);
  };

  const removeExtra = (id: number) => {
    setExtras((prev) => prev.filter((e) => e.id !== id));
  };

  // Merge entity for save / preview
  const mergedEntity = extras.reduce<Record<string, string | undefined>>(
    (acc, e) => ({ ...acc, [e.label]: e.value }),
    { appName, username, password }
  );

  const handleSave = async () => {
    if (!appName?.trim() || !username?.trim()) {
      Alert.alert(
        "Validation Error",
        "Please fill required fields: Application and Username"
      );
      return;
    }
    const isNamePresent = entries.some(
      (item: any) => item.appName === appName || item.cardName === appName
    );
    if (isNamePresent) {
      Alert.alert("Validation Error", "Application name already present.");
      return;
    }
    const updatedEntries = [mergedEntity, ...entries]
    try {
      const isSuccess = await uploadEncryptedEntries(JSON.stringify(updatedEntries), pageName);
      if (isSuccess) {
        await loadEntries();
        Alert.alert("Success", "Details added successfully!", [{ text: "OK" }]);
      } else {
        Alert.alert("Input Error", "Please set Safety Key");
      }
      await clearScreenData();
    } catch (e) {
      console.error('Failed to upload the entries', e);
    }
  };

  const clearScreenData = async () => {
    setAppName("");
    setUsername("");
    setPassword("");
    setNewLabel("");
    setNewValue("");
    setExtras([]);
    setShowAddInputs(false);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0A0F12", paddingBottom:0 }}
      keyboardVerticalOffset={125}  
      // behavior={Platform.OS === "ios" ? "padding" : "height"} // moves content up on keyboard open
      behavior="padding"
    >
      <View style={{ flex: 1 }}>
        {/* Scrollable Fields */}
        <KeyboardAwareScrollView
          contentContainerStyle={[
            globalStyles.innerContainer,
            { flexGrow: 1} // space for bottom block
          ]}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          enableAutomaticScroll={false}
          extraScrollHeight={0}
        >
          <Text style={globalStyles.PageTitle}>Enter Details</Text>

          {/* Username / Password (initial fields) */}
          <TextInput
            value={appName}
            onChangeText={setAppName}
            placeholder="Application"
            keyboardType="default"
            placeholderTextColor='#fff'
            style={globalStyles.input}
            autoCapitalize="words"
          />
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            keyboardType="default"
            placeholderTextColor='#fff'
            style={globalStyles.input}
            autoCapitalize="none"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            keyboardType="default"
            placeholderTextColor='#fff'
            style={globalStyles.input}
            secureTextEntry
          />

          {/* Existing extras */}
          <View style={{ width: "100%", marginTop: 5 }}>
            <Text style={[styles.label, { marginBottom: 6 }]}>Additional Details</Text>
            {extras.length === 0 ? (
              <Text style={styles.hint}>No additional details added yet.</Text>
            ) : (
              extras.map((e) => (
                <View key={e.id} style={styles.extraRow}>
                  <View style={{ flex: 1, flexDirection: "row" }}>
                    <Text style={styles.extraLabel}>{e.label}</Text>
                    <Text style={styles.extraValue}>{e.value}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert("Remove", `Remove "${e.label}"?`, [
                        { text: "Cancel", style: "cancel" },
                        { text: "Remove", style: "destructive", onPress: () => removeExtra(e.id) },
                      ])
                    }
                    style={styles.removeBtn}
                  >
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </KeyboardAwareScrollView>
        {/* Toggle Add More inputs */}
        <View
          style={{
            backgroundColor: "#0A0F12",
            borderTopWidth: 0.5,
            borderTopColor: "#333",
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: Platform.OS === "ios" ? 30 : 10,
          }}
        >
          {!showAddInputs ? (
            <TouchableOpacity style={globalStyles.linkButton} onPress={() => setShowAddInputs(true)}>
              <Text style={globalStyles.linkText}>Add More</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={[styles.label, { marginTop: 5 }]}>Field name</Text>
              <TextInput
                value={newLabel}
                onChangeText={setNewLabel}
                keyboardType="default"
                placeholder="e.g. phone, address, age"
                placeholderTextColor='#fff'
                style={globalStyles.input}
                autoCapitalize="none"
              />
              <Text style={[styles.label]}>Value</Text>
              <TextInput
                value={newValue}
                onChangeText={setNewValue}
                keyboardType="default"
                placeholder="Enter value"
                placeholderTextColor='#fff'
                style={globalStyles.input}
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <TouchableOpacity style={globalStyles.linkButton} onPress={addField}>
                    <Text style={globalStyles.linkText}>Add Field</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                  <TouchableOpacity style={globalStyles.linkButton} onPress={clearNewInputs}>
                    <Text style={globalStyles.linkText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
          {/* Preview / Save */}
          <View style={{ width: "100%", marginTop: 8 }}>
            {/* <Text style={styles.label}>Merged Entity Preview</Text>
          <View style={styles.previewBox}>
            <Text style={styles.previewText}>{JSON.stringify(mergedEntity, null, 2)}</Text>
          </View> */}
            <View style={{ marginTop: 0 }}>
              <TouchableOpacity style={globalStyles.linkButton} onPress={handleSave}>
                <Text style={globalStyles.linkText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  label: { alignSelf: "flex-start", fontWeight: "600", marginBottom: 6, fontSize: 16, color: '#fff' },
  hint: { color: "#fff", marginBottom: 6, fontSize: 15 },
  extraRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#1B2329",
    marginBottom: 8,
    width: "100%",
  },
  extraLabel: {
    fontWeight: "700",
    fontSize: 17,
    marginRight: 15,
    color: "#fff"
  },
  extraValue: { color: "#fff", marginTop: 2, fontSize: 15 },
  removeBtn: { paddingHorizontal: 12, paddingVertical: 6, marginRight: 20 },
  removeBtnText: { color: "#d00", fontWeight: "600" },
  previewBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#eee",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  previewText: { fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
  row: { flexDirection: "row", marginTop: 0, width: "100%" },
  extraTextContainer: {
    flexDirection: "row", // make label & value appear side by side
    alignItems: "center",
    flexShrink: 1,
  },

});
