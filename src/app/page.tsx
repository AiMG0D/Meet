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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
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
    setIsSuccess(false);
    setError('');
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
                    <p className="text-white/40 text-center mb-8">
                      Fyll i dina uppgifter för att slutföra bokningen
                    </p>

                    {/* Selected Date & Time Summary */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/40 text-sm mb-1">Din valda tid</p>
                          <p className="text-white font-semibold text-lg">
                            {date && format(date, 'd MMMM', { locale: sv })} kl {selectedSlot}
                          </p>
                        </div>
                        <button 
                          onClick={() => setCurrentStep(1)}
                          className="text-white/40 hover:text-white text-sm px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                        >
                          Ändra
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Namn</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all text-lg"
                          placeholder="Ditt fullständiga namn"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">E-post</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all text-lg"
                          placeholder="din@email.se"
                        />
                      </div>

                      {error && (
                        <div className="text-red-400 text-sm text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-5 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all flex justify-center items-center text-lg mt-6"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : 'Bekräfta Bokning'}
                      </button>
                    </form>
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
