// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {SneakerGame} from "../src/SneakerGame.sol";
import {SneakerNft} from "../src/SneakerNft.sol";
import {SoleToken} from "../src/SoleToken.sol";

/// @notice Readies the two demo wallets (D-033): wallet A gets enough SOLE for its Sneaker's
/// next upgrade plus a repair, and both wallets get MON for gas. Wallet B is only reported.
/// @dev Run through `scripts/prepare-demo-wallets`, which reads the addresses from
/// `deployments/10143.json`. Signs with `DEPLOYER_PRIVATE_KEY`. Running it again sends nothing.
contract PrepareDemoWallets is Script {
    uint256 public constant REPAIR_ALLOWANCE_WEI = 10e18;
    uint256 public constant MINIMUM_GAS_BALANCE_WEI = 0.5 ether;
    uint256 public constant TOPPED_UP_GAS_BALANCE_WEI = 1 ether;

    error DemoWalletHasNoSneaker(address walletAddress);
    error GasTopUpFailed(address walletAddress);

    /// @notice Entry point for `forge script`.
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        SneakerGame sneakerGame = SneakerGame(vm.envAddress("SNEAKER_GAME_ADDRESS"));
        SneakerNft sneakerNft = SneakerNft(vm.envAddress("SNEAKER_NFT_ADDRESS"));
        SoleToken soleToken = SoleToken(vm.envAddress("SOLE_TOKEN_ADDRESS"));
        address walletA = vm.envAddress("DEMO_WALLET_A_ADDRESS");
        address walletB = vm.envAddress("DEMO_WALLET_B_ADDRESS");

        if (sneakerNft.balanceOf(walletA) == 0) revert DemoWalletHasNoSneaker(walletA);
        uint256 walletATokenId = sneakerNft.tokenOfOwnerByIndex(walletA, 0);
        uint256 targetSoleBalanceWei =
            sneakerGame.quoteUpgradeCost(walletATokenId) + REPAIR_ALLOWANCE_WEI;

        vm.startBroadcast(deployerPrivateKey);
        topUpSole(soleToken, walletA, targetSoleBalanceWei, vm.addr(deployerPrivateKey));
        topUpGas(walletA);
        topUpGas(walletB);
        vm.stopBroadcast();

        logWallet("Wallet A", walletA, sneakerNft, soleToken);
        logWallet("Wallet B", walletB, sneakerNft, soleToken);
    }

    /// @dev The deployer holds `MINTER_ROLE` only for the length of this call.
    function topUpSole(
        SoleToken soleToken,
        address walletAddress,
        uint256 targetBalanceWei,
        address deployerAddress
    ) private {
        uint256 balanceWei = soleToken.balanceOf(walletAddress);
        if (balanceWei >= targetBalanceWei) return;

        bytes32 minterRole = soleToken.MINTER_ROLE();
        soleToken.grantRole(minterRole, deployerAddress);
        soleToken.mint(walletAddress, targetBalanceWei - balanceWei);
        soleToken.revokeRole(minterRole, deployerAddress);
    }

    function topUpGas(address walletAddress) private {
        uint256 balanceWei = walletAddress.balance;
        if (balanceWei >= MINIMUM_GAS_BALANCE_WEI) return;
        (bool isSent,) = walletAddress.call{value: TOPPED_UP_GAS_BALANCE_WEI - balanceWei}("");
        if (!isSent) revert GasTopUpFailed(walletAddress);
    }

    function logWallet(
        string memory label,
        address walletAddress,
        SneakerNft sneakerNft,
        SoleToken soleToken
    ) private view {
        console.log(label, walletAddress);
        console.log("  Sneakers:", sneakerNft.balanceOf(walletAddress));
        console.log("  SOLE:", formatEther(soleToken.balanceOf(walletAddress)));
        console.log("  MON:", formatEther(walletAddress.balance));
    }

    /// @dev Two decimals are enough to read a balance.
    function formatEther(uint256 amountWei) private pure returns (string memory) {
        uint256 hundredths = (amountWei % 1e18) / 1e16;
        return string.concat(
            vm.toString(amountWei / 1e18), hundredths < 10 ? ".0" : ".", vm.toString(hundredths)
        );
    }
}
