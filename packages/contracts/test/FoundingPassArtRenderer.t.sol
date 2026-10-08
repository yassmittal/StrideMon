// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Test} from "forge-std/Test.sol";
import {FoundingPassArtRenderer} from "../src/FoundingPassArtRenderer.sol";
import {
    DesignLayers,
    LaceColor,
    PassRecord,
    Rarity
} from "../src/founding-pass-art/FoundingPassArtTypes.sol";
import {FoundingPassDesigns} from "../src/founding-pass-art/FoundingPassDesigns.sol";

contract FoundingPassArtRendererTest is Test {
    /// @dev Monad's contract size limit (MIP-2): 128 KB of runtime code.
    uint256 private constant MONAD_CONTRACT_SIZE_LIMIT_BYTES = 128 * 1024;
    /// @dev Monad runs an `eth_call` of up to 8.1M gas in its fast pool, and nodes allow 30M by
    /// default. One card should stay far inside both.
    uint256 private constant CARD_RENDER_GAS_BUDGET = 1_000_000;
    uint256 private constant TEMPLATE_COUNT = 10;
    /// @dev The Hiker: the tallest silhouette with the most points, so the largest card.
    uint256 private constant HIKER_TEMPLATE_INDEX = 9;
    uint256 private constant SAMPLE_DESIGN_NUMBER = 137;

    FoundingPassArtRenderer private renderer = new FoundingPassArtRenderer();

    mapping(bytes32 svgHash => bool isSeen) private isSvgSeen;
    mapping(bytes32 drawingHash => bool isSeen) private isDrawingSeen;
    mapping(bytes32 nameHash => bool isSeen) private isNameSeen;

    function test_RendersEveryDesignAsADifferentCardDrawingAndName() public {
        for (
            uint256 designNumber = 1;
            designNumber <= FoundingPassDesigns.DESIGN_COUNT;
            designNumber++
        ) {
            (bytes32 svgHash, bytes32 drawingHash, bytes32 nameHash) = this.hashDesign(designNumber);
            assertFalse(isSvgSeen[svgHash], "two cards are the same");
            // The drawing alone, unlaced and under one clip id: no two shoes look the same.
            assertFalse(isDrawingSeen[drawingHash], "two drawings are the same");
            assertFalse(isNameSeen[nameHash], "two names are the same");
            isSvgSeen[svgHash] = true;
            isDrawingSeen[drawingHash] = true;
            isNameSeen[nameHash] = true;
        }
    }

    /// @dev External, so each design is drawn in its own call frame and its memory is freed.
    function hashDesign(uint256 designNumber)
        external
        view
        returns (bytes32 svgHash, bytes32 drawingHash, bytes32 nameHash)
    {
        string memory svg = renderer.renderDesignPreviewSvg(designNumber);
        assertTrue(vm.contains(svg, "</svg>"));
        svgHash = keccak256(bytes(svg));
        drawingHash = keccak256(
            bytes(renderer.renderSneakerMarkup(renderer.readDesignLayers(designNumber), false, "x"))
        );
        nameHash = keccak256(bytes(renderer.readDesignName(designNumber)));
    }

    function test_DrawsTheAvailableCard() public view {
        string memory svg = renderer.renderDesignPreviewSvg(SAMPLE_DESIGN_NUMBER);

        assertContains(svg, ">FOUNDING PASS</text>");
        assertContains(svg, ">#0137</text>");
        assertContains(svg, string.concat(">", renderer.readDesignName(SAMPLE_DESIGN_NUMBER), "<"));
        assertContains(svg, unicode" · 1 OF 1</text>");
        assertContains(svg, '<clipPath id="pass137">');
        assertContains(svg, "<circle "); // eyelets: unlaced
        assertContains(svg, "M20 32h24"); // corner marks
        assertNotContains(svg, "FOUNDER");
        assertNotContains(svg, ">LACED<");
        assertNotContains(svg, "#C9971C");
    }

    function test_DrawsTheMintedCard() public view {
        string memory svg =
            renderer.renderPassSvg(SAMPLE_DESIGN_NUMBER, buildPassRecord(false, false));

        assertContains(svg, ">FOUNDER 042</text>");
        assertContains(svg, "<circle ");
        assertNotContains(svg, ">LACED<");
        assertNotContains(svg, "#C9971C");
    }

    function test_DrawsTheLacedCard() public view {
        string memory svg =
            renderer.renderPassSvg(SAMPLE_DESIGN_NUMBER, buildPassRecord(true, false));

        assertContains(svg, ">FOUNDER 042</text>");
        assertContains(svg, ">LACED</text>");
        assertContains(svg, 'stroke-width="6" stroke-linejoin="round"/>'); // the lace slats
        assertNotContains(svg, "<circle ");
        assertNotContains(svg, "#C9971C");
    }

    function test_DrawsTheGoldFrameInPlaceOfTheCornerMarks() public view {
        string memory svg =
            renderer.renderPassSvg(SAMPLE_DESIGN_NUMBER, buildPassRecord(true, true));

        assertContains(svg, 'stroke="#C9971C" stroke-width="14"');
        assertContains(svg, ">LACED</text>");
        assertNotContains(svg, "M20 32h24");
    }

    function test_PadsFounderNumbersToThreeDigits() public view {
        assertContains(
            renderer.renderPassSvg(1, PassRecord(7, false, false)), ">FOUNDER 007</text>"
        );
        assertContains(
            renderer.renderPassSvg(1, PassRecord(1000, false, false)), ">FOUNDER 1000</text>"
        );
    }

    function test_GivesEachTemplatesLegendaryItsHandPickedName() public view {
        string[TEMPLATE_COUNT] memory legendaryNames = [
            "Earthshine",
            "Afterglow",
            "Fogbow",
            "Fire Rainbow",
            "Glory",
            "Nacreous",
            "Moonbow",
            "Airglow",
            "Heat Lightning",
            "Sun Pillar"
        ];
        uint256 legendaryCount = 0;
        for (
            uint256 designNumber = 1;
            designNumber <= FoundingPassDesigns.DESIGN_COUNT;
            designNumber++
        ) {
            if (renderer.readDesignRarity(designNumber) != Rarity.Legendary) continue;
            uint256 templateIndex = renderer.readDesignLayers(designNumber).templateIndex;
            assertEq(renderer.readDesignName(designNumber), legendaryNames[templateIndex]);
            legendaryCount++;
        }
        assertEq(legendaryCount, TEMPLATE_COUNT);
    }

    function test_RevertsForADesignOutsideTheCollection() public {
        vm.expectRevert(
            abi.encodeWithSelector(FoundingPassArtRenderer.InvalidDesignNumber.selector, 0)
        );
        renderer.renderDesignPreviewSvg(0);
        vm.expectRevert(
            abi.encodeWithSelector(FoundingPassArtRenderer.InvalidDesignNumber.selector, 1001)
        );
        renderer.renderPassSvg(1001, buildPassRecord(false, false));
    }

    function testFuzz_RendersEveryDesignNumberInTheCollection(uint256 designNumber) public view {
        designNumber = bound(designNumber, 1, FoundingPassDesigns.DESIGN_COUNT);
        assertContains(renderer.renderDesignPreviewSvg(designNumber), "</svg>");
    }

    function testFuzz_RevertsForEveryDesignNumberPastTheCollection(uint256 designNumber) public {
        designNumber = bound(designNumber, FoundingPassDesigns.DESIGN_COUNT + 1, type(uint256).max);
        vm.expectRevert(
            abi.encodeWithSelector(
                FoundingPassArtRenderer.InvalidDesignNumber.selector, designNumber
            )
        );
        renderer.renderDesignPreviewSvg(designNumber);
    }

    function test_RevertsForLayersTheArtDataDoesNotHave() public {
        DesignLayers memory validLayers = renderer.readDesignLayers(1);

        DesignLayers memory unknownTemplate = renderer.readDesignLayers(1);
        unknownTemplate.templateIndex = uint8(TEMPLATE_COUNT);
        expectInvalidLayers(unknownTemplate);

        DesignLayers memory unknownFamily = renderer.readDesignLayers(1);
        unknownFamily.colorFamilyIndex = 14;
        expectInvalidLayers(unknownFamily);

        DesignLayers memory unknownColorway = renderer.readDesignLayers(1);
        unknownColorway.colorwayIndex = 10;
        expectInvalidLayers(unknownColorway);

        // Every template has at most four values in a slot.
        DesignLayers memory unknownOption = renderer.readDesignLayers(1);
        unknownOption.optionValueIndexes[0] = 4;
        expectInvalidLayers(unknownOption);

        assertContains(renderer.renderSneakerMarkup(validLayers, true, "valid"), 'id="valid"');
    }

    /// @dev Any layers inside the art data draw, including ones the collection doesn't use.
    function testFuzz_DrawsAnyCombinationOfLayers(
        uint8 templateIndex,
        uint8 colorFamilyIndex,
        uint8 colorwayIndex,
        uint8 laceColorIndex,
        bool isLaced
    ) public view {
        DesignLayers memory layers = DesignLayers({
            templateIndex: uint8(bound(templateIndex, 0, TEMPLATE_COUNT - 1)),
            colorFamilyIndex: uint8(bound(colorFamilyIndex, 0, 13)),
            colorwayIndex: uint8(bound(colorwayIndex, 0, 9)),
            // Every slot of every template has at least two values.
            optionValueIndexes: [uint8(1), 0, 1],
            laceColor: LaceColor(bound(laceColorIndex, 0, 3))
        });
        string memory markup = renderer.renderSneakerMarkup(layers, isLaced, "fuzz");
        assertContains(markup, '<clipPath id="fuzz">');
        assertContains(markup, 'stroke-width="18"'); // the outline
    }

    function test_DrawsALacedGoldFramedCardWithinTheGasBudget() public view {
        uint256 hikerDesignNumber = findDesignNumberWithTemplate(HIKER_TEMPLATE_INDEX);
        uint256 gasBefore = gasleft();
        renderer.renderPassSvg(hikerDesignNumber, PassRecord(1000, true, true));
        uint256 gasUsed = gasBefore - gasleft();

        assertLt(gasUsed, CARD_RENDER_GAS_BUDGET);
    }

    function test_FitsMonadsContractSizeLimit() public view {
        assertLt(address(renderer).code.length, MONAD_CONTRACT_SIZE_LIMIT_BYTES);
    }

    function findDesignNumberWithTemplate(uint256 templateIndex) private view returns (uint256) {
        for (
            uint256 designNumber = 1;
            designNumber <= FoundingPassDesigns.DESIGN_COUNT;
            designNumber++
        ) {
            if (renderer.readDesignLayers(designNumber).templateIndex == templateIndex) {
                return designNumber;
            }
        }
        revert("No design with that template");
    }

    function buildPassRecord(bool isLaced, bool hasGoldFrame)
        private
        pure
        returns (PassRecord memory)
    {
        return PassRecord({founderNumber: 42, hasGoldFrame: hasGoldFrame, isLaced: isLaced});
    }

    function expectInvalidLayers(DesignLayers memory layers) private {
        vm.expectRevert(FoundingPassArtRenderer.InvalidDesignLayers.selector);
        renderer.renderSneakerMarkup(layers, false, "invalid");
    }

    function assertContains(string memory text, string memory expectedPart) private pure {
        assertTrue(vm.contains(text, expectedPart), expectedPart);
    }

    function assertNotContains(string memory text, string memory unexpectedPart) private pure {
        assertFalse(vm.contains(text, unexpectedPart), unexpectedPart);
    }
}
