/* Vision Plus — contenus par défaut. Le back-office Vision Plus existant pourra les remplacer via l'API ;
   ses modifications sont prioritaires (voir VISIONPLUS.content dans site.js).
   Règle : aucune information commerciale non confirmée. Les réponses en attente ont status:"pending". */
window.VISIONPLUS_DATA = {
  faqCategories: [
    "Présentation de Vision Plus","Fonctionnement de la plateforme","Création de compte","Connexion et sécurité",
    "Votre offre sur mesure","Paiements et facturation","Utilisation des fonctionnalités","Gestion des projets",
    "Simulations personnalisées","Assistance technique","SAV","Confidentialité","Résiliation"
  ],
  pendingAnswer: "Cette information est en cours de validation par l'équipe Vision Plus et sera publiée prochainement. L'assistant IA ou le SAV peut vous aider en attendant.",
  faq: [
    {id:"f1",cat:"Présentation de Vision Plus",q:"Qu'est-ce que Vision Plus ?",status:"ok",tags:"vision plus plateforme présentation quoi",
     a:"Vision Plus est une plateforme qui réunit une web app sur mesure et trois agents IA : un agent marketing, une secrétaire IA et un agent de gestion de votre web app. Toute votre activité est connectée au même endroit."},
    {id:"f2",cat:"Présentation de Vision Plus",q:"À qui s'adresse Vision Plus ?",status:"ok",tags:"pour qui entreprise professionnel particulier commerce restaurant",
     a:"Aux professionnels : Vision Plus est réservé aux entreprises et aux indépendants qui veulent être visibles en ligne, ne plus manquer d'appels et gérer leur site sans technicien : restaurants, commerces, cabinets, artisans, hôtels et autres activités."},
    {id:"f3",cat:"Fonctionnement de la plateforme",q:"Que font les trois agents IA ?",status:"ok",tags:"agents marketing téléphone secrétaire secrétariat gestion fonctionnalités",
     a:"L'agent marketing prépare vos publications pour les réseaux sociaux. Votre secrétaire IA répond à vos appels, organise vos rendez-vous et, selon les fonctions que vous choisissez, prépare vos devis, vos e-mails et le suivi de vos dossiers. L'agent de gestion modifie et publie votre web app à partir d'une simple demande écrite.",link:"decouvrir.html#agents"},
    {id:"f3b",cat:"Fonctionnement de la plateforme",q:"Puis-je choisir l'heure de mes publications ?",status:"ok",tags:"heure horaire publication programmation fréquence rythme marketing réseaux",
     a:"Vous choisissez les plateformes, les contenus, le nombre de publications par jour ou par semaine et les dates de la campagne. L'agent marketing répartit les publications et choisit les horaires les plus favorables pour chaque réseau, selon les données disponibles sur votre audience, dans le fuseau horaire de votre compte. Les contenus restent soumis à votre validation et vous pouvez suspendre la programmation à tout moment. Aucun nombre de vues n'est garanti.",link:"decouvrir.html#marketing"},
    {id:"f4",cat:"Fonctionnement de la plateforme",q:"Comment démarrer avec Vision Plus ?",status:"ok",tags:"démarrer commencer étapes",
     a:"Présentez votre projet, échangez avec un conseiller Vision Plus, puis recevez votre devis personnalisé. Vous pouvez aussi demander une simulation vidéo pour voir ce que Vision Plus fera pour vous.",link:"demo.html"},
    {id:"f5",cat:"Création de compte",q:"Comment créer un compte ?",status:"ok",tags:"inscription créer compte apple google email téléphone",
     a:"Cliquez sur « Créer un compte » en haut à droite. Vous pouvez vous inscrire avec Apple, Google, une adresse e-mail et un mot de passe, ou votre numéro de téléphone avec un code SMS.",link:"inscription.html"},
    {id:"f6",cat:"Création de compte",q:"Pourquoi dois-je vérifier mon e-mail ou mon téléphone ?",status:"ok",tags:"vérification code confirmer",
     a:"La vérification confirme que l'adresse ou le numéro vous appartient. Elle protège votre compte et évite les doublons."},
    {id:"f7",cat:"Connexion et sécurité",q:"J'ai oublié mon mot de passe. Que faire ?",status:"ok",tags:"mot de passe oublié réinitialiser",
     a:"Sur la page de connexion, cliquez sur « Mot de passe oublié ? ». Vous recevez un lien par e-mail ou un code par SMS, valable pour une durée limitée, puis vous choisissez un nouveau mot de passe.",link:"mot-de-passe.html"},
    {id:"f8",cat:"Connexion et sécurité",q:"Mon compte est temporairement bloqué. Pourquoi ?",status:"ok",tags:"bloqué verrouillé tentatives",
     a:"Après plusieurs tentatives de connexion échouées, l'accès est suspendu quelques minutes pour protéger votre compte. Réessayez plus tard ou réinitialisez votre mot de passe."},
    {id:"f9",cat:"Votre offre sur mesure",q:"Combien coûte Vision Plus ?",status:"ok",tags:"prix tarif coût combien offre devis abonnement formule",
     a:"Chaque entreprise bénéficie d'une proposition tarifaire personnalisée. Votre conseiller Vision Plus vous rappelle pour comprendre votre activité ; le tarif dépend des fonctionnalités de votre web app, des agents IA, des intégrations et de l'accompagnement retenus. Il vous est présenté dans un devis détaillé, soumis à votre accord.",link:"offre-sur-mesure.html"},
    {id:"f9b",cat:"Votre offre sur mesure",q:"Comment être rappelé par un conseiller ?",status:"ok",tags:"rappel rappeler conseiller contact devis rendez-vous",
     a:"Sur la page « Votre offre sur mesure », cliquez sur « Être rappelé par un conseiller » et indiquez vos coordonnées et votre besoin. Un conseiller Vision Plus vous recontactera pour étudier votre projet et préparer votre proposition personnalisée. La demande est sans engagement et ne constitue pas une commande.",link:"offre-sur-mesure.html#rappel"},
    {id:"f9c",cat:"Votre offre sur mesure",q:"À quel moment suis-je engagé ?",status:"ok",tags:"engagement commande signer accepter devis contrat",
     a:"Lorsque vous acceptez le devis et les conditions générales de vente, selon les modalités d'acceptation qui y sont indiquées. La demande de rappel et l'étude des besoins ne vous engagent pas.",link:"cgv.html"},
    {id:"f10",cat:"Votre offre sur mesure",q:"Puis-je faire évoluer mon offre ?",status:"ok",tags:"changer évoluer ajouter formule prestation supplémentaire",
     a:"Oui. Toute prestation supplémentaire fait l'objet d'un accord préalable sur son contenu et son prix.",link:"offre-sur-mesure.html"},
    {id:"f11",cat:"Paiements et facturation",q:"Quels sont les moyens et conditions de paiement ?",status:"ok",tags:"paiement carte payer prélèvement échéance",
     a:"Les conditions de paiement sont précisées dans votre devis personnalisé.",link:"offre-sur-mesure.html"},
    {id:"f12",cat:"Paiements et facturation",q:"Où trouver mes factures ?",status:"ok",tags:"facture télécharger",
     a:"Vos factures sont disponibles dans votre espace client, rubrique « Factures ».",link:"espace-client.html#factures"},
    {id:"f13",cat:"Utilisation des fonctionnalités",q:"Comment modifier mon site ?",status:"ok",tags:"modifier site web app texte photo",
     a:"Écrivez votre demande à l'agent de gestion, par exemple « Ajoute la soirée jazz de vendredi ». La modification est préparée, vous la validez, puis elle est mise en ligne."},
    {id:"f14",cat:"Gestion des projets",q:"Où retrouver mes projets ?",status:"ok",tags:"projets enregistrés",
     a:"Dans votre espace client, rubrique « Mes projets ». Les projets décrits lors d'une demande de simulation y sont enregistrés automatiquement.",link:"espace-client.html#projets"},
    {id:"f15",cat:"Simulations personnalisées",q:"Comment fonctionne la simulation personnalisée ?",status:"ok",tags:"démo démonstration vidéo personnalisée simulation",
     a:"Vous décrivez votre projet dans un formulaire en quelques étapes. L'équipe Vision Plus analyse vos besoins et prépare une vidéo qui montre ce que vous pourrez réaliser. Vous la recevez par e-mail et dans votre espace client.",link:"demo.html"},
    {id:"f16",cat:"Simulations personnalisées",q:"Comment suivre ma demande de simulation ?",status:"ok",tags:"suivi statut démo simulation",
     a:"Le statut est visible dans votre espace client : demande reçue, analyse en cours, simulation en préparation, simulation disponible.",link:"espace-client.html#demos"},
    {id:"f17",cat:"Simulations personnalisées",q:"Sous quel délai vais-je recevoir ma vidéo ?",status:"pending",tags:"délai combien de temps vidéo",a:""},
    {id:"f18",cat:"Assistance technique",q:"L'assistant IA peut-il répondre à toutes mes questions ?",status:"ok",tags:"assistant ia chat",
     a:"Il répond à partir des informations validées par Vision Plus. S'il n'a pas la réponse, il vous propose d'ouvrir une demande auprès du SAV.",link:"faq.html#question"},
    {id:"f19",cat:"SAV",q:"Comment contacter le SAV ?",status:"ok",tags:"sav contact assistance problème",
     a:"Écrivez à contacts.visionplus@gmail.com, appelez le 01 59 18 04 72 ou ouvrez une demande depuis la page « SAV / Assistance ». Avec une demande en ligne, vous recevez un numéro de dossier et pouvez suivre son traitement dans votre espace client.",link:"sav.html"},
    {id:"f20",cat:"SAV",q:"Quels sont les horaires et délais du SAV ?",status:"pending",tags:"horaires délai sav",a:""},
    {id:"f21",cat:"Confidentialité",q:"Comment exercer mes droits sur mes données ?",status:"ok",tags:"rgpd données suppression export droits",
     a:"Depuis votre espace client, rubrique « Mes données », vous pouvez demander l'export ou la suppression de vos données personnelles. Le détail figure dans la politique de confidentialité.",link:"confidentialite.html"},
    {id:"f22",cat:"Confidentialité",q:"Comment gérer les cookies ?",status:"ok",tags:"cookies consentement",
     a:"Cliquez sur « Gestion du consentement » en bas de chaque page pour accepter, refuser ou personnaliser les cookies à tout moment.",link:"cookies.html"},
    {id:"f23",cat:"Résiliation",q:"Comment mettre fin à mon contrat ?",status:"ok",tags:"résilier annuler abonnement fin contrat durée renouvellement",
     a:"La durée, le renouvellement et les conditions de résiliation sont précisés dans votre devis et dans les documents contractuels que vous avez acceptés.",link:"cgv.html"}
  ],
  /* Entrées supplémentaires de la base de connaissances de l'assistant (en plus de la FAQ). */
  kb: [
    {id:"k1",q:"Demander une simulation",tags:"démo démonstration rendez-vous essayer simulation",a:"Vous pouvez demander votre simulation personnalisée ici : décrivez votre projet en quelques étapes et recevez une vidéo adaptée.",link:"demo.html"},
    {id:"k2",q:"Se connecter",tags:"connexion connecter login compte",a:"Le bouton « Se connecter » se trouve en haut à droite de chaque page.",link:"connexion.html"},
    {id:"k3",q:"Espace client",tags:"espace client tableau de bord profil",a:"Une fois connecté, votre espace client regroupe votre profil, vos projets, vos simulations, votre offre, vos factures et vos demandes d'assistance.",link:"espace-client.html"},
    {id:"k5",q:"Être rappelé par un conseiller",tags:"rappel rappeler conseiller devis prix offre sur mesure tarif",a:"Un conseiller Vision Plus vous rappelle pour comprendre votre activité, puis vous recevez une proposition commerciale personnalisée détaillant les services retenus et leur tarif. La demande est sans engagement.",link:"offre-sur-mesure.html#rappel"},
    {id:"k4",q:"Contact",tags:"contact téléphone email adresse joindre",a:"Pour joindre le SAV : par e-mail à contacts.visionplus@gmail.com ou par téléphone au 01 59 18 04 72. Vous pouvez aussi ouvrir une demande en ligne depuis la page « SAV / Assistance ».",link:"sav.html"}
  ],
  savTypes: ["Problème de connexion","Mon compte","Offre, devis ou facturation","Simulation","Fonctionnalité de la plateforme","Signaler un bug","Autre demande"],
  sectors: ["Restaurant, bar","Commerce","Santé, bien-être","Beauté, coiffure","Artisan, bâtiment","Hôtellerie, tourisme","Services aux entreprises","Autre"],
  projectTypes: ["Création d'une web app","Refonte d'un site existant","Secrétaire IA","Marketing sur les réseaux","Gestion de contenu","Projet combiné"],
  features: ["Web app sur mesure","Agent marketing IA","Secrétaire IA","Gestion de la web app par IA","Réservation ou prise de rendez-vous","Paiement en ligne",
    /* idées tirées des services présentés sur le site (secrétaire IA, Campagne ADS, simulation, secrétariat médical, Artisan OS) */
    "Publications sur les réseaux sociaux","Campagnes publicitaires (Google, Instagram, TikTok…)","Vidéo publicitaire","Visibilité sur Google","Préparation des devis","Envoi d'e-mails","Suivi des dossiers et des expéditions","Accueil en plusieurs langues","Secrétariat médical IA","Artisan OS (métiers du bâtiment)"],
  demoStatuses: ["Demande reçue","Analyse en cours","Simulation en préparation","Simulation disponible"],
  savStatuses: ["Ouverte","En cours","En attente de votre réponse","Résolue","Fermée"],
  /* Anciennes formules standard : plus utilisées depuis l'offre sur mesure (5 novembre 2026). Structure conservée :
     {id,name,tagline,monthly,yearly,trialDays,features:[...],limits:{...},highlight:false,active:true} */
  plans: []
};
