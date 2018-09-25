import assertRevert from "zeppelin-solidity/test/helpers/assertRevert";

const GoodCoin = artifacts.require("GoodCoin");

// TODO integrate tests from https://github.com/ConsenSys/Tokens/blob/master/test/eip20/eip20.js

contract("GoodCoin", accounts => {
  it("Should make first account an owner", async () => {
    let instance = await GoodCoin.deployed();
    debugger;
    let owner = await instance.owner();
    assert.equal(owner, accounts[0]);
  });

  it("Should give the owner 12000 tokens", async () => {
    let instance = await GoodCoin.deployed();
    let owner = await instance.owner();
    let balance = (await instance.balanceOf.call(accounts[0])).toNumber();

    assert.equal(balance, 12000);
  });

  it("Should give a first-time user a zero-balance", async () => {
    let instance = await GoodCoin.deployed();
    let balance = (await instance.balanceOf.call(accounts[1])).toNumber();

    assert.equal(balance, 0);
  });

  it("Should entitle a first-time users to 10 tokens", async () => {
    let instance = await GoodCoin.deployed();
    let owner = await instance.owner();
    let entitlement = (await instance.checkEntitlement.call(accounts[1])).toNumber();

    assert.equal(entitlement, 10);
  });



  it("Should withdraw your entitlement", async () => {
    let instance = await GoodCoin.deployed();
    let entitlement = (await instance.checkEntitlement.call(accounts[1])).toNumber();
    await instance.withdrawTokens( {from: accounts[1]});
    let balance = (await instance.balanceOf.call(accounts[1])).toNumber();

    assert.equal(balance, entitlement);
  });


  it("Should entitle you to ~1 token per second after the first withdrawal", async () => {
    let instance = await GoodCoin.deployed();
    await instance.withdrawTokens( {from: accounts[1]});
    await setTimeout(function(){
    }, 1000);
    let entitlement = (await instance.checkEntitlement.call(accounts[1])).toNumber();

    assert.equal(entitlement, 0);
  });


// last claim date


  // can make transfers

  // only owner can minted

  // owner can change MINTING_COEFFICIENT


});
