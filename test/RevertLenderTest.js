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


  it ('should repay the lender when successful ether loan is made', async () => {
    let currency = "0x0000000000000000000000000000000000000000";
    let fundingAmount = 5;
    let interest = 3;

    let functionSignature = calledSmartContract.address + "(uint256,address)"
    let hashedFunctionSignature = web3.utils.sha3(functionSignature);
    console.log(functionSignature);

    let callData = await bytes4(hashedFunctionSignature), 5);

    console.log(callData);

    // give calledSmartContract funds
    await calledSmartContract.depositEther({value: 5, from: accounts[2]});

    // get ether balance of lender
    let beginningBalance = await web3.eth.getBalance(calledSmartContract.address);
    console.log(beginningBalance);

    //await revertLender.callPractice(calledSmartContract.address, )
    //calledSmartContract.call(bytes4(hashedFunctionSignature), 2)



    // sc.call(keccack256(“f(uint256)”), parameter_data));
  })

  it ('should repay the lender when successful ether loan is made', async () => {


    let principal = 5;
    let currency = "0x0000000000000000000000000000000000000000";

  })

  it ('should revert when ether loan defaults', async () => {

  })

  it ('should repay the lender when successful token load is made', async () => {

  })

  it ('should revert when token loan defaults', async () => {

  })

  it ('should allow the lender to withdraw ether from the revert lender', async () => {

  })

  it ('should not allow anyone besides the lender to withdraw ether from the revert lender', async () => {

  })

  it ('should allow the lender to withdraw tokens from the revert lender', async () => {

  })

  it ('should not allow anyone besides the lender to withdraw tokens from the revert lender', async () => {

  })
})
