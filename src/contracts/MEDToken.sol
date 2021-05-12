// SPDX-License-Identifier: MIT
pragma solidity >=0.7.4 <0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract MEDToken is ERC20 {
    address public minter;

    event MinterChanged(address indexed from, address to);

    constructor()
        public
        payable
        ERC20('Biomedical Research Reward Token', 'MED')
    {
        minter = msg.sender;
        _setupDecimals(0);
    }

    function setMinter(address _minter) public returns (bool) {
        require(
            msg.sender == minter,
            'Error: only minter can change minter address'
        );
        minter = _minter;

        emit MinterChanged(msg.sender, _minter);
        return true;
    }

    function mint(address payable account, uint256 amount) public {
        require(msg.sender == minter, 'Error: only minter can call mint()');
        _mint(account, amount);
    }
}
