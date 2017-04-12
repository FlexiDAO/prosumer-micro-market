var Web3 = require('web3');
var fs = require('fs');
var rpc = require('node-json-rpc');

var indexOnBlockchain, name, genWh, conWh;


/*============ Web3 Initialisation =============================*/
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
if (!web3.isConnected()) {
    console.log("you are note connected to node...")
} else {
    console.log("node is connected! \n web3 version:", web3.version.api)
}

/*=========== Contract ABI from a file and contract address ==================*/

var bisol_address = fs.readFileSync('../BISOL_implementation_1/BISOL_5.txt', 'utf8'); //address

const Abi = require('../BISOL_implementation_1/BISOL_5.json'); //abi
const Contract = web3.eth.contract(Abi);
const Bisol = Contract.at(bisol_address.trim());

/*============ Password from a file =========================*/
var password = fs.readFileSync('/home/nodepwrd.txt', 'utf8');


/*============ JSON-RPC communication to node ================================*/
var options = {
  // int port of rpc server, default 5080 for http or 5433 for https
  // for parity(default) 8545
  port: 8545,
  // string domain name or ip of rpc server, default '127.0.0.1'
  host: '127.0.0.1',
  // string with default path, default '/'
  path: '/',
  // boolean false to turn rpc checks off, default true
  strict: true
};
// Create a client object with options
var client = new rpc.Client(options);

/*=========== Unlocking account for one transaction =======================*/
function unlockAndExecute(makeTransaction){

//makeTransaction - function that requres signing
//accIndex        - index of your account in node

  client.call(
    {"method":"personal_unlockAccount","params": [web3.eth.accounts[1], password.trim(), null ],"id":1,"jsonrpc":"2.0"},
    function (err, res) {
      if (err) {
        console.log(err);
      }
      else {
        console.log(res);
        console.log("signing transaction.....");
        makeTransaction(); //function that requires unlocking account
      }
    }
  );
}

/*============================= kWh simulation ===============================*/
var genSimulation = function() {
    const query = () => {

        const upperLimit = 10 //upperLimit of random number generation
        // Math.random() - gives random number from 0 to 1  (e.g 0.034235634637 or 0.95042121521521)
        // Math.floor() - rounds the number to intigers
        const fakeWh = Math.floor(Math.random() * (upperLimit)) // from 0 to "upperLimit" rounded

        genWh = fakeWh;
        conWh = 5;

        console.log("simulated generation: ", genWh)
        console.log("fixed consumption: ", conWh)
    }

    query();
//    setInterval(query, 10000);
}


/*=========================Bisol contract interaction=========================*/

//sending consumption and generation values to the Master
var inputGenCon = function() {
    Bisol.sendInput(conWh, genWh, {     // 5 as fixed consupmtion in Wh
        from: web3.eth.accounts[1],
        gas: 300000
    });
}

//printing the enetities status
var printEntityDetails = function() {
    console.log(indexOnBlockchain);
    var entityDetails = Bisol.getEntity(indexOnBlockchain);
    console.log("In blockchain entity no.", indexOnBlockchain," name:", name,"\n", entityDetails);
}

var tradeTokens = function() {
    console.log("Start trading tokens")
    Bisol.trade(totSurplus, totDeficit, {
        from: web3.eth.accounts[1],
        gas: 300000
    });
}

var getIndexOfEntity = function() {

    console.log("starting to watch Total event")

    var filterR3 = Bisol.AddEntity({
      _address: web3.eth.accounts[1]
    },{
      fromBlock: 0,
      toBlock: 'latest'
    });

    filterR3.watch(function(error, result) {
        if (!error) {
            console.log("Name: "       + result.args._name);
            console.log("Adderss: "    + result.args._address);
            console.log("Index: "      + (web3.toDecimal(result.args._index) - 1 ));

            name = result.args._name;
            indexOnBlockchain = (web3.toDecimal(result.args._index) - 1);

            filterR3.stopWatching();
        }
    });
}

//Checking if the totals are calculated correctly
var waitForAggregation = function() {

    console.log("wait For Aggregation...")

    var filterR2 = Bisol.Total({
        fromBlock: 'latest', //we are searching only latest block
        toBlock: 'latest'
    });

    filterR2.watch(function(error, result) {
        if (!error) {
            totSurplus = web3.toDecimal(result.args._totGen);
            totDeficit = web3.toDecimal(result.args._totCons);
            console.log("Available surplus:", totSurplus, "Requested deficit:", totDeficit);

            unlockAndExecute(tradeTokens);
            filterR2.stopWatching();
        }
    });
}

//watching event Start to sync all the inputs send to Master
var waitingForTrigeringEvent = function() {

    console.log("waiting For Trigering Event...")

    var filterR1 = Bisol.Start({
        fromBlock: 'latest', // we are searching only latest block
        toBlock: 'pending' // "pending" just to speed up development process, schould be "latest"
    });

    filterR1.watch(function(error, result) {
        if (!error) {
            console.log(result.args._start); //iniciate data transfer
            unlockAndExecute(inputGenCon); // uploading generation and consumption data to blockchain
            waitForAggregation();
          }
    });
}
/*=======================================================================================*/

genSimulation();

getIndexOfEntity();

waitingForTrigeringEvent();

setInterval(printEntityDetails, 60000);
