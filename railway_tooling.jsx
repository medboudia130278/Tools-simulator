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
  EPI:      { label:'Sécurité / EPI',     color:C.orange, bg:C.orangeDim, icon:'🛡️' },
  MBTDC:    { label:'Mesure BT/DC',       color:C.teal,   bg:C.tealDim,  icon:'⚡' },
  MHTA:     { label:'Mesure HTA/HTB',     color:C.blue,   bg:C.blueDim,  icon:'🔬' },
  CABLE:    { label:'Câblage',            color:C.amber,  bg:C.amberDim, icon:'🔌' },
  LOTO:     { label:'Consignation/LOTO',  color:C.violet, bg:C.violetDim,icon:'🔒' },
  DIAG:     { label:'Diagnostic Avancé',  color:C.cyan,   bg:C.cyanDim,  icon:'📡' },
  OUTILS:   { label:'Outillage Général',  color:C.green,  bg:C.greenDim, icon:'🔧' },
  COLLECTIF:{ label:'Matériel Collectif', color:C.slate,  bg:C.slateDim, icon:'📦' },
};

// Obligatoire = orange (not red), Recommandé = blue, Optionnel = teal
const STATUTS = {
  OB:{ label:'Obligatoire', color:C.orange, bg:C.orangeDim },
  RC:{ label:'Recommandé',  color:C.blue,   bg:C.blueDim   },
  OP:{ label:'Optionnel',   color:C.teal,   bg:C.tealDim   },
};

const CONTEXTS = [
  { id:'metro',  label:'Métro',      icon:'🚇', accent:C.teal   },
  { id:'tram',   label:'Tram',       icon:'🚊', accent:C.cyan   },
  { id:'heavy',  label:'Heavy Rail', icon:'🚂', accent:C.amber  },
  { id:'apm',    label:'APM',        icon:'🚅', accent:C.violet },
];

const SUBSYSTEMS = [
  { id:'POS',   label:'POS',     full:'Énergie',         active:true  },
  { id:'PSD',   label:'PSD',     full:'Portes Palières', active:false },
  { id:'CAT',   label:'CAT',     full:'Caténaire',       active:false },
  { id:'TRACK', label:'TRACK',   full:'Voie',            active:false },
  { id:'3RD',   label:'3rd Rail',full:'Rail Conducteur', active:false },
  { id:'AFC',   label:'AFC',     full:'Billétique',      active:false },
];

