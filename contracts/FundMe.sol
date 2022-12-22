// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

// Imports the Price converter and attach to uint256

import "./PriceConverter.sol";
import "hardhat/console.sol";

error FundMe__NotOwner();

// interfaces, libraries, contracts

/** @title A contract for crowd funding
 * @author Shawn Esquivel
 * @notice This contract demos a sample funding contract
 * @dev This implements price feeds as our library
 */

contract FundMe {
    // Type Declarations
    using PriceConverter for uint256;

    // State Variables
    mapping(address => uint256) public s_addressToAmountFunded;
    address[] public s_funders;
    address public immutable i_owner;
    AggregatorV3Interface public s_priceFeed;
    uint256 public constant MIN_USD = 0.02 * 1e18;

    // modifier - extract one line to a single keyword
    modifier onlyOwner() {
        // require(msg.sender == i_owner, "Sender is not the owner!!");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _; // do the rest of the code, must be BELOW require
    }

    // gets called immediately w hen you run FundMe
    constructor(address priceFeedAddress) {
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
        i_owner = msg.sender; //whoever deploys the contract
        console.log("The contract is deployed by:", msg.sender);
    }

    // Special functions - 1 max - receive() & fallback()
    // Not Essential
    // receive() external payable {
    //     fund();
    // }

    // fallback() external payable {
    //     fund();
    // }

    /**
     * @notice This function funds this contract
     * @dev This implements price feeds as our library
     */
    function fund() public payable {
        // to get the $ amount -> msg.value;

        // Use decentralized oracle net (ChainLink) to convert USD to ETH

        // 1*10^18 gwei = 1 ETH
        // require (getConversionRate(msg.value) >= MIN_USD, "Did not reach min. 1ETH fund");
        require(
            msg.value.getConversionRate(s_priceFeed) >= MIN_USD,
            "Did not reach min. 1ETH fund"
        );

        // revert - undoes any actions and sends gas back
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        // reset array
        s_funders = new address[](0);

        // withdraw funds
        // transfer
        // payable(msg.sender).transfer(address(this).balance);

        // call -
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Sorry the call failed");

        // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Sorry, the send failed");
    }

    function chaeperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }
}
