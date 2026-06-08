import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';

export interface Voucher {
  code: string;
  discount: number;
  packageId?: string; // e.g., "all", "lite", "regular", "gold", "platinum"
}

// Fallback vouchers if Firestore config is not provided
const FALLBACK_VOUCHERS: Voucher[] = [
  { code: 'DISKON10', discount: 10, packageId: 'all' },
  { code: 'PROMO20', discount: 20, packageId: 'all' },
  { code: 'PRIMEKREATOR', discount: 15, packageId: 'all' },
  { code: 'LEBIHHEMAT', discount: 5, packageId: 'lite' },
  { code: 'CUMA10HARILAGI', discount: 10, packageId: 'regular' },
  { code: 'PRIMECODE12', discount: 12, packageId: 'gold' },
  { code: '15BROADCASTEVENT', discount: 15, packageId: 'platinum' }
];

export interface FirebaseConfigStatus {
  isConfigured: boolean;
  apiKey?: string;
  projectId?: string;
  adminPassword?: string;
}

// Singleton state to keep track of loaded config
let cachedConfig: FirebaseConfigStatus | null = null;
let firestoreInstance: any = null;

// Helper to fetch the config dynamically from the public directory
export async function getFirebaseConfig(): Promise<FirebaseConfigStatus> {
  // Forced LocalStorage Mode permanently as requested
  cachedConfig = { isConfigured: false, adminPassword: '2808' };
  return cachedConfig;
}

// Retrieve from LocalStorage helper (with default seeding)
function getLocalVouchers(): Voucher[] {
  const stored = localStorage.getItem('pb_vouchers_database_v2');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  // Seed defaults first time
  localStorage.setItem('pb_vouchers_database_v2', JSON.stringify(FALLBACK_VOUCHERS));
  return FALLBACK_VOUCHERS;
}

function saveLocalVouchers(vouchers: Voucher[]) {
  localStorage.setItem('pb_vouchers_database_v2', JSON.stringify(vouchers));
}

// Fetch all coupons live (either Firestore or LocalStorage preview)
export async function fetchVouchers(): Promise<Voucher[]> {
  const config = await getFirebaseConfig();
  
  if (config.isConfigured && firestoreInstance) {
    try {
      const vouchersCol = collection(firestoreInstance, 'vouchers');
      const snapshot = await getDocs(vouchersCol);
      const list: Voucher[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        list.push({
          code: docSnapshot.id.toUpperCase(),
          discount: Number(data.discount || 0),
          packageId: data.packageId || 'all'
        });
      });
      return list;
    } catch (error) {
      console.error("Firestore fetch failed, using local storage fallback", error);
      return getLocalVouchers().map(v => ({ ...v, packageId: v.packageId || 'all' }));
    }
  } else {
    return getLocalVouchers().map(v => ({ ...v, packageId: v.packageId || 'all' }));
  }
}

// Validate a code and get its discount value
export async function validateVoucherCode(code: string): Promise<Voucher | null> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return null;

  const config = await getFirebaseConfig();
  if (config.isConfigured && firestoreInstance) {
    try {
      const voucherDocRef = doc(firestoreInstance, 'vouchers', cleanCode);
      const snap = await getDoc(voucherDocRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          code: cleanCode,
          discount: Number(data.discount || 0),
          packageId: data.packageId || 'all'
        };
      }
      return null;
    } catch (error) {
      console.error("Firestore get failed, checking local storage", error);
      const local = getLocalVouchers();
      const match = local.find(v => v.code.toUpperCase() === cleanCode);
      return match ? { ...match, packageId: match.packageId || 'all' } : null;
    }
  } else {
    const local = getLocalVouchers();
    const match = local.find(v => v.code.toUpperCase() === cleanCode);
    return match ? { ...match, packageId: match.packageId || 'all' } : null;
  }
}

// Add/Update a Voucher (Firestore or LocalStorage)
export async function addVoucher(code: string, discount: number, packageId: string = 'all'): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) throw new Error("Kode kupon tidak boleh kosong");
  if (discount < 1 || discount > 100) throw new Error("Diskon harus berkisar antara 1 s/d 100%");

  const config = await getFirebaseConfig();
  if (config.isConfigured && firestoreInstance) {
    try {
      const voucherDocRef = doc(firestoreInstance, 'vouchers', cleanCode);
      await setDoc(voucherDocRef, {
        discount: discount,
        packageId: packageId || 'all',
        updatedAt: serverTimestamp()
      });
      console.log(`[VoucherService] Successfully saved voucher ${cleanCode} to Firestore.`);
    } catch (error: any) {
      console.error("[VoucherService] Critical failure inserting voucher to Cloud Firestore:", error);
      throw new Error(
        `Firebase rejected saving voucher code. Detail: ${error?.message || error}. ` +
        `Hint: Pastikan Firestore rules Anda sudah dideploy, dan Database sudah berstatus 'Created' di Firebase console.`
      );
    }
  } else {
    const local = getLocalVouchers();
    const existingIdx = local.findIndex(v => v.code === cleanCode);
    if (existingIdx >= 0) {
      local[existingIdx].discount = discount;
      local[existingIdx].packageId = packageId || 'all';
    } else {
      local.push({ code: cleanCode, discount, packageId: packageId || 'all' });
    }
    saveLocalVouchers(local);
  }
}

// Delete a Voucher (Firestore or LocalStorage)
export async function deleteVoucher(code: string): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  const config = await getFirebaseConfig();
  if (config.isConfigured && firestoreInstance) {
    const voucherDocRef = doc(firestoreInstance, 'vouchers', cleanCode);
    await deleteDoc(voucherDocRef);
  } else {
    let local = getLocalVouchers();
    local = local.filter(v => v.code !== cleanCode);
    saveLocalVouchers(local);
  }
}
