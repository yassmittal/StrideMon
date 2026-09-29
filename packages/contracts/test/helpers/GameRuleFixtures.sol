// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Test} from "forge-std/Test.sol";
import {GameConfig} from "../../src/libraries/GameMath.sol";

/// @notice Reads `packages/shared/src/game-rules/game-rule-fixtures.json`, the test
/// vectors shared with the TypeScript mirror.
abstract contract GameRuleFixtures is Test {
    string internal constant GAME_RULE_FIXTURES_PATH =
        "../shared/src/game-rules/game-rule-fixtures.json";

    function readGameRuleFixtures() internal view returns (string memory) {
        return vm.readFile(GAME_RULE_FIXTURES_PATH);
    }

    function parseFixtureGameConfig(string memory fixturesJson)
        internal
        pure
        returns (GameConfig memory)
    {
        return GameConfig({
            maxLevel: uint16(readConfigValue(fixturesJson, "maxLevel")),
            maxEnergy: uint16(readConfigValue(fixturesJson, "maxEnergy")),
            maxDurability: uint16(readConfigValue(fixturesJson, "maxDurability")),
            starterEfficiency: uint16(readConfigValue(fixturesJson, "starterEfficiency")),
            efficiencyGainPerLevel: uint16(readConfigValue(fixturesJson, "efficiencyGainPerLevel")),
            durabilityLossPerMinuteBasisPoints: uint16(
                readConfigValue(fixturesJson, "durabilityLossPerMinuteBasisPoints")
            ),
            energyRegenerationSeconds: uint32(
                readConfigValue(fixturesJson, "energyRegenerationSeconds")
            ),
            rewardPerEfficiencyMinuteWei: readConfigValue(
                fixturesJson, "rewardPerEfficiencyMinuteWei"
            ),
            repairCostPerPointWei: readConfigValue(fixturesJson, "repairCostPerPointWei"),
            repairCostPerPointIncreasePerLevelWei: readConfigValue(
                fixturesJson, "repairCostPerPointIncreasePerLevelWei"
            ),
            upgradeCostPerLevelWei: readConfigValue(fixturesJson, "upgradeCostPerLevelWei")
        });
    }

    function countFixtureCases(string memory fixturesJson, string memory formula)
        internal
        view
        returns (uint256 caseCount)
    {
        while (vm.keyExistsJson(fixturesJson, buildCasePath(formula, caseCount))) {
            caseCount++;
        }
    }

    /// @dev Works for JSON numbers and for decimal strings (wei amounts).
    function readCaseUint(
        string memory fixturesJson,
        string memory formula,
        uint256 caseIndex,
        string memory field
    ) internal pure returns (uint256) {
        return vm.parseJsonUint(
            fixturesJson, string.concat(buildCasePath(formula, caseIndex), ".", field)
        );
    }

    function readCaseName(string memory fixturesJson, string memory formula, uint256 caseIndex)
        internal
        pure
        returns (string memory)
    {
        return
            vm.parseJsonString(
                fixturesJson, string.concat(buildCasePath(formula, caseIndex), ".name")
            );
    }

    function readConfigValue(string memory fixturesJson, string memory field)
        private
        pure
        returns (uint256)
    {
        return vm.parseJsonUint(fixturesJson, string.concat(".gameConfig.", field));
    }

    function buildCasePath(string memory formula, uint256 caseIndex)
        private
        pure
        returns (string memory)
    {
        return string.concat(".", formula, "[", vm.toString(caseIndex), "]");
    }
}
