import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmailVerification extends Document {
  email: string;
  code: string;
  verified: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const EmailVerificationSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  code: { type: String, required: true },
  verified: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Auto-delete expired documents
EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailVerification: Model<IEmailVerification> = 
  mongoose.models.EmailVerification || 
  mongoose.model<IEmailVerification>('EmailVerification', EmailVerificationSchema);

export default EmailVerification;

