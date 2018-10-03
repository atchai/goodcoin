require("babel-register")({
  ignore: /node_modules\/(?!zeppelin-solidity)/
});
require("babel-polyfill");

if (process.env.NODE_ENV !== 'production') { // https://codeburst.io/process-env-what-it-is-and-why-when-how-to-use-it-effectively-505d0b2831e7
  require('dotenv').load();
}
const HDWalletProvider = require("truffle-hdwallet-provider");

const mnemonic = process.env.MNEMONIC
const infura_api = process.env.INFURA_API
const network_id = process.env.NETWORK_ID

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!

  networks: {
    'truffle_develop': {
      host: "127.0.0.1",
      port: 9545, // "truffle develop" runs on 9454
      network_id: "4447", // Match any network id
      from: '0x9b36dEa68d42668Bed85c91b990BD306a18310C6' // should be equal to first address in ganache UI list - address[0]

    },

    'ganache_develop': {
      host: "127.0.0.1",
      port: 8545, // my "ganache " runs on 8545 - configurable
      network_id: "6000", // my "ganache " runs with 6000 network_id - configurable
      from: '0x9b36dEa68d42668Bed85c91b990BD306a18310C6' // should be equal to first address in ganache UI list - address[0]

    },

    test: {
      host: "127.0.0.1",
      port: 8545, // my "ganache " runs on 8545 - configurable
      network_id: "6000", // my "ganache " runs with 6000 network_id - configurable
      from: '0x9b36dEa68d42668Bed85c91b990BD306a18310C6' // should be equal to first address in ganache UI list - address[0]
    },
   
    ropstengeth: {
     host: "127.0.0.1",
     port: 8545,
     network_id: "3"
    },
    ropsteninfura: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + infura_api)
      },
      network_id: network_id,
      gas:2071238
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }

};
