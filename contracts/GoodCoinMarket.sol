pragma solidity ^0.4.24;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

import './BancorFormula.sol';
import './GoodCoin.sol';

contract GoodCoinMarket is Ownable {
    using SafeMath for uint256;

    GoodCoin public token;
    BancorFormula public formula;

    // Members
    // =======
    // totalSupply(): The GoodDollar (GTC coins) amount the contract supervise (the whole GTC coins ever exists are documented here). Initiated on "InitialMove()"
    // poolBalance(): The ethers (ETH coins) amount the GoodCoinMarket as a contract has in the accounthas. Initiated in the deployment of the contract.

    // Reserve ratio, represented in value between
    // 1 and 1,000,000. So 0.1 = 100000.
    uint32 public reserveRatio = 100000;

    uint256 public inflationRate = 1;

    constructor(address _token, address _formula) public payable {
        token = GoodCoin(_token);
        formula = BancorFormula(_formula);
    }

    // The etherium amount the GoodCoinMarket has. Initiated in the deployment of the contract.
    function poolBalance() private view returns(uint256) {
        return address(this).balance;
    }

    function calculateAmountPurchased(uint256 _eth) public view returns(uint256) {
        uint256 tokensForPrice = formula.calculatePurchaseReturn(
            totalSupply(),
            poolBalance(),
            reserveRatio,
            _eth
        );

        return tokensForPrice;
    }

    function calculatePriceForSale(uint256 _sellAmount) public view returns(uint256) {
        uint256 ethAmount = formula.calculateSaleReturn(
            totalSupply(),
            poolBalance(),
            reserveRatio,
            _sellAmount
        );

        return ethAmount;
    }

    function buy() public payable returns(bool) {
        require(msg.value > 0);
        uint256 tokensToMint = formula.calculatePurchaseReturn(
            totalSupply(),
            // the function is payable. Means the money sent was *already reflected* in the poolBalance! (eth)
            // But the user requested to buy according to the amount of poolBalance before he/she made the payment and changeed the formula
            //so we have to consider this
            poolBalance()-msg.value,
            reserveRatio,
            msg.value
        );
        token.withdrawTokens(msg.sender, tokensToMint);

        return true;
    }

    function sell(uint256 _sellAmount) public returns(bool){
        require(_sellAmount > 0 && token.balanceOf(msg.sender) >= _sellAmount);
        uint256 ethAmount = formula.calculateSaleReturn(
            totalSupply(),
            poolBalance(),
            reserveRatio,
            _sellAmount
        );

        token.burnTokens(msg.sender, _sellAmount);
        msg.sender.transfer(ethAmount);

        return true;
    }

    function totalSupply() public view returns (uint256) {
        return token.totalSupply();
    }

    function withdrawTokens(
        address _account,
        uint256 _amount
    ) onlyOwner public returns (bool) {
        token.withdrawTokens(_account, _amount);

        return true;
    }
}
