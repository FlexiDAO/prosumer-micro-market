var Web3 = require('web3');
var rpc = require('node-json-rpc');
var fs = require('fs');

var totGen, totCons, data;
var received = false;

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
    {"method":"personal_unlockAccount","params": [web3.eth.accounts[0], password.trim(), null ],"id":1,"jsonrpc":"2.0"},
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

/*================================Bisol contract interaction=============================*/

//trigger inputs from slaves
var initiate = function() {
    Bisol.triggerInput({
        from: web3.eth.accounts[0],
        gas: 300000
    });
}

//check if inputs from slaves are received
var watchReceived = function() {

    console.log("starting to watch Received event")

    var entities_length = web3.toDecimal(Bisol.getEntitiesCount());
    var addr_array = Bisol.getEntity(entities_length - 1);
    var last_addr = addr_array[0];

    var filter = Bisol.Received({
        fromBlock: 'latest',
        toBlock: 'latest',
        _from: last_addr
    })

    filter.watch(function(error, result) {
        if (!error) {
            console.log(result.args._result);
            unlockAndExecute(agg);
        }
    });
}

//Calculating total consumption and generation
var agg = function() {
            console.log("Calculating total consumption and generation")
            Bisol.aggregate({
                from: web3.eth.accounts[0],
                gas: 300000
            });
}

/*=================================================================================================*/

unlockAndExecute(initiate);

watchReceived();
