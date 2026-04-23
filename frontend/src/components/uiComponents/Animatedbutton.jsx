import React, { useRef, useState } from "react";

/**
 * AnimatedButton — modern, production-ready button component
 *
 * Props:
 *  variant   : "primary" | "primary-dark" | "secondary" | "darkBlue" |
 *              "light" | "white" | "warning" | "gray" | "outline-primary" |
 *              "outline-secondary" | "outline-white"
 *  size      : "sm" | "md" | "lg"
 *  icon      : any React node (optional, renders on the left by default)
 *  iconRight : boolean — render icon on the right instead
 *  disabled  : boolean
 *  loading   : boolean — shows a spinner and locks interaction
 *  fullWidth : boolean
 *  onClick   : function
 *  children  : button label
 */

/* ─── colour tokens (mirrors your @theme) ─────────────────────────────── */
const VARIANTS = {
  primary: {
    bg: "#2563eb",
    bgHover: "#1d53cc",
    text: "#f9f9f9",
    glow: "rgba(37,99,235,0.45)",
    ring: "rgba(37,99,235,0.65)",
    shine: "rgba(255,255,255,0.18)",
    ripple: "rgba(255,255,255,0.30)",
  },
  "primary-dark": {
    bg: "#173c8f",
    bgHover: "#102b6b",
    text: "#f9f9f9",
    glow: "rgba(23,60,143,0.5)",
    ring: "rgba(23,60,143,0.7)",
    shine: "rgba(255,255,255,0.15)",
    ripple: "rgba(255,255,255,0.25)",
  },
  secondary: {
    bg: "#16a34a",
    bgHover: "#15803d",
    text: "#f9f9f9",
    glow: "rgba(22,163,74,0.45)",
    ring: "rgba(22,163,74,0.65)",
    shine: "rgba(255,255,255,0.18)",
    ripple: "rgba(255,255,255,0.30)",
  },
  darkBlue: {
    bg: "#0b3c5d",
    bgHover: "#072d47",
    text: "#f9f9f9",
    glow: "rgba(11,60,93,0.5)",
    ring: "rgba(11,60,93,0.7)",
    shine: "rgba(255,255,255,0.15)",
    ripple: "rgba(255,255,255,0.25)",
  },
  light: {
    bg: "#e9effd",
    bgHover: "#d4defc",
    text: "#2563eb",
    glow: "rgba(233,239,253,0.6)",
    ring: "rgba(37,99,235,0.35)",
    shine: "rgba(37,99,235,0.10)",
    ripple: "rgba(37,99,235,0.18)",
  },
  white: {
    bg: "#f9f9f9",
    bgHover: "#ffffff",
    text: "#1f1f1f",
    glow: "rgba(249,249,249,0.4)",
    ring: "rgba(249,249,249,0.7)",
    shine: "rgba(37,99,235,0.10)",
    ripple: "rgba(37,99,235,0.15)",
  },
  warning: {
    bg: "#f59e0b",
    bgHover: "#d97706",
    text: "#1f1f1f",
    glow: "rgba(245,158,11,0.45)",
    ring: "rgba(245,158,11,0.65)",
    shine: "rgba(255,255,255,0.20)",
    ripple: "rgba(255,255,255,0.30)",
  },
  gray: {
    bg: "#6b7280",
    bgHover: "#4b5563",
    text: "#f9f9f9",
    glow: "rgba(107,114,128,0.4)",
    ring: "rgba(107,114,128,0.60)",
    shine: "rgba(255,255,255,0.15)",
    ripple: "rgba(255,255,255,0.25)",
  },
  /* outline variants — transparent fill, coloured border */
  "outline-primary": {
    bg: "transparent",
    bgHover: "rgba(37,99,235,0.10)",
    text: "#2563eb",
    border: "#2563eb",
    glow: "rgba(37,99,235,0.30)",
    ring: "rgba(37,99,235,0.55)",
    shine: "rgba(37,99,235,0.08)",
    ripple: "rgba(37,99,235,0.20)",
    outline: true,
  },
  "outline-secondary": {
    bg: "transparent",
    bgHover: "rgba(22,163,74,0.10)",
    text: "#16a34a",
    border: "#16a34a",
    glow: "rgba(22,163,74,0.30)",
    ring: "rgba(22,163,74,0.55)",
    shine: "rgba(22,163,74,0.08)",
    ripple: "rgba(22,163,74,0.20)",
    outline: true,
  },
  "outline-white": {
    bg: "transparent",
    bgHover: "#e9effd",
    text: "#2563eb",
    textHover: "#f9f9f9",
    border: "#f9f9f9",
    glow: "rgba(249,249,249,0.25)",
    ring: "rgba(249,249,249,0.55)",
    shine: "rgba(255,255,255,0.10)",
    ripple: "rgba(255,255,255,0.20)",
    outline: true,
  },
};

const SIZES = {
  sm: {
    padding: "8px 20px",
    fontSize: "13px",
    iconSize: "15px",
    gap: "6px",
    radius: "10px",
  },
  md: {
    padding: "12px 32px",
    fontSize: "15px",
    iconSize: "17px",
    gap: "8px",
    radius: "12px",
  },
  lg: {
    padding: "15px 44px",
    fontSize: "17px",
    iconSize: "20px",
    gap: "10px",
    radius: "14px",
  },
};

