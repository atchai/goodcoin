import $ from 'jquery';
var Web3 = require('web3')

let contract_address = undefined
let network_id = undefined

// production
if (window.location.hostname == 'goodcoin.atchai.com') {
  contract_address = '';  //ropsten
  network_id = 3 // ropsten - ethereum network ID
}
// dev
else {
  contract_address = '0x345ca3e014aaf5dca488057592ee47305d9b3e10';  //dev
  network_id = 5777 // ganache - ethereum network ID
}

const abi = require('./abi.js');
const price = web3.toWei(0.1, 'ether');

// Check for Metamask and show/hide appropriate warnings.
window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if ((typeof web3 !== 'undefined') && (web3.givenProvider !== null)) {
    var web3js = new Web3(web3.currentProvider);

    // Checking if user is logged into an account
    web3js.eth.getAccounts(function(err, accounts){
        if (err != null) console.error("An error occurred: "+err);

        // User is not logged into Metamask
        else if (accounts.length == 0) {
          $('#metamask-login').show();
          console.log("User is not logged in to MetaMask");
        }

        // User is logged in to Metamask
        else {
          web3js.version.getNetwork((err, net_id) => {
            console.log(net_id);
            if (err != null) console.error("An error occurred: "+err);

            // User is on the correct network
            // Ropsten test network = 3, main net = 1
            else if (net_id == network_id) {
              console.log("User is logged in and on correct network");
              $('#main-content').show();
              startApp(web3js);
            }

            // User is not on the right network
            else {
              console.log("User is logged in and on WRONG network");
              $('#metamask-network').show();
            }
        })
      }
  });

  // User does not have Metamask / web3 provider
  } else {
    console.log('No web3? You should consider trying MetaMask!');
    $('#metamask-install').show();
  }
})



// // TODO:
// Ensure web3js.eth.accounts reflects the logged in metamask account
// Upgrade to web3 beta v1

function startApp(web3js) {
  var contract = web3js.eth.contract(abi).at(contract_address);

  //console.log('contract = ')
  console.log(web3js)
  console.log(contract)

  web3.eth.getTransactionReceiptMined = function getTransactionReceiptMined(txHash, interval) {
      const self = this;
      const transactionReceiptAsync = function(resolve, reject) {
          self.getTransactionReceipt(txHash, (error, receipt) => {
              if (error) {
                  reject(error);
              } else if (receipt == null) {
                  setTimeout(
                      () => transactionReceiptAsync(resolve, reject),
                      interval ? interval : 500);
              } else {
                  resolve(receipt);
              }
          });
      };

      if (Array.isArray(txHash)) {
          return Promise.all(txHash.map(
              oneTxHash => self.getTransactionReceiptMined(oneTxHash, interval)));
      } else if (typeof txHash === "string") {
          return new Promise(transactionReceiptAsync);
      } else {
          throw new Error("Invalid Type: " + txHash);
      }
  };

  let updateBalance = function() {
    contract.balanceOf(web3js.eth.accounts[0],
      function (err, res) {
        if (err) {
          return console.error(err);;
        }
        else {
          console.log('in updatebalance = ' + res.c[0])
          $('#token_count').text(res.c[0]);
        }
    });
  }

  let updateEntitlement = function() {
    contract.checkEntitlement(web3js.eth.accounts[0],
      function (err, res) {
        if (err) {
          return console.error(err);;
        }
        else {
          console.log(res)
          $('#token_entitlement').text(res.c[0]);
        }
    });
  }

  $('.balance').on('click', function () {
    updateBalance();
  });

  $('.claim').on('click', function () {
    contract.withdrawTokens({
      'from':web3js.eth.accounts[0]
    },
    function (err, transactionHash) {
        console.log(err, transactionHash);
        return web3.eth.getTransactionReceiptMined(transactionHash, 5000).then(function (receipt) {
          // wait 3 seconds to update balance as it will not have updated if we call immediately
          setTimeout(function(){ updateBalance(); }, 3000);
        });
    });
  });

  updateBalance();
  updateEntitlement();
}
