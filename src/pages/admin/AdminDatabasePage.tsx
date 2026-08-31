import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Database, AlertTriangle, CheckCircle, Terminal, Play, Clipboard, RefreshCw, Info, Lock, Eye } from 'lucide-react';
import { formatIDR } from '../../utils/currency';

interface DiagnosticResult {
  name: string;
  status: 'pending' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export const AdminDatabasePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM vouchers LIMIT 10;');
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [queryFields, setQueryFields] = useState<string[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Initialize an isolated anonymous client to test true public (anonymous) visitor experience
  const getAnonClient = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return null;
    return createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const runDiagnostics = async () => {
    setLoading(true);
    const diagResults: DiagnosticResult[] = [];

    // Test 1: Configuration check
    if (!isSupabaseConfigured) {
      setResults([{
        name: 'Supabase Configuration',
        status: 'error',
        message: 'Koneksi Supabase belum dikonfigurasi di file .env Anda.',
        details: 'Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY diatur dengan benar.'
      }]);
      setLoading(false);
      return;
    } else {
      diagResults.push({
        name: 'Supabase Configuration',
        status: 'success',
        message: 'Variabel lingkungan Supabase berhasil dideteksi.',
        details: `URL: ${import.meta.env.VITE_SUPABASE_URL}`
      });
    }

    // Test 2: Admin Auth Check
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        diagResults.push({
          name: 'Autentikasi Admin',
          status: 'warning',
          message: 'Gagal mendeteksi sesi admin aktif.',
          details: userError?.message || 'Sesi admin tidak terdeteksi.'
        });
      } else {
        diagResults.push({
          name: 'Autentikasi Admin',
          status: 'success',
          message: 'Berhasil terhubung sebagai Admin.',
          details: `Logged in: ${user.email}`
        });
      }
    } catch (e: any) {
      diagResults.push({
        name: 'Autentikasi Admin',
        status: 'error',
        message: 'Gagal mengambil data user.',
        details: e.message || String(e)
      });
    }

    // Test 3: Admin Vouchers Read
    try {
      const { data, error } = await supabase.from('vouchers').select('id, code, is_active').limit(5);
      if (error) {
        diagResults.push({
          name: 'Akses Admin ke Tabel Vouchers',
          status: 'error',
          message: 'Admin tidak dapat membaca tabel vouchers.',
          details: `Error: ${error.message} (Code: ${error.code})`
        });
      } else {
        diagResults.push({
          name: 'Akses Admin ke Tabel Vouchers',
          status: 'success',
          message: 'Admin berhasil membaca tabel vouchers.',
          details: `Ditemukan ${data?.length || 0} voucher dari database.`
        });
      }
    } catch (e: any) {
      diagResults.push({
        name: 'Akses Admin ke Tabel Vouchers',
        status: 'error',
        message: 'Terjadi kegagalan koneksi tabel.',
        details: e.message || String(e)
      });
    }

    // Test 4: Anonymous Vouchers Read (Simulates package page behavior)
    const anonClient = getAnonClient();
    if (!anonClient) {
      diagResults.push({
        name: 'Akses Publik (Anonymous) ke Tabel Vouchers',
        status: 'error',
        message: 'Gagal menginisialisasi klien pengunjung publik.',
        details: 'Kunci Anonim atau URL tidak valid.'
      });
    } else {
      try {
        const { data, error } = await anonClient.from('vouchers').select('id, code, is_active').limit(5);
        if (error) {
          diagResults.push({
            name: 'Akses Publik (Anonymous) ke Tabel Vouchers',
            status: 'error',
            message: 'Pengunjung publik diblokir oleh sistem RLS (database error).',
            details: `Error: ${error.message} (Code: ${error.code})`
          });
        } else if (!data || data.length === 0) {
          // Double check if there actually are active vouchers in the database
          const { count } = await supabase.from('vouchers').select('*', { count: 'exact', head: true });
          const totalInDb = count || 0;

          if (totalInDb > 0) {
            diagResults.push({
              name: 'Akses Publik (Anonymous) ke Tabel Vouchers',
              status: 'warning',
              message: 'RLS (Row Level Security) AKTIF & Memblokir Pengunjung Umum!',
              details: `Deteksi RLS: Database memiliki ${totalInDb} voucher, namun pengunjung publik menerima 0 data (kosong tanpa error). Silakan terapkan kebijakan SELECT public agar pembeli bisa mengklaim voucher di keranjang.`
            });
          } else {
            diagResults.push({
              name: 'Akses Publik (Anonymous) ke Tabel Vouchers',
              status: 'success',
              message: 'Koneksi publik terbuka, namun belum ada voucher yang terdaftar di database.',
              details: 'Tabel kosong.'
            });
          }
        } else {
          diagResults.push({
            name: 'Akses Publik (Anonymous) ke Tabel Vouchers',
            status: 'success',
            message: 'Akses Publik AMAN & TERBUKA.',
            details: `Berhasil membaca ${data.length} voucher secara publik. Pengguna dapat mengklaim voucher di keranjang belanja!`
          });
        }
      } catch (e: any) {
        diagResults.push({
          name: 'Akses Publik (Anonymous) ke Vouchers',
          status: 'error',
          message: 'Terjadi pengecualian saat kueri publik.',
          details: e.message || String(e)
        });
      }
    }

