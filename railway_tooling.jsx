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
  EPI:      { label:'Safety / PPE',     color:C.orange, bg:C.orangeDim, icon:'🛡️' },
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

const CONTEXTS = [
  { id:'metro',  label:'Metro',      icon:'🚇', accent:C.teal   },
  { id:'tram',   label:'Tram',       icon:'🚊', accent:C.cyan   },
  { id:'heavy',  label:'Heavy Rail', icon:'🚂', accent:C.amber  },
  { id:'apm',    label:'APM',        icon:'🚅', accent:C.violet },
];

const SUBSYSTEMS = [
  { id:'POS',   label:'POS',     full:'Energy',         active:true  },
  { id:'PSD',   label:'PSD',     full:'Platform Doors', active:false },
  { id:'CAT',   label:'CAT',     full:'Catenary',       active:false },
  { id:'TRACK', label:'TRACK',   full:'Track',            active:false },
  { id:'3RD',   label:'3rd Rail',full:'Conductor Rail', active:false },
  { id:'AFC',   label:'AFC',     full:'Ticketing',      active:false },
];

// ─── TOOL DATA ────────────────────────────────────────────────────────────────
const RAW = [
  // Unit prices refreshed on 2026-03-29 from current public shop / price-comparison pages when available.
  // Unchanged entries remain planning estimates for budgeting, not contractual purchase prices.
  ['t01','T','EPI','TRMS Multimeter CAT IV 1000V','Fluke','289/EUR','LV / DC Traction','CAT IV 1000V – IEC 61010','OB',1,1006,'Annual (calibration)','Integrated data logger. AC/DC measurements: voltage, current, resistance, continuity. Absolute field reference.','https://www.fluke.com/fr-fr/produit/multimetres/multimetres-numeriques/fluke-289'],
  ['t02','T','EPI','Non-contact AC Voltage Detector 100-1000V','Fluke','T6-1000PRO','LV','CAT IV 1000V','OB',1,404,'Annual','Non-contact measurement, no leads required. Essential LV safety. Instant detection before any approach.','https://www.fluke.com/fr-fr/produit/testeurs-electriques/testeurs-tension/fluke-t6-1000-pro'],
  ['t03','T','EPI','Bipolar Voltage Absence Tester 12-1000V AC/DC','Chauvin Arnoux','C.A 773','LV / DC Traction','CAT IV 1000V – IEC 61243-3','OB',1,82,'Annual','Official Chauvin Arnoux VAT reference for low-voltage absence-of-voltage checks in harsh industrial and railway environments.','https://www.chauvin-arnoux.com/sites/default/files/D00VHU49.PDF'],
  ['t04','T','EPI','Insulating Gloves Class 0 (1000V AC) + leather protectors','Honeywell / Salisbury','GK014B/10H glove kit','LV / DC Traction','Class 0 – IEC EN 60903 / ASTM D120','OB',1,213,'6 months (dielectric test)','Official Salisbury glove kit page including class 0 rubber insulating gloves, leather protectors and storage bag for low-voltage intervention work.','https://www.salisburyshop.com/buy/product/class-0-black-rubber-insulating-glove-kit/198561'],
  ['t05','T','EPI','Electrical Safety Helmet with Integrated Faceshield','JSP','EVO VISTAshield','All domains','EN 397 – EN 50365 – EN 166','OB',1,58,'3 years','Integrated faceshield helmet with low-voltage electrical insulation performance and better face coverage than the previous link.','https://www.jspsafety.com/products/PPE/Head-Protection/EN-397-industrial-Safety-Helmets/VAR-AMC170-007-F00_EVO-ViSTAshield-Safety-Helmet-with-integrated-Faceshield'],
  ['t06','T','EPI','Arc-flash Safety Glasses EN166','Bolle Safety','Cobra COBPSI','All domains','EN 166 / EN 170','OB',1,22,'1 year','Anti-scratch, anti-fog. Systematic use during all interventions.','https://www.bollesafety.com/fr/lunettes-de-securite/cobra'],
  ['t07','T','EPI','Arc-flash Safety Kit Category 2 (8 cal/cm²)','Honeywell / Salisbury','SKCP8RG-WB','All domains','NFPA 70E – ASTM F1506','OB',1,510,'3 years or after arc event','Current official kit page for coat + pants + PrismShield faceshield + hard hat. More realistic replacement than the obsolete AGF40KIT link.','https://www.salisburyonline.com/product/384/salisbury-safety-kit-8-cal-coat-pant-as1000-prismshield-faceshield-skcp8rg-wb'],
  ['t08','T','EPI','ATEX Headlamp – 115 lm','Peli','2755Z0','All domains','ATEX Zone 0 – IP54','OB',1,118,'Annual (battery)','Current official intrinsically safe headlamp page. Suitable for hazardous environments and easier to source than the obsolete PIXA 3 ATEX reference.','https://www.peli.com/es/en/product/flashlights/headlamp/2755z0/'],
  ['t09','T','EPI','VDE 1000V Insulated Screwdriver Set – 7 pcs','Wiha','36295 SoftFinish VDE Set','LV','VDE – IEC 60900 – 1000V AC','OB',1,78,'Annual (visual inspection)','Bi-material handles. Compliant with DIN VDE 0680. Tested to 10kV.','https://www.wiha.com/fr-fr/outillage/tournevis/tournevis-vde/softfinish-vde/36295'],
  ['t10','T','EPI','VDE 1000V Insulated Tool Set – 5 pcs','Knipex','00 20 13','LV','DIN EN/IEC 60900 – 1000V AC','OB',1,145,'Annual (visual inspection)','Official KNIPEX 5-piece VDE set combining insulated pliers and screwdrivers for standard low-voltage work.','https://www.knipex.com/products/tool-kits/tool-kits/tool-kits/002013'],
  ['t11','T','EPI','VDE Torque Wrench 1/2" 10-50 Nm','Gedore','VDE 4508-05','LV','DIN EN ISO 6789-2 / IEC 60900','RC',1,395,'Annual (calibration)','Official GEDORE insulated torque wrench page for controlled tightening on live components up to 1000 V.','https://www.gedore.com/en-at/products/torque-tools/torque-wrenches--accessories/torque-wrenches%2C-releasing-for-sockets/vde-4508-vde-torque-wrench/vde-4508-05---3079066'],
  ['t12','T','MBTDC','Portable Insulation Tester 500V/1000V','Fluke','1507 Insulation Tester','DC Auxiliaries 24-110V / LV','IEC 61557-2 – CAT IV 600V','OB',1,630,'Annual (calibration)','Daily use: insulation testing of 24VDC control circuits. Lighter than team MIT525.','https://www.fluke.com/fr-fr/produit/testeurs-isolement/fluke-1507'],
  ['t13','T','MBTDC','RCD Tester + Fault Loop Impedance','Fluke','1664 FC Multifunction','LV / Auxiliaries 400V','IEC 61557 – IEC 60364','OB',1,1998,'Annual (calibration)','RCD test 10-500mA, fault loop impedance. Mandatory before 400V commissioning.','https://www.fluke.com/fr-fr/produit/testeurs-installation-electrique/fluke-1664-fc'],
  ['t14','T','MBTDC','Loop Impedance / Installation Tester NF C 15-100','Metrel','MI 3102H BT EurotestXE 2.5 kV','LV / Auxiliaries 400V','IEC 61557 – NF C 15-100','RC',1,1353,'Annual (calibration)','Current official Metrel page for a Eurotest platform still suited to installation testing, loop impedance and higher-voltage insulation checks.','https://www.metrel.si/en/shop/EIS/multifunctional-testers/mi-3102h-bt.html'],
  ['t15','T','MBTDC','TRMS AC/DC Clamp Meter 1000A WiFi','Fluke','376 FC','LV / DC Traction 750-1500V','CAT IV 600V – CAT III 1000V','OB',1,767,'Annual (calibration)','DC measurement up to 2500A with iFlex. Fluke Connect wireless.','https://www.fluke.com/fr-fr/produit/mesure-courant/pinces-amperemetriques/fluke-376-fc'],
  ['t16','T','MBTDC','Three-phase Rotation Tester 40-700V AC','Fluke','9040','LV / Auxiliaries 400V','EN 61010 – EN 61557-7','OB',1,316,'Annual','Clear official product page for phase-sequence verification before energisation. Replaces the incorrect CA 6412 reference.','https://www.fluke.com/en/product/electrical-testing/basic-testers/fluke-9040'],
  ['t17','T','MBTDC','DC Polarity Tester with buzzer 24V-1500V','Metrel','MI2124','DC Traction 750-1500V','CAT III 1000V','RC',1,95,'Annual','Polarity and continuity check on DC traction circuits.','https://www.metrel.si/instruments/multimeters/MI2124'],
  ['t18','T','MBTDC','Infrared Thermometer -50 to +550°C','Fluke','62 MAX+','All domains','EN 61010-1','RC',1,166,'Annual','Fast detection of hot spots on lugs, busbars, fuses.','https://www.fluke.com/fr-fr/produit/thermometres/thermometres-infrarouges/fluke-62-max'],
  ['t19','T','OUTILS','Ratchet Set 3/8" metric 29 pcs','Wera','8100 SB 6 Zyklop Speed','LV / MV – Bolting','ISO 2725 / DIN 3122','OB',1,165,'Replace when worn','Current official ratchet/socket set page with compact textile case. Suitable for cabinet fixings, lugs and terminal work.','https://www.wera.de/fr/outillages/8100-sb-6-jeu-cliquet-zyklop-speed-a-carre-3-8-metrique'],
  ['t20','T','OUTILS','Hex Key Set metric 1.5-10mm','Wera','950/9 Hex-Plus Multicolour 1 SB','All domains','DIN 911 / ISO 2936','OB',1,42,'Replace when worn','Current official hex key set page. Daily use for socket-head screws, drives, relays and rail equipment.','https://www.wera.de/fr/outillages/950-9-hex-plus-multicolour-1-sb-jeu-de-cles-males-coudees-syst-metrique-blacklaser'],
  ['t21','T','OUTILS','Belt pouch for two pliers','Knipex','00 19 72 LE','All domains','–','OB',1,68,'Replace when worn','Official KNIPEX belt pouch for two pliers up to 150 mm, with side holder for flashlight or pen. Corrects the previous mismatched tool-bag description.','https://www.knipex.com/products/tool-bags-and-tool-cases/belt-pouch-for-two-pliers-empty/belt-pouch-two-pliers-empty/001972LE'],
  ['t22','T','OUTILS','Heat Gun 2000W 50-630°C + 2 nozzles','Bosch','GHG 20-63 Professional','LV / DC – Sleeves & Cables','–','OB',1,95,'Replace if defective','Official Bosch product page for the GHG 20-63 heat gun, suitable for heat-shrink work on lugs, cables and connectors.','https://www.bosch-professional.com/de/de/products/ghg-20-63-06012A6200'],
  ['t23','T','OUTILS','Telescopic Magnetic Pick-up Tool','Stahlwille','12601','All domains','–','OB',1,14,'Replace as needed','Official magnetic pick-up tool page for recovering metallic parts in inaccessible installation areas.','https://stahlwille.com/en_us/products/detail/826592'],
  ['t24','T','OUTILS','Telescopic Inspection Mirror 360°','Gedore','718 / 1979841','All domains','–','RC',1,22,'Replace as needed','Official inspection mirror page with 360° swivel mirror and telescopic handle for inaccessible inspection points.','https://www.gedore.com/en-de/products/measuring---marking---testing-tools/test-tools/mirror/718-inspection-mirror/718---1979841'],
  ['t25','T','OUTILS','Tape Measure 5m magnetic anti-shock','Stanley','STHT36334 FatMax','All domains','–','OB',1,18,'Replace as needed','Double-sided magnetic hook useful for solo work.','https://www.stanley.fr/outils-a-main/mesure/metres-ruban/fatmax-autolock-5m'],
  ['t26','T','OUTILS','Permanent Industrial Markers oil/heat resistant – pack 3','Edding','8300 Industry Permanent Marker','All domains','–','OB',3,5.5,'Consumable','Black, red, blue. Industrial marker for oily/dusty surfaces, heat resistant up to 300°C.','https://www.edding.com/en-us/products/edding-8300-industry-permanent-marker/'],
  ['t27','T','OUTILS','Rechargeable Work Light 500 lm magnet IP65','Scangrip','UNIFORM 03.6208','All domains','IP65 – EN 13032-1','OB',1,89,'Annual (battery)','Portable inspection/work light with integrated magnet, hook and adjustable output up to 500 lm. Replaces the obsolete FLEX WEAR link.','https://www.scangrip.com/fr-fr/boutique/lampes-de-travail/03-6208-uniform'],
  ['t28','T','OUTILS','Cordless Drill/Driver 18V + case + 2 batteries','Bosch','GSR 18V-55 Professional','All domains','–','OB',1,317,'Replace if defective','Official Bosch product page for the 18V drill/driver used for terminal blocks, cabinet covers and light cable tray work.','https://www.bosch-professional.com/fr/fr/products/gsr-18v-55-06019H5200'],
  ['t29','T','CABLE','Hand-operated Hydraulic Crimping Tool 10-240mm²','Klauke','HK 60 VP','LV / DC Traction','EN 61238-1','OB',1,895,'2 years','Official Klauke hydraulic crimping tool page for cable lugs and connectors up to 240 mm² without interchangeable dies.','https://www.klauke.com/bh/en/ek-60-ft-hand-operated-hydraulic-crimping-tool-10-240-mm'],
  ['t30','T','CABLE','Automatic Wire Stripper 0.2-6mm²','Jokari','SECURA 2K 20100','LV / DC','–','OB',1,42,'Replace when worn','Current official JOKARI automatic stripper page for 0.2 to 6.0 mm² conductors. More reliable than the old T-Stripper Vario link.','https://jokari.de/en/SECURA-2K-2.htm'],
  ['t31','T','CABLE','Cable Jacket Knife for round cables 8-28 mm','Jokari','Cable Knife No. 28G Standard','BT / HTA','–','OB',1,32,'Replace when worn','Current official JOKARI cable knife page for round cable sheaths and longitudinal cuts without damaging inner conductors.','https://jokari.de/en/products/detail/cable-knife-no-28g-standard'],
  ['t32','T','CABLE','Portable Cable Label Printer P-touch Bluetooth','Brother','PT-E310BTVP','All domains','–','RC',1,227,'Battery replacement','Official current Brother product page for the portable industrial Bluetooth labeller used for cable and terminal marking.','https://store.brother.fr/appareils/imprimantes-d-etiquettes/p-touch/pt/pte310btvp'],
  ['t33','T','CABLE','Insulating Tape Scotch 23 self-amalgamating + Scotch 35 PVC','3M','Scotch 23 + Scotch 35','LV / DC','UL 510 / IEC 60454','OB',2,12,'Consumable','23 = self-amalgamating, 35 = standard PVC insulating tape.','https://www.3m.fr/3M/fr_FR/p/d/v000057551/'],
  ['t34','T','LOTO','Personal LOTO Kit – electrical','Brady','120886','All domains','OSHA / Lockout Tagout','OB',1,109,'Annual (inspection)','Current official Brady personal electrical lockout kit page with pouch, padlock, hasps, breaker lockouts and tags.','https://www.bradyid.com/products/personal-lockout-kit-electrical-pid-120886'],
  ['t35','T','LOTO','Lockout Padlock thermoplastic – 1 unique key','Master Lock','410RED Zenex','All domains','Lockout Tagout','OB',2,20,'5 years or replacement','Current official Master Lock product page for the keyed-different thermoplastic safety padlock.','https://fr.masterlock.com/products/product/410RED'],
  ['t36','T','LOTO','Danger Lockout Tags – pack 25','Brady','48797','All domains','Lockout Tagout','OB',1,18,'Consumable','Current official Brady pack of 25 durable danger lockout tags with brass grommet and write-on area.','https://www.bradyid.com/products/bilingual-danger-this-tag-lock-to-be-removed-only-by-person-shown-on-back-tags-pid-48797'],
  ['e01','E','EPI','Insulating Gloves Class 4 (36kV)','Honeywell / Salisbury','NG418RB/11 Electriflex','MV 10-36kV','Class 4 – IEC EN 60903 / ASTM D120','OB',4,1101,'6 months (dielectric test)','Official Salisbury Electriflex class 4 glove page for high-voltage live work. Use with matching leather protectors sized for class 4 gloves.','https://www.salisburyshop.com/buy/product/salisbury-electriflex-class-4-rubber-insulating-gloves-ng418rb-11/211574'],
  ['e02','E','EPI','Insulating Gloves Class 2 (17kV) + leather protectors','Honeywell / Salisbury','GK218B/10H glove kit','DC Traction 1500V / BT 1000V','Class 2 – IEC EN 60903 / ASTM D120','OB',4,464,'6 months (dielectric test)','Official Salisbury glove kit page including class 2 gloves, leather protectors and storage bag for 1500 V DC traction or reinforced LV applications.','https://www.salisburyshop.com/buy/product/salisbury-size-10-1-2-class-2-black-insulating-rubber-gloves-kit-gk218b-10h/209680'],
  ['e03','E','EPI','Arc-flash Suit Class 3 (25 cal/cm²) – full coverall','Oberon','TCG25-XXL','MV/HV 25kV','IEC 61482-2 Class 3','OB',2,680,'3 years or after incident','Mandatory for work near 25kV live systems.','https://www.oberoncompany.com/arc-flash-clothing/arc-flash-suits'],
  ['e04','E','EPI','Arc-flash Face Shield 25 cal/cm² Class 3','Oberon','TCG25-HHG','MV/HV 25kV','IEC 61482-2 – Class 3','OB',2,220,'3 years or replacement','Compatible with insulating helmet. Arc Flash Rating minimum 25 cal/cm².','https://www.oberoncompany.com/arc-flash-face-protection'],
  ['e05','E','EPI','Switching Stick MV 1-36kV','DEHN','SCS 36 1000','MV 10-36kV','DIN VDE V 0681-1 / -2','OB',2,380,'Annual (dielectric test)','Official switching stick page for indoor/outdoor MV operation. Functional replacement for the previous CATU operating rod link.','https://www.dehn-international.com/store/p/en-DE/F48498/scs-switching-sticks'],
  ['e06','E','EPI','Insulating Protective Shutters up to 36kV','DEHN','Insulating Protective Shutters','MV 10-36kV','DIN VDE 0682-552','OB',2,145,'Annual (dielectric test)','Official DEHN document for insulating protective shutters used to protect against accidental contact with adjacent live parts.','https://www.dehn-international.com/sites/default/files/media/files/isolierende-schutzplatten-2090-en.pdf'],
  ['e07','E','OUTILS','Portable Tool Chest 3 lockable drawers','Beta Tools','RSC22','All domains','–','OB',1,245,'Replace when worn','Official Beta Tools 3-drawer portable chest with central lock and ball-bearing drawers, suitable for team tooling, testers and maintenance kits.','https://www.beta-tools.com/en/products/containers-and-assortments/portable-tool-chests-and-mobile-roller-cabs/portable-tool-chest-with-3-drawers.html'],
  ['e08','E','OUTILS','VDE 3/8" insulated socket/tool set – 23 pcs','Stahlwille','12171/19/4 VDE','LV / MV – Protected bolting','IEC 60900','OB',1,670,'Replace when worn','Official insulated 23-piece socket/tool set reference still online. The previous wording understated the full TCS kit content.','https://stahlwille.com/en_us/products/detail/893236'],
  ['e09','E','OUTILS','Cordless Impact Wrench 18V 400 Nm 1/2"','Bosch','GDS 18V-400 Professional','MV / HV – Heavy bolting','–','RC',1,265,'Replace if defective','Official Bosch product page for the 400 Nm 1/2 inch impact wrench used on heavy bolting, busbars and transformer work.','https://www.bosch-professional.com/uy/es/products/gds-18v-400-06019K00E0'],
  ['e10','E','OUTILS','Cordless Hammer Drill 18V + 2×2Ah batteries','Bosch','GSB 18V-55 Professional','All domains','–','RC',1,355,'Replace if defective','Official Bosch product page for the 18V hammer drill/driver used for heavy fixings, cabinet metalwork and cable trays. Current article 06019H5301 corresponds to the 2×2Ah L-BOXX kit.','https://www.bosch-professional.com/fr/fr/products/gsb-18v-55-06019H5301'],
  ['e11','E','OUTILS','Electronic Torque Wrench 2-20 Nm with 1/4" reversible ratchet insert','Stahlwille','MANOSKOP 714R/2 eClick','LV / DC – Fine bolting','DIN EN ISO 6789-2','OB',1,1468,'Annual (calibration)','Official documented torque wrench page with 2-20 Nm range, visual/acoustic feedback and calibration traceability.','https://stahlwille.com/en_us/products/detail/852642'],
  ['e12','E','OUTILS','Electronic Torque/Angle Wrench 20-200 Nm with 14x18 insert mount','Stahlwille','MANOSKOP 714/20','LV / MV – Medium bolting','DIN EN ISO 6789-2','OB',1,1268,'Annual (COFRAC calibration)','Official torque wrench page with 20-200 Nm range, suited to cabinet fixings, MV bolting and traceable calibration workflows.','https://stahlwille.com/en_us/products/detail/852570'],
  ['e13','E','OUTILS','Torque Wrench 3/4" 160-800 Nm – busbars','Stahlwille','730/80 Service MANOSKOP','MV / HV – Heavy bolting','DIN EN ISO 6789-2','OB',1,1180,'Annual (COFRAC calibration)','Official STAHLWILLE heavy-duty torque wrench page for large busbar, flange and substation bolting, with insert-tool holder for high-torque maintenance work.','https://stahlwille.com/en_us/products/detail/852072'],
  ['e14','E','OUTILS','Electronic Torque/Angle Wrench 20-200 Nm with USB/BLE traceability','Stahlwille','MANOSKOP 714R/20 eClick','LV / MV – Torque traceability','DIN EN ISO 6789-2 / VDI-VDE 2648-2','RC',1,1117,'Annual (COFRAC calibration)','Official electromechanical torque wrench page with data storage, micro USB communication and optional BLE module.','https://stahlwille.com/en_us/products/detail/852648'],
  ['e15','E','MHTA','MV Voltage Detector 1-36kV','DEHN','PHE4','MV 10-36kV','IEC 61243-1','OB',2,480,'Annual (mandatory calibration)','Official DEHN PHE4 page for medium-voltage installations up to 36 kV with self-test, acoustic and visual indication.','https://www.dehn-international.com/phe4-voltage-detector'],
  ['e16','E','MHTA','HV Voltage Detector 25kV – AC catenary','DEHN','PHE III 25 S 50 1P','HV 25kV Catenary','IEC 61243-1','OB',1,720,'Annual (mandatory calibration)','Official DEHN product page for overhead contact lines of electric railways up to 25 kV / 50 Hz.','https://dehn-international.com/store/p/en-DE/F41570/phe-iii-voltage-detector'],
  ['e17','E','MHTA','MV Phase Comparator synchronism 10-36kV','DEHN','PHV I','MV 10-36kV','EN/IEC 61481-1','OB',1,590,'Annual','Official phase comparator page for verifying in-phase conditions on three-phase systems.','https://www.dehn-international.com/store/h/en-DE/H986/phase-comparators'],
  ['e18','E','MHTA','Three-phase Power Quality Analyser Class A','Fluke','435-II','LV / MV (via CT/VT)','IEC 61000-4-30 Class A','OB',1,4200,'Annual (calibration)','Harmonics, dips, flicker analysis. Long-term recording.','https://www.fluke.com/fr-fr/produit/analyseurs-qualite-alimentation/fluke-435-ii'],
  ['e19','E','MHTA','Digital Insulation Resistance Meter 5kV DC','Megger','MIT525','LV / MV / Cables','IEC 61557-2','OB',1,1650,'Annual (calibration)','PI, DAR, DD measurement. MV cables and substation transformers.','https://www.megger.com/fr/products/test-equipment/insulation-resistance-testers/mit525'],
  ['e20','E','MHTA','Digital Insulation Resistance Meter 10kV DC','Megger','MIT1025/2','MV 10-36kV / HV 25kV','IEC 61557-2','RC',1,4422,'Annual (calibration)','Insulation testing of MV cables and 25kV transformer windings.','https://www.megger.com/fr/products/test-equipment/insulation-resistance-testers/mit1025'],
  ['e21','E','MHTA','Micro-ohmmeter Contact Resistance 10-200A DC','Megger','DLRO10X','MV / Switchgear','IEC 62271 / IEC 60044','OB',1,2650,'Annual (calibration)','Contact resistance of circuit breakers, disconnectors, busbars.','https://www.megger.com/fr/products/test-equipment/low-resistance-ohmmeters/dlro10x'],
  ['e22','E','MHTA','Three-phase Protection Relay Test Set','Omicron','CMC 353','MV / Protection','IEC 60255 – IEC 61850','OB',1,16500,'Annual (calibration)','Three-phase current/voltage injection. Tests differential, overcurrent, distance relays. Official OMICRON page notes the CMC 353 remains available until 31/12/2026.','https://www.omicronenergy.com/fr/produits/cmc-353/'],
  ['e23','E','MHTA','CT/VT Transformer Turns Ratio + Polarity Tester','Megger','MRCT / TTR300','MV / CT-VT','IEC 60044-1 / IEC 61869','RC',1,3200,'Annual (calibration)','Turns ratio, excitation current, CT and VT polarity.','https://www.megger.com/fr/products/test-equipment/transformer-test/mrct'],
  ['e24','E','MHTA','VLF Cable Insulation Tester MV 34kV','Baur','PHG TD/VLF 34 kV','MV 10-36kV','IEC 60060-3 / NF C 33-052','RC',1,8500,'Every 2 years','In-service dielectric testing of MV cables. 0.1 Hz frequency.','https://www.baur.eu/products/vlf-testing/phg-td'],
  ['e25','E','MHTA','Clamp-on Earth Tester – Rt measurement without disconnection','Fluke','1630-2 FC','All domains – Earth network','IEC 61557-5','OB',1,1861,'Annual (calibration)','Earth resistance measurement without disconnecting electrodes. Fluke Connect WiFi.','https://www.fluke.com/fr-fr/produit/mesure-resistance-terre/fluke-1630-2-fc'],
  ['e26','E','MHTA','MV Cable Screen Continuity/Insulation Test','Megger','MIT525 + screen accessories','MV 10-36kV','IEC 60502-4','OB',1,185,'Annual (calibration)','Cu/Al screen continuity and insulation after MV cable jointing.','https://www.megger.com/fr/products/test-equipment/insulation-resistance-testers/mit525'],
  ['e27','E','MBTDC','AC/DC Clamp Meter 2500A + iFlex flexible probe','Fluke','376 FC + iFlex Kit','DC Traction 750-1500V / LV','CAT III 1000V / CAT IV 600V','OB',2,570,'Annual (calibration)','Traction return current measurement up to 2500A DC.','https://www.fluke.com/fr-fr/produit/mesure-courant/pinces-amperemetriques/fluke-376-fc'],
  ['e28','E','MBTDC','Network Analyser – voltage, power, energy','Metrel','MI 2892 Power Master','DC Traction 750-1500V','IEC 61000-4-30','OB',1,2100,'Annual (calibration)','Current official Metrel product page for the MI 2892 platform, replacing the obsolete PowerQ4 Plus reference.','https://www.metrel.si/en/shop/PQA/class-a-power-quality-analysers/mi-2892.html'],
  ['e29','E','MBTDC','Stationary Battery Tester – internal impedance','Fluke','BT521 Battery Analyzer','DC Auxiliaries 24-110V','IEEE 1188 / IEC 60896','OB',1,6308,'Annual (calibration)','UPS, 24VDC, 110VDC battery diagnostics at substations.','https://www.fluke.com/fr-fr/produit/testeurs-batteries/fluke-bt521'],
  ['e30','E','MBTDC','Earth Resistance Tester 3 and 4-pole – GEO Kit','Fluke','1625-2 GEO Kit','All domains – Earthing','IEC 61557-5','OB',1,3746,'Annual (calibration)','3- and 4-probe method. Essential for substations and earth loops.','https://www.fluke.com/fr-fr/produit/mesure-resistance-terre/fluke-1625-2-geo'],
  ['e31','E','DIAG','Radiometric Thermal Camera 320×240 – MSX WiFi','Fluke','Ti480 PRO','All domains','EN 13187 / IEC 60068-2','OB',1,7861,'Annual (COFRAC calibration)','Preventive inspection HV/LV/DC. Hot spots on breakers, cables, connections.','https://www.fluke.com/fr-fr/produit/cameras-thermiques/fluke-ti480-pro'],
  ['e32','E','DIAG','Portable Oscilloscope 4-ch 200MHz CAT III','Fluke','190-204/S ScopeMeter','LV / DC Traction','CAT III 1000V – IP51','RC',1,2400,'Annual','Waveform analysis for drives, converters, relays.','https://www.fluke.com/fr-fr/produit/oscilloscopes/fluke-190-204-s'],
  ['e33','E','DIAG','Cable Fault Locator TDR LV/MV','Megger','PFL40B','LV / MV / DC Traction','IEC 61196','RC',1,4200,'Annual','Locate breaks, short-circuits, insulation faults. Accuracy ±1m.','https://www.megger.com/fr/products/test-equipment/cable-fault-location/pfl40b'],
  ['e34','E','DIAG','Portable EMC/HF Spectrum Analyser','Anritsu','MS2711E','All domains – EMC','IEC 61000-4 series','OP',1,3800,'Every 2 years','Harmonic disturbances, EMC, track signalling interference.','https://www.anritsu.com/fr-FR/test-measurement/products/ms2711e'],
  ['e35','E','LOTO','Portable Earthing Stick for Switchgear Installations','DEHN','ES SK 1000 / earthing stick range','MV 10-36kV','EN/IEC 61230 (DIN VDE 0683-100)','OB',2,850,'Annual (dielectric test)','Official DEHN earthing stick page for fitting portable earthing and short-circuiting devices on switchgear installations. Safer maintained alternative to the obsolete CATU earthing rod page.','https://www.dehn-international.com/store/p/en-DE/F49866/earthing-sticks-for-switchgear-installations'],
  ['e36','E','LOTO','Railway Earthing and Short-Circuiting Device 750-1500V DC','DEHN','EKV K 50 8500','DC Traction 750-1500V','EN/IEC 61230 / IEC 61138','OB',2,620,'Annual (dielectric test)','Official DEHN railway earthing and short-circuiting device page with overhead contact-line clamp and rail clamp for electrified railway work.','https://www.dehn-international.com/store/p/en-DE/F78297/earthing-and-short-circuiting-devices-for-railway-applications'],
  ['e37','E','LOTO','Group LOTO Station – hasp 13 padlocks','Brady','65674 + 51174 hasp','All domains','ISO 3864 / EN 1037','OB',2,145,'Annual','Steel hasp + collective padlock. Multi-technician interventions.','https://www.bradyid.eu/fr-fr/lockout-tagout/hasp-lockouts/51174'],
  ['e38','E','CABLE','Ratchet Cable Cutter up to 240mm²','Knipex','95 31 250','LV / DC Traction / MT','–','OB',1,145,'Replace blades when worn','Official KNIPEX ratchet cable cutter datasheet for clean cutting of Cu and Al cables in confined spaces. Easier to source than the old legacy URL.','https://www.knipex.com/sites/default/files/Product%20data%20sheet%20EN%2095%2031%20250.pdf'],
  ['e39','E','CABLE','Manual Hydraulic Cable Cutter up to 55 mm diameter','Cembre','HT-TC055','MV 10-36kV / DC Traction','–','OB',1,3542,'Annual (inspection)','Official Cembre hydraulic cutter page for copper, aluminium and reinforced conductors with openable head and rotating cutter head.','https://products.cembre.com/en_US/usa-canada-mexico/product/ht-tc055'],
  ['e40','E','CABLE','MV Armoured Cable Shears – up to 50mm diam.','Greenlee','CS750','MV armoured cables','EN ISO 5744','RC',1,320,'Annual (blade inspection)','Cutting MV cables with steel wire armour or aluminium tape.','https://www.greenlee.com/cable-cutting-tools/cs750'],
  ['e41','E','CABLE','Ratchet Crimping Tool small sections 0.5-16mm²','Weidmuller','PZ 6 Roto','LV / DC – Control circuits 24-110V','EN 60947-7 / DIN 46228','OB',2,155,'Replace when worn','Crimping ferrules and lugs for control circuits. Anti-return ratchet.','https://www.weidmueller.com/fr/products/tools/crimping-tools/pz-6-roto'],
  ['e42','E','CABLE','Fibreglass Fish Tape 20m – cable pulling needle','Greenlee','540','All domains – Cable pulling','–','OB',1,85,'Replace if broken','Pulling LV, DC, control cables in conduits. Non-conductive fibreglass.','https://www.greenlee.com/fish-tapes/540'],
  ['e43','E','CABLE','MV Cable Sealing Kit – resin + heat-shrink sleeves','Raychem / nVent','RSTI-A / CSJA Series','MV 10-36kV / DC Traction','IEC 60502-4 / HD 620','OB',1,220,'Consumable','MV cable jointing, termination or repair. Moisture protection.','https://www.nvent.com/fr-fr/raychem/cables/cable-accessories'],
  ['e44','E','COLLECTIF','Portable Inverter Generator 3.2 kW – 230V silent','Honda','EU32i','LV Auxiliaries','EN 12601','RC',1,4169,'Annual (oil change + service)','Current official Honda portable inverter generator page. Compact, quiet and easier to source than the discontinued EU30i reference.','https://shop.honda.fr/p/groupe-eu-32-ik-3200w/15323020/'],
  ['e45','E','COLLECTIF','Site Barrier + Red/White Delimitation Kit','Novap','1320147 + 3055009','All domains – Track safety','NF EN ISO 7010','OB',2,280,'Annual (inspection)','Directly sourceable Novap combination for local worksite delimitation: telescopic red/white barrier with matching red/white site tape.','https://www.novap.fr/poteaux-barrieres/barrieres/barrieres-telescopiques/barriere-telescopique-de-1-a-1-80-m-blanche-rouge-blanc-hachure-type-k2.html'],
  ['e46','E','COLLECTIF','Professional First Aid Case DIN 13169','SÖHNGEN','DYNAMIC-GLOW L 0301401','All domains','DIN 13169','OB',1,339,'6 months (expiry check)','Official SÖHNGEN first aid case page with DIN 13169 filling, wall holder and splash-protected case for vehicles and workshops.','https://shop.aluderm.de/erste-hilfe-koffer-orange-dynamic-glow-l-ind-norm-plus-din-13169'],
  ['e47','E','COLLECTIF','CO2 Extinguisher 5kg – class B electrical cabinets','GLORIA','KS 5 ST','All domains','EN 3','OB',1,140,'Annual (pressure check)','Official GLORIA CO2 extinguisher page listing 5 kg models suitable for electrical equipment and residue-free firefighting.','https://www.gloria.de/de/produkt/feuerloescher/co2-handhebel/'],
  ['e48','E','COLLECTIF','Rugged Laptop Toughbook 55 Series','Panasonic','TOUGHBOOK 55 mk3','All domains – Diagnostics','IP53 – MIL-STD-810H','RC',2,2800,'5-year replacement','Current official Panasonic Connect page for the Toughbook 55 platform used for IEC 61850 relay connection, SCADA and drive diagnostics.','https://eu.connect.panasonic.com/de/en/products/toughbook/toughbook-55-series'],
];