// ─── TOOL DATA ────────────────────────────────────────────────────────────────
const RAW = [
  ['t01','T','EPI','Multimètre TRMS CAT IV 1000V','Fluke','289/EUR','BT / DC Traction','CAT IV 1000V – IEC 61010','OB',1,340,'Annuelle (étalonnage)','Enregistreur de données intégré. Mesures AC/DC tension, courant, résistance, continuité. Référence terrain absolue.','https://www.fluke.com/fr-fr/produit/multimetres/multimetres-numeriques/fluke-289'],
  ['t02','T','EPI','Détecteur tension sans contact AC 100-1000V','Fluke','T6-1000PRO','BT','CAT IV 1000V','OB',1,155,'Annuelle','Mesure sans contact ni fils. Indispensable sécurité BT. Détection instantanée avant toute approche.','https://www.fluke.com/fr-fr/produit/testeurs-electriques/testeurs-tension/fluke-t6-1000-pro'],
  ['t03','T','EPI','Détecteur tension bipolaire BT 24V-1000V AC/DC','Chauvin Arnoux','CA 6420 N','BT / DC Traction','CAT IV 1000V – NF EN 61243-3','OB',1,82,'Annuelle','Conforme NF EN 61243-3. Sifflet sonore. Indispensable avant toute intervention.','https://www.chauvin-arnoux.com/fr/produits/category/detecteurs/ca-6420n'],
  ['t04','T','EPI','Gants isolants Classe 0 (750V) + sur-gants cuir','Honeywell / Salisbury','2750R/9H + AT127','BT / DC Traction','Classe 0 – IEC 60903','OB',1,85,'6 mois (test diélectrique)','Renouveler après test diélectrique ou endommagement. Conserver dans étui fourni.','https://www.salisburybyhoneywell.com/en/products/electrical-safety-gloves'],
  ['t05','T','EPI','Casque isolant + écran facial Classe E (20kV)','JSP','EVO3 REV','Tous domaines','EN 397 – Classe E','OB',1,58,'3 ans','Avec jugulaire et écran anti-arc intégré. Couleur selon fonction.','https://www.jspsafety.com/fr/produits/protection-de-la-tete/casques/evo3-rev'],
  ['t06','T','EPI','Lunettes sécurité anti-arc EN166','Bollé Safety','Cobra COBPSI','Tous domaines','EN 166 / EN 170','OB',1,22,'1 an','Anti-rayures, anti-buée. Usage systématique en intervention.','https://www.bollesafety.com/fr/lunettes-de-securite/cobra'],
  ['t07','T','EPI','Vêtement anti-arc Classe 1 (4 cal/cm²)','Enespro / Salisbury','AGF40KIT','Tous domaines','IEC 61482-2 – Classe 1','OB',1,320,'3 ans ou après arc','Classe 2 (8 cal/cm²) recommandée pour 25kV.','https://www.enespro.com/products/arc-flash-kits'],
  ['t08','T','EPI','Lampe frontale rechargeable ATEX zone 2 – 300 lm','Petzl','PIXA 3 ATEX E97P3','Tous domaines','ATEX zone 2 – IECEx','OB',1,118,'Annuelle (batterie)','Usage locaux techniques, tunnels, sous-stations.','https://pro.petzl.com/fr/pro/lampes-frontales-atex/pixa-3'],
  ['t09','T','EPI','Kit tournevis isolés VDE 1000V – 7 pièces','Wiha','36295 SoftFinish VDE Set','BT','VDE – IEC 60900 – 1000V AC','OB',1,78,'Annuelle (inspection visuelle)','Poignées bi-matières. Conforme DIN VDE 0680. Testées 10kV.','https://www.wiha.com/fr-fr/outillage/tournevis/tournevis-vde/softfinish-vde/36295'],
  ['t10','T','EPI','Kit pinces isolées VDE 1000V – 5 pièces','Knipex','00 20 12','BT','VDE – IEC 60900 – 1000V AC','OB',1,145,'Annuelle (inspection visuelle)','Gaines bi-matières testées 10kV. Référence excellence du marché.','https://www.knipex.com/index.php?cl=details&artNum=002012'],
  ['t11','T','EPI','Clé dynamométrique isolée VDE 1000V 1/2" 20-200 Nm','Stahlwille','730a/10 VDE','BT','VDE – IEC 60900','RC',1,210,'Annuelle (étalonnage)','Pour serrage boulonnerie électrique. Avec certificat étalonnage.','https://www.stahlwille.de/fr-FR/produits/cles-dynamometriques/cles-dynamometriques-vde'],
  ['t12','T','MBTDC','Testeur isolement portatif 500V/1000V','Fluke','1507 Insulation Tester','DC Auxiliaires 24-110V / BT','IEC 61557-2 – CAT IV 600V','OB',1,310,'Annuelle (étalonnage)','Usage quotidien : isolement circuits contrôle 24VDC. Plus léger que MIT525 équipe.','https://www.fluke.com/fr-fr/produit/testeurs-isolement/fluke-1507'],
  ['t13','T','MBTDC','Testeur RCD + impédance boucle de défaut','Fluke','1664 FC Multifunction','BT / Auxiliaires 400V','IEC 61557 – IEC 60364','OB',1,580,'Annuelle (étalonnage)','Test RCD 10-500mA, impédance boucle défaut. Obligatoire avant mise en service 400V.','https://www.fluke.com/fr-fr/produit/testeurs-installation-electrique/fluke-1664-fc'],
  ['t14','T','MBTDC','Mesureur impédance de boucle NF C 15-100','Metrel','MI3102H EurotestXD','BT / Auxiliaires 400V','IEC 61557 – NF C 15-100','RC',1,420,'Annuelle (étalonnage)','Alternative Fluke 1664FC si référentiel NF C 15-100 imposé.','https://www.metrel.si/instruments/installation-testers/MI3102'],
  ['t15','T','MBTDC','Pince ampèremétrique TRMS AC/DC 1000A WiFi','Fluke','376 FC','BT / DC Traction 750-1500V','CAT IV 600V – CAT III 1000V','OB',1,430,'Annuelle (étalonnage)','Mesure DC jusqu\'à 2500A avec iFlex. Connectivité Fluke Connect.','https://www.fluke.com/fr-fr/produit/mesure-courant/pinces-amperemetriques/fluke-376-fc'],
  ['t16','T','MBTDC','Vérificateur ordre de phases triphasée 80-760V AC','Chauvin Arnoux','CA 6412','BT / Auxiliaires 400V','CAT IV 600V','OB',1,75,'Annuelle','Vérification rotation sens direct/indirect. Usage systématique avant mise en tension.','https://www.chauvin-arnoux.com/fr/produits/category/testeurs-electriques/ca-6412'],
  ['t17','T','MBTDC','Testeur polarité DC avec buzzer 24V-1500V','Metrel','MI2124','DC Traction 750-1500V','CAT III 1000V','RC',1,95,'Annuelle','Vérification polarité et continuité circuit DC traction.','https://www.metrel.si/instruments/multimeters/MI2124'],
  ['t18','T','MBTDC','Thermomètre infrarouge -50 à +550°C','Fluke','62 MAX+','Tous domaines','EN 61010-1','RC',1,115,'Annuelle','Détection rapide points chauds cosses, barres, fusibles.','https://www.fluke.com/fr-fr/produit/thermometres/thermometres-infrarouges/fluke-62-max'],
  ['t19','T','OUTILS','Coffret cliquet 1/4" + 3/8" + douilles métriques 100 pcs','Wera','9100 SB RA','BT / HTA – Boulonnerie','ISO 2725 / DIN 3122','OB',1,165,'Remplacement si usure','Coffret compact ratchet. Fixations armoires, cosses, bornes.','https://www.wera.de/fr-fr/products/sets/ratchet-sets/9100-sb-ra'],
  ['t20','T','OUTILS','Jeu clés 6 pans courtes + longues métriques 1.5-10mm','Wiha','352 SB18','Tous domaines','DIN 911 / ISO 2936','OB',1,42,'Remplacement si usure','Usage quotidien : vis CHC, variateurs, relais, équipements rail.','https://www.wiha.com/fr-fr/outillage/cles-males/cles-6-pans'],
  ['t21','T','OUTILS','Sacoche à outils individuelle 18 compartiments','Knipex','00 19 72 LE Tool Bag','Tous domaines','–','OB',1,68,'Remplacement si usure','Contient tournevis VDE, pinces, détecteur, multimètre, LOTO.','https://www.knipex.com/index.php?cl=details&artNum=001972LE'],
  ['t22','T','OUTILS','Pistolet chauffant 2000W 50-600°C + 2 buses','Bosch','GHG 20-63 Professional','BT / DC – Gaines & Câbles','–','OB',1,95,'Remplacement si défaut','Pose gaines thermo cosses, câbles, connecteurs.','https://www.bosch-professional.com/fr/fr/products/ghg-20-63-0601212200.html'],
  ['t23','T','OUTILS','Tige magnétique télescopique 65cm – 600g','Facom','DA.15PB','Tous domaines','–','OB',1,14,'Remplacement si besoin','Récupération vis, boulons, cosses tombés dans armoires.','https://www.facom.com/fr/tools/reaching-tools/DA.15PB.html'],
  ['t24','T','OUTILS','Miroir inspection télescopique LED 360°','Facom','S.270PB','Tous domaines','–','RC',1,22,'Remplacement si besoin','Lecture plaques signalétiques et repérage câblage zones inaccessibles.','https://www.facom.com/fr/tools/inspection-tools/S.270PB.html'],
  ['t25','T','OUTILS','Mètre ruban 5m magnétique anti-choc','Stanley','STHT36334 FatMax','Tous domaines','–','OB',1,18,'Remplacement si besoin','Crochet double face magnétique utile en solo.','https://www.stanley.fr/outils-a-main/mesure/metres-ruban/fatmax-autolock-5m'],
  ['t26','T','OUTILS','Marqueurs permanents résistants huile/chaleur – lot 3','Edding','8300 Industrial Marker','Tous domaines','–','OB',3,5.5,'Consommable','Noir, rouge, blanc. Résistants 120°C, solvants, huile.','https://www.edding.com/fr/produits/edding-8300-industrial-marker'],
  ['t27','T','OUTILS','Lampe de travail rechargeable 500 lm aimant IP54','Scangrip','Flex Wear 03.5122','Tous domaines','IP54 – EN 60598','OB',1,55,'Annuelle (batterie)','Pose dans armoire pour éclairage local. Mains libres.','https://www.scangrip.com/fr/produits/travail-general/flex-wear'],
  ['t28','T','OUTILS','Visseuse/perceuse sans fil 18V + coffret + 2 batteries','Bosch','GSR 18V-55 Professional','Tous domaines','–','OB',1,175,'Remplacement si défaut','Fixations borniers, capots armoires, chemins de câbles légers.','https://www.bosch-professional.com/fr/fr/products/gsr-18v-55-0615A5002N.html'],
  ['t29','T','CABLE','Pince à sertir hydraulique manuelle 6-240mm²','Klauke','K05 / EK60L','BT / DC Traction','EN 61238-1','OB',1,185,'2 ans','Hexagonale ou ronde. Raccordements câbles traction et auxiliaires.','https://www.klauke.com/fr/produits/outils-a-sertir/presses-a-sertir-manuelles'],
  ['t30','T','CABLE','Pince à dénuder automatique 0.2-6mm²','Jokari','30200 T-Stripper','BT / DC','–','OB',1,42,'Remplacement si usure','Réglage automatique selon section. Usage quotidien armoires 400V/24V.','https://www.jokari.de/products/t-stripper-vario'],
  ['t31','T','CABLE','Couteau à gaine câbles armés lame courbe','Jokari','10250 Secura Coax','BT / HTA','–','OB',1,32,'Remplacement si usure','Découpe sécurisée gaines sans incision conducteurs.','https://www.jokari.de/products/secura-coax'],
  ['t32','T','CABLE','Étiqueteuse portable câbles P-touch Bluetooth','Brother','PT-E310BT','Tous domaines','–','RC',1,68,'Remplacement batterie','Rubans résistants huile/chaleur. Étiquetage câbles, bornes.','https://www.brother.fr/products/labelling/pte310bt'],
  ['t33','T','CABLE','Ruban isolant Scotch 23 + Scotch 35 PVC','3M','Scotch 23 + Scotch 35','BT / DC','UL 510 / IEC 60454','OB',2,12,'Consommable','23 = auto-amalgamant, 35 = isolant PVC standard.','https://www.3m.fr/3M/fr_FR/p/d/v000057551/'],
  ['t34','T','LOTO','Kit LOTO personnel – sacoche individuelle Brady','Brady','65674 Personal LOTO Kit','Tous domaines','ISO 3864 / EN 1037','OB',1,58,'Annuelle (inspection)','Cadenas acier inoxydable. Identification individuelle obligatoire.','https://www.bradyid.eu/fr-fr/lockout-tagout/personal-lockout-kits/65674'],
  ['t35','T','LOTO','Cadenas consignation acier 1 clé unique','Master Lock','S410RED','Tous domaines','ISO 3864','OB',2,16,'5 ans ou remplacement','1 clé = 1 agent. 2 cadenas : 1 utilisé + 1 spare.','https://www.masterlock.eu/fr/products/safety-lockout/safety-padlocks/S410RED'],
  ['t36','T','LOTO','Étiquettes CONSIGNE danger électrique – sachet 25','Brady','65518','Tous domaines','ISO 7010 – W012','OB',1,18,'Consommable','Étiquette rigide avec oeillets. Mention danger + nom technicien.','https://www.bradyid.eu/fr-fr/lockout-tagout/lockout-tags/65518'],
  ['e01','E','EPI','Gants isolants Classe 4 (36kV) + sur-gants cuir','Honeywell / Salisbury','7144R/10H + AT117R','HTA 10-36kV','Classe 4 – IEC 60903','OB',4,285,'6 mois (test diélectrique)','1 paire / technicien HTA. Test diélectrique 6 mois obligatoire.','https://www.salisburybyhoneywell.com/en/products/electrical-safety-gloves/class-4'],
  ['e02','E','EPI','Gants isolants Classe 2 (17kV) + sur-gants','Honeywell / Salisbury','7500R/9H','DC Traction 1500V / BT 1000V','Classe 2 – IEC 60903','OB',4,142,'6 mois (test diélectrique)','Usage DC 1500V traction ou BT renforcée.','https://www.salisburybyhoneywell.com/en/products/electrical-safety-gloves/class-2'],
  ['e03','E','EPI','Vêtement anti-arc Classe 3 (25 cal/cm²) – combinaison','Oberon','TCG25-XXL','HTA/HTB 25kV','IEC 61482-2 Classe 3','OB',2,680,'3 ans ou après incident','Obligatoire pour travaux près de 25kV sous tension.','https://www.oberoncompany.com/arc-flash-clothing/arc-flash-suits'],
  ['e04','E','EPI','Écran facial anti-arc 25 cal/cm² Classe 3','Oberon','TCG25-HHG','HTA/HTB 25kV','IEC 61482-2 – Classe 3','OB',2,220,'3 ans ou remplacement','Compatible casque isolant. Arc Flash Rating 25 cal/cm² minimum.','https://www.oberoncompany.com/arc-flash-face-protection'],
  ['e05','E','EPI','Perche de manœuvre isolante HTA 1kV-36kV','Catu','MP-5 / MP-10','HTA 10-36kV','NF EN 61235 – NF C 18-150','OB',2,380,'Annuelle (test diélectrique)','DISTINCTE des perches de mise à la terre. Actionnement sectionneurs HTA.','https://www.catu.com/fr/produits/perches-de-manoeuvre'],
  ['e06','E','EPI','Écran isolant de voisinage HTA – nappe protection','Catu','CA-817','HTA 10-36kV','NF C 18-510 – NF EN 61318','OB',2,145,'Annuelle (test diélectrique)','Protection parties voisines sous tension lors de travaux HTA au voisinage.','https://www.catu.com/fr/produits/protections-isolantes'],
  ['e07','E','OUTILS','Caisse à roulettes pro 3 tiroirs verrouillables 80kg','Stanley','FMST1-75791 FatMax XL','Tous domaines','–','OB',1,245,'Remplacement si usure','Grande caisse équipe pour outillage HTA/HTB, mégohmètres, testeurs.','https://www.stanley.fr/outils-a-main/rangement-outils/servantes-a-roulettes'],
  ['e08','E','OUTILS','Coffret cliquet 1/2" + pipes VDE métriques 10-32mm','Facom','J.380-E2PB + SL.444','BT / HTA – Boulonnerie forte','VDE partiel – IEC 60900','OB',1,195,'Remplacement si usure','Boulonnerie forte : jeux de barres, transformateurs, interrupteurs HTA.','https://www.facom.com/fr/tools/sockets/socket-sets'],
  ['e09','E','OUTILS','Clé à chocs électrique 18V 440 Nm 1/2"','Bosch','GDS 18V-400 Professional','HTA / HTB – Boulonnerie forte','–','RC',1,265,'Remplacement si défaut','Dépose boulonnerie forte : jeux de barres HTA, transformateurs, SF6.','https://www.bosch-professional.com/fr/fr/products/gds-18v-400-06019A1300.html'],
  ['e10','E','OUTILS','Perceuse à percussion sans fil 18V + 2 bat. 4Ah','Bosch','GSB 18V-55 Professional','Tous domaines','–','RC',1,195,'Remplacement si défaut','Fixations lourdes, percement tôlerie armoires, chemins de câbles.','https://www.bosch-professional.com/fr/fr/products/gsb-18v-55-0615A5003N.html'],
  ['e11','E','OUTILS','Clé dynamométrique 3/8" 2-25 Nm – bornes et cosses','Facom','S.306-25','BT / DC – Boulonnerie fine','ISO 6789 – Classe II','OB',1,165,'Annuelle (étalonnage)','Bornes borniers, cosses 4-16mm², terminaisons HTA. Certificat inclus.','https://www.facom.com/fr/tools/torque/torque-wrenches/S.306-25.html'],
  ['e12','E','OUTILS','Clé dynamométrique 1/2" 20-200 Nm – armoires','Facom','S.307-200','BT / HTA – Boulonnerie moyenne','ISO 6789 – Classe II','OB',1,210,'Annuelle (étalonnage COFRAC)','Fixations armoires, boulonnerie MT, cosses 50-150mm².','https://www.facom.com/fr/tools/torque/torque-wrenches/S.307-200.html'],
  ['e13','E','OUTILS','Clé dynamométrique 3/4" 60-600 Nm – jeux de barres','Stahlwille','730N/10 + 731/10','HTA / HTB – Boulonnerie forte','ISO 6789 – Classe II','OB',1,385,'Annuelle (étalonnage COFRAC)','Jeux de barres HTA, brides transformateurs, raccords 25kV. COFRAC obligatoire.','https://www.stahlwille.de/fr-FR/produits/cles-dynamometriques/730n'],
  ['e14','E','OUTILS','Clé dynamométrique électronique 2-200 Nm USB','Facom','E.316-200 NANO','BT / HTA – Traçabilité','ISO 6789 Type II Classe A','RC',1,580,'Annuelle (étalonnage COFRAC)','Mémoire 1000 serrages. Export USB/Bluetooth. Exigé par certains référentiels.','https://www.facom.com/fr/tools/torque/electronic-torque-wrenches/E.316-200.html'],
  ['e15','E','MHTA','Détecteur tension HTA 1kV-36kV + sonde télescopique','Catu','CM-64 / CM-210','HTA 10-36kV','NF EN 61243-1 – Classe IIa','OB',2,480,'Annuelle (étalonnage obligatoire)','VAT obligatoire avant toute mise à la terre HTA.','https://www.catu.com/fr/produits/detection-de-tension/detecteurs-hta'],
  ['e16','E','MHTA','Détecteur tension HTB 25kV – caténaire AC','Catu','CM-42 / Horstmann DSP-HV','HTB 25kV Caténaire','NF EN 61243-1','OB',1,720,'Annuelle (étalonnage obligatoire)','Spécifique ligne 25kV. Vérif. sur vérificateur étalonné avant tout usage.','https://www.catu.com/fr/produits/detection-de-tension/detecteurs-htb'],
  ['e17','E','MHTA','Comparateur de phase HTA synchronisme 10-36kV','Catu','CM-51','HTA 10-36kV','NF C 18-150','OB',1,590,'Annuelle','Vérification couplage / parallélisme sous-stations HTA.','https://www.catu.com/fr/produits/comparateurs-de-phase'],
  ['e18','E','MHTA','Analyseur qualité réseau triphasée Classe A','Fluke','435-II','BT / HTA (via TC/TP)','IEC 61000-4-30 Classe A','OB',1,4200,'Annuelle (étalonnage)','Analyse harmoniques, creux, flicker. Enregistrement long terme.','https://www.fluke.com/fr-fr/produit/analyseurs-qualite-alimentation/fluke-435-ii'],
  ['e19','E','MHTA','Mégohmmètre numérique 5kV DC','Megger','MIT525','BT / HTA / Câbles','IEC 61557-2','OB',1,1650,'Annuelle (étalonnage)','Mesure PI, DAR, DD. Câbles HTA, transformateurs sous-stations.','https://www.megger.com/fr/products/test-equipment/insulation-resistance-testers/mit525'],
  ['e20','E','MHTA','Mégohmmètre numérique 10kV DC','Megger','MIT1025/2','HTA 10-36kV / HTB 25kV','IEC 61557-2','RC',1,3800,'Annuelle (étalonnage)','Tests isolement câbles MT et bobinages transformateurs 25kV.','https://www.megger.com/fr/products/test-equipment/insulation-resistance-testers/mit1025'],
  ['e21','E','MHTA','Micro-ohmmètre résistance de contact 10-200A DC','Megger','DLRO10X','HTA / Appareillage','IEC 62271 / IEC 60044','OB',1,2650,'Annuelle (étalonnage)','Résistance contacts disjoncteurs, sectionneurs, jeux de barres.','https://www.megger.com/fr/products/test-equipment/low-resistance-ohmmeters/dlro10x'],
  ['e22','E','MHTA','Testeur relais protection numérique 3 phases','Omicron','CMC 353','HTA / Protection','IEC 60255 – IEC 61850','OB',1,16500,'Annuelle (étalonnage)','Injection triphasée courant/tension. Test relais différentiel, surcharge, distance.','https://www.omicronenergy.com/fr/products/cmc-353'],
  ['e23','E','MHTA','Testeur TC/TP rapport de transformation + polarité','Megger','MRCT / TTR300','HTA / TC-TP','IEC 60044-1 / IEC 61869','RC',1,3200,'Annuelle (étalonnage)','Rapport transformation, courant excitation, polarité TC et TT.','https://www.megger.com/fr/products/test-equipment/transformer-test/mrct'],
  ['e24','E','MHTA','Testeur VLF isolement câbles HTA 34kV','Baur','PHG TD/VLF 34 kV','HTA 10-36kV','IEC 60060-3 / NF C 33-052','RC',1,8500,'Bi-annuelle','Test diélectrique câbles HTA en service. 0.1 Hz.','https://www.baur.eu/products/vlf-testing/phg-td'],
  ['e25','E','MHTA','Clamp-on Earth Tester – mesure Rt sans déconnexion','Fluke','1630-2 FC','Tous domaines – Réseau de terre','IEC 61557-5','OB',1,780,'Annuelle (étalonnage)','Mesure Rt sans déconnexion électrodes. Fluke Connect WiFi.','https://www.fluke.com/fr-fr/produit/mesure-resistance-terre/fluke-1630-2-fc'],
  ['e26','E','MHTA','Test continuité/isolement écrans câbles HTA','Megger','MIT525 + accessoires écrans','HTA 10-36kV','IEC 60502-4','OB',1,185,'Annuelle (étalonnage)','Continuité écrans Cu/Al câbles HTA après jonctionnement.','https://www.megger.com/fr/products/test-equipment/insulation-resistance-testers/mit525'],
  ['e27','E','MBTDC','Pince ampèremétrique 2500A AC/DC + iFlex flexible','Fluke','376 FC + iFlex Kit','DC Traction 750-1500V / BT','CAT III 1000V / CAT IV 600V','OB',2,520,'Annuelle (étalonnage)','Mesure courant retour traction jusqu\'à 2500A DC.','https://www.fluke.com/fr-fr/produit/mesure-courant/pinces-amperemetriques/fluke-376-fc'],
  ['e28','E','MBTDC','Analyseur réseau DC – tension, puissance, énergie','Metrel','MI2892 PowerQ4 Plus','DC Traction 750-1500V','IEC 61000-4-30','OB',1,2100,'Annuelle (étalonnage)','Analyse qualité DC. Ondulation, chutes tension, harmoniques DC.','https://www.metrel.si/instruments/power-and-energy-analysers/MI2892'],
  ['e29','E','MBTDC','Testeur batteries stationnaires – impédance interne','Fluke','BT521 Battery Analyzer','DC Auxiliaires 24-110V','IEEE 1188 / IEC 60896','OB',1,1200,'Annuelle (étalonnage)','Diagnose batteries UPS, 24VDC, 110VDC sous-stations.','https://www.fluke.com/fr-fr/produit/testeurs-batteries/fluke-bt521'],
  ['e30','E','MBTDC','Testeur résistance de terre 3 et 4 pôles – GEO Kit','Fluke','1625-2 GEO Kit','Tous domaines – Mise à la Terre','IEC 61557-5','OB',1,1650,'Annuelle (étalonnage)','Méthode 3 et 4 pieux. Indispensable sous-stations et boucles de terre.','https://www.fluke.com/fr-fr/produit/mesure-resistance-terre/fluke-1625-2-geo'],
  ['e31','E','DIAG','Caméra thermique radiométrique 320x240 – MSX WiFi','Fluke','Ti480 PRO','Tous domaines','EN 13187 / IEC 60068-2','OB',1,5400,'Annuelle (étalonnage COFRAC)','Inspection préventive HTA/BT/DC. Points chauds disjoncteurs, câbles.','https://www.fluke.com/fr-fr/produit/cameras-thermiques/fluke-ti480-pro'],
  ['e32','E','DIAG','Oscilloscope portable 4 voies 200MHz CAT III','Fluke','190-204/S ScopeMeter','BT / DC Traction','CAT III 1000V – IP51','RC',1,2400,'Annuelle','Analyse formes ondes variateurs, convertisseurs, relais.','https://www.fluke.com/fr-fr/produit/oscilloscopes/fluke-190-204-s'],
  ['e33','E','DIAG','Localisateur défauts câbles TDR BT/HTA','Megger','PFL40B','BT / HTA / DC Traction','IEC 61196','RC',1,4200,'Annuelle','Localisation ruptures, courts-circuits, défauts isolement. Précision ±1m.','https://www.megger.com/fr/products/test-equipment/cable-fault-location/pfl40b'],
  ['e34','E','DIAG','Analyseur de spectre portable EMC/HF','Anritsu','MS2711E','Tous domaines – EMC','IEC 61000-4 série','OP',1,3800,'Bi-annuelle','Perturbations harmoniques, EMC, interférence signalisation voie.','https://www.anritsu.com/fr-FR/test-measurement/products/ms2711e'],
  ['e35','E','LOTO','Perche mise à la terre équipotentielle HTA 10-36kV','Catu','MT-56-003','HTA 10-36kV','NF EN 61230 – NF C 18-150','OB',2,850,'Annuelle (test diélectrique)','Obligatoire après VAT. 3 électrodes + câble équipotentiel.','https://www.catu.com/fr/produits/mise-a-la-terre/perches-equipotentielles'],
  ['e36','E','LOTO','Perche mise à la terre traction DC 750-1500V','Sicame / Catu','MTDC-1500V','DC Traction 750-1500V','EN 50526 / UIC 660','OB',2,620,'Annuelle (test diélectrique)','Court-circuite le circuit aérien. Adaptateurs rail et fil de contact inclus.','https://www.catu.com/fr/produits/mise-a-la-terre/traction-dc'],
  ['e37','E','LOTO','Station LOTO collective hasp 13 cadenas','Brady','65674 + 51174 hasp','Tous domaines','ISO 3864 / EN 1037','OB',2,145,'Annuelle','Hasp acier + cadenas collectif. Interventions multi-techniciens.','https://www.bradyid.eu/fr-fr/lockout-tagout/hasp-lockouts/51174'],
  ['e38','E','CABLE','Coupe-câble à rochet mécanique jusqu\'à 150mm²','Knipex','95 27 200','BT / DC Traction / MT','EN ISO 5744','OB',1,145,'Remplacement lames si usure','Câbles Cu et Al jusqu\'à 150mm². Lames remplaçables.','https://www.knipex.com/index.php?cl=details&artNum=9527200'],
  ['e39','E','CABLE','Coupe-câble hydraulique manuel jusqu\'à 630mm²','Klauke','K50 / EK50ML','HTA 10-36kV / DC Traction','EN ISO 5744','OB',1,580,'Annuelle (inspection)','Câbles HTA Cu/Al jusqu\'à 630mm². Tête rotative 360°.','https://www.klauke.com/fr/produits/outils-a-couper/coupe-cables-hydrauliques'],
  ['e40','E','CABLE','Cisaille câbles armés MT – jusqu\'à 50mm diam.','Greenlee','CS750','HTA câbles armés MT','EN ISO 5744','RC',1,320,'Annuelle (inspection lames)','Dépose câbles HTA à armure acier ou feuillard alu.','https://www.greenlee.com/cable-cutting-tools/cs750'],
  ['e41','E','CABLE','Pince à sertir rochet petites sections 0.5-16mm²','Weidmuller','PZ 6 Roto','BT / DC – Circuits contrôle 24-110V','EN 60947-7 / DIN 46228','OB',2,95,'Remplacement si usure','Sertissage embouts et cosses circuits contrôle. Rochet anti-retour.','https://www.weidmueller.com/fr/products/tools/crimping-tools/pz-6-roto'],
  ['e42','E','CABLE','Tire-fil fibre de verre 20m – aiguille de tirage','Greenlee','540','Tous domaines – Pose câbles','–','OB',1,85,'Remplacement si rupture','Tirage câbles BT, DC, contrôle dans fourreaux. Non conducteur.','https://www.greenlee.com/fish-tapes/540'],
  ['e43','E','CABLE','Kit étanchéité câbles HTA – résine + gaines thermo','Raychem / nVent','RSTI-A / CSJA Series','HTA 10-36kV / DC Traction','IEC 60502-4 / HD 620','OB',1,220,'Consommable','Jonctionnement, terminaison ou réparation câble HTA.','https://www.nvent.com/fr-fr/raychem/cables/cable-accessories'],
  ['e44','E','COLLECTIF','Groupe électrogène portable 3.5 kVA – 230V silencieux','Honda','EU30i','Auxiliaires BT','EN 12601','RC',1,1850,'Annuelle (vidange + révision)','Alimentation secourue zone sans alimentation. 50-56 dB.','https://www.honda.fr/power/products/generators/eu30i.html'],
  ['e45','E','COLLECTIF','Mallette signalisation + balisage chantier ferroviaire','HEKA / Vepro','Kit signalisation ferroviaire','Tous domaines – Sécurité voie','NF EN ISO 7010','OB',2,280,'Annuelle (inspection)','Cônes classe 2, panneaux NF, ruban rouge/blanc.','https://www.heka-signal.com/signalisation-ferroviaire'],
  ['e46','E','COLLECTIF','Trousse premiers secours professionnelle EN13169','Aptus / Gramm Medical','First Aid Kit Pro','Tous domaines','EN 13169 / DIN 13157','OB',1,65,'6 mois (vérif. péremption)','Vérifier péremption et garnissage tous les 6 mois.','https://www.gramm-medical.com/trousses-secours-professionnelles'],
  ['e47','E','COLLECTIF','Extincteur CO2 5kg – classe B/C armoires électriques','Sicli / Amerex','T5','Tous domaines','EN 615 / EN 3-7','OB',1,155,'Annuelle (contrôle pression)','CO2 uniquement pour armoires électriques.','https://www.sicli.com/extincteurs/extincteur-co2-5kg'],
  ['e48','E','COLLECTIF','Ordinateur portable durci IP65 Win11 Pro Toughbook','Panasonic','Toughbook FZ-55','Tous domaines – Diagnostic','IP65 – MIL-STD-810H','RC',2,2800,'Remplacement 5 ans','Connexion relais IEC 61850, SCADA, config variateurs.','https://www.panasonic.com/fr/computers/toughbook/fz-55.html'],
];

