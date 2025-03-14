import React, { useState, useEffect } from "react";
import { fetchFen } from "../../utils/apiUtils.js";

import {
    GameEndedSetterContext,
    GameEndedCauseSetterContext,
    GameWinnerSetterContext,
} from "../../contexts/chessboardContexts.js";

import "../../styles/components/chessboard/board-actions.scss";
import "../../styles/pages/pass-and-play.scss";

import Chessboard from "../../globalComponents/chessboards/Chessboard.js";
import GameOverModal from "../../globalComponents/modals/GameOverModal.js";
import GameplaySettings from "../../globalComponents/modals/GameplaySettings.js";
import ModalWrapper from "../../globalComponents/wrappers/ModalWrapper.js";
import useGameplaySettings from "../../hooks/useGameplaySettings.js";

function PassAndPlay() {
    const [parsedFEN, setParsedFEN] = useState(null);

    const [gameEnded, setGameEnded] = useState(false);
    const [gameEndedCause, setGameEndedCause] = useState(null);
    const [gameWinner, setGameWinner] = useState(null);

    const initialGameplaySettings = useGameplaySettings();
    const [gameplaySettings, setGameplaySettings] = useState(
        initialGameplaySettings
    );

    const [gameplaySettingsVisible, setGameplaySettingsVisible] =
        useState(false);

    const [boardOrientation, setBoardOrientation] = useState("White");

    useEffect(() => {
        getParsedFEN();
    }, []);

    useEffect(() => {
        setGameplaySettings(initialGameplaySettings);
    }, [initialGameplaySettings]);

    if (!initialGameplaySettings) {
        return null;
    }

    function handleSettingsClose() {
        setGameplaySettingsVisible(false);
    }

    function handleSettingsDisplay() {
        setGameplaySettingsVisible(true);
    }

    function toggleBoardOrientation() {
        const isWhite = boardOrientation.toLowerCase() === "white";
        const newOrientation = isWhite ? "Black" : "White";

        setBoardOrientation(newOrientation);
    }

    async function getParsedFEN() {
        const startingPositionFEN =
            "8/4k3/p5K1/1p2BP1p/1pp3pp/8/8/8 w - - 0 1";

        try {
            const fetchedFEN = await fetchFen(startingPositionFEN);
            setParsedFEN(fetchedFEN);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <GameEndedSetterContext.Provider value={setGameEnded}>
            <GameEndedCauseSetterContext.Provider value={setGameEndedCause}>
                <GameWinnerSetterContext.Provider value={setGameWinner}>
                    <div className="playing-interface-container">
                        <div className="main-chessboard">
                            <div className="chessboard-wrapper">
                                <Chessboard
                                    parsed_fen_string={parsedFEN}
                                    orientation={boardOrientation}
                                    setBoardOrientation={setBoardOrientation}
                                    flipOnMove={false}
                                    gameplaySettings={gameplaySettings}
                                />
                            </div>

                            <ModalWrapper visible={gameplaySettingsVisible}>
                                <GameplaySettings
                                    onClose={handleSettingsClose}
                                    setGameplaySettings={setGameplaySettings}
                                />
                            </ModalWrapper>

                            <GameOverModal
                                visible={gameEnded}
                                gameEndCause={gameEndedCause}
                                gameWinner={gameWinner}
                            />
                        </div>

                        <div className="board-actions">
                            <img
                                onClick={toggleBoardOrientation}
                                className="flip-board-icon"
                                src="/flip-board-icon.png"
                            />
                            <img
                                className="settings-icon"
                                src="/settings.svg"
                                onClick={handleSettingsDisplay}
                            />
                        </div>
                    </div>
                </GameWinnerSetterContext.Provider>
            </GameEndedCauseSetterContext.Provider>
        </GameEndedSetterContext.Provider>
    );
}

export default PassAndPlay;
