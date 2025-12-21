import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import { sendEmailWithLogo, generateUserEmailHTML, generateAdminEmailHTML } from '@/lib/email';
import { createZoomMeeting } from '@/lib/zoom';
import { consumeEmailVerification } from '@/lib/verification';
import { startOfDay, endOfDay, format, parse } from 'date-fns';
import { sv } from 'date-fns/locale';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, customerType, description, date, slot } = body;

    if (!name || !email || !phone || !customerType || !date || !slot) {
      return NextResponse.json({ error: 'Alla obligatoriska fält måste fyllas i' }, { status: 400 });
    }

    // SERVER-SIDE EMAIL VERIFICATION CHECK
    // This ensures the email was verified and consumes the verification (one-time use)
    const emailVerified = consumeEmailVerification(email);
    if (!emailVerified) {
      console.log('Booking rejected - email not verified:', email);
      return NextResponse.json({ 
        error: 'E-posten har inte verifierats. Vänligen verifiera din e-post först.' 
      }, { status: 403 });
    }

    await dbConnect();

    const bookingDate = new Date(date);
    const normalizedDate = startOfDay(bookingDate);
    const start = startOfDay(bookingDate);
    const end = endOfDay(bookingDate);

    console.log('Creating booking:', { date, bookingDate, normalizedDate, slot, customerType });

    // Check if slot is already booked
    const existingBooking = await Booking.findOne({
      date: { $gte: start, $lte: end },
      slot: slot,
    });

    if (existingBooking) {
      console.log('Slot already booked:', existingBooking);
      return NextResponse.json({ error: 'Tiden är redan bokad' }, { status: 409 });
    }

    // Create meeting start time by combining date and slot
    const [hours, minutes] = slot.split(':').map(Number);
    const meetingStartTime = new Date(bookingDate);
    meetingStartTime.setHours(hours, minutes, 0, 0);

    // Generate real Zoom meeting link
    let zoomLink: string;
    try {
      const zoomMeeting = await createZoomMeeting(
        `Möte med ${name}`,
        meetingStartTime,
        60 // 1 hour duration
      );
      zoomLink = zoomMeeting.joinUrl;
      console.log('Zoom meeting created:', zoomMeeting);
    } catch (zoomError) {
      console.error('Failed to create Zoom meeting, using fallback:', zoomError);
      // Fallback to mock link if Zoom API fails
      const meetingId = Math.floor(1000000000 + Math.random() * 9000000000);
      const password = Math.random().toString(36).slice(-6);
      zoomLink = `https://zoom.us/j/${meetingId}?pwd=${password}`;
    }

    // Create Booking
    const newBooking = await Booking.create({
      name,
      email,
      phone,
      customerType,
      description: description || '',
      date: normalizedDate,
      slot,
      zoomLink,
    });

    console.log('Booking created:', newBooking);

    // Format date for email (Swedish)
    const formattedDate = format(bookingDate, 'EEEE d MMMM yyyy', { locale: sv });
    const customerTypeText = customerType === 'existing' ? 'Befintlig kund' : 'Ny kund';

    // Send Emails
    try {
      // User Confirmation
      await sendEmailWithLogo({
        to: email,
        subject: 'Bokningsbekräftelse - FusionIQX',
        html: generateUserEmailHTML(name, formattedDate, slot, zoomLink),
      });

      // Admin Notification
      await sendEmailWithLogo({
        to: 'mohamadalrayes65@gmail.com',
        subject: `Ny Bokning: ${name} (${customerTypeText}) - ${format(bookingDate, 'd MMM', { locale: sv })} kl ${slot}`,
        html: generateAdminEmailHTML(name, email, phone, customerTypeText, description, formattedDate, slot, zoomLink),
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (error) {
    console.error('Booking API Error:', error);
    return NextResponse.json({ error: 'Ett fel uppstod' }, { status: 500 });
  }
}
