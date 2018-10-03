import assertRevert from "zeppelin-solidity/test/helpers/assertRevert";

const GoodCoinMarket = artifacts.require("GoodCoinMarket");

contract("GoodCoinMarket", accounts => {
  it("Should print totalSupply()", async () => {
    let instance = await GoodCoinMarket.deployed();
    let totalSupply = await instance.totalSupply.call();
    console.log("totalSupply ="+totalSupply);
    assert.notEqual(totalSupply,undefined);
  });

});

