import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { SlSocialInstagram } from "react-icons/sl";
import { SlSocialFacebook } from "react-icons/sl";
import { SlSocialLinkedin } from "react-icons/sl";
import { SlSocialGoogle } from "react-icons/sl";

// ─── Inline styles (no Tailwind dependency issues) ───────────────────────────
const styles = {
  footer: {
    backgroundColor: "#1a3a8f", // deep royal blue matching screenshot
    color: "#ffffff",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    padding: "48px 40px 24px",
    boxSizing: "border-box",
    width: "100%",
  },

  // ── Top row ──────────────────────────────────────────────────────────────
  topRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    gap: "40px",
    width: "100%",
    marginBottom: "40px",
  },

  // ── Left: Logo block ──────────────────────────────────────────────────────
  logoBlock: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    minWidth: "200px",
    flexShrink: 0,
  },
  logoText: {
    fontSize: "2.4rem",
    fontWeight: "900",
    letterSpacing: "0.04em",
    color: "#ffffff",
    textTransform: "uppercase",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    margin: 0,
  },

  // ── Vertical divider ──────────────────────────────────────────────────────
  vLine: {
    width: "1px",
    backgroundColor: "rgba(255,255,255,0.35)",
    alignSelf: "stretch",
    flexShrink: 0,
  },

  // ── Right: Content block ──────────────────────────────────────────────────
  contentBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    flex: 1,
  },
  tagline: {
    fontSize: "0.95rem",
    fontWeight: "500",
    lineHeight: "1.5",
    color: "#ffffff",
    margin: 0,
    maxWidth: "340px",
  },

  // ── Nav links grid ────────────────────────────────────────────────────────
  navGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, auto)",
    gap: "4px 40px",
    width: "fit-content",
  },
  navCol: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  navLink: {
    color: "#7fb3ff",
    fontSize: "0.875rem",
    textDecoration: "underline",
    cursor: "pointer",
    listStyle: "disc",
    marginLeft: "16px",
    lineHeight: "1.6",
  },

  // ── Bottom-right row (social + CTA) ──────────────────────────────────────
  bottomRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "32px",
    flexWrap: "wrap",
  },
  socialBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  socialLabel: {
    fontSize: "0.8rem",
    color: "#ffffff",
    margin: 0,
    opacity: 0.9,
    whiteSpace: "nowrap",
  },
  socialIcons: {
    display: "flex",
    flexDirection: "row",
    gap: "12px",
    alignItems: "center",
  },
  socialIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    cursor: "pointer",
    textDecoration: "none",
    transition: "background-color 0.2s",
    flexShrink: 0,
  },

  // ── CTA block ─────────────────────────────────────────────────────────────
  ctaBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "flex-start",
  },
  ctaLabel: {
    fontSize: "0.8rem",
    color: "#ffffff",
    margin: 0,
    opacity: 0.9,
    whiteSpace: "nowrap",
  },
  ctaButton: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1.5px solid rgba(255,255,255,0.6)",
    borderRadius: "2px",
    padding: "10px 18px",
    backgroundColor: "transparent",
    color: "#ffffff",
    fontSize: "0.8rem",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "background-color 0.2s, border-color 0.2s",
  },

  // ── Copyright ─────────────────────────────────────────────────────────────
  copyright: {
    fontSize: "0.78rem",
    color: "rgba(255,255,255,0.65)",
    margin: 0,
    paddingTop: "16px",
    borderTop: "1px solid rgba(255,255,255,0.15)",
    width: "100%",
  },
};

