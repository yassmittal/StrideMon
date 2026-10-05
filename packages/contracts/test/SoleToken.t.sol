// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {Test} from "forge-std/Test.sol";
import {SoleToken} from "../src/SoleToken.sol";

contract SoleTokenTest is Test {
    uint256 private constant ONE_SOLE_WEI = 1e18;

    address private admin = makeAddr("admin");
    address private minter = makeAddr("minter");
    address private burner = makeAddr("burner");
    address private player = makeAddr("player");

    SoleToken private soleToken;

    function setUp() public {
        soleToken = new SoleToken("Sole", "SOLE", admin);
        vm.startPrank(admin);
        soleToken.grantRole(soleToken.MINTER_ROLE(), minter);
        soleToken.grantRole(soleToken.BURNER_ROLE(), burner);
        vm.stopPrank();
    }

    function test_ConstructorSetsNameSymbolDecimalsAndAdmin() public view {
        assertEq(soleToken.name(), "Sole");
        assertEq(soleToken.symbol(), "SOLE");
        assertEq(soleToken.decimals(), 18);
        assertTrue(soleToken.hasRole(soleToken.DEFAULT_ADMIN_ROLE(), admin));
    }

    function test_MinterMints() public {
        vm.prank(minter);
        soleToken.mint(player, 50 * ONE_SOLE_WEI);

        assertEq(soleToken.balanceOf(player), 50 * ONE_SOLE_WEI);
        assertEq(soleToken.totalSupply(), 50 * ONE_SOLE_WEI);
    }

    function test_RevertWhen_MintCalledWithoutMinterRole() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                player,
                soleToken.MINTER_ROLE()
            )
        );
        vm.prank(player);
        soleToken.mint(player, ONE_SOLE_WEI);
    }

    function test_BurnerBurnsWithoutAnAllowance() public {
        vm.prank(minter);
        soleToken.mint(player, 50 * ONE_SOLE_WEI);

        vm.prank(burner);
        soleToken.burnFrom(player, 20 * ONE_SOLE_WEI);

        assertEq(soleToken.allowance(player, burner), 0);
        assertEq(soleToken.balanceOf(player), 30 * ONE_SOLE_WEI);
        assertEq(soleToken.totalSupply(), 30 * ONE_SOLE_WEI);
    }

    function test_RevertWhen_BurnFromCalledWithoutBurnerRole() public {
        vm.prank(minter);
        soleToken.mint(player, 50 * ONE_SOLE_WEI);

        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                minter,
                soleToken.BURNER_ROLE()
            )
        );
        vm.prank(minter);
        soleToken.burnFrom(player, ONE_SOLE_WEI);
    }

    function test_RevertWhen_BurningMoreThanTheBalance() public {
        vm.prank(minter);
        soleToken.mint(player, ONE_SOLE_WEI);

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientBalance.selector,
                player,
                ONE_SOLE_WEI,
                2 * ONE_SOLE_WEI
            )
        );
        vm.prank(burner);
        soleToken.burnFrom(player, 2 * ONE_SOLE_WEI);
    }

    function test_PermitSetsAllowanceFromASignature() public {
        (address owner, uint256 ownerPrivateKey) = makeAddrAndKey("permitOwner");
        address spender = makeAddr("spender");
        uint256 deadline = block.timestamp + 1 hours;
        bytes32 permitStructHash = keccak256(
            abi.encode(
                keccak256(
                    "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
                ),
                owner,
                spender,
                ONE_SOLE_WEI,
                soleToken.nonces(owner),
                deadline
            )
        );
        bytes32 digest =
            keccak256(abi.encodePacked("\x19\x01", soleToken.DOMAIN_SEPARATOR(), permitStructHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, digest);

        soleToken.permit(owner, spender, ONE_SOLE_WEI, deadline, v, r, s);

        assertEq(soleToken.allowance(owner, spender), ONE_SOLE_WEI);
        assertEq(soleToken.nonces(owner), 1);
    }
}
