import React from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  color: string;
  size?: number;
  isGlow?: boolean;
};

export function BeadBubble({ color, size = 36, isGlow = false }: Props) {
  const borderRadius = size / 2;
  const highlightSize = size * 0.28;
  const highlightOffset = size * 0.12;

  return (
    <View
      style={[
        styles.bead,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: color,
          shadowColor: isGlow ? "#ccff00" : color,
          shadowOpacity: isGlow ? 0.9 : 0.4,
          shadowRadius: isGlow ? 10 : 6,
          shadowOffset: { width: 0, height: 3 },
          elevation: isGlow ? 10 : 4,
          borderWidth: color === "#E8E8E8" || color === "#ffffff" ? 1 : 0,
          borderColor: "#DDD",
        },
      ]}
    >
      <View
        style={[
          styles.highlight,
          {
            width: highlightSize,
            height: highlightSize,
            borderRadius: highlightSize / 2,
            top: highlightOffset,
            left: highlightOffset,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bead: {
    justifyContent: "center",
    alignItems: "center",
  },
  highlight: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.55)",
  },
});
