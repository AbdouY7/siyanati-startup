import { useState } from "react";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap');

  .solutions-card { transition: flex 0.7s cubic-bezier(0.77, 0, 0.175, 1); }

  .card-bg {
    transition: transform 0.7s cubic-bezier(0.77, 0, 0.175, 1), filter 0.7s ease;
    transform: scale(1.05);
  }
  .card-active .card-bg  { transform: scale(1.08); filter: brightness(1.05) saturate(1.1); }
  .card-inactive .card-bg { transform: scale(1); filter: brightness(0.45) saturate(0.3); }

  .card-blue-overlay {
    background: linear-gradient(135deg, transparent 0%, transparent 100%);
    transition: background 0.6s ease;
  }
  .card-active .card-blue-overlay {
    background: linear-gradient(135deg, rgba(15,40,120,0.55) 0%, rgba(59,130,246,0.25) 50%, rgba(96,165,250,0.15) 100%);
  }

  .card-bottom-fade {
    background: linear-gradient(to top, rgba(5,8,25,0.95) 0%, transparent 100%);
    height: 65%;
    transition: height 0.6s ease, background 0.6s ease;
  }
  .card-active .card-bottom-fade {
    height: 75%;
    background: linear-gradient(to top, rgba(3,10,40,0.97) 0%, rgba(10,30,80,0.4) 60%, transparent 100%);
  }

  .card-title-el { transition: font-size 0.5s ease, color 0.4s ease; font-size: 1.2rem; }
  .card-active .card-title-el { font-size: 1.45rem; color: #e0eeff; }

  .card-details-wrap {
    max-height: 0;
    opacity: 0;
    transform: translateY(12px);
    overflow: hidden;
    transition: max-height 0.6s cubic-bezier(0.77,0,0.175,1), opacity 0.5s ease 0.05s, transform 0.5s ease 0.05s;
  }
  .card-active .card-details-wrap { max-height: 240px; opacity: 1; transform: translateY(0); }

  .card-badge {
    opacity: 0; transform: translateY(6px);
    transition: opacity 0.4s ease 0.15s, transform 0.4s ease 0.15s;
  }
  .card-active .card-badge { opacity: 1; transform: translateY(0); }

  .card-cta-btn {
    opacity: 0; transform: translateY(8px);
    transition: opacity 0.4s ease 0.3s, transform 0.4s ease 0.3s, box-shadow 0.3s ease, background 0.3s ease;
  }
  .card-active .card-cta-btn { opacity: 1; transform: translateY(0); }
  .card-cta-btn:hover {
    box-shadow: 0 6px 28px rgba(59,130,246,0.7) !important;
    background: linear-gradient(90deg, #2563eb, #60a5fa) !important;
  }

  .card-icon-svg {
    filter: drop-shadow(0 0 8px rgba(59,130,246,0.8));
    transition: transform 0.4s ease, filter 0.4s ease;
  }
  .card-active .card-icon-svg {
    transform: scale(1.15) rotate(-5deg);
    filter: drop-shadow(0 0 14px rgba(96,165,250,1));
  }

  .detail-item { transform: translateX(-6px); transition: transform 0.3s ease; }
  .card-active .detail-item { transform: translateX(0); }
  .card-active .detail-item:nth-child(1) { transition-delay: 0.15s; }
  .card-active .detail-item:nth-child(2) { transition-delay: 0.22s; }
  .card-active .detail-item:nth-child(3) { transition-delay: 0.29s; }
  .card-active .detail-item:nth-child(4) { transition-delay: 0.36s; }

  .glint { left: -100%; transition: left 0s; }
  .card-active .glint { left: 150%; transition: left 0.7s ease 0.1s; }

  .card-border-glow {
    border: 1.5px solid transparent;
    transition: border-color 0.4s ease, box-shadow 0.4s ease;
  }
  .card-active .card-border-glow {
    border-color: rgba(59,130,246,0.4);
    box-shadow: inset 0 0 40px rgba(59,130,246,0.08);
  }

  .divider-line {
    background: linear-gradient(to bottom, transparent, rgba(59,130,246,0.5), transparent);
    height: 60%;
    transition: height 0.4s ease, opacity 0.4s ease;
  }
  .solutions-container:hover .divider-line { height: 80%; opacity: 0.8; }

  .solutions-font { font-family: 'Rajdhani', sans-serif; }
`;

const cards = [
  {
    id: 1,
    badge: "Magasin & Boutique",
    title: "Pour les magasins\nde pièces",
    bgImage:
      "https://images.unsplash.com/photo-1632823471565-1ecdf5c6da35?w=900&q=80",
    details: [
      "Inscrivez votre magasin sur la plateforme",
      "Ajoutez et gérez vos produits (neufs ou d'occasion)",
      "Suivez vos commandes et vos ventes",
      "Profitez d'outils de promotion et de fidélisation",
    ],
    cta: "Commencer",
    icon: (
      <svg className="card-icon-svg w-9 h-9" viewBox="0 0 40 40" fill="none">
        <circle
          cx="20"
          cy="20"
          r="18"
          stroke="#3b82f6"
          strokeWidth="1.5"
          opacity="0.4"
        />
        <path
          d="M12 20c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8"
          stroke="#60a5fa"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="20" cy="20" r="3" fill="#3b82f6" />
        <path
          d="M20 14v-3M26 20h3M20 26v3"
          stroke="#60a5fa"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 2,
    badge: "Professionnels",
    title: "Pour les professionnels\n(mécaniciens, électriciens)",
    bgImage:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80",
    details: [
      "Accédez à un catalogue complet de pièces certifiées",
      "Commandez directement depuis votre atelier",
      "Bénéficiez de tarifs professionnels exclusifs",
      "Gérez vos devis et factures en un clic",
    ],
    cta: "Rejoindre",
    icon: (
      <svg className="card-icon-svg w-9 h-9" viewBox="0 0 40 40" fill="none">
        <circle
          cx="20"
          cy="20"
          r="18"
          stroke="#3b82f6"
          strokeWidth="1.5"
          opacity="0.4"
        />
        <path
          d="M10 22l4-8 4 5 3-3 4 6"
          stroke="#60a5fa"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M28 16l2 2-2 2"
          stroke="#60a5fa"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="14" cy="29" r="2" stroke="#3b82f6" strokeWidth="1.5" />
        <circle cx="26" cy="29" r="2" stroke="#3b82f6" strokeWidth="1.5" />
        <path d="M16 29h8" stroke="#60a5fa" strokeWidth="1.5" />
      </svg>
    ),
  },
];

const ArrowIcon = () => (
  <svg
    className="arrow w-3.5 h-3.5 transition-transform duration-300 group-hover/cta:translate-x-1"
    viewBox="0 0 14 14"
    fill="none">
    <path
      d="M2 7h10M8 3l4 4-4 4"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function SolutionsCards() {
  const [hovered, setHovered] = useState(null);

  const getCardClass = (id) => {
    if (hovered === null) return "";
    return hovered === id ? "card-active" : "card-inactive";
  };

  return (
    <>
      <style>{globalStyles}</style>

      <div
        className="solutions-container flex h-[460px] w-full rounded-2xl overflow-hidden relative"
        style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}
        onMouseLeave={() => setHovered(null)}>
        {cards.map((card, idx) => (
          <div
            key={card.id}
            className={`solutions-card relative overflow-hidden cursor-pointer ${getCardClass(card.id)}`}
            style={{ flex: hovered === card.id ? 1.45 : hovered ? 0.55 : 1 }}
            onMouseEnter={() => setHovered(card.id)}>
            {/* Background Image */}
            <div
              className="card-bg absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${card.bgImage}')` }}
            />

            {/* Blue Gradient Overlay */}
            <div className="card-blue-overlay absolute inset-0 z-[1]" />

            {/* Glint sweep */}
            <div
              className="glint absolute top-0 w-[60%] h-full z-[4] pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
              }}
            />

            {/* Border glow */}
            <div className="card-border-glow absolute inset-0 z-[5] pointer-events-none rounded-none" />

            {/* Bottom fade */}
            <div className="card-bottom-fade absolute bottom-0 left-0 right-0 z-[2]" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 px-7 pb-7 z-[3]">
              {/* Icon + Badge */}
              <div
                className="flex items-center gap-2.5 mb-2.5 text-white"
                style={{ color: "#e9effd" }}>
                {card.icon}
                <span
                  className="card-badge font-primary text-[10px] tracking-[3px] uppercase text-blue-600 px-2.5 py-0.5 rounded-full"
                  style={{
                    background: "#e9effd",
                    border: "1px solid #e9effd",
                  }}>
                  {card.badge}
                </span>
              </div>

              {/* Title */}
              <h3
                className=" font-secondary font-bold text-[18px] md:text-[36px] text-white leading-tight mb-3"
                style={{
                  whiteSpace: "pre-line",
                  textShadow: "0 2px 12px rgba(0,0,0,0.8)",
                }}>
                {card.title}
              </h3>

              {/* Details */}
              <div className="card-details-wrap">
                <ul className="mb-4 space-y-0.5">
                  {card.details.map((item, i) => (
                    <li
                      key={i}
                      className="detail-item flex items-start gap-2 text-[12.5px] text-blue-100/80 font-light leading-relaxed">
                      <span
                        className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500"
                        style={{ boxShadow: "0 0 6px rgba(59,130,246,0.8)" }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  className="card-cta-btn group/cta solutions-font inline-flex items-center gap-2 text-[13px] font-semibold tracking-widest uppercase text-white px-5 py-2.5 rounded-md"
                  style={{
                    background: "linear-gradient(90deg, #1d4ed8, #3b82f6)",
                    boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
                  }}>
                  {card.cta}
                  <ArrowIcon />
                </button>
              </div>
            </div>

            {/* Divider after first card */}
            {idx === 0 && (
              <div className="divider-line absolute top-1/2 -translate-y-1/2 right-0 w-[2px] z-[10]" />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
