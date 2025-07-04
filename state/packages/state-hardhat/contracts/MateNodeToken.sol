// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// 铸币合约
contract MateNodeToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 100000000 * (10 ** 18);

    constructor(
        uint256 initialSupply
    ) ERC20("MateNodeToken", "MTK") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * (10 ** decimals())); // 明确处理小数位
    }

    // 增发奖励代币（仅Owner）
    function mint(address to, uint256 amount) public onlyOwner {
        amount = amount * (10 ** decimals()); // 明确处理小数位
        require(to != address(0), "Invalid address");
        require(amount > 0, "Amount must be greater than zero");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
}
