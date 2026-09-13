/**
 * Centralized mapping of backend error messages to user-friendly French messages.
 * This ensures that raw backend/technical messages are never shown to the user.
 *
 * Usage:
 *   import { mapAuthError } from '../utils/authErrorMessages';
 *   const friendlyMsg = mapAuthError(backendMessage);
 */

const AUTH_ERROR_MAP = {
  // ─── Login ──────────────────────────────────────────────────────
  "User not found": "Aucun compte n'est associé à cet email.",
  "Invalid credentials": "Mot de passe incorrect. Veuillez réessayer.",
  "Google token required": "L'authentification Google a échoué. Veuillez réessayer.",
  "Google email not verified": "Votre email Google n'est pas vérifié. Veuillez d'abord vérifier votre email Google.",

  // ─── Registration ──────────────────────────────────────────────
  "Email already in use": "Cet email est déjà utilisé. Veuillez en utiliser un autre ou vous connecter.",
  "Phone number already in use": "Ce numéro de téléphone est déjà utilisé.",
  "Email or phone number already in use": "Cet email ou numéro de téléphone est déjà utilisé.",
  "Email, password, phone and full_name are required": "Veuillez remplir tous les champs obligatoires.",
  "email, password, phone, owner_name, store_name, address, and wilaya are required": "Veuillez remplir tous les champs obligatoires.",
  "Invalid date_of_birth": "La date de naissance saisie est invalide.",

  // ─── Email Verification ────────────────────────────────────────
  "Code is required": "Veuillez entrer le code de vérification.",
  "Email already verified": "Votre email est déjà vérifié.",
  "No verification code requested": "Aucun code de vérification n'a été demandé. Veuillez en demander un nouveau.",
  "Verification code expired. Please request a new one.": "Le code de vérification a expiré. Veuillez en demander un nouveau.",
  "Too many failed attempts. Please request a new code.": "Trop de tentatives échouées. Veuillez demander un nouveau code.",
  "Invalid verification code": "Le code de vérification est incorrect.",
  "Please wait 60 seconds before requesting a new code": "Veuillez patienter 60 secondes avant de demander un nouveau code.",

  // ─── Phone Verification ────────────────────────────────────────
  "Phone already verified": "Votre numéro de téléphone est déjà vérifié.",
  "No phone verification code requested": "Aucun code de vérification par SMS n'a été demandé.",
  "Phone verification code expired. Please request a new one.": "Le code de vérification SMS a expiré. Veuillez en demander un nouveau.",
  "Too many failed attempts for phone verification. Please request a new code.": "Trop de tentatives échouées. Veuillez demander un nouveau code SMS.",
  "Invalid phone verification code": "Le code de vérification SMS est incorrect.",
  "Failed to send SMS": "L'envoi du SMS a échoué. Veuillez réessayer plus tard.",

  // ─── Password Reset ────────────────────────────────────────────
  "Email is required": "Veuillez saisir votre adresse email.",
  "Token, password, and confirm_password are required": "Veuillez remplir tous les champs.",
  "Passwords do not match": "Les mots de passe ne correspondent pas.",
  "Password must be at least 8 characters long": "Le mot de passe doit comporter au moins 8 caractères.",
  "Invalid or expired reset token": "Le lien de réinitialisation est invalide ou a expiré. Veuillez en demander un nouveau.",

  // ─── Token / Session ───────────────────────────────────────────
  "Refresh token required": "Votre session a expiré. Veuillez vous reconnecter.",
  "Invalid refresh token": "Votre session a expiré. Veuillez vous reconnecter.",
  "Invalid or expired refresh token": "Votre session a expiré. Veuillez vous reconnecter.",

  // ─── General ───────────────────────────────────────────────────
  "User not found": "Compte introuvable.",
  "Account is suspended": "Votre compte a été suspendu. Veuillez contacter le support.",
  "Account pending approval": "Votre compte est en attente d'approbation par l'administrateur.",
};

// Default fallback message
const DEFAULT_ERROR = "Une erreur est survenue. Veuillez réessayer plus tard.";

/**
 * Maps a backend error message to a user-friendly French message.
 * @param {string} backendMessage - The raw error message from the backend
 * @returns {string} A user-friendly message in French
 */
export const mapAuthError = (backendMessage) => {
  if (!backendMessage || typeof backendMessage !== "string") {
    return DEFAULT_ERROR;
  }
  return AUTH_ERROR_MAP[backendMessage] || DEFAULT_ERROR;
};

/**
 * Maps a backend error message and returns both the friendly message
 * and the field it should be associated with (for form field-level errors).
 * @param {string} backendMessage - The raw error message from the backend
 * @returns {{ field: string|null, message: string }}
 */
export const mapAuthErrorWithField = (backendMessage) => {
  if (!backendMessage || typeof backendMessage !== "string") {
    return { field: null, message: DEFAULT_ERROR };
  }

  const FIELD_MAP = {
    "User not found": "email",
    "Invalid credentials": "password",
    "Email already in use": "email",
    "Phone number already in use": "phone",
    "Email or phone number already in use": "email",
    "Invalid date_of_birth": "date_of_birth",
    "Email is required": "email",
  };

  const friendlyMessage = AUTH_ERROR_MAP[backendMessage] || backendMessage; // Changed to return the backend message if no map is found just in case, but default is mostly used
  const field = FIELD_MAP[backendMessage] || null;

  return { field, message: friendlyMessage };
};

/**
 * Maps an object of backend validation errors to user-friendly French messages.
 * @param {Object} errorsObj - The raw errors object from the backend (e.g. { email: "Email already in use" })
 * @returns {Object} An object with user-friendly messages
 */
export const mapValidationErrors = (errorsObj) => {
  if (!errorsObj || typeof errorsObj !== 'object') return {};
  const mapped = {};
  for (const [key, val] of Object.entries(errorsObj)) {
    if (typeof val === 'string') {
      mapped[key] = AUTH_ERROR_MAP[val] || val;
    } else {
      mapped[key] = val;
    }
  }
  return mapped;
};

export default mapAuthError;
