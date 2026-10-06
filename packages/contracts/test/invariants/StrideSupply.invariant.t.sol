// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {GameConfig} from "../../src/libraries/GameMath.sol";
import {SneakerAttributes} from "../../src/SneakerNft.sol";
import {GameTestBase} from "../helpers/GameTestBase.sol";
import {StrideSupplyHandler} from "./StrideSupplyHandler.sol";

contract StrideSupplyInvariantTest is GameTestBase {
    StrideSupplyHandler private handler;

    function setUp() public override {
        super.setUp();
        handler = new StrideSupplyHandler(sneakerGame, gameServer);
        targetContract(address(handler));
    }

    /// @notice STRIDE only enters through settlement and only leaves through repair and upgrade.
    function invariant_SupplyEqualsSettlementRewardsMinusBurns() public view {
        assertEq(
            strideToken.totalSupply(), handler.ghostMintedRewardWei() - handler.ghostBurnedCostWei()
        );
    }

    /// @notice Repair and upgrade burn only from `msg.sender`.
    function invariant_BurnsOnlyFromTheCaller() public view {
        assertFalse(handler.hasBurnedFromNonCaller());
    }

    /// @notice Every STRIDE is held by a player; nothing is minted to anyone else.
    function invariant_PlayersHoldTheWholeSupply() public view {
        uint256 heldByActorsWei;
        for (uint256 actorIndex; actorIndex < handler.actorCount(); actorIndex++) {
            heldByActorsWei += strideToken.balanceOf(handler.actors(actorIndex));
        }
        assertEq(heldByActorsWei, strideToken.totalSupply());
    }

    /// @notice Stats never leave their ranges, whatever the sequence of actions.
    function invariant_SneakerStatsStayInRange() public view {
        GameConfig memory currentGameConfig = sneakerGame.getGameConfig();
        for (uint256 tokenIndex; tokenIndex < handler.tokenCount(); tokenIndex++) {
            uint256 tokenId = handler.tokenIds(tokenIndex);
            SneakerAttributes memory attributes = sneakerNft.getAttributes(tokenId);
            assertGe(attributes.level, sneakerGame.STARTER_LEVEL());
            assertLe(attributes.level, currentGameConfig.maxLevel);
            assertLe(attributes.durability, currentGameConfig.maxDurability);
            assertLe(attributes.storedEnergy, currentGameConfig.maxEnergy);
            assertLe(attributes.energyUpdatedAt, block.timestamp);
            assertLe(sneakerGame.currentEnergy(tokenId), currentGameConfig.maxEnergy);
        }
    }
}
