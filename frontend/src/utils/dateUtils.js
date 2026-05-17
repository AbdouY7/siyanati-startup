/**
 * Calculates age in years from a date of birth string/Date
 */
export const calculateAge = (dobString) => {
  if (!dobString) return "N/A";
  
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return "N/A";
  
  const ageDifMs = Date.now() - dob.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

/**
 * Formats a date into DD/MM/YYYY format
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Extracts just the year from a date string
 */
export const getYear = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  
  return date.getFullYear();
};
