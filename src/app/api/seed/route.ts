import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Availability from '@/models/Availability';

// This endpoint seeds the custom availability for specific dates
export async function GET() {
  try {
    await dbConnect();

    // Custom availability for December 16th, 2025 (tomorrow - special day)
    const customSlots = [
      {
        date: '2025-12-16',
        slots: ['16:00', '17:00']
      }
    ];

    for (const config of customSlots) {
      await Availability.findOneAndUpdate(
        { date: config.date },
        { date: config.date, slots: config.slots },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Custom availability seeded successfully',
      seeded: customSlots
    });
  } catch (error) {
    console.error('Seed API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
