// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {GameConfig, GameMath} from "../src/libraries/GameMath.sol";
import {GameRuleFixtures} from "./helpers/GameRuleFixtures.sol";

contract GameMathTest is GameRuleFixtures {
    string private fixturesJson;
    GameConfig private gameConfig;

    function setUp() public {
        fixturesJson = readGameRuleFixtures();
        gameConfig = parseFixtureGameConfig(fixturesJson);
    }

    // ---------------------------------------------------------------------------------
    // Shared fixtures (the TypeScript mirror runs the same file)
    // ---------------------------------------------------------------------------------

    function test_MatchesEnergyFixtures() public view {
        uint256 caseCount = countFixtureCases(fixturesJson, "energy");
        assertGt(caseCount, 0, "no energy fixtures");
        for (uint256 caseIndex; caseIndex < caseCount; caseIndex++) {
            string memory caseName = readCaseName(fixturesJson, "energy", caseIndex);
            uint16 storedEnergy = uint16(readEnergyInput(caseIndex, "storedEnergy"));
            uint64 energyUpdatedAt = uint64(readEnergyInput(caseIndex, "energyUpdatedAt"));
            uint64 currentTimestamp = uint64(readEnergyInput(caseIndex, "currentTimestamp"));
            uint16 energySpent = uint16(readEnergyInput(caseIndex, "energySpent"));

            uint16 currentEnergy = GameMath.calculateCurrentEnergy(
                storedEnergy, energyUpdatedAt, currentTimestamp, gameConfig
            );
            (uint16 storedEnergyAfterSpending, uint64 energyUpdatedAtAfterSpending) = GameMath.calculateEnergyAfterSpending(
                storedEnergy, energyUpdatedAt, currentTimestamp, energySpent, gameConfig
            );

            assertEq(currentEnergy, readEnergyExpectation(caseIndex, "currentEnergy"), caseName);
            assertEq(
                storedEnergyAfterSpending,
                readEnergyExpectation(caseIndex, "storedEnergyAfterSpending"),
                caseName
            );
            assertEq(
                energyUpdatedAtAfterSpending,
                readEnergyExpectation(caseIndex, "energyUpdatedAtAfterSpending"),
                caseName
            );
        }
    }

    function test_MatchesSessionFixtures() public view {
        uint256 caseCount = countFixtureCases(fixturesJson, "session");
        assertGt(caseCount, 0, "no session fixtures");
        for (uint256 caseIndex; caseIndex < caseCount; caseIndex++) {
            string memory caseName = readCaseName(fixturesJson, "session", caseIndex);
            uint32 activeMinutes =
                uint32(readCaseUint(fixturesJson, "session", caseIndex, "input.activeMinutes"));
            uint16 currentEnergy =
                uint16(readCaseUint(fixturesJson, "session", caseIndex, "input.currentEnergy"));
            uint16 efficiency =
                uint16(readCaseUint(fixturesJson, "session", caseIndex, "input.efficiency"));
            uint16 durability =
                uint16(readCaseUint(fixturesJson, "session", caseIndex, "input.durability"));

            uint16 rewardedMinutes = GameMath.calculateRewardedMinutes(activeMinutes, currentEnergy);
            uint256 rewardAmountWei =
                GameMath.calculateSessionReward(rewardedMinutes, efficiency, gameConfig);
            uint16 durabilityLoss =
                GameMath.calculateDurabilityLoss(rewardedMinutes, durability, gameConfig);

            assertEq(
                rewardedMinutes,
                readCaseUint(fixturesJson, "session", caseIndex, "expect.rewardedMinutes"),
                caseName
            );
            assertEq(
                rewardAmountWei,
                readCaseUint(fixturesJson, "session", caseIndex, "expect.rewardAmountWei"),
                caseName
            );
            assertEq(
                durabilityLoss,
                readCaseUint(fixturesJson, "session", caseIndex, "expect.durabilityLoss"),
                caseName
            );
        }
    }

    function test_MatchesRepairFixtures() public view {
        uint256 caseCount = countFixtureCases(fixturesJson, "repair");
        assertGt(caseCount, 0, "no repair fixtures");
        for (uint256 caseIndex; caseIndex < caseCount; caseIndex++) {
            uint16 level = uint16(readCaseUint(fixturesJson, "repair", caseIndex, "input.level"));
            uint16 durability =
                uint16(readCaseUint(fixturesJson, "repair", caseIndex, "input.durability"));

            assertEq(
                GameMath.calculateRepairCost(level, durability, gameConfig),
                readCaseUint(fixturesJson, "repair", caseIndex, "expect.repairCostWei"),
                readCaseName(fixturesJson, "repair", caseIndex)
            );
        }
    }

    function test_MatchesUpgradeFixtures() public view {
        uint256 caseCount = countFixtureCases(fixturesJson, "upgrade");
        assertGt(caseCount, 0, "no upgrade fixtures");
        for (uint256 caseIndex; caseIndex < caseCount; caseIndex++) {
            uint16 level = uint16(readCaseUint(fixturesJson, "upgrade", caseIndex, "input.level"));

            assertEq(
                GameMath.calculateUpgradeCost(level, gameConfig),
                readCaseUint(fixturesJson, "upgrade", caseIndex, "expect.upgradeCostWei"),
                readCaseName(fixturesJson, "upgrade", caseIndex)
            );
        }
    }

    // ---------------------------------------------------------------------------------
    // Fuzz: energy regeneration
    // ---------------------------------------------------------------------------------

    function testFuzz_CurrentEnergyNeverExceedsMaxEnergy(
        uint16 storedEnergy,
        uint64 energyUpdatedAt,
        uint64 elapsedSeconds
    ) public view {
        storedEnergy = uint16(bound(storedEnergy, 0, gameConfig.maxEnergy));
        elapsedSeconds = uint64(bound(elapsedSeconds, 0, type(uint64).max - energyUpdatedAt));

        uint16 currentEnergy = GameMath.calculateCurrentEnergy(
            storedEnergy, energyUpdatedAt, energyUpdatedAt + elapsedSeconds, gameConfig
        );

        assertLe(currentEnergy, gameConfig.maxEnergy);
        assertGe(currentEnergy, storedEnergy);
    }

    function testFuzz_CurrentEnergyNeverDecreasesAsTimePasses(
        uint16 storedEnergy,
        uint64 energyUpdatedAt,
        uint32 earlierElapsedSeconds,
        uint32 extraElapsedSeconds
    ) public view {
        storedEnergy = uint16(bound(storedEnergy, 0, gameConfig.maxEnergy));
        energyUpdatedAt = uint64(bound(energyUpdatedAt, 0, type(uint64).max - 2 ** 33));
        uint64 earlierTimestamp = energyUpdatedAt + earlierElapsedSeconds;
        uint64 laterTimestamp = earlierTimestamp + extraElapsedSeconds;

        uint16 earlierEnergy = GameMath.calculateCurrentEnergy(
            storedEnergy, energyUpdatedAt, earlierTimestamp, gameConfig
        );
        uint16 laterEnergy = GameMath.calculateCurrentEnergy(
            storedEnergy, energyUpdatedAt, laterTimestamp, gameConfig
        );

        assertGe(laterEnergy, earlierEnergy);
    }

    function testFuzz_RegeneratesExactlyOnePointPerInterval(
        uint16 storedEnergy,
        uint64 energyUpdatedAt,
        uint16 intervalCount,
        uint32 partialIntervalSeconds
    ) public view {
        storedEnergy = uint16(bound(storedEnergy, 0, gameConfig.maxEnergy));
        energyUpdatedAt = uint64(bound(energyUpdatedAt, 0, type(uint32).max));
        uint256 partialSeconds =
            bound(partialIntervalSeconds, 0, gameConfig.energyRegenerationSeconds - 1);
        uint64 currentTimestamp = uint64(
            energyUpdatedAt + uint256(intervalCount) * gameConfig.energyRegenerationSeconds
                + partialSeconds
        );

        uint16 currentEnergy = GameMath.calculateCurrentEnergy(
            storedEnergy, energyUpdatedAt, currentTimestamp, gameConfig
        );

        uint256 expectedEnergy = uint256(storedEnergy) + intervalCount;
        if (expectedEnergy > gameConfig.maxEnergy) expectedEnergy = gameConfig.maxEnergy;
        assertEq(currentEnergy, expectedEnergy);
    }

    function testFuzz_SpendingKeepsPartialRegenerationProgress(
        uint16 storedEnergy,
        uint64 energyUpdatedAt,
        uint32 elapsedSeconds,
        uint16 energySpent
    ) public view {
        storedEnergy = uint16(bound(storedEnergy, 0, gameConfig.maxEnergy));
        energyUpdatedAt = uint64(bound(energyUpdatedAt, 0, type(uint32).max));
        uint64 currentTimestamp = energyUpdatedAt + elapsedSeconds;
        uint16 currentEnergy = GameMath.calculateCurrentEnergy(
            storedEnergy, energyUpdatedAt, currentTimestamp, gameConfig
        );
        energySpent = uint16(bound(energySpent, 0, currentEnergy));

        (uint16 storedEnergyAfterSpending, uint64 energyUpdatedAtAfterSpending) = GameMath.calculateEnergyAfterSpending(
            storedEnergy, energyUpdatedAt, currentTimestamp, energySpent, gameConfig
        );

        assertEq(storedEnergyAfterSpending, currentEnergy - energySpent, "spent energy is gone");
        assertLe(energyUpdatedAtAfterSpending, currentTimestamp, "anchor never passes now");
        assertEq(
            currentTimestamp - energyUpdatedAtAfterSpending,
            uint64(elapsedSeconds) % gameConfig.energyRegenerationSeconds,
            "only the partial interval carries over"
        );
        assertEq(
            GameMath.calculateCurrentEnergy(
                storedEnergyAfterSpending,
                energyUpdatedAtAfterSpending,
                currentTimestamp,
                gameConfig
            ),
            storedEnergyAfterSpending,
            "no energy is re-credited right after spending"
        );
    }

    // ---------------------------------------------------------------------------------
    // Fuzz: reward bounds
    // ---------------------------------------------------------------------------------

    function testFuzz_RewardedMinutesNeverExceedActiveMinutesOrEnergy(
        uint32 activeMinutes,
        uint16 currentEnergy
    ) public pure {
        uint16 rewardedMinutes = GameMath.calculateRewardedMinutes(activeMinutes, currentEnergy);

        assertLe(rewardedMinutes, activeMinutes);
        assertLe(rewardedMinutes, currentEnergy);
        assertTrue(rewardedMinutes == activeMinutes || rewardedMinutes == currentEnergy);
    }

    function testFuzz_RewardNeverExceedsOneFullEnergySession(
        uint32 activeMinutes,
        uint16 currentEnergy,
        uint16 efficiency
    ) public view {
        currentEnergy = uint16(bound(currentEnergy, 0, gameConfig.maxEnergy));

        uint16 rewardedMinutes = GameMath.calculateRewardedMinutes(activeMinutes, currentEnergy);
        uint256 rewardAmountWei =
            GameMath.calculateSessionReward(rewardedMinutes, efficiency, gameConfig);

        uint256 fullEnergySessionRewardWei =
            uint256(gameConfig.maxEnergy) * efficiency * gameConfig.rewardPerEfficiencyMinuteWei;
        assertLe(rewardAmountWei, fullEnergySessionRewardWei);
        assertEq(
            rewardAmountWei,
            uint256(rewardedMinutes) * efficiency * gameConfig.rewardPerEfficiencyMinuteWei
        );
    }

    function testFuzz_DurabilityLossNeverExceedsRemainingDurability(
        uint16 rewardedMinutes,
        uint16 durability
    ) public view {
        uint16 durabilityLoss = GameMath.calculateDurabilityLoss(
            rewardedMinutes, durability, gameConfig
        );

        assertLe(durabilityLoss, durability);
    }

    function testFuzz_RepairCostIsZeroOnlyAtFullDurability(uint16 level, uint16 durability)
        public
        view
    {
        level = uint16(bound(level, 1, gameConfig.maxLevel));
        durability = uint16(bound(durability, 0, gameConfig.maxDurability));

        uint256 repairCostWei = GameMath.calculateRepairCost(level, durability, gameConfig);

        assertEq(repairCostWei == 0, durability == gameConfig.maxDurability);
    }

    function readEnergyInput(uint256 caseIndex, string memory field)
        private
        view
        returns (uint256)
    {
        return readCaseUint(fixturesJson, "energy", caseIndex, string.concat("input.", field));
    }

    function readEnergyExpectation(uint256 caseIndex, string memory field)
        private
        view
        returns (uint256)
    {
        return readCaseUint(fixturesJson, "energy", caseIndex, string.concat("expect.", field));
    }
}
