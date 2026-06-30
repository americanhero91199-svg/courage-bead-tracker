import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
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
import type { Bead, JournalNote } from "@/types";

type ListItem =
  | { kind: "month"; key: string; label: string }
  | { kind: "bead"; key: string; bead: Bead; side: "left" | "right" }
  | { kind: "note"; key: string; note: JournalNote; side: "left" | "right" };

export default function TimelineTab() {
  const { beads, notes } = useBeadStore();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedBead, setSelectedBead] = useState<Bead | null>(null);
  const [selectedNote, setSelectedNote] = useState<JournalNote | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const listItems: ListItem[] = useMemo(() => {
    const combined: ({ kind: "bead"; bead: Bead; date: number } | { kind: "note"; note: JournalNote; date: number })[] =
      [
        ...beads.map((b) => ({ kind: "bead" as const, bead: b, date: new Date(b.earnedAt).getTime() })),
        ...notes.map((n) => ({ kind: "note" as const, note: n, date: new Date(n.date).getTime() })),
      ].sort((a, b) => a.date - b.date);

    const items: ListItem[] = [];
    let lastMonth = "";
    let altIndex = 0;

    for (const entry of combined) {
      const dateStr = entry.kind === "bead" ? entry.bead.earnedAt : entry.note.date;
      const monthKey = format(parseISO(dateStr), "MMMM yyyy");
      if (monthKey !== lastMonth) {
        items.push({ kind: "month", key: `month-${monthKey}`, label: monthKey });
        lastMonth = monthKey;
      }
      const side: "left" | "right" = altIndex % 2 === 0 ? "left" : "right";
      if (entry.kind === "bead") {
        items.push({ kind: "bead", key: entry.bead.id, bead: entry.bead, side });
      } else {
        items.push({ kind: "note", key: entry.note.id, note: entry.note, side });
      }
      altIndex++;
    }
    return items;
  }, [beads, notes]);

  const isEmpty = beads.length === 0 && notes.length === 0;

  return (
    <View style={[styles.root, { backgroundColor: "#FFF8E5" }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Courage Timeline</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            Beads and reflections, in order
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addNoteBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/journal")}
          activeOpacity={0.8}
        >
          <Feather name="edit-3" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>

      {isEmpty ? (
        <View style={styles.empty}>
          <Feather name="git-commit" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your path begins here</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Add a bead or a reflection to start your journey.
          </Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/add-bead")}
          >
            <Text style={styles.emptyBtnText}>Add First Bead</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listItems}
          keyExtractor={(item) => item.key}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={listItems.length > 0}
          renderItem={({ item }) => {
            if (item.kind === "month") {
              return (
                <View style={styles.monthRow}>
                  <View style={[styles.monthLine, { backgroundColor: colors.border }]} />
                  <View style={[styles.monthPill, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" }]}>
                    <Feather name="calendar" size={11} color={colors.primary} />
                    <Text style={[styles.monthText, { color: colors.primary }]}>{item.label}</Text>
                  </View>
                  <View style={[styles.monthLine, { backgroundColor: colors.border }]} />
                </View>
              );
            }
            if (item.kind === "bead") {
              const b = item.bead;
              const dateStr = format(parseISO(b.earnedAt), "MMM d");
              return (
                <View style={styles.entryRow}>
                  {item.side === "left" ? (
                    <>
                      <TouchableOpacity
                        style={[styles.beadItem, styles.beadItemLeft, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => {
                          setSelectedBead(b);
                          Haptics.selectionAsync();
                        }}
                        activeOpacity={0.75}
                      >
                        <BeadBubble color={b.color} size={44} isGlow={b.colorName === "Glow"} />
                        <View style={styles.beadText}>
                          <Text style={[styles.beadReason, { color: colors.foreground }]} numberOfLines={1}>{b.reason}</Text>
                          <Text style={[styles.beadDate, { color: colors.mutedForeground }]}>{dateStr}</Text>
                        </View>
                      </TouchableOpacity>
                      <View style={[styles.centerDot, { backgroundColor: colors.primary }]} />
                      <View style={styles.halfSpacer} />
                    </>
                  ) : (
                    <>
                      <View style={styles.halfSpacer} />
                      <View style={[styles.centerDot, { backgroundColor: colors.primary }]} />
                      <TouchableOpacity
                        style={[styles.beadItem, styles.beadItemRight, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => {
                          setSelectedBead(b);
                          Haptics.selectionAsync();
                        }}
                        activeOpacity={0.75}
                      >
                        <View style={styles.beadText}>
                          <Text style={[styles.beadReason, { color: colors.foreground }]} numberOfLines={1}>{b.reason}</Text>
                          <Text style={[styles.beadDate, { color: colors.mutedForeground }]}>{dateStr}</Text>
                        </View>
                        <BeadBubble color={b.color} size={44} isGlow={b.colorName === "Glow"} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              );
            }
            const n = item.note;
            const dateStr = format(parseISO(n.date), "MMM d");
            return (
              <View style={styles.entryRow}>
                {item.side === "left" ? (
                  <>
                    <TouchableOpacity
                      style={[styles.noteItem, styles.noteItemLeft, { backgroundColor: colors.card, borderColor: colors.border }]}
                      onPress={() => {
                        setSelectedNote(n);
                        Haptics.selectionAsync();
                      }}
                      activeOpacity={0.75}
                    >
                      <Feather name="book-open" size={16} color={colors.primary} />
                      <View style={styles.noteText}>
                        <Text style={[styles.noteDate, { color: colors.primary }]}>{dateStr}</Text>
                        <Text style={[styles.notePreview, { color: colors.mutedForeground }]} numberOfLines={2}>{n.text}</Text>
                      </View>
                    </TouchableOpacity>
                    <View style={[styles.centerDot, styles.noteDot, { backgroundColor: colors.accent, borderColor: colors.primary }]} />
                    <View style={styles.halfSpacer} />
                  </>
                ) : (
                  <>
                    <View style={styles.halfSpacer} />
                    <View style={[styles.centerDot, styles.noteDot, { backgroundColor: colors.accent, borderColor: colors.primary }]} />
                    <TouchableOpacity
                      style={[styles.noteItem, styles.noteItemRight, { backgroundColor: colors.card, borderColor: colors.border }]}
                      onPress={() => {
                        setSelectedNote(n);
                        Haptics.selectionAsync();
                      }}
                      activeOpacity={0.75}
                    >
                      <View style={styles.noteText}>
                        <Text style={[styles.noteDate, { color: colors.primary }]}>{dateStr}</Text>
                        <Text style={[styles.notePreview, { color: colors.mutedForeground }]} numberOfLines={2}>{n.text}</Text>
                      </View>
                      <Feather name="book-open" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            );
          }}
        />
      )}

      <BeadModal bead={selectedBead} onClose={() => setSelectedBead(null)} colors={colors} />
      <NoteModal
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
        onEdit={(n) => {
          setSelectedNote(null);
          router.push({ pathname: "/journal", params: { id: n.id } });
        }}
        colors={colors}
      />
    </View>
  );
}

function BeadModal({ bead, onClose, colors }: { bead: Bead | null; onClose: () => void; colors: any }) {
  if (!bead) return null;
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={[styles.sheetGrad, { backgroundColor: colors.accent + "50" }]}>
            <BeadBubble color={bead.color} size={72} isGlow={bead.colorName === "Glow"} />
          </View>
          <View style={styles.sheetBody}>
            <Text style={[styles.sheetTag, { color: colors.primary }]}>{bead.colorName}</Text>
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>{bead.reason}</Text>
            <Text style={[styles.sheetDate, { color: colors.mutedForeground }]}>
              {format(parseISO(bead.earnedAt), "EEEE, MMMM d, yyyy")}
            </Text>
            {bead.notes ? <Text style={[styles.sheetNotes, { color: colors.mutedForeground }]}>"{bead.notes}"</Text> : null}
          </View>
          <TouchableOpacity style={[styles.sheetCloseBtn, { backgroundColor: colors.primary }]} onPress={onClose}>
            <Text style={styles.sheetCloseBtnText}>Close</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function NoteModal({ note, onClose, onEdit, colors }: { note: JournalNote | null; onClose: () => void; onEdit: (n: JournalNote) => void; colors: any }) {
  if (!note) return null;
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={[styles.sheetGrad, { backgroundColor: colors.accent + "50" }]}>
            <View style={[styles.noteIconLg, { backgroundColor: colors.card }]}>
              <Feather name="book-open" size={28} color={colors.primary} />
            </View>
          </View>
          <View style={styles.sheetBody}>
            <Text style={[styles.sheetTag, { color: colors.primary }]}>Reflection</Text>
            <Text style={[styles.sheetDate, { color: colors.mutedForeground }]}>
              {format(parseISO(note.date), "EEEE, MMMM d, yyyy")}
            </Text>
            <Text style={[styles.noteFullText, { color: colors.foreground }]}>{note.text}</Text>
          </View>
          <View style={styles.sheetActions}>
            <TouchableOpacity style={[styles.sheetBtn, { borderColor: colors.border }]} onPress={onClose}>
              <Text style={[styles.sheetBtnText, { color: colors.foreground }]}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sheetBtn, { backgroundColor: colors.primary }]} onPress={() => onEdit(note)}>
              <Feather name="edit-2" size={14} color="#FFF" />
              <Text style={[styles.sheetBtnText, { color: "#FFF" }]}>Edit</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  addNoteBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: 0, paddingTop: 8 },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  monthLine: { flex: 1, height: 1 },
  monthPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 8,
  },
  monthText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.5 },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginVertical: 6,
  },
  centerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
    zIndex: 1,
  },
  noteDot: {
    borderWidth: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  halfSpacer: { flex: 1 },
  beadItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  beadItemLeft: {},
  beadItemRight: {},
  beadText: { flex: 1 },
  beadReason: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  beadDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  noteItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  noteItemLeft: {},
  noteItemRight: {},
  noteText: { flex: 1 },
  noteDate: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  notePreview: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 16 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  emptyText: { fontSize: 14, textAlign: "center", fontFamily: "Inter_400Regular", lineHeight: 22 },
  emptyBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  emptyBtnText: { color: "#FFF", fontWeight: "700", fontFamily: "Inter_700Bold" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center", padding: 24 },
  sheet: { width: "100%", borderRadius: 28, overflow: "hidden" },
  sheetGrad: { alignItems: "center", padding: 24 },
  sheetBody: { padding: 20, gap: 6 },
  sheetTag: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 1 },
  sheetTitle: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  sheetDate: { fontSize: 13, fontFamily: "Inter_400Regular" },
  sheetNotes: { fontSize: 14, fontStyle: "italic", fontFamily: "Inter_400Regular", marginTop: 4 },
  noteIconLg: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  noteFullText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24, marginTop: 4 },
  sheetCloseBtn: { margin: 20, marginTop: 0, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  sheetCloseBtnText: { color: "#FFF", fontWeight: "700", fontFamily: "Inter_700Bold", fontSize: 15 },
  sheetActions: { flexDirection: "row", gap: 10, padding: 20, paddingTop: 0 },
  sheetBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 48, borderRadius: 14, borderWidth: 1 },
  sheetBtnText: { fontWeight: "600", fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
