import { network } from "hardhat";
import { writeFileSync } from "node:fs";

const { ethers } = await network.getOrCreate();
const [admin, ...autres] = await ethers.getSigners();
const noeuds = autres.slice(0, 3);   // 3 nœuds autorisés
const intrus = autres[5];            // nœud NON autorisé

const contrat = await ethers.deployContract("MesureLog");
console.log("Contrat :", await contrat.getAddress());

for (const n of noeuds) await contrat.autoriserNoeud(n.address);

// 1) Les nœuds envoient des mesures
const releves: { donnee: string; hash: string }[] = [];
for (let i = 0; i < 9; i++) {
  const n = noeuds[i % noeuds.length];
  const donnee = JSON.stringify({
    noeud: n.address,
    temperature: +(20 + Math.random() * 10).toFixed(1),
    humidite: Math.round(40 + Math.random() * 30),
    ts: Date.now(),
  });
  const hash = ethers.keccak256(ethers.toUtf8Bytes(donnee));
  await contrat.connect(n).enregistrerMesure(hash);
  releves.push({ donnee, hash });
}
console.log("Mesures enregistrées :", (await contrat.nombreMesures()).toString());

// 2) Un intrus essaie d'écrire
try {
  await contrat.connect(intrus).enregistrerMesure(ethers.keccak256("0x01"));
  console.log("❌ PROBLÈME : intrus accepté");
} catch {
  console.log("✅ Intrus refusé");
}

// 3) Vérification d'intégrité (puis falsification d'une donnée)
releves[4].donnee = releves[4].donnee.replace(/"temperature":\d+(\.\d+)?/, '"temperature":99');
let ok = 0;
for (let i = 0; i < releves.length; i++) {
  const m = await contrat.mesures(i);
  const recalcule = ethers.keccak256(ethers.toUtf8Bytes(releves[i].donnee));
  const valide = m.hashMesure === recalcule;
  if (valide) ok++;
  else console.log(`⚠️ Mesure ${i} falsifiée !`);
}
console.log(`Intégrité : ${ok}/${releves.length} valides`);

const dashData = [];
for (let i = 0; i < releves.length; i++) {
  const m = await contrat.mesures(i);
  dashData.push({
    i,
    noeud: m.noeud,
    donnee: releves[i].donnee,
    hashChaine: m.hashMesure,
    date: Number(m.date),
  });
}
writeFileSync("dashboard-data.json", JSON.stringify(dashData, null, 2));