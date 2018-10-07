class GoodCoinUtils {
    constructor(web3js, goodCoinMarket, tokenDecimals) {
        this.web3js = web3js;
        this.goodCoinMarket = goodCoinMarket;
        this.tokenDecimals = tokenDecimals;
      }
    
      /*
      unitMap = {
        '0': '1',
        '1': '10',
        '2': '100',
        '3': '1000',
        '4': '10000', // used for all base calculations, like wei
      };
      */
    
      // Should be part of "GDjs.js" - a utilty class for GoodDollar token.
      toGDUnits(gdTokens, inWhichPrecision) {
    
        // Assumption: gdTokens are provided on the smallest presicion unit base (see map)
    
        let precision = parseInt(inWhichPrecision);
        if ((precision != undefined) && (!isNaN(precision))) {
    
          let power = this.tokenDecimals - precision;
          var convertedTokens = gdTokens * (10 ** power)
          return convertedTokens;
        } else {
          return NaN;
        }
      }
    
        // Should be part of "GDjs.js" - a utilty class for GoodDollar token.
    
      fromGDUnits(gdTokens, toWhichPrecision) {
    
        // Assumption: gdTokens are provided on the smallest presicion unit base (see map)
    
        let precision = parseInt(toWhichPrecision);
        if ((precision != undefined) && (!isNaN(precision))) {
    
          let power = this.tokenDecimals - precision;
          let negativePower = power * -1;
          var convertedTokens = gdTokens * (10 ** negativePower)
          return convertedTokens;
        } else {
          return NaN;
        }
      }
    
}

module.exports = GoodCoinUtils;