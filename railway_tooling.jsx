import React, { useEffect, useState, useMemo } from "react";
import { Search, X, Check, BarChart2, AlertTriangle, Info, Copy, CheckCheck, Users, Layers } from "lucide-react";

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800&family=Barlow:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:#0A1A1A; }
  ::-webkit-scrollbar-thumb { background:#1E3D3D; border-radius:3px; }
  ::-webkit-scrollbar-thumb:hover { background:#00C9A7; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
  @keyframes softFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
  @keyframes budgetPulse { 0%,100%{box-shadow:0 14px 30px rgba(0,0,0,0)} 50%{box-shadow:0 18px 34px rgba(0,201,167,0.10)} }
  @keyframes imageBreath { 0%,100%{transform:scale(1)} 50%{transform:scale(1.02)} }
  input::placeholder { color:#3A6060; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation:none !important; transition:none !important; scroll-behavior:auto !important; }
  }
`;

// ─── TEAL PALETTE ─────────────────────────────────────────────────────────────
const C = {
  bg:      '#0A1A1A',
  bgMid:   '#0D2020',
  card:    '#0F2424',
  cardHov: '#122828',
  border:  '#1A3535',
  borderL: '#224444',
  teal:    '#00C9A7',
  tealDim: '#002E28',
  tealMid: '#004D40',
  cyan:    '#4ECDC4',
  cyanDim: '#002828',
  blue:    '#4DB8FF',
  blueDim: '#001F33',
  orange:  '#FF8C42',
  orangeDim:'#2A1500',
  amber:   '#F5B942',
  amberDim:'#2A1E00',
  green:   '#52D98A',
  greenDim:'#00200F',
  violet:  '#9B72CF',
  violetDim:'#1A0D2E',
  rose:    '#FF6B8A',
  roseDim: '#2A0014',
  slate:   '#7BA7A7',
  slateDim:'#0F2222',
  red:     '#FF5252',
  redDim:  '#2A0808',
  text:    '#D8EEED',
  textSub: '#5A8F8A',
  textMuted:'#2E5555',
};

// ─── CATEGORIES — softer, teal-family palette ─────────────────────────────────
const CATS = {
  PPE:      { label:'PPE',              color:C.amber,  bg:C.amberDim,  icon:'🧤' },
  SAFETY:   { label:'Safety',           color:C.orange, bg:C.orangeDim, icon:'🦺' },
  MBTDC:    { label:'LV/DC Measurement',       color:C.teal,   bg:C.tealDim,  icon:'⚡' },
  MHTA:     { label:'MV/HV Measurement',     color:C.blue,   bg:C.blueDim,  icon:'🔬' },
  CABLE:    { label:'Cabling',            color:C.amber,  bg:C.amberDim, icon:'🔌' },
  LOTO:     { label:'Lockout/LOTO',  color:C.violet, bg:C.violetDim,icon:'🔒' },
  DIAG:     { label:'Advanced Diagnostics',  color:C.cyan,   bg:C.cyanDim,  icon:'📡' },
  OUTILS:   { label:'General Tooling',  color:C.green,  bg:C.greenDim, icon:'🔧' },
  COLLECTIF:{ label:'Team Equipment', color:C.slate,  bg:C.slateDim, icon:'📦' },
};

// Mandatory = orange (not red), Recommended = blue, Optional = teal
const STATUTS = {
  OB:{ label:'Mandatory', color:C.orange, bg:C.orangeDim },
  RC:{ label:'Recommended',  color:C.blue,   bg:C.blueDim   },
  OP:{ label:'Optional',   color:C.teal,   bg:C.tealDim   },
};

const LEVELS = {
  T: {
    label: 'Technician',
    short: 'TECH',
    emoji: '👤',
    multiplierLabel: 'Technicians',
    unit: 'per technician',
    color: '#1C6090',
    bgLight: '#DCEAF5',
    bgDark: C.tealDim,
    colorDark: C.teal,
  },
  E: {
    label: 'Team',
    short: 'TEAM',
    emoji: '👥',
    multiplierLabel: 'Teams',
    unit: 'per team',
    color: '#1F8A84',
    bgLight: '#D9EFED',
    bgDark: C.blueDim,
    colorDark: C.blue,
  },
  P: {
    label: 'Project / Depot',
    short: 'PROJECT',
    emoji: '🏗️',
    multiplierLabel: 'Projects / Depots',
    unit: 'per project / depot',
    color: '#7C3AED',
    bgLight: '#EEE7FF',
    bgDark: C.violetDim,
    colorDark: C.violet,
  },
};

const CONTEXTS = [
  { id:'metro',  label:'Metro',      icon:'🚇', accent:C.teal   },
  { id:'tram',   label:'Tram',       icon:'🚊', accent:C.cyan   },
  { id:'heavy',  label:'Heavy Rail', icon:'🚂', accent:C.amber  },
  { id:'apm',    label:'APM',        icon:'🚝', accent:C.violet },
];

const SUBSYSTEMS = [
  { id:'POS',   label:'POS',     full:'Energy' },
  { id:'PSD',   label:'PSD',     full:'Platform Doors' },
  { id:'CAT',   label:'CAT',     full:'Catenary' },
  { id:'TRACK', label:'TRACK',   full:'Track' },
  { id:'3RD',   label:'3rd Rail',full:'Conductor Rail' },
  { id:'AFC',   label:'AFC',     full:'Ticketing' },
  { id:'DEQ',   label:'DEQ',     full:'Depot Equipment' },
  { id:'MEP',   label:'MEP',     full:'Mechanical Electrical Plumbing' },
];

// ─── TOOL DATA ────────────────────────────────────────────────────────────────
const RAW_BY_SUBSYSTEM = {
  POS: [
  // Unit prices refreshed on 2026-03-29 from current public shop / price-comparison pages when available.
  // Unchanged entries remain planning estimates for budgeting, not contractual purchase prices.
  ['t01','T','SAFETY','TRMS Multimeter CAT IV 1000V','Fluke','289/EUR','LV / DC Traction','CAT IV 1000V – IEC 61010','OB',1,1006,'Annual (calibration)','Integrated data logger. AC/DC measurements: voltage, current, resistance, continuity. Absolute field reference.','https://www.fluke.com/fr-fr/produit/multimetres/multimetres-numeriques/fluke-289'],
  ['t02','T','SAFETY','Non-contact AC Voltage Detector 100-1000V','Fluke','T6-1000PRO','LV','CAT IV 1000V','OB',1,404,'Annual','Non-contact measurement, no leads required. Essential LV safety. Instant detection before any approach.','https://www.fluke.com/fr-fr/produit/testeurs-electriques/testeurs-tension/fluke-t6-1000-pro'],
  ['t03','T','SAFETY','Safety VAT Bipolar Absence-of-Voltage Tester 12-1000V AC/DC','Chauvin Arnoux','C.A 773','LV / DC Traction','CAT IV 1000V – IEC 61243-3','OB',1,82,'Annual','Dedicated safety tester used to prove absence of voltage before contact, lockout or intervention on isolated circuits. This entry is the formal VAT tool, not the traction polarity/diagnostic tester.','https://www.chauvin-arnoux.com/sites/default/files/D00VHU49.PDF'],
  ['t04','T','PPE','Insulating Gloves Class 0 (1000V AC) + leather protectors','Honeywell / Salisbury','GK014B/10H glove kit','LV / DC Traction','Class 0 – IEC EN 60903 / ASTM D120','OB',1,188,'6 months (dielectric test)','Official Salisbury glove kit page including class 0 rubber insulating gloves, leather protectors and storage bag for low-voltage intervention work.','https://www.salisburyshop.com/buy/product/class-0-black-rubber-insulating-glove-kit/198561'],
  ['t05','T','PPE','Electrical Safety Helmet with Integrated Faceshield','JSP','EVO VISTAshield','All domains','EN 397 – EN 50365 – EN 166','OB',1,58,'3 years','Integrated faceshield helmet with low-voltage electrical insulation performance and better face coverage than the previous link.','https://www.jspsafety.com/products/PPE/Head-Protection/EN-397-industrial-Safety-Helmets/VAR-AMC170-007-F00_EVO-ViSTAshield-Safety-Helmet-with-integrated-Faceshield'],
  ['t06','T','PPE','Arc-flash Safety Glasses EN166','Bolle Safety','Cobra COBPSI','All domains','EN 166 / EN 170','OB',1,22,'1 year','Anti-scratch, anti-fog. Systematic use during all interventions.','https://www.bollesafety.com/fr/lunettes-de-securite/cobra'],
  ['t07','T','PPE','Arc-flash Safety Kit Category 2 (8 cal/cm²)','Honeywell / Salisbury','SKCP8RG-WB','All domains','NFPA 70E – ASTM F1506','OB',1,510,'3 years or after arc event','Current official kit page for coat + pants + PrismShield faceshield + hard hat. More realistic replacement than the obsolete AGF40KIT link.','https://www.salisburyonline.com/product/384/salisbury-safety-kit-8-cal-coat-pant-as1000-prismshield-faceshield-skcp8rg-wb'],
  ['t08','T','SAFETY','ATEX Headlamp – 115 lm','Peli','2755Z0','All domains','ATEX Zone 0 – IP54','OB',1,118,'Annual (battery)','Current official intrinsically safe headlamp page. Suitable for hazardous environments and easier to source than the obsolete PIXA 3 ATEX reference.','https://www.peli.com/es/en/product/flashlights/headlamp/2755z0/'],
  ['t09','T','SAFETY','VDE 1000V Insulated Screwdriver Set – 7 pcs','Wiha','36295 SoftFinish VDE Set','LV','VDE – IEC 60900 – 1000V AC','OB',1,78,'Annual (visual inspection)','Bi-material handles. Compliant with DIN VDE 0680. Tested to 10kV.','https://www.wiha.com/fr-fr/outillage/tournevis/tournevis-vde/softfinish-vde/36295'],
  ['t10','T','SAFETY','VDE 1000V Insulated Tool Set – 5 pcs','Knipex','00 20 13','LV','DIN EN/IEC 60900 – 1000V AC','OB',1,109,'Annual (visual inspection)','Official KNIPEX 5-piece VDE set combining insulated pliers and screwdrivers for standard low-voltage work.','https://www.knipex.com/products/tool-kits/tool-kits/tool-kits/002013'],
  ['t11','T','SAFETY','VDE Torque Wrench 1/2" 10-50 Nm','Gedore','VDE 4508-05','LV','DIN EN ISO 6789-2 / IEC 60900','RC',1,395,'Annual (calibration)','Official GEDORE insulated torque wrench page for controlled tightening on live components up to 1000 V.','https://www.gedore.com/en-at/products/torque-tools/torque-wrenches--accessories/torque-wrenches%2C-releasing-for-sockets/vde-4508-vde-torque-wrench/vde-4508-05---3079066'],
  ['t12','T','MBTDC','Portable Insulation Tester 500V/1000V','Fluke','1507 Insulation Tester','DC Auxiliaries 24-110V / LV','IEC 61557-2 – CAT IV 600V','OB',1,630,'Annual (calibration)','Daily use: insulation testing of 24VDC control circuits. Lighter than team MIT525.','https://www.fluke.com/fr-fr/produit/testeurs-isolement/fluke-1507'],
  ['t13','E','MBTDC','RCD Tester + Fault Loop Impedance','Fluke','1664 FC Multifunction','LV / Auxiliaries 400V','IEC 61557 – IEC 60364','OB',1,1998,'Annual (calibration)','RCD test 10-500mA, fault loop impedance. Mandatory before 400V commissioning.','https://www.fluke.com/fr-fr/produit/testeurs-installation-electrique/fluke-1664-fc'],
  ['t14','E','MBTDC','Loop Impedance / Installation Tester NF C 15-100','Metrel','MI 3102H BT EurotestXE 2.5 kV','LV / Auxiliaries 400V','IEC 61557 – NF C 15-100','RC',1,1353,'Annual (calibration)','Current official Metrel page for a Eurotest platform still suited to installation testing, loop impedance and higher-voltage insulation checks.','https://www.metrel.si/en/shop/EIS/multifunctional-testers/mi-3102h-bt.html'],
  ['t15','T','MBTDC','TRMS AC/DC Clamp Meter 1000A WiFi','Fluke','376 FC','LV / DC Traction 750-1500V','CAT IV 600V – CAT III 1000V','OB',1,767,'Annual (calibration)','DC measurement up to 2500A with iFlex. Fluke Connect wireless.','https://www.fluke.com/fr-fr/produit/mesure-courant/pinces-amperemetriques/fluke-376-fc'],
  ['t16','E','MBTDC','Three-phase Rotation Tester 40-700V AC','Fluke','9040','LV / Auxiliaries 400V','EN 61010 – EN 61557-7','OB',1,316,'Annual','Clear official product page for phase-sequence verification before energisation. Replaces the incorrect CA 6412 reference.','https://www.fluke.com/en/product/electrical-testing/basic-testers/fluke-9040'],
  ['t17','T','MBTDC','Traction DC Bipolar Voltage and Polarity Tester 24-1500V','Gossen Metrawatt','METRAVOLT 12D+L','DC Traction 750-1500V / LV','DIN EN 61243-3 – CAT IV 600V / CAT III 1000V','RC',1,435,'Annual','Two-pole contact tester used mainly for traction DC polarity identification, AC/DC voltage confirmation and diagnostic checks where the safety VAT alone is not sufficient. Distinct from the mandatory absence-of-voltage tool.','https://www.gossenmetrawatt.de/produkte/mess-und-prueftechnik/prueftechnik/pruefung-elektrischer-installationen-und-anlagen/spannung-phase-drehfeld-durchgang-polaritaet/metravolt-12d-plusl/'],
  ['t18','T','MBTDC','Infrared Thermometer -50 to +550°C','Fluke','62 MAX+','All domains','EN 61010-1','RC',1,166,'Annual','Fast detection of hot spots on lugs, busbars, fuses.','https://www.fluke.com/fr-fr/produit/thermometres/thermometres-infrarouges/fluke-62-max'],
  ['t19','T','OUTILS','Ratchet Set 3/8" metric 29 pcs','Wera','8100 SB 6 Zyklop Speed','LV / MV – Bolting','ISO 2725 / DIN 3122','OB',1,108,'Replace when worn','Current official ratchet/socket set page with compact textile case. Suitable for cabinet fixings, lugs and terminal work.','https://www.wera.de/fr/outillages/8100-sb-6-jeu-cliquet-zyklop-speed-a-carre-3-8-metrique'],
  ['t20','T','OUTILS','Hex Key Set metric 1.5-10mm','Wera','950/9 Hex-Plus Multicolour 1 SB','All domains','DIN 911 / ISO 2936','OB',1,42,'Replace when worn','Current official hex key set page. Daily use for socket-head screws, drives, relays and rail equipment.','https://www.wera.de/fr/outillages/950-9-hex-plus-multicolour-1-sb-jeu-de-cles-males-coudees-syst-metrique-blacklaser'],
  ['t21','T','OUTILS','Belt pouch for two pliers up to 150 mm','Knipex','00 19 72 LE','All domains','–','OB',1,12,'Replace when worn','Official KNIPEX belt pouch for two pliers up to 150 mm, with side holder for flashlight or pen. Corrects the previous mismatched tool-bag description.','https://www.knipex.com/products/tool-bags-and-tool-cases/belt-pouch-for-two-pliers-empty/belt-pouch-two-pliers-empty/001972LE'],
  ['t22','T','OUTILS','Heat Gun 2000W 50-630°C + 2 nozzles','Bosch','GHG 20-63 Professional','LV / DC – Sleeves & Cables','–','OB',1,143,'Replace if defective','Official Bosch product page for the GHG 20-63 heat gun, suitable for heat-shrink work on lugs, cables and connectors.','https://www.bosch-professional.com/de/de/products/ghg-20-63-06012A6200'],
  ['t23','T','OUTILS','Telescopic Magnetic Pick-up Tool','Stahlwille','12601','All domains','–','OB',1,14,'Replace as needed','Official magnetic pick-up tool page for recovering metallic parts in inaccessible installation areas.','https://stahlwille.com/en_us/products/detail/826592'],
  ['t24','T','OUTILS','Telescopic Inspection Mirror 360°','Gedore','718 / 1979841','All domains','–','RC',1,22,'Replace as needed','Official inspection mirror page with 360° swivel mirror and telescopic handle for inaccessible inspection points.','https://www.gedore.com/en-de/products/measuring---marking---testing-tools/test-tools/mirror/718-inspection-mirror/718---1979841'],
  ['t25','T','OUTILS','Tape Measure 5m magnetic anti-shock','Stanley','STHT36334 FatMax','All domains','–','OB',1,18,'Replace as needed','Double-sided magnetic hook useful for solo work.','https://www.stanley.fr/outils-a-main/mesure/metres-ruban/fatmax-autolock-5m'],
  ['t26','T','OUTILS','Permanent Industrial Markers oil/heat resistant – pack 3','Edding','8300 Industry Permanent Marker','All domains','–','OB',3,5.5,'Consumable','Black, red, blue. Industrial marker for oily/dusty surfaces, heat resistant up to 300°C.','https://www.edding.com/en-us/products/edding-8300-industry-permanent-marker/'],
  ['t27','T','OUTILS','Rechargeable Work Light 500 lm magnet IP65','Scangrip','UNIFORM 03.6208','All domains','IP65 – EN 13032-1','OB',1,89,'Annual (battery)','Portable inspection/work light with integrated magnet, hook and adjustable output up to 500 lm. Replaces the obsolete FLEX WEAR link.','https://www.scangrip.com/fr-fr/boutique/lampes-de-travail/03-6208-uniform'],
  ['t28','T','OUTILS','Technician Drill/Driver 18V for routine fastening','Bosch','GSR 18V-55 Professional','All domains – routine fixing and assembly','–','OB',1,317,'Replace if defective','Technician-level cordless drill/driver intended as the personal daily-use machine: cabinet covers, terminal blocks, light brackets, trunking accessories and routine assembly work. One unit per technician.','https://www.bosch-professional.com/fr/fr/products/gsr-18v-55-06019H5200'],
  ['t29','E','CABLE','Hand-operated Hydraulic Crimping Tool 10-240mm²','Klauke','HK 60 VP','LV / DC Traction','EN 61238-1','OB',1,895,'2 years','Official Klauke hydraulic crimping tool page for cable lugs and connectors up to 240 mm² without interchangeable dies.','https://www.klauke.com/bh/en/ek-60-ft-hand-operated-hydraulic-crimping-tool-10-240-mm'],
  ['t30','T','CABLE','Automatic Wire Stripper 0.2-6mm²','Jokari','SECURA 2K 20100','LV / DC','–','OB',1,42,'Replace when worn','Current official JOKARI automatic stripper page for 0.2 to 6.0 mm² conductors. More reliable than the old T-Stripper Vario link.','https://jokari.de/en/SECURA-2K-2.htm'],
  ['t31','T','CABLE','Cable Jacket Knife for round cables 8-28 mm','Jokari','Cable Knife No. 28G Standard','BT / HTA','–','OB',1,32,'Replace when worn','Current official JOKARI cable knife page for round cable sheaths and longitudinal cuts without damaging inner conductors.','https://jokari.de/en/products/detail/cable-knife-no-28g-standard'],
  ['t32','T','CABLE','Portable Cable Label Printer P-touch Bluetooth','Brother','PT-E310BTVP','All domains','–','RC',1,227,'Battery replacement','Official current Brother product page for the portable industrial Bluetooth labeller used for cable and terminal marking.','https://store.brother.fr/appareils/imprimantes-d-etiquettes/p-touch/pt/pte310btvp'],
  ['t33','T','CABLE','Insulating Tape Scotch 23 self-amalgamating + Scotch 35 PVC','3M','Scotch 23 + Scotch 35','LV / DC','UL 510 / IEC 60454','OB',2,12,'Consumable','23 = self-amalgamating, 35 = standard PVC insulating tape.','https://www.3m.fr/3M/fr_FR/p/d/v000057551/'],
  ['t34','T','LOTO','Personal LOTO Kit – electrical','Brady','120886','All domains','OSHA / Lockout Tagout','OB',1,109,'Annual (inspection)','Current official Brady personal electrical lockout kit page with pouch, padlock, hasps, breaker lockouts and tags.','https://www.bradyid.com/products/personal-lockout-kit-electrical-pid-120886'],
  ['t35','T','LOTO','Lockout Padlock thermoplastic – 1 unique key','Master Lock','410RED Zenex','All domains','Lockout Tagout','OB',2,20,'5 years or replacement','Current official Master Lock product page for the keyed-different thermoplastic safety padlock.','https://fr.masterlock.com/products/product/410RED'],
  ['t36','T','LOTO','Danger Lockout Tags – pack 25','Brady','48797','All domains','Lockout Tagout','OB',1,18,'Consumable','Current official Brady pack of 25 durable danger lockout tags with brass grommet and write-on area.','https://www.bradyid.com/products/bilingual-danger-this-tag-lock-to-be-removed-only-by-person-shown-on-back-tags-pid-48797'],
  ['t37','T','OUTILS','Portable Tool Container with shoulder strap','Wera','Wera 2go 2 Tool Container','All domains – mobile maintenance','–','RC',1,115,'Replace when worn','Current official Wera mobile container system with shoulder strap and detachable quiver. Good fit for a technician who must keep essential hand tools on him while moving between rooms, cabinets and platforms.','https://www.wera.de/en/tools/wera-2go-2-tool-container'],
  ['t38','T','OUTILS','Open-end / Ring Wrench Set 8-19 mm in roll-up pouch','Stahlwille','96401007','All domains – daily fastening','DIN 3113 Form B / ISO 7738 Form B','OB',1,185,'Replace when worn','Current official STAHLWILLE set covering the most common small and medium metric sizes for day-to-day fastening. It gives the technician both open-end and ring ends in one compact pouch.','https://stahlwille.com/fr_fr/products/detail/26151321'],
  ['e01','E','PPE','Insulating Gloves Class 4 (36kV)','Honeywell / Salisbury','NG418RB/11 Electriflex','MV 10-36kV','Class 4 – IEC EN 60903 / ASTM D120','OB',4,1101,'6 months (dielectric test)','Official Salisbury Electriflex class 4 glove page for high-voltage live work. Use with matching leather protectors sized for class 4 gloves.','https://www.salisburyshop.com/buy/product/salisbury-electriflex-class-4-rubber-insulating-gloves-ng418rb-11/211574'],
  ['e02','E','PPE','Insulating Gloves Class 2 (17kV) + leather protectors','Honeywell / Salisbury','GK218B/10H glove kit','DC Traction 1500V / BT 1000V','Class 2 – IEC EN 60903 / ASTM D120','OB',4,464,'6 months (dielectric test)','Official Salisbury glove kit page including class 2 gloves, leather protectors and storage bag for 1500 V DC traction or reinforced LV applications.','https://www.salisburyshop.com/buy/product/salisbury-size-10-1-2-class-2-black-insulating-rubber-gloves-kit-gk218b-10h/209680'],
  ['e03','E','PPE','Arc-flash Suit Class 3 (25 cal/cm²) – full coverall','Oberon','TCG25-XXL','MV/HV 25kV','IEC 61482-2 Class 3','OB',2,680,'3 years or after incident','Mandatory for work near 25kV live systems.','https://www.oberoncompany.com/arc-flash-clothing/arc-flash-suits'],
  ['e04','E','PPE','Arc-flash Face Shield 25 cal/cm² Class 3','Oberon','TCG25-HHG','MV/HV 25kV','IEC 61482-2 – Class 3','OB',2,220,'3 years or replacement','Compatible with insulating helmet. Arc Flash Rating minimum 25 cal/cm².','https://www.oberoncompany.com/arc-flash-face-protection'],
  ['e05','E','SAFETY','Switching Stick MV 1-36kV','DEHN','SCS 36 1000','MV 10-36kV','DIN VDE V 0681-1 / -2','OB',2,380,'Annual (dielectric test)','Official switching stick page for indoor/outdoor MV operation. Functional replacement for the previous CATU operating rod link.','https://www.dehn-international.com/store/p/en-DE/F48498/scs-switching-sticks'],
  ['e06','E','SAFETY','Insulating Protective Shutters up to 36kV','DEHN','Insulating Protective Shutters','MV 10-36kV','DIN VDE 0682-552','OB',2,145,'Annual (dielectric test)','Official DEHN document for insulating protective shutters used to protect against accidental contact with adjacent live parts.','https://www.dehn-international.com/sites/default/files/media/files/isolierende-schutzplatten-2090-en.pdf'],
  ['e07','E','OUTILS','Portable Tool Chest 3 lockable drawers','Beta Tools','RSC22-A / 022003007','All domains','–','OB',1,502,'Replace when worn','Official Beta Tools 3-drawer portable chest with central lock and ball-bearing drawers, suitable for team tooling, testers and maintenance kits.','https://www.beta-tools.com/en/products/containers-and-assortments/portable-tool-chests-and-mobile-roller-cabs/portable-tool-chest-with-3-drawers.html'],
  ['e08','E','OUTILS','VDE 3/8" insulated socket/tool set – 23 pcs','Stahlwille','12171/19/4 VDE','LV / MV – Protected bolting','IEC 60900','OB',1,670,'Replace when worn','Official insulated 23-piece socket/tool set reference still online. The previous wording understated the full TCS kit content.','https://stahlwille.com/en_us/products/detail/893236'],
  ['e09','E','OUTILS','Cordless Impact Wrench 18V 400 Nm 1/2"','Bosch','GDS 18V-400 Professional','MV / HV – Heavy bolting','–','RC',1,494,'Replace if defective','Official Bosch impact wrench page for the 400 Nm 1/2 inch heavy-bolting tool. This entry is the impact wrench for loosening and tightening bolts, distinct from the drill/driver entry below.','https://www.bosch-professional.com/ge/en/products/gds-18v-400-06019K0020'],
  ['e10','E','OUTILS','Team Hammer Drill/Driver 18V for heavier fixing work','Bosch','GSB 18V-55 Professional','All domains – heavier drilling and fixing','–','RC',1,355,'Replace if defective','Team-level hammer drill/driver reserved for heavier work than the personal technician driver: masonry anchors, metal supports, cable tray fixings and jobs where hammer mode is needed. One shared unit per team.','https://www.bosch-professional.com/fr/fr/products/gsb-18v-55-06019H5301'],
  ['e11','E','OUTILS','Electronic Torque Wrench 2-20 Nm with 1/4" reversible ratchet insert','Stahlwille','MANOSKOP 714R/2 eClick','LV / DC – Fine bolting','DIN EN ISO 6789-2','OB',1,1468,'Annual (calibration)','Official documented torque wrench page with 2-20 Nm range, visual/acoustic feedback and calibration traceability.','https://stahlwille.com/en_us/products/detail/852642'],
  ['e12','E','OUTILS','Electronic Torque/Angle Wrench 20-200 Nm with 14x18 insert mount','Stahlwille','MANOSKOP 714/20','LV / MV – Medium bolting','DIN EN ISO 6789-2','OB',1,1268,'Annual (COFRAC calibration)','Official torque wrench page with 20-200 Nm range, suited to cabinet fixings, MV bolting and traceable calibration workflows.','https://stahlwille.com/en_us/products/detail/852570'],
  ['e13','E','OUTILS','Torque Wrench 3/4" 160-800 Nm – busbars','Stahlwille','730/80 Service MANOSKOP','MV / HV – Heavy bolting','DIN EN ISO 6789-2','OB',1,891,'Annual (COFRAC calibration)','Official STAHLWILLE heavy-duty torque wrench page for large busbar, flange and substation bolting, with insert-tool holder for high-torque maintenance work.','https://stahlwille.com/en_us/products/detail/852072'],
  ['e14','E','OUTILS','Electronic Torque/Angle Wrench 20-200 Nm with USB/BLE traceability','Stahlwille','MANOSKOP 714R/20 eClick','LV / MV – Torque traceability','DIN EN ISO 6789-2 / VDI-VDE 2648-2','RC',1,1117,'Annual (COFRAC calibration)','Official electromechanical torque wrench page with data storage, micro USB communication and optional BLE module.','https://stahlwille.com/en_us/products/detail/852648'],
  ['e15','E','MHTA','MV Voltage Detector 20-36kV','DEHN','PHE4 20 36 S','MV 20-36kV','IEC 61243-1','OB',2,1668,'Annual (mandatory calibration)','Official DEHN PHE4 product family for medium-voltage installations up to 36 kV with self-test, acoustic and visual indication. This concrete variant aligns with the displayed working range.','https://www.dehn-international.com/phe4-voltage-detector'],
  ['e16','E','MHTA','HV Voltage Detector 25kV – AC catenary','DEHN','PHE III 25 S 50 1P','HV 25kV Catenary','IEC 61243-1','OB',1,2122,'Annual (mandatory calibration)','Official DEHN product page for overhead contact lines of electric railways up to 25 kV / 50 Hz.','https://dehn-international.com/store/p/en-DE/F41570/phe-iii-voltage-detector'],
  ['e17','E','MHTA','MV Phase Comparator synchronism 5-36kV','DEHN','PHV1P U 5 36','MV 5-36kV','EN/IEC 61481-1','OB',1,1851,'Annual','Retail-listed DEHN phase comparator variant covering medium-voltage synchronism checks with a switchable nominal range up to 36 kV.','https://www.dehn-international.com/store/h/en-DE/H986/phase-comparators'],
  ['e18','E','MHTA','Three-phase Power Quality Analyser Class A','Fluke','435-II','LV / MV (via CT/VT)','IEC 61000-4-30 Class A','OB',1,4200,'Annual (calibration)','Harmonics, dips, flicker analysis. Long-term recording.','https://www.fluke.com/fr-fr/produit/analyseurs-qualite-alimentation/fluke-435-ii'],
  ['e19','E','MHTA','Digital Insulation Resistance Meter 5kV DC','Megger','MIT525','LV / MV / Cables','IEC 61557-2','OB',1,4149,'Annual (calibration)','PI, DAR, DD measurement. MV cables and substation transformers.','https://www.megger.com/fr/products/test-equipment/insulation-resistance-testers/mit525'],
  ['e20','E','MHTA','Digital Insulation Resistance Meter 10kV DC','Megger','MIT1025/2','MV 10-36kV / HV 25kV','IEC 61557-2','RC',1,4422,'Annual (calibration)','Insulation testing of MV cables and 25kV transformer windings.','https://www.megger.com/fr/products/test-equipment/insulation-resistance-testers/mit1025'],
  ['e21','E','MHTA','Micro-ohmmeter Contact Resistance 10-200A DC','Megger','DLRO10X','MV / Switchgear','IEC 62271 / IEC 60044','OB',1,4615,'Annual (calibration)','Contact resistance of circuit breakers, disconnectors, busbars.','https://www.megger.com/fr/products/test-equipment/low-resistance-ohmmeters/dlro10x'],
  ['e22','P','MHTA','Three-phase Protection Relay Test Set','Omicron','CMC 353','MV / Protection','IEC 60255 – IEC 61850','OB',1,16500,'Annual (calibration)','Three-phase current/voltage injection. Tests differential, overcurrent, distance relays. Official OMICRON page notes the CMC 353 remains available until 31/12/2026.','https://www.omicronenergy.com/fr/produits/cmc-353/'],
  ['e23','P','MHTA','CT/VT Transformer Turns Ratio + Polarity Tester','Megger','MRCT / TTR300','MV / CT-VT','IEC 60044-1 / IEC 61869','RC',1,3200,'Annual (calibration)','Turns ratio, excitation current, CT and VT polarity.','https://www.megger.com/fr/products/test-equipment/transformer-test/mrct'],
  ['e24','P','MHTA','VLF Cable Insulation Tester MV 34kV','Baur','PHG TD/VLF 34 kV','MV 10-36kV','IEC 60060-3 / NF C 33-052','RC',1,8500,'Every 2 years','In-service dielectric testing of MV cables. 0.1 Hz frequency.','https://www.baur.eu/products/vlf-testing/phg-td'],
  ['e25','E','MHTA','Clamp-on Earth Tester – Rt measurement without disconnection','Fluke','1630-2 FC','All domains – Earth network','IEC 61557-5','OB',1,1861,'Annual (calibration)','Earth resistance measurement without disconnecting electrodes. Fluke Connect WiFi.','https://www.fluke.com/fr-fr/produit/mesure-resistance-terre/fluke-1630-2-fc'],
  ['e27','E','MBTDC','AC/DC Clamp Meter 2500A + iFlex flexible probe','Fluke','376 FC + iFlex Kit','DC Traction 750-1500V / LV','CAT III 1000V / CAT IV 600V','OB',2,570,'Annual (calibration)','Traction return current measurement up to 2500A DC.','https://www.fluke.com/fr-fr/produit/mesure-courant/pinces-amperemetriques/fluke-376-fc'],
  ['e28','E','MBTDC','Network Analyser – voltage, power, energy','Metrel','MI 2892 Power Master','DC Traction 750-1500V','IEC 61000-4-30','OB',1,2100,'Annual (calibration)','Current official Metrel product page for the MI 2892 platform, replacing the obsolete PowerQ4 Plus reference.','https://www.metrel.si/en/shop/PQA/class-a-power-quality-analysers/mi-2892.html'],
  ['e29','E','MBTDC','Stationary Battery Tester – internal impedance','Fluke','BT521 Battery Analyzer','DC Auxiliaries 24-110V','IEEE 1188 / IEC 60896','OB',1,6308,'Annual (calibration)','UPS, 24VDC, 110VDC battery diagnostics at substations.','https://www.fluke.com/fr-fr/produit/testeurs-batteries/fluke-bt521'],
  ['e30','E','MBTDC','Earth Resistance Tester 3 and 4-pole – GEO Kit','Fluke','1625-2 GEO Kit','All domains – Earthing','IEC 61557-5','OB',1,3746,'Annual (calibration)','3- and 4-probe method. Essential for substations and earth loops.','https://www.fluke.com/fr-fr/produit/mesure-resistance-terre/fluke-1625-2-geo'],
  ['e31','E','DIAG','Radiometric Thermal Camera 320×240 – MSX WiFi','Fluke','Ti480 PRO','All domains','EN 13187 / IEC 60068-2','OB',1,7861,'Annual (COFRAC calibration)','Preventive inspection HV/LV/DC. Hot spots on breakers, cables, connections.','https://www.fluke.com/fr-fr/produit/cameras-thermiques/fluke-ti480-pro'],
  ['e32','P','DIAG','Portable Oscilloscope 4-ch 200MHz CAT III','Fluke','190-204/S ScopeMeter','LV / DC Traction','CAT III 1000V – IP51','RC',1,2400,'Annual','Waveform analysis for drives, converters, relays.','https://www.fluke.com/fr-fr/produit/oscilloscopes/fluke-190-204-s'],
  ['e33','P','DIAG','Portable Cable Fault Locator / TDR for LV-MV diagnostics','Megger','Teleflex SX-1','LV / MV / DC Traction','TDR fault pre-location platform','RC',1,4200,'Annual','Portable two-channel TDR used to pre-locate cable faults safely and accurately before repair campaigns. Current official Megger reference, clearer and easier to find than the older PFL40B entry.','https://www.megger.com/en-us/products/teleflex-sx-1'],
  ['e34','P','DIAG','Portable EMC/HF Spectrum Analyser','Anritsu','MS2711E','All domains – EMC','IEC 61000-4 series','OP',1,3800,'Every 2 years','Harmonic disturbances, EMC, track signalling interference.','https://www.anritsu.com/fr-FR/test-measurement/products/ms2711e'],
  ['e35','E','LOTO','Portable Earthing Stick for Switchgear Installations','DEHN','ES SK 1000 / earthing stick range','MV 10-36kV','EN/IEC 61230 (DIN VDE 0683-100)','OB',2,850,'Annual (dielectric test)','Official DEHN earthing stick page for fitting portable earthing and short-circuiting devices on switchgear installations. Safer maintained alternative to the obsolete CATU earthing rod page.','https://www.dehn-international.com/store/p/en-DE/F49866/earthing-sticks-for-switchgear-installations'],
  ['e36','E','LOTO','Railway Earthing and Short-Circuiting Device 750-1500V DC','DEHN','EKV K 50 8500','DC Traction 750-1500V','EN/IEC 61230 / IEC 61138','OB',2,620,'Annual (dielectric test)','Official DEHN railway earthing and short-circuiting device page with overhead contact-line clamp and rail clamp for electrified railway work.','https://www.dehn-international.com/store/p/en-DE/F78297/earthing-and-short-circuiting-devices-for-railway-applications'],
  ['e37','E','LOTO','Portable Metal Group Lock Box – up to 13 padlocks','Brady','51171','All domains','ISO 3864 / EN 1037','OB',2,121,'Annual','Portable metal group lock box for multi-technician interventions. The previous Brady references did not match the displayed equipment type.','https://www.bradyid.com/lockout-tagout/extra-large-portable-metal-group-lock-box-pid-51171'],
  ['e38','E','CABLE','Standard Ratchet Cable Cutter for Cu/Al conductors up to 240 mm²','Knipex','95 31 250','LV / DC Traction / MT','–','OB',1,145,'Replace blades when worn','Official KNIPEX ratchet cable cutter datasheet for clean cutting of standard copper and aluminium cables in confined spaces. This is the team baseline cutter for conventional non-armoured conductors.','https://www.knipex.com/sites/default/files/Product%20data%20sheet%20EN%2095%2031%20250.pdf'],
  ['e39','E','CABLE','High-Capacity Hydraulic Cable Cutter up to 55 mm diameter','Cembre','HT-TC055','MV 10-36kV / DC Traction','–','OB',1,3542,'Annual (inspection)','Official Cembre hydraulic cutter page for large copper, aluminium and reinforced conductors with openable head and rotating cutter head. This is the heavy-capacity team cutter when manual ratchet capacity is no longer sufficient.','https://products.cembre.com/en_US/usa-canada-mexico/product/ht-tc055'],
  ['e40','E','CABLE','Special Cutter for Armoured / Steel-Reinforced Cables up to 32 mm','Knipex','95 32 340 SR','MV armoured cables / reinforced conductors','–','RC',1,320,'Annual (blade inspection)','Heavy-duty cutter for steel-reinforced or armoured conductors where a standard Cu/Al cable cutter is not suitable. This entry is differentiated by cable construction, not just by diameter.','https://www.knipex.com/products/cable-and-wire-rope-shears/acsr-cable-cutter-ratchet-action-for-cables-with-a-steel-core'],
  ['e41','E','CABLE','Ratchet Crimping Tool small sections 0.5-16mm²','Weidmuller','PZ 6 Roto','LV / DC – Control circuits 24-110V','EN 60947-7 / DIN 46228','OB',2,155,'Replace when worn','Crimping ferrules and lugs for control circuits. Anti-return ratchet.','https://www.weidmueller.com/fr/products/tools/crimping-tools/pz-6-roto'],
  ['e42','E','CABLE','Fibreglass Fish Tape 20m – cable pulling needle','Greenlee','540','All domains – Cable pulling','–','OB',1,85,'Replace if broken','Pulling LV, DC, control cables in conduits. Non-conductive fibreglass.','https://www.greenlee.com/fish-tapes/540'],
  ['e43','E','CABLE','MV Cable Joint / Sealing Kit – heat-shrink type up to 36 kV','Raychem RPG','Heat Shrink Medium Voltage Joints','MV 10-36kV / DC Traction','IEC 60502-4 / HD 620','OB',1,220,'Consumable','Heat-shrink medium-voltage jointing and sealing kit used after cable repair, jointing or termination work to restore insulation, screen continuity and moisture protection. Replaces the inaccessible generic nVent category link with a directly accessible official product page.','https://www.raychemrpg.com/reliable-connections/power-cable-accessories/medium-voltage-joints-terminations/heat-shrink-medium-voltage-joints/heat-shrink-medium-voltage-joints'],
  ['e50','E','CABLE','LV Cable Joint / Sealing Kit – heat-shrink type up to 1.1 kV','Raychem RPG','Heat Shrink Low Voltage Joints','LV power / auxiliaries / control cables','EN 50393 / IS 13573-1','OB',2,65,'Consumable','Heat-shrink low-voltage jointing and sealing kit for straight or branch cable repairs up to 1.1 kV. Suitable for PVC, rubber and XLPE cables where insulation restoration and moisture sealing are required after damage or modification work.','https://www.raychemrpg.com/reliable-connections/power-cable-accessories/low-voltage-joints-terminations/heat-shrink-low-voltage-joints/heat-shrink-low-voltage-joints'],
  ['e44','E','COLLECTIF','Portable Inverter Generator 3.2 kW – 230V silent','Honda','EU32i','LV Auxiliaries','EN 12601','RC',1,4169,'Annual (oil change + service)','Current official Honda portable inverter generator page. Compact, quiet and easier to source than the discontinued EU30i reference.','https://shop.honda.fr/p/groupe-eu-32-ik-3200w/15323020/'],
  ['e45','E','COLLECTIF','Site Barrier + Red/White Delimitation Kit','Novap','1320147 + 3055009','All domains – Track safety','NF EN ISO 7010','OB',2,280,'Annual (inspection)','Directly sourceable Novap combination for local worksite delimitation: telescopic red/white barrier with matching red/white site tape.','https://www.novap.fr/poteaux-barrieres/barrieres/barrieres-telescopiques/barriere-telescopique-de-1-a-1-80-m-blanche-rouge-blanc-hachure-type-k2.html'],
  ['e46','E','COLLECTIF','Professional First Aid Case DIN 13169','SÖHNGEN','DYNAMIC-GLOW L 0301401','All domains','DIN 13169','OB',1,339,'6 months (expiry check)','Official SÖHNGEN first aid case page with DIN 13169 filling, wall holder and splash-protected case for vehicles and workshops.','https://shop.aluderm.de/erste-hilfe-koffer-orange-dynamic-glow-l-ind-norm-plus-din-13169'],
  ['e47','E','COLLECTIF','CO2 Extinguisher 5kg – class B electrical cabinets','GLORIA','KS 5 ST','All domains','EN 3','OB',1,140,'Annual (pressure check)','Official GLORIA CO2 extinguisher page listing 5 kg models suitable for electrical equipment and residue-free firefighting.','https://www.gloria.de/de/produkt/feuerloescher/co2-handhebel/'],
  ['e48','E','COLLECTIF','Rugged Laptop Toughbook 55 Series','Panasonic','TOUGHBOOK 55 mk3','All domains – Diagnostics','IP53 – MIL-STD-810H','RC',1,2595,'5-year replacement','Current official Panasonic Connect page for the Toughbook 55 platform used for IEC 61850 relay connection, SCADA and drive diagnostics. Entry aligned to a current base mk3 market configuration.','https://eu.connect.panasonic.com/de/en/products/toughbook/toughbook-55-series'],
  ['e49','E','OUTILS','Open-end / Ring Wrench Set 6-34 mm – 25 pcs','Facom','440.JE25','All domains – heavy bolting','NF ISO 1711-1 / NF ISO 691 / NF ISO 7738','RC',1,520,'Replace when worn','Current official FACOM large-range set covering the heavier fastening sizes that are not practical to carry at technician level. Suitable as the team-level wrench base for cabinets, supports and heavier mechanical interfaces.','https://www.facom.com/product/440je25/6mm-34mm-combination-wrench-set-25-pc'],
  ['e51','E','OUTILS','Maintenance Pliers Set – cutting, combination, long-nose, multigrip','Facom','CPE.A4','All domains – team hand tools','ISO 5746 / ISO 5748 / ISO 8976','OB',1,145,'Replace when worn','Official FACOM 4-piece maintenance plier set including combination pliers, diagonal cutters, half-round long-nose pliers and locking multigrip pliers. Good team-level complement to the insulated technician kit when broader mechanical handling and gripping are needed.','https://www.facom.com/product/cpea4/maintenance-plier-set-4-pc'],
  ],
  PSD: [],
  CAT: [],
  TRACK: [],
  '3RD': [],
  AFC: [],
  DEQ: [],
  MEP: [],
};

const TOOL_IMAGE_MODULES = import.meta.glob("./images/*.{png,jpg,jpeg,webp,avif,gif}", {
  eager: true,
  import: "default",
});

const DEFAULT_CONTEXT_IDS = CONTEXTS.map(context => context.id);
const TOOL_CONTEXT_OVERRIDES = {
  'POS:e01': ['heavy'],
  'POS:e03': ['heavy'],
  'POS:e04': ['heavy'],
  'POS:e15': ['heavy'],
  'POS:e16': ['heavy'],
  'POS:e17': ['heavy'],
  'POS:e20': ['heavy'],
  'POS:e24': ['heavy'],
};
const PRICE_OVERRIDE_STORAGE_KEY = 'railway-tooling-price-overrides-v1';
const LIFECYCLE_OVERRIDE_STORAGE_KEY = 'railway-tooling-lifecycle-overrides-v1';

const LIFECYCLE_TYPES = {
  durable: { label: 'Durable asset' },
  periodic_replacement: { label: 'Periodic replacement' },
  condition_based: { label: 'Condition-based replacement' },
  consumable: { label: 'Consumable / replenishment' },
};

function loadStoredPriceOverrides() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PRICE_OVERRIDE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function loadStoredLifecycleOverrides() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LIFECYCLE_OVERRIDE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function inferLifecycleBaseline(tool) {
  const period = String(tool.period || '').toLowerCase();
  let type = 'durable';
  let intervalValue = '';
  let intervalUnit = 'years';
  let replacementRatio = '100';

  if (period.includes('consumable')) {
    type = 'consumable';
    intervalValue = '12';
    intervalUnit = 'months';
  } else if (
    period.includes('replace when worn') ||
    period.includes('replace if defective') ||
    period.includes('after arc event')
  ) {
    type = 'condition_based';
  } else {
    const yearMatch = period.match(/(\d+)\s*year/);
    const monthMatch = period.match(/(\d+)\s*month/);
    if (yearMatch) {
      type = 'periodic_replacement';
      intervalValue = yearMatch[1];
      intervalUnit = 'years';
    } else if (monthMatch) {
      type = 'periodic_replacement';
      intervalValue = monthMatch[1];
      intervalUnit = 'months';
    } else if (period.includes('annual')) {
      type = 'periodic_replacement';
      intervalValue = '1';
      intervalUnit = 'years';
    }
  }

  return {
    type,
    intervalValue,
    intervalUnit,
    replacementRatio,
    source: '',
    year: '',
  };
}

function resolveLifecycle(tool, lifecycleOverrides) {
  const baseline = inferLifecycleBaseline(tool);
  const override = lifecycleOverrides?.[tool.uid];
  return {
    lifecycleType: override?.type || baseline.type,
    lifecycleIntervalValue: String(
      override?.intervalValue ?? baseline.intervalValue ?? ''
    ),
    lifecycleIntervalUnit: override?.intervalUnit || baseline.intervalUnit,
    lifecycleReplacementRatio: String(
      override?.replacementRatio ?? baseline.replacementRatio ?? '100'
    ),
    lifecycleSource: typeof override?.source === 'string' ? override.source.trim() : '',
    lifecycleYear: typeof override?.year === 'string' ? override.year.trim() : '',
    hasLifecycleOverride: Boolean(override),
    lifecycleBaseline: baseline,
  };
}

const TOOL_IMAGE_URLS = Object.fromEntries(
  Object.entries(TOOL_IMAGE_MODULES).map(([path, url]) => [
    path.split("/").pop().toLowerCase(),
    url,
  ])
);

const TOOL_IMAGE_FILES_BY_BASE = Object.fromEntries(
  Object.keys(TOOL_IMAGE_URLS).map((filename) => [
    filename.replace(/\.[^.]+$/, ""),
    filename,
  ])
);

const TOOLS = Object.entries(RAW_BY_SUBSYSTEM).flatMap(([subsystem, rawTools]) =>
  rawTools.map(([id,level,cat,name,brand,model,domain,norm,statut,qty,price,period,notes,productUrl]) => {
    // derive imgFile from id + brand slug
    const brandSlug = brand.split('/')[0].trim().toLowerCase().replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_').replace(/_$/,'');
    const modelSlug = model.split('/')[0].trim().toLowerCase().replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_').replace(/_$/,'');
    const imgBase = `${id}_${brandSlug}_${modelSlug}`.toLowerCase();
    const matchedImgFile = TOOL_IMAGE_FILES_BY_BASE[imgBase] || `${imgBase}.jpg`;
    const imgSrc = TOOL_IMAGE_URLS[matchedImgFile] || null;
    const imgFile = matchedImgFile;
    const uid = `${subsystem}:${id}`;
    return {id,uid,level,cat,name,brand,model,domain,norm,statut,qty,price,period,notes,productUrl,imgFile,imgSrc,subsystem,contexts:TOOL_CONTEXT_OVERRIDES[uid] || DEFAULT_CONTEXT_IDS};
  })
);

const PRIMARY_USE_OVERRIDES = {
  t01: 'Reference handheld meter for troubleshooting live LV and traction DC circuits. Use it to confirm voltage presence, continuity, resistance, current and unstable electrical behavior during diagnosis, fault localisation and post-repair validation.',
  t02: 'Front-line screening tool before opening a cabinet or approaching live LV conductors. Use it for fast presence checks on feeders, terminals and auxiliaries when you need a safe first indication before switching to contact measurement.',
  t03: 'Formal safety VAT used to prove absence of voltage before lockout, access or contact on isolated LV and traction-related circuits. Use it as the mandatory final confirmatory step after isolation to prove the circuit is actually dead.',
  t12: 'Routine insulation tester for 24 VDC, 48 VDC and 110 VDC auxiliaries, control loops and low-voltage wiring. Use it after cable work, moisture suspicion or fault tracing to detect insulation degradation before re-energisation.',
  t13: 'Commissioning and compliance tester for low-voltage boards, auxiliaries and socket circuits. Use it before energising a new or modified installation to validate RCD behavior, loop impedance and core IEC 60364 safety checks.',
  t14: 'Broader installation test platform used when a standard loop or continuity check is not enough. Use it for acceptance testing, fault-loop analysis and higher-voltage insulation campaigns on more complex LV installations.',
  t15: 'Main current measurement clamp for traction DC and mixed AC/DC maintenance. Use it to quantify feeder load, return current, inrush, imbalance or suspicious current draw without opening the circuit.',
  t16: 'Quick pre-energisation phase-sequence verifier for motors, auxiliaries and rotating equipment. Use it before startup or after reconnection work to avoid reverse rotation and wrong three-phase wiring.',
  t17: 'Contact voltage and polarity tester for traction DC circuits and mixed AC/DC environments. Use it when you must identify DC polarity, confirm potential difference or perform a diagnostic contact check on conductors where the formal VAT tool is not the right instrument on its own.',
  t18: 'Fast thermal screening tool for hot spots on terminals, fuses, disconnectors, cable lugs and electronic components. Use it during inspections to identify abnormal heating before moving to a deeper electrical diagnosis.',
  t28: 'Personal 18 V drill/driver assigned to each technician for routine fastening and light drilling. Use it for cabinet covers, terminal blocks, small brackets and everyday assembly work where speed and portability matter more than impact capacity.',
  e15: 'Primary medium-voltage presence detector used before earthing, short-circuiting or authorising access on MV switchgear. Use it as the team reference to confirm whether a feeder or cubicle is still energised in the 20-36 kV range.',
  e16: 'Dedicated catenary voltage detector for 25 kV AC overhead line environments. Use it before railway earthing operations, possession access and worksite release to confirm the contact line is not live.',
  e17: 'Synchronism and phase-comparison instrument for medium-voltage sources before coupling or transfer operations. Use it when checking whether two MV points belong to the same phase relationship prior to switching actions.',
  e18: 'Advanced power-quality analyser for disturbances that standard meters cannot explain. Use it on feeders and auxiliaries to record harmonics, dips, flicker, transient events and load profile issues over time.',
  e19: '5 kV insulation platform for substations, MV cables, motors and transformers. Use it during acceptance testing, periodic insulation trending and after an outage or moisture event to assess dielectric health.',
  e20: '10 kV insulation tester reserved for heavier MV and HV insulation campaigns. Use it on long cable sections, large machines and transformer windings when the test level required is above routine 5 kV verification.',
  e21: 'Low-resistance micro-ohmmeter for switchgear primary paths and bolted power connections. Use it to verify contact resistance on breakers, disconnectors and busbars after maintenance, assembly or refurbishment.',
  e22: 'Protection commissioning platform for relay testing and secondary injection. Use it to validate trip logic, protection curves, IEC 61850 behavior and complete relay schemes before returning a bay to service.',
  e23: 'Ratio and polarity tester for instrument transformers during commissioning and fault analysis. Use it to verify CT/VT wiring, ratio accuracy and polarity before protection circuits are trusted in operation.',
  e24: 'Specialised MV cable dielectric test set for in-service cable assessment. Use it after repairs, jointing work or before re-commissioning to stress the cable insulation at very low frequency and confirm serviceability.',
  e25: 'Clamp earth tester for rapid earthing checks without disconnecting the installation. Use it during inspections or troubleshooting when you need a fast resistance trend on an existing earth network with minimal disruption.',
  e27: 'Team-level high-current clamp used on traction return circuits, substations and large LV feeders. Use it when current exceeds the range or practicality of a technician handheld clamp and flexible iFlex access is needed.',
  e28: 'Network and energy analyser for deeper traction DC investigations. Use it to log voltage, current, power and energy behavior over time when diagnosing substations, chargers, converters or abnormal DC load conditions.',
  e29: 'Battery diagnostic instrument for stationary DC systems such as UPS, charger-backed auxiliaries and substation battery banks. Use it during preventive maintenance to detect weak cells, rising impedance and declining autonomy.',
  e30: 'Full earth measurement kit for 3-pole, 4-pole and related ground-testing methods. Use it when commissioning or auditing substations, structures and earth loops where a clamp-only method is not enough.',
  e31: 'Radiometric thermal imaging camera for large-area inspection and condition-based maintenance. Use it to scan cabinets, transformers, switchgear, drives and cable terminations for hidden heating patterns before failure.',
  e10: 'Shared 18 V hammer drill/driver kept at team level for heavier fixing work. Use it when the personal technician drill/driver is not enough, especially for anchors, masonry, stronger supports and more demanding drilling jobs.',
  e38: 'Team baseline ratchet cutter for standard copper and aluminium power cables. Use it for routine cable preparation and replacement work when the conductor is conventional and still within normal manual cutting capacity.',
  e39: 'High-capacity hydraulic cutter reserved for larger diameters and heavier cable sections. Use it when a standard ratchet cutter becomes too limited because of cable size, section or required cutting force.',
  e40: 'Specialised cutter for armoured or steel-reinforced cable construction. Use it when the difficulty comes from armour or steel core reinforcement rather than from diameter alone, and a normal Cu/Al cable cutter is not appropriate.',
  e50: 'Heat-shrink low-voltage jointing kit kept at team level for damaged or modified LV cable sections. Use it after cable repair, extension or rerouting work to rebuild insulation, sealing and mechanical protection on auxiliaries or power circuits up to 1.1 kV.',
  e32: 'Portable isolated oscilloscope for waveform-level troubleshooting on converters, drives, relay outputs and control electronics. Use it when a multimeter cannot explain unstable switching, ripple, spikes or timing faults.',
  e33: 'Time-domain reflectometer for locating cable defects from one accessible end. Use it to estimate the distance to open circuits, short circuits or insulation anomalies before excavation or cable section replacement.',
  e34: 'Spectrum analyser for electromagnetic compatibility investigations around rail equipment. Use it when chasing radio-frequency noise, interference on signalling-related assets or abnormal emissions from converters and power electronics.',
  e51: 'Shared team plier assortment for gripping, cutting, clamping and awkward mechanical handling tasks. Use it when the technician-level insulated pliers are too limited and the intervention needs a broader set including diagonal cutters, long-nose pliers and multigrip capability.',
};

// ─── SVG CATEGORY ICONS ───────────────────────────────────────────────────────
const CatSVG = ({ cat, size=72 }) => {
  const s = { strokeLinecap:'round', strokeLinejoin:'round', fill:'none' };
  const icons = {
    PPE:[
      <path key="g1" {...s} d="M24 56 L24 32 Q24 24 31 24 Q35 24 38 28 L40 31 L42 28 Q45 24 49 24 Q56 24 56 32 L56 56" stroke="#F5B942" strokeWidth="3"/>,
      <path key="g2" {...s} d="M31 56 L31 38 M40 56 L40 34 M49 56 L49 38" stroke="#F5B942" strokeWidth="2.5"/>
    ],
    SAFETY:[
      <path key="s" {...s} d="M40 10 L64 24 L64 50 C64 65 52 74 40 80 C28 74 16 65 16 50 L16 24 Z" stroke="#FF8C42" strokeWidth="3"/>,
      <path key="c" {...s} d="M30 43 L37 50 L52 35" stroke="#FF8C42" strokeWidth="3.5"/>,
    ],
    MBTDC:[
      <circle key="o" cx="40" cy="40" r="23" stroke="#00C9A7" strokeWidth="2.5" fill="none"/>,
      <circle key="c" cx="40" cy="40" r="5" fill="#00C9A7"/>,
      <path key="h" {...s} d="M40 40 L52 28" stroke="#00C9A7" strokeWidth="2.5"/>,
      <path key="t" d="M40 17v5 M63 40h-5 M40 63v-5 M17 40h5" stroke="#00C9A7" strokeWidth="2" strokeLinecap="round"/>,
    ],
    MHTA:[
      <path key="t" {...s} d="M22 62 L40 20 L58 62 Z" stroke="#4DB8FF" strokeWidth="2.5"/>,
      <path key="f" d="M35 36 L40 24 L45 36 Z" fill="#4DB8FF" opacity="0.5" stroke="none"/>,
      <path key="l" d="M30 62v-13 M50 62v-13" stroke="#4DB8FF" strokeWidth="2" strokeLinecap="round"/>,
    ],
    CABLE:[
      <path key="w" {...s} d="M20 40 Q20 26 35 26 L45 26 Q60 26 60 40 Q60 54 45 54 L35 54 Q20 54 20 40" stroke="#F5B942" strokeWidth="3"/>,
      <circle key="l" cx="17" cy="40" r="5" fill="#F5B942"/>,
      <circle key="r" cx="63" cy="40" r="5" fill="#F5B942"/>,
      <path key="e" d="M10 40h7 M63 40h7" stroke="#F5B942" strokeWidth="2.5" strokeLinecap="round"/>,
    ],
    LOTO:[
      <rect key="b" x="26" y="39" width="28" height="23" rx="4" stroke="#9B72CF" strokeWidth="2.5" fill="none"/>,
      <path key="s" {...s} d="M32 39 L32 29 Q32 19 40 19 Q48 19 48 29 L48 39" stroke="#9B72CF" strokeWidth="2.5"/>,
      <circle key="k" cx="40" cy="51" r="4" fill="#9B72CF"/>,
      <line key="d" x1="40" y1="55" x2="40" y2="59" stroke="#9B72CF" strokeWidth="2" strokeLinecap="round"/>,
    ],
    DIAG:[
      <path key="a" {...s} d="M20 50 Q26 26 40 26 Q54 26 60 50" stroke="#4ECDC4" strokeWidth="2.5"/>,
      <line key="h" x1="15" y1="50" x2="65" y2="50" stroke="#4ECDC4" strokeWidth="2"/>,
      <line key="v" x1="40" y1="50" x2="40" y2="64" stroke="#4ECDC4" strokeWidth="2"/>,
      <polyline key="w" points="22,50 30,38 38,46 44,30 52,50 58,44" stroke="#4ECDC4" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    ],
    OUTILS:[
      <path key="w" {...s} d="M26 58 L44 40 Q39 29 47 22 Q52 17 61 21 L54 28 L56 36 L64 38 L71 31 Q74 39 69 45 Q62 52 52 48 L34 66 Z" stroke="#52D98A" strokeWidth="2.5"/>,
    ],
    COLLECTIF:[
      <rect key="b" x="20" y="38" width="40" height="27" rx="3" stroke="#7BA7A7" strokeWidth="2.5" fill="none"/>,
      <path key="h" {...s} d="M30 38 L30 30 Q30 21 40 21 Q50 21 50 30 L50 38" stroke="#7BA7A7" strokeWidth="2.5"/>,
      <line key="l" x1="20" y1="48" x2="60" y2="48" stroke="#7BA7A7" strokeWidth="2"/>,
    ],
  };
  const bg = {
    PPE:C.amberDim, SAFETY:C.orangeDim, MBTDC:C.tealDim, MHTA:C.blueDim, CABLE:C.amberDim,
    LOTO:C.violetDim, DIAG:C.cyanDim, OUTILS:C.greenDim, COLLECTIF:C.slateDim,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <rect width="80" height="80" rx="14" fill={bg[cat]||C.slateDim}/>
      {icons[cat]||icons['COLLECTIF']}
    </svg>
  );
};

function ToolVisual({ tool, size=72, radius=14 }) {
  if (tool.imgSrc) {
    return (
      <img
        src={tool.imgSrc}
        alt={tool.name}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          objectPosition: 'center',
          borderRadius: radius,
          display: 'block',
          transition: 'transform 0.25s ease, filter 0.25s ease',
        }}
      />
    );
  }

  return <CatSVG cat={tool.cat} size={size} />;
}

// ─── COPY BUTTON ─────────────────────────────────────────────────────────────
function CopyBtn({ text, label, accent=C.teal, light=false }) {
  const [ok, setOk] = useState(false);
  const go = () => { navigator.clipboard?.writeText(text).then(()=>{ setOk(true); setTimeout(()=>setOk(false),2000); }); };
  return (
    <button onClick={go} style={{
      background:ok?accent+'18':light?'#FFFFFF':C.bgMid, border:`1px solid ${ok?accent:(light?'rgba(71,84,103,0.16)':C.borderL)}`,
      color:ok?accent:(light?'#475467':C.textSub), borderRadius:6, padding:'5px 11px', cursor:'pointer',
      fontSize:11, fontWeight:600, display:'flex', alignItems:'center', gap:5,
      fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.03em', transition:'all 0.15s',
    }}>
      {ok?<CheckCheck size={11}/>:<Copy size={11}/>} {ok?'Copied!':label}
    </button>
  );
}

function PrimaryUse({ tool }) {
  return PRIMARY_USE_OVERRIDES[tool.id] || tool.notes;
}

function MetaTile({ label, value, accent, surface=C.bgMid, borderColor=C.border, bodyColor=C.text, labelColor=C.textSub }) {
  return (
    <div style={{ background:surface, borderRadius:10, padding:'11px 12px', border:`1px solid ${borderColor}` }}>
      <div style={{ fontSize:9, color:accent||labelColor, marginBottom:5, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize:12, color:bodyColor, fontWeight:500, lineHeight:1.45 }}>{value}</div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export const TOOLING_CATALOG = TOOLS;
export const TOOLING_SUBSYSTEMS = SUBSYSTEMS;
export const TOOLING_CONTEXTS = CONTEXTS;

export default function App({
  embedded = false,
  subsystem: controlledSubsystem,
  onSubsystemChange,
  context: controlledContext,
  onContextChange,
  selection: controlledSelection,
  onSelectionChange,
  workforceState: controlledWorkforce,
  onWorkforceChange,
  priceOverrides: controlledPriceOverrides,
  onPriceOverridesChange,
  lifecycleOverrides: controlledLifecycleOverrides,
  onLifecycleOverridesChange,
}) {
  const [localSubsystem, setLocalSubsystem] = useState(controlledSubsystem || 'POS');
  const subsystem = controlledSubsystem ?? localSubsystem;
  const setSubsystem = onSubsystemChange ?? setLocalSubsystem;
  const [localContext, setLocalContext] = useState(controlledContext || 'metro');
  const ctx = controlledContext ?? localContext;
  const setCtx = onContextChange ?? setLocalContext;
  const isSelectionControlled = controlledSelection !== undefined;
  const isWorkforceControlled = controlledWorkforce !== undefined;
  const isPriceOverridesControlled = controlledPriceOverrides !== undefined;
  const isLifecycleOverridesControlled = controlledLifecycleOverrides !== undefined;
  const [lvl, setLvl]     = useState('ALL');
  const [cat, setCat]     = useState('ALL');
  const [stat, setStat]   = useState('ALL');
  const [q, setQ]         = useState('');
  const [localSel, setLocalSel] = useState(new Set());
  const [modal, setModal] = useState(null);
  const [localPriceOverrides, setLocalPriceOverrides] = useState(loadStoredPriceOverrides);
  const [priceDraft, setPriceDraft] = useState({ price:'', source:'', year:'' });
  const [localLifecycleOverrides, setLocalLifecycleOverrides] = useState(loadStoredLifecycleOverrides);
  const [lifecycleDraft, setLifecycleDraft] = useState({
    type: 'durable',
    intervalValue: '',
    intervalUnit: 'years',
    replacementRatio: '100',
    source: '',
    year: '',
  });
  const [vw, setVw]       = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  // ── Workforce config per subsystem ──
  const [localWorkforce, setLocalWorkforce] = useState({
    POS:   { tech:4, equipe:1, project:1 },
    PSD:   { tech:3, equipe:1, project:1 },
    CAT:   { tech:4, equipe:1, project:1 },
    TRACK: { tech:5, equipe:2, project:1 },
    '3RD': { tech:3, equipe:1, project:1 },
    AFC:   { tech:2, equipe:1, project:1 },
    DEQ:   { tech:2, equipe:1, project:1 },
    MEP:   { tech:3, equipe:1, project:1 },
  });
  const sel = isSelectionControlled ? controlledSelection : localSel;
  const setSel = updater => {
    const nextValue = typeof updater === 'function' ? updater(new Set(sel || [])) : updater;
    const normalized = nextValue instanceof Set ? new Set(nextValue) : new Set(nextValue || []);
    if (isSelectionControlled) {
      onSelectionChange?.(normalized);
      return;
    }
    setLocalSel(normalized);
  };
  const workforce = isWorkforceControlled ? controlledWorkforce : localWorkforce;
  const setWorkforce = updater => {
    const nextValue = typeof updater === 'function' ? updater(workforce) : updater;
    if (isWorkforceControlled) {
      onWorkforceChange?.(nextValue);
      return;
    }
    setLocalWorkforce(nextValue);
  };
  const priceOverrides = isPriceOverridesControlled ? controlledPriceOverrides : localPriceOverrides;
  const setPriceOverrides = updater => {
    const nextValue = typeof updater === 'function' ? updater(priceOverrides) : updater;
    if (isPriceOverridesControlled) {
      onPriceOverridesChange?.(nextValue);
      return;
    }
    setLocalPriceOverrides(nextValue);
  };
  const lifecycleOverrides = isLifecycleOverridesControlled ? controlledLifecycleOverrides : localLifecycleOverrides;
  const setLifecycleOverrides = updater => {
    const nextValue = typeof updater === 'function' ? updater(lifecycleOverrides) : updater;
    if (isLifecycleOverridesControlled) {
      onLifecycleOverridesChange?.(nextValue);
      return;
    }
    setLocalLifecycleOverrides(nextValue);
  };
  const nbTech  = workforce[subsystem].tech;
  const nbEquipe = workforce[subsystem].equipe;
  const nbProject = workforce[subsystem].project;
  const setNbTech  = v => setWorkforce(p=>({...p, [subsystem]:{...p[subsystem], tech:Math.max(0,v)}}));
  const setNbEquipe = v => setWorkforce(p=>({...p, [subsystem]:{...p[subsystem], equipe:Math.max(0,v)}}));
  const setNbProject = v => setWorkforce(p=>({...p, [subsystem]:{...p[subsystem], project:Math.max(0,v)}}));

  const context = CONTEXTS.find(c=>c.id===ctx);
  const acc = context.accent;
  const isTablet = vw < 1120;
  const isMobile = vw < 760;
  const subsystemMeta = SUBSYSTEMS.find(s=>s.id===subsystem);
  const activeTools = useMemo(
    () => TOOLS
      .filter(t=>t.subsystem===subsystem && (t.contexts || DEFAULT_CONTEXT_IDS).includes(ctx))
      .map(tool => {
        const override = priceOverrides[tool.uid];
        const currentPrice = typeof override?.price === 'number' ? override.price : tool.price;
        const priceSource = typeof override?.source === 'string' ? override.source.trim() : '';
        const priceYear = typeof override?.year === 'string' ? override.year.trim() : '';
        const lifecycle = resolveLifecycle(tool, lifecycleOverrides);
        return {
          ...tool,
          currentPrice,
          priceSource,
          priceYear,
          ...lifecycle,
          hasPriceOverride: Boolean(override),
        };
      }),
    [ctx, subsystem, priceOverrides, lifecycleOverrides]
  );
  const modalTool = modal ? activeTools.find(t=>t.uid===modal.uid) || TOOLS.find(t=>t.uid===modal.uid) || modal : null;

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || isPriceOverridesControlled) return;
    window.localStorage.setItem(PRICE_OVERRIDE_STORAGE_KEY, JSON.stringify(priceOverrides));
  }, [isPriceOverridesControlled, priceOverrides]);

  useEffect(() => {
    if (typeof window === 'undefined' || isLifecycleOverridesControlled) return;
    window.localStorage.setItem(LIFECYCLE_OVERRIDE_STORAGE_KEY, JSON.stringify(lifecycleOverrides));
  }, [isLifecycleOverridesControlled, lifecycleOverrides]);

  useEffect(() => {
    if (!modalTool) return;
    setPriceDraft({
      price: String(modalTool.currentPrice ?? modalTool.price ?? ''),
      source: modalTool.priceSource || '',
      year: modalTool.priceYear || '',
    });
    setLifecycleDraft({
      type: modalTool.lifecycleType || 'durable',
      intervalValue: String(modalTool.lifecycleIntervalValue ?? ''),
      intervalUnit: modalTool.lifecycleIntervalUnit || 'years',
      replacementRatio: String(modalTool.lifecycleReplacementRatio ?? '100'),
      source: modalTool.lifecycleSource || '',
      year: modalTool.lifecycleYear || '',
    });
  }, [modalTool]);

  const filtered = useMemo(()=>activeTools.filter(t=>{
    if(lvl!=='ALL'&&t.level!==lvl) return false;
    if(cat!=='ALL'&&t.cat!==cat) return false;
    if(stat!=='ALL'&&t.statut!==stat) return false;
    if(q){ const s=q.toLowerCase(); return t.name.toLowerCase().includes(s)||t.brand.toLowerCase().includes(s)||t.model.toLowerCase().includes(s); }
    return true;
  }),[activeTools,lvl,cat,stat,q]);

  const toggle = uid => setSel(p=>{const n=new Set(p);n.has(uid)?n.delete(uid):n.add(uid);return n;});
  const selT   = activeTools.filter(t=>sel.has(t.uid));
  const total  = selT.reduce((s,t)=>s+t.qty*t.currentPrice,0);
  const tTotal = selT.filter(t=>t.level==='T').reduce((s,t)=>s+t.qty*t.currentPrice,0);
  const eTotal = selT.filter(t=>t.level==='E').reduce((s,t)=>s+t.qty*t.currentPrice,0);
  const pTotal = selT.filter(t=>t.level==='P').reduce((s,t)=>s+t.qty*t.currentPrice,0);
  const mandatorySelected = selT.filter(t=>t.statut==='OB').length;
  const mandatoryTotal = activeTools.filter(t=>t.statut==='OB').length;
  const coveragePct = mandatoryTotal ? Math.round((mandatorySelected / mandatoryTotal) * 100) : 0;
  const byCat  = Object.entries(CATS).map(([k,v])=>({key:k,...v,total:selT.filter(t=>t.cat===k).reduce((s,t)=>s+t.qty*t.currentPrice,0)})).filter(c=>c.total>0);
  const fmt    = n => new Intl.NumberFormat('fr-FR',{minimumFractionDigits:0,maximumFractionDigits:0}).format(n);
  const currentYear = String(new Date().getFullYear());
  const priceDraftValue = Number.parseFloat(String(priceDraft.price).replace(',', '.'));
  const canSavePriceOverride = Number.isFinite(priceDraftValue) && priceDraftValue >= 0;
  const lifecycleIntervalValue = Number.parseFloat(String(lifecycleDraft.intervalValue).replace(',', '.'));
  const lifecycleReplacementRatio = Number.parseFloat(String(lifecycleDraft.replacementRatio).replace(',', '.'));
  const lifecycleNeedsInterval = lifecycleDraft.type === 'periodic_replacement' || lifecycleDraft.type === 'consumable';
  const canSaveLifecycleOverride =
    Boolean(lifecycleDraft.type) &&
    Number.isFinite(lifecycleReplacementRatio) &&
    lifecycleReplacementRatio >= 0 &&
    lifecycleReplacementRatio <= 100 &&
    (!lifecycleNeedsInterval || (Number.isFinite(lifecycleIntervalValue) && lifecycleIntervalValue > 0));
  const getLevelMeta = level => LEVELS[level] || LEVELS.T;
  const getUnitLabel = tool => `${tool.qty} ${getLevelMeta(tool.level).unit}`;
  const getPriceReferenceLabel = tool => {
    if (tool.priceSource && tool.priceYear) return `${tool.priceSource} · ${tool.priceYear}`;
    if (tool.priceSource) return tool.priceSource;
    if (tool.priceYear) return `Reference year · ${tool.priceYear}`;
    return tool.hasPriceOverride ? 'Manual price reference' : 'Catalog baseline';
  };
  const getLifecycleReferenceLabel = tool => {
    if (tool.lifecycleSource && tool.lifecycleYear) return `${tool.lifecycleSource} Â· ${tool.lifecycleYear}`;
    if (tool.lifecycleSource) return tool.lifecycleSource;
    if (tool.lifecycleYear) return `Reference year Â· ${tool.lifecycleYear}`;
    return tool.hasLifecycleOverride ? 'Manual lifecycle assumption' : 'Derived from current maintenance note';
  };
  const getLifecycleSummary = tool => {
    const typeLabel = LIFECYCLE_TYPES[tool.lifecycleType]?.label || 'Lifecycle assumption';
    const ratioLabel = `${tool.lifecycleReplacementRatio}% replaced`;
    if (tool.lifecycleType === 'periodic_replacement' || tool.lifecycleType === 'consumable') {
      const interval = tool.lifecycleIntervalValue
        ? `${tool.lifecycleIntervalValue} ${tool.lifecycleIntervalUnit}`
        : 'interval not set';
      return `${typeLabel} Â· every ${interval} Â· ${ratioLabel}`;
    }
    return `${typeLabel} Â· ${ratioLabel}`;
  };
  const savePriceOverride = () => {
    if (!modalTool || !canSavePriceOverride) return;
    setPriceOverrides(prev => ({
      ...prev,
      [modalTool.uid]: {
        price: priceDraftValue,
        source: priceDraft.source.trim(),
        year: priceDraft.year.trim(),
      },
    }));
  };
  const resetPriceOverride = () => {
    if (!modalTool) return;
    setPriceOverrides(prev => {
      const next = { ...prev };
      delete next[modalTool.uid];
      return next;
    });
  };

  const saveLifecycleOverride = () => {
    if (!modalTool || !canSaveLifecycleOverride) return;
    setLifecycleOverrides(prev => ({
      ...prev,
      [modalTool.uid]: {
        type: lifecycleDraft.type,
        intervalValue: lifecycleNeedsInterval ? String(lifecycleIntervalValue) : '',
        intervalUnit: lifecycleDraft.intervalUnit,
        replacementRatio: String(lifecycleReplacementRatio),
        source: lifecycleDraft.source.trim(),
        year: lifecycleDraft.year.trim(),
      },
    }));
  };
  const resetLifecycleOverride = () => {
    if (!modalTool) return;
    setLifecycleOverrides(prev => {
      const next = { ...prev };
      delete next[modalTool.uid];
      return next;
    });
  };

  const pill = (active, color, label, fn) => (
    <button onClick={fn} style={{
      background: embedded
        ? active
          ? `${color}16`
          : '#FFFFFF'
        : active
          ? color+'25'
          : C.bgMid,
      border: embedded
        ? `1px solid ${active ? color : 'rgba(71,84,103,0.14)'}`
        : `1px solid ${active?color:C.border}`,
      color: embedded
        ? active
          ? color
          : '#475467'
        : active
          ? color
          : C.textSub,
      padding: embedded ? '8px 13px' : '5px 12px',
      borderRadius: embedded ? 12 : 20,
      cursor:'pointer',
      fontSize:11,
      fontWeight:700,
      fontFamily:"'Barlow Condensed', sans-serif",
      letterSpacing:'0.05em',
      transition:'all 0.15s',
      whiteSpace:'nowrap',
      boxShadow: embedded && active ? `0 10px 20px ${color}12` : 'none',
    }}>{label}</button>
  );

  return (
    <div style={{
      fontFamily:"'Barlow', sans-serif",
      background:embedded ? 'transparent' : `
        radial-gradient(circle at top right, rgba(0,201,167,0.14), transparent 24%),
        radial-gradient(circle at top left, rgba(78,205,196,0.08), transparent 22%),
        linear-gradient(180deg, #0E2121 0%, ${C.bg} 22%, ${C.bg} 100%)
      `,
      minHeight:embedded ? 'auto' : '100vh',
      color:C.text,
    }}>
      <style>{fontStyle}</style>

      {/* ── HEADER ── */}
      {!embedded && (
      <div style={{ background:`linear-gradient(180deg, rgba(13,32,32,0.96) 0%, rgba(10,26,26,0.96) 100%)`, borderBottom:`1px solid ${C.border}` }}>
        {/* Top bar */}
        <div style={{ padding:isMobile?'10px 14px':'0 22px', display:'flex', alignItems:'center', gap:16, minHeight:isMobile?null:54, flexWrap:isTablet?'wrap':'nowrap', borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, background:C.tealMid, borderRadius:8, border:`1px solid ${C.teal}40`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:16, fontWeight:800, letterSpacing:'0.08em', color:C.text }}>
                RAIL MAINTENANCE
              </div>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:10, fontWeight:500, color:C.textSub, letterSpacing:'0.06em', marginTop:-2 }}>
                ENERGY TOOLING MANAGER · {subsystem} v4.0
              </div>
            </div>
          </div>

          {/* Context pills */}
          <div style={{ marginLeft:isTablet?0:'auto', display:'flex', gap:6, flexWrap:'wrap', width:isTablet?'100%':'auto' }}>
            {CONTEXTS.map(c=>(
              <button key={c.id} onClick={()=>setCtx(c.id)} style={{
                background:ctx===c.id?c.accent+'20':C.bg,
                border:`1px solid ${ctx===c.id?c.accent:C.border}`,
                color:ctx===c.id?c.accent:C.textSub,
                padding:'5px 13px', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:600,
                fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em', transition:'all 0.15s',
              }}>{c.icon} {c.label}</button>
            ))}
          </div>

          {/* Summary KPIs */}
          <div style={{ display:'flex', gap:1, marginLeft:isTablet?0:16, width:isTablet?'100%':'auto' }}>
            {[
              ['SELECTED', sel.size, C.teal],
              ['BUDGET', fmt(total)+' €', acc],
            ].map(([l,v,col])=>(
              <div key={l} style={{ background:C.bg, padding:'6px 16px', textAlign:'center', borderLeft:`1px solid ${C.border}`, flex:isTablet?1:'none' }}>
                <div style={{ fontSize:9, color:C.textSub, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.08em' }}>{l}</div>
                <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:14, fontWeight:600, color:col, marginTop:1 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Subsystem tabs */}
        <div style={{ display:'flex', padding:isMobile?'0 14px':'0 22px', overflowX:'auto' }}>
          {SUBSYSTEMS.map(s=>(
            <div key={s.id} style={{
              padding:'10px 18px', cursor:'pointer',
              borderBottom:`2px solid ${s.id===subsystem?acc:'transparent'}`,
              opacity:s.id===subsystem?1:0.55, transition:'all 0.15s',
            }}>
              <div onClick={()=>setSubsystem(s.id)} style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:13, fontWeight:700, letterSpacing:'0.07em', color:s.id===subsystem?acc:C.textSub }}>{s.label}</div>
              <div style={{ fontFamily:"'Barlow', sans-serif", fontSize:9, color:C.textMuted, marginTop:1 }}>{s.full}{RAW_BY_SUBSYSTEM[s.id]?.length===0&&' · soon'}</div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* ── BODY ── */}
      <div style={{ display:'flex', flexDirection:isTablet?'column':'row', height:embedded ? 'auto' : isTablet?'auto':'calc(100vh - 118px)', overflow:'hidden' }}>

        {/* ── MAIN PANEL ── */}
        <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column', background:embedded?'#F7F9FC':'transparent', borderRadius:embedded?22:0 }}>

          {/* Filter bar */}
          <div style={{ padding:embedded?'16px 18px':'10px 18px', borderBottom:embedded?'1px solid rgba(71,84,103,0.10)':`1px solid ${C.border}`, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', background:embedded?'#FFFFFF':C.bgMid, borderTopLeftRadius:embedded?22:0 }}>
            {/* Search */}
            <div style={{ position:'relative', flex:isMobile?'1 1 100%':'1 1 240px', minWidth:isMobile?'100%':210 }}>
              <Search size={13} color={C.textSub} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }}/>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search tool, brand..." style={{
                width:'100%', background:embedded?'#F2F4F7':C.bg, border:embedded?'1px solid rgba(71,84,103,0.14)':`1px solid ${C.border}`, borderRadius:10,
                padding:'9px 12px 9px 32px', color:embedded?'#191C1E':C.text, fontSize:12, outline:'none',
                fontFamily:"'Barlow', sans-serif",
              }}/>
            </div>

            {/* Level */}
            <div style={{ display:'flex', gap:5 }}>
              {[['ALL','All'],['T','Technician'],['E','Team'],['P','Project / Depot']].map(([v,l])=>pill(lvl===v, LEVELS[v]?.color||acc, l, ()=>setLvl(v)))}
            </div>

            {/* Statut */}
            <div style={{ display:'flex', gap:5 }}>
              {[['ALL','All statuses'],['OB','Mandatory'],['RC','Recommended'],['OP','Optional']].map(([v,l])=>
                pill(stat===v, STATUTS[v]?.color||acc, l, ()=>setStat(v))
              )}
            </div>

            {/* Category */}
            <select value={cat} onChange={e=>setCat(e.target.value)} style={{
              background:embedded?'#F2F4F7':C.bg, border:embedded?'1px solid rgba(71,84,103,0.14)':`1px solid ${C.border}`, color:embedded?'#191C1E':C.text, padding:'8px 10px',
              borderRadius:10, fontSize:11, outline:'none', cursor:'pointer', fontFamily:"'Barlow', sans-serif",
            }}>
              <option value="ALL">All categories</option>
              {Object.entries(CATS).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>

            <div style={{ marginLeft:isMobile?0:'auto', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', width:isMobile?'100%':'auto' }}>
              <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:C.textSub }}>{filtered.length} tools</span>
              <button onClick={()=>setSel(p=>{const n=new Set(p);filtered.forEach(t=>n.add(t.uid));return n;})}
                style={{ background:embedded?'#FFFFFF':C.bg, border:embedded?'1px solid rgba(71,84,103,0.14)':`1px solid ${C.border}`, color:embedded?'#475467':C.textSub, padding:'7px 12px', borderRadius:10, cursor:'pointer', fontSize:11, fontFamily:"'Barlow', sans-serif" }}>
                Select visible
              </button>
              <button onClick={()=>setSel(p=>{const n=new Set(p);filtered.forEach(t=>n.delete(t.uid));return n;})}
                style={{ background:embedded?'#FFFFFF':C.bg, border:embedded?'1px solid rgba(71,84,103,0.14)':`1px solid ${C.border}`, color:embedded?'#475467':C.textSub, padding:'7px 12px', borderRadius:10, cursor:'pointer', fontSize:11, fontFamily:"'Barlow', sans-serif" }}>
                Clear visible
              </button>
            </div>
          </div>

          {/* Tool cards */}
          <div style={{ flex:1, overflowY:'auto', padding:isMobile?'12px 12px 16px':embedded?'20px':'14px 18px' }}>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':embedded?'repeat(auto-fill, minmax(290px, 1fr))':'repeat(auto-fill, minmax(325px, 1fr))', gap:embedded?18:12 }}>
              {filtered.map((t,i)=>{
                const isSel=sel.has(t.uid), c=CATS[t.cat], s=STATUTS[t.statut], levelMeta=getLevelMeta(t.level);
                if (embedded) {
                  return (
                    <div
                      key={t.uid}
                      onClick={()=>setModal(t)}
                      style={{
                        background:'#FFFFFF',
                        border:`1px solid ${isSel?c.color:'rgba(71,84,103,0.12)'}`,
                        borderRadius:24,
                        overflow:'hidden',
                        cursor:'pointer',
                        transition:'transform 250ms cubic-bezier(0.4,0,0.2,1), box-shadow 250ms cubic-bezier(0.4,0,0.2,1), border-color 250ms cubic-bezier(0.4,0,0.2,1)',
                        animation:`fadeIn 0.18s ease ${i*0.012}s both`,
                        boxShadow:isSel?`0 22px 42px ${c.color}22`:'0 18px 36px rgba(17,24,39,0.06)',
                        display:'flex',
                        flexDirection:'column',
                        minHeight:374,
                      }}
                      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=isSel?`0 26px 48px ${c.color}24`:'0 22px 44px rgba(17,24,39,0.09)';}}
                      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=isSel?`0 22px 42px ${c.color}22`:'0 18px 36px rgba(17,24,39,0.06)';}}
                    >
                      <div style={{ position:'relative', background:`linear-gradient(180deg, ${c.color}14 0%, rgba(255,255,255,0.96) 100%)`, minHeight:194, display:'flex', alignItems:'center', justifyContent:'center', padding:'22px 18px 14px' }}>
                        <div style={{ position:'absolute', inset:'14px 14px auto auto', display:'flex', gap:6, flexWrap:'wrap', justifyContent:'flex-end' }}>
                          <span style={{ background:`${s.color}14`, color:s.color, borderRadius:999, padding:'5px 10px', fontSize:10, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em' }}>{s.label}</span>
                          <span style={{ background:levelMeta.bgLight, color:levelMeta.color, borderRadius:999, padding:'5px 10px', fontSize:10, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em' }}>{levelMeta.short}</span>
                        </div>
                        <ToolVisual tool={t} size={116} radius={18}/>
                      </div>

                      <div style={{ padding:'16px 18px 18px', display:'flex', flexDirection:'column', gap:12, flex:1 }}>
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
                          <div style={{ display:'grid', gap:8, minWidth:0 }}>
                            <span style={{ alignSelf:'flex-start', background:`${c.color}14`, color:c.color, borderRadius:999, padding:'5px 10px', fontSize:10, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em' }}>
                              {c.icon} {c.label}
                            </span>
                            <div style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:17, fontWeight:700, lineHeight:1.25, color:'#191C1E' }}>{t.name}</div>
                            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                              <span style={{ fontSize:12, color:'#1C6090', fontWeight:700 }}>{t.brand}</span>
                              <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:10, color:'#475467', background:'#EFF2F5', padding:'4px 8px', borderRadius:8 }}>{t.model}</span>
                            </div>
                          </div>
                          <div onClick={e=>{e.stopPropagation();toggle(t.uid);}} style={{
                            width:28, height:28, borderRadius:10,
                            border:`1.5px solid ${isSel?c.color:'rgba(71,84,103,0.18)'}`,
                            background:isSel?c.color:'#FFFFFF',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            flexShrink:0, cursor:'pointer',
                            boxShadow:isSel?`0 10px 20px ${c.color}22`:'none',
                          }}>
                            {isSel&&<Check size={14} color="#fff" strokeWidth={3}/>}
                          </div>
                        </div>

                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                          <div style={{ background:'#F2F4F7', borderRadius:14, padding:'10px 12px' }}>
                            <div style={{ fontSize:10, color:'#667085', marginBottom:5, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em' }}>USE AREA</div>
                            <div style={{ fontSize:11.5, color:'#191C1E', lineHeight:1.45 }}>{t.domain}</div>
                          </div>
                          <div style={{ background:'#F2F4F7', borderRadius:14, padding:'10px 12px' }}>
                            <div style={{ fontSize:10, color:'#667085', marginBottom:5, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em' }}>MAINTENANCE</div>
                            <div style={{ fontSize:11.5, color:'#191C1E', lineHeight:1.45 }}>{t.period}</div>
                          </div>
                        </div>

                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', paddingTop:12, marginTop:'auto', borderTop:'1px solid rgba(71,84,103,0.10)' }}>
                          <div>
                            <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:18, fontWeight:700, color:isSel?c.color:'#191C1E' }}>
                              {fmt(t.currentPrice)} €
                            </div>
                            <div style={{ fontSize:11, color:'#667085', marginTop:4 }}>
                              {getUnitLabel(t)}
                            </div>
                            <div style={{ fontSize:10, color:t.hasPriceOverride?c.color:'#98A2B3', marginTop:5 }}>
                              {getPriceReferenceLabel(t)}
                            </div>
                          </div>
                          <div style={{ textAlign:'right' }}>
                            <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:12, color:isSel?c.color:'#475467', fontWeight:600 }}>
                              {fmt(t.qty*t.currentPrice)} €
                            </div>
                            <div style={{ fontSize:10, color:'#98A2B3', marginTop:3 }}>estimated block</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={t.uid} style={{
                    background:isSel?`${c.color}0D`:C.card,
                    border:`1px solid ${isSel?c.color+'50':C.border}`,
                    borderRadius:14, overflow:'hidden', cursor:'pointer',
                    transition:'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease',
                    animation:`fadeIn 0.18s ease ${i*0.012}s both${isSel?', softFloat 3.2s ease-in-out infinite':''}`,
                    display:'flex',
                    minHeight:176,
                    boxShadow:isSel?`0 10px 24px ${c.color}12`:'0 8px 18px rgba(0,0,0,0.10)',
                    transform:'translateY(0)',
                  }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=isSel?c.color+'80':C.borderL; e.currentTarget.style.background=isSel?`${c.color}12`:C.cardHov; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=isSel?`0 16px 28px ${c.color}16`:'0 14px 26px rgba(0,0,0,0.18)';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=isSel?c.color+'50':C.border; e.currentTarget.style.background=isSel?`${c.color}0D`:C.card; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=isSel?`0 10px 24px ${c.color}12`:'0 8px 18px rgba(0,0,0,0.10)';}}
                  >
                    {/* SVG thumb */}
                    <div onClick={()=>setModal(t)} style={{ width:96, flexShrink:0, background:isSel?`${c.color}08`:C.bgMid, display:'flex', alignItems:'center', justifyContent:'center', borderRight:`1px solid ${C.border}`, padding:'12px 10px' }}>
                      <ToolVisual tool={t} size={66} radius={12}/>
                    </div>

                    {/* Content */}
                    <div onClick={()=>setModal(t)} style={{ flex:1, padding:'13px 14px', display:'flex', flexDirection:'column', gap:9 }}>
                      {/* Badges row */}
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:6 }}>
                        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                          <span style={{ background:`${c.color}18`, color:c.color, border:`1px solid ${c.color}30`, borderRadius:999, padding:'3px 8px', fontSize:9, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em' }}>
                            {c.icon} {t.cat}
                          </span>
                          <span style={{ background:`${s.color}15`, color:s.color, border:`1px solid ${s.color}30`, borderRadius:999, padding:'3px 8px', fontSize:9, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif" }}>
                            {s.label}
                          </span>
                          <span style={{ fontSize:9, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em',
                            color:levelMeta.colorDark, background:levelMeta.bgDark,
                            padding:'3px 8px', borderRadius:999 }}>
                            {levelMeta.short}
                          </span>
                        </div>
                        {/* Checkbox */}
                        <div onClick={e=>{e.stopPropagation();toggle(t.uid);}} style={{
                          width:23, height:23, borderRadius:7,
                          border:`1.5px solid ${isSel?c.color:C.borderL}`,
                          background:isSel?c.color:'transparent',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          flexShrink:0, cursor:'pointer', transition:'all 0.15s',
                        }}>
                          {isSel&&<Check size={12} color="#fff" strokeWidth={3}/>}
                        </div>
                      </div>

                      {/* Name */}
                      <div style={{ fontSize:13.5, fontWeight:600, lineHeight:1.35, color:C.text }}>{t.name}</div>

                      {/* Brand + model */}
                      <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
                        <span style={{ fontSize:11.5, color:c.color, fontWeight:700 }}>{t.brand}</span>
                        <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:9.5, color:C.textSub, background:C.bg, padding:'3px 7px', borderRadius:5, border:`1px solid ${C.border}` }}>{t.model}</span>
                      </div>

                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
                        <div style={{ background:C.bgMid, border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 10px' }}>
                          <div style={{ fontSize:9, color:C.textSub, marginBottom:4, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em' }}>USE AREA</div>
                          <div style={{ fontSize:11, color:C.text, lineHeight:1.35 }}>{t.domain}</div>
                        </div>
                        <div style={{ background:C.bgMid, border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 10px' }}>
                          <div style={{ fontSize:9, color:C.textSub, marginBottom:4, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em' }}>MAINTENANCE</div>
                          <div style={{ fontSize:11, color:C.text, lineHeight:1.35 }}>{t.period}</div>
                        </div>
                      </div>

                      {/* Price row */}
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', paddingTop:8, borderTop:`1px solid ${C.border}`, marginTop:'auto' }}>
                        <div>
                          <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:15, fontWeight:700, color:isSel?c.color:C.text }}>
                            {fmt(t.currentPrice)} €
                          </div>
                          <div style={{ fontSize:10, color:C.textSub, marginTop:3 }}>
                            {getUnitLabel(t)}
                          </div>
                          <div style={{ fontSize:9, color:t.hasPriceOverride?c.color:C.textMuted, marginTop:4 }}>
                            {getPriceReferenceLabel(t)}
                          </div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:isSel?c.color:C.textSub, fontWeight:600 }}>
                            {fmt(t.qty*t.currentPrice)} €
                          </div>
                          <div style={{ fontSize:9, color:C.textMuted, marginTop:2 }}>estimated block</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {activeTools.length===0&&(
              <div style={{ marginTop:18, background:embedded?'#FFFFFF':C.card, border:embedded?'1px solid rgba(71,84,103,0.12)':`1px solid ${C.border}`, borderRadius:18, padding:'26px 22px', textAlign:'center', color:embedded?'#667085':C.textSub }}>
                <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:14, fontWeight:700, letterSpacing:'0.08em', color:embedded?'#1C6090':acc, marginBottom:8 }}>{subsystem} CATALOG NOT DEFINED YET</div>
                <div style={{ fontSize:13, lineHeight:1.6 }}>
                  No tools are currently visible for {subsystemMeta?.full || subsystem} in the {context.label} context. Add them later in `RAW_BY_SUBSYSTEM.{subsystem}` or refine their context visibility and they will appear automatically in the merged display.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SYNTHESIS PANEL ── */}
        {embedded ? (
        <div style={{
          width:isTablet?'100%':328,
          background:'#F2F4F7',
          borderLeft:isTablet?'none':'1px solid rgba(71,84,103,0.10)',
          borderTop:isTablet?'1px solid rgba(71,84,103,0.10)':'none',
          overflowY:'auto',
          display:'flex',
          flexDirection:'column',
          maxHeight:isTablet?520:'none',
          padding:'20px',
          gap:16,
        }}>
          <div style={{ background:'#FFFFFF', borderRadius:22, padding:'20px', boxShadow:'0 18px 36px rgba(17,24,39,0.06)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, marginBottom:14 }}>
              <div>
                <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:12, fontWeight:700, letterSpacing:'0.10em', color:'#1C6090' }}>SUMMARY</div>
                <div style={{ fontSize:12, color:'#667085', marginTop:4 }}>Allocation snapshot for {context.label}</div>
              </div>
              <div style={{ background:'#DCEAF5', color:'#1C6090', borderRadius:999, padding:'6px 10px', fontSize:10, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em' }}>
                {coveragePct}% covered
              </div>
            </div>
            <div style={{ background:`linear-gradient(135deg, ${acc} 0%, ${acc}CC 100%)`, color:'#FFFFFF', borderRadius:20, padding:'18px 18px 16px', marginBottom:14 }}>
              <div style={{ fontSize:10, opacity:0.82, marginBottom:7, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.08em' }}>TOTAL SELECTED BUDGET</div>
              <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:30, fontWeight:700 }}>{fmt(total)} €</div>
              <div style={{ fontSize:12, opacity:0.88, marginTop:6 }}>{sel.size} selected tools</div>
              <div style={{ marginTop:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:10, opacity:0.82 }}>Mandatory coverage</span>
                  <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:10 }}>{mandatorySelected}/{mandatoryTotal}</span>
                </div>
                <div style={{ height:6, background:'rgba(255,255,255,0.20)', borderRadius:999, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${coveragePct}%`, background:'#FFFFFF', borderRadius:999 }} />
                </div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'repeat(3, 1fr)', gap:10 }}>
              {[['T','Technician','#1C6090',tTotal],['E','Team','#1F8A84',eTotal],['P','Project / Depot','#7C3AED',pTotal]].map(([lv,label,color,budget])=>(
                <div key={lv} style={{ background:'#F2F4F7', borderRadius:16, padding:'12px 13px' }}>
                  <div style={{ fontSize:10, color, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em' }}>{label.toUpperCase()}</div>
                  <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:15, fontWeight:700, color:'#191C1E', marginTop:4 }}>{fmt(budget)} €</div>
                  <div style={{ fontSize:10, color:'#667085', marginTop:3 }}>{selT.filter(t=>t.level===lv).length} tools</div>
                </div>
              ))}
            </div>
          </div>

          {byCat.length>0&&(
            <div style={{ background:'#FFFFFF', borderRadius:22, padding:'18px 18px 14px', boxShadow:'0 18px 36px rgba(17,24,39,0.05)' }}>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:12, fontWeight:700, letterSpacing:'0.08em', color:'#1C6090', marginBottom:12 }}>BREAKDOWN BY CATEGORY</div>
              {byCat.map(c=>{
                const pct=total>0?(c.total/total)*100:0;
                return (
                  <div key={c.key} style={{ marginBottom:11 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:11, color:'#191C1E', fontWeight:600 }}>{c.icon} {c.label}</span>
                      <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:c.color }}>{fmt(c.total)} €</span>
                    </div>
                    <div style={{ height:6, background:'#EFF2F5', borderRadius:999, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg, ${c.color}99, ${c.color})`, borderRadius:999 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ background:'#FFFFFF', borderRadius:22, padding:'18px', boxShadow:'0 18px 36px rgba(17,24,39,0.05)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <Users size={14} color="#1C6090"/>
              <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:12, fontWeight:700, letterSpacing:'0.08em', color:'#1C6090' }}>WORKFORCE — {subsystem}</span>
            </div>
            <div style={{ display:'grid', gap:12 }}>
              {[
                ['No. of technicians', nbTech, setNbTech, '#1C6090'],
                ['No. of teams', nbEquipe, setNbEquipe, '#1F8A84'],
                ['No. of projects / depots', nbProject, setNbProject, '#7C3AED'],
              ].map(([label, val, setter, col])=>(
                <div key={label}>
                  <div style={{ fontSize:10, color:'#667085', marginBottom:6, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.05em' }}>{label.toUpperCase()}</div>
                  <div style={{ display:'flex', alignItems:'center', background:'#F2F4F7', borderRadius:14, overflow:'hidden' }}>
                    <button onClick={()=>setter(val-1)} style={{ width:38, height:38, background:'transparent', border:'none', cursor:'pointer', color:'#667085', fontSize:18, fontWeight:700 }}>-</button>
                    <div style={{ flex:1, textAlign:'center', fontFamily:"'JetBrains Mono', monospace", fontSize:16, fontWeight:700, color:col }}>{val}</div>
                    <button onClick={()=>setter(val+1)} style={{ width:38, height:38, background:'transparent', border:'none', cursor:'pointer', color:'#667085', fontSize:18, fontWeight:700 }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:'#FFFFFF', borderRadius:22, padding:'18px', boxShadow:'0 18px 36px rgba(17,24,39,0.05)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <Layers size={14} color="#1C6090"/>
              <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:12, fontWeight:700, letterSpacing:'0.08em', color:'#1C6090' }}>BUDGET BREAKDOWN</span>
            </div>
            <div style={{ display:'grid', gap:10 }}>
              {[
                [`${nbTech} tech · ${nbEquipe} team${nbEquipe>1?'s':''} · ${nbProject} project/depot`, nbTech*tTotal + nbEquipe*eTotal + nbProject*pTotal, '#191C1E', true],
                [`Technicians (×${nbTech})`, nbTech*tTotal, '#1C6090', false],
                [`Teams (×${nbEquipe})`, nbEquipe*eTotal, '#1F8A84', false],
                [`Projects / Depots (×${nbProject})`, nbProject*pTotal, '#7C3AED', false],
              ].map(([label, val, col, bold])=>(
                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid rgba(71,84,103,0.10)' }}>
                  <span style={{ fontSize:bold?12:11, color:bold?'#191C1E':'#667085', fontWeight:bold?700:500 }}>{label}</span>
                  <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:bold?14:12, fontWeight:700, color:col }}>{fmt(val)} €</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop:'auto', background:'#FFFFFF', borderRadius:22, padding:'18px', boxShadow:'0 18px 36px rgba(17,24,39,0.05)' }}>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:12, fontWeight:700, letterSpacing:'0.08em', color:'#1C6090', marginBottom:12 }}>{subsystem} DATABASE — {activeTools.length} TOOLS</div>
            {[
              ['Technician', activeTools.filter(t=>t.level==='T').length, '#1C6090'],
              ['Team', activeTools.filter(t=>t.level==='E').length, '#1F8A84'],
              ['Project / Depot', activeTools.filter(t=>t.level==='P').length, '#7C3AED'],
              ['Mandatory', activeTools.filter(t=>t.statut==='OB').length, '#9F4200'],
            ].map(([l,v,col])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0' }}>
                <span style={{ fontSize:11, color:'#667085' }}>{l}</span>
                <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:12, fontWeight:700, color:col }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        ) : (
        <div style={{
          width:isTablet?'100%':292,
          background:`linear-gradient(180deg, rgba(13,32,32,0.98) 0%, rgba(10,26,26,0.98) 100%)`,
          borderLeft:isTablet?'none':`1px solid ${C.border}`,
          borderTop:isTablet?`1px solid ${C.border}`:'none',
          overflowY:'auto',
          display:'flex',
          flexDirection:'column',
          maxHeight:isTablet?380:'none',
          boxShadow:isTablet?'none':'inset 1px 0 0 rgba(255,255,255,0.02)',
        }}>

          {/* Panel header */}
          <div style={{ padding:'14px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:7 }}>
            <BarChart2 size={14} color={acc}/>
            <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:13, fontWeight:700, letterSpacing:'0.08em', color:acc }}>SUMMARY</span>
          </div>

          <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:12, flex:1 }}>

            {/* Total budget */}
            <div style={{
              background:total>0
                ? `linear-gradient(180deg, ${acc}16 0%, rgba(10,26,26,0.92) 100%)`
                : C.bg,
              borderRadius:14,
              padding:'15px 16px',
              border:`1px solid ${total>0?acc+'55':C.border}`,
              boxShadow: total>0 ? `0 14px 30px ${acc}12` : 'none',
              animation: total>0 ? 'budgetPulse 3.6s ease-in-out infinite' : 'none',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:9, color:total>0?acc:C.textSub, marginBottom:6, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.10em' }}>TOTAL SELECTED BUDGET</div>
                  <div style={{ fontSize:11, color:C.textSub }}>Ready-to-demo snapshot for {context.label}</div>
                </div>
                <div style={{ background:C.bg, border:`1px solid ${acc}35`, color:acc, borderRadius:999, padding:'4px 10px', fontSize:10, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.05em' }}>
                  {coveragePct}% mandatory covered
                </div>
              </div>
              <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:30, fontWeight:700, color:total>0?acc:C.textMuted }}>
                {fmt(total)} €
              </div>
              <div style={{ fontSize:11, color:C.textSub, marginTop:4 }}>
                {sel.size} tool{sel.size!==1?'s':''} selected{sel.size!==1?'s':''}
              </div>
              <div style={{ marginTop:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:9, color:C.textSub, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em' }}>MANDATORY COVERAGE</span>
                  <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:10, color:acc }}>{mandatorySelected}/{mandatoryTotal}</span>
                </div>
                <div style={{ height:6, background:C.border, borderRadius:999, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${coveragePct}%`, background:`linear-gradient(90deg, ${acc}66, ${acc})`, borderRadius:999, transition:'width 0.35s ease' }} />
                </div>
              </div>
            </div>

            {/* By level */}
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr 1fr':'repeat(3, 1fr)', gap:8 }}>
              {[['T','Technician',C.teal,tTotal],['E','Team',C.blue,eTotal],['P','Project / Depot',C.violet,pTotal]].map(([lv,label,color,budget])=>(
                <div key={lv} style={{ background:`linear-gradient(180deg, ${color}10 0%, ${C.bg} 100%)`, borderRadius:10, padding:'10px 11px', border:`1px solid ${color}25` }}>
                  <div style={{ fontSize:9, color, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em' }}>{label.toUpperCase()}</div>
                  <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:14, fontWeight:700, color, marginTop:4 }}>{fmt(budget)} €</div>
                  <div style={{ fontSize:9, color:C.textSub, marginTop:2 }}>{selT.filter(t=>t.level===lv).length} tools</div>
                </div>
              ))}
            </div>

            {/* By category bars */}
            {byCat.length>0&&(
              <div>
                <div style={{ fontSize:9, color:C.textSub, marginBottom:9, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.08em' }}>BREAKDOWN BY CATEGORY</div>
                {byCat.map(c=>{
                  const pct=total>0?(c.total/total)*100:0;
                  return (
                    <div key={c.key} style={{ marginBottom:9 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:10, color:c.color, fontWeight:600 }}>{c.icon} {c.label}</span>
                        <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:10, color:C.text }}>{fmt(c.total)} €</span>
                      </div>
                      <div style={{ height:4, background:C.border, borderRadius:2 }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg, ${c.color}80, ${c.color})`, borderRadius:2, transition:'width 0.35s ease' }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Workforce config */}
            <div style={{ background:C.bg, borderRadius:10, border:`1px solid ${C.border}`, overflow:'hidden' }}>
              <div style={{ padding:'10px 14px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:6 }}>
                <Users size={12} color={acc}/>
                <span style={{ fontSize:10, fontWeight:700, color:acc, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>WORKFORCE — {subsystem}</span>
              </div>
              <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  ['No. of technicians', nbTech, setNbTech, C.teal],
                  ['No. of teams', nbEquipe, setNbEquipe, C.blue],
                  ['No. of projects / depots', nbProject, setNbProject, C.violet],
                ].map(([label, val, setter, col])=>(
                  <div key={label}>
                    <div style={{ fontSize:10, color:C.textSub, marginBottom:5, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.05em' }}>{label.toUpperCase()}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:0, background:C.bgMid, borderRadius:7, border:`1px solid ${C.borderL}`, overflow:'hidden' }}>
                      <button onClick={()=>setter(val-1)} style={{ width:32, height:32, background:'transparent', border:'none', cursor:'pointer', color:C.textSub, fontSize:16, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.1s', flexShrink:0 }}
                        onMouseEnter={e=>e.currentTarget.style.color=col} onMouseLeave={e=>e.currentTarget.style.color=C.textSub}>−</button>
                      <div style={{ flex:1, textAlign:'center', fontFamily:"'JetBrains Mono', monospace", fontSize:16, fontWeight:700, color:col }}>{val}</div>
                      <button onClick={()=>setter(val+1)} style={{ width:32, height:32, background:'transparent', border:'none', cursor:'pointer', color:C.textSub, fontSize:16, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.1s', flexShrink:0 }}
                        onMouseEnter={e=>e.currentTarget.style.color=col} onMouseLeave={e=>e.currentTarget.style.color=C.textSub}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic budget scenarios */}
            {sel.size>0&&(
              <div style={{ background:C.bg, borderRadius:10, border:`1px solid ${acc}30`, overflow:'hidden' }}>
                <div style={{ padding:'10px 14px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:6 }}>
                  <Layers size={12} color={acc}/>
                  <span style={{ fontSize:10, fontWeight:700, color:acc, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>BUDGET BREAKDOWN</span>
                </div>
                <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:0 }}>
                  {[
                    [`${nbTech} tech · ${nbEquipe} team${nbEquipe>1?'s':''} · ${nbProject} project/depot`, nbTech*tTotal + nbEquipe*eTotal + nbProject*pTotal, acc, true],
                    [`Technicians (×${nbTech})`, nbTech*tTotal, C.teal, false],
                    [`Teams (×${nbEquipe})`, nbEquipe*eTotal, C.blue, false],
                    [`Projects / Depots (×${nbProject})`, nbProject*pTotal, C.violet, false],
                  ].map(([label, val, col, bold], idx)=>(
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom: idx<2?`1px solid ${C.border}`:'none', opacity: idx>0&&val===0?0.4:1 }}>
                      <span style={{ fontSize: bold?12:10, color: bold?C.text:C.textSub, fontWeight: bold?600:400 }}>{label}</span>
                      <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: bold?14:11, fontWeight: bold?700:500, color:col }}>{fmt(val)} €</span>
                    </div>
                  ))}
                </div>
                {/* Budget per tech / per equipe */}
                <div style={{ padding:'10px 14px', borderTop:`1px solid ${C.border}`, background:C.bgMid, display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3, 1fr)', gap:8 }}>
                  {[['/ technician', tTotal, C.teal], ['/ team', eTotal, C.blue], ['/ project / depot', pTotal, C.violet]].map(([l,v,col])=>(
                    <div key={l} style={{ textAlign:'center' }}>
                      <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:13, fontWeight:700, color:col }}>{fmt(v)} €</div>
                      <div style={{ fontSize:9, color:C.textSub, marginTop:2, fontFamily:"'Barlow Condensed', sans-serif" }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sel.size===0&&(
              <div style={{ textAlign:'center', padding:'28px 0', color:C.textMuted, fontSize:12 }}>
                <div style={{ fontSize:28, marginBottom:8, opacity:0.5 }}>☑</div>
                Select tools<br/>to calculate budget
              </div>
            )}

            {/* Database stats */}
            <div style={{ marginTop:'auto', paddingTop:12, borderTop:`1px solid ${C.border}` }}>
              <div style={{ fontSize:9, color:C.textSub, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.08em', marginBottom:8 }}>{subsystem} DATABASE — {activeTools.length} TOOLS</div>
              {[
                ['Technician', activeTools.filter(t=>t.level==='T').length, C.teal],
                ['Team', activeTools.filter(t=>t.level==='E').length, C.blue],
                ['Project / Depot', activeTools.filter(t=>t.level==='P').length, C.violet],
                ['Mandatory', activeTools.filter(t=>t.statut==='OB').length, C.orange],
              ].map(([l,v,col])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'3px 0' }}>
                  <span style={{ fontSize:10, color:C.textSub }}>{l}</span>
                  <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, fontWeight:600, color:col }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {modalTool&&(()=>{
        const modal = modalTool;
        const c=CATS[modal.cat], s=STATUTS[modal.statut], isSel=sel.has(modal.uid);
        const levelMeta = getLevelMeta(modal.level);
        const unitLabel = getUnitLabel(modal);
        if (embedded) {
          return (
            <div
              style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.28)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:isMobile?10:28, backdropFilter:'blur(18px)' }}
              onClick={()=>setModal(null)}
            >
              <div
                style={{ background:'#F7F9FC', borderRadius:28, width:'100%', maxWidth:980, maxHeight:'92vh', overflow:'auto', boxShadow:'0 32px 90px rgba(15,23,42,0.18)', border:'1px solid rgba(71,84,103,0.12)' }}
                onClick={e=>e.stopPropagation()}
              >
                <div style={{ padding:isMobile?'18px 18px 14px':'24px 28px 18px', background:'#FFFFFF', borderBottom:'1px solid rgba(71,84,103,0.10)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16 }}>
                    <div style={{ minWidth:0 }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:12 }}>
                        <span style={{ background:`${c.color}15`, color:c.color, borderRadius:999, padding:'6px 12px', fontSize:11, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.05em' }}>{c.icon} {c.label}</span>
                        <span style={{ background:`${s.color}14`, color:s.color, borderRadius:999, padding:'6px 12px', fontSize:11, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.05em' }}>{s.label}</span>
                        <span style={{ background:levelMeta.bgLight, color:levelMeta.color, borderRadius:999, padding:'6px 12px', fontSize:11, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.05em' }}>
                          {levelMeta.label}
                        </span>
                      </div>
                      <div style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:isMobile?25:31, fontWeight:700, lineHeight:1.08, color:'#191C1E', marginBottom:10 }}>
                        {modal.name}
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                        <span style={{ fontSize:14, fontWeight:700, color:'#1C6090' }}>{modal.brand}</span>
                        <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:'#475467', background:'#EFF2F5', padding:'6px 10px', borderRadius:8 }}>
                          {modal.model}
                        </span>
                      </div>
                    </div>
                    <button onClick={()=>setModal(null)} style={{ background:'#EFF2F5', border:'none', cursor:'pointer', color:'#667085', width:36, height:36, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <X size={18}/>
                    </button>
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'280px minmax(0, 1fr)', gap:0 }}>
                  <div style={{ background:'#F2F4F7', padding:isMobile?'18px':'22px', display:'grid', gap:14 }}>
                    <div style={{ background:'#FFFFFF', borderRadius:22, minHeight:228, display:'flex', alignItems:'center', justifyContent:'center', padding:18, boxShadow:'0 18px 36px rgba(17,24,39,0.06)' }}>
                      <ToolVisual tool={modal} size={168} radius={20}/>
                    </div>

                    <div style={{ background:`linear-gradient(135deg, ${c.color} 0%, ${c.color}CC 100%)`, color:'#FFFFFF', borderRadius:22, padding:'18px 18px 16px', boxShadow:'0 18px 36px rgba(17,24,39,0.08)' }}>
                      <div style={{ fontSize:10, opacity:0.82, marginBottom:8, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.08em' }}>COST SNAPSHOT</div>
                      <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:28, fontWeight:700, lineHeight:1 }}>{fmt(modal.currentPrice)} €</div>
                      <div style={{ fontSize:12, opacity:0.86, marginTop:8 }}>{unitLabel}</div>
                      <div style={{ fontSize:11, opacity:0.86, marginTop:6 }}>{getPriceReferenceLabel(modal)}</div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:14, paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.22)' }}>
                        <span style={{ fontSize:11, opacity:0.82 }}>Selection block</span>
                        <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:15, fontWeight:700 }}>{fmt(modal.qty*modal.currentPrice)} €</span>
                      </div>
                    </div>

                    <div style={{ display:'grid', gap:8 }}>
                      <MetaTile label="Voltage domain" value={modal.domain} accent={c.color} surface="#FFFFFF" borderColor="rgba(71,84,103,0.12)" bodyColor="#191C1E" labelColor="#667085"/>
                      <MetaTile label="Maintenance" value={modal.period} accent="#1C6090" surface="#FFFFFF" borderColor="rgba(71,84,103,0.12)" bodyColor="#191C1E" labelColor="#667085"/>
                      <MetaTile label="Quantity baseline" value={unitLabel} accent={levelMeta.color} surface="#FFFFFF" borderColor="rgba(71,84,103,0.12)" bodyColor="#191C1E" labelColor="#667085"/>
                    </div>

                    <button
                      onClick={()=>toggle(modal.uid)}
                      style={{
                        background:isSel?`linear-gradient(135deg, ${c.color} 0%, ${c.color}CC 100%)`:'#FFFFFF',
                        border:`1px solid ${isSel?c.color:'rgba(71,84,103,0.14)'}`,
                        borderRadius:14,
                        padding:'13px 16px',
                        width:'100%',
                        cursor:'pointer',
                        fontWeight:700,
                        fontSize:13,
                        fontFamily:"'Barlow Condensed', sans-serif",
                        letterSpacing:'0.05em',
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        gap:7,
                        color:isSel?'#FFFFFF':'#475467',
                        boxShadow:isSel?'0 16px 30px rgba(17,24,39,0.10)':'none',
                      }}
                    >
                      {isSel?<><Check size={14}/> SELECTED</>:'+ ADD TO SELECTION'}
                    </button>
                  </div>

                  <div style={{ padding:isMobile?'18px':'24px 26px 26px', display:'grid', gap:16, background:'#F7F9FC' }}>
                    <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:10 }}>
                      <MetaTile label="Standard / insulation" value={modal.norm} accent="#1C6090" surface="#FFFFFF" borderColor="rgba(71,84,103,0.12)" bodyColor="#191C1E" labelColor="#667085"/>
                      <MetaTile label="Selection status" value={s.label} accent={s.color} surface="#FFFFFF" borderColor="rgba(71,84,103,0.12)" bodyColor="#191C1E" labelColor="#667085"/>
                    </div>

                    <div style={{ background:'#FFFFFF', borderRadius:22, padding:'18px 18px 16px', boxShadow:'0 18px 36px rgba(17,24,39,0.05)' }}>
                      <div style={{ fontSize:11, color:'#1C6090', marginBottom:12, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.08em', display:'flex', alignItems:'center', gap:6 }}>
                        <Info size={12}/> TECHNICAL NOTES
                      </div>
                      <div style={{ display:'grid', gap:12 }}>
                        <div style={{ background:'#F2F4F7', borderRadius:16, padding:'14px 14px 12px' }}>
                          <div style={{ fontSize:10, color:'#667085', marginBottom:6, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>PRIMARY USE</div>
                          <div style={{ fontSize:13, color:'#191C1E', lineHeight:1.7 }}>
                            <PrimaryUse tool={modal}/>
                          </div>
                        </div>
                        <div style={{ background:'#F2F4F7', borderRadius:16, padding:'14px 14px 12px' }}>
                          <div style={{ fontSize:10, color:'#667085', marginBottom:8, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>ESSENTIAL SPECIFICATIONS</div>
                          <div style={{ display:'grid', gap:8 }}>
                            {[
                              ['Voltage domain', modal.domain],
                              ['Standard / insulation', modal.norm],
                              ['Verification / calibration', modal.period],
                              ['Quantity baseline', unitLabel],
                            ].map(([label, value])=>(
                              <div key={label} style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'160px 1fr', gap:8, alignItems:'start', padding:'0 0 8px', borderBottom:'1px solid rgba(71,84,103,0.10)' }}>
                                <div style={{ fontSize:11, color:'#667085' }}>{label}</div>
                                <div style={{ fontSize:12, color:'#191C1E', lineHeight:1.5 }}>{value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ background:'#FFFFFF', borderRadius:22, padding:'18px 18px 16px', boxShadow:'0 18px 36px rgba(17,24,39,0.05)' }}>
                      <div style={{ fontSize:11, color:'#1C6090', marginBottom:12, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.08em', display:'flex', alignItems:'center', gap:6 }}>
                        <BarChart2 size={12}/> PRICE REFERENCE
                      </div>
                      <div style={{ display:'grid', gap:12 }}>
                        <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr 112px', gap:10 }}>
                          <div>
                            <div style={{ fontSize:10, color:'#667085', marginBottom:6, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>UNIT PRICE (€)</div>
                            <input
                              value={priceDraft.price}
                              onChange={e=>setPriceDraft(p=>({ ...p, price:e.target.value }))}
                              placeholder={String(modal.price)}
                              style={{ width:'100%', background:'#F2F4F7', border:'1px solid rgba(71,84,103,0.14)', borderRadius:12, padding:'10px 12px', color:'#191C1E', fontSize:13, outline:'none', fontFamily:"'JetBrains Mono', monospace" }}
                            />
                          </div>
                          <div>
                            <div style={{ fontSize:10, color:'#667085', marginBottom:6, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>SOURCE</div>
                            <input
                              value={priceDraft.source}
                              onChange={e=>setPriceDraft(p=>({ ...p, source:e.target.value }))}
                              placeholder="Supplier, quotation, framework..."
                              style={{ width:'100%', background:'#F2F4F7', border:'1px solid rgba(71,84,103,0.14)', borderRadius:12, padding:'10px 12px', color:'#191C1E', fontSize:13, outline:'none', fontFamily:"'Barlow', sans-serif" }}
                            />
                          </div>
                          <div>
                            <div style={{ fontSize:10, color:'#667085', marginBottom:6, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>YEAR</div>
                            <input
                              value={priceDraft.year}
                              onChange={e=>setPriceDraft(p=>({ ...p, year:e.target.value.replace(/[^0-9]/g, '').slice(0, 4) }))}
                              placeholder={currentYear}
                              style={{ width:'100%', background:'#F2F4F7', border:'1px solid rgba(71,84,103,0.14)', borderRadius:12, padding:'10px 12px', color:'#191C1E', fontSize:13, outline:'none', fontFamily:"'JetBrains Mono', monospace" }}
                            />
                          </div>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:isMobile?'flex-start':'center', gap:10, flexDirection:isMobile?'column':'row' }}>
                          <div style={{ fontSize:12, color:'#667085', lineHeight:1.55 }}>
                            Active reference: <strong style={{ color:'#191C1E' }}>{getPriceReferenceLabel(modal)}</strong>
                          </div>
                          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                            <button
                              onClick={resetPriceOverride}
                              style={{ background:'#FFFFFF', border:'1px solid rgba(71,84,103,0.14)', borderRadius:12, padding:'10px 12px', cursor:'pointer', fontSize:12, color:'#475467', fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.05em' }}
                            >
                              RESET PRICE
                            </button>
                            <button
                              onClick={savePriceOverride}
                              disabled={!canSavePriceOverride}
                              style={{ background:canSavePriceOverride?'#1C6090':'#D0D5DD', border:'none', borderRadius:12, padding:'10px 14px', cursor:canSavePriceOverride?'pointer':'not-allowed', fontSize:12, color:'#FFFFFF', fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.05em' }}
                            >
                              SAVE PRICE
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ background:'#FFFFFF', borderRadius:22, padding:'18px 18px 16px', boxShadow:'0 18px 36px rgba(17,24,39,0.05)' }}>
                      <div style={{ fontSize:11, color:'#1C6090', marginBottom:12, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.08em', display:'flex', alignItems:'center', gap:6 }}>
                        <Layers size={12}/> LIFECYCLE ASSUMPTIONS
                      </div>
                      <div style={{ display:'grid', gap:12 }}>
                        <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 120px 120px', gap:10 }}>
                          <div>
                            <div style={{ fontSize:10, color:'#667085', marginBottom:6, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>LIFECYCLE TYPE</div>
                            <select
                              value={lifecycleDraft.type}
                              onChange={e=>setLifecycleDraft(p=>({ ...p, type:e.target.value }))}
                              style={{ width:'100%', background:'#F2F4F7', border:'1px solid rgba(71,84,103,0.14)', borderRadius:12, padding:'10px 12px', color:'#191C1E', fontSize:13, outline:'none', fontFamily:"'Barlow', sans-serif" }}
                            >
                              {Object.entries(LIFECYCLE_TYPES).map(([value, meta])=>(
                                <option key={value} value={value}>{meta.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <div style={{ fontSize:10, color:'#667085', marginBottom:6, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>INTERVAL</div>
                            <input
                              value={lifecycleDraft.intervalValue}
                              onChange={e=>setLifecycleDraft(p=>({ ...p, intervalValue:e.target.value }))}
                              placeholder={lifecycleNeedsInterval?'1':''}
                              style={{ width:'100%', background:'#F2F4F7', border:'1px solid rgba(71,84,103,0.14)', borderRadius:12, padding:'10px 12px', color:'#191C1E', fontSize:13, outline:'none', fontFamily:"'JetBrains Mono', monospace" }}
                            />
                          </div>
                          <div>
                            <div style={{ fontSize:10, color:'#667085', marginBottom:6, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>UNIT</div>
                            <select
                              value={lifecycleDraft.intervalUnit}
                              onChange={e=>setLifecycleDraft(p=>({ ...p, intervalUnit:e.target.value }))}
                              style={{ width:'100%', background:'#F2F4F7', border:'1px solid rgba(71,84,103,0.14)', borderRadius:12, padding:'10px 12px', color:'#191C1E', fontSize:13, outline:'none', fontFamily:"'Barlow', sans-serif" }}
                            >
                              <option value="months">Months</option>
                              <option value="years">Years</option>
                            </select>
                          </div>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'120px 1fr 112px', gap:10 }}>
                          <div>
                            <div style={{ fontSize:10, color:'#667085', marginBottom:6, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>REPLACED (%)</div>
                            <input
                              value={lifecycleDraft.replacementRatio}
                              onChange={e=>setLifecycleDraft(p=>({ ...p, replacementRatio:e.target.value }))}
                              placeholder="100"
                              style={{ width:'100%', background:'#F2F4F7', border:'1px solid rgba(71,84,103,0.14)', borderRadius:12, padding:'10px 12px', color:'#191C1E', fontSize:13, outline:'none', fontFamily:"'JetBrains Mono', monospace" }}
                            />
                          </div>
                          <div>
                            <div style={{ fontSize:10, color:'#667085', marginBottom:6, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>SOURCE</div>
                            <input
                              value={lifecycleDraft.source}
                              onChange={e=>setLifecycleDraft(p=>({ ...p, source:e.target.value }))}
                              placeholder="OEM, RAMS assumption, maintenance return..."
                              style={{ width:'100%', background:'#F2F4F7', border:'1px solid rgba(71,84,103,0.14)', borderRadius:12, padding:'10px 12px', color:'#191C1E', fontSize:13, outline:'none', fontFamily:"'Barlow', sans-serif" }}
                            />
                          </div>
                          <div>
                            <div style={{ fontSize:10, color:'#667085', marginBottom:6, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>YEAR</div>
                            <input
                              value={lifecycleDraft.year}
                              onChange={e=>setLifecycleDraft(p=>({ ...p, year:e.target.value.replace(/[^0-9]/g, '').slice(0, 4) }))}
                              placeholder={currentYear}
                              style={{ width:'100%', background:'#F2F4F7', border:'1px solid rgba(71,84,103,0.14)', borderRadius:12, padding:'10px 12px', color:'#191C1E', fontSize:13, outline:'none', fontFamily:"'JetBrains Mono', monospace" }}
                            />
                          </div>
                        </div>
                        <div style={{ display:'grid', gap:6 }}>
                          <div style={{ fontSize:12, color:'#667085', lineHeight:1.55 }}>
                            Current assumption: <strong style={{ color:'#191C1E' }}>{getLifecycleSummary(modal)}</strong>
                          </div>
                          <div style={{ fontSize:12, color:'#667085', lineHeight:1.55 }}>
                            Active reference: <strong style={{ color:'#191C1E' }}>{getLifecycleReferenceLabel(modal)}</strong>
                          </div>
                        </div>
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                          <button
                            onClick={resetLifecycleOverride}
                            style={{ background:'#FFFFFF', border:'1px solid rgba(71,84,103,0.14)', borderRadius:12, padding:'10px 12px', cursor:'pointer', fontSize:12, color:'#475467', fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.05em' }}
                          >
                            RESET LIFECYCLE
                          </button>
                          <button
                            onClick={saveLifecycleOverride}
                            disabled={!canSaveLifecycleOverride}
                            style={{ background:canSaveLifecycleOverride?'#1F8A84':'#D0D5DD', border:'none', borderRadius:12, padding:'10px 14px', cursor:canSaveLifecycleOverride?'pointer':'not-allowed', fontSize:12, color:'#FFFFFF', fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.05em' }}
                          >
                            SAVE LIFECYCLE
                          </button>
                        </div>
                      </div>
                    </div>

                    {(modal.statut==='OB' || modal.period.toLowerCase().includes('calibration')) && (
                      <div style={{ display:'grid', gap:10 }}>
                        {modal.statut==='OB'&&(
                          <div style={{ background:'#FCE8D9', borderRadius:16, padding:'14px 16px', display:'flex', gap:10, alignItems:'flex-start', color:'#9F4200' }}>
                            <AlertTriangle size={14} style={{ flexShrink:0, marginTop:1 }}/>
                            <div style={{ fontSize:12, lineHeight:1.55 }}>
                              This tool is <strong>mandatory</strong> and should stay covered in every compliant allocation baseline.
                            </div>
                          </div>
                        )}
                        {modal.period.toLowerCase().includes('calibration')&&(
                          <div style={{ background:'#DCEAF5', borderRadius:16, padding:'14px 16px', display:'flex', gap:10, alignItems:'flex-start', color:'#1C6090' }}>
                            <Info size={14} style={{ flexShrink:0, marginTop:1 }}/>
                            <div style={{ fontSize:12, lineHeight:1.55 }}>
                              <strong>Calibration-driven asset.</strong> Keep this tool inside the metrology and maintenance planning cycle.
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:12 }}>
                      <div style={{ background:'#FFFFFF', borderRadius:18, padding:'16px', boxShadow:'0 14px 30px rgba(17,24,39,0.05)' }}>
                        <div style={{ fontSize:10, color:'#667085', marginBottom:8, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>OFFICIAL PRODUCT PAGE</div>
                        <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:10.5, color:'#1C6090', wordBreak:'break-all', marginBottom:11, lineHeight:1.6 }}>{modal.productUrl}</div>
                        <CopyBtn text={modal.productUrl} label="Copy product link" accent="#1C6090" light />
                      </div>

                      <div style={{ background:'#FFFFFF', borderRadius:18, padding:'16px', boxShadow:'0 14px 30px rgba(17,24,39,0.05)' }}>
                        <div style={{ fontSize:10, color:'#667085', marginBottom:8, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>LOCAL IMAGE FILE</div>
                        <div style={{ display:'flex', alignItems:'center', gap:8, background:'#EFF2F5', borderRadius:10, padding:'8px 10px', marginBottom:11 }}>
                          <span style={{ fontSize:9, color:'#667085', flexShrink:0 }}>./images/</span>
                          <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:10.5, color:'#475467', flex:1, wordBreak:'break-all' }}>{modal.imgFile}</span>
                        </div>
                        <CopyBtn text={modal.imgFile} label="Copy filename" accent={c.color} light />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,10,10,0.88)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:isMobile?10:20, backdropFilter:'blur(6px)' }}
            onClick={()=>setModal(null)}>
            <div style={{ background:C.card, borderRadius:18, width:'100%', maxWidth:860, maxHeight:'92vh', border:`1px solid ${c.color}40`, animation:'slideIn 0.18s ease', overflow:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.45)' }}
              onClick={e=>e.stopPropagation()}>

              {/* Header */}
              <div style={{ background:C.bgMid, padding:'16px 22px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, borderBottom:`1px solid ${C.border}` }}>
                <div style={{ minWidth:0 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:10 }}>
                    <span style={{ background:`${c.color}18`, color:c.color, border:`1px solid ${c.color}35`, borderRadius:999, padding:'4px 11px', fontSize:11, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em' }}>{c.icon} {c.label}</span>
                    <span style={{ background:`${s.color}15`, color:s.color, border:`1px solid ${s.color}30`, borderRadius:999, padding:'4px 11px', fontSize:11, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif" }}>{s.label}</span>
                    <span style={{ background:levelMeta.bgDark, color:levelMeta.colorDark, borderRadius:999, padding:'4px 11px', fontSize:11, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif" }}>
                      {levelMeta.emoji} {levelMeta.label}
                    </span>
                  </div>
                  <div style={{ fontSize:20, fontWeight:700, lineHeight:1.25, color:C.text, marginBottom:8 }}>{modal.name}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontSize:13, fontWeight:700, color:c.color }}>{modal.brand}</span>
                    <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:10, color:C.textSub, background:C.bg, padding:'4px 9px', borderRadius:6, border:`1px solid ${C.border}` }}>{modal.model}</span>
                  </div>
                </div>
                <button onClick={()=>setModal(null)} style={{ background:'transparent', border:'none', cursor:'pointer', color:C.textSub, padding:4 }}><X size={18}/></button>
              </div>

              <div style={{ display:'flex', flexDirection:isMobile?'column':'row' }}>
                {/* Left */}
                <div style={{ width:isMobile?'100%':228, flexShrink:0, background:C.bgMid, display:'flex', flexDirection:'column', alignItems:'center', gap:14, padding:'22px 18px', borderRight:isMobile?'none':`1px solid ${C.border}`, borderBottom:isMobile?`1px solid ${C.border}`:'none' }}>
                  <div style={{ width:'100%', height:182, background:C.bg, borderRadius:16, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', padding:16, animation:'imageBreath 4.2s ease-in-out infinite' }}>
                    <ToolVisual tool={modal} size={146} radius={16}/>
                  </div>

                  {/* Price */}
                  <div style={{ background:C.bg, borderRadius:12, padding:'14px 16px', textAlign:'left', width:'100%', border:`1px solid ${c.color}30` }}>
                    <div style={{ fontSize:9, color:C.textSub, marginBottom:5, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>COST SNAPSHOT</div>
                    <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:24, fontWeight:700, color:c.color }}>{fmt(modal.currentPrice)} €</div>
                    <div style={{ fontSize:11, color:C.textSub, marginTop:4 }}>{unitLabel}</div>
                    <div style={{ fontSize:10, color:C.textSub, marginTop:5 }}>{getPriceReferenceLabel(modal)}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}` }}>
                      <span style={{ fontSize:10, color:C.textSub }}>Selection block</span>
                      <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:13, fontWeight:700, color:C.text }}>{fmt(modal.qty*modal.currentPrice)} €</span>
                    </div>
                  </div>

                  <div style={{ width:'100%', display:'grid', gridTemplateColumns:'1fr', gap:8 }}>
                    <MetaTile label="Voltage domain" value={modal.domain} accent={c.color}/>
                    <MetaTile label="Maintenance" value={modal.period} accent={C.violet}/>
                    <MetaTile label="Quantity baseline" value={unitLabel} accent={levelMeta.colorDark}/>
                  </div>

                  <button onClick={()=>toggle(modal.uid)} style={{
                    background:isSel?c.color:'transparent',
                    border:`1.5px solid ${isSel?c.color:C.borderL}`,
                    borderRadius:8, padding:'9px 0', width:'100%', cursor:'pointer',
                    fontWeight:700, fontSize:12, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'all 0.15s',
                    color:isSel?'#fff':C.textSub,
                  }}>
                    {isSel?<><Check size={13}/> SELECTED</>:'+ ADD TO SELECTION'}
                  </button>
                </div>

                {/* Right */}
                <div style={{ flex:1, padding:isMobile?'16px 16px 18px':'20px 22px', overflowY:'auto', maxHeight:isMobile?'none':560, display:'flex', flexDirection:'column', gap:12 }}>
                  <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:10 }}>
                    <MetaTile label="Standard / insulation" value={modal.norm} accent={C.blue}/>
                    <MetaTile label="Selection status" value={s.label} accent={s.color}/>
                  </div>

                  {/* Notes */}
                  <div style={{ background:`${c.color}0D`, borderRadius:12, padding:'14px 15px', border:`1px solid ${c.color}25` }}>
                    <div style={{ fontSize:10, color:c.color, marginBottom:10, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em', display:'flex', alignItems:'center', gap:5 }}>
                      <Info size={10}/> TECHNICAL NOTES
                    </div>
                    <div style={{ display:'grid', gap:10 }}>
                      <div style={{ background:C.bgMid, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px' }}>
                        <div style={{ fontSize:9, color:C.textSub, marginBottom:5, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em' }}>PRIMARY USE</div>
                        <div style={{ fontSize:12, color:C.text, lineHeight:1.65 }}>
                          <PrimaryUse tool={modal}/>
                        </div>
                      </div>
                      <div style={{ background:C.bgMid, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px' }}>
                        <div style={{ fontSize:9, color:C.textSub, marginBottom:8, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em' }}>ESSENTIAL SPECIFICATIONS</div>
                        <div style={{ display:'grid', gap:7 }}>
                          {[
                            ['Voltage domain', modal.domain],
                            ['Standard / insulation', modal.norm],
                            ['Verification / calibration', modal.period],
                            ['Quantity baseline', unitLabel],
                          ].map(([label, value])=>(
                            <div key={label} style={{ display:'grid', gridTemplateColumns:'140px 1fr', gap:10, alignItems:'start', paddingBottom:7, borderBottom:`1px solid ${C.border}` }}>
                              <div style={{ fontSize:10, color:C.textSub }}>{label}</div>
                              <div style={{ fontSize:11.5, color:C.text, lineHeight:1.45 }}>{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background:C.bgMid, borderRadius:10, padding:'12px 14px', border:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:10, color:c.color, marginBottom:10, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em', display:'flex', alignItems:'center', gap:5 }}>
                      <BarChart2 size={10}/> PRICE REFERENCE
                    </div>
                    <div style={{ display:'grid', gap:10 }}>
                      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr 96px', gap:8 }}>
                        <input
                          value={priceDraft.price}
                          onChange={e=>setPriceDraft(p=>({ ...p, price:e.target.value }))}
                          placeholder={String(modal.price)}
                          style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 10px', color:C.text, fontSize:12, outline:'none', fontFamily:"'JetBrains Mono', monospace" }}
                        />
                        <input
                          value={priceDraft.source}
                          onChange={e=>setPriceDraft(p=>({ ...p, source:e.target.value }))}
                          placeholder="Source"
                          style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 10px', color:C.text, fontSize:12, outline:'none', fontFamily:"'Barlow', sans-serif" }}
                        />
                        <input
                          value={priceDraft.year}
                          onChange={e=>setPriceDraft(p=>({ ...p, year:e.target.value.replace(/[^0-9]/g, '').slice(0, 4) }))}
                          placeholder={currentYear}
                          style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 10px', color:C.text, fontSize:12, outline:'none', fontFamily:"'JetBrains Mono', monospace" }}
                        />
                      </div>
                      <div style={{ fontSize:11, color:C.textSub, lineHeight:1.5 }}>
                        Active reference: <span style={{ color:C.text }}>{getPriceReferenceLabel(modal)}</span>
                      </div>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        <button onClick={resetPriceOverride} style={{ background:'transparent', border:`1px solid ${C.borderL}`, borderRadius:8, padding:'8px 10px', cursor:'pointer', fontSize:11, color:C.textSub, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em' }}>
                          RESET PRICE
                        </button>
                        <button onClick={savePriceOverride} disabled={!canSavePriceOverride} style={{ background:canSavePriceOverride?c.color:C.borderL, border:'none', borderRadius:8, padding:'8px 12px', cursor:canSavePriceOverride?'pointer':'not-allowed', fontSize:11, color:'#fff', fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em' }}>
                          SAVE PRICE
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ background:C.bgMid, borderRadius:10, padding:'12px 14px', border:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:10, color:c.color, marginBottom:10, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em', display:'flex', alignItems:'center', gap:5 }}>
                      <Layers size={10}/> LIFECYCLE ASSUMPTIONS
                    </div>
                    <div style={{ display:'grid', gap:10 }}>
                      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 88px 88px', gap:8 }}>
                        <select
                          value={lifecycleDraft.type}
                          onChange={e=>setLifecycleDraft(p=>({ ...p, type:e.target.value }))}
                          style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 10px', color:C.text, fontSize:12, outline:'none', fontFamily:"'Barlow', sans-serif" }}
                        >
                          {Object.entries(LIFECYCLE_TYPES).map(([value, meta])=>(
                            <option key={value} value={value}>{meta.label}</option>
                          ))}
                        </select>
                        <input
                          value={lifecycleDraft.intervalValue}
                          onChange={e=>setLifecycleDraft(p=>({ ...p, intervalValue:e.target.value }))}
                          placeholder={lifecycleNeedsInterval?'1':''}
                          style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 10px', color:C.text, fontSize:12, outline:'none', fontFamily:"'JetBrains Mono', monospace" }}
                        />
                        <select
                          value={lifecycleDraft.intervalUnit}
                          onChange={e=>setLifecycleDraft(p=>({ ...p, intervalUnit:e.target.value }))}
                          style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 10px', color:C.text, fontSize:12, outline:'none', fontFamily:"'Barlow', sans-serif" }}
                        >
                          <option value="months">Months</option>
                          <option value="years">Years</option>
                        </select>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'88px 1fr 96px', gap:8 }}>
                        <input
                          value={lifecycleDraft.replacementRatio}
                          onChange={e=>setLifecycleDraft(p=>({ ...p, replacementRatio:e.target.value }))}
                          placeholder="100"
                          style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 10px', color:C.text, fontSize:12, outline:'none', fontFamily:"'JetBrains Mono', monospace" }}
                        />
                        <input
                          value={lifecycleDraft.source}
                          onChange={e=>setLifecycleDraft(p=>({ ...p, source:e.target.value }))}
                          placeholder="Source"
                          style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 10px', color:C.text, fontSize:12, outline:'none', fontFamily:"'Barlow', sans-serif" }}
                        />
                        <input
                          value={lifecycleDraft.year}
                          onChange={e=>setLifecycleDraft(p=>({ ...p, year:e.target.value.replace(/[^0-9]/g, '').slice(0, 4) }))}
                          placeholder={currentYear}
                          style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 10px', color:C.text, fontSize:12, outline:'none', fontFamily:"'JetBrains Mono', monospace" }}
                        />
                      </div>
                      <div style={{ fontSize:11, color:C.textSub, lineHeight:1.5 }}>
                        Current assumption: <span style={{ color:C.text }}>{getLifecycleSummary(modal)}</span>
                      </div>
                      <div style={{ fontSize:11, color:C.textSub, lineHeight:1.5 }}>
                        Active reference: <span style={{ color:C.text }}>{getLifecycleReferenceLabel(modal)}</span>
                      </div>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        <button onClick={resetLifecycleOverride} style={{ background:'transparent', border:`1px solid ${C.borderL}`, borderRadius:8, padding:'8px 10px', cursor:'pointer', fontSize:11, color:C.textSub, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em' }}>
                          RESET LIFECYCLE
                        </button>
                        <button onClick={saveLifecycleOverride} disabled={!canSaveLifecycleOverride} style={{ background:canSaveLifecycleOverride?C.teal:C.borderL, border:'none', borderRadius:8, padding:'8px 12px', cursor:canSaveLifecycleOverride?'pointer':'not-allowed', fontSize:11, color:'#fff', fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em' }}>
                          SAVE LIFECYCLE
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Alerts */}
                  {modal.statut==='OB'&&(
                    <div style={{ background:C.orangeDim, borderRadius:10, padding:'11px 14px', border:`1px solid ${C.orange}30`, display:'flex', gap:8, alignItems:'flex-start' }}>
                      <AlertTriangle size={13} color={C.orange} style={{ flexShrink:0, marginTop:1 }}/>
                      <div style={{ fontSize:11, color:C.orange, lineHeight:1.45 }}>
                        This tool is <strong>mandatory</strong> — its absence may constitute a breach of regulatory or safety requirements.
                      </div>
                    </div>
                  )}
                  {modal.period.toLowerCase().includes('calibration')&&(
                    <div style={{ background:C.violetDim, borderRadius:10, padding:'11px 14px', border:`1px solid ${C.violet}30`, display:'flex', gap:8 }}>
                      <Info size={13} color={C.violet} style={{ flexShrink:0, marginTop:1 }}/>
                      <div style={{ fontSize:11, color:C.violet, lineHeight:1.45 }}>
                        <strong>Periodic calibration required</strong> — must be included in the team's metrological maintenance plan.
                      </div>
                    </div>
                  )}

                  {/* Product URL + image filename */}
                  <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:10 }}>
                    <div style={{ background:C.bgMid, borderRadius:10, padding:'12px 14px', border:`1px solid ${C.border}` }}>
                      <div style={{ fontSize:9, color:C.textSub, marginBottom:7, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em' }}>OFFICIAL PRODUCT PAGE</div>
                      <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:10, color:C.teal, wordBreak:'break-all', marginBottom:9, lineHeight:1.55 }}>{modal.productUrl}</div>
                      <CopyBtn text={modal.productUrl} label="Copy product link" accent={C.teal}/>
                    </div>

                    {/* Image filename */}
                    <div style={{ background:C.bgMid, borderRadius:10, padding:'12px 14px', border:`1px solid ${C.amber}30` }}>
                      <div style={{ fontSize:9, color:C.textSub, marginBottom:7, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em' }}>LOCAL IMAGE FILE</div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, background:C.bg, borderRadius:6, padding:'7px 10px', marginBottom:9, border:`1px solid ${C.border}` }}>
                        <span style={{ fontSize:9, color:C.textSub, flexShrink:0 }}>./images/</span>
                        <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:C.amber, flex:1, wordBreak:'break-all' }}>{modal.imgFile}</span>
                      </div>
                      <CopyBtn text={modal.imgFile} label="Copy filename" accent={C.amber}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
