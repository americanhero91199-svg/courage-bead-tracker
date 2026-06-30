import { Redirect } from "expo-router";
import { useBeadStore } from "@/context/BeadStoreContext";
import { View } from "react-native";

export default function Index() {
  const { child, isLoaded } = useBeadStore();
  if (!isLoaded) return <View style={{ flex: 1, backgroundColor: "#FFFAEB" }} />;
  if (!child) return <Redirect href="/welcome" />;
  return <Redirect href="/(tabs)" />;
}
