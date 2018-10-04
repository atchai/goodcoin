// Expects web3 to be v.0.2
import 'babel-polyfill'; // required *exactly here* to avoid this error: "ReferenceError: regeneratorRuntime is not defined" // see: https://github.com/babel/babel/issues/5085
import $ from 'jquery';
var Web3 = require('web3')
var Actions = require('./Actions')
var EventSubscriber = require('./EventSubscriber')

let goodDollar_contract_address = undefined
let network_id = undefined
let owner_account = undefined
let test_accounts = undefined
let redemption_functional_address = undefined
let goodCoinMarketAddress = undefined
let urlParams = new URLSearchParams(window.location.search);
let goodCoinMarketAddressFile = require('../../build/contracts/GoodCoinMarket.json');
let goodCoinAddressFile = require('../../build/contracts/GoodCoin.json');
let redemptionFunctionalAddressFile = require('../../build/contracts/RedemptionFunctional.json');
let ehteriumAccounts = undefined;

// dev production
if (window.location.hostname == 'goodcoin.atchai.com' || urlParams.has('prod')) {
  console.log('production')
  goodDollar_contract_address = '0x495bf815fd7b065d8ab491ff4cc18b9bb472e04a';  //ropsten
  redemption_functional_address = '0xef672c34abc762590f18e6f9fb26739acf0f9da5';
  goodCoinMarketAddress = '0x27cc97cc4a32d6dd6c62864c0956a3d2f1144d53';
  network_id = 3 // ropsten - ethereum network ID
  owner_account = '0x86970E4fF9E26Dd88697D9044297b1dF4aE85413';
  test_accounts = [ '0x9107a6b3a1cD26cb5c4ECaa661853b8C0d6fBc31',
                    '0xdC8d9b9f7beF52269b1eC83cEdEb279c47cC6AaA',
                    '0x3250275F4E09beCCB0811C4EA35f7bFfd402eb25',
                    '0x97B9B511f22a8000a918643ab9CaBd23E80209E2',
                    '0x5369bBCa32a7d1a9a5846beFBDcDf497b555c478'];

}
// dev
else {
  console.log('dev');
  
  network_id = 6000 // ganache - ethereum network ID
  redemption_functional_address = redemptionFunctionalAddressFile.networks[network_id].address; // 'truffle migrate'changes the address everytime
  goodDollar_contract_address = goodCoinAddressFile.networks[network_id].address; // 'truffle migrate'changes the address everytime
  goodCoinMarketAddress = goodCoinMarketAddressFile.networks[network_id].address; // 'truffle migrate'changes the address everytime
  
  /*owner_account = '0x22e614563e6779e8848d00d8c211f044734fa5aa';
  test_accounts = [ '0xb3D1d7D38971245724cEb71e65BE54BC44083a3a',
                    '0xf4444B538b14bcA7962dBFF264F92e4dCc3a005A',
                    '0xc5656A71C0B909D3BaB72906dCE3817b34c90748',
                    '0xE3330d9b3fd657c9590BbDCceBC2dC023e651b1F',
                    '0x19532cE3e0dCc9e4360d27f696b5b72E84bc6937'];*/

                    
}

owner_account = '0x9b36dEa68d42668Bed85c91b990BD306a18310C6';
  test_accounts = [ '0x497726e13713f468D7fE7b5127EAD4baB81d2807',
                    '0x3f266ACE11E6bA86095d1b50484aA49eb98dF52F',
                    '0x883A201c9d5f15026572Ca823a93c07d6dCD39aD',
                    '0xA2bEdfc13889Da52D2e632F4036C74aCDbFF5a7f',
                    '0x09DA63c14BC36eBeb0834CabcA0676353A08b5EB'];



const abi = require('./abi.js');
const gcmAbi = require('./gcm_abi.js');
const redemptionAbi = require('./redemption_abi.js');

