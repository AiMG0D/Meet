import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBooking extends Document {
  name: string;
  email: string;
  date: Date;
  slot: string;
  zoomLink: string;
  createdAt: Date;
}

const BookingSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: Date, required: true },
  slot: { type: String, required: true },
  zoomLink: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model recompilation error in development
const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;

