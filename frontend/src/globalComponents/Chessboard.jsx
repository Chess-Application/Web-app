import { useState, useEffect } from "react";

import "../styles/chessboard.css";
import Square from "./Square";

import { clearSquaresStyling, getRank, getFile } from "../utils/boardUtils.js";
import { fetchLegalMoves, fetchMoveIsValid } from "../utils/apiUtils.js";
import { capitaliseFirstLetter } from "../utils/generalUtils.js";

import {
    whiteKingsideCastlingSquare,
    blackKingsideCastlingSquare,
    whiteQueensideCastlingSquare,
    blackQueensideCastlingSquare,
} from "../constants/castlingSquares.js";

function Chessboard({ parsed_fen_string, orientation }) {
    const [previousClickedSquare, setPreviousClickedSquare] = useState(null);
    const [clickedSquare, setClickedSquare] = useState(null);
    const [parsedFENString, setParsedFENString] = useState(parsed_fen_string);

    const [draggedSquare, setDraggedSquare] = useState(null);
    const [droppedSquare, setDroppedSquare] = useState(null);

    const [previousDraggedSquare, setPreviousDraggedSquare] = useState(null);
    const [previousDroppedSquare, setPreviousDroppedSquare] = useState(null);
    const [promotionCapturedPiece, setPromotionCapturedPiece] = useState(null);

    useEffect(() => {
        setParsedFENString(parsed_fen_string);
    }, [parsed_fen_string]);

    useEffect(() => {
        handleClickToMove();
    }, [previousClickedSquare, clickedSquare]);

    useEffect(() => {
        handleOnDrop();
    }, [draggedSquare, droppedSquare]);

    async function handleOnDrop() {
        clearSquaresStyling();

        if (!(draggedSquare && droppedSquare)) {
            if (!draggedSquare) {
                return;
            }

            const boardPlacement = parsedFENString["board_placement"];
            const squareInfo = boardPlacement[`${draggedSquare}`];
            const pieceType = squareInfo["piece_type"];
            const pieceColor = squareInfo["piece_color"];

            displayLegalMoves(pieceType, pieceColor, draggedSquare);

            return;
        }

        if (draggedSquare === droppedSquare) {
            setDraggedSquare(null);
            setDroppedSquare(null);

            return;
        }

        const boardPlacementToValidate = parsedFENString["board_placement"];
        const squareInfoToValidate =
            boardPlacementToValidate[`${draggedSquare}`];

        const pieceTypeToValidate = squareInfoToValidate["piece_type"];
        const pieceColorToValidate = squareInfoToValidate["piece_color"];

        const moveIsLegal = await fetchMoveIsValid(
            parsedFENString,
            pieceColorToValidate,
            pieceTypeToValidate,
            draggedSquare,
            droppedSquare
        );

        if (!moveIsLegal) {
            setDraggedSquare(null);
            setDroppedSquare(null);
            return;
        }

        if (pieceTypeToValidate.toLowerCase() === "pawn") {
            const rank = getRank(droppedSquare);
            const draggedFile = getFile(draggedSquare);
            const droppedFile = getFile(droppedSquare);
            const fileDifference = Math.abs(draggedFile - droppedFile);

            if (pieceColorToValidate.toLowerCase() === "white") {
                if (rank === 7 && fileDifference === 1) {
                    const boardPlacement = parsedFENString["board_placement"];
                    const capturedPieceInfo =
                        boardPlacement[`${droppedSquare}`];

                    setPromotionCapturedPiece(capturedPieceInfo);
                }
            }

            if (pieceColorToValidate.toLowerCase() === "black") {
                if (rank === 0 && fileDifference === 1) {
                    const boardPlacement = parsedFENString["board_placement"];
                    const capturedPieceInfo =
                        boardPlacement[`${droppedSquare}`];

                    setPromotionCapturedPiece(capturedPieceInfo);
                }
            }
        }

        setParsedFENString((previousFENString) => {
            const boardPlacement = previousFENString["board_placement"];

            if (!Object.keys(boardPlacement).includes(`${draggedSquare}`)) {
                return previousFENString;
            }

            const squareInfo = boardPlacement[`${draggedSquare}`];

            const pieceType = squareInfo["piece_type"];
            const pieceColor = squareInfo["piece_color"];
            const initialSquare = squareInfo["starting_square"];

            let newPiecePlacements = {
                ...previousFENString,
                board_placement: {
                    ...boardPlacement,
                    [`${droppedSquare}`]: {
                        piece_type: pieceType,
                        piece_color: pieceColor,
                    },
                },
            };

            delete newPiecePlacements["board_placement"][`${draggedSquare}`];

            if (pieceTypeToValidate.toLowerCase() === "rook") {
                const kingsideRookSquares = [7, 63];
                const queensideRookSquares = [0, 56];

                if (kingsideRookSquares.includes(parseInt(initialSquare))) {
                    newPiecePlacements = {
                        ...newPiecePlacements,
                        castling_rights: {
                            ...newPiecePlacements["castling_rights"],
                            [capitaliseFirstLetter(pieceColorToValidate)]: {
                                ...newPiecePlacements["castling_rights"][
                                    capitaliseFirstLetter(pieceColorToValidate)
                                ],
                                Kingside: false,
                            },
                        },
                    };
                }

                if (queensideRookSquares.includes(parseInt(initialSquare))) {
                    newPiecePlacements = {
                        ...newPiecePlacements,
                        castling_rights: {
                            ...newPiecePlacements["castling_rights"],
                            [capitaliseFirstLetter(pieceColorToValidate)]: {
                                ...newPiecePlacements["castling_rights"][
                                    capitaliseFirstLetter(pieceColorToValidate)
                                ],
                                Queenside: false,
                            },
                        },
                    };
                }
            }

            if (pieceTypeToValidate.toLowerCase() === "king") {
                const colorCastlingRights =
                    newPiecePlacements["castling_rights"][
                        capitaliseFirstLetter(pieceColorToValidate)
                    ];

                if (
                    parseInt(droppedSquare) === whiteKingsideCastlingSquare ||
                    parseInt(droppedSquare) === blackKingsideCastlingSquare
                ) {
                    if (colorCastlingRights["Kingside"]) {
                        if (
                            parseInt(droppedSquare) - 2 ===
                            parseInt(draggedSquare)
                        ) {
                            newPiecePlacements = {
                                ...newPiecePlacements,
                                board_placement: {
                                    ...newPiecePlacements["board_placement"],
                                    [`${parseInt(droppedSquare) - 1}`]: {
                                        piece_type: "Rook",
                                        piece_color: pieceColorToValidate,
                                        starting_square: `${
                                            parseInt(droppedSquare) + 1
                                        }`,
                                    },
                                },
                            };

                            delete newPiecePlacements["board_placement"][
                                `${parseInt(droppedSquare) + 1}`
                            ];
                        }
                    }
                }

                if (
                    parseInt(droppedSquare) === whiteQueensideCastlingSquare ||
                    parseInt(droppedSquare) === blackQueensideCastlingSquare
                ) {
                    if (colorCastlingRights["Queenside"]) {
                        if (
                            parseInt(droppedSquare) + 2 ===
                            parseInt(draggedSquare)
                        ) {
                            newPiecePlacements = {
                                ...newPiecePlacements,
                                board_placement: {
                                    ...newPiecePlacements["board_placement"],
                                    [`${parseInt(droppedSquare) + 1}`]: {
                                        piece_type: "Rook",
                                        piece_color: pieceColorToValidate,
                                        starting_square: `${
                                            parseInt(droppedSquare) - 2
                                        }`,
                                    },
                                },
                            };

                            delete newPiecePlacements["board_placement"][
                                `${parseInt(droppedSquare) - 2}`
                            ];
                        }
                    }
                }

                newPiecePlacements = {
                    ...newPiecePlacements,
                    castling_rights: {
                        ...newPiecePlacements["castling_rights"],
                        [capitaliseFirstLetter(pieceColorToValidate)]: {
                            Kingside: false,
                            Queenside: false,
                        },
                    },
                };
            }

            return newPiecePlacements;
        });

        setPreviousDraggedSquare(draggedSquare);
        setPreviousDroppedSquare(droppedSquare);
        setDraggedSquare(null);
        setDroppedSquare(null);
    }

    async function handleClickToMove() {
        clearSquaresStyling();

        if (!(previousClickedSquare && clickedSquare)) {
            if (!previousClickedSquare) {
                return;
            }

            const boardPlacement = parsedFENString["board_placement"];

            if (
                !Object.keys(boardPlacement).includes(
                    `${previousClickedSquare}`
                )
            ) {
                return;
            }

            const squareInfo = boardPlacement[`${previousClickedSquare}`];

            const pieceType = squareInfo["piece_type"];
            const pieceColor = squareInfo["piece_color"];
            const currentSquare = `${previousClickedSquare}`;

            displayLegalMoves(pieceType, pieceColor, currentSquare);

            return;
        }

        if (previousClickedSquare === clickedSquare) {
            setPreviousClickedSquare(null);
            setClickedSquare(null);

            return;
        }

        if (
            !Object.keys(parsedFENString["board_placement"]).includes(
                previousClickedSquare
            )
        ) {
            setPreviousClickedSquare(null);
            setClickedSquare(null);

            return;
        }

        const boardPlacement = parsedFENString["board_placement"];
        const initialSquare =
            boardPlacement[`${previousClickedSquare}`]["initial_square"];
        const pieceTypeToValidate =
            boardPlacement[`${previousClickedSquare}`]["piece_type"];
        const pieceColorToValidate =
            boardPlacement[`${previousClickedSquare}`]["piece_color"];

        const isMoveLegal = await fetchMoveIsValid(
            parsedFENString,
            pieceColorToValidate,
            pieceTypeToValidate,
            previousClickedSquare,
            clickedSquare
        );

        if (!isMoveLegal) {
            return;
        }

        setParsedFENString((previousFENString) => {
            const oringinalBoardPlacements =
                previousFENString["board_placement"];

            const pieceType =
                oringinalBoardPlacements[`${previousClickedSquare}`][
                    "piece_type"
                ];
            const pieceColor =
                oringinalBoardPlacements[`${previousClickedSquare}`][
                    "piece_color"
                ];

            let newPiecePlacements = {
                ...previousFENString,
                board_placement: {
                    ...previousFENString["board_placement"],
                    [`${clickedSquare}`]: {
                        piece_type: pieceType,
                        piece_color: pieceColor,
                    },
                },
            };

            delete newPiecePlacements["board_placement"][
                `${previousClickedSquare}`
            ];

            if (pieceTypeToValidate.toLowerCase() === "rook") {
                const kingsideRookSquares = [7, 63];
                const queensideRookSquares = [0, 56];

                if (kingsideRookSquares.includes(parseInt(initialSquare))) {
                    newPiecePlacements = {
                        ...newPiecePlacements,
                        castling_rights: {
                            ...newPiecePlacements["castling_rights"],
                            [capitaliseFirstLetter(pieceColorToValidate)]: {
                                ...newPiecePlacements["castling_rights"][
                                    capitaliseFirstLetter(pieceColorToValidate)
                                ],
                                Kingside: false,
                            },
                        },
                    };
                }

                if (queensideRookSquares.includes(parseInt(initialSquare))) {
                    newPiecePlacements = {
                        ...newPiecePlacements,
                        castling_rights: {
                            ...newPiecePlacements["castling_rights"],
                            [capitaliseFirstLetter(pieceColorToValidate)]: {
                                ...newPiecePlacements["castling_rights"][
                                    capitaliseFirstLetter(pieceColorToValidate)
                                ],
                                Queenside: false,
                            },
                        },
                    };
                }
            }

            const colorCastlingRights =
                previousFENString["castling_rights"][pieceColor];

            if (pieceTypeToValidate.toLowerCase() === "king") {
                newPiecePlacements = {
                    ...newPiecePlacements,
                    castling_rights: {
                        ...newPiecePlacements["castling_rights"],
                        [capitaliseFirstLetter(pieceColorToValidate)]: {
                            Kingside: false,
                            Queenside: false,
                        },
                    },
                };

                if (
                    parseInt(clickedSquare) === whiteKingsideCastlingSquare ||
                    parseInt(clickedSquare) === blackKingsideCastlingSquare
                ) {
                    if (colorCastlingRights["Kingside"]) {
                        if (
                            parseInt(clickedSquare) - 2 ===
                            parseInt(previousClickedSquare)
                        ) {
                            newPiecePlacements = {
                                ...newPiecePlacements,
                                board_placement: {
                                    ...newPiecePlacements["board_placement"],
                                    [`${parseInt(clickedSquare) - 1}`]: {
                                        piece_type: "Rook",
                                        piece_color: pieceColorToValidate,
                                        starting_square: `${
                                            parseInt(clickedSquare) - 2
                                        }`,
                                    },
                                },
                            };

                            delete newPiecePlacements["board_placement"][
                                `${parseInt(clickedSquare) + 1}`
                            ];
                        }
                    }
                }

                if (
                    parseInt(clickedSquare) === whiteQueensideCastlingSquare ||
                    parseInt(clickedSquare) === blackQueensideCastlingSquare
                ) {
                    if (colorCastlingRights["Queenside"]) {
                        if (
                            parseInt(clickedSquare) + 2 ===
                            parseInt(previousClickedSquare)
                        ) {
                            newPiecePlacements = {
                                ...newPiecePlacements,
                                board_placement: {
                                    ...newPiecePlacements["board_placement"],
                                    [`${parseInt(clickedSquare) + 1}`]: {
                                        piece_type: "Rook",
                                        piece_color: pieceColorToValidate,
                                        starting_square: `${
                                            parseInt(clickedSquare) - 2
                                        }`,
                                    },
                                },
                            };

                            delete newPiecePlacements["board_placement"][
                                `${parseInt(clickedSquare) - 2}`
                            ];
                        }
                    }
                }
            }

            return newPiecePlacements;
        });

        setPreviousDraggedSquare(previousClickedSquare);
        setPreviousDroppedSquare(clickedSquare);
        setPreviousClickedSquare(null);
        setClickedSquare(null);
    }

    async function displayLegalMoves(pieceType, pieceColor, startingSquare) {
        const legalMoves = await fetchLegalMoves(
            parsedFENString,
            pieceType,
            pieceColor,
            startingSquare
        );

        if (!legalMoves) {
            return;
        }

        for (const legalMove of legalMoves) {
            const square = document.getElementById(legalMove);
            if (square) {
                square.classList.add("legal-square");
            }
        }
    }

    if (!parsedFENString) {
        return null;
    }

    const piecePlacements = parsedFENString["board_placement"];

    function handleSquareClick(event, square) {
        const container = document.getElementById(square);
        event.target = container;

        if (!previousClickedSquare && !clickedSquare) {
            setPreviousClickedSquare(event.target.id);
        } else {
            setClickedSquare(event.target.id);
        }
    }

    function handlePromotionCancel(color) {
        setParsedFENString((previousFENString) => {
            let updatedBoardPlacement = {
                ...previousFENString,
                board_placement: {
                    ...previousFENString["board_placement"],
                    [previousDraggedSquare]: {
                        piece_type: "Pawn",
                        piece_color: color,
                    },
                },
            };

            delete updatedBoardPlacement["board_placement"][
                previousDroppedSquare
            ];

            console.log(previousFENString["board_placement"]);

            if (
                Object.keys(previousFENString["board_placement"]).includes(
                    previousDroppedSquare
                )
            ) {
                const squareInfo =
                    previousFENString["board_placement"][previousDroppedSquare];
                console.log(squareInfo, color);

                if (!promotionCapturedPiece) {
                    return updatedBoardPlacement;
                }

                if (
                    promotionCapturedPiece["piece_color"].toLowerCase() !==
                    color.toLowerCase()
                ) {
                    updatedBoardPlacement = {
                        ...updatedBoardPlacement,
                        board_placement: {
                            ...updatedBoardPlacement["board_placement"],
                            [previousDroppedSquare]: promotionCapturedPiece,
                        },
                    };
                }
            }

            return updatedBoardPlacement;
        });

        setPromotionCapturedPiece(null);
        console.log(parsedFENString);
    }

    function handlePawnPromotion(color, promotedPiece) {
        setParsedFENString((previousFENString) => ({
            ...previousFENString,
            board_placement: {
                ...previousFENString["board_placement"],
                [previousDroppedSquare]: {
                    piece_type: promotedPiece,
                    piece_color: color,
                },
            }   
        }))

        setDraggedSquare(null);
        setDroppedSquare(null);
        setPreviousClickedSquare(null);
        setClickedSquare(null);
        setPromotionCapturedPiece(null);
    }

    function generateChessboard() {
        const squareElements = [];

        const startingRow = orientation === "White" ? 8 : 1;
        const endingRow = orientation === "White" ? 1 : 8;

        for (
            let row = startingRow;
            orientation === "White" ? row >= endingRow : row <= endingRow;
            orientation === "White" ? row-- : row++
        ) {
            const startingIndex = (row - 1) * 8 + 1;
            const endingIndex = row * 8;

            for (let square = startingIndex; square <= endingIndex; square++) {
                const file = square - startingIndex + 1;

                const squareIsLight = (file + row) % 2 !== 0;
                const squareColor = squareIsLight ? "light" : "dark";

                const boardPlacementSquare = `${square - 1}`;
                if (
                    Object.keys(piecePlacements).includes(boardPlacementSquare)
                ) {
                    console.log(piecePlacements, boardPlacementSquare);

                    const pieceColor =
                        piecePlacements[boardPlacementSquare]["piece_color"];
                    const pieceType =
                        piecePlacements[boardPlacementSquare]["piece_type"];

                    const promotionRank =
                        pieceColor.toLowerCase() === "white" ? 7 : 0;
                    const pieceRank = getRank(boardPlacementSquare);

                    squareElements.push(
                        <Square
                            key={boardPlacementSquare}
                            squareNumber={boardPlacementSquare}
                            squareColor={squareColor}
                            pieceColor={pieceColor}
                            pieceType={pieceType}
                            displayPromotionPopup={
                                pieceType.toLowerCase() === "pawn" &&
                                promotionRank === pieceRank
                            }
                            handleSquareClick={handleSquareClick}
                            setParsedFENString={setParsedFENString}
                            setDraggedSquare={setDraggedSquare}
                            setDroppedSquare={setDroppedSquare}
                            handlePromotionCancel={handlePromotionCancel}
                            handlePawnPromotion={handlePawnPromotion}

                            previousDraggedSquare={previousDraggedSquare}
                            previousDroppedSquare={previousDroppedSquare}
                        />
                    );
                } else {
                    squareElements.push(
                        <Square
                            key={boardPlacementSquare}
                            squareNumber={boardPlacementSquare}
                            squareColor={squareColor}
                            handleSquareClick={handleSquareClick}
                            displayPromotionPopup={false}
                            setParsedFENString={setParsedFENString}
                            setDraggedSquare={setDraggedSquare}
                            setDroppedSquare={setDroppedSquare}
                            handlePromotionCancel={handlePromotionCancel}
                            handlePawnPromotion={handlePawnPromotion}
                            previousDraggedSquare={previousDraggedSquare}
                            previousDroppedSquare={previousDroppedSquare}
                        />
                    );
                }
            }
        }

        return squareElements;
    }

    return <div className="chessboard-container">{generateChessboard()}</div>;
}

export default Chessboard;