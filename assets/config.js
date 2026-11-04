/* AXIA — configuration publique du site.
   Ne JAMAIS placer de clé secrète ici : ce fichier est lisible par tous les visiteurs.
   Les clés (Stripe, Twilio, fournisseur IA, e-mails…) vivent côté serveur uniquement. Voir ARCHITECTURE.md. */
window.AXIA_CONFIG = {
  /* "prototype" : tout fonctionne dans le navigateur (données locales, codes affichés à l'écran).
     "production" : les appels passent par l'API AXIA (apiBase). */
  mode: "prototype",
  apiBase: "",              /* ex. "https://api.axia.example" — à renseigner au déploiement */
  oauth: {
    google: false,          /* passer à true quand le client OAuth Google est configuré côté serveur */
    apple: false            /* passer à true quand « Sign in with Apple » est configuré côté serveur */
  },
  security: {
    maxLoginAttempts: 5,    /* tentatives avant verrouillage temporaire */
    lockMinutes: 15,
    codeMinutes: 10,        /* validité des codes SMS / e-mail */
    resetLinkMinutes: 30,   /* validité des liens de réinitialisation */
    sessionDays: 30         /* durée d'une session « Rester connecté » */
  },
  company: {
    name: "[Raison sociale à compléter]",
    email: "",
    phone: "",
    address: ""
  },
  /* Coordonnées du SAV affichées sur la page « SAV / Assistance » (communiquées le 4 novembre 2026). */
  sav: {
    email: "contacts.visionplus@gmail.com",
    phone: "01 59 18 04 72"
  }
};
