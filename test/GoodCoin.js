import assertRevert from "zeppelin-solidity/test/helpers/assertRevert";

const GoodCoin = artifacts.require("GoodCoin");

// TODO integrate tests from https://github.com/ConsenSys/Tokens/blob/master/test/eip20/eip20.js

contract("GoodCoin", accounts => {
  it("Should make first account an owner", async () => {
    let instance = await GoodCoin.deployed();
    let owner = await instance.owner();
    assert.equal(owner, accounts[0]);
  });

  // owner has initial balance of 12000

  // checkEntitlement returns a correct result for first claim


  // checkEntitlement returns a credible result for subsequent claims


  // can make transfers

});
