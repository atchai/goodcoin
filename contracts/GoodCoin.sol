pragma solidity ^0.4.23;

import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract GoodCoin is StandardToken, Ownable {
    string public name = 'GoodCoin';
    string public symbol = 'GTC';
    uint8 public decimals = 18;
    uint public INITIAL_SUPPLY = 12000;
    uint public MINTING_COEFFICIENT = 1;

    event Mint(address indexed to, uint256 amount);
    event MintFinished();

    bool public mintingFinished = false;

    mapping (address => uint) public last_claimed;

    modifier canMint() {
      require(!mintingFinished);
      _;
    }

    constructor() public {
      totalSupply_ = INITIAL_SUPPLY;
      balances[msg.sender] = INITIAL_SUPPLY;
    }


  /**
   * @dev Function to mint tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(address _to, uint256 _amount) canMint private returns (bool) {
    totalSupply_ = totalSupply_.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    emit Mint(_to, _amount);
    emit Transfer(address(0), _to, _amount);
    return true;
  }

  /**
   * @dev Owner can set a multiplier for token entitlement
   * @return True if the operation was successful.
   */
  function setMintingCoefficient(uint _coefficient) onlyOwner public returns (bool) {
    MINTING_COEFFICIENT = _coefficient;
    return true;
  }

  /**
   * @dev Function to stop minting new tokens.
   * @return True if the operation was successful.
   */
  function finishMinting() onlyOwner canMint public returns (bool) {
    mintingFinished = true;
    emit MintFinished();
    return true;
  }

  /**
   * @dev Function to check how many tokens a user is entitled to mint
   * @return Number of tokens you are entitled to
   */
  function checkEntitlement(address _user) public view returns(uint) {
    // not first claim
    if (last_claimed[_user] > 0) {
      uint amount = MINTING_COEFFICIENT * (now - last_claimed[_user]);
      return amount;
    }
    // first claim
    else {
      return 10;
    }
  }

  /**
   * @dev Mint and transfer to sender all tokens they are entitled to
   * @return True if successful
   */
  function withdrawTokens() canMint public returns (bool) {
    uint amount = checkEntitlement(msg.sender);
    last_claimed[msg.sender] = now;
    mint(msg.sender, amount);
    return true;
  }

}
