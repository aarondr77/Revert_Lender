pragma solidity ^0.4.24;

contract RevertLender {
	// lender -> currency -> upper limit
	mapping (address => uint) upperLimits;
  mapping (address => uint)) interestRates;

	uint public constant INTEREST_RATE_CONVERTER = 10 ** 7;

	address lender;

	modifier onlyLender(address a) {
		require(lender == a, "not lender");
		_;
	}

	constructor() public {
			lender = msg.sender;
	}


	// Allows the lender to update his lending preferences
	function updateLendingOffer (address currency, uint amount, uint interestRate) onlyLender(msg.sender) public {
		require(ERC20(currency).transferFrom(msg.sender, address(this), amount), "not approved to transfer tokens");
		upperLimits[currency] = ERC20(currency).balanceOf(msg.sender);
		interestRates[msg.sender][currency] = interestRate;
  }

  function borrow (address smartContract, bytes callData, address borrower, uint principal, address currency) {
  	require(principal <= upperLimits[currency], "principal > upper limit");
		// check if currency is ether
		if (currency == address(0)) {
			// check the starting balance
			uint startingBalance = balance(this.address);
			smartContract.call.value(principal)(callData);
			uint endingBalance = balance(this.address);
		} else {
			// check the starting balance
			uint startingBalance = ERC20(currency).balanceOf(this.address);
			// Figure out sending money!
			smartContract.call(callData);
			uint endingBalance = ERC20(currency).balanceOf(this.address);
		}

		// calculate the interest payment due
		uint totalInterest = principal.mul(interestRates[lender]).div(INTEREST_RATE_CONVERTER);
		uint totalAmountDue = principal + totalInterest;

		uint deltaFromTransaction = endingBalance - startingBalance;
		require(deltraFromTransaction > totalAmountDue, "default on loan");

		if (currency == address(0)) {
			borrower.transfer(deltaFromTransaction - totalAmountDue);
		} else {
			ERC20(currency).transfer(borrower, deltaFromTransaction - totalAmountDue);
		}
  }

    // check if we should revert
    //unregister
    function unregister_lender (address smartContract, address lender) {
    		upperLimits[msg.sender][currency] = 0;
    }

    //transfer tokens from account
    function withdraw (address currency, uint amount, address to) onlyLender(msg.sender) public {
			if (currency == address(0)) {
				uint startingBalance = this.balance;
				require(startingBalance >= amount, "insufficient funds to withdraw");
				to.transfer(currency);
				require(this.balance + amount = startingBalance, "ether withdraw misbehaved");
			}
    }
}
