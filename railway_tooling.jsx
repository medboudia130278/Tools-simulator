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
  // Unit prices refreshed on 2026-03-31 from current public shop / price-comparison pages when available.
  // Unchanged entries remain planning estimates for budgeting, not contractual purchase prices.
  ['t01','T','SAFETY','TRMS Multimeter CAT IV 1000V','Fluke','289/EUR','LV / DC Traction','CAT IV 1000V – IEC 61010','OB',1,976,'Annual (calibration)','Integrated data logger. AC/DC measurements: voltage, current, resistance, continuity. Absolute field reference.','https://www.fluke.com/fr-fr/produit/multimetres/multimetres-numeriques/fluke-289'],
  ['t02','T','SAFETY','Non-contact AC Voltage Detector 100-1000V','Fluke','T6-1000PRO','LV','CAT IV 1000V','OB',1,378,'Annual','Non-contact measurement, no leads required. Essential LV safety. Instant detection before any approach.','https://www.fluke.com/fr-fr/produit/testeurs-electriques/testeurs-tension/fluke-t6-1000-pro'],
  ['t03','T','SAFETY','Safety VAT Bipolar Absence-of-Voltage Tester 12-1000V AC/DC','Chauvin Arnoux','C.A 773','LV / DC Traction','CAT IV 1000V – IEC 61243-3','OB',1,290,'Annual','Dedicated safety tester used to prove absence of voltage before contact, lockout or intervention on isolated circuits. This entry is the formal VAT tool, not the traction polarity/diagnostic tester.','https://www.chauvin-arnoux.com/en/node/9325'],
  ['t04','T','PPE','Insulating Gloves Class 0 (1000V AC) + leather protectors','Honeywell / Salisbury','GK014B/10H glove kit','LV / DC Traction','Class 0 – IEC EN 60903 / ASTM D120','OB',1,188,'6 months (dielectric test)','Official Salisbury glove kit page including class 0 rubber insulating gloves, leather protectors and storage bag for low-voltage intervention work.','https://www.salisburyshop.com/buy/product/class-0-black-rubber-insulating-glove-kit/198561'],
  ['t05','T','PPE','Electrical Safety Helmet with Integrated Faceshield','JSP','EVO VISTAshield','All domains','EN 397 – EN 50365 – EN 166','OB',1,58,'3 years','Integrated faceshield helmet with low-voltage electrical insulation performance and better face coverage than the previous link.','https://www.jspsafety.com/products/PPE/Head-Protection/EN-397-industrial-Safety-Helmets/VAR-AMC170-007-F00_EVO-ViSTAshield-Safety-Helmet-with-integrated-Faceshield'],
  ['t06','T','PPE','Arc-flash Safety Glasses EN166','Bolle Safety','Cobra COBPSI','All domains','EN 166 / EN 170','OB',1,22,'1 year','Anti-scratch, anti-fog. Systematic use during all interventions.','https://www.bollesafety.com/fr/lunettes-de-securite/cobra'],
  ['t07','E','PPE','Arc-flash Safety Kit Category 2 (8 cal/cm²)','Honeywell / Salisbury','SKCP8RG-WB','All domains','NFPA 70E – ASTM F1506','RC',1,510,'3 years or after arc event','Current official kit page for coat + pants + PrismShield faceshield + hard hat. More realistic replacement than the obsolete AGF40KIT link.','https://www.salisburyonline.com/product/384/salisbury-safety-kit-8-cal-coat-pant-as1000-prismshield-faceshield-skcp8rg-wb'],
  ['t08','T','SAFETY','ATEX Headlamp – 115 lm','Peli','2755Z0','All domains','ATEX Zone 0 – IP54','OB',1,118,'Annual (battery)','Current official intrinsically safe headlamp page. Suitable for hazardous environments and easier to source than the obsolete PIXA 3 ATEX reference.','https://www.peli.com/es/en/product/flashlights/headlamp/2755z0/'],
  ['t40','T','PPE','Safety Shoes S3 ESD SRC mid-cut','PUMA Safety','KRYPTON MID 634200','All domains','EN ISO 20345 – S3 ESD SRC','OB',1,119.39,'2 years or replace when worn','Mid-cut safety footwear for daily maintenance mobility, slip resistance and toe protection in stations, substations, technical rooms and depot areas.','https://www.puma-safety.com/eu/de/maenner/schuhe/sicherheitsschuhe/sicherheitsschuhe-s3/231/krypton-mid-puma-safety-sicherheitsschuhe-s3-esd'],
  ['t41','T','PPE','Hi-visibility Vest Class 2','Seton','CPS4375052','Platform work zones / worksite visibility','EN ISO 20471 Class 2','OB',1,9.9,'2 years','Mandatory visibility PPE for service windows, platform-side activity and any intervention where technician conspicuity must be maintained.','https://www.seton.fr/gilet-securite-haute-visibilite-2-ceintures.html'],
  ['t42','T','PPE','Hi-visibility Work Trousers Class 2','Portwest','PW340','All domains – daily rail-side and technical-room work','EN ISO 20471 Class 2','OB',1,79,'2 years or replace when worn','Base hi-vis lower-body PPE for daily maintenance activity in stations, technical rooms, substations and access routes where technician visibility must be maintained throughout the shift.','https://www.lyreco.com/webshop/FRCH/pantalon-haute-visibilite-portwest-pw340-classe-2-orange-noir-taille-58-product-000000000016482764.html'],
  ['t43','T','PPE','Hi-visibility Short-sleeve Work Polo Class 2','Portwest','RT22','All domains – daily rail-side and technical-room work','EN ISO 20471 Class 2','OB',1,24,'1 year or replace when faded','Base high-visibility upper-body workwear for daily operations in warmer periods, inspections and service windows where a vest alone is not the preferred permanent garment.','https://www.hiviskings.com/portwest-rt22-class-2-hi-vis-safety-polo-rt22'],
  ['t44','T','PPE','Hi-visibility Winter Bomber Jacket Class 3','Portwest','C465','All domains – winter outdoor and draft-exposed work','EN ISO 20471 Class 3 – EN 343','OB',1,69,'3 years or replace when damaged','Cold-weather high-visibility outer layer for winter interventions, outdoor access, platform-side standby and exposed technical-room work where warmth and visibility are both required.','https://www.lyreco.com/webshop/FRLU/veste-bomber-hi-vis-portwest-c465-orange-bleu-marine-taille-m-la-piece-product-000000000007875167.html'],
  ['t09','T','SAFETY','VDE 1000V Insulated Screwdriver Set – 7 pcs','Wiha','36295 SoftFinish VDE Set','LV','VDE – IEC 60900 – 1000V AC','OB',1,78,'Annual (visual inspection)','Bi-material handles. Compliant with DIN VDE 0680. Tested to 10kV.','https://www.wiha.com/fr-fr/outillage/tournevis/tournevis-vde/softfinish-vde/36295'],
  ['t10','T','SAFETY','VDE 1000V Insulated Tool Set – 5 pcs','Knipex','00 20 13','LV','DIN EN/IEC 60900 – 1000V AC','OB',1,109,'Annual (visual inspection)','Official KNIPEX 5-piece VDE set combining insulated pliers and screwdrivers for standard low-voltage work.','https://www.knipex.com/products/tool-kits/tool-kits/tool-kits/002013'],
  ['t11','T','SAFETY','VDE Torque Wrench 1/2" 10-50 Nm','Gedore','VDE 4508-05','LV','DIN EN ISO 6789-2 / IEC 60900','RC',1,395,'Annual (calibration)','Official GEDORE insulated torque wrench page for controlled tightening on live components up to 1000 V.','https://www.gedore.com/en-at/products/torque-tools/torque-wrenches--accessories/torque-wrenches%2C-releasing-for-sockets/vde-4508-vde-torque-wrench/vde-4508-05---3079066'],
  ['t12','T','MBTDC','Portable Insulation Tester 500V/1000V','Fluke','1507 Insulation Tester','DC Auxiliaries 24-110V / LV','IEC 61557-2 – CAT IV 600V','OB',1,699,'Annual (calibration)','Daily use: insulation testing of 24VDC control circuits. Lighter than team MIT525.','https://www.fluke.com/fr-fr/produit/testeurs-isolement/fluke-1507'],
  ['t13','P','MBTDC','RCD Tester + Fault Loop Impedance','Fluke','1664 FC Multifunction','LV / Auxiliaries 400V','IEC 61557 – IEC 60364','RC',1,2133,'Annual (calibration)','RCD test 10-500mA, fault loop impedance. Useful for project/depot-level verification before 400V commissioning or after modifications to auxiliary installations.','https://www.fluke.com/fr-fr/produit/testeurs-installation-electrique/fluke-1664-fc'],
  ['t15','T','MBTDC','TRMS AC/DC Clamp Meter 1000A with iFlex','Fluke','376 FC','LV / DC Traction 750-1500V','CAT IV 600V - CAT III 1000V','OB',1,703,'Annual (calibration)','Handheld clamp meter with iFlex for current checks on LV feeders, auxiliaries and traction-related conductors when a standard multimeter is not practical.','https://www.fluke.com/fr-fr/produit/mesure-courant/pinces-amperemetriques/fluke-376-fc'],
  ['t16','E','MBTDC','Three-phase Rotation Tester 40-700V AC','Fluke','9040','LV / Auxiliaries 400V','EN 61010 – EN 61557-7','OB',1,292,'Annual','Clear official product page for phase-sequence verification before energisation. Replaces the incorrect CA 6412 reference.','https://www.fluke.com/en/product/electrical-testing/basic-testers/fluke-9040'],
  ['t17','T','MBTDC','Traction DC Bipolar Voltage and Polarity Tester 24-1500V','Gossen Metrawatt','METRAVOLT 12D+L','DC Traction 750-1500V / LV','DIN EN 61243-3 – CAT IV 600V / CAT III 1000V','RC',1,435,'Annual','Two-pole contact tester used mainly for traction DC polarity identification, AC/DC voltage confirmation and diagnostic checks where the safety VAT alone is not sufficient. Distinct from the mandatory absence-of-voltage tool.','https://www.gossenmetrawatt.de/produkte/mess-und-prueftechnik/prueftechnik/pruefung-elektrischer-installationen-und-anlagen/spannung-phase-drehfeld-durchgang-polaritaet/metravolt-12d-plusl/'],
  ['t18','E','MBTDC','Infrared Thermometer -50 to +550°C','Fluke','62 MAX+','All domains','EN 61010-1','RC',1,148,'Annual','Fast detection of hot spots on lugs, busbars, fuses.','https://www.fluke.com/fr-fr/produit/thermometres/thermometres-infrarouges/fluke-62-max'],
  ['t19','E','OUTILS','Ratchet Set 3/8" metric 29 pcs','Wera','8100 SB 6 Zyklop Speed','LV / MV – Bolting','ISO 2725 / DIN 3122','OB',1,108,'Replace when worn','Current official ratchet/socket set page with compact textile case. Suitable for cabinet fixings, lugs and terminal work.','https://www.wera.de/fr/outillages/8100-sb-6-jeu-cliquet-zyklop-speed-a-carre-3-8-metrique'],
  ['t20','T','OUTILS','Hex Key Set metric 1.5-10mm','Wera','950/9 Hex-Plus Multicolour 1 SB','All domains','DIN 911 / ISO 2936','OB',1,42,'Replace when worn','Current official hex key set page. Daily use for socket-head screws, drives, relays and rail equipment.','https://www.wera.de/fr/outillages/950-9-hex-plus-multicolour-1-sb-jeu-de-cles-males-coudees-syst-metrique-blacklaser'],
  ['t21','T','OUTILS','Belt pouch for two pliers up to 150 mm','Knipex','00 19 72 LE','All domains','–','OB',1,12,'Replace when worn','Official KNIPEX belt pouch for two pliers up to 150 mm, with side holder for flashlight or pen. Corrects the previous mismatched tool-bag description.','https://www.knipex.com/products/tool-bags-and-tool-cases/belt-pouch-for-two-pliers-empty/belt-pouch-two-pliers-empty/001972LE'],
  ['t22','E','OUTILS','Heat Gun 2000W 50-630°C + 2 nozzles','Bosch','GHG 20-63 Professional','LV / DC – Sleeves & Cables','–','OB',1,143,'Replace if defective','Official Bosch product page for the GHG 20-63 heat gun, suitable for heat-shrink work on lugs, cables and connectors.','https://www.bosch-professional.com/de/de/products/ghg-20-63-06012A6200'],
  ['t23','T','OUTILS','Telescopic Magnetic Pick-up Tool','Stahlwille','12601','All domains','–','OB',1,14,'Replace as needed','Official magnetic pick-up tool page for recovering metallic parts in inaccessible installation areas.','https://stahlwille.com/en_us/products/detail/826592'],
  ['t24','T','OUTILS','Telescopic Inspection Mirror 360°','Gedore','718 / 1979841','All domains','–','RC',1,22,'Replace as needed','Official inspection mirror page with 360° swivel mirror and telescopic handle for inaccessible inspection points.','https://www.gedore.com/en-de/products/measuring---marking---testing-tools/test-tools/mirror/718-inspection-mirror/718---1979841'],
  ['t25','T','OUTILS','Tape Measure 5m magnetic anti-shock','Stanley','STHT36334 FatMax','All domains','–','OB',1,18,'Replace as needed','Double-sided magnetic hook useful for solo work.','https://www.stanley.fr/outils-a-main/mesure/metres-ruban/fatmax-autolock-5m'],
  ['t26','T','OUTILS','Permanent Industrial Markers oil/heat resistant – pack 3','Edding','8300 Industry Permanent Marker','All domains','–','OB',3,5.5,'Consumable','Black, red, blue. Industrial marker for oily/dusty surfaces, heat resistant up to 300°C.','https://www.edding.com/en-us/products/edding-8300-industry-permanent-marker/'],
  ['t27','T','OUTILS','Rechargeable Work Light 500 lm magnet IP65','Scangrip','UNIFORM 03.6208','All domains','IP65 – EN 13032-1','OB',1,89,'Annual (battery)','Portable inspection/work light with integrated magnet, hook and adjustable output up to 500 lm. Replaces the obsolete FLEX WEAR link.','https://www.scangrip.com/fr-fr/boutique/lampes-de-travail/03-6208-uniform'],
  ['t28','T','OUTILS','Technician Drill/Driver 18V for routine fastening','Bosch','GSR 18V-55 Professional','All domains – routine fixing and assembly','–','OB',1,317,'Replace if defective','Technician-level cordless drill/driver intended as the personal daily-use machine: cabinet covers, terminal blocks, light brackets, trunking accessories and routine assembly work. One unit per technician.','https://www.bosch-professional.com/fr/fr/products/gsr-18v-55-06019H5200'],
  ['t29','P','CABLE','Hand-operated Hydraulic Crimping Tool 10-240mm²','Klauke','HK 60 VP','LV / DC Traction','EN 61238-1','RC',1,895,'2 years','Official Klauke hydraulic crimping tool page for cable lugs and connectors up to 240 mm² without interchangeable dies.','https://www.klauke.com/bh/en/ek-60-ft-hand-operated-hydraulic-crimping-tool-10-240-mm'],
  ['t30','T','CABLE','Automatic Wire Stripper 0.2-6.0 mm2','JOKARI','SECURA 2K 20100','LV / DC','–','OB',1,38.66,'Annual (visual / blade condition)','Used to strip insulation cleanly on small LV and control conductors before reconnection to terminals, connector replacement, sensor rewiring or local harness repair. Not intended for outer-sheath removal or crimping.','https://jokari.de/en/SECURA-2K-2.htm'],
  ['t31','T','CABLE','Cable Jacket Knife for round cables 8-28 mm','Jokari','Cable Knife No. 28G Standard','BT / HTA','–','OB',1,32,'Replace when worn','Current official JOKARI cable knife page for round cable sheaths and longitudinal cuts without damaging inner conductors.','https://jokari.de/en/products/detail/cable-knife-no-28g-standard'],
  ['t32','E','CABLE','Portable Cable Label Printer P-touch Bluetooth','Brother','PT-E310BTVP','All domains','–','RC',1,227,'Battery replacement','Official current Brother product page for the portable industrial Bluetooth labeller used for cable and terminal marking.','https://store.brother.fr/appareils/imprimantes-d-etiquettes/p-touch/pt/pte310btvp'],
  ['t33','T','CABLE','Insulating Tape Scotch 23 self-amalgamating + Scotch 35 PVC','3M','Scotch 23 + Scotch 35','LV / DC','UL 510 / IEC 60454','OB',2,12,'Consumable','23 = self-amalgamating, 35 = standard PVC insulating tape.','https://www.3m.fr/3M/fr_FR/p/d/v000057551/'],
  ['t34','T','LOTO','Personal LOTO Kit – electrical','Brady','120886','All domains','OSHA / Lockout Tagout','OB',1,109,'Annual (inspection)','Current official Brady personal electrical lockout kit page with pouch, padlock, hasps, breaker lockouts and tags.','https://www.bradyid.com/products/personal-lockout-kit-electrical-pid-120886'],
  ['t35','T','LOTO','Lockout Padlock thermoplastic – 1 unique key','Master Lock','410RED Zenex','All domains','Lockout Tagout','OB',2,20,'5 years or replacement','Current official Master Lock product page for the keyed-different thermoplastic safety padlock.','https://fr.masterlock.com/products/product/410RED'],
  ['t36','T','LOTO','Danger Lockout Tags – pack 25','Brady','48797','All domains','Lockout Tagout','OB',1,18,'Consumable','Current official Brady pack of 25 durable danger lockout tags with brass grommet and write-on area.','https://www.bradyid.com/products/bilingual-danger-this-tag-lock-to-be-removed-only-by-person-shown-on-back-tags-pid-48797'],
  ['t37','T','OUTILS','Portable Tool Container with shoulder strap','Wera','Wera 2go 2 Tool Container','All domains – mobile maintenance','–','OB',1,115,'Replace when worn','Current official Wera mobile container system with shoulder strap and detachable quiver. Good fit for a technician who must keep essential hand tools on him while moving between rooms, cabinets and platforms.','https://www.wera.de/en/tools/wera-2go-2-tool-container'],
  ['t38','T','OUTILS','Open-end / Ring Wrench Set 8-19 mm in roll-up pouch','Stahlwille','96401007','All domains – daily fastening','DIN 3113 Form B / ISO 7738 Form B','OB',1,185,'Replace when worn','Current official STAHLWILLE set covering the most common small and medium metric sizes for day-to-day fastening. It gives the technician both open-end and ring ends in one compact pouch.','https://stahlwille.com/fr_fr/products/detail/26151321'],
  ['t39','T','OUTILS','Compact 1/4" Spinner Ratchet and Socket Set – 6 pcs','Facom','R.360NANOPB','All domains – compact fastening','ISO 2725 / DIN 3122','OB',1,163,'Replace when worn','Compact FACOM rotating-handle 1/4 inch ratchet and socket set suited to technician carry. Added as a personal fastener-access set for cramped cabinets and small hardware where a full team ratchet set is unnecessary.','https://www.manomano.fr/p/facom-coffret-cliquet-manche-rotatif-360-avec-douilles-14-6-r360nanopb-94034707?model_id=6124264'],
  ['e01','E','PPE','Insulating Gloves Class 4 (36kV)','Honeywell / Salisbury','NG418RB/11 Electriflex','MV 10-36kV','Class 4 – IEC EN 60903 / ASTM D120','OB',4,1101,'6 months (dielectric test)','Official Salisbury Electriflex class 4 glove page for high-voltage live work. Use with matching leather protectors sized for class 4 gloves.','https://www.salisburyshop.com/buy/product/salisbury-electriflex-class-4-rubber-insulating-gloves-ng418rb-11/211574'],
  ['e02','E','PPE','Insulating Gloves Class 2 (17kV) + leather protectors','Honeywell / Salisbury','GK218B/10H glove kit','DC Traction 1500V / BT 1000V','Class 2 – IEC EN 60903 / ASTM D120','OB',4,464,'6 months (dielectric test)','Official Salisbury glove kit page including class 2 gloves, leather protectors and storage bag for 1500 V DC traction or reinforced LV applications.','https://www.salisburyshop.com/buy/product/salisbury-size-10-1-2-class-2-black-insulating-rubber-gloves-kit-gk218b-10h/209680'],
  ['e03','E','PPE','Arc-flash Suit Class 3 (25 cal/cm²) – full coverall','Oberon','TCG25-XXL','MV/HV 25kV','IEC 61482-2 Class 3','OB',2,680,'3 years or after incident','Mandatory for work near 25kV live systems.','https://www.oberoncompany.com/arc-flash-clothing/arc-flash-suits'],
  ['e04','E','PPE','Arc-flash Face Shield 25 cal/cm² Class 3','Oberon','TCG25-HHG','MV/HV 25kV','IEC 61482-2 – Class 3','OB',2,220,'3 years or replacement','Compatible with insulating helmet. Arc Flash Rating minimum 25 cal/cm².','https://www.oberoncompany.com/arc-flash-face-protection'],
  ['e05','E','SAFETY','Switching Stick MV 1-36kV','DEHN','SCS 36 1000','MV 10-36kV','DIN VDE V 0681-1 / -2','OB',2,380,'Annual (dielectric test)','Official switching stick page for indoor/outdoor MV operation. Functional replacement for the previous CATU operating rod link.','https://www.dehn-international.com/store/p/en-DE/F48498/scs-switching-sticks'],
  ['e06','E','SAFETY','Insulating Protective Shutters up to 36kV','DEHN','Insulating Protective Shutters','MV 10-36kV','DIN VDE 0682-552','OB',2,145,'Annual (dielectric test)','Official DEHN product page for insulating protective shutters used to protect against accidental contact with adjacent live parts up to 36 kV.','https://www.dehn-international.com/store/p/en-DE/F48602/insulating-protective-shutters-up-to-36-kv'],
  ['e07','E','OUTILS','Mobile Workshop Roller Cabinet 6 drawers','Beta Tools','RSC24A/6','All domains','–','OB',1,669,'Replace when worn','Shared team roller cabinet with drawers for storing tools, testers, consumables and work-front equipment in a more usable workshop format than a simple carry chest.','https://www.beta-tools.com/en/mobile-roller-cab-with-6-drawers-with-anti-tilt-system.html'],
  ['e08','E','OUTILS','VDE 3/8" insulated socket/tool set – 23 pcs','Stahlwille','12171/19/4 VDE','LV / MV – Protected bolting','IEC 60900','OB',1,670,'Replace when worn','Official insulated 23-piece socket/tool set reference still online. The previous wording understated the full TCS kit content.','https://stahlwille.com/en_us/products/detail/893236'],
  ['e09','E','OUTILS','Cordless Impact Wrench 18V 400 Nm 1/2"','Bosch','GDS 18V-400 Professional','MV / HV – Heavy bolting','–','RC',1,494,'Replace if defective','Official Bosch impact wrench page for the 400 Nm 1/2 inch heavy-bolting tool. This entry is the impact wrench for loosening and tightening bolts, distinct from the drill/driver entry below.','https://www.bosch-professional.com/ge/en/products/gds-18v-400-06019K0020'],
  ['e10','E','OUTILS','Team Hammer Drill/Driver 18V for heavier fixing work','Bosch','GSB 18V-55 Professional','All domains – heavier drilling and fixing','–','RC',1,355,'Replace if defective','Team-level hammer drill/driver reserved for heavier work than the personal technician driver: masonry anchors, metal supports, cable tray fixings and jobs where hammer mode is needed. One shared unit per team.','https://www.bosch-professional.com/fr/fr/products/gsb-18v-55-06019H5301'],
  ['e11','E','OUTILS','Torque Wrench 5-25 Nm with removable ratchet','Facom','R.306A25','LV / DC – Fine bolting','ISO 6789 Class II','OB',1,155,'Annual (COFRAC calibration)','Mechanical fine-range torque wrench retained for controlled tightening on terminals, clamps, brackets and other low-to-medium torque assemblies where sub-5 Nm range and digital traceability are not required.','https://www.facom.com/GLOBALBOM/XJ/E.306A200S/1/Instruction_Manual/EN/E.306_T1_EUR.pdf'],
  ['e12','E','OUTILS','Mechanical Torque Wrench with display 40-200 Nm and 14x18 insert mount','Facom','S.307A200','LV / MV – Medium bolting','ISO 6789 Class II','OB',1,389,'Annual (COFRAC calibration)','Mechanical torque wrench with display for controlled medium-range tightening on cabinets, supports and LV/MV assemblies where angle mode and digital traceability are not required.','https://www.facom.com/product/s307a200/12-digi-cal-mechanical-torque-wrench-removable-ratchet-attachment-14-x-18-range-40-200nm'],
  ['e13','E','OUTILS','Torque Wrench 3/4" 160-800 Nm – busbars','Stahlwille','730/80 Service MANOSKOP','MV / HV – Heavy bolting','DIN EN ISO 6789-2','OB',1,891,'Annual (COFRAC calibration)','Official STAHLWILLE heavy-duty torque wrench page for large busbar, flange and substation bolting, with insert-tool holder for high-torque maintenance work.','https://stahlwille.com/en_us/products/detail/852072'],
  ['e15','E','MHTA','MV Voltage Detector 20-36kV','DEHN','PHE4 20 36 S','MV 20-36kV','IEC 61243-1','OB',2,1668,'Annual (mandatory calibration)','Official DEHN PHE4 product family for medium-voltage installations up to 36 kV with self-test, acoustic and visual indication. This concrete variant aligns with the displayed working range.','https://www.dehn-international.com/phe4-voltage-detector'],
  ['e16','E','MHTA','HV Voltage Detector 25kV – AC catenary','DEHN','PHE III 25 S 50 1P','HV 25kV Catenary','IEC 61243-1','OB',1,2225.9,'Annual (mandatory calibration)','Official DEHN product page for overhead contact lines of electric railways up to 25 kV / 50 Hz.','https://dehn-international.com/store/p/en-DE/F41570/phe-iii-voltage-detector'],
  ['e17','E','MHTA','MV Phase Comparator synchronism 5-36kV','DEHN','PHV1P U 5 36','MV 5-36kV','EN/IEC 61481-1','OB',1,2748.4,'Annual','Retail-listed DEHN phase comparator variant covering medium-voltage synchronism checks with a switchable nominal range up to 36 kV.','https://www.dehn-international.com/store/h/en-DE/H986/phase-comparators'],
  ['e18','P','MHTA','Three-phase Power Quality Analyser Class A','Fluke','435-II','LV / MV (via CT/VT)','IEC 61000-4-30 Class A','RC',1,7384,'Annual (calibration)','Harmonics, dips, flicker analysis. Long-term recording.','https://www.fluke.com/fr-fr/produit/analyseurs-qualite-alimentation/fluke-435-ii'],
  ['e19','P','MHTA','Digital Insulation Resistance Meter 5kV DC','Megger','MIT525','LV / MV / Cables','IEC 61557-2','OB',1,4149,'Annual (calibration)','PI, DAR, DD measurement. MV cables and substation transformers.','https://www.megger.com/fr/products/test-equipment/insulation-resistance-testers/mit525'],
  ['e20','E','MHTA','Digital Insulation Resistance Meter 10kV DC','Megger','MIT1025/2','MV 10-36kV / HV 25kV','IEC 61557-2','RC',1,4422,'Annual (calibration)','Insulation testing of MV cables and 25kV transformer windings.','https://www.megger.com/fr/products/test-equipment/insulation-resistance-testers/mit1025'],
  ['e21','P','MHTA','Micro-ohmmeter Contact Resistance 10-200A DC','Megger','DLRO10X','MV / Switchgear','IEC 62271 / IEC 60044','OB',1,4615,'Annual (calibration)','Contact resistance of circuit breakers, disconnectors, busbars.','https://www.megger.com/fr/products/test-equipment/low-resistance-ohmmeters/dlro10x'],
  ['e22','P','MHTA','Three-phase Protection Relay Test Set','Omicron','CMC 353','MV / Protection','IEC 60255 – IEC 61850','RC',1,16500,'Annual (calibration)','Three-phase current/voltage injection. Tests differential, overcurrent, distance relays. Official OMICRON page notes the CMC 353 remains available until 31/12/2026.','https://www.omicronenergy.com/fr/produits/cmc-353/'],
  ['e23','P','MHTA','CT/VT Transformer Turns Ratio + Polarity Tester','Megger','MRCT / TTR300','MV / CT-VT','IEC 60044-1 / IEC 61869','RC',1,3200,'Annual (calibration)','Turns ratio, excitation current, CT and VT polarity.','https://www.megger.com/fr/products/test-equipment/transformer-test/mrct'],
  ['e24','P','MHTA','VLF Cable Insulation Tester MV 34kV','Baur','PHG TD/VLF 34 kV','MV 10-36kV','IEC 60060-3 / NF C 33-052','RC',1,8500,'Every 2 years','In-service dielectric testing of MV cables. 0.1 Hz frequency.','https://www.baur.eu/products/vlf-testing/phg-td'],
  ['e25','E','MHTA','Clamp-on Earth Tester – Rt measurement without disconnection','Fluke','1630-2 FC','All domains – Earth network','IEC 61557-5','OB',1,2037,'Annual (calibration)','Earth resistance measurement without disconnecting electrodes. Fluke Connect WiFi.','https://www.fluke.com/fr-fr/produit/mesure-resistance-terre/fluke-1630-2-fc'],
  ['e28','P','MBTDC','Network Analyser – voltage, power, energy','Metrel','MI 2892 Power Master','DC Traction 750-1500V','IEC 61000-4-30','OB',1,2100,'Annual (calibration)','Current official Metrel product page for the MI 2892 platform, replacing the obsolete PowerQ4 Plus reference.','https://www.metrel.si/en/shop/PQA/class-a-power-quality-analysers/mi-2892.html'],
  ['e29','P','MBTDC','Stationary Battery Tester – internal impedance','Fluke','BT521 Battery Analyzer','DC Auxiliaries 24-110V','IEEE 1188 / IEC 60896','OB',1,5545,'Annual (calibration)','UPS, 24VDC, 110VDC battery diagnostics at substations.','https://www.fluke.com/fr-fr/produit/testeurs-batteries/fluke-bt521'],
  ['e30','P','MBTDC','Earth Resistance Tester 3 and 4-pole – GEO Kit','Fluke','1625-2 GEO Kit','All domains – Earthing','IEC 61557-5','OB',1,4903,'Annual (calibration)','3- and 4-probe method. Essential for substations and earth loops.','https://www.fluke.com/fr-fr/produit/mesure-resistance-terre/fluke-1625-2-geo'],
  ['e31','E','DIAG','Thermal Imaging Camera 320x240 radiometric','Fluke','TiS60+','All domains','EN 13187 / IEC 60068-2','OB',1,3812,'Annual (COFRAC)','Preventive thermographic inspection of breakers, cable terminations, busbars, auxiliaries and electrical connections.','https://www.fluke.com/fr-fr/produit/cameras-thermiques/fluke-tis60-plus'],
  ['e32','P','DIAG','Portable Oscilloscope 4-ch 200MHz CAT III','Fluke','190-204-III/S ScopeMeter','LV / DC Traction','CAT III 1000V – IP51','RC',1,5714,'Annual','Waveform analysis for drives, converters, relays.','https://www.fluke.com/fr-fr/produit/oscilloscopes/fluke-190-204-s'],
  ['e33','P','DIAG','Portable Cable Fault Locator / TDR for LV-MV diagnostics','Megger','Teleflex SX-1','LV / MV / DC Traction','TDR fault pre-location platform','RC',1,4200,'Annual','Portable two-channel TDR used to pre-locate cable faults safely and accurately before repair campaigns. Current official Megger reference, clearer and easier to find than the older PFL40B entry.','https://www.megger.com/en-us/products/teleflex-sx-1'],
  ['e34','P','DIAG','Portable EMC/HF Spectrum Analyser','Anritsu','MS2711E','All domains – EMC','IEC 61000-4 series','OP',1,6950,'Every 2 years','Harmonic disturbances, EMC, track signalling interference.','https://www.anritsu.com/fr-FR/test-measurement/products/ms2711e'],
  ['e35','E','LOTO','Portable Earthing Stick for Switchgear Installations','DEHN','ES SK 1000 / earthing stick range','MV 10-36kV','EN/IEC 61230 (DIN VDE 0683-100)','OB',2,850,'Annual (dielectric test)','Official DEHN earthing stick page for fitting portable earthing and short-circuiting devices on switchgear installations. Safer maintained alternative to the obsolete CATU earthing rod page.','https://www.dehn-international.com/store/p/en-DE/F49866/earthing-sticks-for-switchgear-installations'],
  ['e36','E','LOTO','Railway Earthing and Short-Circuiting Device 750-1500V DC','DEHN','EKV K 50 8500','DC Traction 750-1500V','EN/IEC 61230 / IEC 61138','OB',2,620,'Annual (dielectric test)','Official DEHN railway earthing and short-circuiting device page with overhead contact-line clamp and rail clamp for electrified railway work.','https://www.dehn-international.com/store/p/en-DE/F78297/earthing-and-short-circuiting-devices-for-railway-applications'],
  ['e37','E','LOTO','Portable Metal Group Lock Box – up to 13 padlocks','Brady','51171','All domains','ISO 3864 / EN 1037','OB',2,121,'Annual','Portable metal group lock box for multi-technician interventions. The previous Brady references did not match the displayed equipment type.','https://www.bradyid.com/lockout-tagout/extra-large-portable-metal-group-lock-box-pid-51171'],
  ['e38','E','CABLE','Standard Ratchet Cable Cutter for Cu/Al conductors up to 240 mm²','Knipex','95 31 250','LV / DC Traction / MT','–','OB',1,145,'Replace blades when worn','Official KNIPEX product page for clean cutting of standard copper and aluminium cables in confined spaces. This is the team baseline cutter for conventional non-armoured conductors.','https://www.knipex.com/fr-fr/produits/coupe-c%C3%A2bles/coupe-c%C3%A2bles-%C3%A0-cliquet/coupe-c%C3%A2bles-%C3%A0-cliquet/9531250'],
  ['e39','E','CABLE','High-Capacity Hydraulic Cable Cutter up to 55 mm diameter','Cembre','HT-TC055','MV 10-36kV / DC Traction','–','OB',1,3542,'Annual (inspection)','Official Cembre hydraulic cutter page for large copper, aluminium and reinforced conductors with openable head and rotating cutter head. This is the heavy-capacity team cutter when manual ratchet capacity is no longer sufficient.','https://products.cembre.com/en_US/usa-canada-mexico/product/ht-tc055'],
  ['e41','E','CABLE','Ratchet Crimping Tool small sections 0.5-16mm²','Weidmuller','PZ 6 Roto','LV / DC – Control circuits 24-110V','EN 60947-7 / DIN 46228','OB',2,155,'Replace when worn','Crimping ferrules and lugs for control circuits. Anti-return ratchet.','https://www.weidmueller.com/fr/products/tools/crimping-tools/pz-6-roto'],
  ['e43','E','CABLE','MV Cable Joint / Sealing Kit – heat-shrink type up to 36 kV','Raychem RPG','Heat Shrink Medium Voltage Joints','MV 10-36kV / DC Traction','IEC 60502-4 / HD 620','OB',1,220,'Consumable','Heat-shrink medium-voltage jointing and sealing kit used after cable repair, jointing or termination work to restore insulation, screen continuity and moisture protection. Replaces the inaccessible generic nVent category link with a directly accessible official product page.','https://www.raychemrpg.com/reliable-connections/power-cable-accessories/medium-voltage-joints-terminations/heat-shrink-medium-voltage-joints/heat-shrink-medium-voltage-joints'],
  ['e50','E','CABLE','LV Cable Joint / Sealing Kit – heat-shrink type up to 1.1 kV','Raychem RPG','Heat Shrink Low Voltage Joints','LV power / auxiliaries / control cables','EN 50393 / IS 13573-1','OB',2,65,'Consumable','Heat-shrink low-voltage jointing and sealing kit for straight or branch cable repairs up to 1.1 kV. Suitable for PVC, rubber and XLPE cables where insulation restoration and moisture sealing are required after damage or modification work.','https://www.raychemrpg.com/reliable-connections/power-cable-accessories/low-voltage-joints-terminations/heat-shrink-low-voltage-joints/heat-shrink-low-voltage-joints'],
  ['e44','E','COLLECTIF','Portable Inverter Generator 3.2 kW – 230V silent','Honda','EU32i','LV Auxiliaries','EN 12601','RC',1,4169,'Annual (oil change + service)','Current official Honda portable inverter generator page. Compact, quiet and easier to source than the discontinued EU30i reference.','https://shop.honda.fr/p/groupe-eu-32-ik-3200w/15323020/'],
  ['e45','E','COLLECTIF','Site Barrier + Red/White Delimitation Kit','Novap','1320147 + 3055009','All domains – Track safety','NF EN ISO 7010','OB',2,280,'Annual (inspection)','Directly sourceable Novap combination for local worksite delimitation: telescopic red/white barrier with matching red/white site tape.','https://www.novap.fr/poteaux-barrieres/barrieres/barrieres-telescopiques/barriere-telescopique-de-1-a-1-80-m-blanche-rouge-blanc-hachure-type-k2.html'],
  ['e46','E','COLLECTIF','Professional First Aid Case DIN 13169','SÖHNGEN','DYNAMIC-GLOW L 0301401','All domains','DIN 13169','OB',1,339,'6 months (expiry check)','Official SÖHNGEN first aid case page with DIN 13169 filling, wall holder and splash-protected case for vehicles and workshops.','https://shop.aluderm.de/erste-hilfe-koffer-orange-dynamic-glow-l-ind-norm-plus-din-13169'],
  ['e47','E','COLLECTIF','CO2 Extinguisher 5kg – class B electrical cabinets','GLORIA','KS 5 ST','All domains','EN 3','OB',1,140,'Annual (pressure check)','Official GLORIA CO2 extinguisher page listing 5 kg models suitable for electrical equipment and residue-free firefighting.','https://www.gloria.de/de/produkt/feuerloescher/co2-handhebel/'],
  ['e48','E','COLLECTIF','Rugged Laptop Toughbook 55 Series','Panasonic','TOUGHBOOK 55 mk3','All domains – Diagnostics','IP53 – MIL-STD-810H','RC',1,2595,'5-year replacement','Current official Panasonic Connect page for the Toughbook 55 platform used for IEC 61850 relay connection, SCADA and drive diagnostics. Entry aligned to a current base mk3 market configuration.','https://eu.connect.panasonic.com/de/en/products/toughbook/toughbook-55-series'],
  ['e49','E','OUTILS','Open-end / Ring Wrench Set 6-34 mm – 25 pcs','Facom','440.JE25','All domains – heavy bolting','NF ISO 1711-1 / NF ISO 691 / NF ISO 7738','RC',1,305,'Replace when worn','Current official FACOM large-range set covering the heavier fastening sizes that are not practical to carry at technician level. Suitable as the team-level wrench base for cabinets, supports and heavier mechanical interfaces.','https://www.facom.com/product/440je25/6mm-34mm-combination-wrench-set-25-pc'],
  ['e51','E','OUTILS','Maintenance Pliers Set – cutting, combination, long-nose, multigrip','Facom','CPE.A4','All domains – team hand tools','ISO 5746 / ISO 5748 / ISO 8976','OB',1,145,'Replace when worn','Official FACOM 4-piece maintenance plier set including combination pliers, diagonal cutters, half-round long-nose pliers and locking multigrip pliers. Good team-level complement to the insulated technician kit when broader mechanical handling and gripping are needed.','https://www.facom.com/product/cpea4/maintenance-plier-set-4-pc'],
  ['e52','E','COLLECTIF','Maintenance Access Platform / PIR 8 steps - indoor work up to about 3.8 m','Tubesca-Comabi','Sherpamatic Fixe 8 marches (02272158)','Indoor substation / technical rooms','EN 131-7 / PIR-PIRL / Decree 2004-924','RC',1,1043.4,'Annual (inspection)','Secure maintenance access platform with guardrail, stabilisers and wide treads for indoor elevated work in substations, technical rooms and equipment spaces. Added as a safer team-level access solution than a generic domestic stepladder when technicians need stable repeated access above cabinets or cable routes.','https://www.tubesca-comabi.com/fr/sherpamatic-fixe'],
  ['e53','E','COLLECTIF','Antistatic Industrial Vacuum Cleaner for electrical cabinets and panels','Karcher','NT 30/1 Tact Te M','Substations / switchboards / electrical rooms','Dust class M / antistatic system','OB',1,659,'Annual (inspection + filter replacement)','Professional vacuum cleaner with antistatic system and conductive accessories for controlled cleaning of electrical cabinets, LV panels and technical rooms. Added to favour dust extraction in de-energised equipment instead of uncontrolled blowing that would redistribute conductive dust.','https://www.kaercher.com/int/professional/vacuums/wet-and-dry-vacuum-cleaners/safety-vacuum-cleaners/nt-30-1-tact-te-m-11482350.html'],
  ],
  PSD: [
  ['t01','T','MBTDC','TRMS Multimeter CAT III 600V','Fluke','117','PSD control panels','CAT III 600V','OB',1,349,'Annual (calibration)','Daily diagnostic multimeter for PSD control panels, door circuits and live troubleshooting on 24VDC, 48VDC and 110VAC auxiliaries.','https://www.fluke.com/fr-fr/produit/multimetres/multimetres-numeriques/fluke-117'],
  ['t02','T','PPE','Safety Glasses anti-scratch anti-fog','Bolle Safety','Cobra COBPSI','Platform and technical rooms','EN 166 / EN 170','OB',1,22,'1 year or if scratched','Eye protection during all PSD interventions, including guide rail work, spring handling and glass-panel operations.','https://www.bollesafety.com/en-int/sport/cobra'],
  ['t03','T','PPE','Safety Helmet with chin strap','JSP Safety','EVO3 REV AJF170','Platform and technical rooms','EN 397','OB',1,55,'3 years','Head protection under header beams, overhead cable runs and during panel extraction.','https://www.jspsafety.com/en-gb/products/head-protection/helmets/evo3-revolution/'],
  ['t04','T','SAFETY','Rechargeable Headlamp 625 lm','Petzl','ACTIK CORE','Technical rooms and confined access','-','OB',1,55,'Annual (battery check)','Hands-free lighting for technical rooms, below-platform inspections and work inside header cavities.','https://www.petzl.com/US/en/Sport/Headlamps/ACTIK-CORE'],
  ['t05','T','PPE','Hi-visibility Vest Class 2','Seton','CPS4375052','Platform work zones','EN ISO 20471 Class 2','OB',1,9.9,'2 years','Mandatory visibility PPE during service windows and platform-side interventions.','https://www.seton.fr/gilet-securite-haute-visibilite-2-ceintures.html'],
  ['t06','T','LOTO','Personal LOTO Kit','Brady','65674 Personal LOTO Kit','PSD local control boxes','Lockout Tagout','OB',1,58,'Annual (inspection)','Individual lockout of PSD local control boxes, UPS isolators and local breakers before maintenance.','https://www.bradyid.eu/en-eu/lockout-tagout/personal-lockout-kits/65674'],
  ['t07','T','LOTO','Lockout Padlock keyed different - red','Master Lock','S410RED','PSD local control boxes','Lockout Tagout','OB',2,16,'5 years','Individual keyed-different safety padlocks carried by each PSD technician.','https://www.masterlock.eu/products/padlocks/safety-lockout-padlocks/S410RED'],
  ['t08','T','SAFETY','VDE 1000V Insulated Screwdriver Set - 7 pcs','Wiha','36295 SoftFinish VDE','PSD control wiring','IEC 60900','OB',1,78,'Annual (visual)','Insulated screwdrivers for terminal covers, connectors, fuse holders and protected electrical work.','https://www.wiha.com/eu/en/products/screwdrivers/vde-screwdrivers/softfinish-vde-set-in-a-roll/36295/'],
  ['t09','T','SAFETY','VDE 1000V Insulated Pliers Set - 5 pcs','Knipex','00 20 12 VDE','PSD control wiring','IEC 60900','OB',1,145,'Annual (visual)','Insulated pliers set for cutting, shaping and handling control wiring and terminals.','https://www.knipex.com/en/products/002012'],
  ['t10','T','OUTILS','Ratchet Set 1/4 and 3/8 metric - 40 pcs','Wera','9100 SB RA','Door hardware and fixings','-','OB',1,100,'Replace when worn','Daily fastening and removal of operator bolts, guide rail fixings and header hardware.','https://www.wera.de/en/products/sets/ratchet-sets/kollektion-9100-sb-ra/'],
  ['t11','T','OUTILS','Hex Key Set metric 1.5-10mm - 18 pcs','Wiha','352 SB 18 T-handle','Door operators and brackets','-','OB',1,42,'Replace when worn','Long-reach hex keys for recessed fasteners on operator cassettes, brackets and shims.','https://www.wiha.com/eu/en/products/hex-tools-and-keys/hex-keys/hex-key-set-in-a-staple-with-t-handle-18-pcs/352sb18/'],
  ['t12','T','OUTILS','Individual Tool Bag with shoulder strap','Knipex','00 21 02 LE Tool Bag Classic','Technician carry solution','-','OB',1,132,'Replace if worn','Personal carry bag for daily PSD hand tools and test instruments.','https://www.knipex.com/products/tool-bags-and-tool-cases/tool-bag-classic-empty/tool-bag-classic-empty/002102LE'],
  ['t13','T','OUTILS','Soft-face Mallet 50 mm with nylon tips','Facom Expert','E150304','Mechanical fitting work','-','RC',1,46,'5 years','Soft-face mallet used for gentle seating of guides, seals, threshold profiles and cassettes without damaging painted or glazed surfaces.','https://www.facom.fr/products/e150304-massettes-a-embouts-interchangeables'],
  ['t14','T','OUTILS','Feeler Gauge Set 0.05-1.00 mm','Mitutoyo','188-101','Door geometry checks','-','OB',1,28,'10 years','Measures clearances, play, engagement depth and geometry settings on PSD doors.','https://shop.mitutoyo.eu/web/mitutoyo/en_GB/mitutoyo/01.05.01/Straight%20Feeler%20Gauge/188-101/$catalogue/mitutoyoData/PR/188-101/index.xhtml'],
  ['t15','T','OUTILS','Telescopic Magnetic Pick-up Tool','Stahlwille','12601','Header cavities and thresholds','-','RC',1,14,'5 years','Retrieves dropped screws, nuts and springs inside difficult PSD cavities.','https://stahlwille.com/en_us/products/detail/826592'],
  ['t16','T','OUTILS','Telescopic Inspection Mirror 360°','Gedore','718 / 1979841','Hidden inspection points','-','OB',1,22,'5 years','Used to inspect hidden PSD points such as lock-bolt engagement, upper guide rollers, cable routing, sensor brackets and fasteners inside header zones without removing all covers or dismantling the operator cassette.','https://www.gedore.com/en-de/products/measuring---marking---testing-tools/test-tools/mirror/718-inspection-mirror/718---1979841'],
  ['t17','T','OUTILS','Dry PTFE Lubricant Spray 400 ml','WD-40','Specialist PTFE Lubricant 300013','Guides, latches and moving parts','-','OB',2,12,'Consumable','Dry PTFE lubricant for guides, latch pins, rolling mechanisms and friction points where dust retention must be limited.','https://uk.rs-online.com/web/p/lubricants/0382306/'],
  ['t18','T','OUTILS','Silicone Spray 500 ml','Wurth','0893 221','Seals and gaskets','-','OB',1,9,'Consumable','Seal conditioner and lubricant for rubber seals, gaskets and flexible wipers.','https://eshop.wurth.co.uk/Product-categories/Silicon-spray/31083007150102.cyid/3108.cgid/en/GB/GBP/'],
  ['t19','T','OUTILS','Microfibre Cloths + Glass Cleaner Kit','Wurth','Professional Glass Cleaner + cloths','Glass panels and optical sensors','-','OB',2,14,'Consumable','Cleaning kit for glass panels, optical sensors and emitter lenses to prevent false obstruction faults.','https://www.wurth.co.uk/glass-cleaner'],
  ['t20','T','SAFETY','Two-pole Voltage and Continuity Tester','Fluke','T150','PSD cabinets and proving dead','IEC/EN 61243-3','OB',1,191,'Annual (calibration)','Formal bipolar absence-of-voltage tester used before opening cabinets or proving circuits dead.','https://www.fluke.com/en/product/electrical-testing/basic-testers/fluke-t90-t110-t130-t150'],
  ['t21','T','OUTILS','Automatic Wire Stripper 0.2-6.0 mm2','JOKARI','SECURA 2K 20100','Control wiring preparation','-','OB',1,38.66,'Annual (visual / blade condition)','Used to strip insulation cleanly on small PSD control conductors before reconnection to terminals, connector replacement, sensor rewiring or local harness repair. Not intended for outer-sheath removal or crimping.','https://jokari.de/en/SECURA-2K-2.htm'],
  ['t22','T','PPE','Safety Shoes S3 ESD SRC mid-cut','PUMA Safety','KRYPTON MID 634200','Platform and technical rooms','EN ISO 20345 - S3 ESD SRC','OB',1,119.39,'2 years or replace when worn','Mid-cut safety footwear for platform walking, technical room access, threshold work and daily PSD interventions where toe protection, grip and ESD-compatible footwear are required.','https://www.puma-safety.com/eu/de/maenner/schuhe/sicherheitsschuhe/sicherheitsschuhe-s3/231/krypton-mid-puma-safety-sicherheitsschuhe-s3-esd'],
  ['t23','T','PPE','Hi-visibility Work Trousers Class 2','Portwest','PW340','Platform, concourse and technical-room work','EN ISO 20471 Class 2','OB',1,79,'2 years or replace when worn','Base hi-vis lower-body PPE for daily PSD maintenance on platforms, concourses and technical access routes where technician visibility must be maintained during service windows.','https://www.lyreco.com/webshop/FRCH/pantalon-haute-visibilite-portwest-pw340-classe-2-orange-noir-taille-58-product-000000000016482764.html'],
  ['t24','T','PPE','Hi-visibility Short-sleeve Work Polo Class 2','Portwest','RT22','Platform and technical rooms','EN ISO 20471 Class 2','OB',1,24,'1 year or replace when faded','Base high-visibility upper-body workwear for daily PSD operations in warm conditions, replacing the need to rely only on a vest during routine interventions.','https://www.hiviskings.com/portwest-rt22-class-2-hi-vis-safety-polo-rt22'],
  ['t25','T','PPE','Hi-visibility Winter Bomber Jacket Class 3','Portwest','C465','Platform and exposed access areas','EN ISO 20471 Class 3 – EN 343','OB',1,69,'3 years or replace when damaged','Winter outer layer for PSD teams working on exposed platforms, station interfaces and cold technical areas where warmth and maximum visibility are both needed.','https://www.lyreco.com/webshop/FRLU/veste-bomber-hi-vis-portwest-c465-orange-bleu-marine-taille-m-la-piece-product-000000000007875167.html'],

  ['e01','E','COLLECTIF','Safety Barrier Kit - 2 retractable posts with 5 m belt','Novap','2019866','Platform zoning','-','OB',2,348.28,'Annual (inspection)','Safe exclusion-zone kit for platform work areas during PSD maintenance service windows.','https://www.novap.fr/kit-2-poteaux-a-sangles-alu-noir-sur-socle-leste-10kg-avec-tete-a-sangle-rouge-5m-x-50mm-et-tete-receptrice-2019866.html'],
  ['e02','E','CABLE','Portable Cable Label Printer P-touch Bluetooth','Brother','PT-E310BTVP','Cables, terminals and cabinets','–','RC',1,227,'Battery replacement','Portable industrial label printer used after PSD corrective work to restore cable, terminal and cabinet identification. Shared team asset for relabelling after rewiring, fuse replacement or control-box modifications.','https://store.brother.fr/appareils/imprimantes-d-etiquettes/p-touch/pt/pte310btvp'],
  ['e03','E','DIAG','Wireless Door Closing Force System','PCE / DriveTest','BIA-600 BT System','Door safety compliance','EN 14752','OB',1,4505,'Annual (ISO calibration + certificate)','Team standard for PSD closing-force campaigns and post-repair safety verification with PinchPilot reporting.','https://www.pce-instruments.com/english/measuring-instruments/test-meters/closing-force-measuring-device-pce-instruments-closing-force-measuring-device-bia-600-bt-for-rail-vehicle-doors-sliding-steps-det_6126436.htm'],
  ['e04','E','DIAG','Sonic Belt Tension Meter','Gates','Sonic Tension Meter 550C','Timing belt drives','-','RC',1,680,'Annual','Non-contact belt-tension measurement for PSD operator belt drives.','https://www.gates.com/en_us/maintenance-tools/belt-maintenance/sonic-tension-meter.html'],
  ['e05','E','DIAG','Laser Line Level 3x360 self-levelling','Bosch Professional','GLL 3-80 (0601063S00)','Alignment campaigns','IP54','OP',1,359.14,'Annual','Alignment verification of panels, header beam and facade geometry after installation or replacement work.','https://www.bosch-professional.com/gb/en/products/gll-3-80-0601063S00.html'],
  ['e06','P','DIAG','Thermal Imaging Camera 320x240 radiometric','Fluke','TiS60+','Preventive diagnostics','-','RC',1,3812,'Annual (COFRAC)','Thermographic inspection of operator motors, PCB hotspots and poor electrical connections.','https://www.fluke.com/fr-fr/produit/cameras-thermiques/fluke-tis60-plus'],
  ['e08','E','DIAG','Digital Tachometer contact / non-contact','Shimpo','DT-205LR-S12','Motor speed checks','-','RC',1,531.87,'Annual','Checks operator motor speed, pulley speed and deviation against programmed profiles.','https://www.raptorsupplies.es/c/tachometers'],
  ['e09','E','COLLECTIF','Vacuum Suction Lifter 3-cup lever - 100 kg','Bohle Group','Veribor BO603.021','Glass panel replacement','-','OB',2,79.91,'Annual (seal + pressure test)','Safe lifting tool for laminated tempered PSD glass panels during replacement.','https://www.bohle.com/ee-EN/Veribor-Aluminium-Suction-Lifter-3-Cup/BO603.021'],
  ['e10','E','COLLECTIF','Glass Transport Trolley with integrated suction lifter','Bohle Group','Veribor BO680.0','Glass panel transport','-','RC',1,540.5,'Annual (inspection)','Controlled transport of replacement glass panels from storage to installation point.','https://www.bohle.com/fr-FR/Chariot-de-transport-Veribor-avec-ventouse-integree/BO680.0'],
  ['e11','E','DIAG','Rugged Laptop Toughbook 55 Series','Panasonic','TOUGHBOOK 55 mk3','PSD software diagnostics','IP53 – MIL-STD-810H','OB',2,2595,'5-year replacement','Shared diagnostic computer for PSD monitoring systems, parameter adjustment, alarm history, firmware workflows and vendor maintenance software.','https://eu.connect.panasonic.com/de/en/products/toughbook/toughbook-55-series'],
  ['e12','E','COLLECTIF','Mobile Workshop Roller Cabinet 6 drawers','Beta Tools','RSC24A/6','Team storage and mobile workshop support','-','OB',1,669,'Replace when worn','Shared team roller cabinet with drawers for storing PSD tools, calibrated instruments, consumables and work-front equipment in a more usable workshop format than a simple carry chest.','https://www.beta-tools.com/en/mobile-roller-cab-with-6-drawers-with-anti-tilt-system.html'],
  ['e13','E','OUTILS','Torque Wrench 5-25 Nm with removable ratchet','Facom','R.306A25','Fine bolting','ISO 6789 Class II','OB',1,155,'Annual (COFRAC)','Controlled torque on panel fixings, LCB hardware and brackets where a low-to-medium traceable tightening range is required.','https://www.facom.com/GLOBALBOM/XJ/E.306A200S/1/Instruction_Manual/EN/E.306_T1_EUR.pdf'],
  ['e14','P','OUTILS','Mechanical Torque Wrench with display 40-200 Nm and 14x18 insert mount','Facom','S.307A200','Heavy bolting','ISO 6789 Class II','RC',1,389,'Annual (COFRAC calibration)','Useful depot or project-level torque wrench for higher-load PSD work on header beams, floor anchors and large cassette hardware when controlled tightening is needed without angle mode or digital traceability.','https://www.facom.com/product/s307a200/12-digi-cal-mechanical-torque-wrench-removable-ratchet-attachment-14-x-18-range-40-200nm'],
  ['e15','E','LOTO','Group LOTO Kit with hasp and 4 team padlocks','Master Lock','416 + S410RED x4','Multi-technician isolation','Lockout Tagout','OB',2,92,'Annual (inspection)','Shared group lockout kit built around one aluminium safety hasp and four keyed-different team padlocks for multi-technician isolation on PSD zones and control panels.','https://shop.masterlock.eu/products/416'],
  ['e16','E','OUTILS','Team Drill/Driver 18V for corrective maintenance','Bosch','GSR 18V-55 Professional','Corrective maintenance and fitting','-','OB',1,317,'Replace if defective','Shared drill/driver for panel fixings, brackets, covers and rapid corrective work during service windows. Use it as the team-level cordless drill/driver platform aligned with the POS technician reference, but shared rather than individually issued.','https://www.bosch-professional.com/fr/fr/products/gsr-18v-55-06019H5200'],
  ['e17','E','MBTDC','Portable Insulation Tester 500V/1000V','Fluke','1507 Insulation Tester','Facade wiring and motors','IEC 61557-2 – CAT IV 600V','OB',1,699,'Annual (calibration)','Team insulation testing of PSD facade wiring, motor windings and cable harness integrity before re-energisation or after corrective work.','https://www.fluke.com/fr-fr/produit/testeurs-isolement/fluke-1507'],
  ['e18','E','COLLECTIF','Antistatic Industrial Vacuum Cleaner for electrical cabinets and panels','Karcher','NT 30/1 Tact Te M','Electrical cabinets / PSD enclosures / technical rooms','Dust class M / antistatic system','OB',1,659,'Annual (inspection + filter replacement)','Shared PSD vacuum cleaner with antistatic system and conductive accessories for controlled cleaning of controller cabinets, encoder zones and dusty enclosures while equipment is de-energised.','https://www.kaercher.com/int/professional/vacuums/wet-and-dry-vacuum-cleaners/safety-vacuum-cleaners/nt-30-1-tact-te-m-11482350.html'],
  ['e19','E','COLLECTIF','Maintenance Access Platform / PIR 8 steps - indoor work up to about 3.8 m','Tubesca-Comabi','Sherpamatic Fixe 8 marches (02272158)','PSD header beam / upper sensors / cable routes','EN 131-7 / PIR-PIRL / Decree 2004-924','OB',1,1043.4,'Annual (inspection)','Safe elevated access platform for PSD header beams, upper sensors, cable routes and fascia elements when stable repeated work at height is needed with guardrails and a larger standing area than a simple stepladder.','https://www.tubesca-comabi.com/fr/sherpamatic-fixe'],
  ['e20','E','MBTDC','TRMS AC/DC Clamp Meter 1000A with iFlex','Fluke','376 FC','Advanced current diagnostics / PSD power circuits','CAT IV 600V - CAT III 1000V','RC',1,703,'Annual (calibration)','Shared advanced current-diagnostic clamp meter for PSD teams, especially on inaccessible conductors, overload investigations and current confirmation on door power/control circuits.','https://www.fluke.com/fr-fr/produit/mesure-courant/pinces-amperemetriques/fluke-376-fc'],
  ],
  CAT: [],
  TRACK: [],
  '3RD': [],
  AFC: [],
  DEQ: [
  ['t01','T','MBTDC','TRMS Multimeter CAT III 600V with NCV','Fluke','117','Depot electrical troubleshooting','CAT III 600V','OB',1,349,'Annual','Baseline DEQ multimeter for depot equipment, switchboards, PLC supplies and motor checks.','https://www.fluke.com/fr-fr/produit/multimetres/multimetres-numeriques/fluke-117'],
  ['t02','T','PPE','Handling Gloves with nitrile foam coating','Ansell','HyFlex 11-840','General depot handling and maintenance','Replace when worn','OB',1,5.41,'1 year or replace when worn','General-purpose handling gloves for mechanical maintenance, parts handling, oily components and day-to-day depot work on DEQ equipment. Electrical insulating gloves can be borrowed from another subsystem when a specific LV intervention requires them.','https://www.ansell.com/us/en/products/hyflex-11-840'],
  ['t03','T','PPE','Safety Goggles anti-splash anti-fog EN166','Bolle Safety','Cobra COBPSI','Workshop and wash-plant work','N/A','OB',1,22,'1 year or if scratched','Daily eye protection for cleaning, draining, abrasive work and chemical handling in the depot.','https://www.bollesafety.com/fr/lunettes-de-securite/cobra'],
  ['t04','T','PPE','Safety Helmet with chin strap Class E EN 397','JSP','EVO3 REV AJF170','Workshop and pit access','N/A','OB',1,55,'3 years','Head protection for overhead crane zones, pits, lifting-column work and moving equipment areas.','https://www.jspsafety.com/en-gb/products/head-protection/helmets/evo3-revolution/'],
  ['t05','T','PPE','Safety Shoes S3 ESD SRC mid-cut','PUMA Safety','KRYPTON MID 634200','Depot workshop circulation','N/A','OB',1,119.39,'2 years or replace when worn','Base safety footwear for oily floors, pits, forklift areas and daily depot interventions.','https://www.puma-safety.com/eu/de/maenner/schuhe/sicherheitsschuhe/sicherheitsschuhe-s3/231/krypton-mid-puma-safety-sicherheitsschuhe-s3-esd'],
  ['t06','T','PPE','Hi-visibility Vest Class 2','Seton','CPS4375052','Depot traffic and handling areas','N/A','OB',1,9.9,'2 years','Technician visibility PPE when moving around rail vehicles, forklifts and yard-adjacent zones.','https://www.seton.fr/gilet-securite-haute-visibilite-2-ceintures.html'],
  ['t07','T','LOTO','Personal LOTO Kit with padlock, hasp and labels','Brady','65674 Personal LOTO Kit','Personal isolation','Annual (inspection)','OB',1,58,'10 years','Personal isolation kit for compressor, wheel lathe, crane and lifting-column interventions.','https://www.bradyid.eu/en-eu/lockout-tagout/personal-lockout-kits/65674'],
  ['t08','T','PPE','Reinforced Work Trousers with knee pads','Portwest','T801 KX3','Depot workshop clothing','Annual (renewal)','OB',1,72,'1 year','Base depot workwear for pit access, kneeling work and rough maintenance tasks.','https://portwest.com/products/view/T801/MGR'],
  ['t09','T','PPE','Technical Work Sweatshirt / Mid-layer','Portwest','KX377','Depot workshop clothing','Annual (renewal)','RC',1,45,'1 year','Mid-layer workwear for semi-heated workshops and exposed maintenance points.','https://www.portwest.com/products/view/KX377/MGR'],
  ['t10','T','PPE','Hi-visibility Winter Bomber Jacket Class 3','Portwest','C465','Outdoor and open-depot work','Annual (renewal)','OB',1,69,'2 years','Winter visibility and weather protection for open or semi-open depot work.','https://www.lyreco.com/webshop/FRLU/veste-bomber-hi-vis-portwest-c465-orange-bleu-marine-taille-m-la-piece-product-000000000007875167.html'],
  ['t11','T','PPE','FFP2 Respirator Mask box of 20','3M / RS Components','8822 FFP2 box x20','Dust and aerosol exposure','N/A (consumable)','RC',1,32,'N/A','Respiratory protection for grinding dust, cleaning, solvent aerosols and confined-space spot tasks.','https://uk.rs-online.com/web/c/safety-security/personal-protective-equipment/disposable-face-masks/'],
  ['t12','T','OUTILS','Open-end / Ring Wrench Set 6-34 mm - 25 pcs','Facom','440.JE25','General mechanical maintenance','Replace if worn','OB',1,305,'10 years','Main technician spanner base for compressor, wash plant, crane and forklift hardware.','https://www.facom.com/product/440je25/6mm-34mm-combination-wrench-set-25-pc'],
  ['t13','E','OUTILS','3/8 Ratchet Socket Set 7-24 mm - 24 pcs','Facom','J.161-4P12','General mechanical maintenance','Replace if worn','OB',1,306,'10 years','Shared team socket set for covers, motor mounts, flanges and standard depot mechanical work.','https://www.facom.com/product/j161-4p12/38-socket-set-24-pieces-mbox-performance-round-head-ratchet'],
  ['t36','E','OUTILS','1/2 Ratchet Socket Set 8-34 mm - 30 pcs','Facom','S.161-5P6','General mechanical maintenance','Replace if worn','OB',1,309,'10 years','Shared team socket set for heavier DEQ hardware where a 1/2 inch drive and larger metric sizes are required.','https://www.facom.com/product/s161-5p6/12-socket-set-mbox-performance-round-head-ratchet-30-pc'],
  ['t14','T','SAFETY','VDE 1000V Insulated Screwdriver Set 7 pcs','Wiha','36295 SoftFinish VDE Set','LV controls and terminals','Annual (visual)','OB',1,78,'10 years','Daily insulated screwdriver set for PLC, terminals, fuses and LV cabinet work.','https://www.wiha.com/fr-fr/outillage/tournevis/tournevis-vde/softfinish-vde/36295'],
  ['t15','T','SAFETY','VDE 1000V Insulated Pliers Set 5 pcs','Knipex','00 20 12 VDE','LV controls and wiring','Annual (visual)','OB',1,145,'10 years','Insulated plier set for electrical troubleshooting and small wiring work on DEQ assets.','https://www.knipex.com/en/products/002012'],
  ['t16','T','OUTILS','Hex Key Set metric 1.5-10mm - 18 pcs','Wiha','352 SB 18 T-handle','General mechanical maintenance','Replace when worn','OB',1,42,'10 years','Long-reach T-handle hex keys for compressor guards, lathe guides, lifting-column brackets and recessed DEQ mechanical fasteners. Larger mechanical work remains covered by the shared team socket sets.','https://www.wiha.com/eu/en/products/hex-tools-and-keys/hex-keys/hex-key-set-in-a-staple-with-t-handle-18-pcs/352sb18/'],
  ['t17','T','OUTILS','Soft-face Mallet 50 mm with nylon tips','Facom Expert','E150304','Mechanical fitting work','Replace if worn','RC',1,46,'5 years','Soft-face mallet used for gentle seating of compressor guards, lathe covers, lifting-column parts and other DEQ components without damaging painted or machined surfaces.','https://www.facom.fr/products/e150304-massettes-a-embouts-interchangeables'],
  ['t18','T','OUTILS','Individual Tool Bag with shoulder strap','Knipex','00 21 02 LE Tool Bag Classic','Technician carry solution','Replace if worn','OB',1,132,'7 years','Personal carry bag for the DEQ technician kit between depot assets.','https://www.knipex.com/products/tool-bags-and-tool-cases/tool-bag-classic-empty/tool-bag-classic-empty/002102LE'],
  ['t19','T','OUTILS','Adjustable Wrench 300 mm','Facom','113A.12C','General mechanical maintenance','Replace if worn','RC',1,35,'10 years','Useful for non-standard fittings, plumbing and unexpected maintenance situations.','https://www.facom.com/product/113a12c/12-metal-adjustable-wrench'],
  ['t20','T','OUTILS','Pin Punch Set 9 pcs','Facom','251A.JT9','Mechanical extraction work','Replace if worn','RC',1,116.56,'10 years','For removing keys, pins, articulation hardware and seized mechanical retainers during DEQ mechanical maintenance.','https://www.facom.com/product/251ajt9/pin-punch-set-9-pieces-roll-set'],
  ['t21','E','OUTILS','Precision Circlip Pliers Set 6 pcs with foam tray','Knipex','00 20 01 V02','Bearing and retention work','Replace if worn','RC',1,154.38,'10 years','Shared circlip plier set for compressor, crane, forklift and wheel-lathe bearing work where internal and external retaining rings must be handled cleanly.','https://www.knipex.com/products/tool-kits/pliers-sets-in-a-foam-tray/pliers-sets-foam-tray/002001V02'],
  ['t22','E','OUTILS','Cr-Mo Impact Socket Set 1/2 8-36 mm - 34 pcs','VEVOR','SS217834A','Impact bolting support','Replace if worn','RC',1,91,'10 years','Shared 1/2 inch impact socket set for compressors, wash plant hardware, forklift maintenance and general depot bolting with pneumatic or battery impact tools.','https://www.vevor.fr/ensemble-de-douilles-d-impact-c_10805/vevor-jeu-de-douilles-a-chocs-34-pieces-6-points-embout-d-entrainement-1-2-pouces-kit-d-outils-a-cliquet-etui-p_010475340266'],
  ['t37','P','OUTILS','Cr-Mo Impact Socket Set 3/4 19-42 mm - 20 pcs','Facom','NK.500E','Heavy impact bolting support','Replace if worn','RC',1,731.36,'10 years','Project/depot heavy-duty 3/4 inch impact socket set for lifting columns, crane hardware, large structural bolts and other high-torque DEQ work not required in daily technician rounds.','https://www.facom.com/product/nk500e/34-impact-socket-set'],
  ['t23','T','OUTILS','Bearing Puller 2 or 3-jaw 180 mm','Facom','U.306-180','Mechanical extraction work','Replace if worn','RC',1,165,'10 years','Universal 2 or 3-jaw puller for removing bearings, pulleys, gears and hubs during DEQ mechanical maintenance.','https://www.facom.com/product/u306-180/u306-pullers-external-grip'],
  ['t24','T','OUTILS','Wire Rope Lubricant Aerosol 300 ml','Interflon','Fin Grease aerosol','Overhead crane rope maintenance','N/A (consumable)','RC',2,18,'N/A','Penetrating lubricant for overhead crane ropes to reduce corrosion and wear.','https://interflon.com/products/interflon-fin-grease-aerosol'],
  ['t25','E','OUTILS','Pneumatic Grease Gun 500 cc','Lincoln Industrial','1162','Lubrication rounds','Annual (inspection)','OB',1,95,'7 years','Shared lubrication gun for bearings, pivots, gears and routine PM tasks across depot equipment.','https://www.skf.com/group/products/lubrication/lubrication-tools/grease-guns/'],
  ['t26','E','OUTILS','Electric Vane Oil Pump 230V 30 L/min','Pressol','23 301','Fluid service work','Annual (inspection)','RC',1,185,'7 years','Shared fluid-service pump for oil transfer and drain operations on compressors, forklifts and rail-road vehicles.','https://www.pressol.com/TBGPortalService/data/items/6871448/print?categoryId=34041&imageView=Y&language=US&organizationId=83'],
  ['t27','E','OUTILS','Waste Oil Drain 30 L','Draper','11325','Fluid service work','Replace if worn','OB',2,128,'7 years','Shared wheel-mounted waste oil drain for clean gravity draining of engine, gearbox and hydraulic oils during depot maintenance operations.','https://www.drapertools.com/product/11325/waste-oil-drain-30l/'],
  ['t28','E','OUTILS','Manual Fluid Extractor 8 L','EWK','EB0317','Fluid service work','Annual (inspection)','RC',1,100,'7 years','Shared manual fluid extractor for engine oil, transmission oil and similar workshop fluids when drain plugs are inaccessible or extraction through a dipstick tube is preferred.','https://www.ewktool.com/products/eb0317-8l-heavy-duty-manual-oil-extractor'],
  ['t29','T','OUTILS','Low-profile Oil Drip Tray 15 L','Sealey','DRPL15','Low-clearance drain work','Replace if worn','OB',1,27,'5 years','Low-profile drip tray for vehicles and underside access in pits where fluid recovery needs a shallow tray footprint.','https://www.sealey.co.uk/low-profile-oil-drip-tray-15l-drpl15/'],
  ['t30','T','OUTILS','Magnetic Sump Plug Key Set','Laser Tools','6652 Magnetic Sump Plug Key Set','Drain-plug service','Replace if worn','RC',1,25.46,'7 years','Drain-plug service kit for compressors, forklifts and rail-road vehicles.','https://www.lasertools.co.uk/Product/6652/Magnetic-Sump-Plug-Key-Set'],
  ['t31','T','OUTILS','Oil Filter Remover Set strap plus self-gripping wrench','Facom','U.46 + D.151A','Filter service work','Replace if worn','RC',1,69,'10 years','For removing threaded oil filters on compressors, vehicles and hydraulic equipment using a strap wrench and a self-gripping wrench for different filter diameters and access conditions.','https://www.facom.fr/products/u-46-cle-a-sangle-reglable-pour-filtres-a-huile-voiture'],
  ['t32','T','OUTILS','Flexible Funnel with filter and anti-spill spout','Laser Tools','1011','Clean fluid filling','Replace if worn','OB',1,23,'3 years','Flexible filtered funnel for filling compressor oil, hydraulics and coolant without contamination or spillage in tight access areas.','https://www.lasertools.co.uk/product/1011/Flexi-funnel'],
  ['t33','T','OUTILS','Penetrating Rust Release Aerosol pack of 3','Wurth','0890 200 004','Seized fasteners','N/A (consumable)','OB',3,28,'N/A','Daily release spray for seized fasteners in harsh depot environments.','https://www.wurth.co.uk/rost-off-plus'],
  ['t34','T','OUTILS','Corundum Abrasive Cloth pack of 30','Bosch Professional','Expert C355 Sanding Sheets pack 30','Surface preparation','N/A (consumable)','OB',1,22,'N/A','For deburring, rust removal and surface prep before assembly or welding.','https://www.bosch-professional.com/gb/en/products/expert-c355/'],
  ['t35','T','OUTILS','Brake Cleaner / Industrial Degreaser Aerosol pack of 3','Wurth','0890 108 7','Cleaning and degreasing','N/A (consumable)','OB',3,25,'N/A','Residue-free brake cleaner and degreaser for components before testing, reassembly, bonding or welding.','https://www.wurth.co.uk/brake-cleaner'],

  ['e02','E','SAFETY','4-gas Detector ATEX X-am 2500','Drager Safety','8323919 X-am 2500 4-Gas Set','Confined-space and ventilation risk','Annual (gas calibration)','RC',2,1270,'5 years','Gas detector for pits, compressor rooms, battery charging zones and confined-space checks.','https://www.draeger.com/fr_fr/Products/X-am-2500'],
  ['e03','P','DIAG','Thermal Imaging Camera TiS60+ 320x240','Fluke','TiS60+ Thermal Camera','Electrical and thermal diagnostics','Annual (accredited)','RC',1,3812,'8 years','Project/depot thermal camera for electrical panels, bearings, drives, couplings and hot-spot detection during expert inspections and condition-based maintenance campaigns.','https://www.fluke.com/fr-fr/produit/cameras-thermiques/fluke-tis60-plus'],
  ['e04','E','DIAG','Mobile HP Test Station 0-250 bar','Enerpac','P-392 + calibrated gauge + fittings','Wash-plant pressure testing','Annual','RC',1,685,'10 years','Pressure-test setup for wash-plant rails, switches and hydraulic-style validation work.','https://www.lakeudenhydro.fi/en/hydraulic-components/enerpac-handpump-p-392/p/52427/'],
  ['e05','E','DIAG','Industrial Inspection Camera / Borescope','Extech / Fluke','BR250 / DS703 FC','Internal visual inspection','Annual (optical check)','RC',1,380,'7 years','Borescope for wash pipes, compressor cavities, tanks and inaccessible internal checks.','https://uk.rs-online.com/web/c/test-measurement/test-inspection-equipment/borescopes/'],
  ['e06','E','DIAG','Geometric Calibration Station with optical level and rule','Facom / Tesa Metrology','804B rule + TESA level','Wheel-lathe geometry control','Annual (metrology)','RC',1,1850,'10 years','Geometry verification set for wheel lathe level, rail planarity and machine checks.','https://www.tesa-metrology.com/en/'],
  ['e07','E','COLLECTIF','Mobile Waste Oil Drainer / Extractor 80 L','PIUSI','EASY DRAINER 80 - F00215A20','Major fluid-service work','Annual (consumable replacement)','OB',1,499.1,'10 years','Shared drainer for compressor service, vehicle oil changes and workshop fluid recovery.','https://www.piusi.com/fr/products/easy-drainer-80'],
  ['e08','E','DIAG','Digital Lifting Dynamometer 0-50 kN','Tractel','Dynafor Pro 50 kN','Overhead crane load testing','Annual (COFRAC)','RC',1,2850,'10 years','For crane load tests, load-limiter checks and certified lifting verification campaigns.','https://www.tractel.com/en/products/load-monitoring-instrumentation/dynamometers/'],
  ['e09','E','DIAG','Multi-line Air Brake Test Set RTC4','Haldex','TestPoint RTC4','Hi-rail vehicle brakes','Annual','RC',1,780,'10 years','Brake-circuit diagnostic set for hi-rail vehicle pneumatic systems.','https://www.haldex.com/en/group/products-and-services/brakes/'],
  ['e10','E','COLLECTIF','Portable HP Washer 150 bar','Karcher Professional','HD 5/12 C','Workshop cleaning support','Annual (inspection)','RC',1,528.9,'7 years','Shared washer for cleaning equipment before inspection, measurement or overhaul.','https://www.kaercher.com/fr/professionnel/nettoyeurs-haute-pression/'],
  ['e11','E','COLLECTIF','Mobile Workshop Roller Cabinet 6 drawers','Beta Tools','RSC24A/6','Shared workshop storage','Replace when worn','RC',1,669,'10 years','Shared rolling cabinet for team instruments, gauges, consumables and workshop tooling in a standardised drawer-based workshop format.','https://www.beta-tools.com/en/mobile-roller-cab-with-6-drawers-with-anti-tilt-system.html'],
  ['e12','E','OUTILS','Certified Torque Wrench Set 40-200 Nm plus 100-600 Nm','Facom','S.307A200 + S.309-600 with certificates','Controlled bolting','Annual (COFRAC)','RC',1,575,'10 years','Shared torque-wrench set for controlled tightening on anchors, flanges and structural hardware.','https://www.facom.com/fr-fr/products/tightening-and-torque/torque-wrenches/'],
  ['e13','E','COLLECTIF','Rugged Laptop Toughbook 55 Series','Panasonic','TOUGHBOOK 55 mk3','PLC and vendor diagnostics','5 years (replacement)','OB',1,2595,'5 years','Shared diagnostic laptop for PLCs, parameters, alarms, firmware and maintenance software.','https://eu.connect.panasonic.com/de/en/products/toughbook/toughbook-55-series'],
  ['e14','E','OUTILS','3/4 Pneumatic Impact Wrench Kit','Ingersoll Rand','285B-6PKG','Heavy mechanical bolting','Annual (inspection)','RC',1,480,'10 years','Shared high-torque impact wrench for heavy bolts on lifting columns, forklifts and crane hardware.','https://www.irtools.com/en-gb/products/air-impact-wrenches/'],
  ['e15','E','COLLECTIF','Portable Compressor 24 L 8 bar','Metabo','Basic 250-24 W','Backup compressed air supply','Annual (inspection + safety valve)','RC',1,185,'7 years','Backup air source when fixed depot air is unavailable or isolated for maintenance.','https://www.metabo.com/fr-fr/outillage-electrique/compresseurs/'],
  ['e16','E','OUTILS','MIG/MAG Welder 200 A','Lincoln Electric','POWER MIG 215 MPi','Fabrication and repair welding','Annual (inspection + PE check)','RC',1,1905,'10 years','Shared welder for qualified repair work on structures, brackets and workshop fabrication.','https://www.lgmtools.eu/en/gereedschappen/524/lincoln-power-mig-215-mpi%E2%84%A2-multi-process-welder.html'],
  ['e17','E','PPE','Full Welder PPE Kit','3M / Ansell','Speedglas 9100X + apron + gloves + leggings','Welding protection','Annual (helmet inspection)','RC',1,285,'3 years','Complete PPE kit supporting welding tasks with the shared MIG/MAG set.','https://www.3m.com/3M/en_US/p/d/v000057578/'],
  ['e18','E','OUTILS','Portable Magnetic Drill 35 mm','FEIN','JHM 50-2','Metal drilling and tapping','Annual (inspection)','RC',1,780,'10 years','Magnetic drill for in-situ steelwork drilling on crane and workshop structures.','https://www.fein.com/en-gb/products/mag-drill/'],
  ['e19','E','OUTILS','18V Angle Grinder 125 mm','Bosch Professional','GWS 18V-125 SC Professional','General workshop cutting and grinding','Annual (guard inspection)','RC',1,195,'7 years','Shared grinder for seized bolts, rust removal, weld prep and deburring.','https://www.bosch-professional.com/gb/en/products/gws-18v-125-sc-06019G310B.html'],
  ['e20','E','DIAG','Digital Caliper 0-300 mm IP67','Mitutoyo','500-197-30','Dimensional checks','Annual','RC',1,95,'10 years','Shared caliper for clearances, shaft diameters and mechanical wear checks.','https://shop.mitutoyo.eu/web/mitutoyo/en_GB/mitutoyo/01.03.03/Digital%20ABS%20Caliper%20Coolant%20Proof%20IP67/'],
  ['e21','E','DIAG','External Micrometer Set 0-50 mm','Mitutoyo','293-831-30 + 293-832-30','Precision dimensional checks','Annual','RC',1,145,'10 years','Precision micrometer set for shaft, rod and critical wear measurements.','https://shop.mitutoyo.eu/web/mitutoyo/en_GB/mitutoyo/01.03.04/'],
  ['e22','E','DIAG','Digital Magnetic Level 360 deg','Mitutoyo','960-272 Pro 360','Level and alignment checks','Annual','RC',1,285,'8 years','For wheel-lathe level, crane level and lifting-column rail planarity verification.','https://shop.mitutoyo.eu/web/mitutoyo/en_GB/mitutoyo/'],
  ['e23','E','DIAG','Dial Test Indicator with Magnetic Stand','Mitutoyo','543-390B + 10 NSP311','Runout and alignment checks','Annual','RC',1,165,'10 years','Shared comparator set for runout, concentricity and alignment checks.','https://shop.mitutoyo.eu/web/mitutoyo/en_GB/mitutoyo/01.03.11/'],
  ['e24','E','DIAG','HP Pressure Control Gauge 0-160 bar','Wika','232.50 0-160 bar G1/4','Wash-plant pressure control','Annual','RC',2,65,'5 years','Reference gauge for wash-plant rail pressure verification.','https://www.wika.com/fr-fr/232_50.WIKA'],
  ['e25','E','DIAG','Portable pH and Conductivity Meter','Hanna Instruments','HI98129','Water-quality control','Annual','RC',1,185,'7 years','Checks recycled-water quality, chemical concentration and separator performance.','https://hannainst.com/hi98129-combo-ph-ec-tds-temperature-tester.html'],
  ['e26','E','DIAG','Ultrasonic Leak Detector','UE Systems','Ultraprobe 100 UP-100','Leak detection and airborne ultrasound','Annual (check)','RC',1,420,'8 years','For wash-plant leaks, hidden valve leakage and similar non-visible losses.','https://www.uesystems.com/products/ultrasonic-instruments/ultraprobe-100/'],
  ['e27','E','MBTDC','Portable Insulation Tester 500V / 1000V','Fluke','1507 Insulation Tester','Motor and wiring insulation checks','Annual','RC',1,699,'10 years','Shared insulation tester for lathe motors, drives and related DEQ electrical circuits.','https://www.fluke.com/fr-fr/produit/testeurs-isolement/fluke-1507'],
  ['e28','E','DIAG','Infrared Thermometer -50 to +550 C','Fluke','62 MAX+','Quick thermal screening','Annual (check)','RC',1,148,'8 years','Shared IR thermometer for quick bearing, motor and hydraulic temperature checks.','https://www.fluke.com/fr-fr/produit/thermometres/thermometres-infrarouges/fluke-62-max'],
  ['e29','E','DIAG','Comparator for lifting-column synchronisation check','Mitutoyo','543-790 Digimatic + stand','Lifting-column levelling','Annual','RC',1,145,'10 years','Comparator setup for mechanical synchronisation and lift-level verification.','https://shop.mitutoyo.eu/web/mitutoyo/en_GB/mitutoyo/'],
  ['e30','E','DIAG','Oil Sampling and Laboratory Analysis Service Pack 10 samples','Spectro Scientific / oil lab service','Laboratory oil analysis service pack - 10 samples','Condition-based oil maintenance','Per PM frequency','RC',1,280,'N/A','Shared oil-analysis service pack for condition-based compressor lubricant monitoring.','https://www.spectrosci.com/products/oil-analysis/'],
  ['e31','E','DIAG','Reference Pressure Gauge 0-16 bar class 0.1','Wika','891.10 class 0.1 0-16 bar','Compressor gauge verification','Annual','RC',1,380,'10 years','Reference gauge for on-site verification of compressor and pneumatic pressure instrumentation.','https://www.wika.com/fr-fr/891_10.WIKA'],
  ['e32','E','DIAG','Wire Rope Wear Gauge Set 6-40 mm','Ronstan / RS Components','RF825 Wire Rope Gauge + Caliper set','Crane rope inspection','Annual (visual)','RC',1,125,'10 years','Shared gauge set for rope diameter reduction and wear monitoring on overhead cranes.','https://uk.rs-online.com/web/c/test-measurement/dimensional-measurement-equipment/'],
  ['e33','E','DIAG','Hook Wear Gauge Inspection Kit','Gunnebo','Hook inspection gauge kit','Crane hook inspection','Annual (visual)','RC',1,185,'10 years','Shared kit for hook section loss, latch function and deformation checks.','https://www.tractel.com/en/products/lifting-equipment/hooks/'],
  ['e34','E','DIAG','Hi-rail Guided Axle Wear Gauge','Vogel','WheelStar','Hi-rail wheel wear inspection','Annual','RC',1,580,'8 years','Gauge for hi-rail wheel flange and running-surface wear monitoring.','https://www.nextsense.at/en/products/calipri'],
  ['e35','E','DIAG','Hydraulic Pressure Gauge 0-400 bar with coupler','Wika + adapters','232.50 0-400 bar G1/4 with HP coupler','Hi-rail hydraulic checks','Annual','RC',1,125,'7 years','Shared pressure gauge for hi-rail hydraulic circuit diagnosis.','https://www.wika.com/fr-fr/232_50.WIKA'],
  ['e36','E','DIAG','Mast Chain Wear Gauge','Renold','Chain Wear Gauge','Forklift chain inspection','Annual (visual)','RC',1,65,'10 years','Chain elongation gauge for forklift mast chain inspection.','https://www.renold.com/chain-products/products/maintenance-tools/'],
  ['e37','E','DIAG','Fork Wear Gauge Inspection Kit','Cascade','Fork Inspection Kit','Forklift fork inspection','Annual (visual)','RC',1,85,'10 years','Profile and deflection gauge for annual forklift fork inspection.','https://www.cascorp.com/Products/Accessories'],
  ['e38','E','DIAG','Hydraulic Test Pressure Gauge 0-350 bar with coupler','Wika','232.50 0-350 bar + coupler','Forklift hydraulic checks','Annual','RC',1,110,'7 years','Shared pressure gauge for forklift lift, steering and brake-assist hydraulic diagnostics.','https://www.wika.com/fr-fr/232_50.WIKA'],
  ['e39','E','DIAG','Battery Conductance Tester for Forklift Batteries','Midtronics','CPX-900','Forklift battery health checks','Annual','RC',1,1010,'7 years','Battery decision tool for forklift traction or service batteries.','https://www.europe.midtronics.com/de/zh-hans/testers/cpx-900/'],
  ['e40','E','SAFETY','Full-body Safety Harness EN 361','3M DBI-SALA','ExoFit XE50 Safety Harness','Work-at-height PPE','Annual (inspection)','OB',2,306.43,'5 years','Base fall-arrest harness for overhead crane and elevated maintenance access.','https://www.pps-ppe.com/catalogue/ppe/personal-protection-equipment/other/FA%2F3M%2F1112715/'],
  ['e41','E','SAFETY','Twin-leg Personal Self-retracting Lifeline 2 m','3M DBI-SALA','3101298','Work-at-height PPE','Annual (inspection)','OB',2,392,'5 years','Twin-leg SRL for 100 percent tie-off during movement on elevated structures.','https://www.3m.com/3M/en_LB/p/d/v100323732/'],
  ['e42','E','SAFETY','Temporary Anchor Sling 2 m','3M DBI-SALA','KM421','Work-at-height PPE','Annual (inspection)','OB',2,98.4,'5 years','Reusable anchor sling for temporary attachment on beams and structural members.','https://www.3m.com/3M/sl_SI/p/dc/v100324904/'],

  ['e43','P','DIAG','Three-phase Power Quality Analyser Class A','Fluke','435-II','Project and depot electrical diagnostics','Annual','RC',1,7384,'10 years','Project-level analyser for harmonic distortion, dips, unbalance and advanced DEQ supply investigations.','https://www.fluke.com/fr-fr/produit/analyseurs-qualite-alimentation/fluke-435-ii'],
  ['e44','P','MBTDC','Loop Impedance and RCD Tester CAT IV','Metrel','MI3102H MultiServicer XD','Regulatory electrical verification','Annual','RC',1,1097.98,'10 years','Project/depot installation tester for loop, continuity, RCD and post-modification verification.','https://www.sauguspasaulis.lt/itampos-detektoriai/universalus-instaliacijos-tikrinimo-prietaisas-metrel-eurotestxe-25-kv-mi-3102h-bt?c3=3038&p=14480'],
  ['e45','P','COLLECTIF','Forklift Load Test Weights and certified spreader beam','Metrology lab / manufacturer','Calibrated test weights 1t x4 + certified flat spreader beam','Forklift regulatory testing','Annual (COFRAC weights)','RC',1,6500,'15 years','Project/depot load-test kit for annual forklift proof-load campaigns.','https://uk.rs-online.com/web/c/test-measurement/'],
  ['e46','P','DIAG','Laser Alignment System for couplings and rotating equipment','Pruftechnik','ROTALIGN Touch','Advanced alignment diagnostics','Annual','RC',1,5800,'10 years','Project-level laser alignment kit for motors, compressors, pumps and rotating shafts.','https://www.pruftechnik.com/en/products-and-services/alignment-systems/rotalign-touch/'],
  ['e47','P','DIAG','Ultrasonic Thickness Gauge 1.2-225 mm','Olympus / Evident','38DL Plus','Wall-thickness and corrosion monitoring','Annual','RC',1,2200,'10 years','Project/depot UT gauge for shells, vessels, structures and corrosion mapping without disassembly.','https://www.olympus-ims.com/fr/38dl-plus/'],
  ['e48','P','DIAG','Lifting Certification Kit with load test register','Enerpac / Bureau Veritas','BHP-series load tester + accredited lab certificate','Lifting-column certification','Annual (accredited load test)','RC',1,8500,'15 years','Project/depot kit for annual lifting-column proof-load and certification campaigns.','https://www.enerpac.com/fr-fr/'],
  ['e49','P','MHTA','High-voltage Insulation Tester 5 kV','Megger','MIT525/2 Insulation Tester 5kV','Advanced motor insulation diagnostics','Annual','RC',1,1850,'10 years','Project/depot 5 kV insulation tester for higher-power motors and advanced lifting-column diagnostics.','https://www.distrimesure.com/fr/controleurs-d-isolements-megommetres/2328-testeur-d-isolement-5kv-isolametre-megger-1016-085-mit5252.html'],
  ],
  MEP: [],
};

