'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { sv } from 'date-fns/locale';

interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
}

const WEEKDAYS = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

function Calendar({ selected, onSelect, disabled }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleSelectDate = (date: Date) => {
    if (disabled?.(date)) return;
    onSelect?.(date);
  };

  return (
    <div className="w-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white/70 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-white capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: sv })}
        </h2>
        <button
          onClick={handleNextMonth}
          className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white/70 hover:text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-3 border-b border-white/10 pb-3">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="text-center text-xs font-semibold text-white/40 uppercase tracking-wider"
          >
            {weekday}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((dayItem, index) => {
          const isCurrentMonth = isSameMonth(dayItem, currentMonth);
          const isSelected = selected && isSameDay(dayItem, selected);
          const isTodayDate = isToday(dayItem);
          const isDisabled = disabled?.(dayItem) || false;

          return (
            <button
              key={index}
              onClick={() => handleSelectDate(dayItem)}
              disabled={isDisabled}
              className={cn(
                'aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200',
                !isCurrentMonth && 'text-white/10',
                isCurrentMonth && !isSelected && !isDisabled && 'text-white/50 hover:text-white hover:bg-white/10',
                isTodayDate && !isSelected && 'ring-2 ring-inset ring-white/20 text-white',
                isSelected && 'bg-white text-black font-bold',
                isDisabled && 'text-white/5 cursor-not-allowed'
              )}
            >
              {format(dayItem, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { Calendar };
export type { CalendarProps };
