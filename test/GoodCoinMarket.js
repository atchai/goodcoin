import assertRevert from "zeppelin-solidity/test/helpers/assertRevert";

const GoodCoinMarket = artifacts.require("GoodCoinMarket");

contract("GoodCoinMarket", accounts => {
  it("Should print totalSupply()", async () => {
    let instance = await GoodCoinMarket.deployed();
    let totalSupply = await instance.totalSupply.call();
    console.log("totalSupply ="+totalSupply);
    assert.notEqual(totalSupply,undefined);
  });



  contract("GoodCoinMarket", accounts => {
    it("Should sell 1 GTC", async () => {
      let instance = await GoodCoinMarket.deployed();
      let totalSupply = await instance.totalSupply.call();
      console.log("totalSupply ="+totalSupply);
      let price = await instance.calculatePriceForSale(10000, { 'from': '0x9b36dEa68d42668Bed85c91b990BD306a18310C6' });})
      console.log("price ="+price);
      assert.notEqual(totalSupply,undefined);
    });

  
});

