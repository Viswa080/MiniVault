import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useLayoutEffect, useState } from "react";
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
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { deleteEntry, editEntry } from "../../utils/loadDetailsUtil";
import { globalStyles } from "../../utils/styles/globalStyles";

export default function Details() {
  const { details } = useLocalSearchParams();
  const router = useRouter();
  const pageName = "Details Page";
  const navigation = useNavigation();
  const [isEditDisabled, setIsEditDisabled] = useState(false);

  // ✅ Parse the record directly (not an array)
  let parsedRecord: Record<string, any> | null = null;
  try {
    parsedRecord = details ? JSON.parse(details as string) : null;
  } catch (e) {
    console.error("Invalid details JSON", e);
  }

  const [record, setRecord] = useState(parsedRecord);
  const [originalData, setOriginalData] = useState(parsedRecord);
  // For adding new fields
  const [showAddInputs, setShowAddInputs] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  const reservedKeys = ["appName", "username", "password", "cardName", "cardNumber", "cvv", "from", "to", "pin"];


  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Details",
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: 16, marginRight: 8 }}>
          {/* Action buttons */}
          <TouchableOpacity onPress={ToggleEdit}>
            <Ionicons name="create-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmDelete}>
            <Ionicons name="trash-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, record]);

  useFocusEffect(
    useCallback(() => {
      setIsEditDisabled(true);
    }, [])
  );


  // Label mapping
  const labelMap: Record<string, string> = {
    appName: "App Name",
    username: "User Name",
    password: "Password",
    cardName: "Card Name",
    cardNumber: "Card Number",
    cvv: "Security Code",
    from: "Valid From",
    to: "Valid To",
    pin: "PIN",
  };

  if (!record) {
    return (
      <View style={globalStyles.container}>
        <Text>No record found.</Text>
      </View>
    );
  }
  // Toggle Edit
  const ToggleEdit = () => {
    setIsEditDisabled(prev => {
      if (!prev) {
        // ✅ User is leaving edit mode → discard unsaved changes
        setRecord(originalData);
      }
      return !prev;
    });
  };


  // 🗑️ Delete confirmation
  const confirmDelete = () => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const name = record?.appName || record?.cardName;
              if (!name) {
                Alert.alert("Error", "No valid record name found to delete!");
                return;
              }

              const isDeleted = await deleteEntry(name, pageName);
              if (isDeleted) {
                Alert.alert("Deleted", "Record deleted successfully!", [
                  {
                    text: "OK",
                    onPress: () => router.replace("/Tabs/home"), // ✅ Navigate home after OK
                  },
                ]);
              } else {
                Alert.alert("Error", "Facing issue deleting record!");
              }
            } catch (error) {
              Alert.alert("Error", "Unexpected error occurred while deleting record.");
            }
          },
        },
      ]
    );
  };

  // Handle text change for a specific field
  const handleChange = (key: string, value: string) => {
    setRecord((prev) => ({ ...prev, [key]: value }));
  };
  const removeField = (key: string) => {
    if (reservedKeys.includes(key)) {
      Alert.alert("Restricted", `"${key}" is a core field and cannot be removed.`);
      return;
    }
    const updated = { ...record };
    delete updated[key];
    setRecord(updated);
  };

  const addNewField = () => {
    const labelTrimmed = newLabel.trim();
    if (!labelTrimmed) {
      Alert.alert("Validation", "Please enter a field name.");
      return;
    }
    if (reservedKeys.includes(labelTrimmed.toLowerCase())) {
      Alert.alert("Invalid", "That field name is reserved.");
      return;
    }
    if (record[labelTrimmed]) {
      Alert.alert("Exists", "Field already exists. Try a different name.");
      return;
    }

    setRecord(prev => ({ ...prev, [labelTrimmed]: newValue }));
    setNewLabel("");
    setNewValue("");
    setShowAddInputs(false);
  };

  const handleSave = async () => {
    const success = await editEntry(record, pageName);
    if (success) {
      setOriginalData(record);
      Alert.alert("Success", "Details updated successfully");
      setIsEditDisabled(true);
    } else {
      Alert.alert("Error", "Facing issue while editing record!");
    }
  };
