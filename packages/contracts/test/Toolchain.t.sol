// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Test} from "forge-std/Test.sol";

/// @notice Placeholder until Phase 1: proves the compiler, forge-std and the
/// OpenZeppelin remapping all resolve.
contract ToolchainTest is Test {
    function test_OpenZeppelinIsImportable() public pure {
        assertEq(Strings.toString(uint256(42)), "42");
    }
}
