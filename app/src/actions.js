class Actions{

    

    constructor(web3js,goodCoinMarket){
        this.web3js = web3js;
        this.goodCoinMarket = goodCoinMarket ;
     }

    checkPriceBuy(amount){
        amount = web3js.utils.toWei(amount, "ether");
        this.goodCoinMarket.methods.calculateAmountPurchased(
            amount).call(
            function(err, tokens){
              tokens = web3js.utils.fromWei(tokens, 'ether');
              console.log(`tokens before: ${tokens}`);
              console.log(`tokens: ${tokens}`);
              $('#buy_price').text(parseFloat(tokens).toPrecision(7));
            }
          );
    }

    buy(amount) {
        let web3js = this.web3js;
        amount = web3js.utils.toWei(amount, "ether");
        this.goodCoinMarket.methods.buy().call(
          {
            'from':ehteriumAccounts[0],
            'value': amount
          },
          function(err, transactionHash){
            console.log(err,transactionHash);
          }
        );
      }
}

module.exports = Actions;
