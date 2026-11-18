// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MesureLog {
    address public admin;
    mapping(address => bool) public noeudAutorise;

    struct Mesure {
        address noeud;
        bytes32 hashMesure;
        uint256 date;
    }
    Mesure[] public mesures;

    event MesureEnregistree(address indexed noeud, bytes32 hashMesure, uint256 date);

    constructor() {
        admin = msg.sender;
    }

    function autoriserNoeud(address noeud) external {
        require(msg.sender == admin, "Admin seulement");
        noeudAutorise[noeud] = true;
    }

    function enregistrerMesure(bytes32 hashMesure) external {
        require(noeudAutorise[msg.sender], "Noeud non autorise");
        mesures.push(Mesure(msg.sender, hashMesure, block.timestamp));
        emit MesureEnregistree(msg.sender, hashMesure, block.timestamp);
    }

    function nombreMesures() external view returns (uint256) {
        return mesures.length;
    }
}