const { run } = require("hardhat")
async function verify(contractAddress, args) {
    console.log("Verifying contract...")

    try {
        console.log(contractAddress, args)
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (err) {
        if (err.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified!")
        } else {
            console.error(err)
        }
    }
}

module.exports = { verify }
