import React, { useState } from 'react';
import { ChevronLeft, User, MapPin, Upload, Calendar, Phone, Wrench, Mail, Lock, ArrowRight, ArrowLeft, CheckCircle, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

const SPECIALTIES = [
  'Mécanique générale','Électricité auto','Carrosserie','Peinture','Climatisation',
  'Pneumatique','Diagnostic électronique','Moteur','Boîte de vitesses','Freinage',
  'Suspension','Échappement','Autre'
];

const WORK_TYPES = [
  { value: 'individuel', label: 'Individuel' },
  { value: 'avec_magasin', label: 'Avec magasin' }
];

const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar',
  'Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger',
  'Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma',
  'Constantine','Médéa','Mostaganem','M\'Sila','Mascara','Ouargla','Oran','El Bayadh',
  'Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued',
  'Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent',
  'Ghardaïa','Relizane'
];

const STEPS = [
  { label: 'Compte' },
  { label: 'Profil' },
  { label: 'Détails' },
];

const ProfessionalRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [workType, setWorkType] = useState('individuel');
  const [formData, setFormData] = useState({
    email: '', password: '', phone: '', full_name: '',
    specialty_type: '', experience_years: '', wilaya: '', location_address: '',
    work_phone: '', bio: '', hourly_rate_dzd: '',
    shop_images: null, documents: null,
    store_name: '', store_address: '', store_wilaya: '', store_location: '',
    store_documents: null, store_images: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e, fieldName) => {
    const files = e.target.files;
    if (files && files.length > 0) setFormData(prev => ({ ...prev, [fieldName]: files }));
  };

  const validateStep = (s) => {
    const newErrors = {};
    if (s === 1) {
      if (!formData.email) newErrors.email = 'Email est requis';
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email invalide';
      if (!formData.password) newErrors.password = 'Mot de passe est requis';
      else if (formData.password.length < 8) newErrors.password = 'Minimum 8 caractères';
      if (!formData.phone) newErrors.phone = 'Téléphone est requis';
      if (!formData.full_name) newErrors.full_name = 'Nom complet est requis';
    }
    if (s === 2) {
      if (!formData.specialty_type) newErrors.specialty_type = 'Spécialité est requise';
      if (!formData.wilaya) newErrors.wilaya = 'Wilaya est requise';
      if (!formData.location_address) newErrors.location_address = 'Adresse est requise';
      if (workType === 'avec_magasin') {
        if (!formData.store_name) newErrors.store_name = 'Nom du magasin est requis';
        if (!formData.store_address) newErrors.store_address = 'Adresse du magasin est requise';
        if (!formData.store_wilaya) newErrors.store_wilaya = 'Wilaya du magasin est requise';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => { if (validateStep(step)) setStep(s => s + 1); };
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < STEPS.length) {
      nextStep();
      return;
    }
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (!key.includes('images') && !key.includes('documents') && formData[key])
          data.append(key, formData[key]);
      });
      data.append('work_type', workType);
      if (formData.shop_images) Array.from(formData.shop_images).forEach(f => data.append('shop_images', f));
      if (formData.documents) Array.from(formData.documents).forEach(f => data.append('documents', f));
      if (workType === 'avec_magasin' && formData.store_documents) Array.from(formData.store_documents).forEach(f => data.append('store_documents', f));
      if (workType === 'avec_magasin' && formData.store_images) Array.from(formData.store_images).forEach(f => data.append('store_images', f));

      const response = await axios.post('/auth/register-professional', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.status === 201) setSubmitSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur de connexion au serveur';
      setErrors({ general: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase = 'w-full px-4 py-3 pl-11 rounded-xl border text-sm transition-all duration-200 outline-none bg-white';
  const inputNormal = `${inputBase} border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100`;
  const inputError  = `${inputBase} border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100`;
  const ic = (f) => errors[f] ? inputError : inputNormal;

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 py-8 px-4">
      <div className="flex flex-col lg:flex-row w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden bg-white">

        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-[45%] bg-gray-900 flex-col items-center justify-center p-10 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 rounded-l-3xl" />
          <h2 className="text-white text-3xl font-black italic tracking-widest mb-8 z-10 drop-shadow">SIYANATI</h2>
          <div className="w-full max-w-xs z-10">
            <img
              src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80"
              alt="Car parts"
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </div>
          <p className="text-white/50 text-xs mt-8 z-10 tracking-widest uppercase">Inscription Professionnel</p>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col px-8 md:px-12 py-10 bg-gray-50">

          {/* Back */}
          <button
            onClick={() => step === 1 ? navigate('/register-role') : prevStep()}
            className="w-9 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition-colors mb-6 self-start"
          >
            <ChevronLeft size={18} />
          </button>

          <h1 className="text-2xl font-extrabold text-blue-600 uppercase tracking-wide mb-1 text-center">
            S'inscrire comme Professionnel
          </h1>
          <p className="text-gray-400 text-xs text-center mb-6">Étape {step} sur {STEPS.length}</p>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-8 justify-center">
            {STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step > i + 1 ? 'bg-blue-600 text-white' :
                    step === i + 1 ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                    'bg-gray-200 text-gray-400'
                  }`}>
                    {step > i + 1 ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-medium ${step === i + 1 ? 'text-blue-600' : 'text-gray-400'}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 rounded transition-all duration-300 ${step > i + 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {submitSuccess ? (
            <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Inscription soumise !</h2>
              <p className="text-gray-500 text-sm max-w-xs">Votre demande est en attente d'approbation par l'administrateur.</p>
              <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                Aller à la connexion
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 flex-1">

              {/* ── STEP 1: Account ── */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Work Type */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Type de travail</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <select value={workType} onChange={(e) => setWorkType(e.target.value)} className={`${inputNormal} appearance-none cursor-pointer`}>
                        {WORK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" className={ic('email')} />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 8 caractères" className={ic('password')} />
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Nom complet</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Nom et prénom" className={ic('full_name')} />
                    </div>
                    {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+213..." className={ic('phone')} />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
              )}

              {/* ── STEP 2: Profile ── */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Specialty */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Spécialité</label>
                    <div className="relative">
                      <Wrench className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <select name="specialty_type" value={formData.specialty_type} onChange={handleChange} className={`${ic('specialty_type')} appearance-none cursor-pointer`}>
                        <option value="">Sélectionnez une spécialité</option>
                        {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                    {errors.specialty_type && <p className="text-red-500 text-xs mt-1">{errors.specialty_type}</p>}
                  </div>

                  {/* Work Phone */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Numéro de travail <span className="text-gray-400">(optionnel)</span></label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="tel" name="work_phone" value={formData.work_phone} onChange={handleChange} placeholder="Numéro de travail" className={inputNormal} />
                    </div>
                  </div>

                  {/* Wilaya */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Wilaya</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <select name="wilaya" value={formData.wilaya} onChange={handleChange} className={`${ic('wilaya')} appearance-none cursor-pointer`}>
                        <option value="">Sélectionnez une wilaya</option>
                        {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                    {errors.wilaya && <p className="text-red-500 text-xs mt-1">{errors.wilaya}</p>}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Adresse</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="text" name="location_address" value={formData.location_address} onChange={handleChange} placeholder="Adresse complète" className={ic('location_address')} />
                    </div>
                    {errors.location_address && <p className="text-red-500 text-xs mt-1">{errors.location_address}</p>}
                  </div>

                  {/* Conditional Store Fields */}
                  {workType === 'avec_magasin' && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Informations du magasin</p>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Nom du magasin</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input type="text" name="store_name" value={formData.store_name} onChange={handleChange} placeholder="Nom du magasin" className={ic('store_name')} />
                        </div>
                        {errors.store_name && <p className="text-red-500 text-xs mt-1">{errors.store_name}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Adresse du magasin</label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input type="text" name="store_address" value={formData.store_address} onChange={handleChange} placeholder="Adresse du magasin" className={ic('store_address')} />
                        </div>
                        {errors.store_address && <p className="text-red-500 text-xs mt-1">{errors.store_address}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Wilaya du magasin</label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <select name="store_wilaya" value={formData.store_wilaya} onChange={handleChange} className={`${ic('store_wilaya')} appearance-none cursor-pointer`}>
                            <option value="">Sélectionnez une wilaya</option>
                            {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                          </select>
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                        {errors.store_wilaya && <p className="text-red-500 text-xs mt-1">{errors.store_wilaya}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 3: Details & Files ── */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Bio <span className="text-gray-400">(optionnel)</span></label>
                    <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Parlez de votre expérience..." rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none" />
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Années d'expérience <span className="text-gray-400">(optionnel)</span></label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="number" name="experience_years" value={formData.experience_years} onChange={handleChange} placeholder="Années d'expérience" min="0" className={inputNormal} />
                    </div>
                  </div>

                  {/* Hourly Rate */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Tarif horaire DZD <span className="text-gray-400">(optionnel)</span></label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="number" name="hourly_rate_dzd" value={formData.hourly_rate_dzd} onChange={handleChange} placeholder="Tarif horaire en DZD" min="0" className={inputNormal} />
                    </div>
                  </div>

                  {/* File uploads */}
                  <div className="space-y-3">
                    {[
                      { id: 'prof-shop-imgs', field: 'shop_images', label: "Images de l'atelier (optionnel)", multiple: true, accept: 'image/*', display: formData.shop_images ? `${formData.shop_images.length} image(s)` : 'Télécharger' },
                      { id: 'prof-docs', field: 'documents', label: 'Documents (optionnel)', multiple: true, accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png', display: formData.documents ? `${formData.documents.length} fichier(s)` : 'Télécharger' },
                      ...(workType === 'avec_magasin' ? [
                        { id: 'store-docs-prof', field: 'store_documents', label: 'Documents du magasin', multiple: true, accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png', display: formData.store_documents ? `${formData.store_documents.length} fichier(s)` : 'Télécharger' },
                        { id: 'store-imgs-prof', field: 'store_images', label: 'Images du magasin (optionnel)', multiple: true, accept: 'image/*', display: formData.store_images ? `${formData.store_images.length} image(s)` : 'Télécharger' },
                      ] : [])
                    ].map(({ id, field, label, multiple, accept, display }) => (
                      <div key={id}>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
                        <input type="file" id={id} onChange={(e) => handleFileChange(e, field)} multiple={multiple} accept={accept} className="hidden" />
                        <label htmlFor={id} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-xl cursor-pointer transition-colors text-sm font-medium">
                          <Upload size={15} /> {display}
                        </label>
                      </div>
                    ))}
                  </div>

                  {errors.general && <p className="text-red-500 text-sm text-center">{errors.general}</p>}
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-3 pt-4">
                {step > 1 && (
                  <button type="button" onClick={prevStep} className="w-[25%] py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center">
                    <ArrowLeft size={18} />
                  </button>
                )}
                {step < 3 ? (
                  <button type="button" onClick={nextStep} className={`${step > 1 ? 'w-[75%]' : 'w-full'} py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2`}>
                    Suivant <ArrowRight size={18} />
                  </button>
                ) : (
                  <button type="submit" disabled={isSubmitting} className="w-[75%] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Inscription...' : "S'inscrire"}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalRegistration;