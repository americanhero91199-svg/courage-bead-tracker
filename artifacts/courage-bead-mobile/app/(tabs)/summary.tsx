import React, { useMemo } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useBeadStore } from "@/context/BeadStoreContext";
import { useColors } from "@/hooks/useColors";
import { BeadBubble } from "@/components/BeadBubble";
import { isGlowBead } from "@/data/beads";

type BeadTypeStat = {
  color: string;
  colorName: string;
  count: number;
  isGlow?: boolean;
};

export default function SummaryTab() {
  const { child, beads, notes } = useBeadStore();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const stats: BeadTypeStat[] = useMemo(() => {
    const map = new Map<string, BeadTypeStat>();
    for (const b of beads) {
      if (!map.has(b.colorName)) {
        map.set(b.colorName, { color: b.color, colorName: b.colorName, count: 0, isGlow: isGlowBead(b.colorName) });
      }
      map.get(b.colorName)!.count++;
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [beads]);

  const maxCount = stats.length > 0 ? stats[0].count : 1;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Stats & Summary</Text>
        <TouchableOpacity
          style={[styles.recapBtn, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "30" }]}
          onPress={() => router.push("/recap")}
          activeOpacity={0.7}
        >
          <Feather name="calendar" size={14} color={colors.primary} />
          <Text style={[styles.recapBtnText, { color: colors.primary }]}>Monthly</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={stats}
        keyExtractor={(item) => item.colorName}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 90 },
        ]}
        scrollEnabled={stats.length > 0}
        ListHeaderComponent={
          <View style={styles.heroSection}>
            <View style={styles.heroCards}>
              <View style={[styles.heroCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
                <Text style={[styles.heroNumber, { color: colors.primary }]}>{beads.length}</Text>
                <Text style={[styles.heroLabel, { color: colors.mutedForeground }]}>Total Beads</Text>
              </View>
              <View style={[styles.heroCard, { backgroundColor: colors.accent + "30", borderColor: colors.border }]}>
                <Text style={[styles.heroNumber, { color: colors.foreground }]}>{stats.length}</Text>
                <Text style={[styles.heroLabel, { color: colors.mutedForeground }]}>Bead Types</Text>
              </View>
              <View style={[styles.heroCard, { backgroundColor: colors.secondary + "80", borderColor: colors.border }]}>
                <Text style={[styles.heroNumber, { color: colors.foreground }]}>{notes.length}</Text>
                <Text style={[styles.heroLabel, { color: colors.mutedForeground }]}>Reflections</Text>
              </View>
            </View>

            {beads.length > 0 && (
              <View style={[styles.collectionRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Text style={[styles.collectionTitle, { color: colors.foreground }]}>Full Collection</Text>
                <View style={styles.beadsWrap}>
                  {beads.slice(0, 30).map((b, i) => (
                    <BeadBubble key={i} color={b.color} size={24} isGlow={isGlowBead(b.colorName)} />
                  ))}
                  {beads.length > 30 && (
                    <View style={[styles.morePill, { backgroundColor: colors.secondary }]}>
                      <Text style={[styles.morePillText, { color: colors.mutedForeground }]}>
                        +{beads.length - 30}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {stats.length > 0 && (
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Breakdown by Type</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="award" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {child ? `${child.name} has no beads yet` : "No beads yet"}
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Add beads to see the breakdown here.
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/add-bead")}
            >
              <Text style={styles.emptyBtnText}>Add First Bead</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.statRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <BeadBubble color={item.color} size={36} isGlow={item.isGlow} />
            <View style={styles.statInfo}>
              <View style={styles.statTop}>
                <Text style={[styles.statColorName, { color: colors.foreground }]}>{item.colorName}</Text>
                <Text style={[styles.statCount, { color: colors.primary }]}>×{item.count}</Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor:
                        item.color === "#E8E8E8" || item.color === "#ffffff" ? "#DDD" : item.color,
                      width: `${(item.count / maxCount) * 100}%`,
                      opacity: 0.75,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        )}
      />
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
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  recapBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  recapBtnText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  list: { paddingHorizontal: 16, gap: 10 },
  heroSection: { gap: 12, marginBottom: 4 },
  heroCards: { flexDirection: "row", gap: 10 },
  heroCard: { flex: 1, borderRadius: 18, borderWidth: 1, padding: 14, alignItems: "center", gap: 4 },
  heroNumber: { fontSize: 26, fontWeight: "700", fontFamily: "Inter_700Bold" },
  heroLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  collectionRow: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  collectionTitle: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  beadsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  morePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: "center" },
  morePillText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold", marginTop: 4 },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  statInfo: { flex: 1, gap: 6 },
  statTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statColorName: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  statCount: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  barTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4 },
  empty: { alignItems: "center", gap: 12, padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  emptyText: { fontSize: 14, textAlign: "center", fontFamily: "Inter_400Regular" },
  emptyBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  emptyBtnText: { color: "#FFF", fontWeight: "700", fontFamily: "Inter_700Bold" },
});
