import React, { useState, useEffect } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useBeadStore } from "@/context/BeadStoreContext";
import { useColors } from "@/hooks/useColors";
import { BeadBubble } from "@/components/BeadBubble";
import { useBeadDefinitions } from "@/context/BeadDefinitionsContext";
import { format, parseISO } from "date-fns";

function parseDateString(s: string): Date {
  try {
    const d = parseISO(s);
    if (!isNaN(d.getTime())) return d;
  } catch {}
  return new Date();
}

export default function AddBead() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { beads, addBead, updateBead, deleteBead } = useBeadStore();
  const { presets: BEAD_PRESETS } = useBeadDefinitions();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const editingBead = id ? beads.find((b) => b.id === id) : null;

  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customReason, setCustomReason] = useState("");
  const [notes, setNotes] = useState("");
  const [earnedAt, setEarnedAt] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (editingBead) {
      const pi = BEAD_PRESETS.findIndex((p) => p.colorName === editingBead.colorName);
      setSelectedPreset(pi >= 0 ? pi : 0);
      setCustomReason(editingBead.reason);
      setNotes(editingBead.notes ?? "");
      setEarnedAt(editingBead.earnedAt.split("T")[0]);
    }
  }, []);

  const preset = BEAD_PRESETS[selectedPreset];
  const selectedDate = parseDateString(earnedAt);

  function handleDateChange(_: unknown, date?: Date) {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (date) {
      setEarnedAt(format(date, "yyyy-MM-dd"));
    }
  }

  function handleSave() {
    const reason = customReason.trim() || preset.reason;
    if (!reason) {
      Alert.alert("Missing info", "Please enter a reason for this bead.");
      return;
    }
    const beadData = {
      color: preset.color,
      colorName: preset.colorName,
      name: preset.name,
      reason,
      earnedAt: new Date(earnedAt + "T12:00:00").toISOString(),
      notes: notes.trim() || undefined,
    };
    if (editingBead) {
      updateBead(editingBead.id, beadData);
    } else {
      addBead(beadData);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  function handleDelete() {
    if (!editingBead) return;
    Alert.alert("Delete bead?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteBead(editingBead.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          router.back();
        },
      },
    ]);
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const formattedDisplayDate = format(selectedDate, "MMMM d, yyyy");

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {editingBead ? "Edit Bead" : "Add Bead"}
        </Text>
        {editingBead ? (
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
        <View style={styles.previewRow}>
          <BeadBubble color={preset.color} size={72} isGlow={preset.isGlow} />
          <View style={styles.previewText}>
            <Text style={[styles.presetName, { color: colors.foreground }]}>{preset.name}</Text>
            <Text style={[styles.presetReason, { color: colors.mutedForeground }]}>{preset.reason}</Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Choose Bead Type</Text>
        <View style={styles.presetGrid}>
          {BEAD_PRESETS.map((p, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                setSelectedPreset(i);
                setCustomReason("");
                Haptics.selectionAsync();
              }}
              style={[
                styles.presetItem,
                {
                  borderColor: i === selectedPreset ? colors.primary : colors.border,
                  backgroundColor: i === selectedPreset ? colors.accent + "40" : colors.card,
                },
              ]}
              activeOpacity={0.7}
            >
              <BeadBubble color={p.color} size={28} isGlow={p.isGlow} />
              <Text
                style={[
                  styles.presetItemLabel,
                  { color: i === selectedPreset ? colors.primary : colors.mutedForeground },
                ]}
                numberOfLines={1}
              >
                {p.colorName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Reason</Text>
        <TextInput
          style={[
            styles.textInput,
            { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border },
          ]}
          placeholder={preset.reason}
          placeholderTextColor={colors.mutedForeground}
          value={customReason}
          onChangeText={setCustomReason}
        />

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Date Earned</Text>

        {Platform.OS === "web" ? (
          <TextInput
            style={[
              styles.textInput,
              { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border },
            ]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.mutedForeground}
            value={earnedAt}
            onChangeText={setEarnedAt}
            keyboardType="numbers-and-punctuation"
          />
        ) : (
          <>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                Haptics.selectionAsync();
                setShowPicker(true);
              }}
              activeOpacity={0.7}
            >
              <Feather name="calendar" size={18} color={colors.primary} />
              <Text style={[styles.dateButtonText, { color: colors.foreground }]}>
                {formattedDisplayDate}
              </Text>
              <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>

            {/* iOS: modal sheet with inline calendar */}
            {Platform.OS === "ios" && (
              <Modal
                visible={showPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPicker(false)}
              >
                <TouchableOpacity
                  style={styles.modalBackdrop}
                  activeOpacity={1}
                  onPress={() => setShowPicker(false)}
                />
                <View style={[styles.pickerSheet, { backgroundColor: colors.card, paddingBottom: botPad + 16 }]}>
                  <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.pickerTitle, { color: colors.foreground }]}>Select Date</Text>
                    <TouchableOpacity
                      onPress={() => setShowPicker(false)}
                      style={[styles.pickerDoneBtn, { backgroundColor: colors.primary }]}
                    >
                      <Text style={styles.pickerDoneText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="inline"
                    maximumDate={new Date()}
                    onChange={handleDateChange}
                    style={styles.picker}
                    accentColor={colors.primary}
                  />
                </View>
              </Modal>
            )}

            {/* Android: shows inline directly */}
            {Platform.OS === "android" && showPicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="calendar"
                maximumDate={new Date()}
                onChange={handleDateChange}
              />
            )}
          </>
        )}

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Notes (optional)</Text>
        <TextInput
          style={[
            styles.textInput,
            styles.textArea,
            { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border },
          ]}
          placeholder="Any thoughts or memories about this moment..."
          placeholderTextColor={colors.mutedForeground}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: botPad + 16,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Feather name="check" size={20} color="#FFF" />
          <Text style={styles.saveBtnText}>{editingBead ? "Save Changes" : "Add Bead"}</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  previewRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 16, padding: 16, borderRadius: 20, backgroundColor: "#FFF5F7" },
  previewText: { flex: 1, gap: 4 },
  presetName: { fontSize: 17, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  presetReason: { fontSize: 14, fontFamily: "Inter_400Regular" },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 4,
  },
  presetGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  presetItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    minWidth: 64,
  },
  presetItemLabel: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  textInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  textArea: { minHeight: 100 },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dateButtonText: { flex: 1, fontSize: 16, fontFamily: "Inter_400Regular" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  pickerSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  pickerTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  pickerDoneBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pickerDoneText: { color: "#FFF", fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  picker: { width: "100%" },
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
