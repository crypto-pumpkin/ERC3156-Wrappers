const { BN, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const YieldFYDaiERC3156 = artifacts.require('YieldFYDaiERC3156');
const FYDaiMock = artifacts.require('FYDaiMock');
const FlashBorrower = artifacts.require('FlashBorrower');

contract('YieldFYDaiERC3156', (accounts) => {

  const [ deployer, user1 ] = accounts;
  let fyDai, lender, borrower
  const MAX_UINT112 = "5192296858534827628530496329220095"

  beforeEach(async function () {
    // Setup fyDai
    const block = await web3.eth.getBlockNumber()
    const maturity0 = (await web3.eth.getBlock(block)).timestamp + 15778476 // Six months

    fyDai = await FYDaiMock.new("FYDAI", "FYDAI", maturity0)
    lender = await YieldFYDaiERC3156.new([fyDai.address], { from: deployer })
    borrower = await FlashBorrower.new()
  });

  it('flash supply', async function () {
    expect(await lender.maxFlashLoan(fyDai.address)).to.be.bignumber.equal(MAX_UINT112);
    expect(await lender.maxFlashLoan(lender.address)).to.be.bignumber.equal("0");
  });

  it('flash fee', async function () {
    const loan = new BN("1000")
    expect(await lender.flashFee(fyDai.address, loan)).to.be.bignumber.equal("0");
    await expectRevert(
      lender.flashFee(lender.address, loan),
      "Unsupported currency"
    )
  });

  it('fyDai flash loan', async function () {
    const loan = new BN("1000")
    const balanceBefore = await fyDai.balanceOf(borrower.address)
    await borrower.flashBorrow(lender.address, fyDai.address, loan, { from: user1 });

    assert.equal(await borrower.flashSender(), borrower.address)
    assert.equal((await borrower.flashToken()).toString(), fyDai.address.toString())
    assert.equal((await borrower.flashAmount()).toString(), loan.toString())
    assert.equal((await borrower.flashBalance()).toString(), balanceBefore.add(loan).toString())
    assert.equal((await borrower.flashFee()).toString(), "0")
    assert.equal((await fyDai.balanceOf(borrower.address)).toString(), balanceBefore.toString())
  });
});