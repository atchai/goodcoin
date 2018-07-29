# GoodDollar

GoodDollar is a UBI system built on the Ethereum blockchain.

This repo contains the code for the v0.2 proof of concept.  This POC provides the following functionality:

* ERC-20 token - GTC (GoodDollar Test Coin)
* Buy and sell tokens from a market maker contact, the price is calculated based on the Bancor formula.
* UBI - participants can claim tokens that will be transferred to them for free
  * The total amount of tokens available to the pool of UBI participants will be 1% of the total number of GTC tokens
  * This 1% allowance will be divided between the total number of participants and each participant will only be able to make a claim 24 hours or more after their last claim.
  * In order to become a UBI participant you must be whitelisted.  Initially only the contract deployer is whitelisted but they can whitelist new users, and they can whitelist new users and so on.
* Dapp enables users to interact with the contract from their browser + MetaMask

## Usage
This section will refer to the test deployment that has been set up on Ropsten testnet.

You have been provided with the details of 1 owner and 5 test user accounts.  Please import these accounts into Metamask before proceeding.  Each account has been pre-loaded with some ether for gas costs.

* Log into the owner user account in Metamask (make sure you're on Ropsten network)

* Go to [http://goodcoin.atchai.com/](http://goodcoin.atchai.com/)

![alt text](https://github.com/atchai/goodcoin/raw/master/docs/new-user.png "screenshot")

* You should see the above screen.  


### UBI participants
If you have been whitelisted then you can click the "claim tokens" button.  Metamask should pop up asking you to confirm a transaction, click Submit.  You will have to wait for your transaction to be mined (30s-1m). Once you refresh the page you should see your GTC balance updated.

This process will cause the contract to mint the number of tokens that you are entitled to and then transfer them to your wallet.

If you do not see the "Claim tokens" button then you are probably not whitelisted.  You will have to ask a user who is whitelisted to add you.



## Development

### Prerequisites

* Node.js v8.9.4
* Ganache (or some other local test ethereum node)
* Infura API account and ethereum account loaded with some ETH (we're using Ropsten)
* The following environment variables set in a .env file in /app:
  * MNEMONIC  (seed mnemonic of an account where first derived address has positive balance)
  * INFURA_API (infura eth node api key)

### Installation

```
npm install
```

Deploy contract:

`truffle migrate`

Update contract_address and server_address in app/src/index.js and app/server.js

Start Ganache or another ethereum node

In a browser go to: http://localhost:3001

Connect to Ganache's network in metamask and import a user from Ganache so that you have ether to spend.

## Deployment

To deploy on Ropsten via Infuura ensure the environment vars are set:

* process.env.MNEMONIC
* process.env.INFURA_API
* process.env.NETWORK_ID

Run ```truffle migrate --network ropsteninfura```
