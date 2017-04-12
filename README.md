# prosumer-micro-market

First implementation of automated electricity metering and billing based on Ethereum blockchain.

WHAT DOES IT DO?

An electricity micro-market is a market structure for distributed participants over a feeder of the distribution network (e.g. many households in a neighbourhood connected to the same electrical substation).

In this first version, the market can only execute automated metering of the electrical consumption and generation, and billing the participants accordingly, all based on blockchain. The participants can be prosumers (someone who generates and consumes electricity) or simply consumers.

HOW DOES THE SMART-CONTRACT WORK?

Each participant is stored on the blockchain as an "Entity", defined in the smart-contract as new types in the form of structs.

Consumption and generation data is retrieved by each participant's smart-meter every 15 minutes and stored on the blockchain. The smart-contract then checks the production difference of each participants, calculates the price and then executes the billing.

So far, the price is calculated simply based on total available electricity supply and demand. Future developments will use single and double-sided auctions mechanisms.

HOW DO THE JAVASCRIPT FILES WORK?

The files interacting with the smart-contract are the following: addEntity.js, slave.js, master.js.

The slave file is executed on the distributed IoT devices, it receives data from the particpant's smart-meter via Modbus and calculates the accumulated consumption and generation data. Upon request all the "slaves" send the data to the blockchain.

The master file is the "regulator" of the micro-market and coordinates all the distributed IoT devices that are part of the market. Every 15 minutes it sends the request to the "slaves" to send the data to the blockchain (We are aware that by doing this we are introducing a possible single point of failure, but for the simple purpose of development we decided to do this to sync all the different participants without relying on block number and time). When the data is sent, the auction algorithm calculates the clearing price and bills the participants accordingly.

FUTURE DEVELOPMENTS

1) Use of a customsied cryptocurrency instead of increasing/decresing the entitiy's credit
2) Double-sided auction algorithm
3) The market described above will be the day-ahead market based on generation and load forecasts. The imabalances will be handled in the 1-hour-ahed market using flexibility and demand-side-response.