// ─── Responsive overrides via a <style> tag ───────────────────────────────────
const responsiveCSS = `
  .footer-top-row {
    flex-direction: row !important;
    align-items: stretch !important;
  }
  .footer-v-line { display: block !important; }
  .footer-nav-grid {
    grid-template-columns: repeat(3, auto) !important;
  }
  .footer-bottom-row {
    flex-direction: row !important;
    align-items: flex-start !important;
    justify-content: space-between !important;
  }

  @media (max-width: 768px) {
    .footer-top-row {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 20px !important;
    }
    .footer-v-line { display: none !important; }
    .footer-nav-grid {
      grid-template-columns: 1fr !important;
      gap: 4px 0 !important;
    }
    .footer-bottom-row {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 20px !important;
    }
    .footer-logo-text {
      font-size: 2rem !important;
    }
  }

  .footer-social-icon:hover {
    background-color: rgba(255,255,255,0.45) !important;
  }
  .footer-cta-btn:hover {
    background-color: rgba(255,255,255,0.1) !important;
    border-color: #ffffff !important;
  }
`;

const Footer = () => {
  const navigate = useNavigate();
  const socialIcons = [
    { name: "Instagram", link: "#", icon: <SlSocialInstagram size={18} /> },
    { name: "Facebook", link: "#", icon: <SlSocialFacebook size={18} /> },
    { name: "LinkedIn", link: "#", icon: <SlSocialLinkedin size={18} /> },
    { name: "Google", link: "#", icon: <SlSocialGoogle size={18} /> },
  ];

  const navColumns = [
    [
      { label: "À propos", href: "#" },
      { label: "Services", href: "#" },
    ],
    [
      { label: "Devenir partenaire", href: "#" },
      { label: "Assistance & support", href: "#" },
    ],
    [
      { label: "Conditions générales", href: "#" },
      { label: "Politique de confidentialité", href: "#" },
    ],
  ];

  return (
    <>
      {/* Inject responsive CSS */}
      <style>{responsiveCSS}</style>

      <footer style={styles.footer}>
        {/* ── Top row: Logo | Divider | Content ── */}
        <div className="footer-top-row" style={styles.topRow}>
          {/* Logo */}
          <div style={styles.logoBlock}>
            {/* Replace the <h1> below with your <img> when available:
                <img src={siyanatiLogo} alt="Siyanati Logo" style={{ width: "180px", height: "auto" }} /> */}
            <h1 className="footer-logo-text" style={styles.logoText}>
              SIYANATI
            </h1>
          </div>

          {/* Vertical divider (hidden on mobile via CSS) */}
          <div className="footer-v-line" style={styles.vLine} />

          {/* Content */}
          <div style={styles.contentBlock}>
            {/* Tagline */}
            <p style={styles.tagline}>
              La plateforme qui simplifie la réparation et l'entretien
              automobile.
            </p>

            {/* Nav links — 3 columns on desktop, stacked on mobile */}
            <div className="footer-nav-grid" style={styles.navGrid}>
              {navColumns.map((col, ci) => (
                <ul
                  key={ci}
                  style={{
                    ...styles.navCol,
                    padding: 0,
                    margin: 0,
                    listStyle: "none",
                  }}>
                  {col.map((item, li) => (
                    <li
                      key={li}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}>
                      <span style={{ fontSize: "0.6rem", opacity: 0.7 }}>
                        •
                      </span>
                      <a href={item.href} style={styles.navLink}>
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ))}
            </div>

            {/* Social icons + CTA — side by side on desktop, stacked on mobile */}
            <div className="footer-bottom-row" style={styles.bottomRow}>
              {/* Social icons */}
              <div style={styles.socialBlock}>
                <p style={styles.socialLabel}>
                  suivez-nous sur les réseaux sociaux
                </p>
                <div style={styles.socialIcons}>
                  {socialIcons.map((social) => (
                    <a
                      key={social.name}
                      href={social.link}
                      aria-label={social.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-social-icon"
                      style={styles.socialIcon}>
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div style={styles.ctaBlock}>
                <p style={styles.ctaLabel}>
                  suivez-nous sur les réseaux sociaux
                </p>
                <button
                  className="footer-cta-btn"
                  style={styles.ctaButton}
                  onClick={() => navigate("/register")}>
                  COMMENCEZ AVEC SIYANATI
                  <FiArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Copyright ── */}
        <p style={styles.copyright}>© SIYANATI – Tous droits réservés.</p>
      </footer>
    </>
  );
};

export default Footer;
