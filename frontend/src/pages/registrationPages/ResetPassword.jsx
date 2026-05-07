import React, { useState } from "react";

const ResetPassword = () => {
  const phoneNumberStep = () => {
    const [validationPhoneNumber, setValidationPhoneNumber] = useState("");
    const [errors, setErrors] = useState("");

    const handleChange = (e) => {
      setValidationPhoneNumber(e.target.value);
      if (errors) {
        setErrors("");
      }
    };
    return (
      <div className="w-full max-w-[400px] p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">
          Réinitialiser le mot de passe
        </h2>
        <p className="mb-4">
          Entrez votre numéro de téléphone pour recevoir un code de
          vérification.
        </p>
        <Input
          name="phone"
          placeholder="Numéro de téléphone"
          type="tel"
          style="default"
          value={formData.phone}
          onChange={handleChange}
        />
        <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-secondary transition duration-300">
          Envoyer le code
        </button>
      </div>
    );
  };
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white md:bg-gray-100"></div>
  );
};

export default ResetPassword;
