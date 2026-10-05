// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Test} from "forge-std/Test.sol";
import {SneakerArtRenderer} from "../src/SneakerArtRenderer.sol";
import {SneakerAttributes} from "../src/SneakerNft.sol";

contract SneakerArtRendererTest is Test {
    SneakerArtRenderer private sneakerArtRenderer = new SneakerArtRenderer();

    function test_DrawsAStarterSneaker() public view {
        string memory svg = sneakerArtRenderer.renderImageSvg(4, buildAttributes(1, 100));

        assertContains(svg, ">#0004</text>");
        assertContains(svg, ">01 / 30</text>");
        assertContains(svg, ">100 / 100</text>");
        assertContains(svg, 'width="320" height="2" fill="#C1FF00"'); // full durability bar
        assertContains(svg, 'stroke-opacity="1"'); // full-strength lime
        assertEq(countOccurrences(svg, "<rect x="), 30 + 2); // level ticks + durability bar
    }

    function test_ReflectsLevelAndDurability() public view {
        string memory starterSvg = sneakerArtRenderer.renderImageSvg(4, buildAttributes(1, 100));
        string memory wornSvg = sneakerArtRenderer.renderImageSvg(4, buildAttributes(2, 96));

        assertContains(wornSvg, ">02 / 30</text>");
        assertContains(wornSvg, ">096 / 100</text>");
        assertContains(wornSvg, 'width="307" height="2" fill="#C1FF00"');
        assertContains(wornSvg, 'stroke-opacity="0.97"');
        // Level 2 adds a second speed line.
        assertContains(wornSvg, 'd="M12 168h34M30 152h16"');
        assertFalse(keccak256(bytes(starterSvg)) == keccak256(bytes(wornSvg)));
    }

    function test_FadesTheLimeAndEmptiesTheBarAtZeroDurability() public view {
        string memory svg = sneakerArtRenderer.renderImageSvg(4, buildAttributes(30, 0));

        assertContains(svg, ">000 / 100</text>");
        assertContains(svg, 'width="0" height="2" fill="#C1FF00"');
        assertContains(svg, 'stroke-opacity="0.40"');
        assertContains(svg, ">30 / 30</text>");
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
