// Shared verification state module
// In production, use Redis or database for persistence across instances

// Store for pending verification codes
export const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

// Store for verified emails (valid for 30 minutes after verification)
export const verifiedEmails = new Map<string, { verifiedAt: number; expiresAt: number }>();

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isEmailVerified(email: string): boolean {
  const emailLower = email.toLowerCase();
  const verified = verifiedEmails.get(emailLower);
  
  if (!verified) {
    return false;
  }
  
  // Check if verification has expired
  if (Date.now() > verified.expiresAt) {
    verifiedEmails.delete(emailLower);
    return false;
  }
  
  return true;
}

export function markEmailAsVerified(email: string): void {
  const emailLower = email.toLowerCase();
  verifiedEmails.set(emailLower, {
    verifiedAt: Date.now(),
    expiresAt: Date.now() + 30 * 60 * 1000, // Valid for 30 minutes
  });
}

export function consumeEmailVerification(email: string): boolean {
  const emailLower = email.toLowerCase();
  
  if (!isEmailVerified(emailLower)) {
    return false;
  }
  
  // Remove after use (one-time use)
  verifiedEmails.delete(emailLower);
  return true;
}

// Cleanup expired entries periodically (call this occasionally)
export function cleanupExpired(): void {
  const now = Date.now();
  
  for (const [email, data] of verificationCodes.entries()) {
    if (now > data.expiresAt) {
      verificationCodes.delete(email);
    }
  }
  
  for (const [email, data] of verifiedEmails.entries()) {
    if (now > data.expiresAt) {
      verifiedEmails.delete(email);
    }
  }
}

