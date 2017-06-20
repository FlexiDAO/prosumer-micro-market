# prosumer-micro-market

[_Work in progress_]

**WHAT DOES IT DO?**

In collaboration with CITCEA and Empower2020, we are designing a decentralised and autonomous electricity trading micro-market for local microgrids.

A micro-market is a market structure for distributed participants over a feeder of the distribution network (a neighborhood connected to the same LV/MV transformer).

The objective is to empower local prosumers, keep electricity generation and consumption local to allievate the stress on the distribution grid and encourage distributed energy architecture development by exploiting the unmet consumer preferences in the current system.

**MARKET STRUCTURE**

The design of the micro-market is divided in three parts:

o	Day-ahead market: It takes place 24 hours in advance. DER generators can offer and sell their forecasted generation and consumers their load. Demand and supply matching and auction algorithm are implemented and executed by the smart-contract deployed on Ethereum. The clearing price and the amount of scheduled consumption and generation are calculated and sent to the participants of the market.

o	Intra-day balancing market: It takes place 1 hour before the actual start of the power flow. In time-slots of 15 minutes, possible imbalances between supply and demand are solved by another auction market implemented in the smart-contract for both generation and demand-side-response using EVs and flexible loads.  

o	Real-time metering and billing: After the intra-day market is closed the real power flow for that given hour starts. The actual and real-time power flow is metered, the data is stored on the blockchain and money transfer takes place accordingly using cryptocurrency.

The market structure and the auction algorithm are both implemented in smart-contracts deployed on Ethereum. 

**ARCHITECTURE**

The basic proof-of-concept architecture of the overall system is shown in the following scheme. For ease of representation, only battery and PV panel are showed. The slack point (it could be diesel generator, CHP plant or an over-sized battery) is included because the microgrid is operating in island-mode. The actual microgrid used at UPC will include also small-scale wind turbine, multiple loads and EVs.

1- The first layer is the microgrid, where the power flow physically takes place.  

2- The second layer is the Blockchain and Data layer. The Smart Contract hosts the market and acts as regulator. Every participant of the market is equipped with an IoT device that runs a blockchain node (RPi node = Agent) and interacts with the generation/consumption unit. The different operations of this layer are explained previously in the market section.
  
3- The third layer is the “money” layer. Each node will have an account used to deposit or receive transactions from the other participants of the microgrid. This happens during real-time operations in 15 minutes time-slots.

The agent is based on open-source technologies and libraries. At the current stage of development these are the main elements of each participant’s IoT device (https://github.com/SolarLibary/ethereum-smartplug)
 
