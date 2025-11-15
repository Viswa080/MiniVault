// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#122025", // same as tabBarStyle
        },
        headerTintColor: "#000000ff", // text/icons color
        headerTitleStyle: {
          color: "#fff",
          fontWeight: "bold",
          fontSize: 25,
        },
        tabBarStyle: {
          backgroundColor: "#122025", // 👈 your tab background color
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#6f6e6eff",
        
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add Entry",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
       {/* <Tabs.Screen
        name="share"
        options={{
          title: "Share",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="share-social-outline" size={size} color={color} />
          ),
        }}
      /> */}
    </Tabs>
  );
}
