import * as Linking from 'expo-linking';
import * as Clipboard from 'expo-clipboard';

export interface UPITransactionParams {
  upiId: string;
  payeeName: string;
  amount: number;
  note: string;
}

/**
 * Constructs a standard NPCI / UPI deep-link URL
 */
export function buildUPILink({ upiId, payeeName, amount, note }: UPITransactionParams): string {
  const cleanUPI = upiId.trim();
  const cleanName = encodeURIComponent(payeeName.trim());
  const cleanNote = encodeURIComponent(note.trim());
  const cleanAmount = amount.toFixed(2);

  return `upi://pay?pa=${cleanUPI}&pn=${cleanName}&am=${cleanAmount}&cu=INR&tn=${cleanNote}`;
}

/**
 * Attempts to launch any installed UPI app natively
 */
export async function launchUPIApp(params: UPITransactionParams): Promise<boolean> {
  const url = buildUPILink(params);
  const canOpen = await Linking.canOpenURL(url);

  if (canOpen) {
    await Linking.openURL(url);
    return true;
  } else {
    // Attempt open anyway (standard on Android) or fallback
    try {
      await Linking.openURL(url);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Generates dynamic QR code URL for cross-platform fallback (iOS/Simulator/Desktop)
 */
export function getUPIQRCodeUrl(params: UPITransactionParams, size = 220): string {
  const upiUrl = buildUPILink(params);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(upiUrl)}`;
}

/**
 * Copies the UPI ID to clipboard
 */
export async function copyUPIId(upiId: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(upiId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates standard 12-digit Indian Bank UTR (Unique Transaction Reference)
 */
export function isValidUTR(utr: string): boolean {
  const cleaned = utr.trim();
  return /^[0-9]{12}$/.test(cleaned);
}
