// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.29;

import {Script, console} from "forge-std/Script.sol";
import {TSender} from "src/t-sender.sol";
import {Token} from "src/token.sol";

contract Deployer is Script {
    function run() external returns (TSender, Token) {
        vm.startBroadcast();

        TSender tsender = new TSender();
        Token token = new Token();

        console.log("tsender address: ", address(tsender));
        console.log("token address: ", address(token));

        token.mint(msg.sender, 100 ether);

        console.log(msg.sender, " balance is ", token.balanceOf(msg.sender));

        vm.stopBroadcast();

        return (tsender, token);
    }
}
