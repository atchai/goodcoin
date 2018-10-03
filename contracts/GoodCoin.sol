pragma solidity ^0.4.24;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract GoodCoin is StandardToken, Ownable {
    using SafeMath for uint256;
    string public name = 'GoodCoin';
    string public symbol = 'GTC';
    uint8 public decimals = 18;
    uint public INITIAL_SUPPLY = 0;

    event Burn(address indexed burner, uint256 value);
    event Mint(address indexed to, uint256 amount);
    event MintFinished();
    event PopulatedMarket();

    bool public mintingFinished = false;
    bool public populatedMarket = false;

    mapping (address => uint) public last_claimed;

    modifier canMint() {
      require(!mintingFinished);
      _;
    }

    modifier canPopulate() {
      require(!populatedMarket);
      _;
    }

    // Creats initial amount of this coin (GoodCoin) in the market
    // Amount is 100 coins for a start (of the GoodCoin market)
    function initialMove(address _gcm) canMint canPopulate public onlyOwner returns(bool) {
      // amount is 100 * 10^18 as each token seems to be viewed as
      // a wei-like equivalent in the bancor formulas
      
      // should be: uint256 amount = 100*(10**decimals);
      // replace "18" in the number of decimals. 
      //Don't replace in decimals var itself; it is uint8 and wiil cause inaccuracy. Should not change to uint256 also.
      uint256 amount = 100*(10**18); // ** is math.power

      mint(_gcm, amount);

      populatedMarket = true;
      emit PopulatedMarket();

      return true;
    }

    constructor() public {

      totalSupply_ = INITIAL_SUPPLY;
    }

    // How many goodCoins exists in the "world"
    function totalSupply() public view returns(uint256) {
      return totalSupply_;
    }

  /**
   * @dev Function to mint tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(address _to, uint256 _amount) canMint private returns (bool) {
    totalSupply_ = totalSupply_.add(_amount); // When a coin is minted, the totalSupply of all coins increased.
    balances[_to] = balances[_to].add(_amount); // Transfer the new coin(s) to the desired address
    emit Mint(_to, _amount);
    emit Transfer(address(0), _to, _amount);
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
   * @dev Mint and transfer to sender all tokens they are entitled to
   * @return True if successful
   */
  function withdrawTokens(address _to, uint256 _amount) canMint onlyOwner public returns (bool) {
    mint(_to, _amount);
    return true;
  }

  /**
   * @dev Internal Function to Burn tokens
   * @param _from The address that will lose the burned tokens.
   * @param _amount The amount of tokens to burn.
   * @return A boolean that indicates if the operation was successful.
   */
  function burn(address _from, uint256 _amount) private returns (bool) {
    require(_amount <= balances[_from]);
    balances[_from] = balances[_from].sub(_amount);

    totalSupply_ = totalSupply_.sub(_amount);
    emit Burn(_from, _amount);
  }

  /**
   * @dev Callable Function to Burn tokens
   * @param _from The address that will lose the burned tokens.
   * @param _amount The amount of tokens to burn.
   * @return A boolean that indicates if the operation was successful.
   */
  function burnTokens(address _from, uint256 _amount) onlyOwner public returns (bool) {
    burn(_from, _amount);

    return true;
  }
}