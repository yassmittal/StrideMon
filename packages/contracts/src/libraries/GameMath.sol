// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

/// @notice Every tunable number in the game. Initial values and formulas are in
/// `docs/architecture/game-rules.md`.
struct GameConfig {
    uint16 maxLevel;
    uint16 maxEnergy;
    uint16 maxDurability;
    uint16 starterEfficiency;
    uint16 efficiencyGainPerLevel;
    uint16 durabilityLossPerMinuteBasisPoints;
    uint32 energyRegenerationSeconds;
    uint256 rewardPerEfficiencyMinuteWei;
    uint256 repairCostPerPointWei;
    uint256 repairCostPerPointIncreasePerLevelWei;
    uint256 upgradeCostPerLevelWei;
}

/// @title GameMath
/// @notice Pure game formulas, mirrored in TypeScript by `packages/shared/src/game-rules`.
/// Both sides are tested against `game-rule-fixtures.json`.
library GameMath {
    uint256 internal constant BASIS_POINTS_DENOMINATOR = 10_000;

    /// @notice Energy available now, regenerated lazily from the stored value.
    /// @param storedEnergy Energy stored at `energyUpdatedAt`.
    /// @param energyUpdatedAt Timestamp (seconds) regeneration is counted from.
    /// @param currentTimestamp Timestamp (seconds) to evaluate at.
    /// @param config Game config supplying `maxEnergy` and `energyRegenerationSeconds`.
    /// @return currentEnergy `min(maxEnergy, storedEnergy + regeneratedPoints)`.
    function calculateCurrentEnergy(
        uint16 storedEnergy,
        uint64 energyUpdatedAt,
        uint64 currentTimestamp,
        GameConfig memory config
    ) internal pure returns (uint16 currentEnergy) {
        uint256 regeneratedPoints = calculateRegeneratedPoints(
            energyUpdatedAt, currentTimestamp, config
        );
        uint256 uncappedEnergy = uint256(storedEnergy) + regeneratedPoints;
        if (uncappedEnergy > config.maxEnergy) return config.maxEnergy;
        // casting to 'uint16' is safe because uncappedEnergy <= maxEnergy, a uint16
        // forge-lint: disable-next-line(unsafe-typecast)
        return uint16(uncappedEnergy);
    }

    /// @notice New stored energy and regeneration anchor after spending energy.
    /// @dev Reverts (arithmetic underflow) if `energySpent` exceeds the current energy.
    /// @param storedEnergy Energy stored at `energyUpdatedAt`.
    /// @param energyUpdatedAt Timestamp (seconds) regeneration is counted from.
    /// @param currentTimestamp Timestamp (seconds) of the spend.
    /// @param energySpent Energy points to spend.
    /// @param config Game config supplying `maxEnergy` and `energyRegenerationSeconds`.
    /// @return storedEnergyAfterSpending `currentEnergy - energySpent`.
    /// @return energyUpdatedAtAfterSpending The anchor advanced by the whole intervals credited.
    function calculateEnergyAfterSpending(
        uint16 storedEnergy,
        uint64 energyUpdatedAt,
        uint64 currentTimestamp,
        uint16 energySpent,
        GameConfig memory config
    )
        internal
        pure
        returns (uint16 storedEnergyAfterSpending, uint64 energyUpdatedAtAfterSpending)
    {
        uint16
            currentEnergy = calculateCurrentEnergy(
            storedEnergy, energyUpdatedAt, currentTimestamp, config
        );
        uint256 regeneratedPoints =
            calculateRegeneratedPoints(energyUpdatedAt, currentTimestamp, config);
        storedEnergyAfterSpending = currentEnergy - energySpent;
        // Advance by credited time, not to now, so partial regeneration progress isn't lost.
        // casting to 'uint64' is safe because the credited time never exceeds the elapsed time
        // forge-lint: disable-next-line(unsafe-typecast)
        uint64 creditedSeconds = uint64(regeneratedPoints * config.energyRegenerationSeconds);
        energyUpdatedAtAfterSpending = energyUpdatedAt + creditedSeconds;
    }

    /// @notice Minutes that earn a reward: active minutes capped by current energy.
    /// @param activeMinutes Minutes the API validated as active.
    /// @param currentEnergy Energy available at settlement.
    /// @return rewardedMinutes `min(activeMinutes, currentEnergy)`.
    function calculateRewardedMinutes(uint32 activeMinutes, uint16 currentEnergy)
        internal
        pure
        returns (uint16 rewardedMinutes)
    {
        if (activeMinutes >= currentEnergy) return currentEnergy;
        // casting to 'uint16' is safe because activeMinutes < currentEnergy, a uint16
        // forge-lint: disable-next-line(unsafe-typecast)
        return uint16(activeMinutes);
    }

    /// @notice STRIDE earned for a session.
    /// @param rewardedMinutes Minutes that earn a reward.
    /// @param efficiency The Sneaker's efficiency.
    /// @param config Game config supplying `rewardPerEfficiencyMinuteWei`.
    /// @return rewardAmountWei `rewardedMinutes × efficiency × rewardPerEfficiencyMinuteWei`.
    function calculateSessionReward(
        uint16 rewardedMinutes,
        uint16 efficiency,
        GameConfig memory config
    ) internal pure returns (uint256 rewardAmountWei) {
        return uint256(rewardedMinutes) * efficiency * config.rewardPerEfficiencyMinuteWei;
    }

    /// @notice Durability lost in a session, never more than the Sneaker has left.
    /// @param rewardedMinutes Minutes that earn a reward.
    /// @param durability The Sneaker's durability before the session.
    /// @param config Game config supplying `durabilityLossPerMinuteBasisPoints`.
    /// @return durabilityLoss `min(durability, ceil(rewardedMinutes × lossBasisPoints / 10_000))`.
    function calculateDurabilityLoss(
        uint16 rewardedMinutes,
        uint16 durability,
        GameConfig memory config
    ) internal pure returns (uint16 durabilityLoss) {
        uint256 lossTimesDenominator =
            uint256(rewardedMinutes) * config.durabilityLossPerMinuteBasisPoints;
        uint256 uncappedLoss =
            (lossTimesDenominator + BASIS_POINTS_DENOMINATOR - 1) / BASIS_POINTS_DENOMINATOR;
        if (uncappedLoss > durability) return durability;
        // casting to 'uint16' is safe because uncappedLoss <= durability, a uint16
        // forge-lint: disable-next-line(unsafe-typecast)
        return uint16(uncappedLoss);
    }

    /// @notice STRIDE burned to restore durability to `maxDurability`.
    /// @param level The Sneaker's level.
    /// @param durability The Sneaker's durability.
    /// @param config Game config supplying `maxDurability` and the repair prices.
    /// @return repairCostWei `(maxDurability − durability) × repairCostPerPoint(level)`, 0 when full.
    function calculateRepairCost(uint16 level, uint16 durability, GameConfig memory config)
        internal
        pure
        returns (uint256 repairCostWei)
    {
        if (durability >= config.maxDurability) return 0;
        uint256 missingDurability = config.maxDurability - durability;
        uint256 repairCostPerPointWei = config.repairCostPerPointWei + uint256(level - 1)
            * config.repairCostPerPointIncreasePerLevelWei;
        return missingDurability * repairCostPerPointWei;
    }

    /// @notice STRIDE burned to upgrade a Sneaker from `level` to `level + 1`.
    /// @param level The Sneaker's current level.
    /// @param config Game config supplying `upgradeCostPerLevelWei`.
    /// @return upgradeCostWei `upgradeCostPerLevelWei × level`.
    function calculateUpgradeCost(uint16 level, GameConfig memory config)
        internal
        pure
        returns (uint256 upgradeCostWei)
    {
        return config.upgradeCostPerLevelWei * level;
    }

    /// @notice Whole regeneration intervals elapsed since `energyUpdatedAt` (uncapped).
    /// @param energyUpdatedAt Timestamp (seconds) regeneration is counted from.
    /// @param currentTimestamp Timestamp (seconds) to evaluate at.
    /// @param config Game config supplying `energyRegenerationSeconds`.
    /// @return regeneratedPoints `(currentTimestamp − energyUpdatedAt) / energyRegenerationSeconds`.
    function calculateRegeneratedPoints(
        uint64 energyUpdatedAt,
        uint64 currentTimestamp,
        GameConfig memory config
    ) internal pure returns (uint256 regeneratedPoints) {
        return (currentTimestamp - energyUpdatedAt) / config.energyRegenerationSeconds;
    }
}
