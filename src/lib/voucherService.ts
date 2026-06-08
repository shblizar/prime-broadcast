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
}

// Fallback vouchers if Firestore config is not provided
const FALLBACK_VOUCHERS: Voucher[] = [
  { code: 'DISKON10', discount: 10 },
  { code: 'PROMO20', discount: 20 },
  { code: 'PRIMEKREATOR', discount: 15 }
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
  if (cachedConfig) return cachedConfig;
  try {
    const res = await fetch('/firebase-config.json');
    if (res.ok) {
      const data = await res.json();
      const isConfigured = !!(data.apiKey && data.projectId);
      cachedConfig = {
        isConfigured,
        apiKey: data.apiKey || '',
        projectId: data.projectId || '',
        adminPassword: data.adminPassword || 'admin'
      };
      
      if (isConfigured) {
        // Initialize Firebase
        const apps = getApps();
        let app;
        if (apps.length === 0) {
          app = initializeApp({
            apiKey: data.apiKey,
            authDomain: data.authDomain,
            projectId: data.projectId,
            storageBucket: data.storageBucket,
            messagingSenderId: data.messagingSenderId,
            appId: data.appId
          });
        } else {
          app = getApp();
        }
        firestoreInstance = getFirestore(app);
      }
      return cachedConfig;
    }
  } catch (error) {
    console.warn("Could not load /firebase-config.json, falling back to local storage.", error);
  }

  // Pure fallback if file download failed
  cachedConfig = { isConfigured: false, adminPassword: 'admin' };
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
          discount: Number(data.discount || 0)
        });
      });
      return list;
    } catch (error) {
      console.error("Firestore fetch failed, using local storage fallback", error);
      return getLocalVouchers();
    }
  } else {
    return getLocalVouchers();
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
          discount: Number(data.discount || 0)
        };
      }
      return null;
    } catch (error) {
      console.error("Firestore get failed, checking local storage", error);
      const local = getLocalVouchers();
      return local.find(v => v.code.toUpperCase() === cleanCode) || null;
    }
  } else {
    const local = getLocalVouchers();
    return local.find(v => v.code.toUpperCase() === cleanCode) || null;
  }
}

// Add/Update a Voucher (Firestore or LocalStorage)
export async function addVoucher(code: string, discount: number): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) throw new Error("Kode kupon tidak boleh kosong");
  if (discount < 1 || discount > 100) throw new Error("Diskon harus berkisar antara 1 s/d 100%");

  const config = await getFirebaseConfig();
  if (config.isConfigured && firestoreInstance) {
    const voucherDocRef = doc(firestoreInstance, 'vouchers', cleanCode);
    await setDoc(voucherDocRef, {
      discount: discount,
      updatedAt: serverTimestamp()
    });
  } else {
    const local = getLocalVouchers();
    const existingIdx = local.findIndex(v => v.code === cleanCode);
    if (existingIdx >= 0) {
      local[existingIdx].discount = discount;
    } else {
      local.push({ code: cleanCode, discount });
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
