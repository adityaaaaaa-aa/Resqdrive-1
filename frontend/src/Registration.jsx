import React, { useState } from 'react';
import { Shield, Car, HeartPulse, Phone, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Registration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    licensePlate: '',
    vehicleMakeModel: '',
    bloodGroup: '',
    medicalConditions: '',
    allergies: '',
    primaryContactName: '',
    primaryContactRelation: '',
    primaryContactPhone: '',
    secondaryContactName: '',
    secondaryContactRelation: '',
    secondaryContactPhone: '',
    consent: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const phoneRegex = /^\d{10}$/; // Basic 10 digit validation, adjust as needed

    // Section 1 Validation
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.dob) newErrors.dob = 'Date of Birth is required';
    if (!formData.licensePlate.trim()) newErrors.licensePlate = 'License Plate is required';
    if (!formData.vehicleMakeModel.trim()) newErrors.vehicleMakeModel = 'Vehicle Make & Model is required';

    // Section 2 Validation
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood Group is required';

    // Section 3 Validation
    if (!formData.primaryContactName.trim()) newErrors.primaryContactName = 'Primary Contact Name is required';
    if (!formData.primaryContactRelation) newErrors.primaryContactRelation = 'Relationship is required';
    if (!formData.primaryContactPhone) {
        newErrors.primaryContactPhone = 'Phone Number is required';
    } else if (!phoneRegex.test(formData.primaryContactPhone.replace(/\D/g, ''))) {
         newErrors.primaryContactPhone = 'Invalid phone number format';
    }

    if (formData.secondaryContactPhone && !phoneRegex.test(formData.secondaryContactPhone.replace(/\D/g, ''))) {
        newErrors.secondaryContactPhone = 'Invalid phone number format';
    }

    // Section 4 Validation
    if (!formData.consent) newErrors.consent = 'You must provide consent to register';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
        const firstErrorTrigger = document.querySelector('.border-red-500');
        if (firstErrorTrigger) {
             firstErrorTrigger.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Form Data to Send:', formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const inputClass = "w-full bg-[#1A1A24] border border-[#333344] text-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00FFAA] focus:border-transparent transition-all duration-300 placeholder-gray-500";
  const errorInputClass = "w-full bg-[#1A1A24] border border-red-500 text-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 placeholder-gray-500";
  const labelClass = "block text-sm font-medium text-gray-400 mb-2";

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0D0D14] text-gray-900 dark:text-gray-100 font-sans selection:bg-[#00FFAA] selection:text-[#0D0D14] p-4 md:p-8 transition-colors duration-300">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#00FFAA]/5 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#0088FF]/5 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
            <div>
                <button onClick={() => navigate('/')} className="flex items-center text-gray-400 hover:text-[#00FFAA] transition-colors mb-4 group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                </button>
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-8 h-8 text-[#00FFAA]" />
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
                    Resqdrive Registry
                    </h1>
                </div>
                <p className="text-gray-400 text-lg">One-Time Driver Emergency Profile Setup</p>
            </div>
            
        </div>

        {isSubmitted ? (
             <div className="bg-white/80 dark:bg-[#1A1A24]/80 backdrop-blur-md rounded-2xl border border-gray-300 dark:border-[#00FFAA]/30 p-12 text-center transform transition-all animate-in fade-in zoom-in duration-500 shadow-sm dark:shadow-none">
                <div className="w-20 h-20 bg-[#00FFAA]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,255,170,0.2)]">
                    <CheckCircle className="w-10 h-10 text-[#00FFAA]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 tracking-wider">REGISTRATION SUCCESSFUL</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto font-mono text-sm leading-relaxed">
                    Thank you for registering. Your emergency profile and static medical telemetry have been securely saved.
                </p>
                <button 
                    onClick={() => navigate('/')}
                    className="bg-gradient-to-r from-[#00FFAA] to-[#00CC88] text-[#0D0D14] font-bold py-3 px-8 rounded-lg hover:shadow-[0_0_20px_rgba(0,255,170,0.4)] transition-all duration-300 font-mono tracking-widest uppercase"
                >
                    &lt; RETURN TO LOGIN
                </button>
             </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Personal & Vehicle Details */}
            <div className="bg-white/60 dark:bg-[#1A1A24]/60 backdrop-blur-sm rounded-2xl border border-gray-300 dark:border-[#333344] p-6 md:p-8 hover:border-gray-400 dark:hover:border-[#444455] transition-colors">
                <div className="flex items-center gap-3 mb-6 border-b border-[#333344] pb-4">
                <Car className="w-6 h-6 text-[#0088FF]" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Personal & Vehicle Details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClass}>Full Legal Name</label>
                    <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={errors.fullName ? errorInputClass : inputClass}
                    placeholder="John Doe"
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>
                <div>
                    <label className={labelClass}>Date of Birth</label>
                    <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className={errors.dob ? errorInputClass : inputClass}
                    style={{ colorScheme: 'dark' }}
                    />
                    {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                </div>
                <div>
                    <label className={labelClass}>License Plate / Registration</label>
                    <input
                    type="text"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleChange}
                    className={errors.licensePlate ? errorInputClass : inputClass}
                    placeholder="XYZ-1234"
                    />
                    {errors.licensePlate && <p className="text-red-500 text-xs mt-1">{errors.licensePlate}</p>}
                </div>
                <div>
                    <label className={labelClass}>Vehicle Make & Model</label>
                    <input
                    type="text"
                    name="vehicleMakeModel"
                    value={formData.vehicleMakeModel}
                    onChange={handleChange}
                    className={errors.vehicleMakeModel ? errorInputClass : inputClass}
                    placeholder="e.g., Tesla Model 3, 2023"
                    />
                    {errors.vehicleMakeModel && <p className="text-red-500 text-xs mt-1">{errors.vehicleMakeModel}</p>}
                </div>
                </div>
            </div>

            {/* Section 2: Critical Health Information */}
            <div className="bg-white/60 dark:bg-[#1A1A24]/60 backdrop-blur-sm rounded-2xl border border-gray-300 dark:border-[#333344] p-6 md:p-8 hover:border-gray-400 dark:hover:border-[#444455] transition-colors">
                <div className="flex items-center gap-3 mb-6 border-b border-[#333344] pb-4">
                <HeartPulse className="w-6 h-6 text-[#FF3366]" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Critical Health Information</h2>
                </div>

                <div className="space-y-6">
                <div className="w-full md:w-1/2">
                    <label className={labelClass}>Blood Group</label>
                    <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className={errors.bloodGroup ? errorInputClass : inputClass}
                    >
                    <option value="" disabled>Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    </select>
                    {errors.bloodGroup && <p className="text-red-500 text-xs mt-1">{errors.bloodGroup}</p>}
                </div>
                
                <div>
                    <label className={labelClass}>Pre-existing Medical Conditions (Optional)</label>
                    <textarea
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleChange}
                    className={`${inputClass} min-h-[100px] resize-y`}
                    placeholder="Details like diabetes, asthma, heart conditions..."
                    />
                </div>

                <div>
                    <label className={labelClass}>Allergies (Optional)</label>
                    <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    className={`${inputClass} min-h-[100px] resize-y`}
                    placeholder="Specifically medication allergies (e.g., Penicillin)..."
                    />
                </div>
                </div>
            </div>

            {/* Section 3: Emergency Contacts */}
            <div className="bg-white/60 dark:bg-[#1A1A24]/60 backdrop-blur-sm rounded-2xl border border-gray-300 dark:border-[#333344] p-6 md:p-8 hover:border-gray-400 dark:hover:border-[#444455] transition-colors">
                <div className="flex items-center gap-3 mb-6 border-b border-[#333344] pb-4">
                <Phone className="w-6 h-6 text-[#00FFAA]" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Emergency Contacts</h2>
                </div>

                <div className="space-y-8">
                {/* Primary Contact */}
                <div>
                    <h3 className="text-[#00FFAA] text-sm font-medium mb-4 uppercase tracking-wider">Primary Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className={labelClass}>Name</label>
                        <input
                        type="text"
                        name="primaryContactName"
                        value={formData.primaryContactName}
                        onChange={handleChange}
                        className={errors.primaryContactName ? errorInputClass : inputClass}
                        placeholder="Jane Doe"
                        />
                        {errors.primaryContactName && <p className="text-red-500 text-xs mt-1">{errors.primaryContactName}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Relationship</label>
                        <select
                        name="primaryContactRelation"
                        value={formData.primaryContactRelation}
                        onChange={handleChange}
                        className={errors.primaryContactRelation ? errorInputClass : inputClass}
                        >
                        <option value="" disabled>Select Relationship</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Parent">Parent</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Child">Child</option>
                        <option value="Friend">Friend</option>
                        <option value="Other">Other</option>
                        </select>
                        {errors.primaryContactRelation && <p className="text-red-500 text-xs mt-1">{errors.primaryContactRelation}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Phone Number</label>
                        <input
                        type="tel"
                        name="primaryContactPhone"
                        value={formData.primaryContactPhone}
                        onChange={handleChange}
                        className={errors.primaryContactPhone ? errorInputClass : inputClass}
                        placeholder="+1 (555) 000-0000"
                        />
                        {errors.primaryContactPhone && <p className="text-red-500 text-xs mt-1">{errors.primaryContactPhone}</p>}
                    </div>
                    </div>
                </div>

                {/* Secondary Contact */}
                <div>
                    <h3 className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">Secondary Contact (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className={labelClass}>Name</label>
                        <input
                        type="text"
                        name="secondaryContactName"
                        value={formData.secondaryContactName}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Bob Smith"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Relationship</label>
                        <select
                        name="secondaryContactRelation"
                        value={formData.secondaryContactRelation}
                        onChange={handleChange}
                        className={inputClass}
                        >
                        <option value="" disabled>Select Relationship</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Parent">Parent</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Child">Child</option>
                        <option value="Friend">Friend</option>
                        <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Phone Number</label>
                        <input
                        type="tel"
                        name="secondaryContactPhone"
                        value={formData.secondaryContactPhone}
                        onChange={handleChange}
                        className={errors.secondaryContactPhone ? errorInputClass : inputClass}
                        placeholder="+1 (555) 111-1111"
                        />
                        {errors.secondaryContactPhone && <p className="text-red-500 text-xs mt-1">{errors.secondaryContactPhone}</p>}
                    </div>
                    </div>
                </div>
                </div>
            </div>

            {/* Section 4: Consent & Security */}
            <div className={`bg-white/60 dark:bg-[#1A1A24]/60 backdrop-blur-sm rounded-2xl border ${errors.consent ? 'border-red-500' : 'border-gray-300 dark:border-[#333344]'} p-6 md:p-8 transition-colors`}>
                <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-1">
                    <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    className="peer sr-only"
                    />
                    <div className={`w-6 h-6 rounded border-2 ${errors.consent ? 'border-red-500 bg-red-500/10' : 'border-gray-500 bg-transparent'} peer-checked:bg-[#00FFAA] peer-checked:border-[#00FFAA] transition-all flex items-center justify-center`}>
                        <CheckCircle className="w-4 h-4 text-[#0D0D14] opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                </div>
                <div className="flex-1">
                    <p className={`text-sm md:text-base ${errors.consent ? 'text-red-400' : 'text-gray-300'} leading-relaxed group-hover:text-white transition-colors`}>
                    I authorize this system to share my medical and contact information with verified emergency responders and ambulance drivers exclusively in the event of a detected accident.
                    </p>
                </div>
                </label>
            </div>



            {/* Submit Button */}
            <div className="flex justify-end pt-4">
                <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto bg-gradient-to-r from-[#00FFAA] to-[#00CC88] text-[#0D0D14] font-bold py-4 px-10 rounded-xl hover:shadow-[0_0_20px_rgba(0,255,170,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 transition-all duration-300 md:text-lg flex items-center justify-center gap-2"
                >
                {isSubmitting ? (
                    <>
                    <div className="w-5 h-5 border-2 border-[#0D0D14] border-t-transparent rounded-full animate-spin"></div>
                    Registering Profile...
                    </>
                ) : (
                    'Register Emergency Profile'
                )}
                </button>
            </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default Registration;
