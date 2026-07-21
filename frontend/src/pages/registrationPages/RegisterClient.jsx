import React, { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react";
import registrationImg from "../../assets/img/registrationImg.png";
import Input from "../../components/uiComponents/InputField";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";
import useAuthStore from "../../store/authStore";

const RegisterClient = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ─── Validation Logic ───────────────────────────────────────────
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Le nom complet est requis.";
    
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Veuillez entrer une adresse email valide.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Le numéro de téléphone est requis.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit comporter au moins 8 caractères.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── useEffect: Trigger submission when isSubmitting is true ────
  useEffect(() => {
    if (!isSubmitting) return;

    if (validateStep2()) {
      setErrors({});
      
      const submitRegistration = async () => {
        try {
          // Real API call
          const response = await axiosInstance.post("/auth/register", {
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
          });

          const { pendingToken } = response.data;
          if (pendingToken) {
            localStorage.setItem("pendingToken", pendingToken);
          }

          setSubmitStatus("success");
          setTimeout(() => {
            navigate("/verify-email");
          }, 1500);
        } catch (err) {
          if (err.response && err.response.data && err.response.data.errors) {
            // Map backend validation errors to the form's error state
            setErrors(err.response.data.errors);
          } else if (err.response && err.response.data && err.response.data.message) {
            setErrors({ general: err.response.data.message });
          } else {
            setErrors({ general: "Erreur d'inscription. Veuillez réessayer." });
          }
          setSubmitStatus("error");
          setIsSubmitting(false);
        }
      };

      submitRegistration();
    } else {
      setIsSubmitting(false);
    }
  }, [isSubmitting, formData, navigate]);

  // ─── Handlers ───────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const nextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white md:bg-gray-100">
      <div className="flex items-center justify-center w-full min-h-screen md:py-8">
        <div className="flex flex-col lg:flex-row items-center w-full h-full md:h-auto md:w-[90%] lg:w-[75%] xl:w-[65%] md:rounded-[40px] md:shadow-lg bg-white overflow-hidden">
          {/* Left image — hidden on mobile */}
          <img
            src={registrationImg}
            alt=""
            className="hidden lg:block h-full w-1/2 object-cover rounded-l-[40px] min-h-[500px]"
          />

          {/* Right form panel */}
          <div className="flex flex-col items-center gap-4 w-full lg:w-1/2 h-full justify-center px-6 sm:px-10 md:px-14 py-10">
            <h1 className="text-[24px] md:text-[28px] font-bold font-secondary text-blue-600 uppercase text-center w-full mb-2">
              Créer un compte
            </h1>

            {/* Step indicator */}
            <div className="flex gap-2 mb-2">
              <div className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${step === 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${step === 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            </div>

            <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
              
              {step === 1 && (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-sm font-medium text-gray-500">Nom et prénom</label>
                    <Input
                      name="fullName"
                      placeholder="Votre nom complet"
                      type="text"
                      style={errors.fullName ? "error" : "default"}
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <Input
                      name="email"
                      placeholder="Votre adresse email"
                      type="email"
                      style={errors.email ? "error" : "default"}
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-sm font-medium text-gray-500">Numéro de téléphone</label>
                    <Input
                      name="phone"
                      placeholder="Ex: 0555000000"
                      type="tel"
                      style={errors.phone ? "error" : "default"}
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  {/* Buttons for Step 1 */}
                  <div className="flex flex-col items-center gap-3 mt-4 w-full">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-[10px] rounded-[10px] transition duration-150 flex items-center justify-center gap-2"
                    >
                      Suivant <ArrowRight size={18} />
                    </button>
                    <p className="text-gray-500 text-sm my-1">- OU -</p>
                    <Input
                      name="login-btn"
                      placeholder="Se connecter"
                      type="button"
                      style="outline"
                      onClick={() => navigate("/login")}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
                  {/* Password */}
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-sm font-medium text-gray-500">Mot de passe</label>
                    <Input
                      name="password"
                      placeholder="Mot de passe"
                      type={showPassword ? "text" : "password"}
                      style={errors.password ? "error" : "default"}
                      value={formData.password}
                      onChange={handleChange}
                      iconRight={() => (
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="text-gray-400 hover:text-blue-600 transition duration-150 focus:outline-none">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      )}
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-sm font-medium text-gray-500">Confirmer le mot de passe</label>
                    <Input
                      name="confirmPassword"
                      placeholder="Confirmer le mot de passe"
                      type={showConfirmPassword ? "text" : "password"}
                      style={errors.confirmPassword ? "error" : "default"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      iconRight={() => (
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="text-gray-400 hover:text-blue-600 transition duration-150 focus:outline-none">
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      )}
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>

                  {/* Status messages */}
                  {errors.general && (
                    <p className="text-red-500 text-sm text-center font-medium mt-2">
                      {errors.general}
                    </p>
                  )}
                  {submitStatus === "success" && (
                    <p className="text-green-500 text-sm text-center font-medium mt-2">
                      Inscription réussie ! Redirection...
                    </p>
                  )}

                  {/* Buttons for Step 2 */}
                  <div className="flex flex-col items-center gap-3 mt-4 w-full">
                    <div className="flex gap-2 w-full">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="w-[25%] bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-[10px] rounded-[10px] transition duration-150 flex items-center justify-center"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <button
                        type="submit"
                        className="w-[75%] bg-blue-600 hover:bg-blue-700 text-white font-medium py-[10px] rounded-[10px] transition duration-150"
                      >
                        S'inscrire
                      </button>
                    </div>
                    
                    <p className="text-gray-500 text-sm my-1">- OU -</p>
                    <Input
                      name="login-btn"
                      placeholder="Se connecter"
                      type="button"
                      style="outline"
                      onClick={() => navigate("/login")}
                    />
                  </div>
                </div>
              )}

              {/* Link to professional registration */}
              <div className="flex justify-center mt-2 text-center">
                <Link
                  to="/register-role"
                  className="text-sm text-gray-500 hover:text-blue-600 underline underline-offset-2 transition-colors">
                  Vous êtes un professionnel ou un magasin ? S'inscrire ici
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterClient;
