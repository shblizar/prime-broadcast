import React, { useState } from 'react';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  Check, 
  Copy, 
  Send, 
  MessageSquare,
  Sparkles,
  Award
} from 'lucide-react';

export default function ContactSection() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const contactOptions = [
    { id: 'wa', label: 'WhatsApp Bisnis', value: '+62 851-5055-5195', copyValue: '6285150555195' },
    { id: 'email', label: 'E-mail Resmi', value: 'primebroadcast.id@gmail.com', copyValue: 'primebroadcast.id@gmail.com' },
    { id: 'agency', label: 'Instagram', value: '@primebroadcast_', copyValue: '@primebroadcast_' },
    { id: 'tiktok', label: 'TikTok', value: '@primebroadcast_', copyValue: '@primebroadcast_' }
  ];

  const handleCopy = (val: string, id: string) => {
    navigator.clipboard.writeText(val);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageBody.trim()) return;

    // Compose formatted text for Whatsapp
    const textMessage = `*HALO PRIME BROADCAST [KONSULTASI INSTAN]*\n• Perihal: ${messageSubject || 'Diskusi Event Livestream'}\n• Detail: ${messageBody}`;
    const enc = encodeURIComponent(textMessage);
    
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setMessageSubject('');
      setMessageBody('');
    }, 4000);

    window.open(`https://wa.me/6285150555195?text=${enc}`, '_blank', 'noreferrer,noopener');
  };

  return (
    <div className="py-12 bg-slate-950 text-white text-left relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Quick Business Card Info */}
          <div className="lg:col-span-5 flex flex-col justify-between glass-panel p-6 sm:p-8 rounded-2xl border-white/10">
            <div>
              <div className="flex items-center gap-2 text-blue-400 text-xs font-mono font-bold uppercase tracking-widest mb-3">
                <Award className="w-4 h-4" />
                <span>Saluran Resmi</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-black mb-2 text-white">
                Hubungi Admin Kami
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Butuh tanya-tanya cepat tentang rundown, teknis streaming, atau proposal kerjasama? Hubungi dan salin kontak resmi Prime Broadcast berikut.
              </p>

              <div className="flex flex-col gap-3.5 mb-6">
                {contactOptions.map((opt) => (
                  <div key={opt.id} className="p-3.5 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-tight">
                        {opt.label}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-200 font-bold font-mono">
                        {opt.value}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(opt.copyValue, opt.id)}
                      className="p-2 rounded-lg bg-white/[0.02] border border-white/15 hover:border-white/30 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      {copiedText === opt.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-green-400 text-[11px] font-mono">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 bg-slate-950/40 p-4 rounded-xl text-xs text-slate-400 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <b className="text-slate-300 block mb-0.5">Studio Pusat Penyiaran:</b>
                <span>Jakarta & Tangerang, Indonesia (Area Layanan Jabodetabek, Jawa Barat & Luar Kota dengan transportasi terpadu).</span>
              </div>
            </div>
          </div>

          {/* Interactive Direct Message Compiler */}
          <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-2xl border-white/10 flex flex-col justify-between">
            
            <form onSubmit={handleQuickSubmit} className="flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold uppercase tracking-widest mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Konsultasi Instan</span>
                </div>
                <h3 className="text-lg font-display font-bold text-white">
                  Kirim Pesan Langsung
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ketik pertanyaan Anda di bawah ini untuk merumuskan draf pesan konsultasi WhatsApp otomatis.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Topik / Hal Pembahasan
                </label>
                <input
                  type="text"
                  required
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="Contoh: Livestreaming Konser Musik / Webinar Hybrid"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Isi Pertanyaan / Keinginan Teknis
                </label>
                <textarea
                  required
                  rows={4}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Contoh: Kami berencana mengadakan event seminar hybrid tanggal 20 depan. Apakah paket Regular sudah termasuk penyediaan laptop zoom untuk pembicara jarak jauh?"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              {sentSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Draf disiapkan! Membuka WhatsApp chat agar Anda dapat kirim secara langsung...</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Mulai Konsultasi (WhatsApp)</span>
              </button>
            </form>

            <span className="text-[11px] text-slate-500 text-center block mt-4 font-mono">
              Operational Hours: Senin - Minggu (08:00 WIB - 20:59 WIB)
            </span>

          </div>

        </div>

      </div>
    </div>
  );
}
