pragma solidity ^0.5.8;

import "./IERC20.sol";
import "./SafeMath.sol";


contract RevertLender {
	using SafeMath for uint;
	// lender -> currency -> upper limit
	mapping (address => uint) upperLimits;
  mapping (address => uint) interestRates;

	uint public constant INTEREST_RATE_CONVERTER = 10 ** 7;

	address lender;

	modifier onlyLender(address a) {
		require(lender == a, "not lender");
		_;
	}

	function () external {}

	constructor() public {
			lender = msg.sender;
	}


	// Allows the lender to update his lending preferences
	function updateLendingOffer (address currency, uint amount, uint interestRate) onlyLender(msg.sender) public payable {
		require(IERC20(currency).transferFrom(msg.sender, address(this), amount), "not approved to transfer tokens");
		upperLimits[currency] = IERC20(currency).balanceOf(msg.sender);
		interestRates[currency] = interestRate;
  }

  function borrow (address smartContract, bytes memory callData, address payable borrower, uint principal, address currency) public {
  	require(principal <= upperLimits[currency], "principal > upper limit");
		uint startingBalance;
		uint endingBalance;
		// check if currency is ether

		if (currency == address(0)) {
			// check the starting balance
			startingBalance = address(this).balance;
			smartContract.call.value(principal)(callData);
			endingBalance = address(this).balance;
		} else {
			// check the starting balance
			startingBalance = IERC20(currency).balanceOf(address(this));
			IERC20(currency).approve(smartContract, principal);
			smartContract.call(callData);
			endingBalance = IERC20(currency).balanceOf(address(this));
		}

		// calculate the interest payment due
		uint totalInterest = principal.mul(interestRates[lender]).div(INTEREST_RATE_CONVERTER);
		uint totalAmountDue = principal + totalInterest;

		uint deltaFromTransaction = endingBalance - startingBalance;
		require(deltaFromTransaction > totalAmountDue, "default on loan");

		//if loan was profitable
		if (currency == address(0)) {
			borrower.transfer(deltaFromTransaction - totalAmountDue);
		} else {
			IERC20(currency).transfer(borrower, deltaFromTransaction - totalAmountDue);
		}
  }

  //transfer tokens from account
  function withdraw (address currency, uint amount, address payable to) onlyLender(msg.sender) public {
		if (currency == address(0)) {
			uint startingBalance = address(this).balance;
			require(startingBalance >= amount, "insufficient funds to withdraw");
			to.transfer(amount);
			require(address(this).balance + amount == startingBalance, "ether withdraw misbehaved");
		} else {
			require(IERC20(currency).balanceOf(address(this)) >= amount, "insufficient funds to withdraw");
			require(IERC20(currency).transfer(to, amount), "withdraw transfer failed");
		}
  }
}
