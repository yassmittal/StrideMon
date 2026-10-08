// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {FoundingPass, IFoundingPassArtRenderer} from "../src/FoundingPass.sol";
import {FoundingPassArtRenderer} from "../src/FoundingPassArtRenderer.sol";
import {
    DesignLayers,
    LaceColor,
    PassRecord
} from "../src/founding-pass-art/FoundingPassArtTypes.sol";
import {FoundingPassDesigns} from "../src/founding-pass-art/FoundingPassDesigns.sol";
import {SneakerArtRenderer} from "../src/SneakerArtRenderer.sol";
import {SneakerAttributes} from "../src/SneakerNft.sol";

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

/// @dev A Sneaker's picture as `SneakerNft.imageSvg` returns it (D-042): a Founder Sneaker in
/// design `designNumber` with the pass record it would have, or a normal Sneaker when it's 0.
struct SneakerPictureRequest {
    string fileName;
    uint256 designNumber;
    uint256 sneakerTokenId;
    uint256 level;
    uint256 durability;
    bool isLaced;
    bool hasGoldFrame;
}

/// @notice Writes the Founding Pass art to disk from the Solidity renderer itself, so every
/// preview is exactly what goes on-chain (brief §4.2). Simulation only: it never starts a
/// broadcast, so it deploys and sends nothing, even with `--broadcast`.
/// @dev Run by `art/founding-pass/build-founding-pass-art.ts`. Writes every design's gallery card
/// to `designs/`, then the extra cards, Sneakers and Sneaker pictures listed in
/// `render-requests.json` (written by the same build, for the sheets) to `cards/`, `sneakers/`
/// and `sneaker-pictures/`.
contract RenderPassArt is Script {
    string private constant CARD_REQUEST_TYPE =
        "CardRequest(string fileName,uint256 designNumber,bool isMinted,uint256 founderNumber,bool hasGoldFrame,bool isLaced)";
    string private constant SNEAKER_REQUEST_TYPE =
        "SneakerRequest(string fileName,uint256 templateIndex,uint256 colorFamilyIndex,uint256 colorwayIndex,uint256[] optionValueIndexes,uint256 laceColorIndex,bool isLaced,string clipPathId)";
    string private constant SNEAKER_PICTURE_REQUEST_TYPE =
        "SneakerPictureRequest(string fileName,uint256 designNumber,uint256 sneakerTokenId,uint256 level,uint256 durability,bool isLaced,bool hasGoldFrame)";

    function run() external {
        FoundingPassArtRenderer passArtRenderer = new FoundingPassArtRenderer();
        PreviewFoundingPass previewFoundingPass = new PreviewFoundingPass(passArtRenderer);
        PassArtFileWriter fileWriter = new PassArtFileWriter(
            passArtRenderer,
            previewFoundingPass,
            new SneakerArtRenderer(FoundingPass(address(previewFoundingPass)))
        );
        string memory requestsJson =
            vm.readFile(string.concat(RENDERED_DIRECTORY, "render-requests.json"));
        CardRequest[] memory cardRequests = abi.decode(
            vm.parseJsonTypeArray(requestsJson, ".cards", CARD_REQUEST_TYPE), (CardRequest[])
        );
        SneakerRequest[] memory sneakerRequests = abi.decode(
            vm.parseJsonTypeArray(requestsJson, ".sneakers", SNEAKER_REQUEST_TYPE),
            (SneakerRequest[])
        );
        SneakerPictureRequest[] memory sneakerPictureRequests = abi.decode(
            vm.parseJsonTypeArray(requestsJson, ".sneakerPictures", SNEAKER_PICTURE_REQUEST_TYPE),
            (SneakerPictureRequest[])
        );

        vm.createDir(string.concat(RENDERED_DIRECTORY, "designs/"), true);
        vm.createDir(string.concat(RENDERED_DIRECTORY, "cards/"), true);
        vm.createDir(string.concat(RENDERED_DIRECTORY, "sneakers/"), true);
        vm.createDir(string.concat(RENDERED_DIRECTORY, "sneaker-pictures/"), true);
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
        for (
            uint256 requestIndex = 0; requestIndex < sneakerPictureRequests.length; requestIndex++) {
            fileWriter.writeRequestedSneakerPicture(sneakerPictureRequests[requestIndex]);
        }
        console.log("Design cards written:", FoundingPassDesigns.DESIGN_COUNT);
        console.log("Requested cards written:", cardRequests.length);
        console.log("Requested Sneakers written:", sneakerRequests.length);
        console.log("Requested Sneaker pictures written:", sneakerPictureRequests.length);
    }
}

