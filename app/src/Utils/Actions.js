import Web3 from 'web3'
import GoodDollarUtils from './GoodDollarUtils'
import AccountsAndContracts from '../Model/AccountsAndContracts'

class Actions {

  constructor() {
    const abi = require('../abi.js');
    const gcmAbi = require('../gcm_abi.js');
    const redemptionAbi = require('../redemption_abi.js');

    this.accountsAndContracts = new AccountsAndContracts();
    this.accountsAndContracts.initialize();


    this.web3js = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8545")); // TODO: modify to read from prop file.
    this.contract = new this.web3js.eth.Contract(abi, this.accountsAndContracts.goodDollar_contract_address);
    this.goodCoinMarket = new this.web3js.eth.Contract(gcmAbi, this.accountsAndContracts.goodCoinMarketAddress);

    let initializeGoodCoinUtil = async function (contract) {

      let tokenDecimals = await contract.methods.decimals().call();
      return tokenDecimals;
    }

    let bindedDecimalsCallBack = function (err, res) {
      this.tokenDecimals = res;
      this.GoodDollarUtils = new GoodDollarUtils(this.web3js, this.goodCoinMarket, this.tokenDecimals);
    };

    this.contract.methods.decimals().call({}, bindedDecimalsCallBack.bind(this));

    this.getBalance = this.getBalance.bind(this);
    this.getEthBalance = this.getEthBalance.bind(this);
	this.checkPriceBuy = this.checkPriceBuy.bind(this);
	this.checkPriceSell = this.checkPriceSell.bind(this);
	this.sell = this.sell.bind(this);
	this.buy = this.buy.bind(this);

  }

  buy(amount) {
	amount = this.web3js.utils.toWei(amount, "ether");
	console.log(`Buy amount in Wei: ${amount}`);
	let goodCoinMarket = this.goodCoinMarket;
	let GoodDollarUtils = this.GoodDollarUtils;
	let accountsAndContracts = this.accountsAndContracts;
	let web3js = this.web3js;
 
	return new Promise (function (resolve, reject) {
	   goodCoinMarket.methods.buy().send(
		 { 'from': accountsAndContracts.ehteriumAccounts[0],
		 'value': amount },
		 function (err,res) {
		   if (err) {
			 console.error(err);
			 reject(err);
		 } 
		 else {
		   resolve(res);
		 }
	   });
  });
 } 
 
  sell(amount) {
	amount = this.GoodDollarUtils.toGDUnits(amount, '0');
	console.log(`Sell amount in Wei: ${amount}`);
	let goodCoinMarket = this.goodCoinMarket;
	let GoodDollarUtils = this.GoodDollarUtils;
	let accountsAndContracts = this.accountsAndContracts;
	let web3js = this.web3js;
 
	return new Promise (function (resolve, reject) {
	   goodCoinMarket.methods.sell(amount).send(
		 { 'from': accountsAndContracts.ehteriumAccounts[0] },
		 function (err,res) {
		   if (err) {
			 console.error(err);
			 reject(err);
		 } 
		 else {
		   resolve(res);
		 }
	   });
  });
 }

  checkPriceSell(amount) {
   amount = this.GoodDollarUtils.toGDUnits(amount, '0');
   console.log(`checkPriceSell amount in Wei: ${amount}`);
   let goodCoinMarket = this.goodCoinMarket;
   let GoodDollarUtils = this.GoodDollarUtils;
   let accountsAndContracts = this.accountsAndContracts;
   let web3js = this.web3js;

   return new Promise (function (resolve, reject) {
      goodCoinMarket.methods.calculatePriceForSale(amount).call(
        { 'from': accountsAndContracts.ehteriumAccounts[0] },
        function (err,res) {
          if (err) {
            console.error(err);
            reject(err);
        } 
        else {
          let result = web3js.utils.fromWei(res, "ether");
          resolve(result);
        }
      });
 });
}

  checkPriceBuy(amount) {
    amount = this.web3js.utils.toWei(amount, "ether");
   console.log(`checkPriceBuy amount in Wei: ${amount}`);
   let goodCoinMarket = this.goodCoinMarket;
   let GoodDollarUtils = this.GoodDollarUtils;
   let accountsAndContracts = this.accountsAndContracts;

   return new Promise (function (resolve, reject) {
      goodCoinMarket.methods.calculateAmountPurchased(amount).call(
        { 'from': accountsAndContracts.ehteriumAccounts[0] },
        function (err,res) {
          if (err) {
            console.error(err);
            reject(err);
        } 
        else {
          let result = GoodDollarUtils.fromGDUnits(res, '0');
          resolve(result);
        }
      });
 });
}

  getEthBalance(account) {
    let web3js = this.web3js;
    return new Promise(function (resolve, reject) {
      web3js.eth.getBalance(account).then(

        function (res) {
          resolve(web3js.utils.fromWei(res, 'ether'));

        });
    }).catch(console.log)
  }

  getBalance(account) {
    let contract = this.contract;
    let GoodDollarUtils = this.GoodDollarUtils;
    

    return new Promise(function (resolve, reject) {
      contract.methods.balanceOf(account).call(
        { 'from': account },
        function (err, res) {
          if (err) {
            console.error(err);
            reject(err);
          }
          else {
            let result = GoodDollarUtils.fromGDUnits(res, '0');
            resolve(result);
          }
        });
    }).catch(console.log)
  }

  onload(startApp) {
    // Check for Metamask and show/hide appropriate warnings.
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)

    let accountsAndContracts = this.accountsAndContracts; // to use in the promise. "this.accountsAndContracts" in the promise will *not* refer to Actions.this.accountsAndContracts.
    let web3js = this.web3js;

    if ((typeof web3 !== 'undefined') && (web3.givenProvider !== null)) {

      // Checking if user is logged into an account
      web3js.eth.getAccounts(function (err, accounts) {
        if (err != null) console.error("An error occurred: " + err);

        // User is not logged into Metamask
        else if (accounts.length == 0) {
          $('#metamask-login').show();
          console.log("User is not logged in to MetaMask");
        }

        // User is logged in to Metamask
        else {
          accountsAndContracts.ehteriumAccounts = accounts;

          web3js.eth.net.getId((err, net_id) => {
            console.log(net_id);
            if (err != null) console.error("An error occurred: " + err);

            // User is on the correct network
            // Ropsten test network = 3, main net = 1
            else if (net_id == accountsAndContracts.network_id) {
              console.log("User is logged in and on correct network");
              $('#main-content').show();

              // show admin content if we are the contract owner
              if (accounts[0].toLowerCase() == accountsAndContracts.owner_account.toLowerCase()) {
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


  }
}

module.exports = Actions;
