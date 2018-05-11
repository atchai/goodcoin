# Goodcoin

Goodcoin is a UBI system built on the Ethereum blockchain.

This repo contains the code for the v0.1 proof of concept.  This POC provides the following functionality:

* ERC-20 token - GTC (GoodCoin Test Coin)
* On deployment, mint and transfer 1200 tokens to the contract owner
* Anyone can mint and claim tokens subject to time-based rules:
  * First time user - can claim 10 Tokens
  * Non-first time user - can claim 1 token per second since the last claim
* Dapp that enables users to interact with the contract from their browser + MetaMask
* Dapp for admins to view account balances of pre-created test accounts and set the token minting multiplier - how many tokens can be minted per second for each user.

## Usage
This section will refer to the test deployment that has been set up on Ropsten testnet.

You have been provided with the details of 1 owner and 5 test user accounts.  Please import these accounts into Metamask before proceeding.  Each account has been pre-loaded with some ether for gas costs.

* Log into a test user account in Metamask (make sure you're on Ropsten network)

* Go to [http://goodcoin.atchai.com/](http://goodcoin.atchai.com/)

![alt text](https://github.com/atchai/goodcoin/raw/master/docs/new-user.png "screenshot")

* You should see the above screen.  If the user has not already interacted with the contract (they have a zero balance) then they will be entitled to 10 tokens.  If they have previously claimed tokens then they will be entitled to one token per second since their last claim.


### Claiming Tokens
Click the "claim tokens" button, metamask should pop up asking you to confirm a transaction, click Submit.  You will have to wait for your transaction to be mined (30s-1m).  Then click "update stats" and the statistic should have updated.

This process will cause the contract to mint the number of tokens that you are entitled to and then transfer them to your wallet.


### Admin tools

* Log into the owner account in Metamask (make sure you're on Ropsten network)

* You should see this additional section on the page:

![alt text](https://github.com/atchai/goodcoin/raw/master/docs/admin-tools.png "screenshot")

* Here you can see at a glance the GTC token balances of each of the test accounts and you can also set the minting co-efficient - the number of tokens that users will be entitled to each second since their last claim.


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
