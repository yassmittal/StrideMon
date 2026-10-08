// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {FoundingPassArtRenderer} from "../src/FoundingPassArtRenderer.sol";
import {
    DesignLayers,
    LaceColor,
    PassRecord
} from "../src/founding-pass-art/FoundingPassArtTypes.sol";
import {FoundingPassDesigns} from "../src/founding-pass-art/FoundingPassDesigns.sol";

string constant RENDERED_DIRECTORY = "art/founding-pass/rendered/";

/// @dev A card in any state: available (not minted), or minted with its pass record.
struct CardRequest {
    string fileName;
    uint256 designNumber;
    bool isMinted;
    uint256 founderNumber;
    bool hasGoldFrame;
    bool isLaced;
}

/// @dev A Sneaker on its own, from any valid combination of layers.
struct SneakerRequest {
    string fileName;
    uint256 templateIndex;
    uint256 colorFamilyIndex;
    uint256 colorwayIndex;
    uint256[] optionValueIndexes;
    uint256 laceColorIndex;
    bool isLaced;
    string clipPathId;
}

/// @notice Writes the Founding Pass art to disk from the Solidity renderer itself, so every
/// preview is exactly what goes on-chain (brief §4.2). Simulation only: it never starts a
/// broadcast, so it deploys and sends nothing, even with `--broadcast`.
/// @dev Run by `art/founding-pass/build-founding-pass-art.ts`. Writes every design's gallery card
/// to `designs/`, then the extra cards and Sneakers listed in `render-requests.json` (written by
/// the same build, for the review sheets) to `cards/` and `sneakers/`.
contract RenderPassArt is Script {
    string private constant CARD_REQUEST_TYPE =
        "CardRequest(string fileName,uint256 designNumber,bool isMinted,uint256 founderNumber,bool hasGoldFrame,bool isLaced)";
    string private constant SNEAKER_REQUEST_TYPE =
        "SneakerRequest(string fileName,uint256 templateIndex,uint256 colorFamilyIndex,uint256 colorwayIndex,uint256[] optionValueIndexes,uint256 laceColorIndex,bool isLaced,string clipPathId)";

    function run() external {
        PassArtFileWriter fileWriter = new PassArtFileWriter(new FoundingPassArtRenderer());
        string memory requestsJson =
            vm.readFile(string.concat(RENDERED_DIRECTORY, "render-requests.json"));
        CardRequest[] memory cardRequests = abi.decode(
            vm.parseJsonTypeArray(requestsJson, ".cards", CARD_REQUEST_TYPE), (CardRequest[])
        );
        SneakerRequest[] memory sneakerRequests = abi.decode(
            vm.parseJsonTypeArray(requestsJson, ".sneakers", SNEAKER_REQUEST_TYPE),
            (SneakerRequest[])
        );

        vm.createDir(string.concat(RENDERED_DIRECTORY, "designs/"), true);
        vm.createDir(string.concat(RENDERED_DIRECTORY, "cards/"), true);
        vm.createDir(string.concat(RENDERED_DIRECTORY, "sneakers/"), true);
        for (
            uint256 designNumber = 1;
            designNumber <= FoundingPassDesigns.DESIGN_COUNT;
            designNumber++
        ) {
            fileWriter.writeDesignCard(designNumber);
        }
        for (uint256 requestIndex = 0; requestIndex < cardRequests.length; requestIndex++) {
            fileWriter.writeRequestedCard(cardRequests[requestIndex]);
        }
        for (uint256 requestIndex = 0; requestIndex < sneakerRequests.length; requestIndex++) {
            fileWriter.writeRequestedSneaker(sneakerRequests[requestIndex]);
        }
        console.log("Design cards written:", FoundingPassDesigns.DESIGN_COUNT);
        console.log("Requested cards written:", cardRequests.length);
        console.log("Requested Sneakers written:", sneakerRequests.length);
    }
}

/// @notice Draws and writes one file per call. Each call is its own call frame, so its memory
/// is freed afterwards: drawn in one frame, a long run's SVGs would use up the EVM's memory.
contract PassArtFileWriter is Script {
    uint256 private constant DESIGN_NUMBER_DIGITS = 4;

    FoundingPassArtRenderer private immutable RENDERER;

    constructor(FoundingPassArtRenderer renderer) {
        RENDERER = renderer;
    }

    /// @notice `designs/0137.svg`: the design as the gallery shows it, available and unlaced.
    function writeDesignCard(uint256 designNumber) external {
        vm.writeFile(
            string.concat(RENDERED_DIRECTORY, "designs/", formatDesignNumber(designNumber), ".svg"),
            RENDERER.renderDesignPreviewSvg(designNumber)
        );
    }

    function writeRequestedCard(CardRequest calldata cardRequest) external {
        string memory svg = cardRequest.isMinted
            ? RENDERER.renderPassSvg(
                cardRequest.designNumber,
                PassRecord({
                    founderNumber: uint32(cardRequest.founderNumber),
                    hasGoldFrame: cardRequest.hasGoldFrame,
                    isLaced: cardRequest.isLaced
                })
            )
            : RENDERER.renderDesignPreviewSvg(cardRequest.designNumber);
        vm.writeFile(string.concat(RENDERED_DIRECTORY, "cards/", cardRequest.fileName, ".svg"), svg);
    }

    /// @notice Wrapped in its own 1000 × 600 `<svg>`, so the file opens on its own too.
    function writeRequestedSneaker(SneakerRequest calldata sneakerRequest) external {
        string memory markup = RENDERER.renderSneakerMarkup(
            toDesignLayers(sneakerRequest), sneakerRequest.isLaced, sneakerRequest.clipPathId
        );
        vm.writeFile(
            string.concat(RENDERED_DIRECTORY, "sneakers/", sneakerRequest.fileName, ".svg"),
            string.concat(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600">', markup, "</svg>"
            )
        );
    }

    function toDesignLayers(SneakerRequest calldata sneakerRequest)
        private
        pure
        returns (DesignLayers memory layers)
    {
        layers.templateIndex = uint8(sneakerRequest.templateIndex);
        layers.colorFamilyIndex = uint8(sneakerRequest.colorFamilyIndex);
        layers.colorwayIndex = uint8(sneakerRequest.colorwayIndex);
        for (uint256 slotIndex = 0; slotIndex < layers.optionValueIndexes.length; slotIndex++) {
            layers.optionValueIndexes[slotIndex] =
                uint8(sneakerRequest.optionValueIndexes[slotIndex]);
        }
        layers.laceColor = LaceColor(uint8(sneakerRequest.laceColorIndex));
    }

    function formatDesignNumber(uint256 designNumber) private pure returns (string memory) {
        string memory digits = vm.toString(designNumber);
        for (
            uint256 paddingIndex = bytes(digits).length;
            paddingIndex < DESIGN_NUMBER_DIGITS;
            paddingIndex++
        ) {
            digits = string.concat("0", digits);
        }
        return digits;
    }
}