return (
  <KeyboardAvoidingView
    style={{ flex: 1, backgroundColor: "#0A0F12" }}
    behavior={Platform.OS === "ios" ? "padding" : "height"} // moves content up on keyboard open
  >
    <View style={{ flex: 1 }}>
      {/* Scrollable Fields */}
      <KeyboardAwareScrollView
        contentContainerStyle={[
          globalStyles.innerContainer,
          { flexGrow: 1, paddingBottom: 0} // space for bottom block
        ]}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        enableAutomaticScroll={false}
        extraScrollHeight={0}
      >
        {isEditDisabled ? (
          <View style={globalStyles.card}>
            {Object.entries(record).map(([key, value], idx) => (
              <View
                key={idx}
                style={[
                  styles.row,
                  idx % 2 === 0 ? styles.rowEven : styles.rowOdd,
                ]}
              >
                <Text style={styles.keyText}>{labelMap[key] ?? key}</Text>
                <Text style={styles.valueText}>
                  {value && String(value).trim() !== "" ? String(value) : "-"}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={globalStyles.card}>
            {Object.entries(record).map(([key, value], idx) => (
              <View
                key={key}
                style={[
                  styles.row,
                  idx % 2 === 0 ? styles.rowEven : styles.rowOdd,
                ]}
              >
                <Text style={styles.editPageKeyText}>{labelMap[key] ?? key}</Text>
                <TextInput
                  style={[styles.input, { flex: 2, minWidth: 160 }]}
                  value={String(value ?? "")}
                  onChangeText={(text) => handleChange(key, text)}
                  placeholder={`Enter ${labelMap[key] ?? key}`}
                  placeholderTextColor="#3d3a3a"
                />
                {!reservedKeys.includes(key) && (
                  <TouchableOpacity
                    onPress={() => removeField(key)}
                    style={{ marginLeft: 12 }}
                  >
                    <Ionicons name="close-circle" size={20} color="#d00" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </KeyboardAwareScrollView>

      {/* 🧱 Fixed Bottom Panel (Moves up with keyboard) */}
      {!isEditDisabled && (
        <View
          style={{
            backgroundColor: "#0A0F12",
            borderTopWidth: 0.5,
            borderTopColor: "#333",
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: Platform.OS === "ios" ? 30 : 50,
          }}
        >
          {showAddInputs ? (
            <>
              <Text style={styles.label}>New Field Name</Text>
              <TextInput
                style={globalStyles.editPageInput}
                value={newLabel}
                onChangeText={setNewLabel}
                placeholder="e.g. website, address"
                placeholderTextColor="#3d3a3a"
              />
              <Text style={styles.label}>Value</Text>
              <TextInput
                style={globalStyles.editPageInput}
                value={newValue}
                onChangeText={setNewValue}
                placeholder="Enter value"
                placeholderTextColor="#3d3a3a"
              />
              <View style={{ flexDirection: "row", marginTop: 8 }}>
                <TouchableOpacity
                  style={[globalStyles.linkButton, { flex: 1, marginRight: 8 }]}
                  onPress={addNewField}
                >
                  <Text style={globalStyles.linkText}>Add Field</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[globalStyles.linkButton, { flex: 1 }]}
                  onPress={() => setShowAddInputs(false)}
                >
                  <Text style={globalStyles.linkText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity
              style={[globalStyles.linkButton, { marginBottom: 10 }]}
              onPress={() => setShowAddInputs(true)}
            >
              <Text style={globalStyles.linkText}>Add New Field</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  </KeyboardAvoidingView>
);

}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  rowEven: { backgroundColor: "#fff" },
  rowOdd: { backgroundColor: "#f1f1f1" },
  keyText: { fontWeight: "bold", fontSize: 14, color: "#333", flex: 1 },
  editPageKeyText: { fontWeight: "bold", fontSize: 14, color: "#333", flex: 1, marginTop: 5 },
  valueText: { fontSize: 14, color: "#555", flex: 2, textAlign: "right" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 5,
    fontSize: 14,
    color: "#000",
    textAlign: "left",
  },
  saveButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  label: { alignSelf: "flex-start", fontWeight: "600", marginBottom: 6, color: "#fff" },
});
