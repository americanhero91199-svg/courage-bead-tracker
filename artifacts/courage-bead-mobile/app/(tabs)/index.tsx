import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { useBeadStore } from "@/context/BeadStoreContext";
import { useColors } from "@/hooks/useColors";
import { BeadBubble } from "@/components/BeadBubble";
import type { Bead } from "@/types";

export default function HomeTab() {
  const { child, beads, clearData } = useBeadStore();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedBead, setSelectedBead] = useState<Bead | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const recentBeads = beads.slice(0, 18);

  function handleSettings() {
    Alert.alert("Settings", "Clear all data?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear Data",
        style: "destructive",
        onPress: () => {
          clearData();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          router.replace("/welcome");
        },
      },
    ]);
  }

  if (!child) return null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Welcome back,</Text>
          <Text style={[styles.childName, { color: colors.foreground }]}>{child.name} 💪</Text>
        </View>
        <TouchableOpacity onPress={handleSettings} style={styles.settingsBtn}>
          <Feather name="settings" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.statsRow]}>
          <View style={[styles.statCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
            <Feather name="award" size={20} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.foreground }]}>{beads.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total Beads</Text>
          </View>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: colors.accent + "30", borderColor: colors.border }]}
            onPress={() => router.push("/recap")}
            activeOpacity={0.7}
          >
            <Feather name="calendar" size={20} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.foreground }]}>
              {beads.filter((b) => {
                const d = new Date(b.earnedAt);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>This Month</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.jarSection, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Text style={[styles.jarTitle, { color: colors.foreground }]}>Your Bead Jar</Text>
          {recentBeads.length > 0 ? (
            <View style={styles.beadsGrid}>
              {recentBeads.map((bead) => (
                <TouchableOpacity
                  key={bead.id}
                  onPress={() => {
                    setSelectedBead(bead);
                    Haptics.selectionAsync();
                  }}
                  activeOpacity={0.75}
                >
                  <BeadBubble color={bead.color} size={42} isGlow={bead.colorName === "Glow"} />
                </TouchableOpacity>
              ))}
              {beads.length > 18 && (
                <View style={[styles.moreBubble, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.moreText, { color: colors.mutedForeground }]}>+{beads.length - 18}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyJar}>
              <Feather name="circle" size={36} color={colors.mutedForeground} />
              <Text style={[styles.emptyJarText, { color: colors.mutedForeground }]}>
                Your jar is empty.{"\n"}Add your first bead!
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/add-bead")}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={22} color="#FFF" />
          <Text style={styles.addBtnText}>Add a Brave Bead</Text>
        </TouchableOpacity>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/(tabs)/timeline")}
            activeOpacity={0.7}
          >
            <Feather name="activity" size={18} color={colors.primary} />
            <Text style={[styles.quickBtnText, { color: colors.foreground }]}>Timeline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/journal")}
            activeOpacity={0.7}
          >
            <Feather name="book-open" size={18} color={colors.primary} />
            <Text style={[styles.quickBtnText, { color: colors.foreground }]}>Add Reflection</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/recap")}
            activeOpacity={0.7}
          >
            <Feather name="bar-chart-2" size={18} color={colors.primary} />
            <Text style={[styles.quickBtnText, { color: colors.foreground }]}>Monthly Recap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BeadDetailModal
        bead={selectedBead}
        onClose={() => setSelectedBead(null)}
        onEdit={(b) => {
          setSelectedBead(null);
          router.push({ pathname: "/add-bead", params: { id: b.id } });
        }}
        colors={colors}
      />
    </View>
  );
}

function BeadDetailModal({
  bead,
  onClose,
  onEdit,
  colors,
}: {
  bead: Bead | null;
  onClose: () => void;
  onEdit: (b: Bead) => void;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  if (!bead) return null;
  return (
    <Modal visible={!!bead} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity
          style={[styles.modalCard, { backgroundColor: colors.card }]}
          activeOpacity={1}
        >
          <View style={[styles.modalGradient, { backgroundColor: colors.accent + "50" }]}>
            <BeadBubble color={bead.color} size={80} isGlow={bead.colorName === "Glow"} />
          </View>
          <View style={styles.modalBody}>
            <Text style={[styles.modalColorName, { color: colors.primary }]}>{bead.colorName} Bead</Text>
            <Text style={[styles.modalReason, { color: colors.foreground }]}>{bead.reason}</Text>
            <Text style={[styles.modalDate, { color: colors.mutedForeground }]}>
              {format(parseISO(bead.earnedAt), "EEEE, MMMM d, yyyy")}
            </Text>
            {bead.notes ? (
              <Text style={[styles.modalNotes, { color: colors.mutedForeground }]}>"{bead.notes}"</Text>
            ) : null}
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnOutline, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.modalBtnText, { color: colors.foreground }]}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              onPress={() => onEdit(bead)}
            >
              <Feather name="edit-2" size={14} color="#FFF" />
              <Text style={[styles.modalBtnText, { color: "#FFF" }]}>Edit</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  childName: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  settingsBtn: { padding: 8 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16 },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  statNumber: { fontSize: 28, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  jarSection: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    minHeight: 180,
    gap: 12,
  },
  jarTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  beadsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  moreBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  moreText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  emptyJar: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 24 },
  emptyJarText: { textAlign: "center", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 18,
  },
  addBtnText: { color: "#FFF", fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  quickActions: { gap: 8 },
  quickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickBtnText: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  modalGradient: { alignItems: "center", padding: 28 },
  modalBody: { padding: 20, gap: 6 },
  modalColorName: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 1 },
  modalReason: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  modalDate: { fontSize: 13, fontFamily: "Inter_400Regular" },
  modalNotes: { fontSize: 14, fontStyle: "italic", fontFamily: "Inter_400Regular", marginTop: 4 },
  modalActions: { flexDirection: "row", gap: 10, padding: 20, paddingTop: 0 },
  modalBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    borderRadius: 14,
  },
  modalBtnOutline: { borderWidth: 1 },
  modalBtnText: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
});
