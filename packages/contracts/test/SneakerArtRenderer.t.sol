// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Test} from "forge-std/Test.sol";
import {FoundingPass} from "../src/FoundingPass.sol";
import {SneakerArtRenderer} from "../src/SneakerArtRenderer.sol";
import {SneakerAttributes} from "../src/SneakerNft.sol";

/// @notice Normal Sneakers (D-030). Founder Sneakers' pictures need a real pass, so they're
/// tested in SneakerGameFounderSneaker.t.sol.
contract SneakerArtRendererTest is Test {
    /// @dev 0 is a normal Sneaker, which never reads the pass.
    uint256 private constant NO_FOUNDING_PASS = 0;

    SneakerArtRenderer private sneakerArtRenderer =
        new SneakerArtRenderer(FoundingPass(address(0)));

    /// @dev D-042: normal Sneakers keep D-030's art byte for byte. The hashes are the art drawn
    /// by the renderer as deployed before Part 2 (rendered on a throwaway Anvil, 2026-10-08).
    function test_DrawsNormalSneakersExactlyAsBeforeFounderSneakers() public view {
        assertEq(
            hashSvg(4, 1, 100), 0x957dedcf8a7e832be64f60a3c013377e1425e872eaf751e2f2a5a9cab9073db0
        );
        assertEq(
            hashSvg(137, 2, 96), 0x6c0a84c184c58fc822da672c49ddebd34b8e98a255c301769974a0e614af1f67
        );
        assertEq(
            hashSvg(1, 30, 0), 0x93d3e8c69712595410b6e27a8390376b19ca79b826515633f38d5f7fca3d24de
        );
        assertEq(
            hashSvg(12_345, 7, 55),
            0xf63b528a3bdde0305ab9d8fc69a6eaa163288c549cced5f2b6829b9aac3d0845
        );
    }

    function test_DrawsAStarterSneaker() public view {
        string memory svg =
            sneakerArtRenderer.renderImageSvg(4, buildAttributes(1, 100), NO_FOUNDING_PASS);

        assertContains(svg, ">#0004</text>");
        assertContains(svg, ">01 / 30</text>");
        assertContains(svg, ">100 / 100</text>");
        assertContains(svg, 'width="320" height="2" fill="#C1FF00"'); // full durability bar
        assertContains(svg, 'stroke-opacity="1"'); // full-strength lime
        assertEq(countOccurrences(svg, "<rect x="), 30 + 2); // level ticks + durability bar
    }

    function test_ReflectsLevelAndDurability() public view {
        string memory starterSvg =
            sneakerArtRenderer.renderImageSvg(4, buildAttributes(1, 100), NO_FOUNDING_PASS);
        string memory wornSvg =
            sneakerArtRenderer.renderImageSvg(4, buildAttributes(2, 96), NO_FOUNDING_PASS);

        assertContains(wornSvg, ">02 / 30</text>");
        assertContains(wornSvg, ">096 / 100</text>");
        assertContains(wornSvg, 'width="307" height="2" fill="#C1FF00"');
        assertContains(wornSvg, 'stroke-opacity="0.97"');
        // Level 2 adds a second speed line.
        assertContains(wornSvg, 'd="M12 168h34M30 152h16"');
        assertFalse(keccak256(bytes(starterSvg)) == keccak256(bytes(wornSvg)));
    }

    function test_FadesTheLimeAndEmptiesTheBarAtZeroDurability() public view {
        string memory svg =
            sneakerArtRenderer.renderImageSvg(4, buildAttributes(30, 0), NO_FOUNDING_PASS);

        assertContains(svg, ">000 / 100</text>");
        assertContains(svg, 'width="0" height="2" fill="#C1FF00"');
        assertContains(svg, 'stroke-opacity="0.40"');
        assertContains(svg, ">30 / 30</text>");
    }

    function hashSvg(uint256 tokenId, uint16 level, uint16 durability)
        private
        view
        returns (bytes32)
    {
        return keccak256(
            bytes(
                sneakerArtRenderer.renderImageSvg(
                    tokenId, buildAttributes(level, durability), NO_FOUNDING_PASS
                )
            )
        );
    }

    function buildAttributes(uint16 level, uint16 durability)
        private
        pure
        returns (SneakerAttributes memory)
    {
        return SneakerAttributes({
            level: level,
            efficiency: 10,
            durability: durability,
            storedEnergy: 10,
            energyUpdatedAt: 0
        });
    }

    function assertContains(string memory text, string memory expectedPart) private pure {
        assertTrue(vm.contains(text, expectedPart), expectedPart);
    }

    function countOccurrences(string memory text, string memory part)
        private
        pure
        returns (uint256 occurrenceCount)
    {
        return vm.split(text, part).length - 1;
    }
}
