var assert = require('chai').assert;
const expectThrow = require('./helper.js');
var Web3Utils = require('web3-utils');

const RevertLender = artifacts.require('RevertLender.sol');
const CalledSmartContract = artifacts.require('calledSmartContract.sol');
const ERC20 = artifacts.require('ERC20.sol');

contract ('Revert Lender', (accounts) => {
  let revertLender;
  let calledSmartContract;
  let token;
  let lender = accounts[0];
  let borrower = accounts[1];

  async function successfulLoan() {
    let currency = "0x0000000000000000000000000000000000000000";
    let fundingAmount = 50;
    let interest = 10;
    let totalInterest = fundingAmount * interest / 100;
    let totalAmountDue = fundingAmount + totalInterest;
    let loanPayoff = totalAmountDue + 10;

    // give calledSmartContract some intitial funding to simulate successful loan
    await calledSmartContract.depositEther({value: 100, from: accounts[9]});

    // set up lending offer
    await revertLender.updateLendingOffer(currency, fundingAmount, interest, {from: lender, value: fundingAmount});

    let encodingSuccessfulLoan = await web3.eth.abi.encodeFunctionCall({
        name: 'repayEtherLoan',
        type: 'function',
        inputs: [{
            type: 'uint256',
            name: 'amount'
        },{
            type: 'address',
            name: 'to'
        }]
    }, [loanPayoff, revertLender.address]);

    await revertLender.borrow(calledSmartContract.address, encodingSuccessfulLoan, borrower, fundingAmount, currency);
  }

  beforeEach(async() => {
    revertLender = await RevertLender.new({from: accounts[0]});
    calledSmartContract = await CalledSmartContract.new({from: accounts[0]});
    token = await ERC20.new(1000, {from: accounts[0]});
  })

  it ('should let the lender update the lending offers (ether)', async () => {
    let currency = "0x0000000000000000000000000000000000000000";
    let fundingAmount = 5;
    let interest = 3;
    await revertLender.updateLendingOffer(currency, fundingAmount, interest, {from: accounts[0], value: fundingAmount});
    const etherFunding = await revertLender.upperLimits.call(currency);
    const etherInterest = await revertLender.interestRates.call(currency);
    await assert.equal(etherFunding, fundingAmount);
    await assert.equal(etherInterest, interest);

  })

  it ('should not allow anyone besides the lender to update the lending offers (ether)', async () => {
    let currency = "0x0000000000000000000000000000000000000000";
    let fundingAmount = 5;
    let interest = 3;
    await expectThrow(revertLender.updateLendingOffer(currency, fundingAmount, interest, {from: borrower, value: fundingAmount}));
  })


  it ('should successfuly use callPractice', async () => {
    let currency = "0x0000000000000000000000000000000000000000";
    let fundingAmount = 5;
    let interest = 3;

    await calledSmartContract.depositEther({value: 5, from: accounts[2]});
    let beginningBalanceCalledSmartContract = await web3.eth.getBalance(calledSmartContract.address);
    let beginningBalanceRevertLender = await web3.eth.getBalance(revertLender.address);


    let encoding = await web3.eth.abi.encodeFunctionCall({
        name: 'repayEtherLoan',
        type: 'function',
        inputs: [{
            type: 'uint256',
            name: 'amount'
        },{
            type: 'address',
            name: 'to'
        }]
    }, [fundingAmount, revertLender.address]);

    await revertLender.callPractice(calledSmartContract.address, encoding);

    let endingBalanceCalledSmartContract = await web3.eth.getBalance(calledSmartContract.address);
    let endingBalanceRevertLender = await web3.eth.getBalance(revertLender.address);


    console.log(beginningBalanceCalledSmartContract);
    console.log(endingBalanceCalledSmartContract);
    console.log("Encoding1", encoding);

    await assert.equal(Number(endingBalanceCalledSmartContract), Number(beginningBalanceCalledSmartContract) - Number(fundingAmount));
    await assert.equal(Number(endingBalanceRevertLender), (Number(beginningBalanceRevertLender) + Number(fundingAmount)));

  })

  it ('should repay the lender when successful ether loan is made with no excess profits', async () => {
    let currency = "0x0000000000000000000000000000000000000000";
    let fundingAmount = 50;
    let interest = 10;
    let totalInterest = fundingAmount * interest / 100;
    let totalAmountDue = fundingAmount + totalInterest;
    let loanPayoff = totalAmountDue;

    console.log("totalAmountDue", totalAmountDue);

    // give calledSmartContract some intitial funding to simulate successful loan
    await calledSmartContract.depositEther({value: 100, from: accounts[9]});

    // set up lending offer
    await revertLender.updateLendingOffer(currency, fundingAmount, interest, {from: lender, value: fundingAmount});

    // get initial balances
    let beginningBalanceCalledSmartContract = await web3.eth.getBalance(calledSmartContract.address);
    let beginningBalanceRevertLender = await web3.eth.getBalance(revertLender.address);


    await console.log(beginningBalanceCalledSmartContract);
    await console.log(beginningBalanceRevertLender);


    let encoding2 = await web3.eth.abi.encodeFunctionCall({
        name: 'repayEtherLoan',
        type: 'function',
        inputs: [{
            type: 'uint256',
            name: 'amount'
        },{
            type: 'address',
            name: 'to'
        }]
    }, [loanPayoff, revertLender.address]);

    await revertLender.borrow(calledSmartContract.address, encoding2, borrower, fundingAmount, currency);

    let endingBalanceCalledSmartContract = await web3.eth.getBalance(calledSmartContract.address);
    let endingBalanceRevertLender = await web3.eth.getBalance(revertLender.address);
    await console.log(endingBalanceCalledSmartContract);
    await console.log(endingBalanceRevertLender);

    await assert.equal(Number(endingBalanceCalledSmartContract), Number(beginningBalanceCalledSmartContract) - (Number(loanPayoff) - Number(fundingAmount)));
    await assert.equal(Number(endingBalanceRevertLender), Number(beginningBalanceRevertLender) + Number(totalInterest));
  })

  it ('should repay the lender when successful ether loan is made with excess profits', async () => {
    let currency = "0x0000000000000000000000000000000000000000";
    let fundingAmount = 50;
    let interest = 10;
    let totalInterest = fundingAmount * interest / 100;
    let totalAmountDue = fundingAmount + totalInterest;
    let loanPayoff = totalAmountDue + 10;

    console.log("totalAmountDue", totalAmountDue);

    // give calledSmartContract some intitial funding to simulate successful loan
    await calledSmartContract.depositEther({value: 100, from: accounts[9]});

    // set up lending offer
    await revertLender.updateLendingOffer(currency, fundingAmount, interest, {from: lender, value: fundingAmount});

    // get initial balances
    let beginningBalanceCalledSmartContract = await web3.eth.getBalance(calledSmartContract.address);
    let beginningBalanceRevertLender = await web3.eth.getBalance(revertLender.address);
    let beginningBalanceBorrower = await web3.eth.getBalance(borrower);


    await console.log(beginningBalanceCalledSmartContract);
    await console.log(beginningBalanceRevertLender);


    let encoding2 = await web3.eth.abi.encodeFunctionCall({
        name: 'repayEtherLoan',
        type: 'function',
        inputs: [{
            type: 'uint256',
            name: 'amount'
        },{
            type: 'address',
            name: 'to'
        }]
    }, [loanPayoff, revertLender.address]);

    await revertLender.borrow(calledSmartContract.address, encoding2, borrower, fundingAmount, currency);

    let endingBalanceCalledSmartContract = await web3.eth.getBalance(calledSmartContract.address);
    let endingBalanceRevertLender = await web3.eth.getBalance(revertLender.address);
    let endingBalanceBorrower = await web3.eth.getBalance(borrower);

    await console.log("borrower Balance ", await web3.eth.getBalance(borrower));
    await console.log("Lender Balance ", await web3.eth.getBalance(lender))

    await console.log(endingBalanceCalledSmartContract);
    await console.log(endingBalanceRevertLender);

    await assert.equal(Number(endingBalanceCalledSmartContract), Number(beginningBalanceCalledSmartContract) - (Number(loanPayoff) - Number(fundingAmount)));
    await assert.equal(Number(endingBalanceRevertLender), Number(beginningBalanceRevertLender) + Number(totalInterest));
    await assert.equal(Number(endingBalanceBorrower), Number(beginningBalanceBorrower) + Number(loanPayoff) - Number(totalAmountDue));
  })


  it ('should revert when ether loan defaults', async () => {
    let currency = "0x0000000000000000000000000000000000000000";
    let fundingAmount = 50;
    let interest = 10;
    let totalInterest = fundingAmount * interest / 100;
    let totalAmountDue = fundingAmount + totalInterest;
    let loanPayoff = totalAmountDue - 5;

    console.log("totalAmountDue", totalAmountDue);

    // give calledSmartContract some intitial funding to simulate successful loan
    await calledSmartContract.depositEther({value: 100, from: accounts[9]});

    // set up lending offer
    await revertLender.updateLendingOffer(currency, fundingAmount, interest, {from: lender, value: fundingAmount});

    // get initial balances
    let beginningBalanceCalledSmartContract = await web3.eth.getBalance(calledSmartContract.address);
    let beginningBalanceRevertLender = await web3.eth.getBalance(revertLender.address);
    let beginningBalanceBorrower = await web3.eth.getBalance(borrower);

    await console.log(beginningBalanceCalledSmartContract);
    await console.log(beginningBalanceRevertLender);

    let encoding2 = await web3.eth.abi.encodeFunctionCall({
        name: 'repayEtherLoan',
        type: 'function',
        inputs: [{
            type: 'uint256',
            name: 'amount'
        },{
            type: 'address',
            name: 'to'
        }]
    }, [loanPayoff, revertLender.address]);

    await expectThrow(revertLender.borrow(calledSmartContract.address, encoding2, borrower, fundingAmount, currency));

  })

  it ('should repay the lender when successful token load is made', async () => {

  })

  it ('should revert when token loan defaults', async () => {

  })

  it ('should allow the lender to withdraw ether from the revert lender', async () => {

    let currency = "0x0000000000000000000000000000000000000000";

    await successfulLoan();
    let beginningBalanceOfRevertLender = await web3.eth.getBalance(revertLender.address);
    let beginningBalanceOfLender = await web3.eth.getBalance(lender);

    await revertLender.withdraw(currency, beginningBalanceOfRevertLender, lender, {from: lender,  gas: 500000});

    let endingBalanceOfRevertLender = await web3.eth.getBalance(revertLender.address);
    let endingBalanceOfLender = await web3.eth.getBalance(lender);

    console.log("beginningBalanceOfLender ", beginningBalanceOfLender);
    console.log("beginningBalanceOfRevertLender ", beginningBalanceOfRevertLender);
    console.log("endingBalanceOfLender ", endingBalanceOfLender);

    await assert.equal(Number(beginningBalanceOfLender) + Number(beginningBalanceOfRevertLender), Number(endingBalanceOfLender), 700000000000000);
    await assert.equal(Number(0), Number(endingBalanceOfRevertLender));

  })

  it ('should not allow anyone besides the lender to withdraw ether from the revert lender', async () => {
    let currency = "0x0000000000000000000000000000000000000000";
    await expectThrow(revertLender.withdraw(currency, 10, lender, {from: borrower, gas: 500000}));


  })

  it ('should allow the lender to withdraw tokens from the revert lender', async () => {

  })

  it ('should not allow anyone besides the lender to withdraw tokens from the revert lender', async () => {

  })
})
