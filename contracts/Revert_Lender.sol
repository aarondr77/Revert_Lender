RevertLender Smart Contract

	// lender -> currency -> upper limit
	mapping (address (mapping (address => uint)) upperLimits;
  mapping(address => uint) interestRate;

  //register
	function register_as_lender (address currency, uint upperlimit, uint interestRate) public approved {
  // check if lender has approved this smart contract to access funds
  // upperLimits[msg.sender][currency] = upperlimit;


  }

  //borrow
  function borrow (address smartContract, bytes functionSignature, bytes parameterData, address lender, address borrower, uint principal, address currency)
  	if (principal > upperLimit[lender[currency]]) {
    	revert();
    } else {
    	// check the starting balance
      uint startingBalance = ERC20(currency).balanceOf(this.address);
      //transfer any tokens mistakenly sent to this contract to ourselves
      uint transferred_away = ERC20(currency).transfer(this.address);
			sc.call(functionSignature, parameter_data);
      // check the ending balance
      uint endingBalance = ERC20(currency).balanceOf(this.address);
      //NOTE: check for interest rate
      total_amount_due = principal + principal * interestRate[lender];
      if (endingBalance < total_amount_due) {
      	revert();
      } else {
      	//case when borrower does not default
      	//give back the interest to the lender
        ERC20(currency).transfer(borrower, endingBalance - total_amount_due);
        ERC20(currency).transfer(lender, total_amount);
      }
    }

    // check if we should revert
    //unregister
    function unregister_lender (address smartContract, address lender) {
    		upperLimits[msg.sender][currency] = 0;
    }

    //transfer tokens from account
    function transferExtraTokens private tokens () {

    }


    
