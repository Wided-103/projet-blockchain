import { network } from "hardhat";

const { ethers } = await network.connect();

const [admin, noeud] = await ethers.getSigners();

const contrat = await ethers.deployContract("MesureLog");
console.log("Contrat deploye a :", await contrat.getAddress());

await contrat.autoriserNoeud(noeud.address);
console.log("Noeud autorise :", noeud.address);

const hash = ethers.keccak256(ethers.toUtf8Bytes("temperature:25"));
await contrat.connect(noeud).enregistrerMesure(hash);

console.log("Nombre de mesures :", (await contrat.nombreMesures()).toString());

const m = await contrat.mesures(0);
console.log("Noeud :", m.noeud);
console.log("Hash :", m.hashMesure);
console.log("Date :", m.date.toString());
console.log("Integrite OK :", m.hashMesure === hash);