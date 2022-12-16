// to switch addresses for different networks

// Polygon: https://docs.chain.link/data-feeds/price-feeds/addresses/?network=polygon

const networkConfig = {
    5: {
        name: "Goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
    137: {
        name: "Polygon",
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    },
}

// specify development chains
const developmentChains = ["hardhat", "localhost"]
// define constructor arguments for 00-deploy-mocks.js
const DECIMALS = 8
const INITIAL_ANSWER = 134400000000 // $1334 + 8 zeros

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
}
