# Goodcoin

Goodcoin is a prototype UBI system built on the Ethereum blockchain.

This repo contains the code for the v0.1 proof of concept.  This POC provides the following functionality:

* ERC-20 token - GTC (GoodCoin Test Coin)
* Mint and transfer 1200 tokens to the contract owner
* Anyone can mint and claim tokens subject to time-based rules:
  * First time user - can claim 10 Tokens
  * Non-first time user - can claim 1 token per second since the last claim
* Dapp that enables users to interact with the contract from their browser + MetaMask
* Dapp for admins to view account balances of pre-created test accounts and set the token minting multiplier - how many tokens can be minted per second for each user.

## Usage
This section will refer to the test deployment that has been set up on Ropsten testnet.

You have been provided with the details of 1 owner and 5 test user accounts.

As a user
* 5 test accounts - private keys provided through a separate channel


### Claim Tokens
You will have to wait for your transaction to be mined.  Then click "update stats"
As an admin


URL


## Development

ganache

npm start
