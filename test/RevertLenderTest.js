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

  it ('should repay the lender when successful ether loan is made', async () => {

  })

  it ('should revert when ether loan defaults', async () => {

  })

  it ('should repay the lender when successful token load is made', async () => {

  })

  it ('should revert when token loan defaults', async () => {

  })

  it ('should let the lender update the lending offers', async () => {

  })

  it ('should not allow anyone besides the lender to update the lending offers', async () => {

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
