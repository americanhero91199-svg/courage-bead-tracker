import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useBeadStore } from "@/context/BeadStoreContext";
import { useColors } from "@/hooks/useColors";
import { BeadBubble } from "@/components/BeadBubble";
import { useBeadDefinitions } from "@/context/BeadDefinitionsContext";

export default function Welcome() {
  const [name, setName] = useState("");
  const { setChildName } = useBeadStore();
  const { presets } = useBeadDefinitions();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const previewBeads = presets.slice(0, 7);

  function handleStart() {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Name required", "Please enter the child's name to continue.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setChildName(trimmed);
    router.replace("/(tabs)");
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.inner, { paddingTop: topPad + 32, paddingBottom: botPad + 24 }]}>
        <View style={styles.beadsRow}>
          {previewBeads.map((b, i) => (
            <BeadBubble key={i} color={b.color} size={36} isGlow={b.isGlow} />
          ))}
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>Courage Bead Tracker</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Track every brave moment.{"\n"}One bead at a time.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Child's name</Text>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
            placeholder="e.g. Emma"
            placeholderTextColor={colors.mutedForeground}
            value={name}
            onChangeText={setName}
            returnKeyType="done"
            onSubmitEditing={handleStart}
            autoFocus
            autoCapitalize="words"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.btn,
            { backgroundColor: name.trim() ? colors.primary : colors.muted },
          ]}
          onPress={handleStart}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.btnText,
              { color: name.trim() ? colors.primaryForeground : colors.mutedForeground },
            ]}
          >
            Start Tracking
          </Text>
        </TouchableOpacity>

        <Text style={[styles.note, { color: colors.mutedForeground }]}>
          Everything is saved privately on this device.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  beadsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    fontFamily: "Inter_400Regular",
  },
  card: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  input: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  btn: {
    width: "100%",
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  note: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
});
