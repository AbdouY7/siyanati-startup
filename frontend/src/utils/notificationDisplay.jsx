import {
  FiBell,
  FiCheckCircle,
  FiFileText,
  FiInfo,
  FiAlertTriangle,
  FiCalendar,
  FiShoppingCart,
} from "react-icons/fi";

export const typeIcons = {
  new_message: FiFileText,
  report_reviewed: FiAlertTriangle,
  new_report: FiAlertTriangle,
  admin_signal_response: FiInfo,
  new_store_registration: FiCheckCircle,
  new_professional_registration: FiCheckCircle,
  new_user_registration: FiCheckCircle,
  order_status_updated: FiShoppingCart,
  new_order: FiShoppingCart,
  appointment_requested: FiCalendar,
  appointment_confirmed: FiCalendar,
  appointment_cancelled: FiCalendar,
  appointment_completed: FiCalendar,
  new_appointment: FiCalendar,
  default: FiBell,
};

export const typeColors = {
  new_message: "text-blue-600 bg-blue-50",
  report_reviewed: "text-yellow-600 bg-yellow-50",
  new_report: "text-red-600 bg-red-50",
  admin_signal_response: "text-blue-600 bg-blue-50",
  new_store_registration: "text-green-600 bg-green-50",
  new_professional_registration: "text-green-600 bg-green-50",
  new_user_registration: "text-green-600 bg-green-50",
  order_status_updated: "text-blue-600 bg-blue-50",
  new_order: "text-green-600 bg-green-50",
  appointment_requested: "text-blue-600 bg-blue-50",
  appointment_confirmed: "text-green-600 bg-green-50",
  appointment_cancelled: "text-red-600 bg-red-50",
  appointment_completed: "text-blue-600 bg-blue-50",
  new_appointment: "text-green-600 bg-green-50",
  default: "text-gray-600 bg-gray-50",
};

export function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Il y a ${diffDays} j`;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export function getNotificationLink(notification, userRole) {
  if (!notification.reference_id) return "#";

  switch (notification.type) {
    case "order_status_updated":
    case "new_order":
      if (userRole === "store") return "/store/orders";
      if (userRole === "customer") return "/orders";
      return "#";
    case "appointment_requested":
    case "appointment_confirmed":
    case "appointment_cancelled":
    case "appointment_completed":
    case "new_appointment":
      if (userRole === "professional") return "/pro/appointments";
      if (userRole === "customer") return "/profile/appointments";
      return "#";
    case "new_store_registration":
    case "store_approved":
    case "store_rejected":
      if (userRole === "admin") return "/admin/stores";
      return "#";
    case "new_professional_registration":
    case "professional_approved":
    case "professional_rejected":
      if (userRole === "admin") return "/admin/professionals";
      return "#";
    case "report_reviewed":
    case "new_report":
      if (userRole === "admin") return "/admin/reports";
      return "#";
    default:
      return "#";
  }
}