// Check for Metamask and show/hide appropriate warnings.
window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  
  if ((typeof web3 !== 'undefined') && (web3.givenProvider !== null)) {
    
    var web3js = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8545"));
        
    // Checking if user is logged into an account
    web3js.eth.getAccounts(function(err, accounts){
        if (err != null) console.error("An error occurred: " + err);

        // User is not logged into Metamask
        else if (accounts.length == 0) {
          $('#metamask-login').show();
          console.log("User is not logged in to MetaMask");
        }

        // User is logged in to Metamask
        else {
          ehteriumAccounts = accounts;

          web3js.eth.net.getId((err, net_id) => {
            console.log(net_id);
            if (err != null) console.error("An error occurred: "+err);

            // User is on the correct network
            // Ropsten test network = 3, main net = 1
            else if (net_id == network_id) {
              console.log("User is logged in and on correct network");
              $('#main-content').show();

              // show admin content if we are the contract owner
              if (accounts[0].toLowerCase() == owner_account.toLowerCase()) {
                $('#admin-content').show();
              }
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


 function startApp(web3js) { 
  var contract = new web3js.eth.Contract(abi,goodDollar_contract_address);
  var redemptionFunctional = new web3js.eth.Contract(redemptionAbi,redemption_functional_address);
  var goodCoinMarket = new web3js.eth.Contract(gcmAbi,goodCoinMarketAddress);
  var actions = undefined;
  var eventSubscriber = new EventSubscriber(web3js,goodCoinMarket,contract);
  
  let initializeActions = async function(){
    
    let tokenDecimals =  await contract.methods.decimals().call();
     var actions = new Actions(web3js,goodCoinMarket,tokenDecimals);
     return actions;
  }
  web3js.eth.getTransactionReceiptMined = function getTransactionReceiptMined(txHash, interval) {
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

  let getBalance = function(account) {
    return new Promise(function(resolve, reject) {
      contract.methods.balanceOf(account).call(
        {'from':account},
        function (err, res) {
          if (err) {
            console.error(err);
            reject(err);
          }
          else {
            resolve(actions.fromGDUnits(res,'0'));
          }
      });
    }).catch(console.log)
  }

    let getEthBalance = function(account) {
      return new Promise(function(resolve, reject) {
        web3js.eth.getBalance(account).then(
          
          function (res) {
              resolve(web3js.utils.fromWei(res, 'ether'));
            
        });
      }).catch(console.log)
    }

    
  

  let updateAllBalances = async function() {
    let balances = [];
    const promises = test_accounts.map(getBalance)
    await Promise.all(promises).then(function(balances) {
      let html = ''
      for (let i=0; i < test_accounts.length; ++i ) {
        html += "<tr>"
        html += "<td>"+test_accounts[i]+"</td>";
        html += "<td>"+balances[i]+"</td>";
        html += "</tr>"
      }
      $('#account-balances tr:last').after(html)
    })
  }

  let updateMyBalance = function() {
    getBalance(ehteriumAccounts[0]).then(function(balance) {
      console.log('in updateMyBalance = ' + balance)
      $('#token_count').text(parseFloat(balance).toPrecision(3));
    });
  }

  let updateMyEthBalance = function() {
    getEthBalance(ehteriumAccounts[0]).then(function(balance) {
      console.log('in updateMyBalance = ' + balance)
      $('#eth_token_count').text(parseFloat(balance).toPrecision(3));
    });
  }

  // Calculate locally based on the last_claimed time.
  // Calling the checkEntitlement function returns inconsistent values.
  let updateMyEntitlement = function() {
    redemptionFunctional.methods.getLastClaimed().call(
      {'from':ehteriumAccounts[0]},
      function(err, res) {
        if (err) {
          return console.error(err);;
        } else {
          let last_claimed = res;
          console.log(`last_claimed: ${last_claimed}`);

          let now = Math.floor(Date.now() / 1000);
          // if this is user's first claim
          if (now < last_claimed + 86400 ) {
            console.log("Claimed too recently")
            $('#token_entitlement').text(0);
          } else {
            redemptionFunctional.methods.checkEntitlement().call(
              {'from':ehteriumAccounts[0]},
              function(err, entitlement) {
                entitlement = web3js.utils.fromWei(entitlement, 'ether');
                console.log(`entitlement = ${entitlement}`);
                $('#token_entitlement').text(parseFloat(entitlement).toPrecision(7));
              }
            )
          }
        }
      }
    );
  }

  let showHideWhitelist = function() {
    $('.whitelisted-only').hide()
    redemptionFunctional.methods.checkWhiteListStatus().call({
      'from':ehteriumAccounts[0]
      },
      function (err, res) {
        if (err) {
          return console.error(err);;
        }
        else {
          if (res) {
            $('.whitelisted-only').show()
            $('.not-whitelisted').hide()
          }

        }
    });
  }

  $('.update').on('click', function () {
    updateMyBalance();
    updateMyEthBalance();
    updateMyEntitlement();
  });

  $('.claim').on('click', function () {
    redemptionFunctional.methods.claimTokens().call({
      'from':ehteriumAccounts[0]
    },
    function (err, transactionHash) {
        console.log(err, transactionHash);
        return web3js.eth.getTransactionReceiptMined(transactionHash, 5000).then(function (receipt) {
          // wait 3 seconds to update balance as it will not have updated if we call immediately
          setTimeout(function(){
            updateMyBalance();
            updateMyEthBalance();
            updateMyEntitlement();
          }, 5000);
        });
    });
  });

  $('.whitelist').on('click', function () {
    let account = $('.wl-account').val();
    console.log(account);
    redemptionFunctional.methods.whiteListUser(
      account).call(
      {'from':ehteriumAccounts[0]},
      function (err, transactionHash) {
        console.log(err, transactionHash);
      }
    );
  });

  $('.check-price-buy').on('click', function() {
    let amount = $('.buy-amount').val();
    amount = web3js.utils.toWei(amount, "ether");
    console.log(`amount: ${amount}`);
    goodCoinMarket.methods.calculateAmountPurchased(
        amount).call(
          {'from':ehteriumAccounts[0]},
        function(err, tokens){
          //tokens = web3js.utils.fromWei(tokens, 'ether')*(10**14);
          tokens = actions.fromGDUnits(tokens,'0');
          console.log(`tokens: ${tokens}`);
          $('#buy_price').text(parseFloat(tokens).toPrecision(4));
        }
      );
  });

  $('.check-price-sell').on('click', function() {
    let amount = $('.sell-amount').val();
    amount = actions.toGDUnits(amount, '0');

    goodCoinMarket.methods.calculatePriceForSale(
      amount).call({'from':ehteriumAccounts[0]},
      function(err, tokens){
        tokens = web3js.utils.fromWei(tokens, "ether");
        console.log(`tokens: ${tokens}`);
        $('#sell_price').text(parseFloat(tokens).toPrecision(7));
      }
    );
  });

  $('.buy').on('click', function() {
    let amount = $('.buy-amount').val();
    amount = web3js.utils.toWei(amount, "ether");
 
    goodCoinMarket.methods.buy().send(
      {
        'from':ehteriumAccounts[0],
        'value': amount
      },
      function(err, isTxSuccess){
        if (err) {
          return console.error(err);;
        }
        else {
          console.log("Transaction to"+ehteriumAccounts[0]+" succeeded?"+isTxSuccess);
          updateMyBalance();
          updateMyEthBalance();
          }
        
      }
    );});


  $('.sell').on('click', function() {
    let amount = $('.sell-amount').val();
    amount = actions.toGDUnits(amount, '0');
    goodCoinMarket.methods.sell(
      amount).send(
      {'from':ehteriumAccounts[0]},
      function(err, isTxSuccess){
        if (err) {
          return console.error(err);;
        }
        else {
          console.log("Transaction to"+ehteriumAccounts[0]+" succeeded?"+isTxSuccess);
          updateMyBalance();
          updateMyEthBalance();

          }
        
      }
    );
  });

  let promiseActions = initializeActions();
  promiseActions.then(function(result){
    actions = result;
  });


  eventSubscriber.subscribe(contract, "Mint");
  eventSubscriber.subscribe(contract, "MintFinished");
  //eventSubscriber.subscribe(contract, "Burn");
  eventSubscriber.subscribe(contract, "Mint");
  
  updateMyBalance();
  updateMyEthBalance();
  updateMyEntitlement();
  updateAllBalances();
  showHideWhitelist();
  $('#eth_address').text(ehteriumAccounts[0]);
}