const TOOL_IMAGE_MODULES = import.meta.glob("./images/*.{png,jpg,jpeg,webp,avif,gif}", {
  eager: true,
  import: "default",
});

const DEFAULT_CONTEXT_IDS = CONTEXTS.map(context => context.id);
const contextOverridesFor = (uids, contexts) =>
  Object.fromEntries(uids.map(uid => [uid, [...contexts]]));
const TOOL_CONTEXT_OVERRIDES = {
  ...contextOverridesFor([
    'PSD:t01','PSD:t02','PSD:t03','PSD:t04','PSD:t05','PSD:t06','PSD:t07','PSD:t08','PSD:t09','PSD:t10',
    'PSD:t11','PSD:t12','PSD:t13','PSD:t14','PSD:t15','PSD:t16','PSD:t17','PSD:t18','PSD:t19','PSD:t20',
    'PSD:t21','PSD:t22',
    'PSD:e01','PSD:e02','PSD:e03','PSD:e04','PSD:e05','PSD:e06','PSD:e08','PSD:e09','PSD:e10',
    'PSD:e11','PSD:e12','PSD:e13','PSD:e14','PSD:e15','PSD:e16','PSD:e17','PSD:e18','PSD:e19','PSD:e20',
  ], ['metro', 'apm']),
  'POS:e01': ['heavy'],
  'POS:e03': ['heavy'],
  'POS:e04': ['heavy'],
  'POS:e13': ['heavy'],
  'POS:e15': ['heavy'],
  'POS:e16': ['heavy'],
  'POS:e17': ['heavy'],
  'POS:e20': ['heavy'],
  'POS:e24': ['heavy'],
};
const PRICE_OVERRIDE_STORAGE_KEY = 'railway-tooling-price-overrides-v1';
const LIFECYCLE_OVERRIDE_STORAGE_KEY = 'railway-tooling-lifecycle-overrides-v1';
const SERVICE_OVERRIDE_STORAGE_KEY = 'railway-tooling-service-overrides-v1';

