import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert, 
  Trash2, 
  Plus, 
  Lock, 
  Unlock, 
  Settings, 
  User, 
  Sparkles, 
  Check, 
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface BookedSlot {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  clientName: string;
  isManual: boolean;
  packageType?: string;
  time?: string;
}

interface CalendarSectionProps {
  onSelectAvailableDate?: (date: string) => void;
  onViewChange?: (view: string) => void;
  initialAdminMode?: boolean;
}

// Initial dummy dates for demo (placed around typical events in June / July 2026)
const INITIAL_BOOKINGS: BookedSlot[] = [
  {
    id: 'PB-INV-20260612',
    date: '2026-06-12',
    title: 'Seminar Nasional Transformasi Digital UI/UX',
    clientName: 'Universitas Indonesia',
    isManual: false,
    packageType: 'Prime Regular',
    time: '09:00'
  },
  {
    id: 'PB-INV-MANUAL-01',
    date: '2026-06-18',
    title: 'Wedding Live Stream - Andi & Sisi',
    clientName: 'Andi Wijaya',
    isManual: true,
    packageType: 'Prime Ultimate (Custom)',
    time: '11:00'
  },
  {
    id: 'PB-INV-20260625',
    date: '2026-06-25',
    title: 'Corporate Town Hall Q2',
    clientName: 'PT Bank Central Indonesia',
    isManual: false,
    packageType: 'Prime Ultimate',
    time: '14:00'
  },
  {
    id: 'PB-INV-MANUAL-02',
    date: '2026-07-02',
    title: 'Product Launching & Press Conference',
    clientName: 'Wardah Cosmetics Corp',
    isManual: true,
    packageType: 'Prime Ultimate',
    time: '15:30'
  }
];

