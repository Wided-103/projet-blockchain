import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("MesureLog", function () {
  const hash = ethers.keccak256(ethers.toUtf8Bytes("temperature:25"));

  async function deploy() {
    const [admin, noeud, intrus] = await ethers.getSigners();
    const contrat = await ethers.deployContract("MesureLog");
    await contrat.autoriserNoeud(noeud.address);
    return { contrat, admin, noeud, intrus };
  }

  it("accepte une mesure d'un noeud autorise", async function () {
    const { contrat, noeud } = await deploy();
    await contrat.connect(noeud).enregistrerMesure(hash);
    expect(await contrat.nombreMesures()).to.equal(1n);
  });

  it("refuse un noeud non autorise", async function () {
    const { contrat, intrus } = await deploy();
    await expect(
      contrat.connect(intrus).enregistrerMesure(hash)
    ).to.be.revertedWith("Noeud non autorise");
  });

  it("refuse autoriserNoeud par un non-admin", async function () {
    const { contrat, intrus } = await deploy();
    await expect(
      contrat.connect(intrus).autoriserNoeud(intrus.address)
    ).to.be.revertedWith("Admin seulement");
  });
});
