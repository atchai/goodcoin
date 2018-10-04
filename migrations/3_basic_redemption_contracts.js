'use strict';
 
var BancorFormula = artifacts.require("BancorFormula");
var ExpArray = artifacts.require("ExpArray");
var GoodCoin = artifacts.require("GoodCoin");
var GoodCoinMarket = artifacts.require("GoodCoinMarket");
var RedemptionData = artifacts.require("RedemptionData");
var RedemptionFunctional = artifacts.require("RedemptionFunctional");
var releaser = require("../contracts/releaser");

module.exports = function(deployer,network,accounts) {
    deployer.then(async () => {
        let owner = accounts[0];
        await deployer.deploy(RedemptionData);
        await deployer.deploy(ExpArray);
        await deployer.deploy(BancorFormula, ExpArray.address);
        
        // Deploying the GoodCoinMarket and Creating 10 Ethers in it's account from the deployer.
        await deployer.deploy(GoodCoinMarket, GoodCoin.address, BancorFormula.address, {'value': web3.toWei(10, "ether")}); 
        
        await deployer.deploy(RedemptionFunctional, RedemptionData.address, GoodCoinMarket.address);

        let goodCoin = await GoodCoin.deployed();
        let totalSupply = 0;

        totalSupply = (await goodCoin.totalSupply.call()).toString(10);
        console.log("Before initialMove() - GoodCoin totalSupply:",totalSupply);
        console.log("Initializing amount of GTC in the market.");
        
        // Minting X number of GoodCoins to the GoodCoin market.
        (await GoodCoin.deployed()).initialMove(GoodCoinMarket.address); 
        
        totalSupply = (await goodCoin.totalSupply.call()).toString(10);
        console.log("After initialMove() - GoodCoin totalSupply:",totalSupply);

        (await GoodCoin.deployed()).transferOwnership(GoodCoinMarket.address);
        (await RedemptionData.deployed()).whiteListUser(owner);
        (await RedemptionData.deployed()).transferOwnership(RedemptionFunctional.address);
        (await GoodCoinMarket.deployed()).transferOwnership(RedemptionFunctional.address);

        process.deployment = {
            "BancorFormula": BancorFormula.address,
            "ExpArray": ExpArray.address,
            "GoodCoin": GoodCoin.address,
            "GoodCoinMarket": GoodCoinMarket.address,
            "RedemptionData": RedemptionData.address,
            "RedemptionFunctional": RedemptionFunctional.address
        }

       
        await releaser(process.deployment, network);
    });
};

 