import { Stack } from "expo-router";

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: "modal", // 👈 ensures all screens in this group are modals
        headerShown: true,     // show header if needed
        headerStyle: {
          backgroundColor: "#122025", // same as tabBarStyle
        },
        headerTintColor: "#fff", // text/icons color
        headerTitleStyle: {
          color: "#fff",
          fontWeight: "bold",
          fontSize: 25,
        }
      }}
    />
  );
}
