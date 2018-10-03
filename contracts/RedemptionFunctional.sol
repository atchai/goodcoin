pragma solidity ^0.4.24;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

import './GoodCoinMarket.sol';
import './RedemptionData.sol';

contract RedemptionFunctional is Ownable {
    using SafeMath for uint256;

    RedemptionData public data;
    GoodCoinMarket public market;

    event ClaimCalculated(uint256 base, uint256 interest, uint256 total);

    modifier whiteListed() {
        bool check = data.checkUser(msg.sender);
        require(check);
        _;
    }

    constructor(address _data_contract, address _token) public {
        data = RedemptionData(_data_contract);
        market = GoodCoinMarket(_token);
    }

    function whiteListUser(
        address _account
    ) public whiteListed returns(bool) {
        return data.whiteListUser(_account);
    }

    function getLastClaimed() public view returns(uint256) {
        return data.getLastClaimed(msg.sender);
    }

    function checkWhiteListStatus() public view returns(bool) {
        return data.checkUser(msg.sender);
    }

    function calculateClaim() internal view returns(uint256) {
        uint256 base = 100;
        uint256 interest = base.add(market.inflationRate());
        uint256 total = interest.mul(market.totalSupply());
        total = total.div(base);
        // total at this point is the existing supply plus
        // the suggested total interest, so we need to remove
        // the existing supply - what was causing the issue
        // in the earlier calculation.
        total = total.sub(market.totalSupply());
        uint256 amount = total.div(data.whiteListedUserCount());
        //emit ClaimCalculated(base,interest,total);
        return amount;
    }

    function claimTokens() public whiteListed returns(bool) {
        require(data.getLastClaimed(msg.sender) + 1 days < now);

        data.setLastClaimed(msg.sender);
        uint256 amount = calculateClaim();
        market.withdrawTokens(msg.sender, amount);

        return true;
    }
    /**
     * @dev Function to check how many tokens a user is entitled to mint
     * @return Number of tokens you are entitled to
     */
    function checkEntitlement() public whiteListed view returns(uint) {
        if(data.getLastClaimed(msg.sender) + 1 days > now)
          return 0;
        return calculateClaim();
    }
}
