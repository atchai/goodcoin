pragma solidity ^0.4.24;

import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract RedemptionData is Ownable {
    mapping(address => uint256) private last_claimed;
    mapping(address => bool) private white_listed;

    uint8 public whiteListedUserCount;

    event SetClaim(address indexed Account, uint256 Time);

    constructor() public {
        whiteListedUserCount = 0;
    }

    function getLastClaimed(
        address _account
    ) public view onlyOwner returns(uint256) {
        return last_claimed[_account]; 
    }

    function setLastClaimed(
        address _account
    ) public onlyOwner returns(bool) {
        last_claimed[_account] = now;
        return true;
    }

    function checkUser(
        address _account
    ) public view onlyOwner returns(bool) {
        return white_listed[_account];
    }

    function whiteListUser(
        address _account
    ) public onlyOwner returns(bool) {
        white_listed[_account] = true;
        whiteListedUserCount = whiteListedUserCount + 1;
        return true;
    }
}