/* ─── Spinner ──────────────────────────────────────────────────────────── */
function Spinner({ color, size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      style={{ animation: "btn-spin 0.7s linear infinite", flexShrink: 0 }}>
      <circle
        cx="10"
        cy="10"
        r="8"
        stroke={color}
        strokeOpacity="0.25"
        strokeWidth="2.5"
      />
      <path
        d="M10 2a8 8 0 0 1 8 8"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Main component ───────────────────────────────────────────────────── */
export default function AnimatedButton({
  variant = "primary",
  size = "md",
  icon = null,
  iconRight = false,
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  children,
}) {
  const btnRef = useRef(null);
  const [ripples, setRipples] = useState([]);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const v = VARIANTS[variant] ?? VARIANTS.primary;
  const s = SIZES[size] ?? SIZES.md;
  const isDisabled = disabled || loading;

  /* ripple on click */
  const handleClick = (e) => {
    if (isDisabled) return;
    const rect = btnRef.current.getBoundingClientRect();
    const diameter = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - diameter / 2;
    const y = e.clientY - rect.top - diameter / 2;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y, diameter }]);
    setTimeout(
      () => setRipples((prev) => prev.filter((r) => r.id !== id)),
      600,
    );
    onClick?.();
  };

  /* dynamic styles */
  const base = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: s.gap,
    padding: s.padding,
    fontSize: s.fontSize,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    letterSpacing: "0.02em",
    color: v.text,
    background: hovered && !isDisabled ? v.bgHover : v.bg,
    border: v.outline ? `1.5px solid ${v.border}` : "1.5px solid transparent",
    borderRadius: s.radius,
    width: fullWidth ? "100%" : "auto",
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    overflow: "hidden",
    outline: "none",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    transition:
      "background 0.2s ease, transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease, border-color 0.2s ease",
    transform:
      pressed && !isDisabled
        ? "scale(0.96) translateY(1px)"
        : hovered && !isDisabled
          ? "scale(1.035) translateY(-2px)"
          : "scale(1) translateY(0)",
    boxShadow: isDisabled
      ? "none"
      : pressed
        ? `0 0 0 2.5px ${v.ring}, 0 2px 8px ${v.glow}, inset 0 2px 6px rgba(0,0,0,0.12)`
        : hovered
          ? `0 0 0 2px ${v.ring}, 0 8px 24px ${v.glow}, 0 0 48px ${v.glow.replace("0.45", "0.15")}, inset 0 1px 0 rgba(255,255,255,0.12)`
          : `0 2px 10px ${v.glow.replace("0.45", "0.20")}, inset 0 1px 0 rgba(255,255,255,0.08)`,
  };

  const iconStyle = {
    display: "inline-flex",
    alignItems: "center",
    fontSize: s.iconSize,
    width: s.iconSize,
    height: s.iconSize,
    flexShrink: 0,
    transition: "transform 0.2s cubic-bezier(.34,1.56,.64,1)",
    transform:
      hovered && !isDisabled
        ? iconRight
          ? "translateX(3px)"
          : "translateX(-1px) rotate(-8deg)"
        : "none",
  };

  const shineStyle = {
    content: "''",
    position: "absolute",
    top: 0,
    left: hovered && !isDisabled ? "160%" : "-100%",
    width: "55%",
    height: "100%",
    background: `linear-gradient(120deg, transparent 0%, ${v.shine} 50%, transparent 100%)`,
    transition: "left 0.5s ease",
    pointerEvents: "none",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600;700&display=swap');
        @keyframes btn-spin { to { transform: rotate(360deg); } }
        @keyframes btn-ripple {
          to { transform: scale(1); opacity: 0; }
        }
      `}</style>

      <button
        ref={btnRef}
        style={base}
        disabled={isDisabled}
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setPressed(false);
        }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        className="px-6">
        {/* shine sweep */}
        <span style={shineStyle} aria-hidden />

        {/* ripples */}
        {ripples.map((r) => (
          <span
            key={r.id}
            aria-hidden
            style={{
              position: "absolute",
              left: r.x,
              top: r.y,
              width: r.diameter,
              height: r.diameter,
              borderRadius: "50%",
              background: v.ripple,
              transform: "scale(0)",
              animation: "btn-ripple 0.55s linear forwards",
              pointerEvents: "none",
            }}
          />
        ))}

        {/* left icon or spinner */}
        {!iconRight &&
          (loading ? (
            <Spinner color={v.text} size={s.iconSize} />
          ) : (
            icon && (
              <span style={iconStyle} aria-hidden>
                {icon}
              </span>
            )
          ))}

        {/* label */}
        <span style={{ position: "relative", zIndex: 1 }}>
          {loading ? "Loading…" : children}
        </span>

        {/* right icon */}
        {iconRight && !loading && icon && (
          <span style={iconStyle} aria-hidden>
            {icon}
          </span>
        )}
      </button>
    </>
  );
}
