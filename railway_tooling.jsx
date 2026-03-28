import React, { useState, useMemo } from "react";
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
  input::placeholder { color:#3A6060; }
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
  ['t01','T','EPI','TRMS Multimeter CAT IV 1000V','Fluke','289/EUR','LV / DC Traction','CAT IV 1000V – IEC 61010','OB',1,340,'Annual (calibration)','Integrated data logger. AC/DC measurements: voltage, current, resistance, continuity. Absolute field reference.','https://www.fluke.com/fr-fr/produit/multimetres/multimetres-numeriques/fluke-289'],
  ['t02','T','EPI','Non-contact AC Voltage Detector 100-1000V','Fluke','T6-1000PRO','LV','CAT IV 1000V','OB',1,155,'Annual','Non-contact measurement, no leads required. Essential LV safety. Instant detection before any approach.','https://www.fluke.com/fr-fr/produit/testeurs-electriques/testeurs-tension/fluke-t6-1000-pro'],
  ['t03','T','EPI','Bipolar LV Voltage Tester 24V-1000V AC/DC','Chauvin Arnoux','CA 6420 N','LV / DC Traction','CAT IV 1000V – NF EN 61243-3','OB',1,82,'Annual','Compliant with NF EN 61243-3. Audible whistle. Mandatory before any intervention.','https://www.chauvin-arnoux.com/fr/produits/category/detecteurs/ca-6420n'],
  ['t04','T','EPI','Insulating Gloves Class 0 (750V) + leather overgloves','Honeywell / Salisbury','2750R/9H + AT127','LV / DC Traction','Classe 0 – IEC 60903','OB',1,85,'6 months (dielectric test)','Replace after dielectric test failure or damage. Store in provided case.','https://www.salisburybyhoneywell.com/en/products/electrical-safety-gloves'],
  ['t05','T','EPI','Electrical Safety Helmet with Integrated Faceshield','JSP','EVO VISTAshield','All domains','EN 397 – EN 50365 – EN 166','OB',1,58,'3 years','Integrated faceshield helmet with low-voltage electrical insulation performance and better face coverage than the previous link.','https://www.jspsafety.com/products/PPE/Head-Protection/EN-397-industrial-Safety-Helmets/VAR-AMC170-007-F00_EVO-ViSTAshield-Safety-Helmet-with-integrated-Faceshield'],
  ['t06','T','EPI','Arc-flash Safety Glasses EN166','Bolle Safety','Cobra COBPSI','All domains','EN 166 / EN 170','OB',1,22,'1 year','Anti-scratch, anti-fog. Systematic use during all interventions.','https://www.bollesafety.com/fr/lunettes-de-securite/cobra'],
  ['t07','T','EPI','Arc-flash Safety Kit Category 2 (8 cal/cm²)','Honeywell / Salisbury','SKCP8RG-WB','All domains','NFPA 70E – ASTM F1506','OB',1,510,'3 years or after arc event','Current official kit page for coat + pants + PrismShield faceshield + hard hat. More realistic replacement than the obsolete AGF40KIT link.','https://www.salisburyonline.com/product/384/salisbury-safety-kit-8-cal-coat-pant-as1000-prismshield-faceshield-skcp8rg-wb'],
  ['t08','T','EPI','ATEX Headlamp – 115 lm','Peli','2755Z0','All domains','ATEX Zone 0 – IP54','OB',1,118,'Annual (battery)','Current official intrinsically safe headlamp page. Suitable for hazardous environments and easier to source than the obsolete PIXA 3 ATEX reference.','https://www.peli.com/es/en/product/flashlights/headlamp/2755z0/'],
  ['t09','T','EPI','VDE 1000V Insulated Screwdriver Set – 7 pcs','Wiha','36295 SoftFinish VDE Set','LV','VDE – IEC 60900 – 1000V AC','OB',1,78,'Annual (visual inspection)','Bi-material handles. Compliant with DIN VDE 0680. Tested to 10kV.','https://www.wiha.com/fr-fr/outillage/tournevis/tournevis-vde/softfinish-vde/36295'],
  ['t10','T','EPI','VDE 1000V Insulated Pliers Set – 5 pcs','Knipex','00 20 12','LV','VDE – IEC 60900 – 1000V AC','OB',1,145,'Annual (visual inspection)','Bi-material sleeves tested to 10kV. Market-leading reference.','https://www.knipex.com/index.php?cl=details&artNum=002012'],
  ['t11','T','EPI','VDE 1000V Insulated Torque Wrench 1/2" 20-200 Nm','Stahlwille','730a/10 VDE','LV','VDE – IEC 60900','RC',1,210,'Annual (calibration)','For electrical bolted connections. Supplied with calibration certificate.','https://www.stahlwille.de/fr-FR/produits/cles-dynamometriques/cles-dynamometriques-vde'],
  ['t12','T','MBTDC','Portable Insulation Tester 500V/1000V','Fluke','1507 Insulation Tester','DC Auxiliaries 24-110V / LV','IEC 61557-2 – CAT IV 600V','OB',1,310,'Annual (calibration)','Daily use: insulation testing of 24VDC control circuits. Lighter than team MIT525.','https://www.fluke.com/fr-fr/produit/testeurs-isolement/fluke-1507'],
  ['t13','T','MBTDC','RCD Tester + Fault Loop Impedance','Fluke','1664 FC Multifunction','LV / Auxiliaries 400V','IEC 61557 – IEC 60364','OB',1,580,'Annual (calibration)','RCD test 10-500mA, fault loop impedance. Mandatory before 400V commissioning.','https://www.fluke.com/fr-fr/produit/testeurs-installation-electrique/fluke-1664-fc'],
  ['t14','T','MBTDC','Loop Impedance / Installation Tester NF C 15-100','Metrel','MI 3102H BT EurotestXE 2.5 kV','LV / Auxiliaries 400V','IEC 61557 – NF C 15-100','RC',1,420,'Annual (calibration)','Current official Metrel page for a Eurotest platform still suited to installation testing, loop impedance and higher-voltage insulation checks.','https://www.metrel.si/en/shop/EIS/multifunctional-testers/mi-3102h-bt.html'],
  ['t15','T','MBTDC','TRMS AC/DC Clamp Meter 1000A WiFi','Fluke','376 FC','LV / DC Traction 750-1500V','CAT IV 600V – CAT III 1000V','OB',1,430,'Annual (calibration)','DC measurement up to 2500A with iFlex. Fluke Connect wireless.','https://www.fluke.com/fr-fr/produit/mesure-courant/pinces-amperemetriques/fluke-376-fc'],
  ['t16','T','MBTDC','Three-phase Rotation Tester 40-700V AC','Fluke','9040','LV / Auxiliaries 400V','EN 61010 – EN 61557-7','OB',1,75,'Annual','Clear official product page for phase-sequence verification before energisation. Replaces the incorrect CA 6412 reference.','https://www.fluke.com/en/product/electrical-testing/basic-testers/fluke-9040'],
  ['t17','T','MBTDC','DC Polarity Tester with buzzer 24V-1500V','Metrel','MI2124','DC Traction 750-1500V','CAT III 1000V','RC',1,95,'Annual','Polarity and continuity check on DC traction circuits.','https://www.metrel.si/instruments/multimeters/MI2124'],
  ['t18','T','MBTDC','Infrared Thermometer -50 to +550°C','Fluke','62 MAX+','All domains','EN 61010-1','RC',1,115,'Annual','Fast detection of hot spots on lugs, busbars, fuses.','https://www.fluke.com/fr-fr/produit/thermometres/thermometres-infrarouges/fluke-62-max'],
  ['t19','T','OUTILS','Ratchet Set 3/8" metric 29 pcs','Wera','8100 SB 6 Zyklop Speed','LV / MV – Bolting','ISO 2725 / DIN 3122','OB',1,165,'Replace when worn','Current official ratchet/socket set page with compact textile case. Suitable for cabinet fixings, lugs and terminal work.','https://www.wera.de/fr/outillages/8100-sb-6-jeu-cliquet-zyklop-speed-a-carre-3-8-metrique'],
  ['t20','T','OUTILS','Hex Key Set metric 1.5-10mm','Wera','950/9 Hex-Plus Multicolour 1 SB','All domains','DIN 911 / ISO 2936','OB',1,42,'Replace when worn','Current official hex key set page. Daily use for socket-head screws, drives, relays and rail equipment.','https://www.wera.de/fr/outillages/950-9-hex-plus-multicolour-1-sb-jeu-de-cles-males-coudees-syst-metrique-blacklaser'],
  ['t21','T','OUTILS','Belt pouch for two pliers','Knipex','00 19 72 LE','All domains','–','OB',1,68,'Replace when worn','Official KNIPEX belt pouch for two pliers up to 150 mm, with side holder for flashlight or pen. Corrects the previous mismatched tool-bag description.','https://www.knipex.com/products/tool-bags-and-tool-cases/belt-pouch-for-two-pliers-empty/belt-pouch-two-pliers-empty/001972LE'],
  ['t22','T','OUTILS','Heat Gun 2000W 50-630°C + 2 nozzles','Bosch','GHG 20-63 Professional','LV / DC – Sleeves & Cables','–','OB',1,95,'Replace if defective','Official Bosch product page for the GHG 20-63 heat gun, suitable for heat-shrink work on lugs, cables and connectors.','https://www.bosch-professional.com/de/de/products/ghg-20-63-06012A6200'],
  ['t23','T','OUTILS','Telescopic Magnetic Pick-up Rod 65cm – 600g','Facom','DA.15PB','All domains','–','OB',1,14,'Replace as needed','Retrieve screws, bolts, lugs dropped inside cabinets or conduits.','https://www.facom.com/fr/tools/reaching-tools/DA.15PB.html'],
  ['t24','T','OUTILS','Telescopic Inspection Mirror LED 360°','Facom','S.270PB','All domains','–','RC',1,22,'Replace as needed','Read nameplates and trace wiring in inaccessible areas.','https://www.facom.com/fr/tools/inspection-tools/S.270PB.html'],
  ['t25','T','OUTILS','Tape Measure 5m magnetic anti-shock','Stanley','STHT36334 FatMax','All domains','–','OB',1,18,'Replace as needed','Double-sided magnetic hook useful for solo work.','https://www.stanley.fr/outils-a-main/mesure/metres-ruban/fatmax-autolock-5m'],
  ['t26','T','OUTILS','Permanent Industrial Markers oil/heat resistant – pack 3','Edding','8300 Industry Permanent Marker','All domains','–','OB',3,5.5,'Consumable','Black, red, blue. Industrial marker for oily/dusty surfaces, heat resistant up to 300°C.','https://www.edding.com/en-us/products/edding-8300-industry-permanent-marker/'],
  ['t27','T','OUTILS','Rechargeable Work Light 500 lm magnet IP65','Scangrip','UNIFORM 03.6208','All domains','IP65 – EN 13032-1','OB',1,55,'Annual (battery)','Portable inspection/work light with integrated magnet, hook and adjustable output up to 500 lm. Replaces the obsolete FLEX WEAR link.','https://www.scangrip.com/fr-fr/boutique/lampes-de-travail/03-6208-uniform'],
  ['t28','T','OUTILS','Cordless Drill/Driver 18V + case + 2 batteries','Bosch','GSR 18V-55 Professional','All domains','–','OB',1,175,'Replace if defective','Official Bosch product page for the 18V drill/driver used for terminal blocks, cabinet covers and light cable tray work.','https://www.bosch-professional.com/fr/fr/products/gsr-18v-55-06019H5200'],
  ['t29','T','CABLE','Manual Hydraulic Crimping Tool 6-240mm²','Klauke','K05 / EK60L','LV / DC Traction','EN 61238-1','OB',1,185,'2 years','Hexagonal or round die. Traction and auxiliary cable terminations.','https://www.klauke.com/fr/produits/outils-a-sertir/presses-a-sertir-manuelles'],
  ['t30','T','CABLE','Automatic Wire Stripper 0.2-6mm²','Jokari','SECURA 2K 20100','LV / DC','–','OB',1,42,'Replace when worn','Current official JOKARI automatic stripper page for 0.2 to 6.0 mm² conductors. More reliable than the old T-Stripper Vario link.','https://jokari.de/en/SECURA-2K-2.htm'],
  ['t31','T','CABLE','Cable Jacket Knife for round cables 8-28 mm','Jokari','Cable Knife No. 28G Standard','BT / HTA','–','OB',1,32,'Replace when worn','Current official JOKARI cable knife page for round cable sheaths and longitudinal cuts without damaging inner conductors.','https://jokari.de/en/products/detail/cable-knife-no-28g-standard'],
  ['t32','T','CABLE','Portable Cable Label Printer P-touch Bluetooth','Brother','PT-E310BTVP','All domains','–','RC',1,68,'Battery replacement','Official current Brother product page for the portable industrial Bluetooth labeller used for cable and terminal marking.','https://store.brother.fr/appareils/imprimantes-d-etiquettes/p-touch/pt/pte310btvp'],
  ['t33','T','CABLE','Insulating Tape Scotch 23 self-amalgamating + Scotch 35 PVC','3M','Scotch 23 + Scotch 35','LV / DC','UL 510 / IEC 60454','OB',2,12,'Consumable','23 = self-amalgamating, 35 = standard PVC insulating tape.','https://www.3m.fr/3M/fr_FR/p/d/v000057551/'],
  ['t34','T','LOTO','Personal LOTO Kit – electrical','Brady','120886','All domains','OSHA / Lockout Tagout','OB',1,58,'Annual (inspection)','Current official Brady personal electrical lockout kit page with pouch, padlock, hasps, breaker lockouts and tags.','https://www.bradyid.com/products/personal-lockout-kit-electrical-pid-120886'],
  ['t35','T','LOTO','Lockout Padlock thermoplastic – 1 unique key','Master Lock','410RED Zenex','All domains','Lockout Tagout','OB',2,16,'5 years or replacement','Current official Master Lock product page for the keyed-different thermoplastic safety padlock.','https://fr.masterlock.com/products/product/410RED'],
  ['t36','T','LOTO','Danger Lockout Tags – pack 25','Brady','48797','All domains','Lockout Tagout','OB',1,18,'Consumable','Current official Brady pack of 25 durable danger lockout tags with brass grommet and write-on area.','https://www.bradyid.com/products/bilingual-danger-this-tag-lock-to-be-removed-only-by-person-shown-on-back-tags-pid-48797'],
  ['e01','E','EPI','Insulating Gloves Class 4 (36kV) + leather overgloves','Honeywell / Salisbury','7144R/10H + AT117R','MV 10-36kV','Classe 4 – IEC 60903','OB',4,285,'6 months (dielectric test)','1 pair per HV technician. Mandatory dielectric test every 6 months.','https://www.salisburybyhoneywell.com/en/products/electrical-safety-gloves/class-4'],
  ['e02','E','EPI','Insulating Gloves Class 2 (17kV) + overgloves','Honeywell / Salisbury','7500R/9H','DC Traction 1500V / BT 1000V','Classe 2 – IEC 60903','OB',4,142,'6 months (dielectric test)','For DC 1500V traction or reinforced LV applications.','https://www.salisburybyhoneywell.com/en/products/electrical-safety-gloves/class-2'],
  ['e03','E','EPI','Arc-flash Suit Class 3 (25 cal/cm²) – full coverall','Oberon','TCG25-XXL','MV/HV 25kV','IEC 61482-2 Classe 3','OB',2,680,'3 years or after incident','Mandatory for work near 25kV live systems.','https://www.oberoncompany.com/arc-flash-clothing/arc-flash-suits'],
  ['e04','E','EPI','Arc-flash Face Shield 25 cal/cm² Class 3','Oberon','TCG25-HHG','MV/HV 25kV','IEC 61482-2 – Classe 3','OB',2,220,'3 years or replacement','Compatible with insulating helmet. Arc Flash Rating minimum 25 cal/cm².','https://www.oberoncompany.com/arc-flash-face-protection'],
  ['e05','E','EPI','Insulating Operating Rod MV 1kV-36kV','Catu','MP-5 / MP-10','MV 10-36kV','NF EN 61235 – NF C 18-150','OB',2,380,'Annual (dielectric test)','DISTINCT from earthing poles. For operating MV disconnectors and switches.','https://www.catu.com/fr/produits/perches-de-manoeuvre'],
  ['e06','E','EPI','MV Insulating Proximity Screen – protection sheet','Catu','CA-817','MV 10-36kV','NF C 18-510 – NF EN 61318','OB',2,145,'Annual (dielectric test)','Protects adjacent live parts during HV proximity work.','https://www.catu.com/fr/produits/protections-isolantes'],
  ['e07','E','OUTILS','Pro Rolling Tool Chest 3 lockable drawers 80kg','Stanley','FMST1-75791 FatMax XL','All domains','–','OB',1,245,'Replace when worn','Large team chest for HV tooling, megohmmeters and test sets.','https://www.stanley.fr/outils-a-main/rangement-outils/servantes-a-roulettes'],
  ['e08','E','OUTILS','VDE Socket Set 3/8" insulated metric 7-22mm','Stahlwille','12171/19/4 VDE','LV / MV – Protected bolting','IEC 60900','OB',1,195,'Replace when worn','Official insulated socket set page still online. Better-maintained reference than the old FACOM category URL.','https://stahlwille.com/en_us/products/detail/893236'],
  ['e09','E','OUTILS','Cordless Impact Wrench 18V 400 Nm 1/2"','Bosch','GDS 18V-400 Professional','MV / HV – Heavy bolting','–','RC',1,265,'Replace if defective','Official Bosch product page for the 400 Nm 1/2 inch impact wrench used on heavy bolting, busbars and transformer work.','https://www.bosch-professional.com/uy/es/products/gds-18v-400-06019K00E0'],
  ['e10','E','OUTILS','Cordless Hammer Drill 18V + 2×4Ah batteries','Bosch','GSB 18V-55 Professional','All domains','–','RC',1,195,'Replace if defective','Official Bosch product page for the 18V hammer drill/driver used for heavy fixings, cabinet metalwork and cable trays.','https://www.bosch-professional.com/fr/fr/products/gsb-18v-55-06019H5301'],
  ['e11','E','OUTILS','Torque Wrench 3/8" 2-25 Nm – terminals and lugs','Facom','S.306-25','LV / DC – Fine bolting','ISO 6789 – Classe II','OB',1,165,'Annual (calibration)','Terminal blocks, 4-16mm² lugs, MV terminations. Certificate included.','https://www.facom.com/fr/tools/torque/torque-wrenches/S.306-25.html'],
  ['e12','E','OUTILS','Torque Wrench 1/2" 20-200 Nm – cabinets','Facom','S.307-200','LV / MV – Medium bolting','ISO 6789 – Classe II','OB',1,210,'Annual (COFRAC calibration)','Cabinet fixings, MV bolting, 50-150mm² lugs.','https://www.facom.com/fr/tools/torque/torque-wrenches/S.307-200.html'],
  ['e13','E','OUTILS','Torque Wrench 3/4" 60-600 Nm – busbars','Stahlwille','730N/10 + 731/10','MV / HV – Heavy bolting','ISO 6789 – Classe II','OB',1,385,'Annual (COFRAC calibration)','MV busbars, transformer flanges, 25kV connectors. COFRAC certificate mandatory.','https://www.stahlwille.de/fr-FR/produits/cles-dynamometriques/730n'],
  ['e14','E','OUTILS','Electronic Torque Wrench 2-200 Nm USB traceability','Facom','E.316-200 NANO','LV / MV – Torque traceability','ISO 6789 Type II Classe A','RC',1,580,'Annual (COFRAC calibration)','1000-torque memory. USB/Bluetooth export. Required by some rail standards (Infrabel, Network Rail).','https://www.facom.com/fr/tools/torque/electronic-torque-wrenches/E.316-200.html'],
  ['e15','E','MHTA','MV Voltage Detector 1kV-36kV + telescopic probe','Catu','CM-64 / CM-210','MV 10-36kV','NF EN 61243-1 – Classe IIa','OB',2,480,'Annual (mandatory calibration)','Absence of Voltage Test (AVT) mandatory before any MV earthing.','https://www.catu.com/fr/produits/detection-de-tension/detecteurs-hta'],
  ['e16','E','MHTA','HV Voltage Detector 25kV – AC catenary','Catu','CM-42 / Horstmann DSP-HV','HV 25kV Catenary','NF EN 61243-1','OB',1,720,'Annual (mandatory calibration)','Specific to 25kV line. Must be verified on calibrated tester before each use.','https://www.catu.com/fr/produits/detection-de-tension/detecteurs-htb'],
  ['e17','E','MHTA','MV Phase Comparator synchronism 10-36kV','Catu','CM-51','MV 10-36kV','NF C 18-150','OB',1,590,'Annual','Coupling / paralleling verification at MV substations.','https://www.catu.com/fr/produits/comparateurs-de-phase'],
  ['e18','E','MHTA','Three-phase Power Quality Analyser Class A','Fluke','435-II','LV / MV (via CT/VT)','IEC 61000-4-30 Classe A','OB',1,4200,'Annual (calibration)','Harmonics, dips, flicker analysis. Long-term recording.','https://www.fluke.com/fr-fr/produit/analyseurs-qualite-alimentation/fluke-435-ii'],
  ['e19','E','MHTA','Digital Insulation Resistance Meter 5kV DC','Megger','MIT525','LV / MV / Cables','IEC 61557-2','OB',1,1650,'Annual (calibration)','PI, DAR, DD measurement. MV cables and substation transformers.','https://www.megger.com/fr/products/test-equipment/insulation-resistance-testers/mit525'],
  ['e20','E','MHTA','Digital Insulation Resistance Meter 10kV DC','Megger','MIT1025/2','MV 10-36kV / HV 25kV','IEC 61557-2','RC',1,3800,'Annual (calibration)','Insulation testing of MV cables and 25kV transformer windings.','https://www.megger.com/fr/products/test-equipment/insulation-resistance-testers/mit1025'],
  ['e21','E','MHTA','Micro-ohmmeter Contact Resistance 10-200A DC','Megger','DLRO10X','MV / Switchgear','IEC 62271 / IEC 60044','OB',1,2650,'Annual (calibration)','Contact resistance of circuit breakers, disconnectors, busbars.','https://www.megger.com/fr/products/test-equipment/low-resistance-ohmmeters/dlro10x'],
  ['e22','E','MHTA','Three-phase Protection Relay Test Set','Omicron','CMC 353','MV / Protection','IEC 60255 – IEC 61850','OB',1,16500,'Annual (calibration)','Three-phase current/voltage injection. Tests differential, overcurrent, distance relays. Official OMICRON page notes the CMC 353 remains available until 31/12/2026.','https://www.omicronenergy.com/fr/produits/cmc-353/'],
  ['e23','E','MHTA','CT/VT Transformer Turns Ratio + Polarity Tester','Megger','MRCT / TTR300','MV / CT-VT','IEC 60044-1 / IEC 61869','RC',1,3200,'Annual (calibration)','Turns ratio, excitation current, CT and VT polarity.','https://www.megger.com/fr/products/test-equipment/transformer-test/mrct'],
  ['e24','E','MHTA','VLF Cable Insulation Tester MV 34kV','Baur','PHG TD/VLF 34 kV','MV 10-36kV','IEC 60060-3 / NF C 33-052','RC',1,8500,'Bi-annual','In-service dielectric testing of MV cables. 0.1 Hz frequency.','https://www.baur.eu/products/vlf-testing/phg-td'],
  ['e25','E','MHTA','Clamp-on Earth Tester – Rt measurement without disconnection','Fluke','1630-2 FC','All domains – Earth network','IEC 61557-5','OB',1,780,'Annual (calibration)','Earth resistance measurement without disconnecting electrodes. Fluke Connect WiFi.','https://www.fluke.com/fr-fr/produit/mesure-resistance-terre/fluke-1630-2-fc'],
  ['e26','E','MHTA','MV Cable Screen Continuity/Insulation Test','Megger','MIT525 + screen accessories','MV 10-36kV','IEC 60502-4','OB',1,185,'Annual (calibration)','Cu/Al screen continuity and insulation after MV cable jointing.','https://www.megger.com/fr/products/test-equipment/insulation-resistance-testers/mit525'],
  ['e27','E','MBTDC','AC/DC Clamp Meter 2500A + iFlex flexible probe','Fluke','376 FC + iFlex Kit','DC Traction 750-1500V / LV','CAT III 1000V / CAT IV 600V','OB',2,520,'Annual (calibration)','Traction return current measurement up to 2500A DC.','https://www.fluke.com/fr-fr/produit/mesure-courant/pinces-amperemetriques/fluke-376-fc'],
  ['e28','E','MBTDC','Network Analyser – voltage, power, energy','Metrel','MI 2892 Power Master','DC Traction 750-1500V','IEC 61000-4-30','OB',1,2100,'Annual (calibration)','Current official Metrel product page for the MI 2892 platform, replacing the obsolete PowerQ4 Plus reference.','https://www.metrel.si/en/shop/PQA/class-a-power-quality-analysers/mi-2892.html'],
  ['e29','E','MBTDC','Stationary Battery Tester – internal impedance','Fluke','BT521 Battery Analyzer','DC Auxiliaries 24-110V','IEEE 1188 / IEC 60896','OB',1,1200,'Annual (calibration)','UPS, 24VDC, 110VDC battery diagnostics at substations.','https://www.fluke.com/fr-fr/produit/testeurs-batteries/fluke-bt521'],
  ['e30','E','MBTDC','Earth Resistance Tester 3 and 4-pole – GEO Kit','Fluke','1625-2 GEO Kit','All domains – Earthing','IEC 61557-5','OB',1,1650,'Annual (calibration)','3- and 4-probe method. Essential for substations and earth loops.','https://www.fluke.com/fr-fr/produit/mesure-resistance-terre/fluke-1625-2-geo'],
  ['e31','E','DIAG','Radiometric Thermal Camera 320×240 – MSX WiFi','Fluke','Ti480 PRO','All domains','EN 13187 / IEC 60068-2','OB',1,5400,'Annual (COFRAC calibration)','Preventive inspection HV/LV/DC. Hot spots on breakers, cables, connections.','https://www.fluke.com/fr-fr/produit/cameras-thermiques/fluke-ti480-pro'],
  ['e32','E','DIAG','Portable Oscilloscope 4-ch 200MHz CAT III','Fluke','190-204/S ScopeMeter','LV / DC Traction','CAT III 1000V – IP51','RC',1,2400,'Annual','Waveform analysis for drives, converters, relays.','https://www.fluke.com/fr-fr/produit/oscilloscopes/fluke-190-204-s'],
  ['e33','E','DIAG','Cable Fault Locator TDR LV/MV','Megger','PFL40B','LV / MV / DC Traction','IEC 61196','RC',1,4200,'Annual','Locate breaks, short-circuits, insulation faults. Accuracy ±1m.','https://www.megger.com/fr/products/test-equipment/cable-fault-location/pfl40b'],
  ['e34','E','DIAG','Portable EMC/HF Spectrum Analyser','Anritsu','MS2711E','All domains – EMC','IEC 61000-4 series','OP',1,3800,'Bi-annual','Harmonic disturbances, EMC, track signalling interference.','https://www.anritsu.com/fr-FR/test-measurement/products/ms2711e'],
  ['e35','E','LOTO','Equipotential Earthing Rod MV 10-36kV','Catu','MT-56-003','MV 10-36kV','NF EN 61230 – NF C 18-150','OB',2,850,'Annual (dielectric test)','Mandatory after AVT. 3 electrodes + equipotential cable.','https://www.catu.com/fr/produits/mise-a-la-terre/perches-equipotentielles'],
  ['e36','E','LOTO','Earthing Rod DC Traction 750-1500V','Sicame / Catu','MTDC-1500V','DC Traction 750-1500V','EN 50526 / UIC 660','OB',2,620,'Annual (dielectric test)','Short-circuits the overhead system. Rail and contact wire adaptors included.','https://www.catu.com/fr/produits/mise-a-la-terre/traction-dc'],
  ['e37','E','LOTO','Group LOTO Station – hasp 13 padlocks','Brady','65674 + 51174 hasp','All domains','ISO 3864 / EN 1037','OB',2,145,'Annual','Steel hasp + collective padlock. Multi-technician interventions.','https://www.bradyid.eu/fr-fr/lockout-tagout/hasp-lockouts/51174'],
  ['e38','E','CABLE','Ratchet Cable Cutter up to 150mm²','Knipex','95 27 200','LV / DC Traction / MT','EN ISO 5744','OB',1,145,'Replace blades when worn','Cu and Al cables up to 150mm². Replaceable blades.','https://www.knipex.com/index.php?cl=details&artNum=9527200'],
  ['e39','E','CABLE','Manual Hydraulic Cable Cutter up to 630mm²','Klauke','K50 / EK50ML','MV 10-36kV / DC Traction','EN ISO 5744','OB',1,580,'Annual (inspection)','MV Cu/Al cables up to 630mm². 360° rotating head.','https://www.klauke.com/fr/produits/outils-a-couper/coupe-cables-hydrauliques'],
  ['e40','E','CABLE','MV Armoured Cable Shears – up to 50mm diam.','Greenlee','CS750','MV armoured cables','EN ISO 5744','RC',1,320,'Annuelle (inspection lames)','Cutting MV cables with steel wire armour or aluminium tape.','https://www.greenlee.com/cable-cutting-tools/cs750'],
  ['e41','E','CABLE','Ratchet Crimping Tool small sections 0.5-16mm²','Weidmuller','PZ 6 Roto','LV / DC – Control circuits 24-110V','EN 60947-7 / DIN 46228','OB',2,95,'Replace when worn','Crimping ferrules and lugs for control circuits. Anti-return ratchet.','https://www.weidmueller.com/fr/products/tools/crimping-tools/pz-6-roto'],
  ['e42','E','CABLE','Fibreglass Fish Tape 20m – cable pulling needle','Greenlee','540','All domains – Cable pulling','–','OB',1,85,'Replace if broken','Pulling LV, DC, control cables in conduits. Non-conductive fibreglass.','https://www.greenlee.com/fish-tapes/540'],
  ['e43','E','CABLE','MV Cable Sealing Kit – resin + heat-shrink sleeves','Raychem / nVent','RSTI-A / CSJA Series','MV 10-36kV / DC Traction','IEC 60502-4 / HD 620','OB',1,220,'Consumable','MV cable jointing, termination or repair. Moisture protection.','https://www.nvent.com/fr-fr/raychem/cables/cable-accessories'],
  ['e44','E','COLLECTIF','Portable Inverter Generator 3.2 kW – 230V silent','Honda','EU32i','LV Auxiliaries','EN 12601','RC',1,4169,'Annual (oil change + service)','Current official Honda portable inverter generator page. Compact, quiet and easier to source than the discontinued EU30i reference.','https://shop.honda.fr/p/groupe-eu-32-ik-3200w/15323020/'],
  ['e45','E','COLLECTIF','Railway Site Signalling + Safety Barrier Kit','HEKA / Vepro','Kit signalisation ferroviaire','All domains – Track safety','NF EN ISO 7010','OB',2,280,'Annual (inspection)','Class 2 cones, NF-compliant signs, red/white barrier tape.','https://www.heka-signal.com/signalisation-ferroviaire'],
  ['e46','E','COLLECTIF','Professional First Aid Kit EN13169','Aptus / Gramm Medical','First Aid Kit Pro','All domains','EN 13169 / DIN 13157','OB',1,65,'6 months (expiry check)','Check expiry and replenishment every 6 months.','https://www.gramm-medical.com/trousses-secours-professionnelles'],
  ['e47','E','COLLECTIF','CO2 Extinguisher 5kg – class B/C electrical cabinets','Sicli / Amerex','T5','All domains','EN 615 / EN 3-7','OB',1,155,'Annual (pressure check)','CO2 only — for electrical cabinets. Always in intervention vehicle.','https://www.sicli.com/extincteurs/extincteur-co2-5kg'],
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

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [ctx, setCtx]     = useState('metro');
  const [lvl, setLvl]     = useState('ALL');
  const [cat, setCat]     = useState('ALL');
  const [stat, setStat]   = useState('ALL');
  const [q, setQ]         = useState('');
  const [sel, setSel]     = useState(new Set());
  const [modal, setModal] = useState(null);
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
    <div style={{ fontFamily:"'Barlow', sans-serif", background:C.bg, minHeight:'100vh', color:C.text }}>
      <style>{fontStyle}</style>

      {/* ── HEADER ── */}
      <div style={{ background:C.bgMid, borderBottom:`1px solid ${C.border}` }}>
        {/* Top bar */}
        <div style={{ padding:'0 22px', display:'flex', alignItems:'center', gap:16, height:54, borderBottom:`1px solid ${C.border}` }}>
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
          <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
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
          <div style={{ display:'flex', gap:1, marginLeft:16 }}>
            {[
              ['SELECTED', sel.size, C.teal],
              ['BUDGET', fmt(total)+' €', acc],
            ].map(([l,v,col])=>(
              <div key={l} style={{ background:C.bg, padding:'6px 16px', textAlign:'center', borderLeft:`1px solid ${C.border}` }}>
                <div style={{ fontSize:9, color:C.textSub, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.08em' }}>{l}</div>
                <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:14, fontWeight:600, color:col, marginTop:1 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Subsystem tabs */}
        <div style={{ display:'flex', padding:'0 22px' }}>
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
      <div style={{ display:'flex', height:'calc(100vh - 118px)', overflow:'hidden' }}>

        {/* ── MAIN PANEL ── */}
        <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>

          {/* Filter bar */}
          <div style={{ padding:'10px 18px', borderBottom:`1px solid ${C.border}`, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', background:C.bgMid }}>
            {/* Search */}
            <div style={{ position:'relative', flex:'0 0 210px' }}>
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

            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:C.textSub }}>{filtered.length} tools</span>
              <button onClick={()=>setSel(p=>{const n=new Set(p);filtered.forEach(t=>n.add(t.id));return n;})}
                style={{ background:C.bg, border:`1px solid ${C.border}`, color:C.textSub, padding:'5px 11px', borderRadius:6, cursor:'pointer', fontSize:11, fontFamily:"'Barlow', sans-serif" }}>
                Select all
              </button>
              <button onClick={()=>setSel(p=>{const n=new Set(p);filtered.forEach(t=>n.delete(t.id));return n;})}
                style={{ background:C.bg, border:`1px solid ${C.border}`, color:C.textSub, padding:'5px 11px', borderRadius:6, cursor:'pointer', fontSize:11, fontFamily:"'Barlow', sans-serif" }}>
                Clear
              </button>
            </div>
          </div>

          {/* Tool cards */}
          <div style={{ flex:1, overflowY:'auto', padding:'14px 18px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(310px, 1fr))', gap:10 }}>
              {filtered.map((t,i)=>{
                const isSel=sel.has(t.id), c=CATS[t.cat], s=STATUTS[t.statut];
                return (
                  <div key={t.id} style={{
                    background:isSel?`${c.color}0D`:C.card,
                    border:`1px solid ${isSel?c.color+'50':C.border}`,
                    borderRadius:10, overflow:'hidden', cursor:'pointer',
                    transition:'all 0.15s', animation:`fadeIn 0.18s ease ${i*0.012}s both`,
                    display:'flex',
                  }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=isSel?c.color+'80':C.borderL; e.currentTarget.style.background=isSel?`${c.color}12`:C.cardHov;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=isSel?c.color+'50':C.border; e.currentTarget.style.background=isSel?`${c.color}0D`:C.card;}}
                  >
                    {/* SVG thumb */}
                    <div onClick={()=>setModal(t)} style={{ width:82, flexShrink:0, background:isSel?`${c.color}08`:C.bgMid, display:'flex', alignItems:'center', justifyContent:'center', borderRight:`1px solid ${C.border}` }}>
                      <ToolVisual tool={t} size={58} radius={10}/>
                    </div>

                    {/* Content */}
                    <div onClick={()=>setModal(t)} style={{ flex:1, padding:'11px 13px', display:'flex', flexDirection:'column', gap:7 }}>
                      {/* Badges row */}
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:6 }}>
                        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                          <span style={{ background:`${c.color}18`, color:c.color, border:`1px solid ${c.color}30`, borderRadius:4, padding:'2px 7px', fontSize:9, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em' }}>
                            {c.icon} {c.label}
                          </span>
                          <span style={{ background:`${s.color}15`, color:s.color, border:`1px solid ${s.color}30`, borderRadius:4, padding:'2px 7px', fontSize:9, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif" }}>
                            {s.label}
                          </span>
                        </div>
                        {/* Checkbox */}
                        <div onClick={e=>{e.stopPropagation();toggle(t.id);}} style={{
                          width:21, height:21, borderRadius:6,
                          border:`1.5px solid ${isSel?c.color:C.borderL}`,
                          background:isSel?c.color:'transparent',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          flexShrink:0, cursor:'pointer', transition:'all 0.15s',
                        }}>
                          {isSel&&<Check size={12} color="#fff" strokeWidth={3}/>}
                        </div>
                      </div>

                      {/* Name */}
                      <div style={{ fontSize:12.5, fontWeight:600, lineHeight:1.3, color:C.text }}>{t.name}</div>

                      {/* Brand + model */}
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <span style={{ fontSize:11, color:c.color, fontWeight:700 }}>{t.brand}</span>
                        <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:9, color:C.textSub, background:C.bg, padding:'2px 6px', borderRadius:4, border:`1px solid ${C.border}` }}>{t.model}</span>
                      </div>

                      {/* Price row */}
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:7, borderTop:`1px solid ${C.border}`, marginTop:'auto' }}>
                        <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:14, fontWeight:700, color:isSel?c.color:C.text }}>
                          {fmt(t.price)} €
                          <span style={{ fontSize:10, fontWeight:400, color:C.textSub }}> ×{t.qty}</span>
                        </div>
                        {isSel&&<span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:c.color, fontWeight:600 }}>= {fmt(t.qty*t.price)} €</span>}
                        <span style={{ fontSize:9, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em',
                          color:t.level==='T'?C.teal:C.blue, background:t.level==='T'?C.tealDim:C.blueDim,
                          padding:'2px 7px', borderRadius:4 }}>
                          {t.level==='T'?'TECH':'TEAM'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── SYNTHESIS PANEL ── */}
        <div style={{ width:270, background:C.bgMid, borderLeft:`1px solid ${C.border}`, overflowY:'auto', display:'flex', flexDirection:'column' }}>

          {/* Panel header */}
          <div style={{ padding:'14px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:7 }}>
            <BarChart2 size={14} color={acc}/>
            <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:13, fontWeight:700, letterSpacing:'0.08em', color:acc }}>SUMMARY</span>
          </div>

          <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:12, flex:1 }}>

            {/* Total budget */}
            <div style={{ background:C.bg, borderRadius:10, padding:'14px 16px', border:`1px solid ${total>0?acc+'40':C.border}` }}>
              <div style={{ fontSize:9, color:C.textSub, marginBottom:6, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.08em' }}>TOTAL SELECTED BUDGET</div>
              <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:26, fontWeight:700, color:total>0?acc:C.textMuted }}>
                {fmt(total)} €
              </div>
              <div style={{ fontSize:11, color:C.textSub, marginTop:4 }}>
                {sel.size} tool{sel.size!==1?'s':''} selected{sel.size!==1?'s':''}
              </div>
            </div>

            {/* By level */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[['T','Technician',C.teal,tTotal],['E','Team',C.blue,eTotal]].map(([lv,label,color,budget])=>(
                <div key={lv} style={{ background:C.bg, borderRadius:8, padding:'10px 11px', border:`1px solid ${color}25` }}>
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
                Cochez des tools<br/>to calculate budget
              </div>
            )}

            {/* Database stats */}
            <div style={{ marginTop:'auto', paddingTop:12, borderTop:`1px solid ${C.border}` }}>
              <div style={{ fontSize:9, color:C.textSub, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.08em', marginBottom:8 }}>POS DATABASE — {TOOLS.length} OUTILS</div>
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
          <div style={{ position:'fixed', inset:0, background:'rgba(0,10,10,0.88)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(6px)' }}
            onClick={()=>setModal(null)}>
            <div style={{ background:C.card, borderRadius:16, width:'100%', maxWidth:740, border:`1px solid ${c.color}40`, animation:'slideIn 0.18s ease', overflow:'hidden' }}
              onClick={e=>e.stopPropagation()}>

              {/* Header */}
              <div style={{ background:C.bgMid, padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid ${C.border}` }}>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ background:`${c.color}18`, color:c.color, border:`1px solid ${c.color}35`, borderRadius:6, padding:'4px 11px', fontSize:11, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em' }}>{c.icon} {c.label}</span>
                  <span style={{ background:`${s.color}15`, color:s.color, border:`1px solid ${s.color}30`, borderRadius:6, padding:'4px 11px', fontSize:11, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif" }}>{s.label}</span>
                  <span style={{ background:modal.level==='T'?C.tealDim:C.blueDim, color:modal.level==='T'?C.teal:C.blue, borderRadius:6, padding:'4px 11px', fontSize:11, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif" }}>
                    {modal.level==='T'?'👤 Technician':'👥 Team'}
                  </span>
                </div>
                <button onClick={()=>setModal(null)} style={{ background:'transparent', border:'none', cursor:'pointer', color:C.textSub, padding:4 }}><X size={18}/></button>
              </div>

              <div style={{ display:'flex' }}>
                {/* Left */}
                <div style={{ width:195, flexShrink:0, background:C.bgMid, display:'flex', flexDirection:'column', alignItems:'center', gap:14, padding:'22px 16px', borderRight:`1px solid ${C.border}` }}>
                  <div style={{ width:150, height:130, background:C.bg, borderRadius:14, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <ToolVisual tool={modal} size={100} radius={12}/>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:c.color, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em' }}>{modal.brand}</div>
                    <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:10, color:C.textSub, marginTop:5, background:C.bg, padding:'3px 10px', borderRadius:5, border:`1px solid ${C.border}`, display:'inline-block' }}>{modal.model}</div>
                  </div>

                  {/* Price */}
                  <div style={{ background:C.bg, borderRadius:10, padding:'12px 14px', textAlign:'center', width:'100%', border:`1px solid ${c.color}30` }}>
                    <div style={{ fontSize:9, color:C.textSub, marginBottom:3, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em' }}>UNIT PRICE</div>
                    <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:22, fontWeight:700, color:c.color }}>{fmt(modal.price)} €</div>
                    <div style={{ fontSize:10, color:C.textSub }}>× {modal.qty} {modal.level==='E'?'/ team':'/ tech'}</div>
                    <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:13, fontWeight:600, color:C.text, marginTop:6, paddingTop:6, borderTop:`1px solid ${C.border}` }}>= {fmt(modal.qty*modal.price)} €</div>
                  </div>

                  <button onClick={()=>toggle(modal.id)} style={{
                    background:isSel?c.color:'transparent',
                    border:`1.5px solid ${isSel?c.color:C.borderL}`,
                    borderRadius:8, padding:'9px 0', width:'100%', cursor:'pointer',
                    fontWeight:700, fontSize:12, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'all 0.15s',
                    color:isSel?'#fff':C.textSub,
                  }}>
                    {isSel?<><Check size={13}/> SÉLECTIONNÉ</>:'+ ADD TO SELECTION'}
                  </button>
                </div>

                {/* Right */}
                <div style={{ flex:1, padding:'20px 22px', overflowY:'auto', maxHeight:490 }}>
                  <div style={{ fontSize:16, fontWeight:600, lineHeight:1.35, color:C.text, marginBottom:16 }}>{modal.name}</div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, marginBottom:14 }}>
                    {[['Voltage Domain',modal.domain],['Standard / Insulation',modal.norm],['Verification / Calibration',modal.period],['Quantity',`${modal.qty} ${modal.level==='T'?'per technician':'per team'}`]].map(([l,v])=>(
                      <div key={l} style={{ background:C.bgMid, borderRadius:8, padding:'9px 12px', border:`1px solid ${C.border}` }}>
                        <div style={{ fontSize:9, color:C.textSub, marginBottom:4, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em' }}>{l.toUpperCase()}</div>
                        <div style={{ fontSize:12, color:C.text, fontWeight:500 }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  <div style={{ background:`${c.color}0D`, borderRadius:8, padding:'12px 14px', border:`1px solid ${c.color}25`, marginBottom:12 }}>
                    <div style={{ fontSize:9, color:c.color, marginBottom:5, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em', display:'flex', alignItems:'center', gap:4 }}>
                      <Info size={10}/> TECHNICAL NOTES
                    </div>
                    <div style={{ fontSize:12, color:C.text, lineHeight:1.6 }}>{modal.notes}</div>
                  </div>

                  {/* Alerts */}
                  {modal.statut==='OB'&&(
                    <div style={{ background:C.orangeDim, borderRadius:8, padding:'10px 14px', border:`1px solid ${C.orange}30`, display:'flex', gap:8, alignItems:'flex-start', marginBottom:10 }}>
                      <AlertTriangle size={13} color={C.orange} style={{ flexShrink:0, marginTop:1 }}/>
                      <div style={{ fontSize:11, color:C.orange, lineHeight:1.45 }}>
                        This tool is <strong>mandatory</strong> — its absence may constitute a breach of regulatory or safety requirements.
                      </div>
                    </div>
                  )}
                  {modal.period.toLowerCase().includes('calibration')&&(
                    <div style={{ background:C.violetDim, borderRadius:8, padding:'10px 14px', border:`1px solid ${C.violet}30`, display:'flex', gap:8, marginBottom:10 }}>
                      <Info size={13} color={C.violet} style={{ flexShrink:0, marginTop:1 }}/>
                      <div style={{ fontSize:11, color:C.violet, lineHeight:1.45 }}>
                        <strong>Periodic calibration required</strong> — must be included in the team's metrological maintenance plan.
                      </div>
                    </div>
                  )}

                  {/* Product URL + image filename */}
                  <div style={{ background:C.bgMid, borderRadius:8, padding:'12px 14px', border:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:9, color:C.textSub, marginBottom:7, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em' }}>OFFICIAL PRODUCT PAGE LINK</div>
                    <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:10, color:C.teal, wordBreak:'break-all', marginBottom:9, lineHeight:1.55 }}>{modal.productUrl}</div>
                    <CopyBtn text={modal.productUrl} label="Copy product link" accent={C.teal}/>
                  </div>

                  {/* Image filename */}
                  <div style={{ background:C.bgMid, borderRadius:8, padding:'12px 14px', border:`1px solid ${C.amber}30` }}>
                    <div style={{ fontSize:9, color:C.textSub, marginBottom:7, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em' }}>LOCAL IMAGE FILE</div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, background:C.bg, borderRadius:6, padding:'7px 10px', marginBottom:9, border:`1px solid ${C.border}` }}>
                      <span style={{ fontSize:9, color:C.textSub, flexShrink:0 }}>→ ./images/</span>
                      <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:C.amber, flex:1, wordBreak:'break-all' }}>{modal.imgFile}</span>
                    </div>
                    <CopyBtn text={modal.imgFile} label="Copy filename" accent={C.amber}/>
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
