pragma solidity ^0.5.8;

import "./IERC20.sol";
import "./SafeMath.sol";

//edit see this

contract RevertLender {
	using SafeMath for uint;
	// lender -> currency -> upper limit
	mapping (address => uint) public upperLimits;
  mapping (address => uint) public interestRates;

	uint public constant INTEREST_RATE_CONVERTER = 10 ** 7;

	address lender;

	modifier onlyLender(address a) {
		require(lender == a, "not lender");
		_;
	}

	event AddressZero(address b);
	event AddressArgument(address c);
	event AmountDue(string text, uint amount, uint interest);
	event UintPrint(string text, uint num);
	event StringPrint(string context, string message);


	function () external payable {}

	constructor() public {
			lender = msg.sender;
	}

	function isZero (address a) public {
		emit AddressZero(address(0));
		emit AddressArgument(a);
		require(a == address(0), "address is not zero");
	}

	function callPractice (address a, bytes memory callData) public {
		a.call(callData);
		emit StringPrint("Call Practice", "made call");
	}

	// Allows the lender to update his lending preferences
	// TODO allow people to decrease offer!
	function updateLendingOffer (address currency, uint amount, uint interestRate) onlyLender(msg.sender) public payable {
		if (currency == address(0)) {
			require(msg.value >= amount, "must fund account to update offer");
		} else {
			require(IERC20(currency).transferFrom(msg.sender, address(this), amount), "not approved to transfer tokens");
		}
		upperLimits[currency] += amount;
		interestRates[currency] = interestRate;
  }

  function borrow (address payable smartContract, bytes memory callData, address payable borrower, uint principal, address currency) public {
  	require(principal <= upperLimits[currency], "principal > upper limit");
		uint startingBalance;
		uint endingBalance;
		// check if currency is ether

		if (currency == address(0)) {
			emit StringPrint("ether borrow", "here");
			// check the starting balance
			startingBalance = address(this).balance;
			emit UintPrint("startingBalance", startingBalance);
			smartContract.transfer(principal);
			//smartContract.call.value(principal)(callData);
			smartContract.call(callData);
			//callPractice(smartContract, callData);
			endingBalance = address(this).balance;
			emit UintPrint("endingBalance", endingBalance);

		} else {
			// check the starting balance
			startingBalance = IERC20(currency).balanceOf(address(this));
			IERC20(currency).approve(smartContract, principal);
			smartContract.call(callData);
			endingBalance = IERC20(currency).balanceOf(address(this));
		}

		// calculate the interest payment due
		uint totalInterest = principal.mul(interestRates[currency]).div(100);//.div(INTEREST_RATE_CONVERTER);
		uint totalAmountDue = principal + totalInterest;
		emit AmountDue('Amount Due', totalAmountDue, totalInterest);
		emit AmountDue('InterestRate', interestRates[currency], totalInterest);
		emit UintPrint('Ending Balance', address(this).balance);


		uint deltaFromTransaction = endingBalance - startingBalance;
		require(deltaFromTransaction >= totalInterest, "default on loan");

		//if loan was profitable
		if (currency == address(0)) {
			borrower.transfer(deltaFromTransaction - totalInterest);
		} else {
			IERC20(currency).transfer(borrower, deltaFromTransaction - totalInterest);
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
