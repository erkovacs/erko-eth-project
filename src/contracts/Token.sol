// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    address public minter;

    event MinterChanged(address indexed from, address to);

    constructor()
        public
        payable
        ERC20("Biomedical Research Reward Token", "MED")
    {
        minter = msg.sender;
    }

    function setMinter(address _minter) public returns (bool) {
        require(
            msg.sender == minter,
            "Error: only minter can change minter address"
        );
        minter = _minter;

        emit MinterChanged(msg.sender, _minter);
        return true;
    }

    function mint(address account, uint256 amount) public {
        require(msg.sender == minter, "Error: only minter can call mint()");
        _mint(account, amount);
    }
}
