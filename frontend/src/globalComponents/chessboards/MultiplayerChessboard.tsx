import React, { useState, useEffect, useRef } from "react";

import "../../styles/chessboard/chessboard.css";
import Square from "../Square.js";

import { clearSquaresStyling, getRank, getFile } from "../../utils/boardUtils";
import { fetchLegalMoves, fetchMoveIsValid } from "../../utils/apiUtils";

import {
    whitePromotionRank,
    blackPromotionRank,
} from "../../constants/boardSquares.js";

import { websocketBaseURL } from "../../constants/urls.js";
import useWebSocket from "../../hooks/useWebsocket";
import { getAccessToken } from "../../utils/tokenUtils";

import { playAudio } from "../../utils/audioUtils";

import _ from "lodash";
import { MoveMethods } from "../../enums/gameLogic.ts";
import { MultiplayerChessboardProps } from "../../interfaces/chessboard.js";
import {
    ChessboardSquareIndex,
    OptionalValue,
} from "../../types/general.ts";
import {
    BoardPlacement,
    ParsedFENString,
    PieceColor,
    PieceInfo,
    PieceType,
} from "../../types/gameLogic.ts";

function MultiplayerChessboard({
    parsed_fen_string,
    orientation,
    gameId,
    setWhiteTimer,
    setBlackTimer,
    gameplaySettings
}: MultiplayerChessboardProps) {
    const [previousClickedSquare, setPreviousClickedSquare] =
        useState<OptionalValue<ChessboardSquareIndex>>(null);
    const [clickedSquare, setClickedSquare] =
        useState<OptionalValue<ChessboardSquareIndex>>(null);
    const [parsedFENString, setParsedFENString] =
        useState<OptionalValue<ParsedFENString>>(parsed_fen_string);

    const [draggedSquare, setDraggedSquare] =
        useState<OptionalValue<ChessboardSquareIndex>>(null);
    const [droppedSquare, setDroppedSquare] =
        useState<OptionalValue<ChessboardSquareIndex>>(null);

    const [previousDraggedSquare, setPreviousDraggedSquare] =
        useState<OptionalValue<ChessboardSquareIndex>>(null);
    const [previousDroppedSquare, setPreviousDroppedSquare] =
        useState<OptionalValue<ChessboardSquareIndex>>(null);
    const [promotionCapturedPiece, setPromotionCapturedPiece] =
        useState<OptionalValue<PieceInfo>>(null);
    const [lastUsedMoveMethod, setLastUsedMoveMethod] =
        useState<OptionalValue<string>>(null);

    const [boardOrientation, setBoardOrientation] = useState(orientation);

    const [gameWebsocketConnected, _] = useState(true);

    const gameWebsocket = useRef<OptionalValue<WebSocket>>(null);

    useEffect(() => {
        setParsedFENString(parsed_fen_string);
    }, [parsed_fen_string]);

    useEffect(() => {
        setBoardOrientation(orientation);
    }, [orientation]);

    useEffect(() => {
        handleClickToMove();
    }, [previousClickedSquare, clickedSquare]);

    useEffect(() => {
        const gameWebsocketURL = `${websocketBaseURL}ws/game-server/?token=${getAccessToken()}&gameId=${gameId}`;
        const websocket = useWebSocket(
            gameWebsocketURL,
            handleOnMessage,
            onError
        );

        gameWebsocket.current = websocket;

        return () => {
            if (
                gameWebsocket &&
                gameWebsocket.current &&
                "readyState" in gameWebsocket?.current &&
                gameWebsocket.current instanceof WebSocket
            ) {
                if (gameWebsocket.current?.readyState === WebSocket.OPEN) {
                    gameWebsocket.current.close();
                }
            }
        };
    }, []);

    useEffect(() => {
        handleOnDrop();
    }, [draggedSquare, droppedSquare]);

    useEffect(() => {
        if (!gameWebsocketConnected) {
            if (gameWebsocket?.current instanceof WebSocket) {
                gameWebsocket.current.close();
            }
        }
    }, [gameWebsocketConnected]);

    function handleOnMessage(event: MessageEvent) {
        const parsedEventData = JSON.parse(event.data);

        if (parsedEventData["type"] === "move_made") {
            makeMove(parsedEventData);
        } else if (parsedEventData["type"] === "timer_decremented") {
            handleTimerDecrement(parsedEventData);
        }
    }

    function handleTimerDecrement(parsedEventData: any) {
        const newWhitePlayerClock = parsedEventData["white_player_clock"];
        const newBlackPlayerClock = parsedEventData["black_player_clock"];

        console.log(newWhitePlayerClock, newBlackPlayerClock);

        setWhiteTimer(Math.ceil(newWhitePlayerClock));
        setBlackTimer(Math.ceil(newBlackPlayerClock));
    }

    function makeMove(eventData: any) {
        setParsedFENString((prevState: any) => {
            return {
                ...prevState,
                ...eventData["new_parsed_fen"],
            };
        });

        const startingSquare = eventData["move_data"]["starting_square"];
        const destinationSquare = eventData["move_data"]["destination_square"];

        playAudio(eventData["move_type"]);

        setPreviousDraggedSquare(startingSquare);
        setPreviousDroppedSquare(destinationSquare);
    }

    function onError() {
        console.log("Error!");
    }

    async function handleOnDrop() {
        clearSquaresStyling();

        if (!parsedFENString) {
            return;
        }

        if (!draggedSquare) {
            return;
        }

        if (!(draggedSquare && droppedSquare)) {
            handleLegalMoveDisplay("drag");
            setLastUsedMoveMethod("drag");

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

        const initialSquare = squareInfoToValidate["starting_square"];

        const pieceTypeToValidate = squareInfoToValidate["piece_type"];
        const pieceColorToValidate = squareInfoToValidate["piece_color"];

        const autoQueen = gameplaySettings["auto_queen"];

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
            const isPromotion = handlePromotionCapture(
                pieceColorToValidate,
                draggedSquare,
                droppedSquare,
                autoQueen
            );

            if (isPromotion) {
                setParsedFENString(
                    (prevFENString: OptionalValue<ParsedFENString>) => {
                        if (!prevFENString) {
                            return parsedFENString;
                        }

                        let newPiecePlacements = structuredClone(prevFENString);

                        newPiecePlacements = {
                            ...newPiecePlacements,
                            board_placement: {
                                ...newPiecePlacements["board_placement"],
                                [`${droppedSquare}`]: {
                                    piece_type: "pawn",
                                    piece_color: pieceColorToValidate,
                                },
                            },
                        };

                        delete newPiecePlacements["board_placement"][
                            `${draggedSquare}`
                        ];

                        return newPiecePlacements;
                    }
                );

                setPreviousDraggedSquare(draggedSquare);
                setPreviousDroppedSquare(droppedSquare);
                setDraggedSquare(null);
                setDroppedSquare(null);
                setLastUsedMoveMethod("drag");

                return;
            }
        }

        if (gameWebsocket.current?.readyState === WebSocket.OPEN) {
            const moveDetails = {
                piece_color: pieceColorToValidate,
                piece_type: pieceTypeToValidate,
                starting_square: draggedSquare,
                initial_square: initialSquare,
                destination_square: droppedSquare,

                additional_info: {},
            };

            gameWebsocket.current?.send(JSON.stringify(moveDetails));
        }

        setDraggedSquare(null);
        setDroppedSquare(null);
        setLastUsedMoveMethod("drag");
    }

    function handleLegalMoveDisplay(moveMethod: string) {
        if (!parsedFENString) {
            return;
        }

        moveMethod = moveMethod.toLowerCase();

        const usingDrag = moveMethod === MoveMethods.DRAG;
        const startingSquare = usingDrag
            ? draggedSquare
            : previousClickedSquare;

        if (!startingSquare) {
            return;
        }

        const boardPlacement = parsedFENString["board_placement"];
        const squareInfo = boardPlacement[`${draggedSquare}`];
        const pieceType = squareInfo["piece_type"];
        const pieceColor = squareInfo["piece_color"];

        displayLegalMoves(pieceType, pieceColor, startingSquare);
    }

    async function handleClickToMove() {
        if (!parsedFENString) {
            return;
        }

        if (!previousClickedSquare) {
            return;
        }

        clearSquaresStyling();

        if (!(previousClickedSquare && clickedSquare)) {
            const boardPlacement = parsedFENString["board_placement"];

            if (
                !Object.keys(boardPlacement).includes(
                    `${previousClickedSquare}`
                )
            ) {
                return;
            }

            handleLegalMoveDisplay("click");
            setLastUsedMoveMethod("click");

            return;
        }

        if (previousClickedSquare === clickedSquare) {
            setPreviousClickedSquare(null);
            setClickedSquare(null);

            return;
        }

        if (
            !Object.keys(parsedFENString["board_placement"]).includes(
                `${previousClickedSquare}`
            )
        ) {
            setPreviousClickedSquare(null);
            setClickedSquare(null);

            return;
        }

        const boardPlacement: BoardPlacement =
            parsedFENString["board_placement"];
        boardPlacement[`${previousClickedSquare}`]["starting_square"];
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

        if (pieceTypeToValidate.toLowerCase() === "pawn") {
            const isPromotion = handlePromotionCapture(
                pieceColorToValidate,
                previousClickedSquare,
                clickedSquare
            );

            if (isPromotion) {
                return;
            }
        }

        if (gameWebsocket.current?.readyState === WebSocket.OPEN) {
            const moveDetails = {
                piece_color: pieceColorToValidate,
                piece_type: pieceTypeToValidate,
                starting_square: previousClickedSquare,
                destination_square: clickedSquare,

                move_type: "regular",
            };

            gameWebsocket.current?.send(JSON.stringify(moveDetails));
        }

        setPreviousDraggedSquare(previousClickedSquare);
        setPreviousDroppedSquare(clickedSquare);
        setPreviousClickedSquare(null);
        setClickedSquare(null);

        setLastUsedMoveMethod("click");
    }

    async function displayLegalMoves(
        pieceType: PieceType,
        pieceColor: PieceColor,
        startingSquare: ChessboardSquareIndex
    ) {
        if (!parsedFENString) {
            return;
        }

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

    if (!gameplaySettings) {
        return null;
    }

    const piecePlacements = parsedFENString["board_placement"];

    function handleSquareClick(
        event: React.MouseEvent<HTMLElement>,
    ) {
        if (!previousClickedSquare && !clickedSquare) {
            setPreviousClickedSquare(event.currentTarget.id);
        } else {
            setClickedSquare(event.currentTarget.id);
        }
    }

    function handlePromotionCancel(color: PieceColor) {
        if (!previousDraggedSquare || !previousDroppedSquare) {
            return;
        }

        setParsedFENString((prevFENString: OptionalValue<ParsedFENString>) => {
            if (!prevFENString) {
                return parsedFENString;
            }
           
            let updatedBoardPlacement = {
                ...prevFENString,
                board_placement: {
                    ...prevFENString["board_placement"],
                    [previousDraggedSquare]: {
                        piece_type: "pawn" as PieceType,
                        piece_color: color,
                    },
                },
            };

            delete updatedBoardPlacement["board_placement"][
                previousDroppedSquare
            ];

            if (
                !Object.keys(prevFENString["board_placement"]).includes(
                    `${previousDroppedSquare}`
                )
            ) {
                return updatedBoardPlacement;
            }

            if (!promotionCapturedPiece) {
                return updatedBoardPlacement;
            }

            if (
                promotionCapturedPiece["piece_color"].toLowerCase() ===
                color.toLowerCase()
            ) {
                return updatedBoardPlacement;
            }

            updatedBoardPlacement = {
                ...updatedBoardPlacement,
                board_placement: {
                    ...updatedBoardPlacement["board_placement"],
                    [previousDroppedSquare]: promotionCapturedPiece,
                },
            };

            return updatedBoardPlacement;
        });

        setPromotionCapturedPiece(null);
    }

    function handlePromotionCapture(
        pieceColor: PieceColor,
        startSquare: ChessboardSquareIndex,
        destinationSquare: ChessboardSquareIndex,
        autoQueen: boolean = false
    ) {
        if (!parsedFENString) {
            return;
        }

        const rank = getRank(destinationSquare);
        const startFile = getFile(startSquare);
        const endFile = getFile(destinationSquare);
        const fileDifference = Math.abs(startFile - endFile);

        const promotionRank =
            pieceColor.toLowerCase() === "white"
                ? whitePromotionRank
                : blackPromotionRank;

        if (rank === promotionRank && autoQueen) {
            const moveDetails = {
                piece_color: pieceColor,
                piece_type: "queen",
                starting_square: startSquare,
                destination_square: destinationSquare,

                additional_info: {
                    promoted_piece: "queen",
                }
            }

            gameWebsocket?.current?.send(JSON.stringify(moveDetails));

            return;
        }

        if (!(rank === promotionRank) || !(fileDifference === 1)) {
            if (rank === promotionRank && fileDifference === 0) {
                return true;
            }

            return;
        }

        const boardPlacement = parsedFENString["board_placement"];
        const capturedPieceInfo = boardPlacement[`${destinationSquare}`];

        setPromotionCapturedPiece(capturedPieceInfo);

        return true;
    }

    function handlePawnPromotion(color: PieceColor, promotedPiece: PieceType) {
        const moveDetails = {
            piece_color: color,
            piece_type: "Pawn",
            starting_square: previousDraggedSquare,
            destination_square: previousDroppedSquare,

            additional_info: {
                promoted_piece: promotedPiece,
            },
        };

        gameWebsocket?.current?.send(JSON.stringify(moveDetails));

        setDraggedSquare(null);
        setDroppedSquare(null);
        setPreviousClickedSquare(null);
        setClickedSquare(null);
        setPromotionCapturedPiece(null);
    }

    function generateChessboard() {
        console.log("Generating Chessboard")

        const squareElements = [];

        const startingRow = boardOrientation.toLowerCase() === "white" ? 8 : 1;
        const endingRow = boardOrientation.toLowerCase() === "white" ? 1 : 8;

        for (
            let row = startingRow;
            boardOrientation.toLowerCase() === "white"
                ? row >= endingRow
                : row <= endingRow;
            boardOrientation.toLowerCase() === "white" ? row-- : row++
        ) {
            const whiteOrientationStartingIndex = (row - 1) * 8 + 1;
            const whiteOrientationEndingIndex = row * 8;

            const blackOrientationStartingIndex = row * 8;
            const blackOrientationEndingIndex = (row - 1) * 8 + 1;

            const startingIndex =
                boardOrientation.toLowerCase() === "white"
                    ? whiteOrientationStartingIndex
                    : blackOrientationStartingIndex;
            const endingIndex =
                boardOrientation.toLowerCase() === "white"
                    ? whiteOrientationEndingIndex
                    : blackOrientationEndingIndex;

            for (
                let square = startingIndex;
                boardOrientation.toLowerCase() === "white"
                    ? square <= endingIndex
                    : square >= endingIndex;
                boardOrientation.toLowerCase() === "white" ? square++ : square--
            ) {
                const file = getFile(square);

                const squareIsLight = (file + row) % 2 !== 0;
                const squareColor = squareIsLight ? "light" : "dark";

                const boardPlacementSquare = `${square - 1}`;
                if (
                    Object.keys(piecePlacements).includes(boardPlacementSquare)
                ) {
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
                            orientation={boardOrientation}
                            moveMethod={lastUsedMoveMethod}
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
                            orientation={boardOrientation}
                            moveMethod={lastUsedMoveMethod}
                        />
                    );
                }
            }
        }

        return squareElements;
    }

    return (
        <>
            <div className="chessboard-container">{generateChessboard()}</div>
        </>
    );
}

export default MultiplayerChessboard;
