import React, { useState, useEffect } from "react";
import { fetchFen } from "../../utils/apiUtils.js";

import {
    GameEndedSetterContext,
    GameEndedCauseSetterContext,
    GameWinnerSetterContext,
} from "../../contexts/chessboardContexts.js";

import "../../styles/pass-and-play.css"

import Chessboard from "../../globalComponents/chessboards/Chessboard.jsx";
import GameOverModal from "../../globalComponents/modals/GameOverModal.jsx";

function PassAndPlay() {
    const [parsedFEN, setParsedFEN] = useState(null);

    const [gameEnded, setGameEnded] = useState(false);
    const [gameEndedCause, setGameEndedCause] = useState(null);
    const [gameWinner, setGameWinner] = useState(null);

    useEffect(() => {
        getParsedFEN();
    }, []);

    const startingPositionFEN =
        "5r1k/4P3/8/8/6K1/8/8/8 w - - 0 1"

    async function getParsedFEN() {
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
                        <div className="chessboard-wrapper">
                            <Chessboard
                                parsed_fen_string={parsedFEN}
                                orientation="White"
                                flipOnMove={true}
                            />
                        </div>

                        <GameOverModal
                            visible={gameEnded}
                            gameEndCause={gameEndedCause}
                            gameWinner={gameWinner}
                        />
                    </div>
                </GameWinnerSetterContext.Provider>
            </GameEndedCauseSetterContext.Provider>
        </GameEndedSetterContext.Provider>
    );
}

export default PassAndPlay;
