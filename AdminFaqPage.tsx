import React, { useEffect, useState } from 'react';
import {
  getAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
} from '../../services/api';
import { FaqItem } from '../../types';
import { Plus, Edit2, Trash2, HelpCircle } from 'lucide-react';

export const AdminFaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fields
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllFaqs();
      setFaqs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setQuestion('');
    setAnswer('');
    setDisplayOrder((faqs.length || 0) + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: FaqItem) => {
    setEditingId(item.id);
    setQuestion(item.question);
    setAnswer(item.answer);
    setDisplayOrder(item.display_order);
    setIsActive(item.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    setSaving(true);
    try {
      if (editingId) {
        await updateFaq(editingId, {
          question: question.trim(),
          answer: answer.trim(),
          display_order: displayOrder,
          is_active: isActive,
        });
      } else {
        await createFaq({
          question: question.trim(),
          answer: answer.trim(),
          display_order: displayOrder,
          is_active: isActive,
        });
      }

      await fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, q: string) => {
    if (!window.confirm(`Hapus pertanyaan FAQ "${q}"?`)) return;
    try {
      await deleteFaq(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6" id="admin-faq-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#081A2E]">
            Kelola Pertanyaan FAQ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tambah, edit, dan atur urutan tanya-jawab teknis untuk halaman FAQ publik
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#850B2B] shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Pertanyaan FAQ
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Memuat FAQ...</div>
        ) : faqs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Belum ada item FAQ. Tambahkan tanya-jawab pertama Anda.
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">#{item.display_order}</span>
                    <h3 className="font-bold text-sm text-[#081A2E]">{item.question}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.is_active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {item.is_active ? 'Tampil' : 'Disembunyikan'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">{item.answer}</p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-600 hover:text-[#081A2E] hover:bg-slate-200 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.question)}
                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#081A2E]">
                {editingId ? 'Edit Pertanyaan FAQ' : 'Tambah Pertanyaan FAQ'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pertanyaan (Question) *</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Contoh: Berapa kecepatan internet yang dibutuhkan untuk live streaming?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#081A2E] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jawaban (Answer) *</label>
                <textarea
                  required
                  rows={4}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Jawaban komprehensif dan profesional..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#081A2E] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Urutan Tampilan</label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="faq-is-active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#A40D35]"
                  />
                  <label htmlFor="faq-is-active" className="font-bold text-slate-700 cursor-pointer">
                    Tampilkan di FAQ Publik
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg font-bold text-white bg-[#A40D35] hover:bg-[#850B2B]"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
