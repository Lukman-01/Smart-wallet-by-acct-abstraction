// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import "./SimpleAccount.sol";

/// @title A Factory Contract for Creating SimpleAccount Instances
/// @notice This contract allows users to create and manage instances of SimpleAccount
/// @dev Uses OpenZeppelin's Create2 and ERC1967Proxy for deterministic address generation and proxy functionality
contract SimpleAccountFactory {
    /// @notice Address of the account implementation template
    /// @dev This is an immutable template used for creating new account instances
    SimpleAccount public immutable accountImplementation;

    /// @dev Mapping to keep track of balances added to different accounts
    mapping(address => uint) private balance;

    /// @notice Constructs the SimpleAccountFactory
    /// @param _entryPoint The entry point address used for initializing SimpleAccount instances
    constructor(IEntryPoint _entryPoint) {
        accountImplementation = new SimpleAccount(_entryPoint);
    }

    /// @notice Create a new SimpleAccount instance or return the address of an existing one
    /// @dev Deploys a new SimpleAccount proxy contract using the ERC1967Proxy pattern
    /// @param owner The owner address for the new SimpleAccount
    /// @param salt A unique salt for deterministic address generation
    /// @return ret The address of the newly created or existing SimpleAccount
    function createAccount(
        address owner,
        uint256 salt
    ) public returns (SimpleAccount ret) {
        address addr = getTheAddress(owner, salt);
        uint codeSize = addr.code.length;
        if (codeSize > 0) {
            return SimpleAccount(payable(addr));
        }
        ret = SimpleAccount(
            payable(
                new ERC1967Proxy{salt: bytes32(salt)}(
                    address(accountImplementation),
                    abi.encodeCall(SimpleAccount.initialize, (owner))
                )
            )
        );
    }

    /// @notice Computes the address of a SimpleAccount that would be created with the provided owner and salt
    /// @dev Uses the CREATE2 opcode for deterministic address generation
    /// @param owner The owner address to use in the computation
    /// @param salt The salt to use in the computation
    /// @return The computed address of the SimpleAccount
    function getTheAddress(
        address owner,
        uint256 salt
    ) public view returns (address) {
        return
            Create2.computeAddress(
                bytes32(salt),
                keccak256(
                    abi.encodePacked(
                        type(ERC1967Proxy).creationCode,
                        abi.encode(
                            address(accountImplementation),
                            abi.encodeCall(SimpleAccount.initialize, (owner))
                        )
                    )
                )
            );
    }

    /// @notice Add funds to a SimpleAccount's balance within this factory
    /// @dev Increases the balance mapping for the specified account
    /// @param account The address of the account to fund
    function fundWallet(address account) public payable {
        balance[account] += msg.value;
    }

    /// @notice Returns the balance associated with a SimpleAccount in this factory
    /// @param account The address of the account to query
    /// @return The balance of the specified account
    function balanceOf(address account) public view returns (uint256) {
        return balance[account];
    }
}