const TOOL_IMAGE_MODULES = import.meta.glob("./images/*.{png,jpg,jpeg,webp,avif,gif}", {
  eager: true,
  import: "default",
});

const TOOL_IMAGE_URLS = Object.fromEntries(
  Object.entries(TOOL_IMAGE_MODULES).map(([path, url]) => [
    path.split("/").pop().toLowerCase(),
    url,
  ])
);

const TOOLS = RAW.map(([id,level,cat,name,brand,model,domain,norm,statut,qty,price,period,notes,productUrl]) => {
  // derive imgFile from id + brand slug
  const brandSlug = brand.split('/')[0].trim().toLowerCase().replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_').replace(/_$/,'');
  const modelSlug = model.split('/')[0].trim().toLowerCase().replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_').replace(/_$/,'');
  const imgFile = `${id}_${brandSlug}_${modelSlug}.jpg`;
  const imgSrc = TOOL_IMAGE_URLS[imgFile.toLowerCase()] || null;
  return {id,level,cat,name,brand,model,domain,norm,statut,qty,price,period,notes,productUrl,imgFile,imgSrc};
});

// ─── SVG CATEGORY ICONS ───────────────────────────────────────────────────────
const CatSVG = ({ cat, size=72 }) => {
  const s = { strokeLinecap:'round', strokeLinejoin:'round', fill:'none' };
  const icons = {
    EPI:[
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
    EPI:C.orangeDim, MBTDC:C.tealDim, MHTA:C.blueDim, CABLE:C.amberDim,
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
          objectFit: 'cover',
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
function CopyBtn({ text, label, accent=C.teal }) {
  const [ok, setOk] = useState(false);
  const go = () => { navigator.clipboard?.writeText(text).then(()=>{ setOk(true); setTimeout(()=>setOk(false),2000); }); };
  return (
    <button onClick={go} style={{
      background:ok?accent+'22':C.bgMid, border:`1px solid ${ok?accent:C.borderL}`,
      color:ok?accent:C.textSub, borderRadius:6, padding:'5px 11px', cursor:'pointer',
      fontSize:11, fontWeight:600, display:'flex', alignItems:'center', gap:5,
      fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.03em', transition:'all 0.15s',
    }}>
      {ok?<CheckCheck size={11}/>:<Copy size={11}/>} {ok?'Copied!':label}
    </button>
  );
}

function PrimaryUse({ tool }) {
  return tool.notes;
}

function MetaTile({ label, value, accent }) {
  return (
    <div style={{ background:C.bgMid, borderRadius:10, padding:'11px 12px', border:`1px solid ${C.border}` }}>
      <div style={{ fontSize:9, color:accent||C.textSub, marginBottom:5, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize:12, color:C.text, fontWeight:500, lineHeight:1.45 }}>{value}</div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [ctx, setCtx]     = useState('metro');
  const [lvl, setLvl]     = useState('ALL');
  const [cat, setCat]     = useState('ALL');
  const [stat, setStat]   = useState('ALL');
  const [q, setQ]         = useState('');
  const [sel, setSel]     = useState(new Set());
  const [modal, setModal] = useState(null);
  const [vw, setVw]       = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  // ── Workforce config per subsystem ──
  const [workforce, setWorkforce] = useState({
    POS:   { tech:4, equipe:1 },
    PSD:   { tech:3, equipe:1 },
    CAT:   { tech:4, equipe:1 },
    TRACK: { tech:5, equipe:2 },
    '3RD': { tech:3, equipe:1 },
    AFC:   { tech:2, equipe:1 },
  });
  const nbTech  = workforce['POS'].tech;
  const nbEquipe = workforce['POS'].equipe;
  const setNbTech  = v => setWorkforce(p=>({...p, POS:{...p.POS, tech:Math.max(1,v)}}));
  const setNbEquipe = v => setWorkforce(p=>({...p, POS:{...p.POS, equipe:Math.max(1,v)}}));

  const context = CONTEXTS.find(c=>c.id===ctx);
  const acc = context.accent;
  const isTablet = vw < 1120;
  const isMobile = vw < 760;

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const filtered = useMemo(()=>TOOLS.filter(t=>{
    if(lvl!=='ALL'&&t.level!==lvl) return false;
    if(cat!=='ALL'&&t.cat!==cat) return false;
    if(stat!=='ALL'&&t.statut!==stat) return false;
    if(q){ const s=q.toLowerCase(); return t.name.toLowerCase().includes(s)||t.brand.toLowerCase().includes(s)||t.model.toLowerCase().includes(s); }
    return true;
  }),[lvl,cat,stat,q]);

  const toggle = id => setSel(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  const selT   = TOOLS.filter(t=>sel.has(t.id));
  const total  = selT.reduce((s,t)=>s+t.qty*t.price,0);
  const tTotal = selT.filter(t=>t.level==='T').reduce((s,t)=>s+t.qty*t.price,0);
  const eTotal = selT.filter(t=>t.level==='E').reduce((s,t)=>s+t.qty*t.price,0);
  const mandatorySelected = selT.filter(t=>t.statut==='OB').length;
  const mandatoryTotal = TOOLS.filter(t=>t.statut==='OB').length;
  const coveragePct = mandatoryTotal ? Math.round((mandatorySelected / mandatoryTotal) * 100) : 0;
  const byCat  = Object.entries(CATS).map(([k,v])=>({key:k,...v,total:selT.filter(t=>t.cat===k).reduce((s,t)=>s+t.qty*t.price,0)})).filter(c=>c.total>0);
  const fmt    = n => new Intl.NumberFormat('fr-FR',{minimumFractionDigits:0,maximumFractionDigits:0}).format(n);

  const pill = (active, color, label, fn) => (
    <button onClick={fn} style={{
      background:active?color+'25':C.bgMid, border:`1px solid ${active?color:C.border}`,
      color:active?color:C.textSub, padding:'5px 12px', borderRadius:20, cursor:'pointer',
      fontSize:11, fontWeight:600, fontFamily:"'Barlow Condensed', sans-serif",
      letterSpacing:'0.04em', transition:'all 0.15s', whiteSpace:'nowrap',
    }}>{label}</button>
  );

  return (
    <div style={{
      fontFamily:"'Barlow', sans-serif",
      background:`
        radial-gradient(circle at top right, rgba(0,201,167,0.14), transparent 24%),
        radial-gradient(circle at top left, rgba(78,205,196,0.08), transparent 22%),
        linear-gradient(180deg, #0E2121 0%, ${C.bg} 22%, ${C.bg} 100%)
      `,
      minHeight:'100vh',
      color:C.text,
    }}>
      <style>{fontStyle}</style>

      {/* ── HEADER ── */}
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
                ENERGY TOOLING MANAGER · POS v4.0
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
              padding:'10px 18px', cursor:s.active?'pointer':'default',
              borderBottom:`2px solid ${s.id==='POS'?acc:'transparent'}`,
              opacity:s.active?1:0.35, transition:'all 0.15s',
            }}>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:13, fontWeight:700, letterSpacing:'0.07em', color:s.id==='POS'?acc:C.textSub }}>{s.label}</div>
              <div style={{ fontFamily:"'Barlow', sans-serif", fontSize:9, color:C.textMuted, marginTop:1 }}>{s.full}{!s.active&&' · soon'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ display:'flex', flexDirection:isTablet?'column':'row', height:isTablet?'auto':'calc(100vh - 118px)', overflow:'hidden' }}>

        {/* ── MAIN PANEL ── */}
        <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>

          {/* Filter bar */}
          <div style={{ padding:'10px 18px', borderBottom:`1px solid ${C.border}`, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', background:C.bgMid }}>
            {/* Search */}
            <div style={{ position:'relative', flex:isMobile?'1 1 100%':'1 1 240px', minWidth:isMobile?'100%':210 }}>
              <Search size={13} color={C.textSub} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }}/>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search tool, brand..." style={{
                width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:8,
                padding:'7px 10px 7px 30px', color:C.text, fontSize:12, outline:'none',
                fontFamily:"'Barlow', sans-serif",
              }}/>
            </div>

            {/* Level */}
            <div style={{ display:'flex', gap:5 }}>
              {[['ALL','All'],['T','Technician'],['E','Team']].map(([v,l])=>pill(lvl===v,acc,l,()=>setLvl(v)))}
            </div>

            {/* Statut */}
            <div style={{ display:'flex', gap:5 }}>
              {[['ALL','All statuses'],['OB','Mandatory'],['RC','Recommended'],['OP','Optional']].map(([v,l])=>
                pill(stat===v, STATUTS[v]?.color||acc, l, ()=>setStat(v))
              )}
            </div>

            {/* Category */}
            <select value={cat} onChange={e=>setCat(e.target.value)} style={{
              background:C.bg, border:`1px solid ${C.border}`, color:C.text, padding:'6px 10px',
              borderRadius:8, fontSize:11, outline:'none', cursor:'pointer', fontFamily:"'Barlow', sans-serif",
            }}>
              <option value="ALL">All categories</option>
              {Object.entries(CATS).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>

            <div style={{ marginLeft:isMobile?0:'auto', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', width:isMobile?'100%':'auto' }}>
              <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:C.textSub }}>{filtered.length} tools</span>
              <button onClick={()=>setSel(p=>{const n=new Set(p);filtered.forEach(t=>n.add(t.id));return n;})}
                style={{ background:C.bg, border:`1px solid ${C.border}`, color:C.textSub, padding:'5px 11px', borderRadius:6, cursor:'pointer', fontSize:11, fontFamily:"'Barlow', sans-serif" }}>
                Select visible
              </button>
              <button onClick={()=>setSel(p=>{const n=new Set(p);filtered.forEach(t=>n.delete(t.id));return n;})}
                style={{ background:C.bg, border:`1px solid ${C.border}`, color:C.textSub, padding:'5px 11px', borderRadius:6, cursor:'pointer', fontSize:11, fontFamily:"'Barlow', sans-serif" }}>
                Clear visible
              </button>
            </div>
          </div>

          {/* Tool cards */}
          <div style={{ flex:1, overflowY:'auto', padding:isMobile?'12px 12px 16px':'14px 18px' }}>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(auto-fill, minmax(325px, 1fr))', gap:12 }}>
              {filtered.map((t,i)=>{
                const isSel=sel.has(t.id), c=CATS[t.cat], s=STATUTS[t.statut];
                return (
                  <div key={t.id} style={{
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
                            color:t.level==='T'?C.teal:C.blue, background:t.level==='T'?C.tealDim:C.blueDim,
                            padding:'3px 8px', borderRadius:999 }}>
                            {t.level==='T'?'TECH':'TEAM'}
                          </span>
                        </div>
                        {/* Checkbox */}
                        <div onClick={e=>{e.stopPropagation();toggle(t.id);}} style={{
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
                            {fmt(t.price)} €
                          </div>
                          <div style={{ fontSize:10, color:C.textSub, marginTop:3 }}>
                            {t.qty} {t.level==='T'?'per technician':'per team'}
                          </div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:isSel?c.color:C.textSub, fontWeight:600 }}>
                            {fmt(t.qty*t.price)} €
                          </div>
                          <div style={{ fontSize:9, color:C.textMuted, marginTop:2 }}>estimated block</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── SYNTHESIS PANEL ── */}
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
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[['T','Technician',C.teal,tTotal],['E','Team',C.blue,eTotal]].map(([lv,label,color,budget])=>(
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
                <span style={{ fontSize:10, fontWeight:700, color:acc, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>WORKFORCE — POS</span>
              </div>
              <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  ['No. of technicians', nbTech, setNbTech, C.teal],
                  ['No. of teams', nbEquipe, setNbEquipe, C.blue],
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
                    [`${nbTech} tech · ${nbEquipe} team${nbEquipe>1?'s':''}`, nbTech*tTotal + nbEquipe*eTotal, acc, true],
                    [`Technicians (×${nbTech})`, nbTech*tTotal, C.teal, false],
                    [`Teams (×${nbEquipe})`, nbEquipe*eTotal, C.blue, false],
                  ].map(([label, val, col, bold], idx)=>(
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom: idx<2?`1px solid ${C.border}`:'none', opacity: idx>0&&val===0?0.4:1 }}>
                      <span style={{ fontSize: bold?12:10, color: bold?C.text:C.textSub, fontWeight: bold?600:400 }}>{label}</span>
                      <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: bold?14:11, fontWeight: bold?700:500, color:col }}>{fmt(val)} €</span>
                    </div>
                  ))}
                </div>
                {/* Budget per tech / per equipe */}
                <div style={{ padding:'10px 14px', borderTop:`1px solid ${C.border}`, background:C.bgMid, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {[['/ technician', tTotal, C.teal], ['/ team', eTotal, C.blue]].map(([l,v,col])=>(
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
              <div style={{ fontSize:9, color:C.textSub, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.08em', marginBottom:8 }}>POS DATABASE — {TOOLS.length} TOOLS</div>
              {[
                ['Technician', TOOLS.filter(t=>t.level==='T').length, C.teal],
                ['Team', TOOLS.filter(t=>t.level==='E').length, C.blue],
                ['Mandatory', TOOLS.filter(t=>t.statut==='OB').length, C.orange],
              ].map(([l,v,col])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'3px 0' }}>
                  <span style={{ fontSize:10, color:C.textSub }}>{l}</span>
                  <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, fontWeight:600, color:col }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL ── */}
      {modal&&(()=>{
        const c=CATS[modal.cat], s=STATUTS[modal.statut], isSel=sel.has(modal.id);
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
                    <span style={{ background:modal.level==='T'?C.tealDim:C.blueDim, color:modal.level==='T'?C.teal:C.blue, borderRadius:999, padding:'4px 11px', fontSize:11, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif" }}>
                      {modal.level==='T'?'👤 Technician':'👥 Team'}
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
                  <div style={{ width:'100%', height:170, background:C.bg, borderRadius:16, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', padding:16, animation:'imageBreath 4.2s ease-in-out infinite' }}>
                    <ToolVisual tool={modal} size={122} radius={14}/>
                  </div>

                  {/* Price */}
                  <div style={{ background:C.bg, borderRadius:12, padding:'14px 16px', textAlign:'left', width:'100%', border:`1px solid ${c.color}30` }}>
                    <div style={{ fontSize:9, color:C.textSub, marginBottom:5, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>COST SNAPSHOT</div>
                    <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:24, fontWeight:700, color:c.color }}>{fmt(modal.price)} €</div>
                    <div style={{ fontSize:11, color:C.textSub, marginTop:4 }}>{modal.qty} {modal.level==='E'?'per team':'per technician'}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}` }}>
                      <span style={{ fontSize:10, color:C.textSub }}>Selection block</span>
                      <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:13, fontWeight:700, color:C.text }}>{fmt(modal.qty*modal.price)} €</span>
                    </div>
                  </div>

                  <div style={{ width:'100%', display:'grid', gridTemplateColumns:'1fr', gap:8 }}>
                    <MetaTile label="Voltage domain" value={modal.domain} accent={c.color}/>
                    <MetaTile label="Maintenance" value={modal.period} accent={C.violet}/>
                    <MetaTile label="Quantity baseline" value={`${modal.qty} ${modal.level==='T'?'per technician':'per team'}`} accent={modal.level==='T'?C.teal:C.blue}/>
                  </div>

                  <button onClick={()=>toggle(modal.id)} style={{
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
                            ['Quantity baseline', `${modal.qty} ${modal.level==='T'?'per technician':'per team'}`],
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
