// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.29;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor() ERC20("Meta Token", "MT") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
