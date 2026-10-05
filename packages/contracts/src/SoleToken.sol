// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/// @title SoleToken
/// @notice SOLE, the reward token (18 decimals). `SneakerGame` mints it when an
/// activity session settles and burns it on repair and upgrade.
contract SoleToken is ERC20, ERC20Permit, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    /// @param name ERC-20 name (`Sole`), also the EIP-712 domain name for permits.
    /// @param symbol ERC-20 symbol (`SOLE`).
    /// @param admin Receives `DEFAULT_ADMIN_ROLE` (grants `MINTER_ROLE` and `BURNER_ROLE`).
    constructor(string memory name, string memory symbol, address admin)
        ERC20(name, symbol)
        ERC20Permit(name)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    /// @notice Mints SOLE.
    /// @param to Recipient.
    /// @param amount Amount in wei.
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /// @notice Burns SOLE from `account` without an allowance.
    /// @dev Unlike `ERC20Burnable.burnFrom`, the role is the authorization. The only
    /// burner, `SneakerGame`, only ever passes `msg.sender`, so players need no approve
    /// transaction and nobody can burn someone else's balance.
    /// @param account Account to burn from.
    /// @param amount Amount in wei.
    function burnFrom(address account, uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(account, amount);
    }
}
