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
    <div className="py-24 bg-black text-white text-left relative selection:bg-zinc-800 selection:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Quick Business Card Info */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-zinc-950 border border-zinc-900 p-8 rounded-xl">
            <div>
              <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-3">
                <Award className="w-3.5 h-3.5" />
                <span>Saluran Resmi</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-light tracking-tight mb-3 text-white">
                Hubungi Admin Kami
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed mb-8">
                Butuh tanya-tanya cepat tentang rundown, teknis streaming, atau proposal kerjasama? Hubungi dan salin kontak resmi Prime Broadcast berikut.
              </p>

              <div className="flex flex-col gap-3 mb-8">
                {contactOptions.map((opt) => (
                  <div key={opt.id} className="p-4 rounded-lg bg-black border border-zinc-900 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-600 block uppercase font-mono tracking-wider mb-1">
                        {opt.label}
                      </span>
                      <span className="text-xs sm:text-xs text-zinc-200 font-mono font-bold">
                        {opt.value}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(opt.copyValue, opt.id)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-855 hover:border-zinc-700 text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      {copiedText === opt.id ? (
                        <>
                          <Check className="w-3 h-3 text-zinc-405" />
                          <span className="text-zinc-405 text-[10px] font-mono">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-zinc-500" />
                          <span className="text-[10px] font-mono">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-900 text-xs text-zinc-500 flex items-start gap-3 leading-relaxed">
              <MapPin className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <div>
                <b className="text-zinc-400 block mb-1">Studio Pusat Penyiaran:</b>
                <span>Jakarta &amp; Tangerang, Indonesia (Area Layanan Jabodetabek, Jawa Barat &amp; Luar Kota dengan transportasi terpadu).</span>
              </div>
            </div>
          </div>

          {/* Interactive Direct Message Compiler */}
          <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 p-8 rounded-xl flex flex-col justify-between">
            
            <form onSubmit={handleQuickSubmit} className="flex flex-col gap-5">
              <div>
                <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-3">
                  <Sparkles className="w-3 h-3" />
                  <span>Konsultasi Instan</span>
                </div>
                <h3 className="text-lg font-display font-light tracking-tight text-white">
                  Kirim Pesan Langsung
                </h3>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  Ketik pertanyaan Anda di bawah ini untuk merumuskan draf pesan konsultasi WhatsApp otomatis.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Topik / Hal Pembahasan
                </label>
                <input
                  type="text"
                  required
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="Contoh: Livestreaming Konser Musik / Webinar Hybrid"
                  className="w-full bg-black border border-zinc-855 rounded-lg px-4 py-3 text-sm focus:border-zinc-550 focus:outline-none transition-colors text-zinc-200 placeholder:text-zinc-700 font-normal"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Isi Pertanyaan / Keinginan Teknis
                </label>
                <textarea
                  required
                  rows={4}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Contoh: Kami berencana mengadakan event seminar hybrid tanggal 20 depan. Apakah paket Regular sudah termasuk penyediaan laptop zoom untuk pembicara?"
                  className="w-full bg-black border border-zinc-855 rounded-lg px-4 py-3 text-sm focus:border-zinc-550 focus:outline-none transition-colors resize-none text-zinc-200 placeholder:text-zinc-700 font-normal"
                />
              </div>

              {sentSuccess && (
                <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-400 text-[11px] flex items-center gap-2 font-mono">
                  <Check className="w-4.5 h-4.5 text-zinc-405" />
                  <span>Draf disiapkan! Mengalihkan ke WhatsApp chat...</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-zinc-950 font-medium py-3.5 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95 text-xs uppercase tracking-wider"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Mulai Konsultasi (WhatsApp)</span>
              </button>
            </form>

            <span className="text-[10px] text-zinc-600 text-center block mt-6 font-mono">
              Operational Hours: Senin - Minggu (08:00 WIB - 20:59 WIB)
            </span>

          </div>

        </div>

      </div>
    </div>
  );
}