export default function CalendarSection({ onSelectAvailableDate, onViewChange, initialAdminMode = false }: CalendarSectionProps) {
  const [bookings, setBookings] = useState<BookedSlot[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 1)); // Default focused around June 2026 (Month 5)
  
  // Admin Mode states
  const [isAdminMode, setIsAdminMode] = useState<boolean>(initialAdminMode);
  const [adminPin, setAdminPin] = useState<string>('');
  const [isPinVerified, setIsPinVerified] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string>('');
  
  // Custom manual admin form booking
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualClient, setManualClient] = useState<string>('');
  const [manualDate, setManualDate] = useState<string>('');
  const [manualTime, setManualTime] = useState<string>('08:00');
  const [manualPkg, setManualPkg] = useState<string>('Prime Regular');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Selected cell detail
  const [cellDetail, setCellDetail] = useState<BookedSlot | null>(null);

  // Google Calendar state
  const [gcalStatus, setGcalStatus] = useState<{ connected: boolean; email?: string; name?: string }>({ connected: false });
  const [checkingGcal, setCheckingGcal] = useState(false);

  // Check Google Calendar connection status
  const checkCalendarStatus = async () => {
    setCheckingGcal(true);
    try {
      const res = await fetch('/api/calendar/status');
      if (res.ok) {
        const data = await res.json();
        setGcalStatus(data);
      }
    } catch (e) {
      console.error('Error checking Google Calendar status:', e);
    } finally {
      setCheckingGcal(false);
    }
  };

  // Google Calendar connect handler
  const handleConnectGoogle = async () => {
    try {
      const res = await fetch('/api/auth/url');
      if (res.ok) {
        const data = await res.json();
        // Popup-based Google Authorization Flow as instructed in system-oauth skill
        const authWindow = window.open(data.url, 'oauth_popup', 'width=600,height=700');
        if (!authWindow) {
          alert('Mohon izinkan pop-up browser untuk menyelesaikan otentikasi Google Calendar.');
        }
      }
    } catch (e) {
      console.error('Failed to initiate Google Calendar URL:', e);
    }
  };

  // Google Calendar disconnect handler
  const handleDisconnectGoogle = async () => {
    const confirmDis = window.confirm('Apakah Anda yakin ingin mematikan sinkronisasi dan memutuskan akun Google Calendar dari sistem?');
    if (!confirmDis) return;

    try {
      const res = await fetch('/api/calendar/disconnect', { method: 'POST' });
      if (res.ok) {
        setGcalStatus({ connected: false });
        alert('Koneksi Google Calendar berhasil diputus.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load bookings from server
  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
        localStorage.setItem('pb_booked_dates', JSON.stringify(data));
      } else {
        const stored = localStorage.getItem('pb_booked_dates');
        if (stored) {
          setBookings(JSON.parse(stored));
        } else {
          setBookings(INITIAL_BOOKINGS);
        }
      }
    } catch (e) {
      const stored = localStorage.getItem('pb_booked_dates');
      if (stored) setBookings(JSON.parse(stored));
    }
  };

  // Load from server or fallback to localStorage on mount
  useEffect(() => {
    fetchBookings();
    checkCalendarStatus();

    // Listen for OAuth completion from popup handler
    const handleOauthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        checkCalendarStatus();
      }
    };
    window.addEventListener('message', handleOauthMessage);

    // Set today or first day
    const formattedToday = '2026-06-06';
    setSelectedDateStr(formattedToday);
    
    return () => window.removeEventListener('message', handleOauthMessage);
  }, []);

  // Sync admin mode and auto-scroll if opened with admin-portal
  useEffect(() => {
    if (initialAdminMode) {
      setIsAdminMode(true);
      // Wait for layout to mount and scroll down to the Admin section smoothly
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' });
      }, 350);
    }
  }, [initialAdminMode]);

  // Sync state to localStorage whenever bookings change
  const saveBookings = (updated: BookedSlot[]) => {
    setBookings(updated);
    localStorage.setItem('pb_booked_dates', JSON.stringify(updated));
  };

  // Helper for actual date calculations
  const searchYear = currentDate.getFullYear();
  const searchMonth = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Grid Builder
  const daysInMonth = new Date(searchYear, searchMonth + 1, 0).getDate();
  const firstDayIndex = new Date(searchYear, searchMonth, 1).getDay(); // Sunday is 0, Monday is 1...
  
  // Convert firstDayIndex so that Monday is 0. If firstDayIndex is 0 (Sunday), make it 6.
  const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const prevMonthDays = new Date(searchYear, searchMonth, 0).getDate();

  const calendarCells = [];

  // 1. Previous Month Days
  for (let i = adjustedFirstDayIndex - 1; i >= 0; i--) {
    const dayNumeric = prevMonthDays - i;
    const prevMonth = searchMonth === 0 ? 11 : searchMonth - 1;
    const prevYear = searchMonth === 0 ? searchYear - 1 : searchYear;
    const dateStr = `${prevYear}-${(prevMonth + 1).toString().padStart(2, '0')}-${dayNumeric.toString().padStart(2, '0')}`;
    calendarCells.push({
      day: dayNumeric,
      isCurrentMonth: false,
      dateString: dateStr
    });
  }

  // 2. Current Month Days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${searchYear}-${(searchMonth + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
    calendarCells.push({
      day: i,
      isCurrentMonth: true,
      dateString: dateStr
    });
  }

  // 3. Next Month Days to complete 42 cell list (6 rows * 7 cols)
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonth = searchMonth === 11 ? 0 : searchMonth + 1;
    const nextYear = searchMonth === 11 ? searchYear + 1 : searchYear;
    const dateStr = `${nextYear}-${(nextMonth + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
    calendarCells.push({
      day: i,
      isCurrentMonth: false,
      dateString: dateStr
    });
  }

  // Find booking for a specific date
  const getBookingForDate = (dateStr: string) => {
    return bookings.find(b => b.date === dateStr);
  };

  // Select a specific calendar cell
  const handleCellClick = (cell: { day: number; isCurrentMonth: boolean; dateString: string }) => {
    setSelectedDateStr(cell.dateString);
    const booking = getBookingForDate(cell.dateString);
    setCellDetail(booking || null);

    // Auto-update standard manual date picker for admin's comfort
    if (isAdminMode) {
      setManualDate(cell.dateString);
    }
  };

  // Sync selected cell details when bookings update
  useEffect(() => {
    if (selectedDateStr) {
      const b = getBookingForDate(selectedDateStr);
      setCellDetail(b || null);
    }
  }, [bookings, selectedDateStr]);

  // Navigate to previous month
  const handlePrevMonth = () => {
    const prev = new Date(searchYear, searchMonth - 1, 1);
    setCurrentDate(prev);
  };

  // Navigate to next month
  const handleNextMonth = () => {
    const next = new Date(searchYear, searchMonth + 1, 1);
    setCurrentDate(next);
  };

  // Verify Admin PIN
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === '1234') {
      setIsPinVerified(true);
      setPinError('');
      setManualDate(selectedDateStr);
    } else {
      setPinError('PIN salah! Tips: Masukkan PIN "1234"');
    }
  };

  // Add a new manual booking (Admin)
  const handleAddManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDate || !manualTitle.trim() || !manualClient.trim()) {
      alert('Semua bidang isian wajib lengkap.');
      return;
    }

    // Check if slot already booked
    const alreadyBooked = bookings.some(b => b.date === manualDate);
    if (alreadyBooked) {
      alert(`Maaf, tanggal ${manualDate} sudah terisi.`);
      return;
    }

    try {
      const res = await fetch('/api/admin/bookings/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: manualDate,
          title: manualTitle,
          clientName: manualClient,
          packageType: manualPkg,
          time: manualTime
        })
      });
      if (res.ok) {
        fetchBookings();
        setSuccessMsg(`Berhasil menandai tanggal ${manualDate} sebagai BOOKED!`);
        setManualTitle('');
        setManualClient('');
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      console.error(err);
      // Fallback local save
      const newBooking: BookedSlot = {
        id: `PB-INV-MANUAL-${Math.floor(1000 + Math.random() * 9000)}`,
        date: manualDate,
        title: manualTitle,
        clientName: manualClient,
        isManual: true,
        packageType: manualPkg,
        time: manualTime
      };
      const updated = [...bookings, newBooking];
      saveBookings(updated);
    }
  };

  // Delete booking slot (Admin)
  const handleDeleteBooking = async (id: string) => {
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus jadwal booking ini?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
      const filtered = bookings.filter(b => b.id !== id);
      saveBookings(filtered);
    }
  };

  // Quick Single-Click toggle in Admin Mode
  const handleQuickToggleBooking = async (dateString: string) => {
    const existing = getBookingForDate(dateString);
    if (existing) {
      await handleDeleteBooking(existing.id);
    } else {
      try {
        const res = await fetch('/api/admin/bookings/manual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: dateString,
            title: 'Acara Ditandai Manual oleh Admin',
            clientName: 'Reservasi Admin',
            packageType: 'Prime Regular',
            time: '08:00'
          })
        });
        if (res.ok) {
          fetchBookings();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Format Date layout to Indonesian text (e.g. 15 Juni 2026)
  const formatIndoDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const y = parts[0];
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return `${d} ${monthNames[m]} ${y}`;
  };

  // Book from calendar CTA
  const handleRedirectToBooking = () => {
    if (onSelectAvailableDate) {
      onSelectAvailableDate(selectedDateStr);
    }
    if (onViewChange) {
      onViewChange('checkout'); // Redirect straight back to the checkout form with the selected date filled
    }
  };

  const currentMonthBookingsCount = bookings.filter(b => b.date.startsWith(`${searchYear}-${(searchMonth + 1).toString().padStart(2, '0')}`)).length;

  return (
    <div className="py-12 bg-slate-950 text-white text-left relative selection:bg-blue-600 selection:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button Link */}
        {onViewChange && (
          <div className="mb-6">
            <button
              onClick={() => onViewChange('checkout')}
              className="text-[10px] text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 px-4 py-2 rounded-xl border border-white/10 active:scale-95 cursor-pointer transition-all font-mono font-bold uppercase tracking-wider"
              title="Kembali ke layar form pemesanan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4 text-blue-400" />
              <span>Kembali Ke Form Pemesanan & Rincian</span>
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold font-mono tracking-widest text-[#aec6ff] bg-blue-600/10 px-3.5 py-1.5 rounded-full uppercase border border-blue-500/20">
            Ketersediaan Kru & Studio
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-black mt-3 bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
            Kalender Jadwal Reservasi
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-lg mx-auto leading-relaxed">
            Periksa tanggal ketersediaan tim teknisi Prime Broadcast. Tanggal yang ditandai merah sudah terisi sepenuhnya, sementara tanggal hijau masih terbuka untuk pendaftaran.
          </p>
        </div>

        {/* Calendar Core Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Complete Interactive Calendar Core */}
          <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border-white/10 flex flex-col gap-6">
            
            {/* Top Navigation Bar: Month & Year Picker */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-slate-100">
                    {monthNames[searchMonth]} {searchYear}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {currentMonthBookingsCount} Slot Terisi Bulan Ini
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handlePrevMonth}
                  className="p-2 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-xl cursor-pointer text-slate-300 hover:text-white transition-colors"
                  title="Bulan Sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-2 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-xl cursor-pointer text-slate-300 hover:text-white transition-colors"
                  title="Bulan Berikutnya"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Status Legend indicator */}
            <div className="flex flex-wrap gap-5 text-xs text-slate-400 font-mono bg-slate-900/40 px-4 py-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block border border-emerald-400/50"></span>
                <span>Tersedia & Kosong</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 block border border-red-500/50 animate-pulse"></span>
                <span>Sudah Dipesan (Booked)</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[10px] text-slate-500">Ubah bulan via tombol panah ↑</span>
              </div>
            </div>

            {/* Grid 7 Columns for Days of week headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              <div>Min</div>
              <div>Sen</div>
              <div>Sel</div>
              <div>Rab</div>
              <div>Kam</div>
              <div>Jum</div>
              <div>Sab</div>
            </div>

            {/* Calendar Cells Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center relative">
              {calendarCells.map((cell, idx) => {
                const booking = getBookingForDate(cell.dateString);
                const isSelected = selectedDateStr === cell.dateString;
                
                return (
                  <button
                    key={`${cell.dateString}-${idx}`}
                    onClick={() => handleCellClick(cell)}
                    className={`relative aspect-square sm:p-2 rounded-xl text-left flex flex-col justify-between border cursor-pointer group transition-all duration-300 ${
                      !cell.isCurrentMonth 
                        ? 'opacity-25 bg-slate-950/20 border-transparent text-slate-500 hover:opacity-50' 
                        : isSelected
                        ? 'bg-blue-600/25 border-blue-500 text-white shadow-lg ring-1 ring-blue-500/20'
                        : 'bg-white/[0.01] hover:bg-white/[0.03] border-white/5 text-slate-300'
                    }`}
                  >
                    {/* Grid Day number */}
                    <span className="text-xs sm:text-sm font-bold font-mono">
                      {cell.day}
                    </span>

                    {/* Booking indicator status */}
                    {booking ? (
                      <div className="flex items-center gap-1 mt-auto">
                        <span className="w-2 h-2 rounded-full bg-red-600 border border-red-400/60 block animate-pulse"></span>
                        <span className="hidden md:inline text-[9px] text-red-400 truncate max-w-[50px] font-mono uppercase font-bold">
                          Booked
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 mt-auto opacity-60 group-hover:opacity-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block"></span>
                        <span className="hidden md:inline text-[9px] text-emerald-500 font-mono uppercase">
                          Ready
                        </span>
                      </div>
                    )}

                    {/* Admin quick toggle tool overlay when verified */}
                    {isAdminMode && isPinVerified && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickToggleBooking(cell.dateString);
                        }}
                        className="absolute top-1 right-1 p-0.5 bg-slate-900 rounded-md border border-white/15 opacity-0 group-hover:opacity-100 hover:border-blue-400 transition-opacity"
                        title="Klik cepat untuk toggle booking status"
                      >
                        <Settings className="w-3 h-3 text-slate-400 hover:text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

          </div>

          {/* RIGHT SIDEBAR: Selected Date Context, Inquiry, and Mode Admin Controller */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* 1. SELECTION STATUS CARD */}
            <div className="glass-panel p-5 rounded-2xl border-white/10 text-left bg-slate-900/20">
              <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  Detail Tanggal Terpilih
                </span>
                <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded font-mono border border-white/5 text-slate-400">
                  {selectedDateStr}
                </span>
              </div>

              <h4 className="font-display font-black text-base text-slate-100 mb-2 leading-tight">
                {formatIndoDate(selectedDateStr)}
              </h4>

              {cellDetail ? (
                // Booked Slot State Description
                <div className="space-y-4 animate-in fade-in duration-300">
                  
                  {/* Warning Notice Banner */}
                  <div className="p-4 rounded-xl bg-red-950/10 border border-red-500/20 text-xs text-slate-300 space-y-1">
                    <div className="flex items-center gap-2 mb-1.5 text-red-400 font-black font-mono uppercase tracking-wider">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>Sesi Kebooking Penuh</span>
                    </div>
                    <p className="leading-relaxed">
                      Jadwal operasional tim streaming Prime Broadcast untuk slot tanggal ini <b>sudah dikonfirmasi / terisi penuh</b>.
                    </p>
                  </div>

                  {/* Booking Details Breakdown */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5 font-mono text-[11px] text-slate-400 space-y-2">
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span>Klien / Instansi:</span>
                      <span className="text-white font-bold">{cellDetail.clientName}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span>Jenis Acara:</span>
                      <span className="text-white text-right font-medium max-w-[130px] truncate" title={cellDetail.title}>
                        {cellDetail.title}
                      </span>
                    </div>
                    {cellDetail.time && (
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span>Jam Mulai:</span>
                        <span className="text-white">{cellDetail.time} WIB</span>
                      </div>
                    )}
                    {cellDetail.packageType && (
                      <div className="flex justify-between">
                        <span>Pilihan Paket:</span>
                        <span className="text-[#aec6ff] font-bold">{cellDetail.packageType}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    Butuh live darurat di tanggal yang sama? Hubungi Call Center kami untuk memeriksa apakah kami bisa mengerahkan armada tim bantuan regional cadangan kedua.
                  </p>

                  <button
                    onClick={() => {
                      const msg = `Halo Prime Broadcast, saya ingin menanyakan sela darurat untuk tanggal ${selectedDateStr} yang tertera Booked.`;
                      window.open(`https://wa.me/6285150555195?text=${encodeURIComponent(msg)}`, '_blank', 'noreferrer,noopener');
                    }}
                    className="w-full bg-slate-900 border border-white/10 hover:border-white/20 hover:bg-slate-800 text-xs font-bold text-slate-200 py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <span>Hubungi Tim Darurat (WA)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                </div>
              ) : (
                // Available Slot State Description & Action
                <div className="space-y-4 animate-in fade-in duration-300">
                  
                  {/* Available Notice Banner */}
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-300 space-y-1">
                    <div className="flex items-center gap-2 mb-1.5 text-emerald-400 font-mono uppercase font-bold tracking-wider">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>Tersedia / Kosong</span>
                    </div>
                    <p className="leading-relaxed">
                      Slot tanggal ini masih <b>kosong dan bebas dipesan</b>. Tim kru operasional broadcast andal kami siap mengawal siaran acara Anda.
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Pilih paket Anda sekarang melalui form kalkulator dan kirimkan invoice pendaftaran tertulis untuk langsung mengunci kuota tanggal ini otomatis secara sistem.
                  </p>

                  <button
                    onClick={handleRedirectToBooking}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-xs font-black text-white py-3.5 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Pesan Slot & Atur Paket</span>
                  </button>

                </div>
              )}
            </div>

            {/* 2. MODE ADMIN CARD */}
            <div className="glass-panel p-5 rounded-2xl border-white/5 text-left bg-slate-900/10">
              
              <div 
                onClick={() => setIsAdminMode(!isAdminMode)}
                className="flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-950 border border-white/10 text-slate-400 rounded-lg group-hover:text-amber-400">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 group-hover:text-white">
                      Mode Pengelola (Admin)
                    </h5>
                    <span className="text-[10px] text-slate-500 block">
                      Konfigurasi manual booked & kosong
                    </span>
                  </div>
                </div>
                
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded transition-all ${
                  isAdminMode 
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' 
                    : 'bg-slate-900 text-slate-500 border border-white/5'
                }`}>
                  {isAdminMode ? 'TERBUKA' : 'TUTUP'}
                </span>
              </div>

              {/* Collapsed Admin Controls */}
              {isAdminMode && (
                <div className="mt-5 border-t border-white/5 pt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  
                  {/* PIN VERIFICATION SCREEN if not verified */}
                  {!isPinVerified ? (
                    <form onSubmit={handlePinSubmit} className="space-y-3">
                      <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-lg border border-white/5">
                        Masukkan PIN otoritas pengelola untuk memanipulasi slot reservasi.
                        <b className="block text-slate-300 mt-1">Gunakan PIN default: 1234</b>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                          Masukkan PIN Keamanan
                        </label>
                        <div className="flex gap-2">
                          <input 
                            type="password"
                            placeholder="PIN Admin..."
                            value={adminPin}
                            onChange={(e) => setAdminPin(e.target.value)}
                            className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-center tracking-widest font-mono text-white"
                          />
                          <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 rounded-xl cursor-pointer active:scale-95 flex items-center justify-center"
                          >
                            Masuk
                          </button>
                        </div>
                        {pinError && (
                          <span className="text-[10px] text-red-400 block mt-1">{pinError}</span>
                        )}
                      </div>
                    </form>
                  ) : (
                    // VERIFIED ADMIN PANEL
                    <div className="space-y-4 font-sans">
                      
                      <div className="flex items-center gap-2 p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10 text-[10px] text-slate-400 font-mono">
                        <Unlock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Halo Admin! Anda dapat mengeklik tanggal di kalender atau menggunakan form di bawah.</span>
                      </div>

                      {/* Google Calendar Automated Sync Panel */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-3.5 text-xs">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="font-mono text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${gcalStatus.connected ? 'bg-green-500 live-pulse' : 'bg-red-500'}`}></span>
                            INTEGRASI GOOGLE CALENDAR
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">Auto-Refined by Gemini</span>
                        </div>

                        {gcalStatus.connected ? (
                          <div className="space-y-2">
                            <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-lg flex items-start gap-2.5">
                              <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <p className="text-white font-medium text-[11px]">Calendar Terhubung!</p>
                                <p className="text-slate-400 text-[10px] mt-0.5 font-mono truncate">{gcalStatus.email}</p>
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                              Setiap jadwal booking baru yang masuk dari website akan otomatis dikirim ke <b>Gemini AI Studio (gemini-3.5-flash)</b> untuk dirapikan format tanggal/jamnya, kemudian dimasukkan ke Google Calendar Anda secara otomatis.
                            </p>
                            <button
                              type="button"
                              onClick={handleDisconnectGoogle}
                              className="w-full py-2 bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 hover:border-red-500/30 text-red-400 font-bold text-[10px] uppercase font-mono rounded-lg cursor-pointer transition-colors"
                            >
                              Putuskan Koneksi Google Calendar
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                              <p className="text-slate-300 font-medium text-[11px]">Belum Sinkron</p>
                              <p className="text-slate-400 text-[10px] mt-1 leading-relaxed">
                                Fitur otomatisasi Google Calendar belum diaktifkan. Klik tombol di bawah untuk memberikan otorisasi aman.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleConnectGoogle}
                              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-[11px] uppercase tracking-wider rounded-lg cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Hubungkan Google Calendar</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Display Alert Message if any */}
                      {successMsg && (
                        <div className="p-3.5 bg-green-950/11 border border-green-500/20 rounded-xl text-green-400 text-xs font-medium">
                          {successMsg}
                        </div>
                      )}

                      {/* Form Add Manual Booking Entry */}
                      <form onSubmit={handleAddManualBooking} className="space-y-3.5 p-4 rounded-xl bg-slate-950 border border-white/5 text-xs">
                        <span className="block font-mono text-[10px] font-bold text-amber-500 uppercase tracking-widest border-b border-white/5 pb-1.5 mb-2">
                          Form Manual Booked Manual/Offline
                        </span>

                        <div className="space-y-2.5">
                          <div>
                            <label className="block text-[9px] text-slate-400 mb-1">Tanggal Terpilih</label>
                            <input 
                              type="date"
                              value={manualDate}
                              onChange={(e) => setManualDate(e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] text-slate-400 mb-1">Judul / Kegiatan Acara</label>
                            <input 
                              type="text"
                              value={manualTitle}
                              onChange={(e) => setManualTitle(e.target.value)}
                              placeholder="Contoh: Diskusi Panel & Podcast DPR"
                              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] text-slate-400 mb-1">Nama Klien / Instansi</label>
                              <input 
                                type="text"
                                value={manualClient}
                                onChange={(e) => setManualClient(e.target.value)}
                                placeholder="PT Maju Jaya"
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-slate-400 mb-1">Pilihan Paket Jasa</label>
                              <select 
                                value={manualPkg}
                                onChange={(e) => setManualPkg(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none text-slate-300"
                              >
                                <option value="Prime Regular">Prime Regular</option>
                                <option value="Prime Ultimate">Prime Ultimate</option>
                                <option value="Prime Custom">Kustom Instansi</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] text-slate-400 mb-1">Jam Start WIB</label>
                              <input 
                                type="time"
                                value={manualTime}
                                onChange={(e) => setManualTime(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Kunci Tanggal</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>

                      {/* Display Total Schedule Bookings Listing with Delete Action */}
                      <div className="space-y-2">
                        <span className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                          Semua Booking ({bookings.length})
                        </span>
                        
                        <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1 text-[11px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                          {bookings.map((b) => (
                            <div 
                              key={b.id} 
                              className="p-2.5 bg-slate-950 rounded-lg border border-white/5 flex items-center justify-between gap-2"
                            >
                              <div className="truncate flex-1">
                                <span className="text-[10px] text-blue-400 block font-bold font-mono">
                                  {b.date} {b.time ? `@ ${b.time}` : ''}
                                </span>
                                <span className="text-white block truncate text-[10px] font-semibold" title={b.title}>
                                  {b.title}
                                </span>
                                <span className="text-[9px] text-slate-500 block truncate">
                                  Klien: {b.clientName}
                                </span>
                              </div>
                              
                              <button
                                onClick={() => handleDeleteBooking(b.id)}
                                className="p-1.5 bg-slate-900 hover:bg-red-950/40 border border-white/5 hover:border-red-500/20 text-slate-500 hover:text-red-400 rounded-md cursor-pointer transition-colors shrink-0"
                                title="Bebaskan Tanggal (Hapus)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Log out / Quit Session */}
                      <button
                        onClick={() => {
                          setIsPinVerified(false);
                          setAdminPin('');
                        }}
                        className="w-full py-2 bg-slate-905 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 font-mono text-center rounded-lg border border-white/5 cursor-pointer"
                      >
                        Keluar Disk Sesi Admin
                      </button>

                    </div>
                  )}

                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
