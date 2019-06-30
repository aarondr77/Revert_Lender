pragma solidity ^0.5.0;

import "./ERC20.sol";

contract calledSmartContract {

  function () external payable {}

  function repayEtherLoan(uint256 amount, address payable to) public {
    require(amount <= address(this).balance, "not enough ether");
    to.transfer(amount);
  }

  function repayTokenLoan(uint amount, address currency, address to) public {
    ERC20(currency).transfer(to, amount);
  }

  function depositEther () payable external {}

}
