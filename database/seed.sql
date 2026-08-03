USE `diversia`;

-- --------------------------------------------------------
-- Seed data for table `contacts`
-- --------------------------------------------------------
INSERT INTO `contacts` (`name`, `email`, `phone`, `company`, `sector`, `urgency`, `services`, `message`, `status`, `admin_notes`, `created_at`) VALUES
('Jean Mukendi', 'j.mukendi@katangamining.cd', '+243 851 140 332', 'Katanga Mining', 'mining', 'haute', '["Maintenance Industrielle","Automatisme & SCADA"]', 'Besoin urgent d\'un arrêt technique pour réalignement laser sur le broyeur principal et audit du système SCADA Siemens.', 'in_progress', 'Technicien assigné : Marc. Visite planifiée le 15 Juin.', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('Sarah Kabange', 's.kabange@hotelkaravia.com', '+243 812 345 678', 'Grand Karavia Hotel', 'commercial', 'moyenne', '["Énergie Solaire","HVAC & Climatisation"]', 'Demande de devis pour une centrale solaire hybride de 100kWp en toiture afin d\'alimenter nos cuisines et chambres.', 'new', 'En attente de l\'étude d\'ensoleillement par le bureau d\'études.', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('Michel Ilunga', 'm.ilunga@cimenterie.cd', '+243 998 765 432', 'Cimenterie du Katanga', 'industrial', 'haute', '["Électricité MT/BT","Groupes Électrogènes"]', 'Coupures répétées sur le TGBT 3200A. Nous avons besoin d\'un diagnostic d\'excitation et de régulation AVR sur notre groupe électrogène de secours de 1500kVA.', 'urgent', 'ALERTE : Contacter le client sous 2h.', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('David Tshibanda', 'd.tshibanda@gmail.com', '+243 897 123 456', NULL, 'residential', 'basse', '["Énergie Solaire"]', 'Bonjour, je souhaite équiper ma résidence privée d\'un système solaire autonome de 5kWp avec batteries Lithium. Merci pour votre offre.', 'resolved', 'Devis envoyé par email le 11 Juin. Client très satisfait de notre réactivité.', DATE_SUB(NOW(), INTERVAL 8 DAY)),
('Alphonse Mamba', 'a.mamba@lualabafonderie.cd', '+243 823 456 789', 'Fonderie Lualaba', 'industrial', 'moyenne', '["Tuyauterie","Automatisme & SCADA"]', 'Remplacement d\'une section de tuyauterie vapeur TIG inox et reprogrammation de l\'automate Schneider TSX.', 'in_progress', 'Soudage programmé le week-end prochain.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Clara Kisimba', 'c.kisimba@clinique-espoir.cd', '+243 852 987 654', 'Clinique Espoir', 'commercial', 'haute', '["Groupes Électrogènes","HVAC & Climatisation"]', 'Maintenance préventive annuelle de notre groupe électrogène CAT de secours et nettoyage des CTA de la zone bloc opératoire.', 'new', NULL, DATE_SUB(NOW(), INTERVAL 12 HOUR));

-- --------------------------------------------------------
-- Seed data for table `operations`
-- --------------------------------------------------------
INSERT INTO `operations` (`action`, `user`, `module`, `details`, `timestamp`) VALUES
('update_config', 'system', 'auth', 'Mise à jour de la configuration de session et clés de chiffrement.', DATE_SUB(NOW(), INTERVAL 10 HOUR)),
('deploy_release', 'deploy_bot', 'deployment', 'Déploiement de la version v1.2.0 de la plateforme de production.', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
('create_request', 'public', 'contact', 'Nouvelle demande de devis reçue de Sarah Kabange (Grand Karavia Hotel).', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('create_request', 'public', 'contact', 'Nouvelle demande urgente reçue de Michel Ilunga (Cimenterie du Katanga).', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('update_request_status', 'admin', 'contact', 'Request 4 (David Tshibanda) -> resolved', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
('update_request_status', 'admin', 'contact', 'Request 1 (Jean Mukendi) -> in_progress', DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- --------------------------------------------------------
-- Seed data for table `articles`
-- --------------------------------------------------------
INSERT INTO `articles` (`title`, `category`, `excerpt`, `content`, `image_url`, `created_at`) VALUES
('Transition vers l\'énergie solaire pour les PME en RDC', 'conseils', 'Découvrez les étapes clés et les avantages économiques d\'une transition solaire pour les entreprises en Afrique Centrale.', 'L\'énergie solaire photovoltaïque représente une opportunité majeure pour les PME en République Démocratique du Congo. Avec les baisses de coûts constantes sur le matériel (batteries lithium, onduleurs hybrides et panneaux) et le taux d\'ensoleillement exceptionnel de la région du Katanga, s\'équiper d\'une centrale solaire permet de stabiliser sa fourniture d\'électricité et de réduire considérablement la facture énergétique globale.\n\nDans cet article, nous passons en revue les critères de dimensionnement à respecter, les types de stockages conseillés (LiFePO4) et le retour sur investissement estimé qui se situe en général entre 4 et 6 ans.', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200&auto=format&fit=crop', DATE_SUB(NOW(), INTERVAL 10 DAY)),
('Modernisation d\'armoires électriques (Retrofit) : Pourquoi et comment ?', 'innovations', 'Évitez l\'obsolescence de vos installations industrielles en modernisant vos TGBT et automates sans remplacer toute l\'infrastructure.', 'La modernisation technique (ou Retrofit) consiste à remplacer les éléments de protection et de contrôle commande vieillissants par du matériel de dernière génération au sein d\'armoires électriques existantes.\n\nCette démarche offre de nombreux avantages :\n1. Économies majeures par rapport au remplacement complet de la cabine.\n2. Intégration de la communication réseau (SCADA, Modbus, Profinet).\n3. Amélioration instantanée de la sécurité des opérateurs.\n\nNos équipes chez Diversia interviennent sur site pour réaliser des audits et moderniser vos équipements dans un temps record afin de limiter la durée d\'arrêt technique de votre chaîne de production.', 'https://images.unsplash.com/photo-1555963966-b7ae5404b6ed?q=80&w=1200&auto=format&fit=crop', DATE_SUB(NOW(), INTERVAL 6 DAY)),
('Retour sur la réhabilitation du système SCADA de la cimenterie de Likasi', 'realisations', 'Découvrez comment nous avons restructuré l\'ensemble du contrôle-commande et automatisé les broyeurs principaux de notre client.', 'Diversia a mené à bien la rénovation complète de la supervision industrielle de la cimenterie locale. Ce projet a consisté à remplacer un système SCADA obsolète par une architecture distribuée moderne basée sur des automates Siemens S7-1500 et une interface de contrôle WinCC.\n\nLe résultat : une réactivité accrue sur les diagnostics de pannes, un enregistrement continu des courbes de production et une baisse de 15% des temps d\'arrêt imprévus du processus de cuisson.', 'https://images.unsplash.com/photo-1581092921461-eab10380d70b?q=80&w=1200&auto=format&fit=crop', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- --------------------------------------------------------
-- Seed data for table `jobs`
-- --------------------------------------------------------
INSERT INTO `jobs` (`title`, `title_en`, `description`, `description_en`, `location`, `type`) VALUES
('Ingénieur Électricien Industriel Sénior', 'Senior Industrial Electrical Engineer', 'Sous la direction du directeur technique, vous piloterez le dimensionnement des installations MT/BT, la validation des schémas unifilaires et la mise en service sur les sites miniers du Katanga.', 'Under the direction of the technical director, you will drive the design of MV/LV installations, validate single-line diagrams, and handle commissioning on mine sites in Katanga.', 'Lubumbashi', 'CDI'),
('Technicien Maintenance Groupes Électrogènes', 'Generator Maintenance Technician', 'Assurer la maintenance préventive et corrective de notre parc de groupes électrogènes (Caterpillar, Cummins). Astreintes régulières.', 'Ensure preventive and corrective maintenance of our generator fleet (Caterpillar, Cummins). Regular on-call shifts.', 'Kolwezi', 'CDI'),
('Automaticien de Procédés SCADA', 'SCADA Process Automation Specialist', 'Programmation d\'automates Siemens S7-1500 / Schneider Electric et développement d\'interfaces IHM/WinCC pour nos clients industriels.', 'Programming of Siemens S7-1500 / Schneider Electric PLCs and development of HMI/WinCC interfaces for our industrial clients.', 'Lubumbashi', 'CDI');

-- --------------------------------------------------------
-- Seed data for table `texts`
-- --------------------------------------------------------
INSERT INTO `texts` (`key_name`, `content_fr`, `content_en`) VALUES
('hero_title_accent', 'Maintenance Industrielle', 'Industrial Maintenance'),
('hero_desc', 'DIVERSIA SARL accompagne la croissance des industries, mines, complexes hôteliers et tertiaires en RDC avec des systèmes électriques de pointe, des automatismes agiles et des installations solaires durables.', 'DIVERSIA SARL supports the growth of industries, mines, hotel and service sectors in the DRC with state-of-the-art electrical systems, agile automation, and sustainable solar installations.'),
('about_intro', 'DIVERSIA SARL est une société de droit congolais constituée de professionnels passionnés par le génie électrique et l\'assistance technique. Nous offrons des solutions clé en main qui combinent innovation technologique, exigences environnementales et efficacité économique.', 'DIVERSIA SARL is a Congolese law company consisting of professionals passionate about electrical engineering and technical assistance. We offer turn-key solutions combining technological innovation, environmental requirements, and economic efficiency.');

