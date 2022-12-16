const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

describe("FundMe", async function () {
    // Global Variables
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1") // 1ETH
    // Deploy contracts and set to global variables
    beforeEach(async function () {
        // deploy fundMe contract
        // executes scripts with the "all" tag

        // old way: cant assign deployer to global deployer since they have the same name.
        // const { deployer } = await getNamedAccounts()
        // new way: wrap the operator in brackets to accesss its return
        const getNamedAccountsResponse = await getNamedAccounts()
        deployer = (await getNamedAccounts()).deployer

        // deploys the
        await deployments.fixture(["all"])

        // getContract gets the most recent deployment

        // alternative: retuns accounts in hardhat.config network.accounts section
        // const accounts = await ethers.getSigners()
        //  const accountToUse = accounts[0]

        // must connnect the deployer from config
        fundMe = await ethers.getContract("FundMe", deployer)

        // QUESTION: WHAT IS THE DEPLOYER?

        // Deployer handles the deployment autonomously while you customize your chain. You yourself are in the driver's seat. You hit the gas, and you lunge off the starting line towards a brand new network, all without writing a single line of code.Oct 15, 2020
        // Get the Mock Contract that was deployed
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    describe("Constructor", async function () {
        // TO DO: WHY DOES THIS WORK?
        it("sets the aggregator address correctly", async function () {
            // fundMe.priceFeed --> priceFeed imports the mockV3Aggregator
            const response = await fundMe.priceFeed()

            // check that the
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("Fund", async function () {
        it("Fails if you don't send enough ETH", async function () {
            // https://ethereum-waffle.readthedocs.io/en/latest/matchers.html#revert
            await expect(fundMe.fund()).to.be.revertedWith(
                "Did not reach min. 1ETH fund"
            )
        })

        it("Updated the amount funded data structure", async function () {
            await fundMe.fund({ value: sendValue })

            const response = await fundMe.addressToAmountFunded(deployer)

            assert.equal(response.toString(), sendValue)
        })

        it("Adds funder to array of funders", async function () {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.funders(0)
            assert.equal(funder, deployer)
        })
    })

    // REVIEW THIS - IMPORTANT!!
    describe("Withdraw", async function () {
        // fund the contract
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })

        it("withdraws ETH from a single founder", async function () {
            // Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // How to get gas cost from transactionReceipt

            // cumulativeGasUsed: QUANTITY - The total amount of gas used when this transaction was executed in the block.
            // gasUsed: QUANTITY - The amount of gas used by this specific transaction alone.
            // const gasUsed = transactionReceipt.gasUsed
            // const effectiveGasPrice = transactionReceipt.effectiveGasPrice
            // cleaner: object destructuring
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            // Gas Payment = Gas Quantity * Gas Price
            const gasSpent = gasUsed.mul(effectiveGasPrice)
            // Assert
            assert.equal(endingFundMeBalance, 0)
            // Ending_Balance = Starting_Contract + Starting_Balance - Gas Fees
            assert.equal(
                startingFundMeBalance
                    .add(startingDeployerBalance)
                    .sub(gasSpent),
                endingDeployerBalance.toString()
            )
        })
    })
})