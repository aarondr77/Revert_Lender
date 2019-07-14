pragma solidity ^0.5.0;

import "./ERC20.sol";

contract calledSmartContract {


  event StringPrint(string context, string message);


  function () external payable {}

  // THESE REQUIRE FAILINGS DON"T MAKE THE ENTIRE TRANSACTION STOP DURING TESTING
  function repayEtherLoan(uint256 amount, address payable to) public returns (bool success) {
    emit StringPrint("calledSmartContract", "here");
    //require(amount <= address(this).balance, "not enough ether");
    to.transfer(amount);
    emit StringPrint("calledSmartContract", "made it to the end");
  }

  function repayTokenLoan(uint amount, address currency, address to) public {
    ERC20(currency).transfer(to, amount);
  }

  function depositEther () payable external {}

}
