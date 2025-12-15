import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
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
      className="h-full"
    >
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Tillbaka
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-2 h-2 rounded-full bg-white/40"></div>
        <span className="text-[13px] font-medium text-white/40 uppercase tracking-wider">Steg 3</span>
      </div>

      <h3 className="text-2xl font-semibold text-white mb-2">Dina uppgifter</h3>
      <div className="flex items-center gap-3 text-white/40 text-sm mb-8">
        <span>{date.toLocaleDateString('sv-SE')}</span>
        <span className="w-1 h-1 rounded-full bg-white/20"></span>
        <span className="text-white font-medium">{slot}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[13px] font-medium text-white/50 mb-2 uppercase tracking-wider">Namn</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all"
            placeholder="Ditt fullständiga namn"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-white/50 mb-2 uppercase tracking-wider">E-post</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all"
            placeholder="din@email.se"
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center bg-red-500/10 py-3 rounded-2xl border border-red-500/20">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-white text-black font-semibold rounded-2xl hover:bg-white/90 transition-all flex justify-center items-center mt-4"
        >
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Bekräfta Bokning'}
        </button>
      </form>
    </motion.div>
  );
};
