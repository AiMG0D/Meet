import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Availability from '@/models/Availability';
import { startOfDay, endOfDay, format, parseISO } from 'date-fns';

// Default slots (09:00 - 16:00, 1h duration, 30m break)
const DEFAULT_SLOTS = ['09:00', '10:30', '12:00', '13:30', '15:00'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    await dbConnect();

    // Parse the date string (YYYY-MM-DD format)
    const date = parseISO(dateParam);
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Create date range for the entire day (to handle timezone issues)
    const start = startOfDay(date);
    const end = endOfDay(date);

    console.log('Checking availability for:', { dateParam, dateString, start, end });

    // Check for custom availability for this date
    const customAvailability = await Availability.findOne({ date: dateString });
    
    // Use custom slots if defined, otherwise use default
    const allSlots = customAvailability ? customAvailability.slots : DEFAULT_SLOTS;

    // Find bookings for the selected date
    const bookings = await Booking.find({
      date: {
        $gte: start,
        $lte: end,
      },
    });

    console.log('Found bookings:', bookings.map(b => ({ slot: b.slot, date: b.date })));

    const bookedSlots = bookings.map((b) => b.slot);

    // Filter out already booked slots
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    console.log('Available slots:', availableSlots, 'Booked slots:', bookedSlots);

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    console.error('Availability API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Set custom availability for a date
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, slots } = body;

    if (!date || !slots) {
      return NextResponse.json({ error: 'Date and slots are required' }, { status: 400 });
    }

    await dbConnect();

    // Upsert: Update if exists, create if not
    const result = await Availability.findOneAndUpdate(
      { date },
      { date, slots },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, availability: result });
  } catch (error) {
    console.error('Set Availability API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
