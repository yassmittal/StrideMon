// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {Test} from "forge-std/Test.sol";
import {StrideToken} from "../src/StrideToken.sol";

contract StrideTokenTest is Test {
    uint256 private constant ONE_STRIDE_WEI = 1e18;

    address private admin = makeAddr("admin");
    address private minter = makeAddr("minter");
    address private burner = makeAddr("burner");
    address private player = makeAddr("player");

    StrideToken private strideToken;

    function setUp() public {
        strideToken = new StrideToken("Stride", "STRIDE", admin);
        vm.startPrank(admin);
        strideToken.grantRole(strideToken.MINTER_ROLE(), minter);
        strideToken.grantRole(strideToken.BURNER_ROLE(), burner);
        vm.stopPrank();
    }

    function test_ConstructorSetsNameSymbolDecimalsAndAdmin() public view {
        assertEq(strideToken.name(), "Stride");
        assertEq(strideToken.symbol(), "STRIDE");
        assertEq(strideToken.decimals(), 18);
        assertTrue(strideToken.hasRole(strideToken.DEFAULT_ADMIN_ROLE(), admin));
    }

    function test_MinterMints() public {
        vm.prank(minter);
        strideToken.mint(player, 50 * ONE_STRIDE_WEI);

        assertEq(strideToken.balanceOf(player), 50 * ONE_STRIDE_WEI);
        assertEq(strideToken.totalSupply(), 50 * ONE_STRIDE_WEI);
    }

    function test_RevertWhen_MintCalledWithoutMinterRole() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                player,
                strideToken.MINTER_ROLE()
            )
        );
        vm.prank(player);
        strideToken.mint(player, ONE_STRIDE_WEI);
    }

    function test_BurnerBurnsWithoutAnAllowance() public {
        vm.prank(minter);
        strideToken.mint(player, 50 * ONE_STRIDE_WEI);

        vm.prank(burner);
        strideToken.burnFrom(player, 20 * ONE_STRIDE_WEI);

        assertEq(strideToken.allowance(player, burner), 0);
        assertEq(strideToken.balanceOf(player), 30 * ONE_STRIDE_WEI);
        assertEq(strideToken.totalSupply(), 30 * ONE_STRIDE_WEI);
    }

    function test_RevertWhen_BurnFromCalledWithoutBurnerRole() public {
        vm.prank(minter);
        strideToken.mint(player, 50 * ONE_STRIDE_WEI);

        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                minter,
                strideToken.BURNER_ROLE()
            )
        );
        vm.prank(minter);
        strideToken.burnFrom(player, ONE_STRIDE_WEI);
    }

    function test_RevertWhen_BurningMoreThanTheBalance() public {
        vm.prank(minter);
        strideToken.mint(player, ONE_STRIDE_WEI);

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientBalance.selector,
                player,
                ONE_STRIDE_WEI,
                2 * ONE_STRIDE_WEI
            )
        );
        vm.prank(burner);
        strideToken.burnFrom(player, 2 * ONE_STRIDE_WEI);
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
                ONE_STRIDE_WEI,
                strideToken.nonces(owner),
                deadline
            )
        );
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", strideToken.DOMAIN_SEPARATOR(), permitStructHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, digest);

        strideToken.permit(owner, spender, ONE_STRIDE_WEI, deadline, v, r, s);

        assertEq(strideToken.allowance(owner, spender), ONE_STRIDE_WEI);
        assertEq(strideToken.nonces(owner), 1);
    }
}
