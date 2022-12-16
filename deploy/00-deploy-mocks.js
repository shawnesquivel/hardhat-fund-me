const { network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    // const { deployer } = await getNamedAccounts
    const chainId = network.config.chainId

    // log(getNamedAccountsStuff)
    // If the network we specify in the terminal is included in the contract addresses we have on file

    if (chainId == 31337) {
        // if (developmentChain.includes(network.name)) {
        // log is similar to console.log
        log("Local network detected. Deploying mocks...")
        log(deployer)
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })

        log("00 Mocks was deployed!")
        log("-------------------------------------------")
    }
}

// tags is used run scripts with those tags in the terminal
module.exports.tags = ["all", "mocks"]
