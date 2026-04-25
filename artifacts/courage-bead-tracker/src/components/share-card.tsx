import React from "react";
import { format, parseISO } from "date-fns";
import { BeadIcon } from "@/components/bead";
import type { Bead } from "@/lib/types";

type ShareCardProps = {
  childName: string;
  totalBeads: number;
  favoriteBead: { color: string; colorName: string; count: number; isGlow: boolean } | null;
  recentBead: Bead | null;
  generatedAt: Date;
  scatterBeads: Array<{ color: string; isGlow: boolean }>;
};

export const ShareCard = React.forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard(
    { childName, totalBeads, favoriteBead, recentBead, generatedAt, scatterBeads },
    ref,
  ) {
    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1350,
          fontFamily:
            "'Varela Round', 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          color: "#3A1F2B",
          background:
            "linear-gradient(160deg, #FFF8E5 0%, #FFE9DC 45%, #FFD6E2 100%)",
          position: "relative",
          overflow: "hidden",
          padding: "80px 72px",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        {/* Decorative scattered beads */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        >
          {SCATTER_POSITIONS.map((pos, i) => {
            const bead = scatterBeads[i % Math.max(scatterBeads.length, 1)];
            if (!bead) return null;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: pos.top,
                  left: pos.left,
                  width: pos.size,
                  height: pos.size,
                  transform: `rotate(${pos.rotate}deg)`,
                  opacity: pos.opacity,
                }}
              >
                <BeadIcon
                  color={bead.color}
                  size={pos.size}
                  isGlow={bead.isGlow}
                />
              </div>
            );
          })}
        </div>

        {/* Header */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", gap: 4 }}>
              <BeadIcon color="#e81c24" size={36} />
              <BeadIcon color="#ffe600" size={36} />
              <BeadIcon color="#005baa" size={36} />
            </div>
            <span
              style={{
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "-0.5px",
                color: "#ED5773",
              }}
            >
              Courage Beads
            </span>
          </div>
          <span
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: "#8A6C7A",
            }}
          >
            {format(generatedAt, "MMMM d, yyyy")}
          </span>
        </div>

        {/* Hero block */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            marginBottom: 56,
          }}
        >
          <div
            style={{
              fontSize: 38,
              fontWeight: 600,
              color: "#8A6C7A",
              marginBottom: 8,
            }}
          >
            Celebrating
          </div>
          <h1
            style={{
              fontSize: 110,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-3px",
              color: "#3A1F2B",
              margin: 0,
              padding: 0,
            }}
          >
            {childName}
          </h1>
        </div>

        {/* Big total card */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            background:
              "linear-gradient(135deg, #ED5773 0%, #F47B92 100%)",
            color: "#FFFFFF",
            borderRadius: 56,
            padding: "56px 48px",
            textAlign: "center",
            marginBottom: 44,
            boxShadow: "0 24px 60px -16px rgba(237,87,115,0.45)",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              opacity: 0.92,
              marginBottom: 18,
              letterSpacing: "0.5px",
            }}
          >
            Beads of Courage Earned
          </div>
          <div
            style={{
              fontSize: 240,
              fontWeight: 800,
              lineHeight: 0.9,
              letterSpacing: "-8px",
            }}
          >
            {totalBeads}
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            gap: 28,
            flex: 1,
          }}
        >
          {/* Favorite Bead */}
          <StatCard
            label="Most Earned"
            empty={!favoriteBead}
            emptyText="Add a bead to begin"
          >
            {favoriteBead && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <BeadIcon
                    color={favoriteBead.color}
                    size={120}
                    isGlow={favoriteBead.isGlow}
                  />
                </div>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: "#3A1F2B",
                    marginBottom: 6,
                    lineHeight: 1.1,
                  }}
                >
                  {favoriteBead.colorName}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: "#ED5773",
                  }}
                >
                  {favoriteBead.count}{" "}
                  {favoriteBead.count === 1 ? "bead" : "beads"}
                </div>
              </>
            )}
          </StatCard>

          {/* Most Recent Milestone */}
          <StatCard
            label="Latest Milestone"
            empty={!recentBead}
            emptyText="The journey starts soon"
          >
            {recentBead && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <BeadIcon
                    color={recentBead.color}
                    size={120}
                    isGlow={recentBead.colorName === "Glow"}
                  />
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#3A1F2B",
                    marginBottom: 6,
                    lineHeight: 1.15,
                  }}
                >
                  {recentBead.reason}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 500,
                    color: "#8A6C7A",
                  }}
                >
                  {format(parseISO(recentBead.earnedAt), "MMM d, yyyy")}
                </div>
              </>
            )}
          </StatCard>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            marginTop: 44,
            textAlign: "center",
            fontSize: 22,
            fontWeight: 500,
            color: "#8A6C7A",
            letterSpacing: "0.3px",
          }}
        >
          Every bead is a story of courage.
        </div>
      </div>
    );
  },
);

function StatCard({
  label,
  children,
  empty,
  emptyText,
}: {
  label: string;
  children?: React.ReactNode;
  empty?: boolean;
  emptyText?: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: "rgba(255,255,255,0.85)",
        border: "2px solid rgba(237,87,115,0.18)",
        borderRadius: 40,
        padding: "36px 28px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        boxShadow: "0 12px 32px -12px rgba(58,31,43,0.12)",
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#ED5773",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          marginBottom: 22,
        }}
      >
        {label}
      </div>
      {empty ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8A6C7A",
            fontSize: 22,
            fontWeight: 500,
          }}
        >
          {emptyText}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

const SCATTER_POSITIONS: Array<{
  top: number;
  left: number;
  size: number;
  rotate: number;
  opacity: number;
}> = [
  { top: 60, left: 940, size: 70, rotate: 12, opacity: 0.55 },
  { top: 180, left: 40, size: 56, rotate: -20, opacity: 0.5 },
  { top: 1230, left: 80, size: 80, rotate: 15, opacity: 0.55 },
  { top: 1180, left: 940, size: 64, rotate: -10, opacity: 0.5 },
  { top: 360, left: 980, size: 42, rotate: 30, opacity: 0.45 },
  { top: 280, left: 30, size: 38, rotate: -10, opacity: 0.45 },
  { top: 1080, left: 30, size: 44, rotate: 25, opacity: 0.4 },
  { top: 1100, left: 1000, size: 36, rotate: -15, opacity: 0.4 },
];