/// @notice Stands in for `FoundingPass` in the previews, so a Founder Sneaker can be drawn with
/// any pass record (a gold frame can't be chosen at a real mint). `SneakerArtRenderer` reads
/// only `passOf` and `artRenderer`, which this answers the same way. Simulation only.
contract PreviewFoundingPass {
    IFoundingPassArtRenderer public immutable artRenderer;

    mapping(uint256 tokenId => PassRecord passRecord) private passRecordByTokenId;

    constructor(IFoundingPassArtRenderer passArtRenderer) {
        artRenderer = passArtRenderer;
    }

    function setPassRecord(uint256 tokenId, PassRecord calldata passRecord) external {
        passRecordByTokenId[tokenId] = passRecord;
    }

    function passOf(uint256 tokenId) external view returns (PassRecord memory) {
        return passRecordByTokenId[tokenId];
    }
}

/// @notice Draws and writes one file per call. Each call is its own call frame, so its memory
/// is freed afterwards: drawn in one frame, a long run's SVGs would use up the EVM's memory.
contract PassArtFileWriter is Script {
    uint256 private constant DESIGN_NUMBER_DIGITS = 4;

    /// @dev The founder number a previewed Founder Sneaker's pass gets: the picture doesn't show it.
    uint32 private constant PREVIEW_FOUNDER_NUMBER = 42;
    uint16 private constant PREVIEW_EFFICIENCY = 10;
    uint16 private constant PREVIEW_ENERGY = 10;

    FoundingPassArtRenderer private immutable RENDERER;
    PreviewFoundingPass private immutable PREVIEW_FOUNDING_PASS;
    SneakerArtRenderer private immutable SNEAKER_ART_RENDERER;

    constructor(
        FoundingPassArtRenderer renderer,
        PreviewFoundingPass previewFoundingPass,
        SneakerArtRenderer sneakerArtRenderer
    ) {
        RENDERER = renderer;
        PREVIEW_FOUNDING_PASS = previewFoundingPass;
        SNEAKER_ART_RENDERER = sneakerArtRenderer;
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

    /// @notice `sneaker-pictures/<file>.svg`: exactly what `SneakerNft.imageSvg` would return.
    function writeRequestedSneakerPicture(SneakerPictureRequest calldata pictureRequest) external {
        if (pictureRequest.designNumber != 0) {
            PREVIEW_FOUNDING_PASS.setPassRecord(
                pictureRequest.designNumber,
                PassRecord({
                    founderNumber: PREVIEW_FOUNDER_NUMBER,
                    hasGoldFrame: pictureRequest.hasGoldFrame,
                    isLaced: pictureRequest.isLaced
                })
            );
        }
        SneakerAttributes memory attributes = SneakerAttributes({
            level: uint16(pictureRequest.level),
            efficiency: PREVIEW_EFFICIENCY,
            durability: uint16(pictureRequest.durability),
            storedEnergy: PREVIEW_ENERGY,
            energyUpdatedAt: 0
        });
        vm.writeFile(
            string.concat(RENDERED_DIRECTORY, "sneaker-pictures/", pictureRequest.fileName, ".svg"),
            SNEAKER_ART_RENDERER.renderImageSvg(
                pictureRequest.sneakerTokenId, attributes, pictureRequest.designNumber
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
