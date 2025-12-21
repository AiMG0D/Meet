'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/Calendar';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import Image from 'next/image';
import { Check, Loader2, Clock, CalendarDays, User, ArrowRight, ArrowLeft } from 'lucide-react';

const LOGO_SRC = "/Q3xP7cQPlarTot0Pr5iUE5n7Gyg (4).avif";

const steps = [
  { id: 1, title: 'Välj datum', icon: CalendarDays },
  { id: 2, title: 'Välj tid', icon: Clock },
  { id: 3, title: 'Dina uppgifter', icon: User },
];

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>();
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [customerType, setCustomerType] = useState<'existing' | 'new' | null>(null);
  const [description, setDescription] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Swedish phone number validation
  const validateSwedishPhone = (phoneNumber: string): boolean => {
    // Remove all spaces, dashes, and parentheses
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Swedish mobile: starts with 07 and 10 digits total (e.g., 0701234567)
    const swedishMobile07 = /^07[0-9]{8}$/;
    
    // Swedish mobile: starts with 7 and 9 digits (without leading 0)
    const swedishMobile7 = /^7[0-9]{8}$/;
    
    // Swedish mobile with country code: +46 followed by 9 digits
    const swedishMobileIntl = /^\+467[0-9]{8}$/;
    
    // Swedish mobile with country code without plus: 467 followed by 8 digits
    const swedishMobileIntlNoPlus = /^467[0-9]{8}$/;
    
    return swedishMobile07.test(cleaned) || 
           swedishMobile7.test(cleaned) || 
           swedishMobileIntl.test(cleaned) ||
           swedishMobileIntlNoPlus.test(cleaned);
  };

  const formatSwedishPhone = (value: string): string => {
    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '');
    return cleaned;
  };

  useEffect(() => {
    if (date) {
      fetchSlots(date);
      setSelectedSlot(undefined);
    }
  }, [date]);

  const fetchSlots = async (selectedDate: Date) => {
    setLoadingSlots(true);
    try {
      const formatted = format(selectedDate, 'yyyy-MM-dd');
      const res = await fetch(`/api/availability?date=${formatted}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch (error) {
      console.error('Failed to fetch slots', error);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateSelect = (d: Date | undefined) => {
    setDate(d);
    if (d) {
      setCurrentStep(2);
    }
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const sendVerificationCode = async () => {
    if (!email || !email.includes('@')) {
      setError('Ange en giltig e-postadress');
      return;
    }
    
    setSendingCode(true);
    setError('');
    
    try {
      const res = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'send' }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Kunde inte skicka kod');
      }
      
      setIsCodeSent(true);
    } catch (err: any) {
      setError(err.message || 'Ett fel uppstod');
    } finally {
      setSendingCode(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setCodeError('Ange en 6-siffrig kod');
      return;
    }
    
    setVerifyingCode(true);
    setCodeError('');
    
    try {
      const res = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'verify', code: verificationCode }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Felaktig kod');
      }
      
      setIsEmailVerified(true);
      setCodeError('');
    } catch (err: any) {
      setCodeError(err.message || 'Felaktig kod');
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    
    if (!isEmailVerified) {
      setError('Du måste verifiera din e-post först');
      return;
    }
    
    if (!customerType) {
      setError('Välj om du är befintlig eller ny kund');
      return;
    }
    
    if (!validateSwedishPhone(phone)) {
      setPhoneError('Ange ett giltigt svenskt mobilnummer (t.ex. 0701234567 eller +46701234567)');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          customerType,
          description,
          date: date!.toISOString(),
          slot: selectedSlot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Bokningen misslyckades');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Ett fel uppstod');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setCurrentStep(1);
    setDate(undefined);
    setSelectedSlot(undefined);
    setName('');
    setEmail('');
    setPhone('');
    setCustomerType(null);
    setDescription('');
    setVerificationCode('');
    setIsEmailVerified(false);
    setIsCodeSent(false);
    setIsSuccess(false);
    setError('');
    setCodeError('');
    setPhoneError('');
  };

  // Success Screen
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-lg w-full text-center"
        >
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
            <Check className="w-12 h-12 text-emerald-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">Tack för din bokning!</h1>
          <p className="text-white/50 mb-8 text-lg leading-relaxed">
            En bekräftelse med möteslänk har skickats till<br />
            <span className="text-white font-medium">{email}</span>
          </p>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-white/40 text-sm mb-1">Datum</p>
                <p className="text-white font-medium">{date && format(date, 'd MMMM yyyy', { locale: sv })}</p>
              </div>
              <div>
                <p className="text-white/40 text-sm mb-1">Tid</p>
                <p className="text-white font-medium">{selectedSlot}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header with Logo - Top Left */}
      <header className="border-b border-white/5 h-16 md:h-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="relative w-16 h-16 md:w-40 md:h-40 -my-4 md:-my-10">
            <Image src={LOGO_SRC} alt="Logo" fill className="object-contain" priority />
          </div>
          <div className="text-right">
            <p className="text-white/30 text-sm">Mötesbokning</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Left Side - Info & Steps */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Boka ett<br />
                <span className="text-white/40">möte med oss</span>
              </h1>
              <p className="text-white/50 mb-12 text-lg">
                Välj ett datum och en tid som passar dig. Vi ser fram emot att träffa dig!
              </p>
              
              {/* Steps - Vertical on Desktop */}
              <div className="hidden lg:flex flex-col gap-3">
                {steps.map((step) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-white text-black' 
                          : isCompleted 
                            ? 'bg-white/10 text-white' 
                            : 'bg-white/5 text-white/30'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-black/10' : isCompleted ? 'bg-white/10' : 'bg-white/5'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider opacity-60">Steg {step.id}</p>
                        <p className="font-semibold">{step.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Steps - Horizontal on Mobile */}
              <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <React.Fragment key={step.id}>
                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          isActive 
                            ? 'bg-white text-black' 
                            : isCompleted 
                              ? 'bg-white/10 text-white' 
                              : 'bg-white/5 text-white/30'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                        <span className="font-medium text-sm hidden sm:block">{step.title}</span>
                      </div>
                      {index < steps.length - 1 && (
                        <ArrowRight className={`w-4 h-4 ${currentStep > step.id ? 'text-white/50' : 'text-white/10'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side - Content Card */}
          <div className="lg:col-span-8">
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-3xl p-8 md:p-12 min-h-[550px] relative">
              
              {/* Fixed Back Button */}
              {currentStep > 1 && (
                <button 
                  onClick={handleBack}
                  className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors z-10"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Tillbaka</span>
                </button>
              )}

              <AnimatePresence mode="wait">
                
                {/* Step 1: Calendar */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="h-full flex flex-col items-center justify-center"
                  >
                    <h2 className="text-2xl font-bold text-center mb-2">Välj ett datum</h2>
                    <p className="text-white/40 text-center mb-8">Klicka på ett datum för att fortsätta</p>
                    
                    <div className="w-full max-w-md">
                      <Calendar
                        selected={date}
                        onSelect={handleDateSelect}
                        disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Time Slots */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="pt-12"
                  >
                    <h2 className="text-2xl font-bold text-center mb-2">Välj en tid</h2>
                    <p className="text-white/40 text-center mb-2 capitalize">
                      {date && format(date, 'EEEE d MMMM', { locale: sv })}
                    </p>
                    <p className="text-white/20 text-center text-sm mb-10">Alla möten är 1 timme</p>

                    {loadingSlots ? (
                      <div className="flex justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-white/30" />
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10 max-w-md mx-auto">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-white/20" />
                        <p className="text-white/40 mb-4">Inga tillgängliga tider detta datum</p>
                        <button 
                          onClick={() => setCurrentStep(1)}
                          className="text-white underline underline-offset-4 hover:no-underline"
                        >
                          Välj ett annat datum
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
                        {slots.map((slot, index) => (
                          <motion.button
                            key={slot}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleSlotSelect(slot)}
                            className={`py-5 px-6 rounded-2xl text-xl font-semibold transition-all border ${
                              selectedSlot === slot
                                ? 'bg-white text-black border-white'
                                : 'bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/20'
                            }`}
                          >
                            {slot}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 3: Contact Form */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="max-w-md mx-auto pt-12"
                  >
                    <h2 className="text-2xl font-bold text-center mb-2">Dina uppgifter</h2>
                    <p className="text-white/40 text-center mb-6">
                      Fyll i dina uppgifter för att slutföra bokningen
                    </p>

                    {/* Selected Date & Time Summary */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/40 text-sm mb-1">Din valda tid</p>
                          <p className="text-white font-semibold">
                            {date && format(date, 'd MMMM', { locale: sv })} kl {selectedSlot}
                          </p>
                        </div>
                        <button 
                          onClick={() => setCurrentStep(1)}
                          className="text-white/40 hover:text-white text-sm px-3 py-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                        >
                          Ändra
                        </button>
                      </div>
                    </div>

                    {/* Scrollable form */}
                    <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      <form onSubmit={handleSubmit} className="space-y-4 pb-2">
                        {/* Full Name */}
                        <div>
                          <label className="block text-sm font-medium text-white/60 mb-2">Fullständigt namn</label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all"
                            placeholder="Ditt fullständiga namn"
                          />
                        </div>

                        {/* Email with Verification */}
                        <div>
                          <label className="block text-sm font-medium text-white/60 mb-2">
                            E-post
                            {isEmailVerified && (
                              <span className="ml-2 text-green-400">✓ Verifierad</span>
                            )}
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                setIsEmailVerified(false);
                                setIsCodeSent(false);
                              }}
                              disabled={isEmailVerified}
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all disabled:opacity-50"
                              placeholder="din@email.se"
                            />
                            {!isEmailVerified && !isCodeSent && (
                              <button
                                type="button"
                                onClick={sendVerificationCode}
                                disabled={sendingCode || !email}
                                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                              >
                                {sendingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Skicka'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Verification Code */}
                        {isCodeSent && !isEmailVerified && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                          >
                            <label className="block text-sm font-medium text-white/60 mb-2">Verifieringskod</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => {
                                  setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                  setCodeError('');
                                }}
                                className={`flex-1 bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none transition-all tracking-widest text-center font-mono ${
                                  codeError ? 'border-red-500/50' : 'border-white/10 focus:border-white/30'
                                }`}
                                placeholder="000000"
                                maxLength={6}
                              />
                              <button
                                type="button"
                                onClick={verifyCode}
                                disabled={verifyingCode || verificationCode.length !== 6}
                                className="px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                              >
                                {verifyingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              </button>
                            </div>
                            {codeError ? (
                              <p className="text-red-400 text-xs mt-2">{codeError}</p>
                            ) : (
                              <p className="text-white/30 text-xs mt-2">Kolla din inkorg för koden</p>
                            )}
                          </motion.div>
                        )}

                        {/* Phone Number */}
                        <div>
                          <label className="block text-sm font-medium text-white/60 mb-2">Mobilnummer</label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => {
                              setPhone(formatSwedishPhone(e.target.value));
                              setPhoneError('');
                            }}
                            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none transition-all ${
                              phoneError ? 'border-red-500/50' : 'border-white/10 focus:border-white/30'
                            }`}
                            placeholder="0701234567"
                          />
                          {phoneError && (
                            <p className="text-red-400 text-xs mt-2">{phoneError}</p>
                          )}
                          <p className="text-white/30 text-xs mt-1">Format: 07XXXXXXXX eller +467XXXXXXXX</p>
                        </div>

                        {/* Customer Type Toggle */}
                        <div>
                          <label className="block text-sm font-medium text-white/60 mb-2">Kundtyp</label>
                          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => setCustomerType('existing')}
                              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                                customerType === 'existing'
                                  ? 'bg-white text-black'
                                  : 'text-white/50 hover:text-white'
                              }`}
                            >
                              Befintlig kund
                            </button>
                            <button
                              type="button"
                              onClick={() => setCustomerType('new')}
                              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                                customerType === 'new'
                                  ? 'bg-white text-black'
                                  : 'text-white/50 hover:text-white'
                              }`}
                            >
                              Ny kund
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium text-white/60 mb-2">Beskriv ditt ärende</label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all resize-none"
                            placeholder="Beskriv kort vad du vill diskutera så vi kan förbereda oss inför mötet..."
                          />
                        </div>

                        {error && (
                          <div className="text-red-400 text-sm text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">
                            {error}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmitting || !isEmailVerified || !customerType}
                          className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Bekräfta Bokning'}
                        </button>
                      </form>
                    </div>

                    <style jsx global>{`
                      .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                      }
                      .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(255, 255, 255, 0.02);
                        border-radius: 3px;
                      }
                      .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 3px;
                      }
                      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(255, 255, 255, 0.2);
                      }
                    `}</style>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
