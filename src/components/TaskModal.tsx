"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Sparkles, Calendar, Tag, User,
  DollarSign, Link as LinkIcon, MessageSquare,
  Send, CreditCard, ChevronDown, Trash2
} from "lucide-react";

interface TaskModalProps {
  task: any | null;
  isAdmin: boolean;
  onClose: () => void;
}

export default function TaskModal({ task, isAdmin, onClose }: TaskModalProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [activeTab, setActiveTab] = useState<"detail" | "payment" | "comments">("detail");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    assigneeId: "",
    status: "BACKLOG",
    priority: "MEDIUM",
    dueDate: "",
    price: "0",
    deliveryLink: "",
  });

  const [paymentData, setPaymentData] = useState({
    price: "0",
    paidAmount: "0",
  });

  useEffect(() => {
    if (isAdmin) {
      fetchProjects();
      fetchUsers();
    }
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        projectId: task.projectId?._id || "",
        assigneeId: task.assigneeId?._id || "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "",
        price: task.price.toString(),
        deliveryLink: task.deliveryLink || "",
      });
      setPaymentData({
        price: task.price.toString(),
        paidAmount: task.paidAmount.toString(),
      });
      fetchComments();
    }
  }, [task, isAdmin]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.filter((p: any) => p.status === "ACTIVE"));
      }
    } catch (error) { }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) { }
  };

  const fetchComments = async () => {
    if (!task) return;
    try {
      const res = await fetch(`/api/tasks/${task._id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) { }
  };

  const handleAiSuggest = async () => {
    if (!formData.title) {
      toast.error("Öneri için önce bir başlık girin.");
      return;
    }
    setIsAiSuggesting(true);
    try {
      const res = await fetch("/api/ai/suggest-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formData.title }),
      });
      const data = await res.json();
      if (data.suggestion) {
        setFormData({ ...formData, description: data.suggestion });
        toast.success("AI önerisi uygulandı!");
      }
    } catch (error) {
      toast.error("AI hatası.");
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = task ? `/api/tasks/${task._id}` : "/api/tasks";
      const method = task ? "PATCH" : "POST";
      const payload: any = { ...formData };
      payload.price = parseFloat(formData.price) || 0;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("İşlem başarısız");
      toast.success(task ? "Görev güncellendi" : "Görev oluşturuldu");
      onClose();
    } catch (error) {
      toast.error("Bir hata oluştu");
    }
  };

  const handlePaymentUpdate = async () => {
    if (!task || !isAdmin) return;
    try {
      const res = await fetch(`/api/tasks/${task._id}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: parseFloat(paymentData.price) || 0,
          paidAmount: parseFloat(paymentData.paidAmount) || 0,
        }),
      });
      if (!res.ok) throw new Error("Hata");
      toast.success("Ödeme güncellendi");
      onClose();
    } catch (error) {
      toast.error("Ödeme güncellenemedi");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newComment.trim()) return;
    try {
      const res = await fetch(`/api/tasks/${task._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment }),
      });
      if (res.ok) {
        setNewComment("");
        fetchComments();
      }
    } catch (error) { }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white dark:bg-dark-bg w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-dark-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-50 dark:border-dark-border bg-gray-50/50 dark:bg-dark-card/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${task ? 'bg-primary-100 text-primary-600' : 'bg-emerald-100 text-emerald-600'} dark:bg-primary-900/20`}>
              {task ? <Tag size={20} /> : <Sparkles size={20} />}
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                {task ? "Görev Detayı" : "Yeni Görev Oluştur"}
              </h2>
              {task && <p className="text-xs font-bold text-gray-400">ID: #{task._id.slice(-6).toUpperCase()}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-dark-border transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        {task && (
          <div className="flex p-1 bg-gray-100 dark:bg-dark-border mx-6 mt-4 rounded-xl">
            <TabButton active={activeTab === 'detail'} onClick={() => setActiveTab('detail')} label="Detaylar" />
            {isAdmin && <TabButton active={activeTab === 'payment'} onClick={() => setActiveTab('payment')} label="Ödemeler" />}
            <TabButton active={activeTab === 'comments'} onClick={() => setActiveTab('comments')} label="Yorumlar" count={comments.length} />
          </div>
        )}

        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'detail' && (
              <motion.form
                key="detail"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2 block">Görev Başlığı</label>
                  <input
                    type="text"
                    className="premium-input text-lg font-bold"
                    placeholder="Görev adını girin..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    disabled={!isAdmin && task}
                  />
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Açıklama</label>
                    <button
                      type="button"
                      onClick={handleAiSuggest}
                      disabled={isAiSuggesting}
                      className="flex items-center gap-1.5 text-xs font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-all border border-primary-100 dark:border-primary-800"
                    >
                      {isAiSuggesting ? <span className="animate-spin text-[10px]">⌛</span> : <Sparkles size={12} />}
                      AI ile Doldur
                    </button>
                  </div>
                  <textarea
                    className="premium-input min-h-[120px] scrollbar-hide"
                    placeholder="Görev detaylarını buraya ekleyin..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={!isAdmin && task}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isAdmin && (
                    <>
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2 block">Proje</label>
                        <select
                          className="premium-input"
                          value={formData.projectId}
                          onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                          required
                        >
                          <option value="">Seçiniz...</option>
                          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2 block">Atanan</label>
                        <select
                          className="premium-input"
                          value={formData.assigneeId}
                          onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                        >
                          <option value="">Atanmamış</option>
                          {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2 block">Durum</label>
                    <select
                      className="premium-input border-primary-100"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="BACKLOG">Beklemede</option>
                      <option value="IN_PROGRESS">Devam Ediyor</option>
                      <option value="REVIEW">İncelemede</option>
                      <option value="DONE">Tamamlandı</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2 block">Öncelik</label>
                    <select
                      className="premium-input"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="LOW">Düşük</option>
                      <option value="MEDIUM">Orta</option>
                      <option value="HIGH">Yüksek</option>
                    </select>
                  </div>

                  {isAdmin && (
                    <>
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2 block">Son Tarih</label>
                        <input
                          type="date"
                          className="premium-input"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2 block">Fiyat (₺)</label>
                        <input
                          type="number"
                          className="premium-input"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-dark-border flex gap-3">
                  <button type="submit" className="flex-1 btn-primary py-4 rounded-2xl shadow-lg shadow-primary-500/20 font-black tracking-tight">
                    {task ? "DEĞİŞİKLİKLERİ KAYDET" : "GÖREVİ OLUŞTUR"}
                  </button>
                </div>
              </motion.form>
            )}

            {activeTab === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="premium-card bg-gray-50 dark:bg-dark-card border-none">
                    <label className="text-xs font-black text-gray-500 uppercase mb-2 block">Toplam Alacak</label>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-gray-900 dark:text-white">₺</span>
                      <input
                        type="number"
                        className="bg-transparent border-none p-0 focus:ring-0 text-2xl font-black w-full"
                        value={paymentData.price}
                        onChange={(e) => setPaymentData({ ...paymentData, price: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="premium-card bg-emerald-50 dark:bg-emerald-900/10 border-none">
                    <label className="text-xs font-black text-emerald-600 uppercase mb-2 block">Tahsil Edilen</label>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-emerald-700">₺</span>
                      <input
                        type="number"
                        className="bg-transparent border-none p-0 focus:ring-0 text-2xl font-black w-full text-emerald-700"
                        value={paymentData.paidAmount}
                        onChange={(e) => setPaymentData({ ...paymentData, paidAmount: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="premium-card border-dashed">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="font-bold text-gray-500 uppercase">Tahsilat Oranı</span>
                    <span className="font-black text-emerald-600">%{Math.round((parseFloat(paymentData.paidAmount) / (parseFloat(paymentData.price) || 1)) * 100)}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-dark-border h-3 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(parseFloat(paymentData.paidAmount) / (parseFloat(paymentData.price) || 1)) * 100}%` }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>

                <button onClick={handlePaymentUpdate} className="w-full btn-primary py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20">
                  ÖDEME BİLGİLERİNİ GÜNCELLE
                </button>
              </motion.div>
            )}

            {activeTab === 'comments' && (
              <motion.div
                key="comments"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="premium-input"
                    placeholder="Mesajınızı yazın..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button onClick={handleAddComment} className="p-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20">
                    <Send size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  {comments.map((c) => (
                    <div key={c._id} className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center font-black text-gray-400">
                        {c.userId.name.charAt(0)}
                      </div>
                      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-dark-border flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-black text-gray-900 dark:text-gray-100">{c.userId.name}</span>
                          <span className="text-[10px] font-bold text-gray-400">{format(new Date(c.createdAt), "dd MMM HH:mm", { locale: tr })}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function TabButton({ active, onClick, label, count }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${active ? 'bg-white dark:bg-dark-bg text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
    >
      {label} {count !== undefined && <span className="ml-1 opacity-50">({count})</span>}
    </button>
  );
}