const TOOLS = RAW.map(([id,level,cat,name,brand,model,domain,norm,statut,qty,price,period,notes,productUrl]) =>
  ({id,level,cat,name,brand,model,domain,norm,statut,qty,price,period,notes,productUrl}));

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
      {ok?<CheckCheck size={11}/>:<Copy size={11}/>} {ok?'Copié !':label}
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
              ['SÉLECTIONNÉS', sel.size, C.teal],
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
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher outil, marque..." style={{
                width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:8,
                padding:'7px 10px 7px 30px', color:C.text, fontSize:12, outline:'none',
                fontFamily:"'Barlow', sans-serif",
              }}/>
            </div>

            {/* Level */}
            <div style={{ display:'flex', gap:5 }}>
              {[['ALL','Tous'],['T','Technicien'],['E','Équipe']].map(([v,l])=>pill(lvl===v,acc,l,()=>setLvl(v)))}
            </div>

            {/* Statut */}
            <div style={{ display:'flex', gap:5 }}>
              {[['ALL','Tous statuts'],['OB','Obligatoire'],['RC','Recommandé'],['OP','Optionnel']].map(([v,l])=>
                pill(stat===v, STATUTS[v]?.color||acc, l, ()=>setStat(v))
              )}
            </div>

            {/* Category */}
            <select value={cat} onChange={e=>setCat(e.target.value)} style={{
              background:C.bg, border:`1px solid ${C.border}`, color:C.text, padding:'6px 10px',
              borderRadius:8, fontSize:11, outline:'none', cursor:'pointer', fontFamily:"'Barlow', sans-serif",
            }}>
              <option value="ALL">Toutes catégories</option>
              {Object.entries(CATS).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>

            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:C.textSub }}>{filtered.length} outils</span>
              <button onClick={()=>setSel(p=>{const n=new Set(p);filtered.forEach(t=>n.add(t.id));return n;})}
                style={{ background:C.bg, border:`1px solid ${C.border}`, color:C.textSub, padding:'5px 11px', borderRadius:6, cursor:'pointer', fontSize:11, fontFamily:"'Barlow', sans-serif" }}>
                Tout cocher
              </button>
              <button onClick={()=>setSel(p=>{const n=new Set(p);filtered.forEach(t=>n.delete(t.id));return n;})}
                style={{ background:C.bg, border:`1px solid ${C.border}`, color:C.textSub, padding:'5px 11px', borderRadius:6, cursor:'pointer', fontSize:11, fontFamily:"'Barlow', sans-serif" }}>
                Effacer
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
                      <CatSVG cat={t.cat} size={58}/>
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
                          {t.level==='T'?'TECH':'ÉQUIPE'}
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
            <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:13, fontWeight:700, letterSpacing:'0.08em', color:acc }}>SYNTHÈSE</span>
          </div>

          <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:12, flex:1 }}>

            {/* Total budget */}
            <div style={{ background:C.bg, borderRadius:10, padding:'14px 16px', border:`1px solid ${total>0?acc+'40':C.border}` }}>
              <div style={{ fontSize:9, color:C.textSub, marginBottom:6, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.08em' }}>BUDGET TOTAL SÉLECTIONNÉ</div>
              <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:26, fontWeight:700, color:total>0?acc:C.textMuted }}>
                {fmt(total)} €
              </div>
              <div style={{ fontSize:11, color:C.textSub, marginTop:4 }}>
                {sel.size} outil{sel.size!==1?'s':''} sélectionné{sel.size!==1?'s':''}
              </div>
            </div>

            {/* By level */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[['T','Technicien',C.teal,tTotal],['E','Équipe',C.blue,eTotal]].map(([lv,label,color,budget])=>(
                <div key={lv} style={{ background:C.bg, borderRadius:8, padding:'10px 11px', border:`1px solid ${color}25` }}>
                  <div style={{ fontSize:9, color, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em' }}>{label.toUpperCase()}</div>
                  <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:14, fontWeight:700, color, marginTop:4 }}>{fmt(budget)} €</div>
                  <div style={{ fontSize:9, color:C.textSub, marginTop:2 }}>{selT.filter(t=>t.level===lv).length} outils</div>
                </div>
              ))}
            </div>

            {/* By category bars */}
            {byCat.length>0&&(
              <div>
                <div style={{ fontSize:9, color:C.textSub, marginBottom:9, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.08em' }}>RÉPARTITION PAR CATÉGORIE</div>
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
                <span style={{ fontSize:10, fontWeight:700, color:acc, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>EFFECTIFS — POS</span>
              </div>
              <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  ['Nb techniciens', nbTech, setNbTech, C.teal],
                  ['Nb équipes', nbEquipe, setNbEquipe, C.blue],
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
                  <span style={{ fontSize:10, fontWeight:700, color:acc, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.07em' }}>BUDGET CONFIGURATION</span>
                </div>
                <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:0 }}>
                  {[
                    [`${nbTech} tech · ${nbEquipe} équipe${nbEquipe>1?'s':''}`, nbTech*tTotal + nbEquipe*eTotal, acc, true],
                    [`Techniciens (×${nbTech})`, nbTech*tTotal, C.teal, false],
                    [`Équipes (×${nbEquipe})`, nbEquipe*eTotal, C.blue, false],
                  ].map(([label, val, col, bold], idx)=>(
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom: idx<2?`1px solid ${C.border}`:'none', opacity: idx>0&&val===0?0.4:1 }}>
                      <span style={{ fontSize: bold?12:10, color: bold?C.text:C.textSub, fontWeight: bold?600:400 }}>{label}</span>
                      <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize: bold?14:11, fontWeight: bold?700:500, color:col }}>{fmt(val)} €</span>
                    </div>
                  ))}
                </div>
                {/* Budget per tech / per equipe */}
                <div style={{ padding:'10px 14px', borderTop:`1px solid ${C.border}`, background:C.bgMid, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {[['/ technicien', tTotal, C.teal], ['/ équipe', eTotal, C.blue]].map(([l,v,col])=>(
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
                Cochez des outils<br/>pour calculer le budget
              </div>
            )}

            {/* Database stats */}
            <div style={{ marginTop:'auto', paddingTop:12, borderTop:`1px solid ${C.border}` }}>
              <div style={{ fontSize:9, color:C.textSub, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.08em', marginBottom:8 }}>BASE POS — {TOOLS.length} OUTILS</div>
              {[
                ['Technicien', TOOLS.filter(t=>t.level==='T').length, C.teal],
                ['Équipe', TOOLS.filter(t=>t.level==='E').length, C.blue],
                ['Obligatoires', TOOLS.filter(t=>t.statut==='OB').length, C.orange],
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
                    {modal.level==='T'?'👤 Technicien':'👥 Équipe'}
                  </span>
                </div>
                <button onClick={()=>setModal(null)} style={{ background:'transparent', border:'none', cursor:'pointer', color:C.textSub, padding:4 }}><X size={18}/></button>
              </div>

              <div style={{ display:'flex' }}>
                {/* Left */}
                <div style={{ width:195, flexShrink:0, background:C.bgMid, display:'flex', flexDirection:'column', alignItems:'center', gap:14, padding:'22px 16px', borderRight:`1px solid ${C.border}` }}>
                  <div style={{ width:150, height:130, background:C.bg, borderRadius:14, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <CatSVG cat={modal.cat} size={100}/>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:c.color, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.04em' }}>{modal.brand}</div>
                    <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:10, color:C.textSub, marginTop:5, background:C.bg, padding:'3px 10px', borderRadius:5, border:`1px solid ${C.border}`, display:'inline-block' }}>{modal.model}</div>
                  </div>

                  {/* Price */}
                  <div style={{ background:C.bg, borderRadius:10, padding:'12px 14px', textAlign:'center', width:'100%', border:`1px solid ${c.color}30` }}>
                    <div style={{ fontSize:9, color:C.textSub, marginBottom:3, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em' }}>PRIX UNITAIRE</div>
                    <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:22, fontWeight:700, color:c.color }}>{fmt(modal.price)} €</div>
                    <div style={{ fontSize:10, color:C.textSub }}>× {modal.qty} {modal.level==='E'?'/ équipe':'/ tech'}</div>
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
                    {isSel?<><Check size={13}/> SÉLECTIONNÉ</>:'+ AJOUTER'}
                  </button>
                </div>

                {/* Right */}
                <div style={{ flex:1, padding:'20px 22px', overflowY:'auto', maxHeight:490 }}>
                  <div style={{ fontSize:16, fontWeight:600, lineHeight:1.35, color:C.text, marginBottom:16 }}>{modal.name}</div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, marginBottom:14 }}>
                    {[['Domaine tension',modal.domain],['Norme / Isolement',modal.norm],['Vérification / Étalonnage',modal.period],['Quantité',`${modal.qty} ${modal.level==='T'?'par technicien':'par équipe'}`]].map(([l,v])=>(
                      <div key={l} style={{ background:C.bgMid, borderRadius:8, padding:'9px 12px', border:`1px solid ${C.border}` }}>
                        <div style={{ fontSize:9, color:C.textSub, marginBottom:4, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em' }}>{l.toUpperCase()}</div>
                        <div style={{ fontSize:12, color:C.text, fontWeight:500 }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  <div style={{ background:`${c.color}0D`, borderRadius:8, padding:'12px 14px', border:`1px solid ${c.color}25`, marginBottom:12 }}>
                    <div style={{ fontSize:9, color:c.color, marginBottom:5, fontWeight:700, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em', display:'flex', alignItems:'center', gap:4 }}>
                      <Info size={10}/> NOTES TECHNIQUES
                    </div>
                    <div style={{ fontSize:12, color:C.text, lineHeight:1.6 }}>{modal.notes}</div>
                  </div>

                  {/* Alerts */}
                  {modal.statut==='OB'&&(
                    <div style={{ background:C.orangeDim, borderRadius:8, padding:'10px 14px', border:`1px solid ${C.orange}30`, display:'flex', gap:8, alignItems:'flex-start', marginBottom:10 }}>
                      <AlertTriangle size={13} color={C.orange} style={{ flexShrink:0, marginTop:1 }}/>
                      <div style={{ fontSize:11, color:C.orange, lineHeight:1.45 }}>
                        Outil <strong>obligatoire</strong> — son absence peut constituer un manquement aux exigences réglementaires ou de sécurité.
                      </div>
                    </div>
                  )}
                  {modal.period.includes('étalonnage')&&(
                    <div style={{ background:C.violetDim, borderRadius:8, padding:'10px 14px', border:`1px solid ${C.violet}30`, display:'flex', gap:8, marginBottom:10 }}>
                      <Info size={13} color={C.violet} style={{ flexShrink:0, marginTop:1 }}/>
                      <div style={{ fontSize:11, color:C.violet, lineHeight:1.45 }}>
                        <strong>Étalonnage périodique requis</strong> — à intégrer au plan de maintenance métrologique de l'équipe.
                      </div>
                    </div>
                  )}

                  {/* Product URL */}
                  <div style={{ background:C.bgMid, borderRadius:8, padding:'12px 14px', border:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:9, color:C.textSub, marginBottom:7, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:'0.06em' }}>LIEN PAGE PRODUIT OFFICIELLE</div>
                    <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:10, color:C.teal, wordBreak:'break-all', marginBottom:9, lineHeight:1.55 }}>{modal.productUrl}</div>
                    <CopyBtn text={modal.productUrl} label="Copier le lien produit" accent={C.teal}/>
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
