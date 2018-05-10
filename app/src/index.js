// Expects web3 to be v.0.2

import $ from 'jquery';
var Web3 = require('web3')

let contract_address = undefined
let network_id = undefined
let owner_account = undefined
let test_accounts = undefined

// production
if (window.location.hostname == 'goodcoin.atchai.com') {
  contract_address = '';  //ropsten
  network_id = 3 // ropsten - ethereum network ID
}
// dev
else {
  contract_address = '0x345ca3e014aaf5dca488057592ee47305d9b3e10';  //dev
  network_id = 5777 // ganache - ethereum network ID
  owner_account = '0x345ca3e014aaf5dca488057592ee47305d9b3e10';
  test_accounts = [ '0x345ca3e014aaf5dca488057592ee47305d9b3e10',
                    '0x345ca3e014aaf5dca488057592ee47305d9b3e10',
                    '0x345ca3e014aaf5dca488057592ee47305d9b3e10',
                    '0x345ca3e014aaf5dca488057592ee47305d9b3e10',
                    '0x345ca3e014aaf5dca488057592ee47305d9b3e10'];
}

const abi = require('./abi.js');



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

function startApp(web3js) {
  var contract = web3js.eth.contract(abi).at(contract_address);

  //console.log('contract = ')
  //console.log(web3js)
  //console.log(contract)


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

  let getBalance = function(account, callback) {
    contract.balanceOf(account,
      function (err, res) {
        if (err) {
          return console.error(err);;
        }
        else {
          callback(res.c[0]);
        }
    });
  }


  let getMintingCoefficient = function(callback) {
    contract.MINTING_COEFFICIENT({
      'from':web3js.eth.accounts[0]
      },
      function (err, res) {
        if (err) {
          return console.error(err);;
        }
        else {
          callback(res.c[0])
        }
    });
  }

  let updateAllBalances = function() {
    let balances = [];
    for(let i=0; i < test_accounts.length; ++i ) {
      getBalance(test_accounts[i], function(balance) {
        balances[i] = balance;

        if (i == test_accounts.length-1) {
          let html = ''
          for (let i=0; i < test_accounts.length; ++i ) {
            html += "<tr>"
            html += "<td>"+test_accounts[i]+"</td>";
            html += "<td>"+balances[i]+"</td>";
            html += "</tr>"
          }
          $('#account-balances tr:last').after(html)
        }
      })
    }
  }

  let updateMyBalance = function() {
    getBalance(web3js.eth.accounts[0], function(balance) {
      console.log('in updateMyBalance = ' + balance)
      $('#token_count').text(balance);
    })
  }

  // Calculate locally based on the last_claimed time.
  // Calling the checkEntitlement function returns inconsistent values.
  let updateMyEntitlement = function() {
    contract.last_claimed.call(web3js.eth.accounts[0],
      function (err, res) {
        if (err) {
          return console.error(err);;
        }
        else {
          let last_claimed = res.c[0];
          console.log('in updateMyEntitlement, last claimed = ' + last_claimed);

          // if this is user's first claim
          if (last_claimed == 0 ) {
            console.log('no previous claims')
            $('#token_entitlement').text(10);
          }
          else {
            getMintingCoefficient(function (coefficient) {
              let entitlement = Math.round(coefficient * ((Date.now() / 1000) - last_claimed));
              console.log("res =" )
              console.log(res)
              console.log('Date.now() / 1000 =' + (Date.now() / 1000))

              console.log('minting_coefficient =' + coefficient)
              console.log('entitlement =' + entitlement)
              $('#token_entitlement').text(entitlement);
            })
          }
        }
    });
  }

  let updateMintingCoefficient = function() {
    getMintingCoefficient(function (coefficient) {
        $('.coefficient').attr("placeholder", coefficient);
    })
  }

  $('.set').on('click', function () {
    let coefficient = parseInt($('.coefficient').val());

    if (!Number.isInteger(coefficient)) {
      console.error('Minting coefficient is not a number')
      return
    }
    else {
      console.log("setting minting coefficient to " + coefficient)
      contract.setMintingCoefficient(coefficient, {
        'from':web3js.eth.accounts[0]
        },
        function (err, transactionHash) {
          console.log(err, transactionHash);
          return web3.eth.getTransactionReceiptMined(transactionHash, 5000).then(function (receipt) {
            console.log('minting coefficient set')
          });
      });
    }
  });

  $('.update').on('click', function () {
    updateMyBalance();
    updateMyEntitlement();
  });

  $('.claim').on('click', function () {
    contract.withdrawTokens({
      'from':web3js.eth.accounts[0]
    },
    function (err, transactionHash) {
        console.log(err, transactionHash);
        return web3.eth.getTransactionReceiptMined(transactionHash, 5000).then(function (receipt) {
          // wait 3 seconds to update balance as it will not have updated if we call immediately
          setTimeout(function(){
            updateMyBalance();
            updateMyEntitlement();
          }, 5000);
        });
    });
  });

  updateMyBalance();
  updateMyEntitlement();
  updateMintingCoefficient();
  updateAllBalances();
  $('#eth_address').text(web3js.eth.accounts[0]);
}
