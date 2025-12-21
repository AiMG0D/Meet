import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, Check, Send } from 'lucide-react';

interface BookingFormProps {
  date: Date;
  slot: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  date,
  slot,
  onSuccess,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [customerType, setCustomerType] = useState<'existing' | 'new' | null>(null);
  const [description, setDescription] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [error, setError] = useState('');

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
      setError('Ange en 6-siffrig kod');
      return;
    }
    
    setVerifyingCode(true);
    setError('');
    
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
    } catch (err: any) {
      setError(err.message || 'Ett fel uppstod');
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEmailVerified) {
      setError('Du måste verifiera din e-post först');
      return;
    }
    
    if (!customerType) {
      setError('Välj om du är befintlig eller ny kund');
      return;
    }
    
    setLoading(true);
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
          date: date.toISOString(),
          slot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Bokningen misslyckades');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Ett fel uppstod');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
    >
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Tillbaka
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-white/40"></div>
        <span className="text-[13px] font-medium text-white/40 uppercase tracking-wider">Steg 3</span>
      </div>

      <h3 className="text-2xl font-semibold text-white mb-2">Dina uppgifter</h3>
      <p className="text-white/50 text-sm mb-2">Fyll i dina uppgifter för att slutföra bokningen</p>
      
      <div className="flex items-center gap-3 text-white/40 text-sm mb-6">
        <span>{date.toLocaleDateString('sv-SE')}</span>
        <span className="w-1 h-1 rounded-full bg-white/20"></span>
        <span className="text-white font-medium">{slot}</span>
      </div>

      {/* Scrollable form container */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-4 pb-4">
          {/* Full Name */}
          <div>
            <label className="block text-[13px] font-medium text-white/50 mb-2 uppercase tracking-wider">
              Fullständigt namn
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all text-sm"
              placeholder="Ditt fullständiga namn"
            />
          </div>

          {/* Email with Verification */}
          <div>
            <label className="block text-[13px] font-medium text-white/50 mb-2 uppercase tracking-wider">
              E-post
              {isEmailVerified && (
                <span className="ml-2 text-green-400 normal-case">✓ Verifierad</span>
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
                className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all text-sm disabled:opacity-50"
                placeholder="din@email.se"
              />
              {!isEmailVerified && !isCodeSent && (
                <button
                  type="button"
                  onClick={sendVerificationCode}
                  disabled={sendingCode || !email}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {sendingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Verification Code Input */}
          <AnimatePresence>
            {isCodeSent && !isEmailVerified && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-[13px] font-medium text-white/50 mb-2 uppercase tracking-wider">
                  Verifieringskod
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all text-sm tracking-widest text-center font-mono"
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
                <p className="text-white/30 text-xs mt-2">Kolla din inkorg för koden</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phone Number */}
          <div>
            <label className="block text-[13px] font-medium text-white/50 mb-2 uppercase tracking-wider">
              Mobilnummer
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all text-sm"
              placeholder="+46 70 123 45 67"
            />
          </div>

          {/* Customer Type Toggle */}
          <div>
            <label className="block text-[13px] font-medium text-white/50 mb-3 uppercase tracking-wider">
              Kundtyp
            </label>
            <div className="flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
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
            <label className="block text-[13px] font-medium text-white/50 mb-2 uppercase tracking-wider">
              Beskriv ditt ärende
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all text-sm resize-none"
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
            disabled={loading || !isEmailVerified || !customerType}
            className="w-full py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Bekräfta Bokning'}
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
  );
};
