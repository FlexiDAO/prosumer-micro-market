var Web3 = require('web3');
var fs = require('fs');

/*===========================Web3 Initialisation============================*/

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
if (!web3.isConnected()) {
    console.log("we are fucked...")
} else {
    console.log("node is connected! \n web3 version:", web3.version.api)
}

/*================= Contract ABI from a file and contract address ===========*/

var bisol_address = fs.readFileSync('../BISOL_implementation_1/BISOL_5.txt', 'utf8'); //address

const Abi = require('../BISOL_implementation_1/BISOL_5.json'); //abi
const Contract = web3.eth.contract(Abi);
const Bisol = Contract.at(bisol_address.trim());

/*================== adding entities to the market =============*/
/*Note that now it will be executed from your 2nd 3th and 4th account, in the
future it will be only one (coinbase), since it will be called seperatelly from each device*/

Bisol.addEntity("PV_panel", {
    from: web3.eth.accounts[1],
    gas: 300000
});
/*
Bisol.addEntity("Battery", {
    from: web3.eth.accounts[2],
    gas: 300000
});
Bisol.addEntity("Load", {
    from: web3.eth.accounts[3],
    gas: 300000
});
*/
