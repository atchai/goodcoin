var goodCoinMarketAddressFile = require('../../../build/contracts/GoodCoinMarket.json');
var goodCoinAddressFile = require('../../../build/contracts/GoodCoin.json');
var redemptionFunctionalAddressFile = require('../../../build/contracts/RedemptionFunctional.json');

class AccountsAndContracts {



    constructor() {
        this.ehteriumAccounts = undefined;
        this.goodDollar_contract_address = undefined
        this.network_id = undefined
        this.owner_account = undefined
        this.test_accounts = undefined
        this.redemption_functional_address = undefined
        this.goodCoinMarketAddress = undefined
    }


    initialize(){
        // dev production
        let urlParams = new URLSearchParams(window.location.search);
        if (window.location.hostname == 'goodcoin.atchai.com' || urlParams.has('prod')) {
            console.log('production')
            this.goodDollar_contract_address = '0x495bf815fd7b065d8ab491ff4cc18b9bb472e04a';  //ropsten
            this.redemption_functional_address = '0xef672c34abc762590f18e6f9fb26739acf0f9da5';
            this.goodCoinMarketAddress = '0x27cc97cc4a32d6dd6c62864c0956a3d2f1144d53';
            this.network_id = 3 // ropsten - ethereum network ID
            this.owner_account = '0x86970E4fF9E26Dd88697D9044297b1dF4aE85413';
            this.test_accounts = [ '0x9107a6b3a1cD26cb5c4ECaa661853b8C0d6fBc31',
                              '0xdC8d9b9f7beF52269b1eC83cEdEb279c47cC6AaA',
                              '0x3250275F4E09beCCB0811C4EA35f7bFfd402eb25',
                              '0x97B9B511f22a8000a918643ab9CaBd23E80209E2',
                              '0x5369bBCa32a7d1a9a5846beFBDcDf497b555c478'];
          
          }
          // dev
          else {
            console.log('dev');
            
            this.network_id = 6000 // ganache - ethereum network ID
            this.redemption_functional_address = redemptionFunctionalAddressFile.networks[this.network_id].address; // 'truffle migrate'changes the address everytime
            this.goodDollar_contract_address = goodCoinAddressFile.networks[this.network_id].address; // 'truffle migrate'changes the address everytime
            this.goodCoinMarketAddress = goodCoinMarketAddressFile.networks[this.network_id].address; // 'truffle migrate'changes the address everytime
            
            /*this.owner_account = '0x22e614563e6779e8848d00d8c211f044734fa5aa';
            this.test_accounts = [ '0xb3D1d7D38971245724cEb71e65BE54BC44083a3a',
                              '0xf4444B538b14bcA7962dBFF264F92e4dCc3a005A',
                              '0xc5656A71C0B909D3BaB72906dCE3817b34c90748',
                              '0xE3330d9b3fd657c9590BbDCceBC2dC023e651b1F',
                              '0x19532cE3e0dCc9e4360d27f696b5b72E84bc6937'];*/
          
            this.owner_account = '0x9b36dEa68d42668Bed85c91b990BD306a18310C6';
            this.test_accounts = [ '0x497726e13713f468D7fE7b5127EAD4baB81d2807',
                              '0x3f266ACE11E6bA86095d1b50484aA49eb98dF52F',
                              '0x883A201c9d5f15026572Ca823a93c07d6dCD39aD',
                              '0xA2bEdfc13889Da52D2e632F4036C74aCDbFF5a7f',
                              '0x09DA63c14BC36eBeb0834CabcA0676353A08b5EB'];
          
                              
          }
    }
}

module.exports = AccountsAndContracts;
