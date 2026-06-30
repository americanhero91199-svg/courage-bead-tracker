import React, { useMemo } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { format, parseISO, startOfMonth } from "date-fns";
import { useBeadStore } from "@/context/BeadStoreContext";
import { useColors } from "@/hooks/useColors";
import { BeadBubble } from "@/components/BeadBubble";
import type { Bead } from "@/types";

type MonthGroup = {
  key: string;
  label: string;
  beads: Bead[];
  topColors: { color: string; colorName: string; count: number }[];
};

export default function Recap() {
  const { beads } = useBeadStore();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const months: MonthGroup[] = useMemo(() => {
    const map = new Map<string, Bead[]>();
    for (const b of beads) {
      const key = format(startOfMonth(parseISO(b.earnedAt)), "yyyy-MM");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, monthBeads]) => {
        const colorCounts = new Map<string, { color: string; colorName: string; count: number }>();
        for (const b of monthBeads) {
          if (!colorCounts.has(b.colorName)) {
            colorCounts.set(b.colorName, { color: b.color, colorName: b.colorName, count: 0 });
          }
          colorCounts.get(b.colorName)!.count++;
        }
        const topColors = Array.from(colorCounts.values()).sort((a, b) => b.count - a.count);
        return {
          key,
          label: format(parseISO(key + "-01"), "MMMM yyyy"),
          beads: monthBeads,
          topColors,
        };
      });
  }, [beads]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Monthly Recap</Text>
        <View style={styles.backBtn} />
      </View>

      {months.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="calendar" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No beads yet</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Start adding beads to see your monthly recap.
          </Text>
        </View>
      ) : (
        <FlatList
          data={months}
          keyExtractor={(item) => item.key}
          contentContainerStyle={[styles.list, { paddingBottom: botPad + 24 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.monthCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.monthHeader}>
                <View>
                  <Text style={[styles.monthLabel, { color: colors.primary }]}>{item.label}</Text>
                  <Text style={[styles.monthCount, { color: colors.foreground }]}>
                    {item.beads.length} {item.beads.length === 1 ? "bead" : "beads"}
                  </Text>
                </View>
                <View style={styles.beadPreviewRow}>
                  {item.beads.slice(0, 6).map((b, i) => (
                    <View key={i} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: 10 - i }}>
                      <BeadBubble color={b.color} size={28} isGlow={b.colorName === "Glow"} />
                    </View>
                  ))}
                  {item.beads.length > 6 && (
                    <View style={[styles.moreTag, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.moreText, { color: colors.mutedForeground }]}>
                        +{item.beads.length - 6}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.colorBreakdown}>
                {item.topColors.map((tc) => (
                  <View key={tc.colorName} style={styles.colorRow}>
                    <BeadBubble color={tc.color} size={20} />
                    <Text style={[styles.colorName, { color: colors.foreground }]} numberOfLines={1}>
                      {tc.colorName}
                    </Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            backgroundColor: tc.color === "#E8E8E8" || tc.color === "#ffffff" ? "#DDD" : tc.color,
                            width: `${(tc.count / item.beads.length) * 100}%`,
                            opacity: 0.7,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.colorCount, { color: colors.mutedForeground }]}>{tc.count}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        />
      )}
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
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  list: { padding: 16, gap: 16 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  emptyText: { fontSize: 15, textAlign: "center", fontFamily: "Inter_400Regular" },
  monthCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  monthLabel: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.5 },
  monthCount: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold", marginTop: 2 },
  beadPreviewRow: { flexDirection: "row", alignItems: "center" },
  moreTag: { marginLeft: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  moreText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, marginHorizontal: 16 },
  colorBreakdown: { padding: 16, gap: 10 },
  colorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  colorName: { fontSize: 13, fontFamily: "Inter_500Medium", width: 90 },
  barTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: "#F0E4CC", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4 },
  colorCount: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold", width: 20, textAlign: "right" },
});
