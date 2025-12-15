import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TimeSlotsProps {
  slots: string[];
  selectedSlot?: string;
  onSelect: (slot: string) => void;
  loading?: boolean;
}

export const TimeSlots: React.FC<TimeSlotsProps> = ({
  slots,
  selectedSlot,
  onSelect,
  loading,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="h-14 bg-white/5 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/5">
        <Clock className="w-8 h-8 mx-auto mb-4 text-white/20" />
        <p className="text-white/30 text-sm">Inga tider tillgängliga</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {slots.map((slot, index) => (
        <motion.button
          key={slot}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03, duration: 0.2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(slot)}
          className={cn(
            "py-4 px-6 rounded-2xl text-[15px] font-medium transition-all duration-200",
            "border",
            selectedSlot === slot
              ? "bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              : "bg-white/[0.03] text-white/70 border-white/[0.06] hover:bg-white/[0.06] hover:text-white hover:border-white/10"
          )}
        >
          {slot}
        </motion.button>
      ))}
    </div>
  );
};
