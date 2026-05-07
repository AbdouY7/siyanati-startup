import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import registrationImg from "../../assets/img/registrationImg.png";
import Input from "../../components/uiComponents/InputField";
import { Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // "success" | "error" | null

  const [showPassword, setShowPassword] = useState(false);

  // ─── Validation Logic ───────────────────────────────────────────
  const validate = (data) => {
    const newErrors = {};

    // Email
    if (!data.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Password
    if (!data.password) {
      newErrors.password = "Password is required.";
    } else if (data.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    } else if (!/[A-Z]/.test(data.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter.";
    } else if (!/[0-9]/.test(data.password)) {
      newErrors.password = "Password must contain at least one number.";
    }

    return newErrors;
  };

  // ─── useEffect: Trigger submission when isSubmitting is true ────
  useEffect(() => {
    if (!isSubmitting) return;

    const validationErrors = validate(formData);

    if (Object.keys(validationErrors).length > 0) {
      // Has errors — stop submission and show them
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    } else {
      setErrors({}); // Clear any previous errors
      window.location.href = "/home-user";
    }

    // No errors — call your API
    // const submitLogin = async () => {
    //   try {
    //     const response = await fetch("/api/auth/login", {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify({
    //         email: formData.email,
    //         password: formData.password,
    //       }),
    //     });

    //     const data = await response.json();

    //     if (!response.ok) {
    //       // Server returned an error (401, 403, etc.)
    //       setErrors({ general: data.message || "Invalid email or password." });
    //       setSubmitStatus("error");
    //     } else {
    //       // Success — store token, redirect, etc.
    //       localStorage.setItem("token", data.token);
    //       setSubmitStatus("success");
    //       // Example redirect:
    //       // window.location.href = "/dashboard";
    //     }
    //   } catch (err) {
    //     setErrors({ general: "Network error. Please try again." });
    //     setSubmitStatus("error");
    //   } finally {
    //     setIsSubmitting(false);
    //   }
    // };

    // submitLogin();
  }, [isSubmitting]); // runs every time isSubmitting flips to true

  // ─── Handlers ───────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear the error for this field as the user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true); // triggers the useEffect
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white md:bg-gray-100">
      <div className="flex items-center justify-center w-full min-h-screen md:py-8">
        <div className="flex flex-col lg:flex-row items-center w-full h-screen md:h-auto md:w-[90%] lg:w-[75%] xl:w-[65%] md:rounded-[40px] md:shadow-lg bg-white overflow-hidden">
          {/* Left image — hidden on mobile */}
          <img
            src={registrationImg}
            alt=""
            className="hidden lg:block h-full w-1/2 object-cover rounded-l-[40px]"
          />

          {/* Right form panel */}
          <div className="flex flex-col items-center gap-6 w-full lg:w-1/2 h-full justify-center px-6 sm:px-10 md:px-14 py-10">
            <h1 className="text-[24px] md:text-[28px] font-bold font-secondary text-primary uppercase">
              Se connecter
            </h1>

            <form className="flex flex-col gap-4 w-full">
              {/* Email */}
              <div className="flex flex-col gap-1 w-full">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <Input
                  name="email"
                  placeholder="Email"
                  type="email"
                  style={errors.email ? "error" : "default"}
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1 w-full">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-500">
                  Mot de passe
                </label>
                <Input
                  name="password"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  style={errors.password ? "error" : "default"}
                  value={formData.password}
                  onChange={handleChange}
                  iconRight={() => (
                    // 👈 pass icon as a component
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-gray-400 hover:text-primary transition duration-150 focus:outline-none">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}

                {/* Remember me + Forgot password */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      id="remember"
                      name="remember"
                      className="cursor-pointer accent-primary"
                    />
                    <label
                      htmlFor="remember"
                      className="text-[11px] md:text-[13px] text-gray-500 cursor-pointer">
                      Souviens-toi de moi
                    </label>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-[11px] md:text-[13px] underline underline-offset-1 text-primary hover:text-secondary cursor-pointer transition duration-150">
                    Oublier mon mot de passe ?
                  </Link>
                </div>
              </div>

              {/* Status messages */}
              {errors.general && (
                <p className="text-red-500 text-sm text-center">
                  {errors.general}
                </p>
              )}
              {submitStatus === "success" && (
                <p className="text-green-500 text-sm text-center">
                  Connexion réussie ! Redirection...
                </p>
              )}

              {/* Buttons */}
              <div className="flex flex-col items-center gap-4 mt-4 w-full">
                <Input
                  placeholder="Se connecter"
                  name="Se connecter"
                  type="button"
                  style="solid"
                  onClick={handleSubmit}
                />
                <p className="text-gray-500 text-sm">- OU -</p>
                <Input
                  name="S'inscrire"
                  placeholder="S'inscrire"
                  type="button"
                  style="outline"
                  onClick={() => (window.location.href = "/register")}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
