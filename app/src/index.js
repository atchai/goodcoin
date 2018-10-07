// Expects web3 to be v.0.2
import 'babel-polyfill'; // required *exactly here* to avoid this error: "ReferenceError: regeneratorRuntime is not defined" // see: https://github.com/babel/babel/issues/5085
import $ from 'jquery';


import Actions from './Utils/Actions'
import EventSubscriber from './Utils/EventSubscriber'
import Logger from './Utils/Logger'

const abi = require('./abi.js');
const gcmAbi = require('./gcm_abi.js');
const redemptionAbi = require('./redemption_abi.js');



let actions = new Actions();
let accountsAndContracts = actions.accountsAndContracts; // TEMP
window.addEventListener('load', actions.onload(startApp))


function startApp(web3js) {

  // Contracts initialization
  var contract = new web3js.eth.Contract(abi, accountsAndContracts.goodDollar_contract_address);
  var redemptionFunctional = new web3js.eth.Contract(redemptionAbi, accountsAndContracts.redemption_functional_address);
  var goodCoinMarket = new web3js.eth.Contract(gcmAbi, accountsAndContracts.goodCoinMarketAddress);

  // Utils initialization
  var goodCoinUtils = undefined;
  var eventSubscriber = new EventSubscriber(web3js, goodCoinMarket, contract);
  var logger = new Logger();
 

  web3js.eth.getTransactionReceiptMined = function getTransactionReceiptMined(txHash, interval) {
    const self = this;
    const transactionReceiptAsync = function (resolve, reject) {
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


  let updateAllBalances = async function () {
    let balances = [];
    const promises = accountsAndContracts.test_accounts.map(()=>actions.getBalance) // must be called like this to avoid sending 'this' as undefined.
    await Promise.all(promises).then(function (balances) {
      let html = ''
      for (let i = 0; i < accountsAndContracts.test_accounts.length; ++i) {
        html += "<tr>"
        html += "<td>" + accountsAndContracts.test_accounts[i] + "</td>";
        html += "<td>" + balances[i] + "</td>";
        html += "</tr>"
      }
      $('#account-balances tr:last').after(html)
    })
  }

  let updateMyBalance =  function () {
    actions.getBalance(accountsAndContracts.ehteriumAccounts[0])
    .then(function (balance) {
      $('#token_count').text(parseFloat(balance).toPrecision(3));
    });
  };

  let updateMyEthBalance = function () {
    actions.getEthBalance(accountsAndContracts.ehteriumAccounts[0]).then(function (balance) {
      $('#eth_token_count').text(parseFloat(balance).toPrecision(3));
    });
  }

  // Calculate locally based on the last_claimed time.
  // Calling the checkEntitlement function returns inconsistent values.
  let updateMyEntitlement = function () {
    redemptionFunctional.methods.getLastClaimed().call(
      { 'from': accountsAndContracts.ehteriumAccounts[0] },
      function (err, res) {
        if (err) {
          return console.error(err);;
        } else {
          let last_claimed = res;
          console.log(`last_claimed: ${last_claimed}`);

          let now = Math.floor(Date.now() / 1000);
          // if this is user's first claim
          if (now < last_claimed + 86400) {
            console.log("Claimed too recently")
            $('#token_entitlement').text(0);
          } else {
            redemptionFunctional.methods.checkEntitlement().call(
              { 'from': accountsAndContracts.ehteriumAccounts[0] },
              function (err, entitlement) {
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

  let showHideWhitelist = function () {
    $('.whitelisted-only').hide()
    redemptionFunctional.methods.checkWhiteListStatus().call({
      'from': accountsAndContracts.ehteriumAccounts[0]
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

  let checkPriceBuy = function () {
    let amount = $('.buy-amount').val();
    actions.checkPriceBuy(amount).then(
      function(price){
        console.log(`tokens: ${price}`);
        $('#buy_price').text(parseFloat(price).toPrecision(4));
      }
    );
  }

  let checkPriceSell = function () {
    let amount = $('.sell-amount').val();
    actions.checkPriceSell(amount).then(
      function(price){
        console.log(`tokens: ${price}`);
        $('#sell_price').text(parseFloat(price).toPrecision(4));
      }
    );
  }

  let sell = function () {
    checkPriceSell();
    let amount = $('.sell-amount').val();
    actions.sell(amount).then(
      function(result){
        console.log("Transaction to: " + accountsAndContracts.ehteriumAccounts[0] + " succeeded. Tx#: " + result);
        updateMyBalance();
        updateMyEthBalance();
      },
      function(err){
        console.error(err);
      }
    )
  }


  let buy = function () {
    checkPriceBuy();
    let amount = $('.buy-amount').val();
    actions.buy(amount).then(
      function(result){
        console.log("Transaction to: " + accountsAndContracts.ehteriumAccounts[0] + " succeeded. Tx#: " + result);
        updateMyBalance();
        updateMyEthBalance();
      },
      function(err){
        console.error(err);
      }
    )
  }

  $('.update').on('click', function () {
    updateMyBalance();
    updateMyEthBalance();
    updateMyEntitlement();
  });

  $('.claim').on('click', function () {
    redemptionFunctional.methods.claimTokens().call({
      'from': accountsAndContracts.ehteriumAccounts[0]
    },
      function (err, transactionHash) {
        console.log(err, transactionHash);
        return web3js.eth.getTransactionReceiptMined(transactionHash, 5000).then(function (receipt) {
          // wait 3 seconds to update balance as it will not have updated if we call immediately
          setTimeout(function () {
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
        { 'from': accountsAndContracts.ehteriumAccounts[0] },
        function (err, transactionHash) {
          console.log(err, transactionHash);
        }
      );
  });


  $('.check-price-buy').on('click', checkPriceBuy);

  $('.check-price-sell').on('click', checkPriceSell);

  $('.buy').on('click', buy);

  $('.sell').on('click', sell);

  
  eventSubscriber.subscribeLogEvent(contract, "Mint");
  eventSubscriber.subscribeLogEvent(contract, "MintFinished");
  //eventSubscriber.subscribe(contract, "Burn");
  eventSubscriber.subscribeLogEvent(contract, "Mint");

  updateMyBalance();
  updateMyEthBalance();
  updateMyEntitlement();
  updateAllBalances();
  showHideWhitelist();
  $('#eth_address').text(accountsAndContracts.ehteriumAccounts[0]);
}
