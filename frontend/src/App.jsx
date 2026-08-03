import React, { useState, useEffect } from 'react';
import {
  Zap,
  Wrench,
  Sun,
  Settings,
  Cpu,
  Workflow,
  Wind,
  Check,
  Phone,
  Mail,
  MapPin,
  Globe,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Shield,
  Award,
  Plus,
  Minus,
  FileText,
  Calendar,
  Briefcase,
  HelpCircle,
  Building,
  CheckCircle2,
  X,
  FileDown
} from 'lucide-react';
import Navbar from './components/Navbar/Navbar.jsx';
import ChatWidget from './components/ChatWidget/ChatWidget.jsx';
import { translations } from './i18n/translations.js';

export default function App() {
  // Langue Globale
  const [language, setLanguage] = useState('fr');
  const t = translations[language] || translations['fr'];

  // Navigation State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('accueil');

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  // About Tab State
  const [activeAboutTab, setActiveAboutTab] = useState('historique');

  // Project Filter & Modal State
  const [projectFilter, setProjectFilter] = useState('tous');
  const [selectedProject, setSelectedProject] = useState(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // Blog State
  const [blogArticles, setBlogArticles] = useState([]);
  const [blogFilter, setBlogFilter] = useState('tous');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [blogLoading, setBlogLoading] = useState(true);

  // Quote Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    sector: 'industrial',
    urgency: 'moyenne',
    selectedServices: [],
    message: ''
  });
  const [formProgress, setFormProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [emailPreviewUrl, setEmailPreviewUrl] = useState('');

  // Careers / Job Applications State
  const [jobsList, setJobsList] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyForm, setApplyForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    cvFile: '',
    cvFileName: ''
  });
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState(null);

  // Dynamic config texts from DB
  const [dbTexts, setDbTexts] = useState({});

  // Static Data (French and English)
  const services = [
    {
      id: "elec",
      icon: Zap,
      title: { fr: "Électricité Industrielle", en: "Industrial Electricity" },
      desc: { fr: "Études, raccordements MT/BT, tableaux électriques et mise en conformité.", en: "Studies, MV/LV connections, electrical panels and regulatory compliance." },
      details: {
        fr: [
          "Installation et raccordement de cabines MT/BT",
          "Automatisme et instrumentation de procédés",
          "Informatique industrielle et domotique",
          "Maintenance électrique préventive et corrective"
        ],
        en: [
          "Installation and connection of MV/LV substations",
          "Automation and instrumentation of processes",
          "Industrial IT and home automation",
          "Preventive and corrective electrical maintenance"
        ]
      }
    },
    {
      id: "solar",
      icon: Sun,
      title: { fr: "Énergie Solaire", en: "Solar Energy" },
      desc: { fr: "Conception et installation de centrales photovoltaïques autonomes ou hybrides.", en: "Design and installation of off-grid or hybrid photovoltaic power plants." },
      details: {
        fr: [
          "Études d'ensoleillement et Dimensionnement précis",
          "Installation de structures au sol et en toiture",
          "Systèmes de stockage par batteries Lithium (LiFePO4)",
          "Maintenance et nettoyage périodique des modules"
        ],
        en: [
          "Solar studies and precise sizing",
          "Installation of ground-mounted and rooftop structures",
          "Lithium battery storage systems (LiFePO4)",
          "Periodic maintenance and cleaning of modules"
        ]
      }
    },
    {
      id: "pipe",
      icon: Workflow,
      title: { fr: "Tuyauterie Industrielle", en: "Industrial Piping" },
      desc: { fr: "Soudage de réseaux fluides vapeur, air comprimé, eau glacée et hydrocarbures.", en: "Welding of fluid networks: steam, compressed air, chilled water, and hydrocarbons." },
      details: {
        fr: [
          "Préfabrication de tuyauteries en atelier spécialisé",
          "Montage sur site industriel et raccordement des équipements",
          "Maintenance, réparation et épreuves de mise sous pression",
          "Choix des matériaux adaptés (Acier carbone, Inox TIG/MIG)"
        ],
        en: [
          "Prefabrication of piping in specialized workshops",
          "On-site installation and equipment connection",
          "Maintenance, repair and hydrostatic pressure testing",
          "Material selection support (Carbon steel, Stainless steel TIG/MIG)"
        ]
      }
    },
    {
      id: "civil",
      icon: Building,
      title: { fr: "Génie Civil Léger", en: "Light Civil Engineering" },
      desc: { fr: "Ouvrages en béton et fondations techniques pour équipements industriels.", en: "Concrete works and technical foundations for industrial equipment." },
      details: {
        fr: [
          "Petits ouvrages en maçonnerie et béton armé",
          "Fondations techniques de machines et groupes électrogènes",
          "Dalles de propreté et massifs de supportage",
          "Caniveaux de câblage et structures de protection"
        ],
        en: [
          "Small masonry and reinforced concrete works",
          "Technical foundations for machinery and generators",
          "Concrete slabs and support blocks",
          "Cable trenches and protective structures"
        ]
      }
    },
    {
      id: "supply",
      icon: Wrench,
      title: { fr: "Fournitures Industrielles", en: "Industrial Supplies" },
      desc: { fr: "Distribution de matériel électrique et d'équipements mécaniques certifiés.", en: "Distribution of certified electrical material and mechanical equipment." },
      details: {
        fr: [
          "Matériel électrique basse et moyenne tension (Disjoncteurs, câbles)",
          "Équipements industriels de marques mondiales (ABB, Schneider, Siemens)",
          "Pièces de rechange pour moteurs et groupes électrogènes",
          "Instrumentation de contrôle et appareils de mesure"
        ],
        en: [
          "Low and medium voltage electrical equipment (Breakers, cables)",
          "Industrial equipment from global brands (ABB, Schneider, Siemens)",
          "Spare parts for motors and generator sets",
          "Control instrumentation and measuring devices"
        ]
      }
    }
  ];

  const projects = [
    {
      id: 1,
      title: { fr: "Installation solaire hôtel", en: "Hotel Solar Installation" },
      desc: { fr: "Autonomie énergétique pour un hôtel haut de gamme.", en: "Energy autonomy for a high-end hotel." },
      category: "solaire",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200&auto=format&fit=crop",
      specs: {
        fr: { "Puissance installée": "150 kWp", "Stockage": "280 kWh Batterie Lithium", "Localisation": "Kolwezi, RDC", "Durée": "8 semaines" },
        en: { "Installed Power": "150 kWp", "Storage": "280 kWh Lithium Battery", "Location": "Kolwezi, DRC", "Duration": "8 weeks" }
      },
      fullDesc: {
        fr: "Mise en œuvre d'une solution photovoltaïque hybride permettant de couvrir 85% des besoins en électricité de l'hôtel. Le système compense les coupures et réduit l'usage des groupes diesel.",
        en: "Implementation of a hybrid photovoltaic solution covering 85% of the hotel's electricity needs. The system compensates for blackouts and reduces diesel generator usage."
      }
    },
    {
      id: 2,
      title: { fr: "Maintenance industrielle mine", en: "Mining Industrial Maintenance" },
      desc: { fr: "Arrêt technique et rénovation de lignes de broyage.", en: "Technical shutdown and renovation of grinding lines." },
      category: "industriel",
      image: "https://images.unsplash.com/photo-1581092921461-eab10380d70b?q=80&w=1200&auto=format&fit=crop",
      specs: {
        fr: { "Type": "Maintenance préventive / Rénovation", "Effectifs": "18 techniciens", "Localisation": "Lubumbashi, RDC", "Contrat": "Assistance 24h/7" },
        en: { "Type": "Preventive maintenance / Renovation", "Staff": "18 technicians", "Location": "Lubumbashi, DRC", "Contract": "24/7 Assistance" }
      },
      fullDesc: {
        fr: "Opérations mécaniques et d'automatisation lors de l'arrêt annuel de l'usine de traitement de minerai. Alignement laser des moteurs, étalonnage des capteurs et cartes automates Siemens.",
        en: "Mechanical and automation operations during the annual shutdown of the ore processing plant. Laser alignment of motors, calibration of sensors and Siemens PLC boards."
      }
    },
    {
      id: 3,
      title: { fr: "Tableau électrique industriel", en: "Industrial Electrical Cabinet" },
      desc: { fr: "Conception et montage de TGBT 3200A.", en: "Design and assembly of 3200A TGBT." },
      category: "electricite",
      image: "https://images.unsplash.com/photo-1555963966-b7ae5404b6ed?q=80&w=1200&auto=format&fit=crop",
      specs: {
        fr: { "Intensité": "3200 A", "Norme": "IEC 61439-1 / 2", "Localisation": "Likasi, RDC", "Temps": "4 semaines en atelier" },
        en: { "Current": "3200 A", "Standard": "IEC 61439-1 / 2", "Location": "Likasi, DRC", "Time": "4 weeks in workshop" }
      },
      fullDesc: {
        fr: "Conception CAO et intégration d'un Tableau Général Basse Tension (TGBT) à haute sélectivité pour une cimenterie locale. Disjoncteurs connectés communicant en temps réel les données à un SCADA.",
        en: "CAD design and integration of a High Selectivity Low Voltage Main Switchboard (TGBT) for a local cement plant. Smart breakers communicating real-time data to a SCADA."
      }
    },
    {
      id: 4,
      title: { fr: "Tuyauterie vapeur cimenterie", en: "Cement Plant Steam Piping" },
      desc: { fr: "Préfabrication et soudage inox TIG.", en: "Prefabrication and TIG stainless steel welding." },
      category: "tuyauterie",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop",
      specs: {
        fr: { "Pression": "16 bar", "Matière": "Inox 316L", "Localisation": "Likasi, RDC", "Soudage": "TIG radio à 100%" },
        en: { "Pressure": "16 bar", "Material": "Stainless Steel 316L", "Location": "Likasi, DRC", "Welding": "100% Radio TIG" }
      },
      fullDesc: {
        fr: "Préfabrication en atelier et montage sur site d'une ligne de transport de vapeur. Comprend la pose de vannes de régulation, de purgeurs de condensats et les épreuves de mise en pression hydraulique.",
        en: "Prefabrication in the workshop and on-site assembly of a steam transport line. Includes installation of control valves, condensate traps and hydraulic pressure testing."
      }
    },
    {
      id: 5,
      title: { fr: "Système SCADA brasserie", en: "Brewery SCADA System" },
      desc: { fr: "Supervision et contrôle d'une ligne d'embouteillage.", en: "Supervision and control of a bottling line." },
      category: "automatisme",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
      specs: {
        fr: { "Automates": "Siemens S7-1500", "Logiciel": "WinCC Professional", "Localisation": "Lubumbashi, RDC", "Signaux": "1200 I/O" },
        en: { "PLCs": "Siemens S7-1500", "Software": "WinCC Professional", "Location": "Lubumbashi, DRC", "Signals": "1200 I/O" }
      },
      fullDesc: {
        fr: "Refonte de l'architecture d'automatisme et mise en place d'un système de supervision SCADA. Permet le suivi en temps réel de la cadence de production, l'historisation des alarmes et l'optimisation énergétique.",
        en: "Overhaul of the automation architecture and setup of a SCADA supervision system. Allows real-time tracking of production rates, alarm logging and energy optimization."
      }
    }
  ];

  const galleryPhotos = [
    { title: "Cabines MT/BT Likasi", url: "https://images.unsplash.com/photo-1555963966-b7ae5404b6ed?q=80&w=600&auto=format&fit=crop" },
    { title: "Solaire Hôtel Kolwezi", url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=600&auto=format&fit=crop" },
    { title: "Rénovation Broyeur Mine", url: "https://images.unsplash.com/photo-1581092921461-eab10380d70b?q=80&w=600&auto=format&fit=crop" },
    { title: "Atelier Soudage Inox", url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop" },
    { title: "Supervision SCADA", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop" },
    { title: "Chantier HVAC Serveurs", url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=600&auto=format&fit=crop" }
  ];

  const serviceImages = [
    { title: "Haute Tension & Cabines", image: "https://images.unsplash.com/photo-1555963966-b7ae5404b6ed?q=80&w=1200&auto=format&fit=crop", desc: "Études et câblages robustes pour environnements exigeants." },
    { title: "Centrales Solaire Hybrides", image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200&auto=format&fit=crop", desc: "Solutions d'énergie verte fiables pour zones isolées." },
    { title: "Assistance Industrielle", image: "https://images.unsplash.com/photo-1581092921461-eab10380d70b?q=80&w=1200&auto=format&fit=crop", desc: "Des techniciens experts en astreinte continue." },
    { title: "Systèmes de Climatisation", image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=1200&auto=format&fit=crop", desc: "HVAC haute performance et gestion thermique avancée." }
  ];

  const partners = [
    { name: "ABB", logo: "ABB", type: "Équipements Électriques" },
    { name: "Schneider Electric", logo: "Schneider", type: "Distribution & Automatisme" },
    { name: "Siemens", logo: "Siemens", type: "Automates & Variateurs" },
    { name: "Caterpillar", logo: "CAT", type: "Groupes Électrogènes" }
  ];

  const faqs = [
    {
      q: "Dans quelles régions de la RDC intervenez-vous ?",
      a: "Notre siège social est basé à Lubumbashi, mais nos équipes se déplacent sur l'ensemble de la République Démocratique du Congo (notamment à Kolwezi, Likasi, Kinshasa et Goma) pour des projets industriels d'envergure, de maintenance de mines ou d'installations solaires."
    },
    {
      q: "Proposez-vous des contrats de maintenance d'astreinte 24h/7 ?",
      a: "Oui. Pour les sites critiques comme les complexes industriels, les mines et les hôtels, nous proposons des contrats de maintenance préventive et corrective avec des équipes techniques disponibles en astreinte 24h/24 et 7j/7, garantissant un temps d'intervention minimal."
    },
    {
      q: "Quelles sont les garanties sur vos installations solaires ?",
      a: "Toutes nos installations de systèmes photovoltaïques bénéficient d'une garantie matérielle constructeur allant jusqu'à 25 ans sur les panneaux solaires, 5 à 10 ans sur les onduleurs et 5 ans sur les batteries Lithium. De plus, nous garantissons notre installation technique pendant 2 ans."
    },
    {
      q: "Pouvez-vous réaliser des audits énergétiques pour réduire nos factures ?",
      a: "Absolument. Nos ingénieurs analysent vos consommations, mesurent les harmoniques, testent la sélectivité de vos protections électriques et étudient le facteur de puissance. Nous vous remettons ensuite un rapport d'audit détaillé préconisant des solutions de compensation d'énergie réactive et de délestage pour maximiser vos économies."
    }
  ];

  // Fetch blog articles, jobs and customizable texts
  useEffect(() => {
    // 1. Articles
    fetch('/api/articles')
      .then(r => r.json())
      .then(json => setBlogArticles(json.data || []))
      .catch(() => {})
      .finally(() => setBlogLoading(false));

    // 2. Jobs
    fetch('/api/jobs')
      .then(r => r.json())
      .then(json => setJobsList(json.data || []))
      .catch(() => {})
      .finally(() => setJobsLoading(false));

    // 3. Custom Texts
    fetch('/api/texts')
      .then(r => r.json())
      .then(json => {
        if (json && json.data) setDbTexts(json.data);
      })
      .catch(() => {});
  }, []);

  // Scroll spy & Nav background change
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = ['accueil', 'services', 'apropos', 'projets', 'galerie', 'carrieres', 'blog', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto scroll for hero images
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % serviceImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [serviceImages.length]);

  // Form Progress Tracker
  useEffect(() => {
    let filledFields = 0;
    const totalFields = 5;

    if (formData.fullName.trim() !== '') filledFields++;
    if (formData.email.trim() !== '' && formData.email.includes('@')) filledFields++;
    if (formData.phone.trim() !== '') filledFields++;
    if (formData.message.trim() !== '') filledFields++;
    if (formData.selectedServices.length > 0) filledFields++;

    setFormProgress(Math.min(Math.round((filledFields / totalFields) * 100), 100));
  }, [formData]);

  // Handle Form Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Toggle Services Select
  const toggleServiceSelect = (serviceTitle) => {
    const isSelected = formData.selectedServices.includes(serviceTitle);
    if (isSelected) {
      setFormData({
        ...formData,
        selectedServices: formData.selectedServices.filter((s) => s !== serviceTitle)
      });
    } else {
      setFormData({
        ...formData,
        selectedServices: [...formData.selectedServices, serviceTitle]
      });
    }
  };

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setFormError(language === 'fr' ? 'Veuillez remplir les champs obligatoires.' : 'Please fill in required fields.');
      return;
    }

    const emailPattern = /^\S+@\S+\.\S+$/;
    if (!emailPattern.test(formData.email.trim())) {
      setFormError(language === 'fr' ? 'Veuillez saisir une adresse email valide.' : 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
      setConfirmationCode(generatedCode);

      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company || null,
          sector: formData.sector || null,
          urgency: formData.urgency || null,
          services: formData.selectedServices,
          message: formData.message,
          code: generatedCode
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de l’envoi.');
      }

      const json = await response.json().catch(() => ({}));
      setEmailPreviewUrl(json?.data?.emailResult?.client?.previewUrl || '');
      setFormSuccess(true);
    } catch (err) {
      setFormError(err.message || 'Erreur inattendue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      company: '',
      sector: 'industrial',
      urgency: 'moyenne',
      selectedServices: [],
      message: ''
    });
    setFormSuccess(false);
    setConfirmationCode('');
    setEmailPreviewUrl('');
    setFormError(null);
  };

  const handleServiceQuoteClick = (serviceTitle) => {
    if (!formData.selectedServices.includes(serviceTitle)) {
      setFormData((prev) => ({
        ...prev,
        selectedServices: [...prev.selectedServices, serviceTitle]
      }));
    }
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle Career Application Submit
  const handleApplyFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setApplyError(language === 'fr' ? 'Seuls les fichiers PDF sont acceptés.' : 'Only PDF files are accepted.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setApplyError(language === 'fr' ? 'La taille maximale du fichier est de 5 Mo.' : 'Max file size is 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setApplyForm(prev => ({
          ...prev,
          cvFile: reader.result,
          cvFileName: file.name
        }));
        setApplyError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyForm.name.trim() || !applyForm.email.trim() || !applyForm.cvFile) {
      setApplyError(language === 'fr' ? 'Veuillez remplir les champs requis et déposer votre CV.' : 'Please fill required fields and drop your CV.');
      return;
    }

    setApplySubmitting(true);
    setApplyError(null);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: applyForm.name,
          email: applyForm.email,
          phone: applyForm.phone,
          jobId: selectedJob ? selectedJob.id : null,
          message: applyForm.message,
          fileData: applyForm.cvFile,
          fileName: applyForm.cvFileName
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur soumission candidature');
      }

      setApplySuccess(true);
      setApplyForm({ name: '', email: '', phone: '', message: '', cvFile: '', cvFileName: '' });
    } catch (err) {
      setApplyError(err.message || 'Erreur inattendue.');
    } finally {
      setApplySubmitting(false);
    }
  };

  // Filtered projects
  const filteredProjects = projectFilter === 'tous'
    ? projects
    : projects.filter(p => p.category === projectFilter);

  // Helper to fetch dynamic configured text or default
  const getConfText = (key, defaultText) => {
    if (dbTexts[key] && dbTexts[key][language]) {
      return dbTexts[key][language];
    }
    return defaultText;
  };

  return (
    <div className="min-h-screen text-slate-800 bg-slate-50 flex flex-col font-sans grid-bg">
      <Navbar
        activeSection={activeSection}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        scrolled={scrolled}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Hero Section */}
      <section
        id="accueil"
        className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white min-h-[95vh] flex items-center pt-24 pb-16 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 flex flex-col items-start text-left animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/50 rounded-full mb-6 glass-panel-dark">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">{t.hero_tag}</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              {t.hero_title} <br />
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                {getConfText('hero_title_accent', 'Maintenance Industrielle')}
              </span>
            </h2>
            
            <p className="text-base md:text-lg text-slate-300 max-w-xl mb-8 leading-relaxed">
              {getConfText('hero_desc', 'DIVERSIA SARL accompagne la croissance des industries, mines, complexes hôteliers et tertiaires en RDC avec des systèmes électriques de pointe, des automatismes agiles et des installations solaires durables.')}
            </p>

            <div className="flex flex-wrap gap-4 w-full sm:w-auto">
              <a
                href="#contact"
                className="w-full sm:w-auto text-center bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-xl shadow-amber-500/10 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                {t.hero_btn_quote} <ArrowRight className="h-5 w-5" />
              </a>

              <a
                href="#services"
                className="w-full sm:w-auto text-center border border-slate-700 hover:border-slate-500 bg-slate-900/40 text-slate-200 hover:text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm"
              >
                {t.hero_btn_explore}
              </a>
            </div>

            <div className="grid gap-4 mt-10 sm:grid-cols-3">
              <a
                href="#projets"
                className="group bg-slate-800/80 border border-slate-700/70 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1.5 hover:bg-slate-900 shadow-lg shadow-slate-900/10"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 mb-4">
                  <FileText className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{t.hero_action_projects}</h4>
                <p className="text-slate-300 text-xs leading-relaxed">{t.hero_action_projects_desc}</p>
              </a>

              <a
                href="/brochures/brochure_diversia.pdf"
                download
                className="group bg-slate-800/80 border border-slate-700/70 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1.5 hover:bg-slate-900 shadow-lg shadow-slate-900/10"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 mb-4">
                  <FileDown className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{t.hero_action_brochure}</h4>
                <p className="text-slate-300 text-xs leading-relaxed">{t.hero_action_brochure_desc}</p>
              </a>

              <button
                type="button"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="group text-left bg-slate-800/80 border border-slate-700/70 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1.5 hover:bg-slate-900 shadow-lg shadow-slate-900/10"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 mb-4">
                  <Phone className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{t.hero_action_expert}</h4>
                <p className="text-slate-300 text-xs leading-relaxed">{t.hero_action_expert_desc}</p>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-slate-800/80 w-full max-w-lg">
              <div>
                <span className="block text-2xl md:text-3xl font-extrabold text-amber-500">10+</span>
                <span className="text-xs text-slate-400 font-semibold">{t.metric_exp}</span>
              </div>
              <div>
                <span className="block text-2xl md:text-3xl font-extrabold text-amber-500">150+</span>
                <span className="text-xs text-slate-400 font-semibold">{t.metric_projects}</span>
              </div>
              <div>
                <span className="block text-2xl md:text-3xl font-extrabold text-amber-500">98%</span>
                <span className="text-xs text-slate-400 font-semibold">{t.metric_loyalty}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative w-full flex justify-center items-center">
            <div className="w-full max-w-[450px] aspect-[4/5] rounded-[2.5rem] bg-gradient-to-tr from-slate-800 to-indigo-950 p-2 shadow-2xl relative group overflow-hidden border border-slate-700/40">
              <div className="w-full h-full relative rounded-[2.2rem] overflow-hidden">
                {serviceImages.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10"></div>
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover transition-all duration-[6000ms] ease-linear transform scale-100 group-hover:scale-105"
                    />
                    <div className="absolute bottom-8 left-6 right-6 z-20 text-left">
                      <span className="px-2.5 py-1 bg-amber-500 text-slate-950 rounded-lg text-[10px] font-black uppercase tracking-wider mb-2 inline-block">
                        Spécificité
                      </span>
                      <h4 className="text-xl font-bold text-white mb-1 shadow-sm">
                        {slide.title}
                      </h4>
                      <p className="text-xs text-slate-300 font-medium">
                        {slide.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-6 right-6 z-30 flex gap-2">
                <button
                  onClick={() => setCurrentSlide((prev) => (prev === 0 ? serviceImages.length - 1 : prev - 1))}
                  className="bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white p-2 rounded-full backdrop-blur-md transition-all duration-300 border border-slate-700/50"
                  aria-label="Précédent"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % serviceImages.length)}
                  className="bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white p-2 rounded-full backdrop-blur-md transition-all duration-300 border border-slate-700/50"
                  aria-label="Suivant"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-amber-600 font-bold text-xs tracking-widest uppercase inline-block mb-3 bg-amber-50 px-3 py-1 rounded-full">
              {t.services_tag}
            </span>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              {t.services_title}
            </h3>
            <div className="h-1.5 w-16 bg-amber-500 mx-auto rounded-full mb-5"></div>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              {t.services_desc}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComponent = service.icon;
              const title = service.title[language] || service.title['fr'];
              const desc = service.desc[language] || service.desc['fr'];
              const details = service.details[language] || service.details['fr'];

              return (
                <div
                  key={service.id}
                  className="bg-slate-50 border border-slate-100 rounded-3xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 group relative flex flex-col h-full"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-[100px] transition-all duration-300 group-hover:bg-amber-500/10 pointer-events-none rounded-tr-3xl"></div>

                  <div className="bg-slate-900 text-amber-500 p-4 rounded-2xl w-14 h-14 flex items-center justify-center mb-6 shadow-md transition-transform duration-300 group-hover:scale-110">
                    <IconComponent className="h-6 w-6 stroke-[2]" />
                  </div>

                  <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors text-left">
                    {title}
                  </h4>

                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-6 flex-grow text-left">
                    {desc}
                  </p>

                  <ul className="space-y-2 mb-8 pt-4 border-t border-slate-200/60">
                    {details.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 text-left">
                        <Check className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleServiceQuoteClick(title)}
                    className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-900 text-white font-bold text-xs py-3.5 px-4 rounded-xl transition-all duration-300 mt-auto flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    {t.services_btn} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* PDF Brochure Download Direct Trigger */}
          <div className="mt-12 text-center">
            <a
              href="/brochures/brochure_diversia.pdf"
              download
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 font-bold px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all duration-300 shadow-md"
            >
              <FileDown className="h-4.5 w-4.5" /> {t.brochure_download}
            </a>
          </div>
        </div>
      </section>

      {/* About Us (À propos) */}
      <section id="apropos" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-700">
              <img
                src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop"
                alt="Équipe technique Diversia"
                className="w-full object-cover aspect-[4/3] lg:aspect-[3/4]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            </div>

            <div className="absolute -bottom-6 -right-6 bg-amber-500 text-slate-950 p-6 rounded-3xl shadow-2xl max-w-[200px] text-left hidden sm:block">
              <Award className="h-8 w-8 mb-2 stroke-[1.5]" />
              <h5 className="font-extrabold text-lg leading-none">SARL RDC</h5>
              <p className="text-[10px] font-semibold mt-1 text-slate-800">Lubumbashi - Haut Katanga</p>
            </div>
          </div>

          <div className="lg:col-span-7 text-left flex flex-col items-start">
            <span className="text-amber-500 font-bold text-xs tracking-widest uppercase inline-block mb-3">
              {t.about_tag}
            </span>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight">
              {t.about_title}
            </h3>
            
            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8">
              {getConfText('about_intro', 'DIVERSIA SARL est une société de droit congolais constituée de professionnels passionnés par le génie électrique et l’assistance technique. Nous offrons des solutions clé en main qui combinent innovation technologique, exigences environnementales et efficacité économique.')}
            </p>

            {/* Interactive Tabs Header */}
            <div className="flex border-b border-slate-800 w-full mb-6 overflow-x-auto">
              {[
                { id: 'historique', label: t.tab_history },
                { id: 'vision', label: t.tab_vision },
                { id: 'valeurs', label: t.tab_values },
                { id: 'equipe', label: t.tab_team }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveAboutTab(tab.id)}
                  className={`pb-4 px-4 font-bold text-xs tracking-wider uppercase border-b-2 transition-all relative shrink-0 ${
                    activeAboutTab === tab.id
                      ? 'border-amber-500 text-amber-500'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Interactive Tabs Body */}
            <div className="min-h-[160px] w-full text-slate-300 text-sm leading-relaxed">
              {activeAboutTab === 'historique' && (
                <div className="space-y-4 animate-fade-in">
                  <p>
                    {language === 'fr' 
                      ? "Fondée en 2026 en République Démocratique du Congo, DIVERSIA SARL s'est rapidement imposée comme un prestataire technique de premier plan pour les entreprises minières du Haut-Katanga et du Lualaba."
                      : "Founded in 2026 in the Democratic Republic of Congo, DIVERSIA SARL has quickly established itself as a leading technical contractor for mining companies in Haut-Katanga and Lualaba."}
                  </p>
                  <p>
                    {language === 'fr'
                      ? "En nous installant au cœur de la ceinture de cuivre, nous avons su répondre aux enjeux de réactivité critique et de mise en conformité internationale des installations MT/BT."
                      : "By settling at the heart of the copperbelt, we met critical responsiveness challenges and supported the international standard compliance of MV/LV installations."}
                  </p>
                </div>
              )}

              {activeAboutTab === 'vision' && (
                <div className="space-y-4 animate-fade-in">
                  <p>
                    {language === 'fr'
                      ? "Notre mission est de sécuriser, moderniser et verdir l'infrastructure industrielle de l'Afrique Centrale. Nous visons à être le partenaire de référence en ingénierie hybride solaire et automatisme."
                      : "Our mission is to secure, modernize, and green the industrial infrastructure of Central Africa. We aim to be the partner of choice in hybrid solar engineering and process automation."}
                  </p>
                  <p>
                    {language === 'fr'
                      ? "Nous allions l'excellence d'ingénierie et le respect strict des normes HSQE pour garantir zéro accident sur tous nos chantiers."
                      : "We combine engineering excellence and strict compliance with HSQE standards to guarantee zero accidents on all our construction sites."}
                  </p>
                </div>
              )}

              {activeAboutTab === 'valeurs' && (
                <div className="space-y-4 animate-fade-in">
                  <p>
                    {language === 'fr'
                      ? "Rigueur technique, Responsabilité environnementale et Transparence commerciale. Nos offres sont claires et nos chantiers documentés à chaque étape."
                      : "Technical rigor, Environmental responsibility, and Commercial transparency. Our proposals are clear, and our project steps are detailed at every stage."}
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-amber-500/10 text-amber-500 rounded-lg"><Check className="h-4 w-4" /></div>
                      <span className="text-xs font-semibold text-white">Ingénieurs Qualifiés</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-amber-500/10 text-amber-500 rounded-lg"><Check className="h-4 w-4" /></div>
                      <span className="text-xs font-semibold text-white">Garanties Constructeurs</span>
                    </div>
                  </div>
                </div>
              )}

              {activeAboutTab === 'equipe' && (
                <div className="space-y-4 animate-fade-in">
                  <p>
                    {language === 'fr'
                      ? "Une équipe dirigeante pluridisciplinaire unissant des ingénieurs séniors expatriés et locaux cumulant plus de 15 ans d'expérience opérationnelle sur le continent."
                      : "A multidisciplinary management team combining senior expat and local engineers accumulating over 15 years of operational experience on the continent."}
                  </p>
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-750">
                      <span className="block font-bold text-xs text-white">Marc K.</span>
                      <span className="block text-[10px] text-amber-500">Directeur Technique</span>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-750">
                      <span className="block font-bold text-xs text-white">Sarah T.</span>
                      <span className="block text-[10px] text-amber-500">Resp. Projets Solaire</span>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-750">
                      <span className="block font-bold text-xs text-white">Jean M.</span>
                      <span className="block text-[10px] text-amber-500">Gérant SARL</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Showcase */}
      <section id="projets" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-amber-600 font-bold text-xs tracking-widest uppercase inline-block mb-3 bg-amber-50 px-3 py-1 rounded-full">
              {t.projects_tag}
            </span>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              {t.projects_title}
            </h3>
            <div className="h-1.5 w-16 bg-amber-500 mx-auto rounded-full mb-5"></div>
            <p className="text-slate-600 text-sm leading-relaxed">
              {t.projects_desc}
            </p>

            {/* Filter buttons */}
            <div className="flex justify-center flex-wrap gap-2.5 mt-8">
              {[
                { label: t.filter_all, filter: 'tous' },
                { label: t.filter_elec, filter: 'electricite' },
                { label: t.filter_solar, filter: 'solaire' },
                { label: t.filter_ind, filter: 'industriel' },
                { label: t.filter_pipe, filter: 'tuyauterie' },
                { label: t.filter_auto, filter: 'automatisme' }
              ].map((btn) => (
                <button
                  key={btn.filter}
                  onClick={() => setProjectFilter(btn.filter)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-300 cursor-pointer ${
                    projectFilter === btn.filter
                      ? 'bg-amber-500 text-slate-900 shadow-md shadow-amber-500/10 scale-105'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Projects grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {filteredProjects.map((project) => {
              const title = project.title[language] || project.title['fr'];
              const desc = project.desc[language] || project.desc['fr'];

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="group cursor-pointer bg-slate-50 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-slate-100"
                >
                  <div className="h-60 w-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/50 transition-colors duration-300 z-10"></div>
                    <img
                      src={project.image}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <span className="absolute top-4 left-4 z-20 bg-slate-900/90 text-amber-500 px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-slate-800">
                      {project.category}
                    </span>
                  </div>

                  <div className="p-6 text-left flex flex-col items-start">
                    <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                      {title}
                    </h4>
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-4">
                      {desc}
                    </p>
                    <span className="text-[11px] font-bold text-amber-600 group-hover:translate-x-1.5 transition-transform duration-300 flex items-center gap-1.5 uppercase tracking-wider mt-auto">
                      {language === 'fr' ? 'Voir la fiche projet' : 'View project spec'} <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project details modal */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="relative bg-white text-slate-800 rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-slide-up">
              
              <div className="h-64 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-slate-900/10"></div>
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title[language]}
                  className="w-full h-full object-cover"
                />
                
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white p-2.5 rounded-full transition-all duration-300 border border-slate-700/50 cursor-pointer"
                  aria-label="Fermer la modal"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="absolute bottom-6 left-6 text-left">
                  <span className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest mb-2 inline-block">
                    {t.modal_successful}
                  </span>
                  <h4 className="text-2xl font-bold text-white leading-tight">
                    {selectedProject.title[language] || selectedProject.title['fr']}
                  </h4>
                </div>
              </div>

              <div className="p-8 text-left">
                <h5 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" /> {t.modal_specs}
                </h5>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {Object.entries(selectedProject.specs[language] || selectedProject.specs['fr']).map(([key, value]) => (
                    <div key={key} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">{key}</span>
                      <span className="text-sm font-bold text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="h-[1px] bg-slate-100 my-6"></div>

                <h5 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-amber-500" /> {t.modal_desc}
                </h5>
                
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  {selectedProject.fullDesc[language] || selectedProject.fullDesc['fr']}
                </p>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {t.modal_close}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Photo Gallery Section */}
      <section id="galerie" className="py-24 bg-slate-150 border-t border-slate-200/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-amber-600 font-bold text-xs tracking-widest uppercase inline-block mb-3 bg-amber-50 px-3 py-1 rounded-full">
              {t.gallery_tag}
            </span>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              {t.gallery_title}
            </h3>
            <div className="h-1.5 w-16 bg-amber-500 mx-auto rounded-full mb-5"></div>
            <p className="text-slate-600 text-sm leading-relaxed">
              {t.gallery_desc}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {galleryPhotos.map((photo, i) => (
              <div key={i} className="group relative rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 aspect-video md:aspect-square">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <span className="text-white text-xs font-bold tracking-wide uppercase border-l-2 border-amber-500 pl-3">
                    {photo.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Careers / Recrutement Section */}
      <section id="carrieres" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-amber-600 font-bold text-xs tracking-widest uppercase inline-block mb-3 bg-amber-50 px-3 py-1 rounded-full">
              {t.careers_tag}
            </span>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              {t.careers_title}
            </h3>
            <div className="h-1.5 w-16 bg-amber-500 mx-auto rounded-full mb-5"></div>
            <p className="text-slate-600 text-sm leading-relaxed">
              {t.careers_desc}
            </p>
          </div>

          {jobsLoading ? (
            <div className="text-center py-10 text-slate-400">Loading...</div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {jobsList.map((job) => {
                const title = job.title_en && language === 'en' ? job.title_en : job.title;
                const desc = job.description_en && language === 'en' ? job.description_en : job.description;

                return (
                  <div key={job.id} className="bg-slate-50 border border-slate-100 p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 text-left hover:shadow-md transition-shadow">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap gap-2.5">
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          {t.job_location} : {job.location || 'Lubumbashi'}
                        </span>
                        <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          {t.job_type} : {job.type || 'CDI'}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-slate-900">{title}</h4>
                      <p className="text-slate-600 text-xs md:text-sm leading-relaxed">{desc}</p>
                    </div>

                    <button
                      onClick={() => { setSelectedJob(job); setShowApplyModal(true); }}
                      className="bg-slate-900 hover:bg-amber-500 hover:text-slate-900 text-white font-bold text-xs py-3.5 px-6 rounded-xl transition-all self-start md:self-center shrink-0 cursor-pointer"
                    >
                      {t.btn_apply}
                    </button>
                  </div>
                );
              })}

              {jobsList.length === 0 && (
                <div className="bg-slate-50 border border-slate-150 p-8 rounded-[2rem] text-center text-slate-500">
                  <p className="mb-6 text-sm">{t.careers_no_jobs}</p>
                  <button
                    onClick={() => { setSelectedJob(null); setShowApplyModal(true); }}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    {t.btn_spontaneous}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Apply Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="relative bg-white text-slate-800 rounded-[2.5rem] shadow-2xl max-w-xl w-full p-8 md:p-10 border border-slate-200 animate-slide-up text-left">
              <button
                onClick={() => { setShowApplyModal(false); setApplySuccess(false); setApplyError(null); }}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>

              <h4 className="text-2xl font-extrabold text-slate-900 mb-2">{t.apply_modal_title}</h4>
              <p className="text-slate-400 text-xs mb-6">
                {selectedJob ? `${t.apply_job} : ${selectedJob.title_en && language === 'en' ? selectedJob.title_en : selectedJob.title}` : t.btn_spontaneous}
              </p>

              {applySuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="inline-flex bg-emerald-50 text-emerald-600 p-3 rounded-full">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <p className="text-emerald-700 font-bold text-sm">{t.apply_success}</p>
                  <button
                    onClick={() => { setShowApplyModal(false); setApplySuccess(false); }}
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    {t.modal_close}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.apply_name}</label>
                    <input
                      type="text"
                      required
                      value={applyForm.name}
                      onChange={e => setApplyForm({ ...applyForm, name: e.target.value })}
                      placeholder="Jean Mukendi"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.apply_email}</label>
                      <input
                        type="email"
                        required
                        value={applyForm.email}
                        onChange={e => setApplyForm({ ...applyForm, email: e.target.value })}
                        placeholder="jean@gmail.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.apply_phone}</label>
                      <input
                        type="tel"
                        required
                        value={applyForm.phone}
                        onChange={e => setApplyForm({ ...applyForm, phone: e.target.value })}
                        placeholder="+243 851 140 332"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.apply_message}</label>
                    <textarea
                      rows={3}
                      value={applyForm.message}
                      onChange={e => setApplyForm({ ...applyForm, message: e.target.value })}
                      placeholder="Pourquoi souhaitez-vous postuler ?"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t.apply_cv}</label>
                    <input
                      type="file"
                      accept=".pdf"
                      required
                      onChange={handleApplyFileChange}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
                    />
                    {applyForm.cvFileName && <span className="block mt-1.5 text-xs text-slate-400 font-semibold">Fichier sélectionné : {applyForm.cvFileName}</span>}
                  </div>

                  {applyError && <div className="text-xs text-red-600">{applyError}</div>}

                  <button
                    type="submit"
                    disabled={applySubmitting}
                    className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                  >
                    {applySubmitting ? '...' : t.apply_btn_submit}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-14">
            <span className="text-amber-600 font-bold text-xs tracking-widest uppercase inline-block mb-3">Conseils & Actualités</span>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Blog <span className="text-amber-500">&</span> Innovations
            </h3>
            <p className="text-slate-600 text-sm max-w-xl mx-auto">
              Conseils techniques, retours sur nos réalisations et innovations du secteur industriel et énergétique en RDC.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 mb-10">
            {[
              { key: 'tous', label: 'Tous les articles' },
              { key: 'conseils', label: 'Conseils Techniques' },
              { key: 'realisations', label: 'Réalisations' },
              { key: 'innovations', label: 'Innovations' },
              { key: 'projets', label: 'Nouveaux Projets' }
            ].map(btn => (
              <button
                key={btn.key}
                onClick={() => setBlogFilter(btn.key)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  blogFilter === btn.key
                    ? 'bg-amber-500 text-slate-900 shadow-md shadow-amber-500/20 scale-105'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {blogLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-[2rem] overflow-hidden border border-slate-100 animate-pulse">
                  <div className="h-52 bg-slate-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-6 bg-slate-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-8">
                {(blogFilter === 'tous' ? blogArticles : blogArticles.filter(a => a.category === blogFilter)).map(article => (
                  <article
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="group cursor-pointer bg-slate-50 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-slate-100"
                  >
                    <div className="h-52 w-full overflow-hidden relative">
                      <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/50 transition-colors duration-300 z-10" />
                      <img
                        src={article.image || 'https://images.unsplash.com/photo-1581092921461-eab10380d70b?q=80&w=800&auto=format&fit=crop'}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1581092921461-eab10380d70b?q=80&w=800&auto=format&fit=crop'; }}
                      />
                      <span className="absolute top-4 left-4 z-20 bg-slate-900/90 text-amber-500 px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-slate-800">
                        {article.category}
                      </span>
                    </div>
                    <div className="p-6 text-left flex flex-col">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-2">
                        {new Date(article.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <h4 className="text-base font-bold text-slate-900 mb-2 leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                      <span className="text-[11px] font-bold text-amber-600 group-hover:translate-x-1.5 transition-transform duration-300 flex items-center gap-1.5 uppercase tracking-wider mt-auto">
                        Lire l'article <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
              {(blogFilter === 'tous' ? blogArticles : blogArticles.filter(a => a.category === blogFilter)).length === 0 && (
                <div className="text-center py-16 text-slate-400 text-sm">
                  Aucun article dans cette catégorie pour le moment.
                </div>
              )}
            </>
          )}
        </div>

        {selectedArticle && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center p-4 pt-10 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedArticle(null)}
          >
            <div
              className="relative bg-white text-slate-800 rounded-[2.5rem] shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-slide-up my-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="h-64 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-slate-900/10" />
                <img
                  src={selectedArticle.image || 'https://images.unsplash.com/photo-1581092921461-eab10380d70b?q=80&w=1200&auto=format&fit=crop'}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1581092921461-eab10380d70b?q=80&w=1200&auto=format&fit=crop'; }}
                />
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-4 right-4 z-20 bg-slate-950/70 hover:bg-slate-950 text-white rounded-full p-2 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="absolute bottom-5 left-6 z-10">
                  <span className="bg-amber-500 text-slate-900 px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                    {selectedArticle.category}
                  </span>
                </div>
              </div>
              <div className="p-8 text-left">
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mb-3">
                  {new Date(selectedArticle.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 leading-tight">
                  {selectedArticle.title}
                </h3>
                {selectedArticle.excerpt && (
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 italic border-l-4 border-amber-400 pl-4">
                    {selectedArticle.excerpt}
                  </p>
                )}
                <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
                  {selectedArticle.content && selectedArticle.content.split('\n').map((para, i) =>
                    para.trim() ? <p key={i} className="mb-4">{para}</p> : null
                  )}
                </div>
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-900 font-bold px-6 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer"
                  >
                    Fermer l'article
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Partners Section */}
      <section id="partenaires" className="py-20 bg-slate-50 border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-amber-600 font-bold text-xs tracking-widest uppercase inline-block mb-3">
            Matériel Professionnel
          </span>
          <h3 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Partenaires & Marques
          </h3>
          <p className="text-slate-600 text-xs md:text-sm max-w-xl mx-auto mb-12">
            Nous concevons vos systèmes avec du matériel provenant exclusivement des leaders mondiaux de l'ingénierie électrique et mécanique.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 font-extrabold text-slate-900 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-md hover:border-amber-500/30 group"
              >
                <div className="bg-slate-50 text-slate-700 p-2.5 rounded-xl text-lg font-black w-full text-center group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                  {partner.logo}
                </div>
                <span className="block font-bold text-sm text-slate-900 mt-3">{partner.name}</span>
                <span className="block text-[10px] text-slate-400 font-semibold mt-1 uppercase tracking-wide">{partner.type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <HelpCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
            <h3 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
              {t.faq_title}
            </h3>
            <p className="text-slate-600 text-xs md:text-sm">
              {t.faq_desc}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200/80 rounded-2xl overflow-hidden transition-all duration-200 bg-slate-50/50 hover:bg-slate-50"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center px-6 py-5 text-left font-bold text-slate-800 hover:text-amber-600 transition-colors cursor-pointer"
                >
                  <span className="text-sm md:text-base">{faq.q}</span>
                  {openFaq === idx ? (
                    <Minus className="h-4 w-4 text-amber-600 flex-shrink-0 ml-4" />
                  ) : (
                    <Plus className="h-4 w-4 text-slate-400 flex-shrink-0 ml-4" />
                  )}
                </button>

                {openFaq === idx && (
                  <div className="px-6 pb-6 text-slate-600 text-xs md:text-sm leading-relaxed border-t border-slate-200/40 pt-4 bg-white animate-fade-in text-left">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Advanced Quote Form */}
      <section id="contact" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 relative z-10">
          
          <div className="lg:col-span-5 text-left flex flex-col justify-between">
            <div>
              <span className="text-amber-500 font-bold text-xs tracking-widest uppercase inline-block mb-3">
                {t.contact_tag}
              </span>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight">
                {t.contact_title}
              </h3>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8">
                {t.contact_desc}
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-800 text-amber-500 rounded-xl border border-slate-700">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">{t.info_address}</span>
                    <span className="text-sm font-semibold text-slate-200">Lubumbashi – RDC</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-800 text-amber-500 rounded-xl border border-slate-700">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">{t.info_phone}</span>
                    <a href="tel:+243851140332" className="text-sm font-semibold text-slate-200 hover:text-amber-500 transition-colors">+243 851 140 332</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-800 text-amber-500 rounded-xl border border-slate-700">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">{t.info_email}</span>
                    <a href="mailto:contact@diversia.cd" className="text-sm font-semibold text-slate-200 hover:text-amber-500 transition-colors">contact@diversia.cd</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-800 text-amber-500 rounded-xl border border-slate-700">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">{t.info_web}</span>
                    <span className="text-sm font-semibold text-slate-200">www.diversia.cd</span>
                  </div>
                </div>
              </div>

              {/* Embedded Google Maps */}
              <div className="mt-8 rounded-3xl overflow-hidden border border-slate-800 shadow-lg h-56 relative">
                <iframe
                  title="Localisation Diversia Lubumbashi"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125345.97230491878!2d27.423984632863955!3d-11.666993188582236!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19723ea5561a007b%3A0xea2be10cbfb9d47d!2sLubumbashi%2C%20RDC!5e0!3m2!1sfr!2s!4v1780560000000!5m2!1sfr!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white text-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-slate-100 rounded-t-[2.5rem] overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${formProgress}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="text-left">
                <h4 className="text-xl md:text-2xl font-extrabold text-slate-900">{t.form_title}</h4>
                <p className="text-slate-400 text-xs mt-1">{t.form_subtitle}</p>
              </div>
              <span className="bg-amber-100 text-amber-800 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                {formProgress}%
              </span>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-left">
                  {t.form_step1}
                </span>
                
                <div className="flex flex-wrap gap-2">
                  {[
                    "Électricité MT/BT",
                    "Maintenance Industrielle",
                    "Énergie Solaire",
                    "Groupes Électrogènes",
                    "Automatisme & SCADA",
                    "Tuyauterie",
                    "HVAC & Climatisation"
                  ].map((serviceTitle) => {
                    const isSelected = formData.selectedServices.includes(serviceTitle);
                    return (
                      <button
                        key={serviceTitle}
                        type="button"
                        onClick={() => toggleServiceSelect(serviceTitle)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-md shadow-amber-500/10'
                            : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{serviceTitle}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-left">
                    {t.form_name}
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Jean Mukendi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-left">
                    {t.form_email}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="jean@entreprise.cd"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-left">
                    {t.form_phone}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+243 851 140 332"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-left">
                    {t.form_company}
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Optionnel"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sector" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-left">
                    {t.form_sector}
                  </label>
                  <select
                    id="sector"
                    name="sector"
                    value={formData.sector}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800"
                  >
                    <option value="industrial">Industriel & Manufacturier</option>
                    <option value="mining">Minier</option>
                    <option value="commercial">Hôtel & Commercial</option>
                    <option value="residential">Résidentiel & Privé</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="urgency" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-left">
                    {t.form_urgency}
                  </label>
                  <div className="flex gap-2">
                    {[
                      { val: 'basse', label: language === 'fr' ? 'Planifié' : 'Planned' },
                      { val: 'moyenne', label: language === 'fr' ? 'Important' : 'Important' },
                      { val: 'haute', label: language === 'fr' ? 'Urgente' : 'Urgent' }
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setFormData({ ...formData, urgency: item.val })}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          formData.urgency === item.val
                            ? item.val === 'haute'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20'
                              : 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-left">
                  {t.form_need}
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre besoin technique..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? t.form_btn_submitting : <>{t.form_btn_submit} <ArrowRight className="h-4 w-4" /></>}
              </button>
              {formError && <div className="mt-4 text-sm text-red-600">{formError}</div>}
            </form>

            {formSuccess && (
              <div className="absolute inset-0 bg-white rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-center items-center text-center animate-fade-in z-20">
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full mb-6">
                  <CheckCircle2 className="h-16 w-16 stroke-[1.5]" />
                </div>
                
                <h4 className="text-2xl font-extrabold text-slate-900 mb-2">{t.form_success_title}</h4>
                <p className="text-slate-500 text-xs md:text-sm max-w-sm mb-8 leading-relaxed">
                  Merci, <strong className="text-slate-800">{formData.fullName}</strong>. {t.form_success_desc} pour <strong className="text-slate-800">{formData.selectedServices.join(', ')}</strong>.
                </p>

                {confirmationCode && (
                  <div className="mb-6 text-center">
                    <p className="text-slate-500 text-sm">Code de confirmation :</p>
                    <div className="text-2xl font-extrabold text-slate-900">{confirmationCode}</div>
                  </div>
                )}

                {emailPreviewUrl && (
                  <div className="mb-6 text-center text-xs text-slate-500">
                    <p className="font-semibold text-slate-800 mb-2">Aperçu du mail envoyé</p>
                    <a href={emailPreviewUrl} target="_blank" rel="noreferrer" className="underline text-amber-500 hover:text-amber-600 break-words">
                      {emailPreviewUrl}
                    </a>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={resetForm}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {t.form_new_btn}
                  </button>
                  <a
                    href="#accueil"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    {t.form_home_btn}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Floating Chat Widget */}
      <ChatWidget language={language} t={t} />

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900 text-left">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12">
          
          <div className="md:col-span-5 space-y-4">
            <a href="#accueil" className="flex items-center gap-3 group w-max">
              <div className="bg-amber-500 text-slate-900 p-2 rounded-xl transition-transform shadow-lg">
                <Zap className="h-5 w-5 fill-slate-900" />
              </div>
              <span className="text-xl font-black tracking-wider text-white">DIVERSIA <span className="text-amber-500">SARL</span></span>
            </a>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {t.footer_desc}
            </p>
            <span className="block text-[11px] text-slate-500 font-medium">
              RC. L'SHI / RCCM / 18-B-8540 • N° ID NAT. 6-120-N4520A
            </span>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h5 className="text-white font-bold text-xs uppercase tracking-widest">{t.footer_nav}</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#accueil" className="hover:text-amber-500 transition-colors">{t.nav_home}</a></li>
              <li><a href="#services" className="hover:text-amber-500 transition-colors">{t.nav_services}</a></li>
              <li><a href="#apropos" className="hover:text-amber-500 transition-colors">{t.nav_about}</a></li>
              <li><a href="#projets" className="hover:text-amber-500 transition-colors">{t.nav_projects}</a></li>
              <li><a href="#galerie" className="hover:text-amber-500 transition-colors">{t.nav_gallery}</a></li>
              <li><a href="#carrieres" className="hover:text-amber-500 transition-colors">{t.nav_careers}</a></li>
              <li><a href="#blog" className="hover:text-amber-500 transition-colors">{t.nav_blog}</a></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h5 className="text-white font-bold text-xs uppercase tracking-widest">{t.footer_poles}</h5>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 bg-amber-500 rounded-full"></span> Lignes Moyenne & Basse Tension</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 bg-amber-500 rounded-full"></span> Centrales Solaires Hybrides</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 bg-amber-500 rounded-full"></span> Maintenance sur sites miniers</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 bg-amber-500 rounded-full"></span> Automatisme (Siemens / SCADA)</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <span>{t.footer_copyright}</span>
          <div className="flex gap-6">
            {t.footer_links.map((link, idx) => (
              <a key={idx} href="#contact" className="hover:text-amber-500">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
