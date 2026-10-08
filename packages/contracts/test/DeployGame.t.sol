// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {DeployGame} from "../script/DeployGame.s.sol";
import {GameRuleFixtures} from "./helpers/GameRuleFixtures.sol";
import {SneakerArtRenderer} from "../src/SneakerArtRenderer.sol";
import {GameTestBase} from "./helpers/GameTestBase.sol";

contract DeployGameTest is GameTestBase, GameRuleFixtures {
    function test_InitialGameConfigEqualsTheSharedFixtureConfig() public {
        DeployGame deployScript = new DeployGame();

        assertEq(
            abi.encode(deployScript.buildInitialGameConfig()),
            abi.encode(parseFixtureGameConfig(readGameRuleFixtures()))
        );
    }

    function test_DeploysWithTheInitialGameConfig() public {
        assertEq(abi.encode(gameConfig), abi.encode(new DeployGame().buildInitialGameConfig()));
    }

    function test_DeploysNamedCollections() public view {
        assertEq(sneakerNft.name(), "StrideMon Sneaker");
        assertEq(sneakerNft.symbol(), "SNEAKER");
        assertEq(strideToken.name(), "Stride");
        assertEq(strideToken.symbol(), "STRIDE");
        assertEq(strideToken.decimals(), 18);
    }

    function test_WiresGameRolesToSneakerGame() public view {
        address sneakerGameAddress = address(sneakerGame);
        assertTrue(sneakerNft.hasRole(sneakerNft.GAME_ROLE(), sneakerGameAddress));
        assertTrue(strideToken.hasRole(strideToken.MINTER_ROLE(), sneakerGameAddress));
        assertTrue(strideToken.hasRole(strideToken.BURNER_ROLE(), sneakerGameAddress));
    }

    function test_GameServerHoldsOnlyGameServerRole() public view {
        assertTrue(sneakerGame.hasRole(sneakerGame.GAME_SERVER_ROLE(), gameServer));
        assertFalse(sneakerGame.hasRole(sneakerGame.DEFAULT_ADMIN_ROLE(), gameServer));
        assertFalse(sneakerGame.hasRole(sneakerGame.PAUSER_ROLE(), gameServer));
        assertFalse(sneakerNft.hasRole(sneakerNft.GAME_ROLE(), gameServer));
        assertFalse(strideToken.hasRole(strideToken.MINTER_ROLE(), gameServer));
        assertFalse(strideToken.hasRole(strideToken.BURNER_ROLE(), gameServer));
    }

    function test_DeploysTheFoundingPassAndWiresItIntoTheGame() public view {
        assertEq(foundingPass.name(), "StrideMon Founding Pass");
        assertEq(foundingPass.symbol(), "PASS");
        assertEq(address(sneakerGame.foundingPass()), address(foundingPass));
        assertEq(
            address(SneakerArtRenderer(address(sneakerNft.artRenderer())).foundingPass()),
            address(foundingPass)
        );
    }

    /// @dev security.md's role table (D-041, D-042).
    function test_GivesTheFoundingPassRolesToTheRightKeys() public view {
        assertTrue(foundingPass.hasRole(foundingPass.DEFAULT_ADMIN_ROLE(), deployer));
        assertTrue(foundingPass.hasRole(foundingPass.MINTER_ROLE(), gameServer));
        assertTrue(foundingPass.hasRole(foundingPass.RECOVERY_ROLE(), deployer));
        assertTrue(sneakerGame.hasRole(sneakerGame.RECOVERY_ROLE(), deployer));
        // The game server mints passes and Founder Sneakers, but never moves or administers them.
        assertFalse(foundingPass.hasRole(foundingPass.RECOVERY_ROLE(), gameServer));
        assertFalse(foundingPass.hasRole(foundingPass.DEFAULT_ADMIN_ROLE(), gameServer));
        assertFalse(sneakerGame.hasRole(sneakerGame.RECOVERY_ROLE(), gameServer));
        assertFalse(foundingPass.hasRole(foundingPass.MINTER_ROLE(), deployer));
    }

    function test_DeployerIsAdminAndPauserEverywhere() public view {
        assertTrue(sneakerGame.hasRole(sneakerGame.DEFAULT_ADMIN_ROLE(), deployer));
        assertTrue(sneakerGame.hasRole(sneakerGame.PAUSER_ROLE(), deployer));
        assertTrue(sneakerNft.hasRole(sneakerNft.DEFAULT_ADMIN_ROLE(), deployer));
        assertTrue(strideToken.hasRole(strideToken.DEFAULT_ADMIN_ROLE(), deployer));
    }
}
