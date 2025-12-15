import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAvailability extends Document {
  date: string; // Format: YYYY-MM-DD
  slots: string[];
}

const AvailabilitySchema: Schema = new Schema({
  date: { type: String, required: true, unique: true },
  slots: [{ type: String }],
});

const Availability: Model<IAvailability> = mongoose.models.Availability || mongoose.model<IAvailability>('Availability', AvailabilitySchema);

export default Availability;