    setResults(diagResults);
    setLoading(false);
  };

  // Run database SELECT queries dynamically for the admin
  const runSqlQuery = async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    setQueryError(null);
    setQueryResult(null);
    setQueryFields([]);

    try {
      const queryLower = sqlQuery.trim().toLowerCase();
      
      // Parse table name from query for quick supabase syntax conversion
      // Supported: "select * from table", "select col, col from table"
      let tableName = '';
      const match = sqlQuery.match(/from\s+([a-zA-Z0-9_]+)/i);
      if (match && match[1]) {
        tableName = match[1].toLowerCase().trim();
      }

      if (!tableName) {
        setQueryError('Hanya query SELECT dengan format "FROM nama_tabel" yang didukung oleh simulator klien ini.');
        setLoading(false);
        return;
      }

      // We restrict writing queries directly via client API for safety
      if (queryLower.includes('insert') || queryLower.includes('update') || queryLower.includes('delete') || queryLower.includes('drop') || queryLower.includes('truncate') || queryLower.includes('alter')) {
        setQueryError('Untuk keamanan, simulator ini hanya mengizinkan query SELECT (Read-Only). Untuk operasi perubahan (DDL/DML), harap gunakan SQL Editor langsung di Dashboard Supabase.');
        setLoading(false);
        return;
      }

      // Call supabase using JS syntax parsed from query
      let selectFields = '*';
      const selectMatch = sqlQuery.match(/select\s+(.+?)\s+from/i);
      if (selectMatch && selectMatch[1]) {
        selectFields = selectMatch[1].trim();
      }

      let req = supabase.from(tableName).select(selectFields);

      // Parse LIMIT
      const limitMatch = sqlQuery.match(/limit\s+(\d+)/i);
      if (limitMatch && limitMatch[1]) {
        req = req.limit(parseInt(limitMatch[1], 10));
      } else {
        req = req.limit(50); // safety default limit
      }

      const { data, error } = await req;

      if (error) {
        setQueryError(`Supabase Error: ${error.message} (Code: ${error.code})`);
      } else if (data) {
        setQueryResult(data);
        if (data.length > 0) {
          setQueryFields(Object.keys(data[0]));
        }
      }
    } catch (e: any) {
      setQueryError(`Query Exception: ${e.message || String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const rlsFixSQL = `-- SILAKAN COPY & PASTE SCRIPT DI BAWAH INI KE "SQL EDITOR" DASHBOARD SUPABASE ANDA

-- 1. Pastikan RLS diaktifkan pada tabel vouchers
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- 2. Hapus policy lama jika ada untuk mencegah bentrokan
DROP POLICY IF EXISTS "Allow public read access for vouchers" ON vouchers;
DROP POLICY IF EXISTS "Allow public read" ON vouchers;

-- 3. Izinkan semua pengunjung (bahkan yang tidak login) untuk mencari/baca voucher
CREATE POLICY "Allow public read access for vouchers" 
ON vouchers 
FOR SELECT 
TO public
USING (is_active = true);`;

  return (
    <div className="space-y-8" id="db-diagnostics-root">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#081A2E] flex items-center gap-2.5">
            <Database className="w-6 h-6 text-[#A40D35]" />
            Database & RLS Diagnostics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Uji koneksi Supabase Anda, selidiki kebijakan Row Level Security (RLS), dan jalankan query database secara langsung.
          </p>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#081A2E] text-white hover:bg-[#1b2b3f] text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Jalankan Ulang Diagnostik
        </button>
      </div>

      {/* Grid of Diagnostics and SQL Playbook */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Diagnostics status (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-sm font-bold text-[#081A2E] mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500" />
              Hasil Pemeriksaan Keamanan & Koneksi
            </h2>

            <div className="space-y-4">
              {results.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Sedang menjalankan diagnostik...
                </div>
              ) : (
                results.map((r, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border flex gap-3.5 items-start ${
                      r.status === 'success'
                        ? 'bg-emerald-50/50 border-emerald-100/80 text-emerald-900'
                        : r.status === 'warning'
                        ? 'bg-amber-50/50 border-amber-100/80 text-amber-900'
                        : 'bg-rose-50/50 border-rose-100/80 text-rose-900'
                    }`}
                  >
                    {r.status === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
                    {r.status === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
                    {r.status === 'error' && <Lock className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />}

                    <div className="space-y-1">
                      <h3 className="text-xs font-bold">{r.name}</h3>
                      <p className="text-[11px] leading-relaxed opacity-90 font-medium">{r.message}</p>
                      {r.details && (
                        <p className="text-[10px] font-mono bg-white/60 p-2 rounded border border-black/5 mt-2 overflow-x-auto whitespace-pre-wrap max-w-full">
                          {r.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Database SQL Simulator */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#081A2E] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-500" />
                SQL Query Inspector (Read-Only)
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Jalankan kueri data langsung untuk memastikan isi tabel Anda sudah sinkron.
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative font-mono text-xs">
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="w-full h-24 p-3.5 bg-slate-900 text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A40D35]/50 border-0 leading-relaxed font-mono resize-none"
                  placeholder="Ketik query SELECT Anda di sini..."
                />
                <button
                  onClick={runSqlQuery}
                  disabled={loading || !isSupabaseConfigured}
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A40D35] hover:bg-[#850B2B] text-white text-[11px] font-bold transition-all shadow cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3 h-3" />
                  Jalankan
                </button>
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSqlQuery('SELECT * FROM vouchers LIMIT 10;')}
                  className="px-2.5 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
                >
                  Lihat Vouchers
                </button>
                <button
                  onClick={() => setSqlQuery('SELECT id, name, price, is_active FROM packages LIMIT 10;')}
                  className="px-2.5 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
                >
                  Lihat Paket
                </button>
                <button
                  onClick={() => setSqlQuery('SELECT id, customer_name, total_amount, status FROM orders LIMIT 5;')}
                  className="px-2.5 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
                >
                  Lihat Pesanan Terbaru
                </button>
              </div>

              {/* Query Error Area */}
              {queryError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-[11px] text-rose-700 font-mono">
                  {queryError}
                </div>
              )}

              {/* Query Result Table */}
              {queryResult && (
                <div className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50">
                  <div className="px-4 py-2 bg-slate-100/80 border-b border-slate-150 flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                    <span>Hasil Query ({queryResult.length} baris)</span>
                    <button
                      onClick={() => handleCopy(JSON.stringify(queryResult, null, 2), 'json_result')}
                      className="hover:text-[#081A2E] flex items-center gap-1"
                    >
                      <Clipboard className="w-3 h-3" />
                      {copiedText === 'json_result' ? 'Tersalin!' : 'Salin JSON'}
                    </button>
                  </div>
                  {queryResult.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-[11px]">
                      Query berhasil dijalankan, namun tidak mengembalikan baris data apa pun (tabel kosong).
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-60 text-[11px]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white border-b border-slate-150">
                            {queryFields.map((field) => (
                              <th key={field} className="px-3 py-2 font-bold text-[#081A2E] border-r border-slate-100 last:border-0 whitespace-nowrap">
                                {field}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {queryResult.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 font-mono text-[10px]">
                              {queryFields.map((field) => {
                                const val = row[field];
                                return (
                                  <td key={field} className="px-3 py-1.5 text-slate-700 border-r border-slate-100 last:border-0 max-w-xs truncate">
                                    {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '')}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: SQL Fixing Playbook (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#081A2E] text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-start gap-3 border-b border-white/10 pb-4">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
                  Cara Memperbaiki RLS
                </h2>
                <h3 className="text-sm font-black text-white mt-0.5">
                  Supabase RLS Policy Quick-Fix
                </h3>
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-slate-300">
              Supabase secara otomatis mengaktifkan <strong>Row Level Security (RLS)</strong> demi keamanan data. 
              Meskipun data voucher Anda terlihat di halaman Admin (karena Anda login dengan sesi Administrator), 
              pengunjung umum di website publik akan diblokir oleh RLS sehingga query voucher selalu menghasilkan kosong.
            </p>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-semibold">
                <span>SQL SCRIPT UNTUK SUPABASE SQL EDITOR</span>
                <button
                  onClick={() => handleCopy(rlsFixSQL, 'rls_fix')}
                  className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-[#A40D35]"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  {copiedText === 'rls_fix' ? 'Tersalin ke Clipboard!' : 'Salin Code'}
                </button>
              </div>

              <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[10px] leading-relaxed rounded-xl border border-white/10 overflow-x-auto select-all max-h-48">
                {rlsFixSQL}
              </pre>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Info className="w-3.5 h-3.5 text-[#A40D35]" />
                Langkah Eksekusi:
              </div>
              <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed text-slate-300">
                <li>Buka dashboard proyek Anda di <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-amber-400 underline hover:text-amber-300 font-bold">supabase.com</a></li>
                <li>Klik menu <strong>SQL Editor</strong> di sidebar sebelah kiri (ikon <Terminal className="w-3 h-3 inline" />).</li>
                <li>Klik tombol <strong>+ New query</strong> di bagian atas.</li>
                <li>Tempel (Paste) kode SQL di atas ke dalam kolom editor.</li>
                <li>Klik tombol <strong>Run</strong> (atau tekan <kbd className="bg-slate-800 text-xs px-1 rounded">Cmd + Enter</kbd> / <kbd className="bg-slate-800 text-xs px-1 rounded">Ctrl + Enter</kbd>).</li>
                <li>Selesai! Buka tab baru, bersihkan cache jika perlu, dan coba klaim kode voucher Anda di keranjang!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
