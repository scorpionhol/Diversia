import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  LayoutDashboard,
  Inbox,
  FileText,
  Settings2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  User,
  Mail,
  Phone,
  Building,
  ChevronRight,
  Plus,
  RotateCcw,
  FileJson,
  Check,
  Search,
  Filter,
  LogOut,
  FolderKanban,
  FileEdit,
  Zap,
  Tag,
  Newspaper,
  Eye,
  EyeOff,
  Edit3,
  X,
  Briefcase,
  MessageSquare,
  Send
} from 'lucide-react';

const AdminOperations = () => {
  const [loading, setLoading] = useState(true);
  const [operations, setOperations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messagesList, setMessagesList] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedChatSession, setSelectedChatSession] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [chatReply, setChatReply] = useState('');
  const [chatError, setChatError] = useState(null);
  const [sentEmails, setSentEmails] = useState([]);
  const [error, setError] = useState(null);

  // New states for jobs, applications, and home page texts
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [dbTexts, setDbTexts] = useState({});

  // Navigation & Search State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [reportMonth, setReportMonth] = useState('all');
  const [reportYear, setReportYear] = useState(new Date().getFullYear().toString());
  const [auditModuleFilter, setAuditModuleFilter] = useState('all');

  const monthNames = {
    '01': 'Janvier',
    '02': 'Février',
    '03': 'Mars',
    '04': 'Avril',
    '05': 'Mai',
    '06': 'Juin',
    '07': 'Juillet',
    '08': 'Août',
    '09': 'Septembre',
    '10': 'Octobre',
    '11': 'Novembre',
    '12': 'Décembre'
  };

  // Admin notes input state
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replySubject, setReplySubject] = useState('Réponse de Diversia');
  const [replyBody, setReplyBody] = useState('Bonjour,\n\nMerci pour votre message.\n\nCordialement,\nL\'équipe Diversia');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Blog Management State
  const [articles, setArticles] = useState([]);
  const [blogAdminLoading, setBlogAdminLoading] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'conseils',
    image: '',
    published: true
  });
  const [articleSaving, setArticleSaving] = useState(false);

  // Job Postings State
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    title_en: '',
    description: '',
    description_en: '',
    location: 'Lubumbashi',
    type: 'CDI'
  });
  const [jobSaving, setJobSaving] = useState(false);

  // Text Config State
  const [editingTextKey, setEditingTextKey] = useState('');
  const [textForm, setTextForm] = useState({
    content_fr: '',
    content_en: ''
  });
  const [textSaving, setTextSaving] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const logout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/admin/login';
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [opRes, reqRes] = await Promise.all([
        fetch('/api/operations', { headers }),
        fetch('/api/requests', { headers })
      ]);

      if (!opRes.ok) {
        const errorData = await opRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Échec de la récupération des opérations');
      }
      if (!reqRes.ok) {
        const errorData = await reqRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Échec de la récupération des demandes');
      }

      const opJson = await opRes.json();
      const reqJson = await reqRes.json();

      setOperations(opJson.data || []);
      setRequests(reqJson.data || []);

      const optionalEndpoints = await Promise.allSettled([
        fetch('/api/notifications', { headers }),
        fetch('/api/messages', { headers }),
        fetch('/api/chat/sessions', { headers }),
        fetch('/api/sent-emails', { headers }),
        fetch('/api/jobs', { headers }),
        fetch('/api/applications', { headers }),
        fetch('/api/texts', { headers })
      ]);

      const [notRes, msgRes, chatRes, sentRes, jobsRes, appsRes, textsRes] = optionalEndpoints.map((result) =>
        result.status === 'fulfilled' ? result.value : null
      );

      if (notRes && notRes.ok) {
        const notJson = await notRes.json().catch(() => ({ data: [] }));
        setNotifications(notJson.data || []);
      } else {
        setNotifications([]);
      }

      if (msgRes && msgRes.ok) {
        const msgJson = await msgRes.json().catch(() => ({ data: [] }));
        setMessagesList(msgJson.data || []);
      } else {
        setMessagesList([]);
      }

      if (chatRes && chatRes.ok) {
        const chatJson = await chatRes.json().catch(() => ({ data: [] }));
        setChatSessions(chatJson.data || []);
      } else {
        setChatSessions([]);
      }

      if (sentRes && sentRes.ok) {
        const sentJson = await sentRes.json().catch(() => ({ data: [] }));
        setSentEmails(sentJson.data || []);
      } else {
        setSentEmails([]);
      }

      if (jobsRes && jobsRes.ok) {
        const jobsJson = await jobsRes.json().catch(() => ({ data: [] }));
        setJobs(jobsJson.data || []);
      } else {
        setJobs([]);
      }

      if (appsRes && appsRes.ok) {
        const appsJson = await appsRes.json().catch(() => ({ data: [] }));
        setApplications(appsJson.data || []);
      } else {
        setApplications([]);
      }

      if (textsRes && textsRes.ok) {
        const textsJson = await textsRes.json().catch(() => ({ data: {} }));
        setDbTexts(textsJson.data || {});
      } else {
        setDbTexts({});
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Blog CRUD helpers
  const fetchArticles = async () => {
    setBlogAdminLoading(true);
    try {
      const res = await fetch('/api/articles', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setArticles(json.data || []);
    } catch(e) {} finally {
      setBlogAdminLoading(false);
    }
  };

  const openNewArticle = () => {
    setEditingArticle(null);
    setArticleForm({ title: '', excerpt: '', content: '', category: 'conseils', image: '', published: true });
    setShowArticleModal(true);
  };

  const openEditArticle = (art) => {
    setEditingArticle(art);
    setArticleForm({
      title: art.title || '',
      excerpt: art.excerpt || '',
      content: art.content || '',
      category: art.category || 'conseils',
      image: art.image || '',
      published: art.published !== false
    });
    setShowArticleModal(true);
  };

  const saveArticle = async () => {
    setArticleSaving(true);
    try {
      const method = editingArticle ? 'PUT' : 'POST';
      const url = editingArticle ? `/api/articles/${editingArticle.id}` : '/api/articles';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(articleForm)
      });
      if (!res.ok) throw new Error(await res.text());
      setShowArticleModal(false);
      fetchArticles();
    } catch(e) {
      alert('Erreur : ' + e.message);
    } finally {
      setArticleSaving(false);
    }
  };

  const deleteArticle = async (id) => {
    if (!window.confirm('Supprimer cet article ?')) return;
    try {
      await fetch(`/api/articles/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchArticles();
    } catch(e) { alert(e.message); }
  };

  // Jobs CRUD helpers
  const openNewJob = () => {
    setEditingJob(null);
    setJobForm({ title: '', title_en: '', description: '', description_en: '', location: 'Lubumbashi', type: 'CDI' });
    setShowJobModal(true);
  };

  const openEditJob = (job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title || '',
      title_en: job.title_en || '',
      description: job.description || '',
      description_en: job.description_en || '',
      location: job.location || 'Lubumbashi',
      type: job.type || 'CDI'
    });
    setShowJobModal(true);
  };

  const fetchChatMessages = async (session) => {
    if (!session) return;
    setChatLoading(true);
    setChatError(null);
    try {
      const res = await fetch(`/api/chat?sessionId=${encodeURIComponent(session.sessionId)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Échec de la récupération des conversations');
      }
      const json = await res.json();
      setChatMessages(json.data || []);
      setSelectedChatSession(session);
    } catch (err) {
      setChatError(err.message);
    } finally {
      setChatLoading(false);
    }
  };

  const sendChatReply = async () => {
    if (!selectedChatSession || !chatReply.trim()) return;
    setChatSending(true);
    setChatError(null);
    try {
      const res = await fetch('/api/chat/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId: selectedChatSession.sessionId, text: chatReply.trim() })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Impossible d envoyer la réponse.');
      }
      const json = await res.json();
      setChatMessages((prev) => [...prev, json.data]);
      setChatReply('');
      fetchData();
    } catch (err) {
      setChatError(err.message);
    } finally {
      setChatSending(false);
    }
  };

  const saveJob = async () => {
    setJobSaving(true);
    try {
      const method = editingJob ? 'PUT' : 'POST';
      const url = editingJob ? `/api/jobs/${editingJob.id}` : '/api/jobs';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(jobForm)
      });
      if (!res.ok) throw new Error(await res.text());
      setShowJobModal(false);
      fetchData();
    } catch(e) {
      alert('Erreur : ' + e.message);
    } finally {
      setJobSaving(false);
    }
  };

  const deleteJobPost = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette offre d\'emploi ?')) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Erreur de suppression');
      fetchData();
    } catch(e) { alert(e.message); }
  };

  // Applications & CV helpers
  const handleDownloadCV = async (appId, fileName) => {
    try {
      const res = await fetch(`/api/applications/${appId}/cv`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('CV non disponible sur le serveur');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'cv.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch(e) {
      alert(e.message);
    }
  };

  const deleteApp = async (id) => {
    if (!window.confirm('Supprimer cette candidature définitivement ?')) return;
    try {
      const res = await fetch(`/api/applications/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      fetchData();
    } catch(e) { alert(e.message); }
  };

  // Homepage texts Config helpers
  const openEditText = (key) => {
    setEditingTextKey(key);
    setTextForm({
      content_fr: dbTexts[key]?.fr || '',
      content_en: dbTexts[key]?.en || ''
    });
  };

  const saveText = async () => {
    setTextSaving(true);
    try {
      const res = await fetch('/api/texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          key_name: editingTextKey,
          content_fr: textForm.content_fr,
          content_en: textForm.content_en
        })
      });
      if (!res.ok) throw new Error('Erreur de sauvegarde du texte');
      setEditingTextKey('');
      fetchData();
      alert('Texte mis à jour avec succès !');
    } catch(e) {
      alert(e.message);
    } finally {
      setTextSaving(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError('Accès refusé — administrateur uniquement. Connectez-vous.');
      setLoading(false);
      return;
    }
    fetchData();
    fetchArticles();
  }, [token]);

  // Sync admin notes when selecting another request
  useEffect(() => {
    if (selectedRequest) {
      setAdminNoteInput(selectedRequest.adminNotes || '');
    }
  }, [selectedRequest]);

  // Update Status Action
  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/requests/${id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Erreur de mise à jour du statut');
      
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(prev => ({ ...prev, status: newStatus }));
      }
      
      const opRes = await fetch('/api/operations', { headers: { Authorization: `Bearer ${token}` } });
      if (opRes.ok) {
        const opJson = await opRes.json();
        setOperations(opJson.data || []);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Update Notes Action
  const saveAdminNote = async (id) => {
    try {
      const response = await fetch(`/api/requests/${id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes: adminNoteInput })
      });
      if (!response.ok) throw new Error('Erreur de sauvegarde des notes');
      
      setRequests(prev => prev.map(r => r.id === id ? { ...r, adminNotes: adminNoteInput } : r));
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(prev => ({ ...prev, adminNotes: adminNoteInput }));
      }
      alert('Notes enregistrées avec succès !');

      const opRes = await fetch('/api/operations', { headers: { Authorization: `Bearer ${token}` } });
      if (opRes.ok) {
        const opJson = await opRes.json();
        setOperations(opJson.data || []);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Request Action
  const deleteReq = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer définitivement cette demande ?')) return;
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      
      setRequests(prev => prev.filter(r => r.id !== id));
      setSelectedRequest(null);

      const opRes = await fetch('/api/operations', { headers: { Authorization: `Bearer ${token}` } });
      if (opRes.ok) {
        const opJson = await opRes.json();
        setOperations(opJson.data || []);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Reply / Send Email
  const sendReply = async (to) => {
    if (!to) return alert('Adresse e-mail absente');
    setSendingEmail(true);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ to, subject: replySubject, text: replyBody })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur lors de l\'envoi');
      }
      alert('E-mail envoyé (ou journalisé en mode développement)');
      setShowReplyModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSendingEmail(false);
    }
  };

  // Generate Simulated Test Request
  const generateTestRequest = async () => {
    const firstNames = ['Pascal', 'Nathalie', 'Eric', 'Patricia', 'Olivier', 'Grace', 'Christian', 'Fanny'];
    const lastNames = ['Kabila', 'Mulumba', 'Kabasele', 'Tshisekedi', 'Ndaye', 'Kazadi', 'Mbuyi', 'Kalonji'];
    const companies = ['Gecamines', 'Ruashi Mining', 'TFM', 'Hotel Pullmann', 'Kamoa Copper', 'Congo Rail', ''];
    const sectorsList = ['mining', 'industrial', 'commercial', 'residential'];
    const servicesList = ['Électricité MT/BT', 'Maintenance Industrielle', 'Énergie Solaire', 'Groupes Électrogènes', 'Automatisme & SCADA', 'Tuyauterie', 'HVAC & Climatisation'];
    const messages = [
      'Demande urgente de diagnostic sur notre cabine Haute Tension suite à un court-circuit.',
      'Audit énergétique pour réduire notre consommation électrique globale sur le site d\'exploitation.',
      'Besoin d\'un devis pour installation photovoltaïque hybride avec batteries pour notre entrepôt.',
      'Maintenance annuelle préventive sur notre parc de 5 groupes électrogènes de secours.'
    ];
    
    const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const emailName = randomName.toLowerCase().replace(' ', '.');
    const randomEmail = `${emailName}@${companies[Math.floor(Math.random() * companies.length)] ? 'entreprise' : 'gmail'}.cd`;
    const randomPhone = `+243 85${Math.floor(1000000 + Math.random() * 9000000)}`;
    const randomCompany = companies[Math.floor(Math.random() * companies.length)] || null;
    const randomSector = sectorsList[Math.floor(Math.random() * sectorsList.length)];
    const randomUrgency = ['basse', 'moyenne', 'haute'][Math.floor(Math.random() * 3)];
    
    const numServices = 1 + Math.floor(Math.random() * 3);
    const selected = [];
    while (selected.length < numServices) {
      const s = servicesList[Math.floor(Math.random() * servicesList.length)];
      if (!selected.includes(s)) selected.push(s);
    }
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: randomName,
          email: randomEmail,
          phone: randomPhone,
          company: randomCompany,
          sector: randomSector,
          urgency: randomUrgency,
          services: selected,
          message: randomMessage
        })
      });
      if (response.ok) {
        await fetchData();
        alert('Demande de test générée avec succès !');
      }
    } catch (err) {
      alert('Erreur lors de la génération : ' + err.message);
    }
  };

  const formatRequestsForExport = (data = requests) => data.map((r) => ({
    ID: r.id,
    Date: r.createdAt ? new Date(r.createdAt).toLocaleString() : '',
    Nom: r.name,
    Société: r.company || '',
    Email: r.email || '',
    Téléphone: r.phone || '',
    Secteur: r.sector || '',
    Urgence: r.urgency || '',
    Statut: r.status || '',
    Services: Array.isArray(r.services) ? r.services.join(' / ') : (r.services || ''),
    Notes_Admin: r.adminNotes || '',
    Message: r.message || ''
  }));

  const exportRequestsToExcel = () => {
    try {
      const sheet = XLSX.utils.json_to_sheet(formatRequestsForExport(filteredRequests));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, 'Demandes');
      const summarySheet = XLSX.utils.json_to_sheet([
        { Clé: 'Mois', Valeur: reportMonth === 'all' ? 'Tous' : monthNames[reportMonth] },
        { Clé: 'Année', Valeur: reportYear },
        { Clé: 'Total demandes', Valeur: monthlyTotalReq },
        { Clé: 'Urgentes', Valeur: monthlyUrgentReq },
        { Clé: 'Nouvelles / Urgentes', Valeur: monthlyNewReq },
        { Clé: 'En cours', Valeur: monthlyInProgressReq },
        { Clé: 'Résolues', Valeur: monthlyResolvedReq }
      ]);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé');
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `diversia_demandes_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erreur lors de l’export Excel : ' + err.message);
    }
  };

  const exportRequestsToPdf = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(14);
      const reportLabel = reportMonth === 'all' ? 'Tous les mois' : `${monthNames[reportMonth]} ${reportYear}`;
      doc.text(`Rapport des demandes Diversia - ${reportLabel}`, 14, 16);
      doc.setFontSize(10);
      doc.text(`Total demandes : ${monthlyTotalReq}`, 14, 24);
      doc.text(`Nouvelles / Urgentes : ${monthlyNewReq}`, 14, 29);
      doc.text(`En cours : ${monthlyInProgressReq}`, 80, 29);
      doc.text(`Résolues : ${monthlyResolvedReq}`, 146, 29);
      const body = formatRequestsForExport(monthlyRequests).map((row) => [
        row.ID,
        row.Date,
        row.Nom,
        row.Société,
        row.Email,
        row.Téléphone,
        row.Secteur,
        row.Urgence,
        row.Statut,
        row.Services,
        row.Notes_Admin,
        row.Message
      ]);
      autoTable(doc, {
        startY: 36,
        head: [[
          'ID', 'Date', 'Nom', 'Société', 'Email', 'Téléphone', 'Secteur', 'Urgence', 'Statut', 'Services', 'Notes Admin', 'Message'
        ]],
        body,
        styles: { fontSize: 7 },
        headStyles: { fillColor: [40, 40, 40], textColor: 255 },
        theme: 'grid'
      });
      doc.save(`diversia_demandes_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      alert('Erreur lors de l’export PDF : ' + err.message);
    }
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ requests, operations }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `diversia_rapport_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Calculations for Reports
  const totalReq = requests.length;
  const newReq = requests.filter(r => r.status === 'new' || r.status === 'urgent').length;
  const inProgressReq = requests.filter(r => r.status === 'in_progress').length;
  const resolvedReq = requests.filter(r => r.status === 'resolved').length;
  const urgentReq = requests.filter(r => r.status !== 'resolved' && (r.status === 'urgent' || r.urgency === 'haute' || r.urgency === 'urgent')).length;
  const pctResolved = totalReq > 0 ? Math.round((resolvedReq / totalReq) * 100) : 0;

  const monthlyRequests = requests.filter(r => {
    const created = new Date(r.createdAt);
    const matchesYear = reportYear === 'all' || String(created.getFullYear()) === reportYear;
    const matchesMonth = reportMonth === 'all' || String(created.getMonth() + 1).padStart(2, '0') === reportMonth;
    return matchesYear && matchesMonth;
  });

  const monthlyTotalReq = monthlyRequests.length;
  const monthlyNewReq = monthlyRequests.filter(r => r.status === 'new' || r.status === 'urgent').length;
  const monthlyInProgressReq = monthlyRequests.filter(r => r.status === 'in_progress').length;
  const monthlyResolvedReq = monthlyRequests.filter(r => r.status === 'resolved').length;
  const monthlyUrgentReq = monthlyRequests.filter(r => r.status !== 'resolved' && (r.status === 'urgent' || r.urgency === 'haute' || r.urgency === 'urgent')).length;

  // Sector stats
  const sectorCounts = { mining: 0, industrial: 0, commercial: 0, residential: 0 };
  requests.forEach(r => {
    if (r.sector && sectorCounts[r.sector] !== undefined) {
      sectorCounts[r.sector]++;
    }
  });

  // Urgency stats
  const urgencyCounts = { basse: 0, moyenne: 0, haute: 0, urgent: 0 };
  requests.forEach(r => {
    const urg = r.urgency ? r.urgency.toLowerCase() : 'basse';
    if (urgencyCounts[urg] !== undefined) {
      urgencyCounts[urg]++;
    } else if (urg === 'urgent' || r.status === 'urgent') {
      urgencyCounts.urgent++;
    }
  });

  // Services stats
  const servicesStats = {};
  requests.forEach(r => {
    if (Array.isArray(r.services)) {
      r.services.forEach(s => {
        servicesStats[s] = (servicesStats[s] || 0) + 1;
      });
    }
  });

  // Filter requests list
  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.company && r.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.message.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || 
      (urgencyFilter === 'urgent' && (r.urgency === 'haute' || r.urgency === 'urgent' || r.status === 'urgent')) ||
      (urgencyFilter === 'moyenne' && r.urgency === 'moyenne') ||
      (urgencyFilter === 'basse' && r.urgency === 'basse');
      
    const matchesSector = sectorFilter === 'all' || r.sector === sectorFilter;

    const created = new Date(r.createdAt);
    const matchesReportYear = reportYear === 'all' || String(created.getFullYear()) === reportYear;
    const matchesReportMonth = reportMonth === 'all' || String(created.getMonth() + 1).padStart(2, '0') === reportMonth;

    return matchesSearch && matchesStatus && matchesUrgency && matchesSector && matchesReportYear && matchesReportMonth;
  });

  // Filter operations list
  const filteredOperations = operations.filter(op => {
    return auditModuleFilter === 'all' || op.module === auditModuleFilter;
  });

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-semibold text-slate-300">Chargement de la console d'administration...</p>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl p-8 text-center">
          <div className="bg-red-500/10 text-red-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Accès administrateur requis</h1>
          <p className="text-slate-400 mb-8">{error}</p>
          <button
            type="button"
            onClick={() => { window.location.href = '/admin/login'; }}
            className="w-full inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-3.5 text-slate-950 font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            Aller à la page de connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-slate-900 p-1.5 rounded-lg animate-fade-in">
            <Zap className="h-5 w-5 fill-slate-900" />
          </div>
          <div className="text-left">
            <span className="text-lg font-black tracking-wider text-white">DIVERSIA <span className="text-amber-500 text-xs">ADMIN</span></span>
            <span className="hidden sm:inline text-xs text-slate-400 ml-3 pl-3 border-l border-slate-800">Console d'exploitation v2.2</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {notifications.length > 0 && (
            <div className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{notifications.filter(n => !n.read).length} alertes</span>
            </div>
          )}
          
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold border border-slate-700/50 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Wrapper */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-64 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 p-4 flex flex-col gap-2">
          {[
            { id: 'dashboard', label: 'Rapports & Dashboard', icon: LayoutDashboard },
            { id: 'requests', label: 'Demandes Clients', icon: Inbox, badge: requests.filter(r => r.status === 'new' || r.status === 'urgent').length },
            { id: 'messages', label: 'Messagerie', icon: Mail, badge: messagesList.length },
            { id: 'chat', label: 'Chat Client', icon: MessageSquare, badge: chatSessions.length },
            { id: 'sent', label: 'Envoyés', icon: FileJson, badge: sentEmails.length },
            { id: 'blog', label: 'Blog & Articles', icon: Newspaper, badge: articles.length },
            { id: 'jobs', label: 'Offres d\'Emploi', icon: Briefcase, badge: jobs.length },
            { id: 'applications', label: 'Candidatures & CV', icon: FolderKanban, badge: applications.length },
            { id: 'audit', label: 'Journal d\'Audit', icon: FileText },
            { id: 'config', label: 'Personnaliser l\'Accueil', icon: Settings2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedRequest(null);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge ? (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-slate-950 text-amber-500' : 'bg-rose-500 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </aside>

        {/* Content Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          
          {/* TAB 1: REPORTS & DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-left">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">Tableau de bord & Rapports</h2>
                <p className="text-slate-400 text-sm mt-1">Vue d'ensemble et rapports analytiques des actions et devis.</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group text-left">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-[100px] pointer-events-none"></div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Total Demandes</span>
                  <span className="block text-3xl font-black text-white mt-2">{totalReq}</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group text-left">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-bl-[100px] pointer-events-none"></div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide text-rose-450">Alertes Urgentes</span>
                  <span className="block text-3xl font-black text-rose-500 mt-2">{urgentReq}</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group text-left">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-bl-[100px] pointer-events-none"></div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">En cours</span>
                  <span className="block text-3xl font-black text-amber-500 mt-2">{inProgressReq}</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group text-left">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-[100px] pointer-events-none"></div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide text-emerald-450">Résolues</span>
                  <span className="block text-3xl font-black text-emerald-500 mt-2">{resolvedReq}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 text-left">
                  <div>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">Répartition par Secteurs & Urgence</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { key: 'mining', label: 'Minier & Extraction', color: 'bg-amber-500' },
                      { key: 'industrial', label: 'Industriel & Production', color: 'bg-blue-500' },
                      { key: 'commercial', label: 'Hôtel, Tertiaire & Commercial', color: 'bg-emerald-500' },
                      { key: 'residential', label: 'Résidentiel & Particulier', color: 'bg-purple-500' }
                    ].map(s => {
                      const count = sectorCounts[s.key] || 0;
                      const pct = totalReq > 0 ? Math.round((count / totalReq) * 100) : 0;
                      return (
                        <div key={s.key} className="space-y-1">
                           <div className="flex justify-between text-xs font-semibold">
                             <span className="text-slate-300">{s.label}</span>
                             <span className="text-slate-400">{count} ({pct}%)</span>
                           </div>
                           <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                             <div className={`h-full ${s.color} transition-all duration-1000`} style={{ width: `${pct}%` }}></div>
                           </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 text-left">
                  <div>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">Pôles demandés</h3>
                  </div>
                  <div className="space-y-3">
                    {Object.keys(servicesStats).length === 0 ? (
                      <span className="text-slate-500 text-xs block">Aucun service enregistré.</span>
                    ) : (
                      Object.entries(servicesStats).map(([serviceName, count]) => (
                        <div key={serviceName} className="flex justify-between items-center text-xs bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
                          <span className="text-slate-300 font-bold">{serviceName}</span>
                          <span className="text-amber-500 font-black">{count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 text-left">
                <div>
                  <h4 className="font-extrabold text-white text-base">Exporter le rapport d'activité</h4>
                  <p className="text-slate-400 text-xs mt-1">Téléchargez l'historique complet des demandes et des actions en format JSON.</p>
                </div>
                <button
                  onClick={exportData}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <FileJson className="h-4 w-4" /> Exporter
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CLIENT REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-6 animate-fade-in flex flex-col h-full text-left">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">Gestion des Demandes Clients</h2>
                  <p className="text-slate-400 text-sm mt-1">Traiter les demandes reçues, affecter des techniciens et ajouter des commentaires.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-semibold">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom, email, entreprise..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                    <Filter className="h-3.5 w-3.5 text-slate-500" />
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="bg-transparent border-none text-xs text-slate-300 font-semibold focus:outline-none w-full"
                    >
                      <option value="all">Tous les Statuts</option>
                      <option value="new">Nouveau</option>
                      <option value="urgent">Urgent</option>
                      <option value="in_progress">En cours</option>
                      <option value="resolved">Résolu</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-2 text-xs text-slate-300">
                    <label htmlFor="reportMonth" className="font-bold uppercase tracking-wider text-slate-400">Mois</label>
                    <select
                      id="reportMonth"
                      value={reportMonth}
                      onChange={e => setReportMonth(e.target.value)}
                      className="bg-slate-900 text-slate-100 border-none outline-none"
                    >
                      <option value="all">Tous</option>
                      <option value="01">Janvier</option>
                      <option value="02">Février</option>
                      <option value="03">Mars</option>
                      <option value="04">Avril</option>
                      <option value="05">Mai</option>
                      <option value="06">Juin</option>
                      <option value="07">Juillet</option>
                      <option value="08">Août</option>
                      <option value="09">Septembre</option>
                      <option value="10">Octobre</option>
                      <option value="11">Novembre</option>
                      <option value="12">Décembre</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-2 text-xs text-slate-300">
                    <label htmlFor="reportYear" className="font-bold uppercase tracking-wider text-slate-400">Année</label>
                    <select
                      id="reportYear"
                      value={reportYear}
                      onChange={e => setReportYear(e.target.value)}
                      className="bg-slate-900 text-slate-100 border-none outline-none"
                    >
                      <option value="all">Tous</option>
                      <option value="2023">2023</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </select>
                  </div>

                  <button
                    onClick={exportRequestsToExcel}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                  >
                    <FileText className="h-3.5 w-3.5" /> Export Excel
                  </button>
                  <button
                    onClick={exportRequestsToPdf}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                  >
                    <FileText className="h-3.5 w-3.5" /> Export PDF
                  </button>
                  <button
                    onClick={exportData}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-100 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                  >
                    <FileJson className="h-3.5 w-3.5" /> Export JSON
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 text-left text-xs">
                    <span className="block text-slate-400 uppercase tracking-wide mb-2">Demandes mois</span>
                    <span className="block text-2xl font-black text-white">{monthlyTotalReq}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 text-left text-xs">
                    <span className="block text-slate-400 uppercase tracking-wide mb-2">Urgentes</span>
                    <span className="block text-2xl font-black text-amber-500">{monthlyUrgentReq}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 text-left text-xs">
                    <span className="block text-slate-400 uppercase tracking-wide mb-2">En cours</span>
                    <span className="block text-2xl font-black text-amber-300">{monthlyInProgressReq}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 text-left text-xs">
                    <span className="block text-slate-400 uppercase tracking-wide mb-2">Résolues</span>
                    <span className="block text-2xl font-black text-emerald-500">{monthlyResolvedReq}</span>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className={`${selectedRequest ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-3 overflow-y-auto max-h-[70vh]`}>
                  {filteredRequests.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center text-slate-500 text-xs">
                      Aucune demande reçue.
                    </div>
                  ) : (
                    filteredRequests.map(r => (
                      <div
                        key={r.id}
                        onClick={() => setSelectedRequest(r)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer text-left flex flex-col gap-2 ${
                          selectedRequest && selectedRequest.id === r.id ? 'bg-slate-900 border-amber-500' : 'bg-slate-900/60 border-slate-850 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-extrabold text-sm text-white">{r.name}</h4>
                            <span className="block text-[10px] text-slate-500 font-semibold">{r.company || 'Sans entreprise'}</span>
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            r.status === 'urgent' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{r.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {selectedRequest && (
                  <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-350 px-2.5 py-1 rounded-md font-bold uppercase block w-max mb-2">Détails DIV-{selectedRequest.id}</span>
                        <h3 className="text-xl font-extrabold text-white">{selectedRequest.name}</h3>
                      </div>
                      <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-white text-xs font-bold bg-slate-800 px-3.5 py-1.5 rounded-xl cursor-pointer">Fermer</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                        <span className="block text-[8px] font-bold text-slate-500 uppercase">Email</span>
                        <a href={`mailto:${selectedRequest.email}`} className="text-xs font-bold text-slate-200 hover:text-amber-500 truncate block">{selectedRequest.email}</a>
                        <button onClick={() => { setShowReplyModal(true); setReplySubject(`Suivi Diversia : ${selectedRequest.name}`); }} className="mt-2 text-[10px] bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg font-bold cursor-pointer">Répondre</button>
                      </div>
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                        <span className="block text-[8px] font-bold text-slate-500 uppercase">Téléphone</span>
                        <span className="text-xs font-bold text-slate-200">{selectedRequest.phone || '—'}</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Services Demandés :</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedRequest.services.map((s, i) => (
                          <span key={i} className="bg-slate-950 border border-slate-800 text-amber-500 text-[10px] font-bold px-3 py-1.5 rounded-xl">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 bg-slate-950 p-4 rounded-xl">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Message :</span>
                      <p className="text-xs text-slate-300 leading-relaxed">{selectedRequest.message}</p>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Commentaires de suivi admin :</span>
                      <textarea
                        rows={3}
                        value={adminNoteInput}
                        onChange={e => setAdminNoteInput(e.target.value)}
                        placeholder="Saisissez des commentaires ici..."
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                      <button onClick={() => saveAdminNote(selectedRequest.id)} className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold uppercase cursor-pointer">Enregistrer la note</button>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-850">
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(selectedRequest.id, 'in_progress')} className="bg-slate-800 hover:bg-slate-700 text-amber-500 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">En cours</button>
                        <button onClick={() => updateStatus(selectedRequest.id, 'resolved')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">Résolu</button>
                      </div>
                      <button onClick={() => deleteReq(selectedRequest.id)} className="bg-rose-500/20 hover:bg-rose-600 text-rose-500 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                        <Trash2 className="h-4 w-4" /> Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: INBOX MESSAGES */}
          {activeTab === 'messages' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">Messagerie de Contact</h2>
                <p className="text-slate-400 text-sm mt-1">Messages généraux reçus des formulaires.</p>
              </div>

              {messagesList.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-slate-500 text-xs text-center">Aucun message.</div>
              ) : (
                <div className="space-y-3">
                  {messagesList.map(m => (
                    <div key={m.id} className="bg-slate-900 border border-slate-850 p-5 rounded-2xl text-left flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-white">{m.name} ({m.email})</h4>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">{m.message}</p>
                        <span className="block text-[10px] text-slate-500 mt-3">{new Date(m.createdAt).toLocaleString()}</span>
                      </div>
                      <button onClick={() => { setSelectedRequest(m); setShowReplyModal(true); }} className="bg-amber-500 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer shrink-0">Répondre</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CHAT CLIENT */}
          {activeTab === 'chat' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex flex-col xl:flex-row gap-6">
                <div className="xl:w-4/12 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white">Chat Clients</h2>
                    <p className="text-slate-400 text-sm mt-1">Sessions clients en cours et historique des conversations.</p>
                  </div>

                  {chatSessions.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-950/80 p-6 text-slate-500 text-xs text-center">Aucune session de chat pour l'instant.</div>
                  ) : (
                    <div className="space-y-3">
                      {chatSessions.map((session) => (
                        <button
                          key={session.sessionId}
                          onClick={() => fetchChatMessages(session)}
                          className={`w-full text-left p-4 rounded-3xl border transition-all ${selectedChatSession?.sessionId === session.sessionId ? 'border-amber-500 bg-slate-950 text-white' : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-amber-500 hover:bg-slate-950'}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="font-bold text-sm">{session.name || session.sessionId.slice(-6)}</p>
                              <p className="text-[11px] text-slate-500">{session.email || '—'}</p>
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{new Date(session.lastAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-3 truncate">{session.lastText}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="xl:w-8/12 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-white">Conversation</h3>
                      <p className="text-slate-400 text-xs mt-1">Répondez directement au client connecté.</p>
                    </div>
                    {selectedChatSession && (
                      <div className="text-right text-[11px] text-slate-400">
                        <div>{selectedChatSession.name || 'Client anonyme'}</div>
                        <div>{selectedChatSession.email || 'Email non fourni'}</div>
                      </div>
                    )}
                  </div>

                  {selectedChatSession ? (
                    <>
                      <div className="flex-1 overflow-y-auto space-y-3 max-h-[450px] p-3 bg-slate-950 border border-slate-800 rounded-3xl">
                        {chatLoading ? (
                          <p className="text-slate-400 text-sm">Chargement des messages...</p>
                        ) : chatMessages.length === 0 ? (
                          <p className="text-slate-400 text-sm">Aucun message dans cette conversation.</p>
                        ) : (
                          <div className="space-y-3">
                            {chatMessages.map((msg) => (
                              <div key={msg.id} className={`max-w-[85%] p-3 rounded-3xl ${msg.author === 'admin' ? 'bg-amber-500 text-slate-950 ml-auto' : 'bg-slate-800 text-slate-100'}`}>
                                <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400 mb-1">{msg.author === 'admin' ? 'Diversia' : 'Client'}</div>
                                <p className="text-xs leading-relaxed">{msg.text}</p>
                                <div className="text-[10px] text-slate-500 text-right mt-2">{new Date(msg.createdAt).toLocaleString()}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <textarea
                          rows={3}
                          value={chatReply}
                          onChange={(e) => setChatReply(e.target.value)}
                          placeholder="Tapez votre réponse ici..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                        {chatError && <p className="text-xs text-rose-400">{chatError}</p>}
                        <button
                          onClick={sendChatReply}
                          disabled={chatSending}
                          className="inline-flex items-center justify-center gap-2 rounded-3xl bg-amber-500 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-amber-400 transition-colors disabled:opacity-60"
                        >
                          <Send className="h-4 w-4" /> Répondre au client
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-950/80 p-8 text-slate-500 text-sm text-center">
                      Sélectionnez une session de chat à gauche pour afficher la conversation.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SENT EMAILS */}
          {activeTab === 'sent' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">Emails Envoyés</h2>
                <p className="text-slate-400 text-sm mt-1">Journal de correspondance sortante.</p>
              </div>

              {sentEmails.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-slate-500 text-xs text-center">Aucun mail envoyé.</div>
              ) : (
                <div className="space-y-3">
                  {sentEmails.map(e => (
                    <div key={e.id} className="bg-slate-900 border border-slate-850 p-5 rounded-2xl text-left">
                      <h4 className="font-bold text-xs text-amber-500">Destinataire : {e.to}</h4>
                      <p className="text-xs font-extrabold text-white mt-1">Sujet : {e.subject}</p>
                      <p className="text-xs text-slate-350 mt-2 leading-relaxed">{e.text}</p>
                      {e.previewUrl && <a href={e.previewUrl} target="_blank" rel="noreferrer" className="block text-xs underline text-amber-400 mt-2">Ouvrir le brouillon Ethereal</a>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: BLOG ARTICLES */}
          {activeTab === 'blog' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">Gestion du Blog</h2>
                  <p className="text-slate-400 text-sm mt-1">{articles.length} article(s) publié(s)</p>
                </div>
                <button onClick={openNewArticle} className="bg-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs uppercase cursor-pointer flex items-center gap-1"><Plus className="h-4 w-4" /> Nouvel Article</button>
              </div>

              <div className="space-y-3">
                {articles.map(art => (
                  <div key={art.id} className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <img src={art.image} alt={art.title} className="w-14 h-14 object-cover rounded-xl bg-slate-800" onError={e => e.target.src='https://images.unsplash.com/photo-1581092921461-eab10380d70b'} />
                      <div>
                        <h4 className="text-white font-bold text-sm leading-tight">{art.title}</h4>
                        <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">{art.category}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditArticle(art)} className="p-2 bg-slate-850 text-slate-300 hover:text-amber-500 rounded-lg cursor-pointer"><Edit3 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => deleteArticle(art.id)} className="p-2 bg-slate-850 text-slate-300 hover:text-rose-500 rounded-lg cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: JOB POSTINGS */}
          {activeTab === 'jobs' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">Offres d'Emploi</h2>
                  <p className="text-slate-400 text-sm mt-1">Publier et gérer les opportunités de carrière.</p>
                </div>
                <button onClick={openNewJob} className="bg-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs uppercase cursor-pointer flex items-center gap-1"><Plus className="h-4 w-4" /> Nouvelle Offre</button>
              </div>

              <div className="space-y-3">
                {jobs.map(job => (
                  <div key={job.id} className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex justify-between items-center gap-4">
                    <div>
                      <h4 className="text-white font-bold text-sm leading-tight">{job.title}</h4>
                      <p className="text-slate-400 text-xs font-semibold mt-1">Anglais : {job.title_en || '—'}</p>
                      <div className="flex gap-2.5 mt-2 text-[10px] font-bold text-slate-500">
                        <span className="uppercase">Contrat : {job.type}</span>
                        <span>Lieu : {job.location}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditJob(job)} className="p-2 bg-slate-850 text-slate-300 hover:text-amber-500 rounded-lg cursor-pointer"><Edit3 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => deleteJobPost(job.id)} className="p-2 bg-slate-855 text-slate-300 hover:text-rose-500 rounded-lg cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
                {jobs.length === 0 && (
                  <div className="text-center py-10 text-slate-500 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl">Aucune offre d'emploi active.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: JOB APPLICATIONS & CVs */}
          {activeTab === 'applications' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">Candidatures & CVs reçus</h2>
                <p className="text-slate-400 text-sm mt-1">Consultez les candidatures déposées en ligne et téléchargez les CVs PDF.</p>
              </div>

              <div className="space-y-3">
                {applications.map(app => {
                  const jobName = app.jobId ? `Poste #${app.jobId}` : 'Candidature Spontanée';
                  return (
                    <div key={app.id} className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-sm">{app.name}</span>
                          <span className="bg-slate-950 border border-slate-800 text-amber-500 text-[9px] font-bold px-2 py-0.5 rounded uppercase">{jobName}</span>
                        </div>
                        <p className="text-xs text-slate-400">Email : {app.email} | Tél : {app.phone || '—'}</p>
                        {app.message && <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 mt-1">{app.message}</p>}
                        <span className="block text-[9px] text-slate-500">{new Date(app.createdAt || app.created_at).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        {app.filePath ? (
                          <button
                            onClick={() => handleDownloadCV(app.id, app.fileName || 'cv.pdf')}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
                          >
                            Télécharger le CV
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Aucun fichier</span>
                        )}
                        <button
                          onClick={() => deleteApp(app.id)}
                          className="p-2 bg-slate-800 text-slate-300 hover:text-rose-500 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {applications.length === 0 && (
                  <div className="text-center py-10 text-slate-500 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl">Aucune candidature reçue.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: AUDIT LOG */}
          {activeTab === 'audit' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">Journal d'Audit</h2>
                  <p className="text-slate-400 text-sm mt-1">Actions d'administration enregistrées.</p>
                </div>
              </div>

              <div className="space-y-3">
                {filteredOperations.map(op => (
                  <div key={op.id} className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex justify-between items-center text-left">
                    <div>
                      <h4 className="text-white font-bold text-xs uppercase tracking-wide">{op.action}</h4>
                      <p className="text-xs text-slate-400">{op.details}</p>
                      <span className="block text-[9px] text-slate-500 mt-1">{new Date(op.timestamp).toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] text-amber-500 font-bold uppercase">{op.user}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: HOMEPAGE TEXTS CONFIGS */}
          {activeTab === 'config' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">Personnalisation des Textes d'Accueil</h2>
                <p className="text-slate-400 text-sm mt-1">Modifiez les textes clés du portail client et gérez le simulateur.</p>
              </div>

              {/* Editable Texts Block */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                <h3 className="font-extrabold text-base text-white">Section Textes de Référence</h3>
                
                <div className="space-y-4">
                  {[
                    { key: 'hero_title_accent', label: 'Titre en surbrillance (Hero)' },
                    { key: 'hero_desc', label: 'Description principale (Hero)' },
                    { key: 'about_intro', label: 'Texte d\'introduction (À propos)' }
                  ].map(item => {
                    const isEditing = editingTextKey === item.key;
                    return (
                      <div key={item.key} className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3 text-left">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-amber-500 uppercase">{item.label}</span>
                          {!isEditing ? (
                            <button onClick={() => openEditText(item.key)} className="text-xs text-amber-500 bg-slate-900 border border-slate-800 hover:border-amber-500/30 px-3 py-1.5 rounded-xl cursor-pointer">Modifier</button>
                          ) : (
                            <div className="flex gap-2">
                              <button onClick={saveText} disabled={textSaving} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-bold cursor-pointer">{textSaving ? '...' : 'Valider'}</button>
                              <button onClick={() => setEditingTextKey('')} className="text-xs bg-slate-800 text-slate-350 px-3 py-1.5 rounded-xl cursor-pointer">Annuler</button>
                            </div>
                          )}
                        </div>

                        {!isEditing ? (
                          <div className="space-y-1.5 text-xs text-slate-300">
                            <p><strong>FR :</strong> {dbTexts[item.key]?.fr || '—'}</p>
                            <p><strong>EN :</strong> {dbTexts[item.key]?.en || '—'}</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Français</label>
                              <textarea
                                value={textForm.content_fr}
                                onChange={e => setTextForm({ ...textForm, content_fr: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                rows={2}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Anglais</label>
                              <textarea
                                value={textForm.content_en}
                                onChange={e => setTextForm({ ...textForm, content_en: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                rows={2}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Simulation card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                <div>
                  <h3 className="font-extrabold text-base text-white">Simulateur d'Activité</h3>
                  <p className="text-xs text-slate-500 mt-1">Générez une demande client fictive complète pour tester la plateforme.</p>
                </div>
                <button
                  onClick={generateTestRequest}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-3 rounded-xl text-xs font-bold uppercase cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Générer une demande fictive
                </button>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 text-left space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-extrabold text-white">Répondre à la demande</h3>
              <button onClick={() => setShowReplyModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Sujet de l'email</label>
                <input
                  type="text"
                  value={replySubject}
                  onChange={e => setReplySubject(e.target.value)}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-850 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Corps du message</label>
                <textarea
                  rows={8}
                  value={replyBody}
                  onChange={e => setReplyBody(e.target.value)}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-850 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button onClick={() => setShowReplyModal(false)} className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-350 text-xs font-bold cursor-pointer">Annuler</button>
                <button
                  onClick={() => sendReply(selectedRequest.email)}
                  disabled={sendingEmail}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase cursor-pointer"
                >
                  {sendingEmail ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Article Create/Edit Modal */}
      {showArticleModal && (
        <div className="fixed inset-0 bg-black/70 z-50 overflow-y-auto flex items-start justify-center p-4 pt-10">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2rem] p-7 my-8 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-white">
                {editingArticle ? 'Modifier l\'article' : 'Créer un article'}
              </h3>
              <button onClick={() => setShowArticleModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Titre *</label>
                <input
                  type="text"
                  value={articleForm.title}
                  onChange={e => setArticleForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Ex: Titre de l'article"
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Catégorie</label>
                  <select
                    value={articleForm.category}
                    onChange={e => setArticleForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="conseils">Conseils Techniques</option>
                    <option value="realisations">Réalisations</option>
                    <option value="innovations">Innovations</option>
                    <option value="projets">Nouveaux Projets</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Statut</label>
                  <button
                    type="button"
                    onClick={() => setArticleForm(p => ({ ...p, published: !p.published }))}
                    className={`w-full rounded-xl p-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      articleForm.published
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {articleForm.published ? 'Publié' : 'Brouillon'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Image URL</label>
                <input
                  type="url"
                  value={articleForm.image}
                  onChange={e => setArticleForm(p => ({ ...p, image: e.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Résumé accroche *</label>
                <textarea
                  rows={3}
                  value={articleForm.excerpt}
                  onChange={e => setArticleForm(p => ({ ...p, excerpt: e.target.value }))}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Corps de l'article *</label>
                <textarea
                  rows={8}
                  value={articleForm.content}
                  onChange={e => setArticleForm(p => ({ ...p, content: e.target.value }))}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowArticleModal(false)} className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-350 text-xs font-bold cursor-pointer">Annuler</button>
                <button onClick={saveArticle} className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer">Sauvegarder</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Create/Edit Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/70 z-50 overflow-y-auto flex items-start justify-center p-4 pt-10">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-[2rem] p-7 my-8 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-white">
                {editingJob ? 'Modifier l\'offre d\'emploi' : 'Créer une offre d\'emploi'}
              </h3>
              <button onClick={() => setShowJobModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Titre (Français) *</label>
                <input
                  type="text"
                  value={jobForm.title}
                  onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                  placeholder="Ex: Ingénieur Électricien"
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Titre (Anglais)</label>
                <input
                  type="text"
                  value={jobForm.title_en}
                  onChange={e => setJobForm({ ...jobForm, title_en: e.target.value })}
                  placeholder="Ex: Electrical Engineer"
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Lieu</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={e => setJobForm({ ...jobForm, location: e.target.value })}
                    placeholder="Lubumbashi"
                    className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Type de contrat</label>
                  <input
                    type="text"
                    value={jobForm.type}
                    onChange={e => setJobForm({ ...jobForm, type: e.target.value })}
                    placeholder="CDI / CDD"
                    className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description (Français) *</label>
                <textarea
                  rows={4}
                  value={jobForm.description}
                  onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description (Anglais)</label>
                <textarea
                  rows={4}
                  value={jobForm.description_en}
                  onChange={e => setJobForm({ ...jobForm, description_en: e.target.value })}
                  className="w-full rounded-xl p-3 bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowJobModal(false)} className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-350 text-xs font-bold cursor-pointer">Annuler</button>
                <button onClick={saveJob} className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer">Sauvegarder</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOperations;
