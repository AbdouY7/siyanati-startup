import {
  RiCalendarCheckLine,
  RiCheckboxCircleLine,
  RiNotification3Line,
  RiStarLine,
  RiTimeLine,
} from "react-icons/ri";

const notifications = [
  {
    id: 1,
    title: "Nouvelle demande de rendez-vous",
    text: "Un client a envoye une demande pour diagnostic electronique.",
    time: "Il y a 10 min",
    icon: RiCalendarCheckLine,
    color: "#2563eb",
    unread: true,
  },
  {
    id: 2,
    title: "Avis recu",
    text: "Vous avez recu une nouvelle note de 5 etoiles.",
    time: "Aujourd'hui",
    icon: RiStarLine,
    color: "#f59e0b",
    unread: true,
  },
  {
    id: 3,
    title: "Planning mis a jour",
    text: "Vos horaires de travail ont ete enregistres avec succes.",
    time: "Hier",
    icon: RiTimeLine,
    color: "#10b981",
    unread: false,
  },
  {
    id: 4,
    title: "Compte verifie",
    text: "Votre profil professionnel est actif et visible aux clients.",
    time: "Cette semaine",
    icon: RiCheckboxCircleLine,
    color: "#0b3c5d",
    unread: false,
  },
];

export default function NotificationsPro() {
  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1f1f1f]">Notifications</h1>
        <p className="mt-1 text-sm text-[#6b7280]">Centre de notifications professionnel. Donnees statiques pour le moment.</p>
      </div>

      <div className="rounded-2xl border border-[#e9effd] bg-white shadow-sm">
        <div className="border-b border-[#e9effd] px-6 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#1f1f1f]">
            <RiNotification3Line className="text-[#2563eb]" /> Activite recente
          </h2>
        </div>

        <div className="divide-y divide-[#e9effd]">
          {notifications.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className={`flex gap-4 px-6 py-5 ${item.unread ? "bg-[#2563eb]/5" : "bg-white"}`}>
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${item.color}18`, color: item.color }}
                >
                  <Icon className="text-xl" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#1f1f1f]">{item.title}</p>
                      <p className="mt-1 text-sm text-[#6b7280]">{item.text}</p>
                    </div>
                    <span className="text-xs font-medium text-[#9ca3af]">{item.time}</span>
                  </div>
                </div>
                {item.unread && <span className="mt-2 h-2 w-2 rounded-full bg-[#2563eb]" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
