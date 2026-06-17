/* ===== Tujek Consulting : bilingual (EN/FR) dictionary + toggle ===== */
(function () {
  "use strict";

  const I18N = {
    en: {
      "nav.services": "Services",
      "nav.about": "About",
      "nav.work": "Engagements",
      "nav.insights": "Insights",
      "nav.contact": "Contact",
      "nav.cta": "Get in touch",

      "insights.kicker": "Insights",
      "insights.title": "AI in HR — what I'm reading.",
      "insights.sub": "A selection of the most relevant articles on AI across the HR and HRIS landscape, each summarised in a few lines.",
      "insights.loading": "Loading the latest articles…",

      "hero.kicker": "HR Technology Transformation",
      "hero.title": "Enterprise HR systems, built for <em>your reality</em>.",
      "hero.sub": "Tujek Consulting partners with senior leaders to select, deploy and embed the world's leading HCM platforms, on time, on budget, and genuinely adopted across the organisation.",
      "hero.cta1": "Email Franck",
      "hero.cta2": "Explore services",

      "stats.years": "years leading HR transformation across sectors",
      "stats.program": "flagship workforce-management program delivered",
      "stats.employees": "employees migrated in a single national rollout",
      "stats.countries": "countries within a global Workday rollout plan",

      "services.kicker": "What I do",
      "services.title": "Three disciplines that decide whether a transformation succeeds.",
      "services.sub": "From the first business case to the day people genuinely use the system, I lead the work that keeps complex HR programs on course.",
      "svc1.title": "Cloud HCM Implementation",
      "svc1.body": "End-to-end delivery of cloud HR suites, from design and build through testing, data migration and go-live, with the governance and rigour large programs demand.",
      "svc2.title": "HRIS Selection & Vendor Management",
      "svc2.body": "Independent, structured selection covering RFP, due diligence and contract negotiation, so you commit to the right platform and partner with full confidence and a defensible business case.",
      "svc3.title": "Change Management & Adoption",
      "svc3.body": "Stakeholder alignment, communication and training that turn a technical go-live into lasting behaviour change. Technology your people actually use and trust.",

      "platforms.label": "Platforms delivered in production environments",

      "about.kicker": "The principal",
      "about.title": "Franck Tujek",
      "about.p1": "A transformational project and program manager with two decades of multi-sector, multi-country experience delivering change through HR technology. I have led global cloud-HCM rollouts and recovered stalled, high-stakes programs, building rapport with everyone from technical teams to the C-suite.",
      "about.p2": "I tailor my approach to each organisation, with a preference for PRINCE2 and agile methodologies, and a particular passion for building delivery teams from scratch and creating value at every stage of a program. Based in Melbourne, working globally.",
      "cred.exp.k": "Experience",
      "cred.exp.v": "20 years · global rollouts",
      "cred.method.k": "Method",
      "cred.edu.k": "Education",
      "cred.edu.v": "MBA · BA (Hons) HRM",
      "cred.lang.k": "Languages",
      "cred.lang.v": "French · English · Spanish",

      "work.kicker": "Selected engagements",
      "work.title": "Programs that could not afford to fail.",
      "work1.client": "National postal & logistics operator",
      "work1.sector": "Public sector · Australia",
      "work1.body": "Engaged to manage a ServiceNow upgrade and quickly entrusted with the organisation's largest People & Culture transformation. With the program heavily impacted by the COVID crisis, I rebuilt the rollout approach, secured executive approval, and led a cross-functional team of 20+ through build, test and deployment.",
      "work1.metric": "Workforce Dimensions rollout · 28,000 employees · 450 sites",
      "work2.client": "Global media & advertising network",
      "work2.sector": "Media · APAC & global",
      "work2.body": "Delivered a time-critical global Workday rollout plan in partnership with a Big Four firm, then led the first wave across three regions before focusing on the 13 APAC markets in scope, alongside a China payroll transformation and several M&A integrations.",
      "work2.metric": "countries in scope · 13 APAC markets led personally",
      "work3.client": "Luxury outlet retail group",
      "work3.sector": "Retail · EMEA",
      "work3.body": "Ran an HR/HRIS audit and full SaaS selection across leading vendors, then managed a full-suite SuccessFactors rollout across EMEA for a group operating nine destinations in seven countries and six languages.",
      "work3.metric": "destinations · 7 countries · 6 languages",
      "work4.client": "Global financial services group",
      "work4.sector": "Financial services · Global",
      "work4.body": "Led a technology-driven HR transformation: a comprehensive process and systems analysis, a global RFP, and vendor due diligence across IT security, legal and procurement, while chairing steering committees and advising senior leadership on the path forward.",
      "work4.metric": "global selection · due diligence · board-level advisory",

      "ai.kicker": "Looking ahead",
      "ai.title": "A growing focus on AI in the HR function.",
      "ai.body": "Alongside core delivery, I'm actively building expertise in how artificial intelligence will reshape HR operations and decision-making, with a view to offering dedicated AI advisory services. If AI on your people agenda is a question you're starting to ask, it's a conversation I'm keen to have.",
      "ai.badge": "● Hands-on, curious, and learning in public",
      "ai.p1.t": "\u201cArtificially Intelligent-ish\u201d",
      "ai.p1.b": "Host of an ongoing podcast exploring practical, plain-language AI, on air since 2024.",
      "ai.p2.t": "AI Programming with Python (RMIT)",
      "ai.p2.b": "Formal, hands-on technical training in the fundamentals of building with AI.",
      "ai.p3.t": "Leadership Program (Monash)",
      "ai.p3.b": "Continuing executive development to lead change at the intersection of people and technology.",

      "contact.kicker": "Let's talk",
      "contact.title": "Planning, recovering, or selecting an HR platform? Let's talk.",
      "contact.sub": "Tell me about the program and where it stands. I read every message personally.",
      "contact.linkedin": "LinkedIn",
      "contact.podcast": "Podcast",

      "footer.meta": "Melbourne · Working globally · © 2026 Tujek Consulting"
    },

    fr: {
      "nav.services": "Services",
      "nav.about": "À propos",
      "nav.work": "Missions",
      "nav.insights": "Analyses",
      "nav.contact": "Contact",
      "nav.cta": "Me contacter",

      "insights.kicker": "Analyses",
      "insights.title": "L'IA dans les RH — mes lectures.",
      "insights.sub": "Une sélection des articles les plus pertinents sur l'IA dans l'univers des RH et des SIRH, chacun résumé en quelques lignes.",
      "insights.loading": "Chargement des derniers articles…",

      "hero.kicker": "Transformation des SIRH",
      "hero.title": "Des SIRH d'entreprise, conçus pour <em>votre réalité</em>.",
      "hero.sub": "Tujek Consulting accompagne les dirigeants dans la sélection, le déploiement et l'ancrage des principales plateformes HCM du marché : dans les délais, dans le budget et réellement adoptées par l'organisation.",
      "hero.cta1": "Écrire à Franck",
      "hero.cta2": "Voir les services",

      "stats.years": "ans à piloter la transformation RH, tous secteurs",
      "stats.program": "programme phare de gestion du temps livré",
      "stats.employees": "collaborateurs migrés lors d'un déploiement national",
      "stats.countries": "pays dans un plan de déploiement Workday mondial",

      "services.kicker": "Ce que je fais",
      "services.title": "Trois disciplines qui décident de la réussite d'une transformation.",
      "services.sub": "Du premier business case au jour où chacun utilise réellement le système, je pilote ce qui maintient les programmes RH complexes sur la bonne trajectoire.",
      "svc1.title": "Implémentation HCM Cloud",
      "svc1.body": "Livraison de bout en bout des suites RH cloud, de la conception et du paramétrage aux tests, à la migration des données et à la mise en production, avec la gouvernance et la rigueur qu'exigent les grands programmes.",
      "svc2.title": "Sélection SIRH & gestion des éditeurs",
      "svc2.body": "Une sélection indépendante et structurée, couvrant appel d'offres, due diligence et négociation contractuelle, pour vous engager sur la bonne plateforme et le bon partenaire, en toute confiance et sur un business case solide.",
      "svc3.title": "Conduite du changement & adoption",
      "svc3.body": "Alignement des parties prenantes, communication et formation qui transforment une mise en production technique en changement durable des comportements. Une technologie que vos équipes utilisent et en qui elles ont confiance.",

      "platforms.label": "Plateformes déployées en environnement de production",

      "about.kicker": "Le fondateur",
      "about.title": "Franck Tujek",
      "about.p1": "Chef de projet et de programme de transformation, fort de vingt ans d'expérience multisectorielle et multinationale au service du changement par la technologie RH. J'ai piloté des déploiements HCM cloud mondiaux et redressé des programmes à fort enjeu à l'arrêt, en créant le lien avec tous les interlocuteurs, des équipes techniques au comité de direction.",
      "about.p2": "J'adapte mon approche à chaque organisation, avec une préférence pour les méthodologies PRINCE2 et agiles, et une passion particulière pour bâtir des équipes de livraison de zéro et créer de la valeur à chaque étape du programme. Basé à Melbourne, j'interviens à l'international.",
      "cred.exp.k": "Expérience",
      "cred.exp.v": "20 ans · déploiements mondiaux",
      "cred.method.k": "Méthode",
      "cred.edu.k": "Formation",
      "cred.edu.v": "MBA · BA (Hons) RH",
      "cred.lang.k": "Langues",
      "cred.lang.v": "Français · Anglais · Espagnol",

      "work.kicker": "Missions sélectionnées",
      "work.title": "Des programmes qui ne pouvaient pas échouer.",
      "work1.client": "Opérateur postal & logistique national",
      "work1.sector": "Secteur public · Australie",
      "work1.body": "Engagé pour piloter une montée de version ServiceNow, je me suis rapidement vu confier la plus grande transformation People & Culture de l'organisation. Le programme ayant été fortement impacté par la crise du COVID, j'ai reconstruit l'approche de déploiement, obtenu l'aval de la direction et piloté une équipe transverse de plus de 20 personnes du build au déploiement.",
      "work1.metric": "déploiement Workforce Dimensions · 28 000 collaborateurs · 450 sites",
      "work2.client": "Réseau mondial de médias & publicité",
      "work2.sector": "Médias · APAC & monde",
      "work2.body": "Livraison d'un plan de déploiement Workday mondial sous forte contrainte de délai, en partenariat avec un cabinet du Big Four, puis pilotage de la première vague sur trois régions avant de me concentrer sur les 13 marchés APAC concernés, en parallèle d'une transformation de la paie en Chine et de plusieurs intégrations post-fusion.",
      "work2.metric": "pays dans le périmètre · 13 marchés APAC pilotés en personne",
      "work3.client": "Groupe de retail outlet de luxe",
      "work3.sector": "Retail · EMEA",
      "work3.body": "Réalisation d'un audit RH/SIRH et d'une sélection SaaS complète parmi les principaux éditeurs, puis pilotage d'un déploiement SuccessFactors full-suite sur l'EMEA, pour un groupe exploitant neuf destinations dans sept pays et six langues.",
      "work3.metric": "destinations · 7 pays · 6 langues",
      "work4.client": "Groupe mondial de services financiers",
      "work4.sector": "Services financiers · Monde",
      "work4.body": "Pilotage d'une transformation RH portée par la technologie : analyse complète des processus et des systèmes, appel d'offres mondial et due diligence couvrant sécurité IT, juridique et achats, avec présidence des comités de pilotage et conseil à la direction générale.",
      "work4.metric": "sélection mondiale · due diligence · conseil au comex",

      "ai.kicker": "Cap sur demain",
      "ai.title": "Un intérêt grandissant pour l'IA dans la fonction RH.",
      "ai.body": "En parallèle de mes missions, je développe activement mon expertise sur la manière dont l'intelligence artificielle va transformer les opérations et la prise de décision RH, dans l'optique de proposer une offre de conseil dédiée à l'IA. Si la place de l'IA dans votre agenda RH commence à se poser, c'est une conversation que j'ai à cœur d'avoir.",
      "ai.badge": "● Curieux, concret, et qui apprend à voix haute",
      "ai.p1.t": "\u00ab Artificially Intelligent-ish \u00bb",
      "ai.p1.b": "Animateur d'un podcast consacré à une IA concrète et accessible, à l'antenne depuis 2024.",
      "ai.p2.t": "AI Programming with Python (RMIT)",
      "ai.p2.b": "Formation technique pratique aux fondamentaux du développement avec l'IA.",
      "ai.p3.t": "Programme leadership (Monash)",
      "ai.p3.b": "Développement continu pour mener le changement à la croisée des hommes et de la technologie.",

      "contact.kicker": "Parlons-en",
      "contact.title": "Vous planifiez, redressez ou sélectionnez un SIRH ? Parlons-en.",
      "contact.sub": "Décrivez-moi le programme et où il en est. Je lis chaque message personnellement.",
      "contact.linkedin": "LinkedIn",
      "contact.podcast": "Podcast",

      "footer.meta": "Melbourne · Présent à l'international · © 2026 Tujek Consulting"
    }
  };

  const STORE_KEY = "tujek_lang";

  function applyLang(lang) {
    const dict = I18N[lang] || I18N.en;
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.textContent = dict[key];
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (dict[key] != null) el.innerHTML = dict[key];
    });

    document.querySelectorAll(".lang-toggle button").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-lang") === lang);
    });

    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}
  }

  // Initial language: stored → browser → en
  let initial = "en";
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved && I18N[saved]) initial = saved;
    else if ((navigator.language || "").toLowerCase().startsWith("fr")) initial = "fr";
  } catch (e) {}

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".lang-toggle button");
    if (btn) applyLang(btn.getAttribute("data-lang"));
  });

  applyLang(initial);
})();
