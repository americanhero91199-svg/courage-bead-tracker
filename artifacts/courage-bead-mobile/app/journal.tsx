import React, { useState, useEffect } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useBeadStore } from "@/context/BeadStoreContext";
import { useColors } from "@/hooks/useColors";
import { format } from "date-fns";

export default function Journal() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { notes, addNote, updateNote, deleteNote } = useBeadStore();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const editingNote = id ? notes.find((n) => n.id === id) : null;

  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [text, setText] = useState("");

  useEffect(() => {
    if (editingNote) {
      setDate(editingNote.date.split("T")[0]);
      setText(editingNote.text);
    }
  }, []);

  function handleSave() {
    if (!text.trim()) {
      Alert.alert("Empty note", "Please write something before saving.");
      return;
    }
    if (editingNote) {
      updateNote(editingNote.id, { date, text: text.trim() });
    } else {
      addNote({ date, text: text.trim() });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  function handleDelete() {
    if (!editingNote) return;
    Alert.alert("Delete note?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteNote(editingNote.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          router.back();
        },
      },
    ]);
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {editingNote ? "Edit Reflection" : "New Reflection"}
        </Text>
        {editingNote ? (
          <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
            <Feather name="trash-2" size={20} color={colors.destructive} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerBtn} />
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: botPad + 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconRow}>
          <View style={[styles.iconBg, { backgroundColor: colors.accent + "60" }]}>
            <Feather name="book-open" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.iconSubtitle, { color: colors.mutedForeground }]}>
            A moment worth remembering
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Date</Text>
        <TextInput
          style={[
            styles.textInput,
            { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border },
          ]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.mutedForeground}
          value={date}
          onChangeText={setDate}
          keyboardType="numbers-and-punctuation"
        />

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Your Reflection</Text>
        <TextInput
          style={[
            styles.textInput,
            styles.textArea,
            { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border },
          ]}
          placeholder="What happened today? How did you feel? What made you proud?"
          placeholderTextColor={colors.mutedForeground}
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
          autoFocus={!editingNote}
        />
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: botPad + 16, backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Feather name="check" size={20} color="#FFF" />
          <Text style={styles.saveBtnText}>{editingNote ? "Save Changes" : "Save Reflection"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 8 },
  iconRow: { alignItems: "center", gap: 10, marginBottom: 12 },
  iconBg: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  iconSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular" },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  textArea: { minHeight: 160 },
  footer: { paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1 },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 18,
  },
  saveBtnText: { color: "#FFF", fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
