import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Mail, Send, Eye, Edit3, Save, Loader2, CheckCircle2, Clock,
  XCircle, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, X,
  FileText, Bell, Search, ToggleLeft, ToggleRight, Sparkles
} from 'lucide-react';

interface Template {
  id: string;
  status_trigger: string;
  subject: string;
  body_template: string;
  is_active: boolean;
  updated_at: string;
}

interface HistoryItem {
  id: string;
  application_id: string;
  recipient_email: string;
  recipient_name: string;
  status_trigger: string;
  subject: string;
  body: string;
  sent_at: string;
  delivery_status: string;
}

const statusLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: FileText },
  under_review: { label: 'Under Review', color: 'bg-amber-100 text-amber-700', icon: Clock },
  accepted: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  waitlisted: { label: 'Waitlisted', color: 'bg-purple-100 text-purple-700', icon: AlertTriangle },
};

const NotificationsView: React.FC = () => {
  const [tab, setTab] = useState<'templates' | 'history'>('templates');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewData, setPreviewData] = useState<{ subject: string; body: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [sendingTest, setSendingTest] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); } }, [toast]);

  const loadData = async () => {
    setLoading(true);
    const [tplRes, histRes] = await Promise.all([
      supabase.functions.invoke('send-notification', { body: { action: 'get_templates' } }),
      supabase.functions.invoke('send-notification', { body: { action: 'get_history' } }),
    ]);
    setTemplates(tplRes.data?.templates || []);
    setHistory(histRes.data?.history || []);
    setLoading(false);
  };

  const startEdit = (tpl: Template) => {
    setEditingId(tpl.id);
    setEditSubject(tpl.subject);
    setEditBody(tpl.body_template);
  };

  const cancelEdit = () => { setEditingId(null); setEditSubject(''); setEditBody(''); };

  const saveTemplate = async () => {
    if (!editingId) return;
    setSaving(true);
    const { data } = await supabase.functions.invoke('send-notification', {
      body: { action: 'update_template', template_id: editingId, subject: editSubject, body_template: editBody }
    });
    if (data?.success) {
      setTemplates(prev => prev.map(t => t.id === editingId ? { ...t, subject: editSubject, body_template: editBody, updated_at: new Date().toISOString() } : t));
      setToast({ message: 'Template saved successfully!', type: 'success' });
      cancelEdit();
    } else {
      setToast({ message: 'Failed to save template', type: 'error' });
    }
    setSaving(false);
  };

  const toggleActive = async (tpl: Template) => {
    const { data } = await supabase.functions.invoke('send-notification', {
      body: { action: 'update_template', template_id: tpl.id, is_active: !tpl.is_active }
    });
    if (data?.success) {
      setTemplates(prev => prev.map(t => t.id === tpl.id ? { ...t, is_active: !t.is_active } : t));
    }
  };

  const previewTemplate = async (tpl: Template) => {
    setPreviewLoading(true);
    setPreviewData(null);
    const { data } = await supabase.functions.invoke('send-notification', {
      body: { action: 'preview', template_id: tpl.id }
    });
    if (data?.subject) {
      setPreviewData({ subject: data.subject, body: data.body });
    }
    setPreviewLoading(false);
  };

  const sendTestNotification = async (tpl: Template) => {
    setSendingTest(tpl.id);
    // Get a sample application to send a test notification
    const { data: apps } = await supabase.from('applications').select('id').limit(1);
    if (apps && apps.length > 0) {
      const { data } = await supabase.functions.invoke('send-notification', {
        body: { action: 'send', application_id: apps[0].id, new_status: tpl.status_trigger }
      });
      if (data?.success) {
        setToast({ message: `Test notification sent to ${data.recipient}`, type: 'success' });
        // Refresh history
        const histRes = await supabase.functions.invoke('send-notification', { body: { action: 'get_history' } });
        setHistory(histRes.data?.history || []);
      } else {
        setToast({ message: 'Failed to send test notification', type: 'error' });
      }
    }
    setSendingTest(null);
  };

  const filteredHistory = history.filter(h => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return h.recipient_name?.toLowerCase().includes(term) ||
      h.recipient_email?.toLowerCase().includes(term) ||
      h.subject?.toLowerCase().includes(term) ||
      h.status_trigger?.toLowerCase().includes(term);
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2 animate-in slide-in-from-right ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Email Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Manage email templates and view notification history</p>
        </div>
        <button onClick={loadData} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-5 text-white">
          <Mail className="w-5 h-5 mb-2 text-blue-200" />
          <p className="text-sm text-blue-200">Total Sent</p>
          <p className="text-3xl font-extrabold mt-1">{history.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl p-5 text-white">
          <CheckCircle2 className="w-5 h-5 mb-2 text-emerald-200" />
          <p className="text-sm text-emerald-200">Delivered</p>
          <p className="text-3xl font-extrabold mt-1">{history.filter(h => h.delivery_status === 'sent').length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-5 text-white">
          <FileText className="w-5 h-5 mb-2 text-purple-200" />
          <p className="text-sm text-purple-200">Templates</p>
          <p className="text-3xl font-extrabold mt-1">{templates.length}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl p-5 text-white">
          <Sparkles className="w-5 h-5 mb-2 text-amber-200" />
          <p className="text-sm text-amber-200">AI Enhanced</p>
          <p className="text-3xl font-extrabold mt-1">{templates.filter(t => t.is_active).length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1">
        <button onClick={() => setTab('templates')} className={`px-5 py-2.5 text-sm font-semibold transition-colors border-b-2 ${
          tab === 'templates' ? 'text-blue-700 border-blue-700' : 'text-gray-500 border-transparent hover:text-gray-700'
        }`}>
          <span className="flex items-center gap-2"><Edit3 className="w-4 h-4" /> Email Templates</span>
        </button>
        <button onClick={() => setTab('history')} className={`px-5 py-2.5 text-sm font-semibold transition-colors border-b-2 ${
          tab === 'history' ? 'text-blue-700 border-blue-700' : 'text-gray-500 border-transparent hover:text-gray-700'
        }`}>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Notification History ({history.length})</span>
        </button>
      </div>

      {/* Templates Tab */}
      {tab === 'templates' && (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-sm text-blue-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">AI-Enhanced Notifications</p>
              <p className="text-xs mt-0.5">When notifications are sent, the AI gateway personalizes each email while preserving all factual information. Use <code className="bg-blue-100 px-1 rounded">{'{{variable}}'}</code> placeholders in templates.</p>
              <p className="text-xs mt-1 text-blue-600">Available: {'{{applicant_name}}, {{program_name}}, {{program_code}}, {{application_id}}, {{prediction_score}}, {{confidence}}, {{rank}}, {{status}}'}</p>
            </div>
          </div>

          {templates.map(tpl => {
            const info = statusLabels[tpl.status_trigger] || { label: tpl.status_trigger, color: 'bg-gray-100 text-gray-700', icon: Mail };
            const StatusIcon = info.icon;
            const isEditing = editingId === tpl.id;

            return (
              <div key={tpl.id} className={`bg-white rounded-xl border ${isEditing ? 'border-blue-300 shadow-lg shadow-blue-100' : 'border-gray-200'} overflow-hidden transition-all`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${info.color}`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900">{info.label} Notification</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${tpl.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {tpl.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Trigger: status changes to "{tpl.status_trigger}"</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => toggleActive(tpl)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title={tpl.is_active ? 'Disable' : 'Enable'}>
                        {tpl.is_active ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                      </button>
                      <button onClick={() => previewTemplate(tpl)} className="p-1.5 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg transition-colors" title="Preview">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => isEditing ? cancelEdit() : startEdit(tpl)} className={`p-1.5 rounded-lg transition-colors ${isEditing ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`} title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => sendTestNotification(tpl)} disabled={sendingTest === tpl.id} className="p-1.5 hover:bg-purple-50 text-gray-500 hover:text-purple-600 rounded-lg transition-colors" title="Send test">
                        {sendingTest === tpl.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 mt-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Subject Line</label>
                        <input type="text" value={editSubject} onChange={e => setEditSubject(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Email Body Template</label>
                        <textarea value={editBody} onChange={e => setEditBody(e.target.value)} rows={8}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveTemplate} disabled={saving}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50">
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          {saving ? 'Saving...' : 'Save Template'}
                        </button>
                        <button onClick={cancelEdit} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1 font-medium">Subject: <span className="text-gray-800">{tpl.subject}</span></p>
                      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 font-mono whitespace-pre-wrap max-h-24 overflow-y-auto">
                        {tpl.body_template}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2">Last updated: {new Date(tpl.updated_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name, email, or status..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">No notifications sent yet.</p>
              <p className="text-xs text-gray-400 mt-1">Notifications are sent automatically when application statuses change.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3 text-left font-semibold">Recipient</th>
                      <th className="px-4 py-3 text-left font-semibold">Status Trigger</th>
                      <th className="px-4 py-3 text-left font-semibold">Subject</th>
                      <th className="px-4 py-3 text-left font-semibold">Delivery</th>
                      <th className="px-4 py-3 text-left font-semibold">Sent At</th>
                      <th className="px-4 py-3 text-left font-semibold w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredHistory.map(item => {
                      const info = statusLabels[item.status_trigger] || { label: item.status_trigger, color: 'bg-gray-100 text-gray-700', icon: Mail };
                      const isExpanded = expandedHistory === item.id;
                      return (
                        <React.Fragment key={item.id}>
                          <tr className="hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => setExpandedHistory(isExpanded ? null : item.id)}>
                            <td className="px-4 py-3">
                              <p className="text-sm font-semibold text-gray-900">{item.recipient_name}</p>
                              <p className="text-xs text-gray-500">{item.recipient_email}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${info.color}`}>{info.label}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{item.subject}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                item.delivery_status === 'sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                              }`}>{item.delivery_status}</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">{new Date(item.sent_at).toLocaleString()}</td>
                            <td className="px-4 py-3">
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="px-4 py-4 bg-gray-50">
                                <div className="max-w-3xl">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Content</p>
                                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                                    <p className="text-sm font-bold text-gray-900 mb-2">{item.subject}</p>
                                    <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{item.body}</div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {(previewData || previewLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Eye className="w-5 h-5 text-blue-600" /> Email Preview</h3>
              <button onClick={() => setPreviewData(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            {previewLoading ? (
              <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" /></div>
            ) : previewData ? (
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-1">To: alice.mukamana@example.com</p>
                  <p className="text-sm font-bold text-gray-900">{previewData.subject}</p>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-200 rounded-lg p-4">
                  {previewData.body}
                </div>
                <p className="text-[10px] text-gray-400 mt-3 text-center">This is a preview with sample data. Actual emails will contain real applicant information.</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsView;
