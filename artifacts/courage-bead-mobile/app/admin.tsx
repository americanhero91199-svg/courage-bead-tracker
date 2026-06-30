import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { useBeadDefinitions } from "@/context/BeadDefinitionsContext";
import { useBeadStore } from "@/context/BeadStoreContext";
import { useColors } from "@/hooks/useColors";
import { BeadBubble } from "@/components/BeadBubble";

type ImportStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; count: number }
  | { kind: "error"; message: string };

export default function Admin() {
  const {
    definitions,
    isCustom,
    importedAt,
    exportDefinitions,
    pickAndImport,
    resetToDefault,
  } = useBeadDefinitions();
  const { clearData } = useBeadStore();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [importStatus, setImportStatus] = useState<ImportStatus>({
    kind: "idle",
  });
  const [exporting, setExporting] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  async function handleExport() {
    setExporting(true);
    try {
      await exportDefinitions();
    } catch {
      Alert.alert("Export failed", "Could not export the bead definitions.");
    } finally {
      setExporting(false);
    }
  }

  async function handleImport() {
    setImportStatus({ kind: "loading" });
    const result = await pickAndImport();
    if (result.success) {
      setImportStatus({ kind: "success", count: result.count });
    } else {
      setImportStatus({ kind: "error", message: result.error });
    }
  }

  function handleReset() {
    Alert.alert(
      "Reset to default beads?",
      "Your imported bead definitions will be removed and the built-in list will be restored.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetToDefault();
            setImportStatus({ kind: "idle" });
          },
        },
      ]
    );
  }

  function handleClearData() {
    Alert.alert(
      "Clear all tracking data?",
      "This will delete all beads, journal entries, and the child profile. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything",
          style: "destructive",
          onPress: () => {
            clearData();
            router.replace("/welcome");
          },
        },
      ]
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
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
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Admin
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: botPad + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Status card ─────────────────────────────────────────────── */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: isCustom
                ? colors.primary + "12"
                : colors.muted,
              borderColor: isCustom ? colors.primary + "30" : colors.border,
            },
          ]}
        >
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isCustom ? colors.primary : colors.mutedForeground },
              ]}
            />
            <View style={styles.statusText}>
              <Text
                style={[styles.statusTitle, { color: colors.foreground }]}
              >
                {isCustom ? "Custom bead definitions" : "Default bead definitions"}
              </Text>
              <Text
                style={[styles.statusSub, { color: colors.mutedForeground }]}
              >
                {definitions.length} beads
                {importedAt
                  ? ` · imported ${format(parseISO(importedAt), "MMM d, yyyy")}`
                  : " · built into app"}
              </Text>
            </View>
            {isCustom && (
              <TouchableOpacity
                onPress={handleReset}
                style={[
                  styles.resetBtn,
                  { borderColor: colors.destructive + "60" },
                ]}
              >
                <Text
                  style={[styles.resetBtnText, { color: colors.destructive }]}
                >
                  Reset
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Export ──────────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          Export
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardDescription, { color: colors.mutedForeground }]}>
            Download the current bead list as a{" "}
            <Text style={{ fontFamily: "Inter_600SemiBold" }}>
              bead-definitions.json
            </Text>{" "}
            file. Use it as a backup or to share your configuration.
          </Text>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: colors.primary },
              exporting && { opacity: 0.6 },
            ]}
            onPress={handleExport}
            disabled={exporting}
            activeOpacity={0.85}
          >
            <Feather name="upload" size={18} color="#FFF" />
            <Text style={styles.actionBtnText}>
              {exporting ? "Exporting…" : "Export as JSON"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Import ──────────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          Import
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardDescription, { color: colors.mutedForeground }]}>
            Choose a{" "}
            <Text style={{ fontFamily: "Inter_600SemiBold" }}>.json</Text> file
            to replace the bead list. The file will be validated before saving.
            Export first to see the required format.
          </Text>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor:
                  importStatus.kind === "loading"
                    ? colors.mutedForeground
                    : colors.foreground,
              },
              importStatus.kind === "loading" && { opacity: 0.6 },
            ]}
            onPress={handleImport}
            disabled={importStatus.kind === "loading"}
            activeOpacity={0.85}
          >
            <Feather name="download" size={18} color={colors.background} />
            <Text style={[styles.actionBtnText, { color: colors.background }]}>
              {importStatus.kind === "loading"
                ? "Importing…"
                : "Import from JSON"}
            </Text>
          </TouchableOpacity>

          {/* Import result feedback */}
          {importStatus.kind === "success" && (
            <View
              style={[
                styles.resultBanner,
                {
                  backgroundColor: "#22C55E20",
                  borderColor: "#22C55E40",
                },
              ]}
            >
              <Feather name="check-circle" size={16} color="#16A34A" />
              <Text style={[styles.resultText, { color: "#16A34A" }]}>
                {importStatus.count} beads imported successfully. The picker
                has been updated.
              </Text>
            </View>
          )}

          {importStatus.kind === "error" && (
            <View
              style={[
                styles.resultBanner,
                {
                  backgroundColor: colors.destructive + "15",
                  borderColor: colors.destructive + "30",
                },
              ]}
            >
              <Feather
                name="alert-circle"
                size={16}
                color={colors.destructive}
              />
              <Text
                style={[styles.resultText, { color: colors.destructive }]}
              >
                {importStatus.message}
              </Text>
            </View>
          )}
        </View>

        {/* ── File format reference ────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          File Format
        </Text>
        <View
          style={[
            styles.card,
            styles.formatCard,
            { backgroundColor: colors.muted, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.formatText, { color: colors.mutedForeground }]}>
            {`[\n  {\n    "id": "red",\n    "name": "Red Bead",\n    "colorName": "Red",\n    "color": "#e81c24",\n    "category": "Treatment",\n    "reason": "Blood Transfusion",\n    "description": "...",\n    "displayOrder": 1\n  }\n]`}
          </Text>
          <Text
            style={[styles.formatNote, { color: colors.mutedForeground }]}
          >
            Optional fields: <Text style={{ fontFamily: "Inter_600SemiBold" }}>isGlow</Text> (boolean),{" "}
            <Text style={{ fontFamily: "Inter_600SemiBold" }}>meaning</Text> (string)
          </Text>
        </View>

        {/* ── Current bead list preview ───────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          Current Bead List ({definitions.length})
        </Text>
        <View
          style={[
            styles.card,
            styles.beadListCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {definitions.map((def, index) => (
            <View key={def.id}>
              {index > 0 && (
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
              )}
              <View style={styles.beadRow}>
                <BeadBubble
                  color={def.color}
                  size={32}
                  isGlow={def.isGlow}
                />
                <View style={styles.beadInfo}>
                  <View style={styles.beadNameRow}>
                    <Text
                      style={[styles.beadName, { color: colors.foreground }]}
                    >
                      {def.name}
                    </Text>
                    <Text
                      style={[
                        styles.beadCategory,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {def.category}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.beadReason,
                      { color: colors.mutedForeground },
                    ]}
                    numberOfLines={1}
                  >
                    {def.reason}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* ── Danger zone ─────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          Danger Zone
        </Text>
        <TouchableOpacity
          style={[
            styles.dangerBtn,
            {
              borderColor: colors.destructive + "50",
              backgroundColor: colors.destructive + "08",
            },
          ]}
          onPress={handleClearData}
          activeOpacity={0.8}
        >
          <Feather name="trash-2" size={16} color={colors.destructive} />
          <Text style={[styles.dangerBtnText, { color: colors.destructive }]}>
            Clear All Tracking Data
          </Text>
        </TouchableOpacity>
        <Text style={[styles.dangerNote, { color: colors.mutedForeground }]}>
          Deletes all beads, journal entries, and the child profile. Bead
          definitions are not affected.
        </Text>
      </ScrollView>
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
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 4,
  },
  statusCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: { flex: 1 },
  statusTitle: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  statusSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  resetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  resetBtnText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardDescription: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 14,
  },
  actionBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  resultBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  resultText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  formatCard: { padding: 14 },
  formatText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  formatNote: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  beadListCard: { padding: 0, gap: 0, overflow: "hidden" },
  beadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  beadInfo: { flex: 1, gap: 2 },
  beadNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  beadName: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  beadCategory: { fontSize: 11, fontFamily: "Inter_400Regular" },
  beadReason: { fontSize: 12, fontFamily: "Inter_400Regular" },
  divider: { height: 1, marginHorizontal: 16 },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  dangerBtnText: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  dangerNote: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 4,
  },
});