const LIFECYCLE_TYPES = {
  durable: { label: 'Durable asset' },
  periodic_replacement: { label: 'Periodic replacement' },
  condition_based: { label: 'Condition-based replacement' },
  consumable: { label: 'Consumable / replenishment' },
};

const SERVICE_TYPES = {
  none: { label: 'No recurring service cost' },
  calibration: { label: 'Calibration' },
  verification: { label: 'Verification / periodic test' },
  dielectric_test: { label: 'Dielectric test' },
  inspection: { label: 'Inspection / periodic control' },
  maintenance_service: { label: 'Maintenance service' },
};

const lifecycleDefaultsFor = (uids, config) =>
  Object.fromEntries(uids.map(uid => [uid, { ...config }]));

export const TOOLING_LIFECYCLE_DEFAULTS = {
  ...lifecycleDefaultsFor(['POS:t05'], {
    type: 'periodic_replacement',
    intervalValue: '60',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'JSP helmet service-life guidance',
    year: '2026',
    basis: 'source_based',
  }),
  ...lifecycleDefaultsFor(['POS:t04', 'POS:e01', 'POS:e02'], {
    type: 'periodic_replacement',
    intervalValue: '36',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated insulating glove service life',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:t06'], {
    type: 'periodic_replacement',
    intervalValue: '12',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated safety eyewear replacement cycle',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:t07', 'POS:e03', 'POS:e04'], {
    type: 'periodic_replacement',
    intervalValue: '36',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated arc-flash PPE budgeting rule',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:t08', 'POS:t27'], {
    type: 'periodic_replacement',
    intervalValue: '36',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated portable lighting replacement cycle',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:t40', 'PSD:t22'], {
    type: 'periodic_replacement',
    intervalValue: '24',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated safety footwear replacement cycle',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:t41', 'PSD:t05'], {
    type: 'periodic_replacement',
    intervalValue: '24',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated hi-visibility vest replacement cycle',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:t42', 'PSD:t23'], {
    type: 'periodic_replacement',
    intervalValue: '24',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated hi-visibility work trouser replacement cycle',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:t43', 'PSD:t24'], {
    type: 'periodic_replacement',
    intervalValue: '12',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated hi-visibility polo replacement cycle',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:t44', 'PSD:t25'], {
    type: 'periodic_replacement',
    intervalValue: '36',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated hi-visibility winter jacket replacement cycle',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:t01', 'POS:t02', 'POS:t03', 'POS:t12', 'POS:t15', 'POS:t16', 'POS:t17', 'POS:t18'], {
    type: 'periodic_replacement',
    intervalValue: '84',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated handheld electrical test instrument life',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:t13', 'POS:e15', 'POS:e16', 'POS:e17', 'POS:e18', 'POS:e19', 'POS:e20', 'POS:e21', 'POS:e25', 'POS:e28', 'POS:e29', 'POS:e30', 'POS:e31'], {
    type: 'periodic_replacement',
    intervalValue: '84',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated advanced test instrument life',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:e22', 'POS:e23', 'POS:e24', 'POS:e32', 'POS:e33', 'POS:e34'], {
    type: 'periodic_replacement',
    intervalValue: '96',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated project-level diagnostic platform life',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:t11', 'POS:e11', 'POS:e12', 'POS:e13'], {
    type: 'periodic_replacement',
    intervalValue: '84',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated torque tool platform life',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:t09', 'POS:t10', 'POS:t19', 'POS:t20', 'POS:t21', 'POS:t23', 'POS:t24', 'POS:t25', 'POS:t30', 'POS:t31', 'POS:t37', 'POS:t38', 'POS:t39', 'POS:e08', 'POS:e41', 'POS:e49', 'POS:e51'], {
    type: 'condition_based',
    intervalValue: '',
    intervalUnit: 'years',
    replacementRatio: '100',
    source: 'Estimated hand-tool wear rule',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:t22', 'POS:t28', 'POS:e09', 'POS:e10'], {
    type: 'periodic_replacement',
    intervalValue: '60',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated cordless power-tool life',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:t29', 'POS:e39'], {
    type: 'periodic_replacement',
    intervalValue: '84',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated hydraulic cable-tool life',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:e05', 'POS:e06', 'POS:e35', 'POS:e36'], {
    type: 'periodic_replacement',
    intervalValue: '120',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated dielectric safety asset life',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:e07'], {
    type: 'periodic_replacement',
    intervalValue: '84',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated workshop roller cabinet life',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:t34', 'POS:t35', 'POS:e37'], {
    type: 'periodic_replacement',
    intervalValue: '60',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated lockout asset replacement cycle',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:t26', 'POS:t33', 'POS:t36', 'POS:e43', 'POS:e50'], {
    type: 'consumable',
    intervalValue: '12',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated annual consumable replenishment rule',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:t32'], {
    type: 'periodic_replacement',
    intervalValue: '60',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated industrial labeller refresh cycle',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:e38'], {
    type: 'condition_based',
    intervalValue: '',
    intervalUnit: 'years',
    replacementRatio: '100',
    source: 'Estimated cable-cutter wear rule',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:e44'], {
    type: 'periodic_replacement',
    intervalValue: '96',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated portable generator service life',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:e45'], {
    type: 'periodic_replacement',
    intervalValue: '60',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated site barrier kit life',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:e46'], {
    type: 'consumable',
    intervalValue: '12',
    intervalUnit: 'months',
    replacementRatio: '35',
    source: 'Estimated first-aid refill budgeting rule',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:e47'], {
    type: 'periodic_replacement',
    intervalValue: '120',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated extinguisher asset life',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:e48'], {
    type: 'periodic_replacement',
    intervalValue: '60',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated rugged laptop refresh cycle',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:e52'], {
    type: 'periodic_replacement',
    intervalValue: '120',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated access platform asset life',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['POS:e53'], {
    type: 'periodic_replacement',
    intervalValue: '84',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated industrial vacuum asset life',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['PSD:t01', 'PSD:t10', 'PSD:t11', 'PSD:t14', 'PSD:t20', 'PSD:e03', 'PSD:e04', 'PSD:e13', 'PSD:e14', 'PSD:e15', 'PSD:e17', 'PSD:e20'], {
    type: 'periodic_replacement',
    intervalValue: '120',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'PSD workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['PSD:t02'], {
    type: 'periodic_replacement',
    intervalValue: '12',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'PSD workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['PSD:t03'], {
    type: 'periodic_replacement',
    intervalValue: '36',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'PSD workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['PSD:t04'], {
    type: 'periodic_replacement',
    intervalValue: '60',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'PSD workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['PSD:t05'], {
    type: 'periodic_replacement',
    intervalValue: '24',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'PSD workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['PSD:t06'], {
    type: 'periodic_replacement',
    intervalValue: '120',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'PSD workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['PSD:t07'], {
    type: 'periodic_replacement',
    intervalValue: '60',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'PSD workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['PSD:t08', 'PSD:t09'], {
    type: 'periodic_replacement',
    intervalValue: '120',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'PSD workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['PSD:t12'], {
    type: 'periodic_replacement',
    intervalValue: '84',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'PSD workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['PSD:t13', 'PSD:t15', 'PSD:t16', 'PSD:t21'], {
    type: 'periodic_replacement',
    intervalValue: '60',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'PSD workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['PSD:t17', 'PSD:t18', 'PSD:t19'], {
    type: 'consumable',
    intervalValue: '12',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'PSD workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['PSD:e01'], {
    type: 'periodic_replacement',
    intervalValue: '84',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'PSD workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['PSD:e02', 'PSD:e11'], {
    type: 'periodic_replacement',
    intervalValue: '60',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'PSD workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['PSD:e05', 'PSD:e06', 'PSD:e08'], {
    type: 'periodic_replacement',
    intervalValue: '96',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'PSD workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['PSD:e09'], {
    type: 'periodic_replacement',
    intervalValue: '84',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'PSD workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['PSD:e10', 'PSD:e12'], {
    type: 'periodic_replacement',
    intervalValue: '120',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'PSD workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['PSD:e16'], {
    type: 'periodic_replacement',
    intervalValue: '84',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'PSD workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['PSD:e18'], {
    type: 'periodic_replacement',
    intervalValue: '84',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'PSD workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['PSD:e19'], {
    type: 'periodic_replacement',
    intervalValue: '120',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'PSD workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['DEQ:t02'], {
    type: 'periodic_replacement',
    intervalValue: '12',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'DEQ workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['DEQ:t03'], {
    type: 'periodic_replacement',
    intervalValue: '12',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'DEQ workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['DEQ:t04'], {
    type: 'periodic_replacement',
    intervalValue: '36',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'DEQ workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['DEQ:t05'], {
    type: 'periodic_replacement',
    intervalValue: '24',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'DEQ workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['DEQ:t06'], {
    type: 'periodic_replacement',
    intervalValue: '24',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'DEQ workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['DEQ:t07', 'DEQ:e01', 'DEQ:e40', 'DEQ:e41', 'DEQ:e42'], {
    type: 'periodic_replacement',
    intervalValue: '60',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'DEQ workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['DEQ:t08', 'DEQ:t09'], {
    type: 'periodic_replacement',
    intervalValue: '12',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'DEQ workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['DEQ:t10'], {
    type: 'periodic_replacement',
    intervalValue: '24',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'DEQ workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['DEQ:t11', 'DEQ:t24', 'DEQ:t33', 'DEQ:t34', 'DEQ:t35', 'DEQ:e30'], {
    type: 'consumable',
    intervalValue: '12',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'DEQ workbook lifecycle baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['DEQ:t01', 'DEQ:e27', 'DEQ:e28', 'DEQ:e44', 'DEQ:e49'], {
    type: 'periodic_replacement',
    intervalValue: '84',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated DEQ electrical test instrument life',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['DEQ:e03', 'DEQ:e04', 'DEQ:e05', 'DEQ:e06', 'DEQ:e08', 'DEQ:e09', 'DEQ:e20', 'DEQ:e21', 'DEQ:e22', 'DEQ:e23', 'DEQ:e24', 'DEQ:e25', 'DEQ:e26', 'DEQ:e29', 'DEQ:e31', 'DEQ:e32', 'DEQ:e33', 'DEQ:e34', 'DEQ:e35', 'DEQ:e36', 'DEQ:e37', 'DEQ:e38', 'DEQ:e39', 'DEQ:e43', 'DEQ:e46', 'DEQ:e47'], {
    type: 'periodic_replacement',
    intervalValue: '96',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated DEQ inspection and metrology platform life',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['DEQ:t12', 'DEQ:t13', 'DEQ:t14', 'DEQ:t15', 'DEQ:t16', 'DEQ:t17', 'DEQ:t19', 'DEQ:t20', 'DEQ:t21', 'DEQ:t22', 'DEQ:t23', 'DEQ:t25', 'DEQ:t26', 'DEQ:t27', 'DEQ:t28', 'DEQ:t29', 'DEQ:t30', 'DEQ:t31', 'DEQ:t32', 'DEQ:t36', 'DEQ:t37'], {
    type: 'condition_based',
    intervalValue: '',
    intervalUnit: 'years',
    replacementRatio: '100',
    source: 'Estimated DEQ hand-tool wear rule',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['DEQ:t18'], {
    type: 'periodic_replacement',
    intervalValue: '84',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated DEQ tool-bag life',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['DEQ:e07', 'DEQ:e10', 'DEQ:e11', 'DEQ:e15'], {
    type: 'periodic_replacement',
    intervalValue: '84',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated DEQ workshop support equipment life',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['DEQ:e12'], {
    type: 'periodic_replacement',
    intervalValue: '84',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated DEQ torque platform life',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['DEQ:e13'], {
    type: 'periodic_replacement',
    intervalValue: '60',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated rugged laptop refresh cycle',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['DEQ:e14', 'DEQ:e16', 'DEQ:e18', 'DEQ:e19'], {
    type: 'periodic_replacement',
    intervalValue: '84',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated DEQ workshop power-tool life',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['DEQ:e17'], {
    type: 'periodic_replacement',
    intervalValue: '36',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated welding PPE replacement cycle',
    year: '2026',
    basis: 'estimated',
  }),
  ...lifecycleDefaultsFor(['DEQ:e45', 'DEQ:e48'], {
    type: 'periodic_replacement',
    intervalValue: '180',
    intervalUnit: 'months',
    replacementRatio: '100',
    source: 'Estimated DEQ proof-load certification kit life',
    year: '2026',
    basis: 'estimated',
  }),
};

const serviceDefaultsFor = (uids, config) =>
  Object.fromEntries(uids.map(uid => [uid, { ...config }]));

export const TOOLING_SERVICE_DEFAULTS = {
  ...serviceDefaultsFor(['POS:t01'], {
    type: 'calibration',
    cost: '256',
    source: 'GMC-I calibration price list',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['POS:t12', 'POS:e25'], {
    type: 'calibration',
    cost: '203',
    source: 'GMC-I calibration price list',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['POS:t13'], {
    type: 'calibration',
    cost: '284',
    source: 'GMC-I calibration price list',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['POS:t15'], {
    type: 'calibration',
    cost: '137',
    source: 'GMC-I calibration price list',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['POS:t16'], {
    type: 'calibration',
    cost: '99',
    source: 'GMC-I calibration price list',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['POS:t18'], {
    type: 'calibration',
    cost: '166',
    source: 'GMC-I calibration price list',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['POS:t11'], {
    type: 'calibration',
    cost: '26',
    source: 'GEDORE torque service price list',
    year: '2025',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['POS:e13'], {
    type: 'calibration',
    cost: '36',
    source: 'GEDORE torque service price list',
    year: '2025',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['POS:e11'], {
    type: 'calibration',
    cost: '75',
    source: 'Maintenance planning baseline aligned with PSD torque wrench',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['POS:e12'], {
    type: 'calibration',
    cost: '95',
    source: 'Maintenance planning baseline for Facom S.307A200 mechanical-display torque wrench',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['POS:e15', 'POS:e16'], {
    type: 'verification',
    cost: '10',
    source: 'Venko voltage indicator testing price list',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['POS:e17'], {
    type: 'verification',
    cost: '9',
    source: 'Venko phase comparator testing price list',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['POS:e05', 'POS:e35', 'POS:e36'], {
    type: 'dielectric_test',
    cost: '18',
    source: 'Venko dielectric rods testing price list',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['POS:e06'], {
    type: 'dielectric_test',
    cost: '23',
    source: 'Venko dielectric rods testing price list',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['POS:t09', 'POS:t10'], {
    type: 'dielectric_test',
    cost: '3.5',
    source: 'Venko electrical insulating tool testing price list',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['POS:e52'], {
    type: 'inspection',
    cost: '35',
    source: 'Venko insulated ladder testing price list',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['POS:e24'], {
    type: 'calibration',
    cost: '400',
    source: 'Venko high-voltage equipment calibration price list',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['POS:e18'], {
    type: 'calibration',
    cost: '728',
    source: 'GMC-I calibration price list',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['POS:e28'], {
    type: 'calibration',
    cost: '665',
    source: 'GMC-I calibration price list',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['POS:e29'], {
    type: 'calibration',
    cost: '210',
    source: 'Fluke BT521 calibration certificate add-on',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['POS:e30'], {
    type: 'calibration',
    cost: '215',
    source: 'Fluke 1625-2 calibration certificate add-on',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['POS:e31'], {
    type: 'calibration',
    cost: '380',
    source: 'PSD workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['POS:e34'], {
    type: 'calibration',
    cost: '1027',
    source: 'Anritsu spectrum analyzer calibration quote baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['POS:e19'], {
    type: 'calibration',
    cost: '190',
    source: 'Estimated 5 kV insulation tester calibration budget',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['POS:e20'], {
    type: 'calibration',
    cost: '210',
    source: 'Estimated 10 kV insulation tester calibration budget',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['POS:e21'], {
    type: 'calibration',
    cost: '175',
    source: 'Estimated low-resistance ohmmeter calibration budget',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['POS:e22'], {
    type: 'calibration',
    cost: '750',
    source: 'Estimated relay test set calibration budget',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['POS:e23'], {
    type: 'calibration',
    cost: '400',
    source: 'Estimated CT/VT test set calibration budget',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['POS:e32'], {
    type: 'calibration',
    cost: '340',
    source: 'Estimated portable oscilloscope calibration budget',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['POS:e33'], {
    type: 'calibration',
    cost: '450',
    source: 'Estimated TDR / fault locator calibration budget',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['PSD:t01'], {
    type: 'calibration',
    cost: '137',
    source: 'PSD workbook / GMC-I Service 2026 list',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['PSD:t20'], {
    type: 'calibration',
    cost: '76.5',
    source: 'PSD workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['PSD:e03'], {
    type: 'calibration',
    cost: '169',
    source: 'PCE BIA-600 BT ISO calibration certificate add-on',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['PSD:e04'], {
    type: 'calibration',
    cost: '120',
    source: 'PSD workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['PSD:e05'], {
    type: 'calibration',
    cost: '95',
    source: 'PSD workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['PSD:e06'], {
    type: 'calibration',
    cost: '380',
    source: 'PSD workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['PSD:e08'], {
    type: 'calibration',
    cost: '109',
    source: 'PSD workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['PSD:e13'], {
    type: 'calibration',
    cost: '75',
    source: 'PSD workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['PSD:e14'], {
    type: 'calibration',
    cost: '95',
    source: 'Maintenance planning baseline for Facom S.307A200 mechanical-display torque wrench',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['PSD:e17'], {
    type: 'calibration',
    cost: '203',
    source: 'GMC-I calibration price list',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['PSD:e19'], {
    type: 'inspection',
    cost: '35',
    source: 'Venko insulated ladder testing price list',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['PSD:e20'], {
    type: 'calibration',
    cost: '137',
    source: 'GMC-I calibration price list',
    year: '2026',
    basis: 'source_based',
  }),
  ...serviceDefaultsFor(['DEQ:t01'], {
    type: 'calibration',
    cost: '120',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e02'], {
    type: 'calibration',
    cost: '195',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e03'], {
    type: 'calibration',
    cost: '380',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e04'], {
    type: 'calibration',
    cost: '120',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e06'], {
    type: 'calibration',
    cost: '220',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e08'], {
    type: 'calibration',
    cost: '320',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e09'], {
    type: 'calibration',
    cost: '110',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e12'], {
    type: 'calibration',
    cost: '165',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e20'], {
    type: 'calibration',
    cost: '70',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e21'], {
    type: 'calibration',
    cost: '80',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e22'], {
    type: 'calibration',
    cost: '75',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e23', 'DEQ:e29', 'DEQ:e39'], {
    type: 'calibration',
    cost: '65',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e24'], {
    type: 'calibration',
    cost: '45',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e25'], {
    type: 'calibration',
    cost: '85',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e27'], {
    type: 'calibration',
    cost: '145',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e31'], {
    type: 'calibration',
    cost: '95',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e34'], {
    type: 'calibration',
    cost: '90',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e35', 'DEQ:e38'], {
    type: 'calibration',
    cost: '55',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e43'], {
    type: 'calibration',
    cost: '420',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e44'], {
    type: 'calibration',
    cost: '220',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e45'], {
    type: 'verification',
    cost: '380',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e46'], {
    type: 'calibration',
    cost: '580',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e47'], {
    type: 'calibration',
    cost: '250',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e48'], {
    type: 'verification',
    cost: '650',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
  ...serviceDefaultsFor(['DEQ:e49'], {
    type: 'calibration',
    cost: '220',
    source: 'DEQ workbook baseline',
    year: '2026',
    basis: 'estimated',
  }),
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

function loadStoredServiceOverrides() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(SERVICE_OVERRIDE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function inferToolLifecycleBaseline(tool) {
  const explicit = TOOLING_LIFECYCLE_DEFAULTS[tool.uid];
  if (explicit) {
    return {
      type: explicit.type,
      intervalValue: explicit.intervalValue ?? '',
      intervalUnit: explicit.intervalUnit || 'years',
      replacementRatio: explicit.replacementRatio ?? '100',
      source: explicit.source || '',
      year: explicit.year || '',
      basis: explicit.basis || 'estimated',
    };
  }

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
    basis: 'derived',
  };
}

export function inferServiceIntervalMonthsFromPeriod(period) {
  const text = String(period || '').toLowerCase();
  if (!text) return 0;

  const monthMatch = text.match(/(\d+(?:[.,]\d+)?)\s*month/);
  if (monthMatch) return Math.round(Number.parseFloat(monthMatch[1].replace(',', '.')));

  const yearMatch = text.match(/(\d+(?:[.,]\d+)?)\s*year/);
  if (yearMatch) return Math.round(Number.parseFloat(yearMatch[1].replace(',', '.')) * 12);

  if (text.includes('annual')) return 12;
  return 0;
}

export function inferToolServiceBaseline(tool) {
  const explicit = TOOLING_SERVICE_DEFAULTS[tool.uid];
  if (explicit) {
    return {
      type: explicit.type || 'none',
      cost: explicit.cost ?? '',
      source: explicit.source || '',
      year: explicit.year || '',
      basis: explicit.basis || 'estimated',
      intervalMonths: inferServiceIntervalMonthsFromPeriod(tool.period),
    };
  }

  const period = String(tool.period || '').toLowerCase();
  let type = 'none';

  if (period.includes('calibration')) {
    type = 'calibration';
  } else if (period.includes('dielectric')) {
    type = 'dielectric_test';
  } else if (
    period.includes('inspection') ||
    period.includes('pressure check') ||
    period.includes('oil change') ||
    period.includes('expiry')
  ) {
    type = 'inspection';
  }

  return {
    type,
    cost: '',
    source: '',
    year: '',
    basis: 'derived',
    intervalMonths: inferServiceIntervalMonthsFromPeriod(tool.period),
  };
}

function resolveLifecycle(tool, lifecycleOverrides) {
  const baseline = inferToolLifecycleBaseline(tool);
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
    lifecycleSource: typeof override?.source === 'string' && override.source.trim()
      ? override.source.trim()
      : baseline.source,
    lifecycleYear: typeof override?.year === 'string' && override.year.trim()
      ? override.year.trim()
      : baseline.year,
    hasLifecycleOverride: Boolean(override),
    lifecycleBasis: override ? 'manual' : baseline.basis,
    lifecycleBaseline: baseline,
  };
}

function resolveService(tool, serviceOverrides) {
  const baseline = inferToolServiceBaseline(tool);
  const override = serviceOverrides?.[tool.uid];
  return {
    serviceType: override?.type || baseline.type,
    serviceCost: String(override?.cost ?? baseline.cost ?? ''),
    serviceSource: typeof override?.source === 'string' && override.source.trim()
      ? override.source.trim()
      : baseline.source,
    serviceYear: typeof override?.year === 'string' && override.year.trim()
      ? override.year.trim()
      : baseline.year,
    serviceIntervalMonths: baseline.intervalMonths || 0,
    hasServiceOverride: Boolean(override),
    serviceBasis: override ? 'manual' : baseline.basis,
    serviceBaseline: baseline,
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

const TOOL_IMAGE_OVERRIDES = {
  'POS:e07': 'e12_beta_tools_rsc24a.webp',
  'POS:e11': 'e13_facom_r_306a25.jpg',
  'POS:e31': 'e06_fluke_tis60.webp',
  'POS:e53': 'e53_k_rcher_nt_30.jpg',
  'POS:e52': 'e52_tubesca_comabi_sherpamatic_fixe_8_marches_02272158.png',
  'POS:t41': 't05_seton_cps4375052.jpg',
  'POS:t42': 't42_portwest_pw340.jpg',
  'POS:t43': 't43_portwest_rt22.jpg',
  'POS:t44': 't44_portwest_c465.jpg',
  'PSD:t22': 't40_puma_safety_krypton_mid_634200.jpg',
  'PSD:t23': 't42_portwest_pw340.jpg',
  'PSD:t24': 't43_portwest_rt22.jpg',
  'PSD:t25': 't44_portwest_c465.jpg',
  'PSD:t21': 't30_jokari_secura_2k_20100.png',
  'PSD:e02': 't32_brother_pt_e310btvp.jpg',
  'PSD:e11': 'e48_panasonic_toughbook_55_mk3.jpg',
  'PSD:e14': 'e12_facom_s_307a200.jpg',
  'PSD:e16': 't28_bosch_gsr_18v_55_professional.jpg',
  'PSD:e17': 't12_fluke_1507_insulation_tester.jpg',
  'PSD:e18': 'e53_k_rcher_nt_30.jpg',
  'PSD:e19': 'e52_tubesca_comabi_sherpamatic_fixe_8_marches_02272158.png',
  'PSD:e20': 't15_fluke_376_fc.jpg',
  'DEQ:t01': 't01_fluke_117.webp',
  'DEQ:t03': 't02_bolle_safety_cobra_cobpsi.jpg',
  'DEQ:t04': 't03_jsp_safety_evo3_rev_ajf170.jpg',
  'DEQ:t05': 't40_puma_safety_krypton_mid_634200.jpg',
  'DEQ:t06': 't05_seton_cps4375052.jpg',
  'DEQ:t07': 't06_brady_65674_personal_loto_kit.jpg',
  'DEQ:t10': 't44_portwest_c465.jpg',
  'DEQ:t11': 't11_3m_8822_ffp2_box_x20.jpg',
  'DEQ:t12': 'e49_facom_440_je25.jpg',
  'DEQ:t16': 't11_wiha_352_sb_18_t_handle.jpg',
  'DEQ:t17': 't13_facom_expert_e150304.jpg',
  'DEQ:t14': 't08_wiha_36295_softfinish_vde.jpg',
  'DEQ:t15': 't09_knipex_00_20_12_vde.jpg',
  'DEQ:t18': 't12_knipex_00_21_02_le_tool_bag_classic.jpg',
  'DEQ:e03': 'e06_fluke_tis60.webp',
  'DEQ:e11': 'e12_beta_tools_rsc24a.webp',
  'DEQ:e13': 'e48_panasonic_toughbook_55_mk3.jpg',
  'DEQ:e27': 't12_fluke_1507_insulation_tester.jpg',
  'DEQ:e28': 't18_fluke_62_max.jpg',
  'DEQ:e43': 'e18_fluke_435_ii.webp',
  'DEQ:e44': 't14_metrel_mi_3102h_bt_eurotestxe_2_5_kv.jpg',
  'DEQ:e49': 'e19_megger_mit525.webp',
};

const TOOLS = Object.entries(RAW_BY_SUBSYSTEM).flatMap(([subsystem, rawTools]) =>
  rawTools.map(([id,level,cat,name,brand,model,domain,norm,statut,qty,price,period,notes,productUrl]) => {
    const resolvedNorm = subsystem === 'DEQ' ? '-' : norm;
    const resolvedPeriod = subsystem === 'DEQ' ? norm : period;
    // derive imgFile from id + brand slug
    const brandSlug = brand.split('/')[0].trim().toLowerCase().replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_').replace(/_$/,'');
    const modelSlug = model.split('/')[0].trim().toLowerCase().replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_').replace(/_$/,'');
    const imgBase = `${id}_${brandSlug}_${modelSlug}`.toLowerCase();
    const uid = `${subsystem}:${id}`;
    const overrideImgFile = TOOL_IMAGE_OVERRIDES[uid];
    const matchedImgFile = overrideImgFile || TOOL_IMAGE_FILES_BY_BASE[imgBase] || `${imgBase}.jpg`;
    const imgSrc = TOOL_IMAGE_URLS[matchedImgFile] || null;
    const imgFile = matchedImgFile;
    return {id,uid,level,cat,name,brand,model,domain,norm:resolvedNorm,statut,qty,price,period:resolvedPeriod,notes,productUrl,imgFile,imgSrc,subsystem,contexts:TOOL_CONTEXT_OVERRIDES[uid] || DEFAULT_CONTEXT_IDS};
  })
);

const PRIMARY_USE_OVERRIDES = {
  t01: 'Reference handheld meter for troubleshooting live LV and traction DC circuits. Use it to confirm voltage presence, continuity, resistance, current and unstable electrical behavior during diagnosis, fault localisation and post-repair validation.',
  t02: 'Front-line screening tool before opening a cabinet or approaching live LV conductors. Use it for fast presence checks on feeders, terminals and auxiliaries when you need a safe first indication before switching to contact measurement.',
  t03: 'Formal safety VAT used to prove absence of voltage before lockout, access or contact on isolated LV and traction-related circuits. Use it as the mandatory final confirmatory step after isolation to prove the circuit is actually dead.',
  t04: 'Personal insulating glove kit for low-voltage intervention, proving absence of voltage and lockout work. Use it whenever hands may enter a cabinet, terminal zone or conductor environment where accidental contact with live LV parts remains possible.',
  t05: 'Daily head, face and eye protection baseline for electrical maintenance. Use it during switching, testing and cabinet access work to protect against impact, splash and limited electrical hazards while keeping the integrated visor ready for close approach tasks.',
  t06: 'Minimum eye protection worn during routine maintenance, inspection and manipulation around electrical cabinets, cable ends and small mechanical work. Use it as the default eye PPE even when full arc-flash face protection is not required.',
  t07: 'Arc-flash PPE kit used when the task risk assessment requires category 2 protection. Use it for switching, testing or fault intervention where an arc event is credible and the technician needs coat, trousers and face protection as one coordinated set.',
  t08: 'Portable intrinsically safe lighting for poorly lit technical rooms, tunnels or hazardous environments. Use it when both hands must remain free while inspecting, wiring or diagnosing equipment in low-visibility conditions.',
  t40: 'Baseline technician safety footwear for daily maintenance mobility, ladder access, technical rooms and rough work environments. Use it as the standard protective shoe when slip resistance, toe protection and ESD-compatible footwear are expected across the full maintenance route.',
  t41: 'Mandatory high-visibility vest for work near platforms, active circulation areas and temporary maintenance work fronts. Use it whenever technician conspicuity is required by worksite rules, service-window arrangements or local operating instructions.',
  t09: 'Basic insulated screwdriver set for daily low-voltage opening, tightening and small adjustment work inside cabinets and terminal assemblies. Use it as the personal core hand-tool set for live-safe LV maintenance practice.',
  t10: 'Compact insulated intervention kit for standard low-voltage maintenance tasks. Use it as the technician backup or travel set when pliers and screwdrivers are needed together for safe everyday work on energized-rated components.',
  t11: 'Insulated technician torque wrench for controlled tightening on small LV connections and terminals. Use it where torque quality matters but the joint is still within the personal technician scope rather than a heavier team bolting task.',
  t12: 'Routine insulation tester for 24 VDC, 48 VDC and 110 VDC auxiliaries, control loops and low-voltage wiring. Use it after cable work, moisture suspicion or fault tracing to detect insulation degradation before re-energisation.',
  t13: 'Commissioning and compliance tester for low-voltage boards, auxiliaries and socket circuits. Use it before energising a new or modified installation to validate RCD behavior, loop impedance and core IEC 60364 safety checks.',
  t15: 'Main current measurement clamp for traction DC and mixed AC/DC maintenance. Use it to quantify feeder load, return current, inrush, imbalance or suspicious current draw without opening the circuit.',
  t16: 'Quick pre-energisation phase-sequence verifier for motors, auxiliaries and rotating equipment. Use it before startup or after reconnection work to avoid reverse rotation and wrong three-phase wiring.',
  t17: 'Contact voltage and polarity tester for traction DC circuits and mixed AC/DC environments. Use it when you must identify DC polarity, confirm potential difference or perform a diagnostic contact check on conductors where the formal VAT tool is not the right instrument on its own.',
  t18: 'Team thermal screening tool for hot spots on terminals, fuses, disconnectors, cable lugs and electronic components. Use it during inspections and first-line troubleshooting to identify abnormal heating before moving to a deeper electrical diagnosis.',
  t19: 'Team-level 3/8 inch ratchet and socket set for broader cabinet, support and terminal hardware work. Use it as the shared mechanical socket base when the technician carry kit is too compact or when medium-duty bolting is repeated across the workfront.',
  t20: 'Compact hex-key set for drives, relays, electronic modules and socket-head fasteners. Use it on adjustment, removal and reassembly tasks where Allen screws are common and speed matters.',
  t21: 'Minimal carry pouch used to keep the most-used pliers directly on the technician during mobile interventions. Use it when moving repeatedly between cabinets or rooms and a full bag would be cumbersome.',
  t22: 'Heat-shrink preparation tool for sleeves, boots and connector finishing work. Use it after crimping, cable repair or sealing operations when controlled heating is needed to shrink and form insulating components.',
  t23: 'Recovery tool for dropped screws, washers and metallic small parts in inaccessible cabinet bottoms or equipment recesses. Use it to avoid dismantling extra hardware just to retrieve a lost part.',
  t24: 'Inspection aid for hidden, rear or underside areas that cannot be seen directly. Use it during visual checks inside crowded cabinets, cable paths or mechanical assemblies before committing to dismantling.',
  t25: 'Basic dimensional check tool used on-site for clearances, fixing positions, cable routes and support spacing. Use it during installation verification, retrofit preparation and quick dimensional confirmation.',
  t26: 'Industrial marking consumable for temporary or semi-permanent identification on cables, equipment, brackets and oily surfaces. Use it when labels are not practical or when field marking must be done immediately.',
  t27: 'Portable close-range work light for focused inspection inside cabinets, pits and behind equipment. Use it where a headlamp is not enough and a magnetic or hook-mounted light improves visibility on the exact work zone.',
  t28: 'Personal 18 V drill/driver assigned to each technician for routine fastening and light drilling. Use it for cabinet covers, terminal blocks, small brackets and everyday assembly work where speed and portability matter more than impact capacity.',
  t29: 'Project/depot hydraulic crimping tool for medium and large cable lugs on power and traction circuits. Use it during heavier cable replacement, termination and reconnection work when reliable compression of larger conductors is required beyond routine team tooling.',
  t30: 'Fast insulation stripper for repetitive preparation of small LV and control conductors. Use it on panel wiring, auxiliary repairs and terminal work where consistent stripping quality saves time.',
  t31: 'Outer-jacket stripping knife for larger round cables before termination or jointing. Use it when removing the sheath on LV, MV or traction cables without damaging the internal insulation layers.',
  t32: 'Portable field labeller for durable cable, terminal and equipment identification. Use it after installation, modification or troubleshooting work to restore traceability and maintenance readability.',
  t33: 'Standard tape consumable set for immediate electrical insulation, bundling and temporary sealing tasks. Use it during small repairs and finishing work, while reserving joint kits for full restoration jobs.',
  t34: 'Personal lockout starter kit carried by the technician for first-level electrical isolation. Use it when isolating breakers, switches and small energy sources before maintenance or inspection.',
  t35: 'Individual lockout padlock assigned to one technician to secure personal isolation ownership. Use it as the personal lock that proves no one can re-energise the system without that technician removing the lock.',
  t36: 'Consumable warning tag used with padlocks and group isolation devices to identify who locked out the equipment and why. Use it on every lockout point where human-readable warning information is required.',
  t37: 'Portable soft-sided container for carrying the technician daily tool set between distributed work zones. Use it when the intervention footprint is larger than one cabinet and belt carry is no longer enough.',
  t38: 'Technician-level mixed wrench set for the most common small and medium fastening sizes. Use it on routine mechanical and electromechanical interfaces before escalating to the larger team-level wrench range.',
  t39: 'Compact 1/4 inch spinner ratchet and socket set assigned to each technician for tight-access fastening. Use it inside crowded cabinets, narrow terminal areas and small assemblies where a low-profile rotating handle is faster and more practical than the larger team 3/8 inch ratchet set.',
  e15: 'Primary medium-voltage presence detector used before earthing, short-circuiting or authorising access on MV switchgear. Use it as the team reference to confirm whether a feeder or cubicle is still energised in the 20-36 kV range.',
  e16: 'Dedicated catenary voltage detector for 25 kV AC overhead line environments. Use it before railway earthing operations, possession access and worksite release to confirm the contact line is not live.',
  e17: 'Synchronism and phase-comparison instrument for medium-voltage sources before coupling or transfer operations. Use it when checking whether two MV points belong to the same phase relationship prior to switching actions.',
  e18: 'Project/depot-level power-quality analyser for disturbances that standard meters cannot explain. Use it on feeders and auxiliaries to record harmonics, dips, flicker, transient events and load profile issues during expert diagnostics or longer campaign monitoring.',
  e19: 'Project/depot 5 kV insulation platform for substations, MV cables, motors and transformers. Use it during acceptance testing, periodic insulation trending and after an outage or moisture event to assess dielectric health beyond routine team checks.',
  e20: '10 kV insulation tester reserved for heavier MV and HV insulation campaigns. Use it on long cable sections, large machines and transformer windings when the test level required is above routine 5 kV verification.',
  e21: 'Project/depot low-resistance micro-ohmmeter for switchgear primary paths and bolted power connections. Use it to verify contact resistance on breakers, disconnectors and busbars after maintenance, assembly, refurbishment or expert fault investigation.',
  e22: 'Protection commissioning platform for relay testing and secondary injection. Use it to validate trip logic, protection curves, IEC 61850 behavior and complete relay schemes before returning a bay to service.',
  e23: 'Ratio and polarity tester for instrument transformers during commissioning and fault analysis. Use it to verify CT/VT wiring, ratio accuracy and polarity before protection circuits are trusted in operation.',
  e24: 'Specialised MV cable dielectric test set for in-service cable assessment. Use it after repairs, jointing work or before re-commissioning to stress the cable insulation at very low frequency and confirm serviceability.',
  e25: 'Clamp earth tester for rapid earthing checks without disconnecting the installation. Use it during inspections or troubleshooting when you need a fast resistance trend on an existing earth network with minimal disruption.',
  e28: 'Project/depot network and energy analyser for deeper traction DC investigations. Use it to log voltage, current, power and energy behavior over time when diagnosing substations, chargers, converters or abnormal DC load conditions during expert campaigns.',
  e29: 'Project/depot battery diagnostic instrument for stationary DC systems such as UPS, charger-backed auxiliaries and substation battery banks. Use it during preventive maintenance, audits or expert investigations to detect weak cells, rising impedance and declining autonomy.',
  e30: 'Project/depot earth measurement kit for 3-pole, 4-pole and related ground-testing methods. Use it during commissioning, audits or deeper earthing investigations on substations, structures and earth loops when the team clamp-on method is not enough.',
  e31: 'Project/depot thermal imaging camera used for expert thermographic inspection of switchgear, busbars, cable terminations, auxiliaries and electrical connections when a simple IR thermometer is not enough.',
  e10: 'Shared 18 V hammer drill/driver kept at team level for heavier fixing work. Use it when the personal technician drill/driver is not enough, especially for anchors, masonry, stronger supports and more demanding drilling jobs.',
  e38: 'Team baseline ratchet cutter for standard copper and aluminium power cables. Use it for routine cable preparation and replacement work when the conductor is conventional and still within normal manual cutting capacity.',
  e39: 'High-capacity hydraulic cutter reserved for larger diameters and heavier cable sections. Use it when a standard ratchet cutter becomes too limited because of cable size, section or required cutting force.',
  e50: 'Heat-shrink low-voltage jointing kit kept at team level for damaged or modified LV cable sections. Use it after cable repair, extension or rerouting work to rebuild insulation, sealing and mechanical protection on auxiliaries or power circuits up to 1.1 kV.',
  e32: 'Portable isolated oscilloscope for waveform-level troubleshooting on converters, drives, relay outputs and control electronics. Use it when a multimeter cannot explain unstable switching, ripple, spikes or timing faults.',
  e33: 'Time-domain reflectometer for locating cable defects from one accessible end. Use it to estimate the distance to open circuits, short circuits or insulation anomalies before excavation or cable section replacement.',
  e34: 'Spectrum analyser for electromagnetic compatibility investigations around rail equipment. Use it when chasing radio-frequency noise, interference on signalling-related assets or abnormal emissions from converters and power electronics.',
  e01: 'Heavy-duty insulating gloves reserved for high-voltage intervention scope. Use them when the work package involves MV/HV approach distances, detector handling or earthing preparation in environments where class 4 insulation is mandated.',
  e02: 'Team glove kit for reinforced electrical protection on higher-risk DC traction or elevated LV work. Use it when the technician-level class 0 gloves are not sufficient for the voltage class or work method.',
  e03: 'Full-body arc-flash suit for high-energy railway electrical environments. Use it when intervention planning identifies an arc risk above the capability of lighter PPE, especially around 25 kV systems and high-fault-energy operations.',
  e04: 'Higher-rated arc-flash face shield used with compatible helmet and upper-body PPE. Use it when face protection must be increased beyond standard glasses or integrated visors because of elevated arc exposure.',
  e05: 'Switching stick used to operate MV apparatus from a safer distance. Use it during opening, closing or manipulation of medium-voltage equipment where direct hand contact is not acceptable.',
  e06: 'Temporary insulating screen used to cover adjacent live parts during nearby work. Use it when one section is isolated but dangerous neighbouring conductors or components remain energised inside the same work zone.',
  e07: 'Shared workshop roller cabinet used to store team tools, testers and consumables in a single mobile base unit. Use it as the physical support cabinet for a crew moving across rooms, platforms or substations during a maintenance campaign.',
  e08: 'Team insulated socket and driver set for protected bolting where the technician carry kit is not sufficient. Use it on larger or more varied low-voltage tasks that still require insulated tooling.',
  e09: 'Team impact wrench for loosening and tightening heavy bolts, brackets and mechanical interfaces. Use it on stubborn or repetitive heavy bolting where a manual ratchet or technician drill/driver is inefficient.',
  e11: 'Mechanical fine-range torque wrench for controlled tightening on terminals, clamps, brackets and smaller assemblies. Use it where repeatable low-to-medium torque is required but sub-5 Nm capability and digital traceability are not needed.',
  e12: 'Mechanical medium-range torque wrench with display for routine controlled tightening on cabinets, supports and MV-associated assemblies. Use it when the fastening is beyond technician scope but below heavy busbar torque levels, without needing angle mode or digital traceability.',
  e13: 'Heavy torque wrench for large bolted power interfaces such as busbars, structural connections and major electrical hardware. Use it where traceable high-torque tightening is required at team level.',
  e35: 'Portable earthing stick used to install temporary earthing equipment on de-energised MV switchgear. Use it immediately after voltage absence has been proven and before work is authorised on the isolated section.',
  e36: 'Railway earthing and short-circuiting assembly for traction DC possessions. Use it to create a visible and effective protective short-circuit/earth condition before working on the isolated traction section.',
  e37: 'Group lock box used when several technicians must depend on the same isolation. Use it to centralise the keys of energy-isolation devices so each worker can add a personal padlock before work starts.',
  e41: 'Team crimping tool for small ferrules and terminations in control and auxiliary circuits. Use it on panel wiring, interface relays and low-section conductor finishing where repeatable crimp quality is required.',
  e43: 'Heat-shrink medium-voltage jointing kit used after cable repair, jointing or termination work to rebuild insulation, screen continuity and sealing on MV circuits before the cable is returned to service.',
  e44: 'Portable site power source used when maintenance needs temporary 230 V supply away from a fixed outlet. Use it for field tools, lighting or controlled test equipment during isolated or remote interventions.',
  e45: 'Collective worksite-delimitation kit used to secure the maintenance area visually. Use it to mark temporary exclusion zones, define access limits and protect the crew from unintended encroachment.',
  e46: 'Project or team medical response kit kept available at the worksite or vehicle. Use it as the first immediate response resource for minor injuries while waiting for formal emergency support if needed.',
  e47: 'Local fire-response extinguisher intended for electrical and cabinet-adjacent incidents. Use it as the clean-agent first intervention extinguisher when residue-free firefighting is required near energised or sensitive equipment.',
  e48: 'Shared rugged diagnostic computer for relay access, drive configuration, SCADA checks and engineering software. Use it whenever the maintenance task depends on vendor tools, logs, parameter backup or communication with intelligent equipment.',
  e49: 'Large-range team wrench set reserved for heavier bolts and mechanical interfaces that are not practical at technician carry level. Use it when fastening sizes exceed the normal portable wrench pouch range.',
  e51: 'Shared team plier assortment for gripping, cutting, clamping and awkward mechanical handling tasks. Use it when the technician-level insulated pliers are too limited and the intervention needs a broader set including diagonal cutters, long-nose pliers and multigrip capability.',
  e52: 'Stable team access platform for repeated indoor work at height inside substations and technical rooms. Use it for safe access above cabinets, cable trays, lighting points or upper equipment interfaces when guardrails and a larger standing area are preferable to a simple stepladder.',
  e53: 'Antistatic team vacuum cleaner for de-energised electrical cabinets, cubicles and technical rooms. Use it to remove dust and debris in a controlled way before inspection or maintenance, instead of blowing contamination deeper into sensitive equipment.',
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
  if (tool.uid && PRIMARY_USE_OVERRIDES[tool.uid]) {
    return PRIMARY_USE_OVERRIDES[tool.uid];
  }

  if (tool.subsystem === 'POS' && PRIMARY_USE_OVERRIDES[tool.id]) {
    return PRIMARY_USE_OVERRIDES[tool.id];
  }

  return tool.notes;
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
export const TOOLING_CATEGORIES = CATS;

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
  serviceOverrides: controlledServiceOverrides,
  onServiceOverridesChange,
}) {
  const [localSubsystem, setLocalSubsystem] = useState(controlledSubsystem || 'POS');
  const subsystem = controlledSubsystem ?? localSubsystem;
  const setSubsystem = onSubsystemChange ?? setLocalSubsystem;
  const [localContext, setLocalContext] = useState(controlledContext || 'metro');
  const ctx = controlledContext ?? localContext;
  const setCtx = onContextChange ?? setLocalContext;
  const contextLocked = controlledContext !== undefined && !onContextChange;
  const isSelectionControlled = controlledSelection !== undefined;
  const isWorkforceControlled = controlledWorkforce !== undefined;
  const isPriceOverridesControlled = controlledPriceOverrides !== undefined;
  const isLifecycleOverridesControlled = controlledLifecycleOverrides !== undefined;
  const isServiceOverridesControlled = controlledServiceOverrides !== undefined;
  const [lvl, setLvl]     = useState('ALL');
  const [cat, setCat]     = useState('ALL');
  const [stat, setStat]   = useState('ALL');
  const [q, setQ]         = useState('');
  const [localSel, setLocalSel] = useState(new Set());
  const [modal, setModal] = useState(null);
  const [localPriceOverrides, setLocalPriceOverrides] = useState(loadStoredPriceOverrides);
  const currentReferenceYear = String(new Date().getFullYear());
  const [priceDraft, setPriceDraft] = useState({ price:'', source:'', year:currentReferenceYear });
  const [localLifecycleOverrides, setLocalLifecycleOverrides] = useState(loadStoredLifecycleOverrides);
  const [localServiceOverrides, setLocalServiceOverrides] = useState(loadStoredServiceOverrides);
  const [lifecycleDraft, setLifecycleDraft] = useState({
    type: 'durable',
    intervalValue: '',
    intervalUnit: 'years',
    replacementRatio: '100',
    source: '',
    year: '',
  });
  const [serviceDraft, setServiceDraft] = useState({
    type: 'none',
    cost: '',
    source: '',
    year: currentReferenceYear,
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
  const serviceOverrides = isServiceOverridesControlled ? controlledServiceOverrides : localServiceOverrides;
  const setServiceOverrides = updater => {
    const nextValue = typeof updater === 'function' ? updater(serviceOverrides) : updater;
    if (isServiceOverridesControlled) {
      onServiceOverridesChange?.(nextValue);
      return;
    }
    setLocalServiceOverrides(nextValue);
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
        const service = resolveService(tool, serviceOverrides);
        return {
          ...tool,
          currentPrice,
          priceSource,
          priceYear,
          ...lifecycle,
          ...service,
          hasPriceOverride: Boolean(override),
        };
      }),
    [ctx, subsystem, priceOverrides, lifecycleOverrides, serviceOverrides]
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
    if (typeof window === 'undefined' || isServiceOverridesControlled) return;
    window.localStorage.setItem(SERVICE_OVERRIDE_STORAGE_KEY, JSON.stringify(serviceOverrides));
  }, [isServiceOverridesControlled, serviceOverrides]);

  useEffect(() => {
    if (!modalTool) return;
    setPriceDraft({
      price: String(modalTool.currentPrice ?? modalTool.price ?? ''),
      source: modalTool.priceSource || '',
      year: modalTool.priceYear || currentReferenceYear,
    });
    setLifecycleDraft({
      type: modalTool.lifecycleType || 'durable',
      intervalValue: String(modalTool.lifecycleIntervalValue ?? ''),
      intervalUnit: modalTool.lifecycleIntervalUnit || 'years',
      replacementRatio: String(modalTool.lifecycleReplacementRatio ?? '100'),
      source: modalTool.lifecycleSource || '',
      year: modalTool.lifecycleYear || '',
    });
    setServiceDraft({
      type: modalTool.serviceType || 'none',
      cost: String(modalTool.serviceCost ?? ''),
      source: modalTool.serviceSource || '',
      year: modalTool.serviceYear || currentReferenceYear,
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
  const serviceDraftValue = Number.parseFloat(String(serviceDraft.cost).replace(',', '.'));
  const canSaveServiceOverride =
    Boolean(serviceDraft.type) &&
    (serviceDraft.type === 'none' || (Number.isFinite(serviceDraftValue) && serviceDraftValue >= 0));
  const getLevelMeta = level => LEVELS[level] || LEVELS.T;
  const getUnitLabel = tool => `${tool.qty} ${getLevelMeta(tool.level).unit}`;
  const getPriceReferenceLabel = tool => {
    if (tool.priceSource && tool.priceYear) return `${tool.priceSource} · ${tool.priceYear}`;
    if (tool.priceSource) return tool.priceSource;
    if (tool.priceYear) return `Reference year · ${tool.priceYear}`;
    return tool.hasPriceOverride ? 'Manual price reference' : 'Catalog baseline';
  };
  const getLifecycleReferenceLabel = tool => {
    if (tool.lifecycleSource && tool.lifecycleYear) {
      const suffix = tool.lifecycleBasis === 'estimated' ? ' · estimated baseline' : tool.lifecycleBasis === 'manual' ? ' · manual override' : '';
      return `${tool.lifecycleSource} · ${tool.lifecycleYear}${suffix}`;
    }
    if (tool.lifecycleSource) return tool.lifecycleSource;
    if (tool.lifecycleYear) return `Reference year Â· ${tool.lifecycleYear}`;
    if (tool.hasLifecycleOverride) return 'Manual lifecycle assumption';
    return tool.lifecycleBasis === 'derived' ? 'Derived from current maintenance note' : 'Default lifecycle baseline';
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
  const getServiceReferenceLabel = tool => {
    if (tool.serviceSource && tool.serviceYear) {
      const suffix = tool.serviceBasis === 'estimated' ? ' · estimated baseline' : tool.serviceBasis === 'manual' ? ' · manual override' : '';
      return `${tool.serviceSource} · ${tool.serviceYear}${suffix}`;
    }
    if (tool.serviceSource) return tool.serviceSource;
    if (tool.serviceYear) return `Reference year · ${tool.serviceYear}`;
    if (tool.hasServiceOverride) return 'Manual service cost assumption';
    return tool.serviceBasis === 'derived' ? 'Derived from current maintenance note' : 'No service cost documented';
  };
  const getServiceSummary = tool => {
    const typeLabel = SERVICE_TYPES[tool.serviceType]?.label || 'Service';
    const costValue = Number.parseFloat(String(tool.serviceCost).replace(',', '.'));
    const costLabel = Number.isFinite(costValue) && costValue > 0
      ? `${tool.serviceCost} EUR per event`
      : 'cost not documented';
    const cadence = tool.serviceIntervalMonths
      ? tool.serviceIntervalMonths % 12 === 0
        ? `every ${tool.serviceIntervalMonths / 12} year${tool.serviceIntervalMonths / 12 > 1 ? 's' : ''}`
        : `every ${tool.serviceIntervalMonths} month${tool.serviceIntervalMonths > 1 ? 's' : ''}`
      : 'cadence not derived';
    return `${typeLabel} · ${costLabel} · ${cadence}`;
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
  const saveServiceOverride = () => {
    if (!modalTool || !canSaveServiceOverride) return;
    setServiceOverrides(prev => ({
      ...prev,
      [modalTool.uid]: {
        type: serviceDraft.type,
        cost: serviceDraft.type === 'none' ? '' : String(serviceDraftValue),
        source: serviceDraft.source.trim(),
        year: serviceDraft.year.trim(),
      },
    }));
  };
  const resetServiceOverride = () => {
    if (!modalTool) return;
    setServiceOverrides(prev => {
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
          <div style={{ marginLeft:isTablet?0:'auto', display:'flex', gap:6, flexWrap:'wrap', width:isTablet?'100%':'auto', alignItems:'center' }}>
            {CONTEXTS.map(c=>(
              <button key={c.id} onClick={()=>!contextLocked && setCtx(c.id)} style={{
                background:ctx===c.id?c.accent+'20':C.bg,
                border:`1px solid ${ctx===c.id?c.accent:C.border}`,
                color:ctx===c.id?c.accent:C.textSub,
                padding:'5px 13px', borderRadius:20, cursor:contextLocked?'default':'pointer', fontSize:12, fontWeight:600,
                fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em', transition:'all 0.15s',
                opacity:contextLocked && ctx!==c.id ? 0.45 : 1,
              }}>{c.icon} {c.label}</button>
            ))}
            {contextLocked && (
              <div style={{ fontSize:11, color:C.textSub, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em' }}>
                Locked by project
              </div>
            )}
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
                        minHeight:390,
                      }}
                      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=isSel?`0 26px 48px ${c.color}24`:'0 22px 44px rgba(17,24,39,0.09)';}}
                      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=isSel?`0 22px 42px ${c.color}22`:'0 18px 36px rgba(17,24,39,0.06)';}}
                    >
                      <div style={{ position:'relative', background:`linear-gradient(180deg, ${c.color}14 0%, rgba(255,255,255,0.96) 100%)`, minHeight:214, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px 18px 12px' }}>
                        <div style={{ position:'absolute', inset:'14px 14px auto auto', display:'flex', gap:6, flexWrap:'wrap', justifyContent:'flex-end' }}>
                          <span style={{ background:`${s.color}14`, color:s.color, borderRadius:999, padding:'5px 10px', fontSize:10, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em' }}>{s.label}</span>
                          <span style={{ background:levelMeta.bgLight, color:levelMeta.color, borderRadius:999, padding:'5px 10px', fontSize:10, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em' }}>{levelMeta.short}</span>
                        </div>
                        <ToolVisual tool={t} size={132} radius={18}/>
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
                    minHeight:188,
                    boxShadow:isSel?`0 10px 24px ${c.color}12`:'0 8px 18px rgba(0,0,0,0.10)',
                    transform:'translateY(0)',
                  }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=isSel?c.color+'80':C.borderL; e.currentTarget.style.background=isSel?`${c.color}12`:C.cardHov; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=isSel?`0 16px 28px ${c.color}16`:'0 14px 26px rgba(0,0,0,0.18)';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=isSel?c.color+'50':C.border; e.currentTarget.style.background=isSel?`${c.color}0D`:C.card; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=isSel?`0 10px 24px ${c.color}12`:'0 8px 18px rgba(0,0,0,0.10)';}}
                  >
                    {/* SVG thumb */}
                    <div onClick={()=>setModal(t)} style={{ width:112, flexShrink:0, background:isSel?`${c.color}08`:C.bgMid, display:'flex', alignItems:'center', justifyContent:'center', borderRight:`1px solid ${C.border}`, padding:'12px 10px' }}>
                      <ToolVisual tool={t} size={80} radius={12}/>
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

                    <div style={{ background:'#FFFFFF', borderRadius:22, padding:'18px 18px 16px', boxShadow:'0 18px 36px rgba(17,24,39,0.05)' }}>
                      <div style={{ fontSize:11, color:'#1C6090', marginBottom:12, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.08em', display:'flex', alignItems:'center', gap:6 }}>
                        <BarChart2 size={12}/> CALIBRATION / VERIFICATION COST
                      </div>
                      <div style={{ display:'grid', gap:12 }}>
                        <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 120px 112px', gap:10 }}>
                          <div>
                            <div style={{ fontSize:10, color:'#667085', marginBottom:6, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>SERVICE TYPE</div>
                            <select
                              value={serviceDraft.type}
                              onChange={e=>setServiceDraft(p=>({ ...p, type:e.target.value }))}
                              style={{ width:'100%', background:'#F2F4F7', border:'1px solid rgba(71,84,103,0.14)', borderRadius:12, padding:'10px 12px', color:'#191C1E', fontSize:13, outline:'none', fontFamily:"'Barlow', sans-serif" }}
                            >
                              {Object.entries(SERVICE_TYPES).map(([value, meta])=>(
                                <option key={value} value={value}>{meta.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <div style={{ fontSize:10, color:'#667085', marginBottom:6, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>COST / EVENT (EUR)</div>
                            <input
                              value={serviceDraft.cost}
                              onChange={e=>setServiceDraft(p=>({ ...p, cost:e.target.value }))}
                              placeholder="0"
                              style={{ width:'100%', background:'#F2F4F7', border:'1px solid rgba(71,84,103,0.14)', borderRadius:12, padding:'10px 12px', color:'#191C1E', fontSize:13, outline:'none', fontFamily:"'JetBrains Mono', monospace" }}
                            />
                          </div>
                          <div>
                            <div style={{ fontSize:10, color:'#667085', marginBottom:6, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>YEAR</div>
                            <input
                              value={serviceDraft.year}
                              onChange={e=>setServiceDraft(p=>({ ...p, year:e.target.value.replace(/[^0-9]/g, '').slice(0, 4) }))}
                              placeholder={currentYear}
                              style={{ width:'100%', background:'#F2F4F7', border:'1px solid rgba(71,84,103,0.14)', borderRadius:12, padding:'10px 12px', color:'#191C1E', fontSize:13, outline:'none', fontFamily:"'JetBrains Mono', monospace" }}
                            />
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize:10, color:'#667085', marginBottom:6, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>SOURCE</div>
                          <input
                            value={serviceDraft.source}
                            onChange={e=>setServiceDraft(p=>({ ...p, source:e.target.value }))}
                            placeholder="Calibration lab, testing contractor, framework..."
                            style={{ width:'100%', background:'#F2F4F7', border:'1px solid rgba(71,84,103,0.14)', borderRadius:12, padding:'10px 12px', color:'#191C1E', fontSize:13, outline:'none', fontFamily:"'Barlow', sans-serif" }}
                          />
                        </div>
                        <div style={{ display:'grid', gap:6 }}>
                          <div style={{ fontSize:12, color:'#667085', lineHeight:1.55 }}>
                            Current assumption: <strong style={{ color:'#191C1E' }}>{getServiceSummary(modal)}</strong>
                          </div>
                          <div style={{ fontSize:12, color:'#667085', lineHeight:1.55 }}>
                            Active reference: <strong style={{ color:'#191C1E' }}>{getServiceReferenceLabel(modal)}</strong>
                          </div>
                        </div>
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                          <button
                            onClick={resetServiceOverride}
                            style={{ background:'#FFFFFF', border:'1px solid rgba(71,84,103,0.14)', borderRadius:12, padding:'10px 12px', cursor:'pointer', fontSize:12, color:'#475467', fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.05em' }}
                          >
                            RESET SERVICE COST
                          </button>
                          <button
                            onClick={saveServiceOverride}
                            disabled={!canSaveServiceOverride}
                            style={{ background:canSaveServiceOverride?'#7C3AED':'#D0D5DD', border:'none', borderRadius:12, padding:'10px 14px', cursor:canSaveServiceOverride?'pointer':'not-allowed', fontSize:12, color:'#FFFFFF', fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.05em' }}
                          >
                            SAVE SERVICE COST
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

                  <div style={{ background:C.bgMid, borderRadius:10, padding:'12px 14px', border:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:10, color:c.color, marginBottom:10, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em', display:'flex', alignItems:'center', gap:5 }}>
                      <BarChart2 size={10}/> CALIBRATION / VERIFICATION COST
                    </div>
                    <div style={{ display:'grid', gap:10 }}>
                      <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 96px 96px', gap:8 }}>
                        <select
                          value={serviceDraft.type}
                          onChange={e=>setServiceDraft(p=>({ ...p, type:e.target.value }))}
                          style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 10px', color:C.text, fontSize:12, outline:'none', fontFamily:"'Barlow', sans-serif" }}
                        >
                          {Object.entries(SERVICE_TYPES).map(([value, meta])=>(
                            <option key={value} value={value}>{meta.label}</option>
                          ))}
                        </select>
                        <input
                          value={serviceDraft.cost}
                          onChange={e=>setServiceDraft(p=>({ ...p, cost:e.target.value }))}
                          placeholder="0"
                          style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 10px', color:C.text, fontSize:12, outline:'none', fontFamily:"'JetBrains Mono', monospace" }}
                        />
                        <input
                          value={serviceDraft.year}
                          onChange={e=>setServiceDraft(p=>({ ...p, year:e.target.value.replace(/[^0-9]/g, '').slice(0, 4) }))}
                          placeholder={currentYear}
                          style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 10px', color:C.text, fontSize:12, outline:'none', fontFamily:"'JetBrains Mono', monospace" }}
                        />
                      </div>
                      <input
                        value={serviceDraft.source}
                        onChange={e=>setServiceDraft(p=>({ ...p, source:e.target.value }))}
                        placeholder="Source"
                        style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 10px', color:C.text, fontSize:12, outline:'none', fontFamily:"'Barlow', sans-serif" }}
                      />
                      <div style={{ fontSize:11, color:C.textSub, lineHeight:1.5 }}>
                        Current assumption: <span style={{ color:C.text }}>{getServiceSummary(modal)}</span>
                      </div>
                      <div style={{ fontSize:11, color:C.textSub, lineHeight:1.5 }}>
                        Active reference: <span style={{ color:C.text }}>{getServiceReferenceLabel(modal)}</span>
                      </div>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        <button onClick={resetServiceOverride} style={{ background:'transparent', border:`1px solid ${C.borderL}`, borderRadius:8, padding:'8px 10px', cursor:'pointer', fontSize:11, color:C.textSub, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em' }}>
                          RESET SERVICE COST
                        </button>
                        <button onClick={saveServiceOverride} disabled={!canSaveServiceOverride} style={{ background:canSaveServiceOverride?C.violet:C.borderL, border:'none', borderRadius:8, padding:'8px 12px', cursor:canSaveServiceOverride?'pointer':'not-allowed', fontSize:11, color:'#fff', fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em' }}>
                          SAVE SERVICE COST
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
