import React, { useEffect, useState } from "react";

import Timer from "../../pageComponents/gameplay/Timer.jsx";

import "../../styles/play.css";
import DisplayChessboard from "../../globalComponents/DisplayChessboard.jsx";
import { fetchFen } from "../../utils.js";
import TimeControlTypeContainer from "../../pageComponents/gameplay/TimeControlTypeContainer.jsx";

function Play() {
    const [parsedFEN, setParsedFEN] = useState("");
    const [timeControlSelectionStage, setTimeControlSelectionStage] =
        useState("typeSelection");

    useEffect(() => {
        getParsedFEN();
    }, []);

    const startingPositionFEN =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    async function getParsedFEN() {
        try {
            const parsedFEN = await fetchFen(startingPositionFEN);
            setParsedFEN(parsedFEN);
        } catch (error) {
            console.log(error);
        }
    }

    function renderTimeControlSelectionPanel() {
        switch (timeControlSelectionStage) {
            case "typeSelection":
                const bulletDescription =
                    "Great for users who enjoy fast-paced and exciting games";

                const blitzDescription =
                    "Great for practising new chess openings";
                const rapidDescription =
                    "The perfect balance of speed and strategy";
                const classicalDescription =
                    "Perfect for those with plenty of time to focus on a long game";

                const customDescription =
                    "Choose a time control that suits your mood and skill level";

                return (
                    <div className="time-control-type-container">
                        <TimeControlTypeContainer
                            timeControlName="Bullet"
                            timeControlDescription={bulletDescription}
                        />

                        <TimeControlTypeContainer
                            timeControlName="Blitz"
                            timeControlDescription={blitzDescription}
                        />

                        <TimeControlTypeContainer
                            timeControlName="Rapid"
                            timeControlDescription={classicalDescription}
                        />

                        <TimeControlTypeContainer
                            timeControlName="Classical"
                            timeControlDescription={classicalDescription}
                        />

                        <TimeControlTypeContainer
                            timeControlName="Custom"
                            timeControlDescription={customDescription}
                        />
                    </div>
                );

            case "amountSelection":
                return <div className="time-control-amount-container"></div>;

            case "startConfirmation":
                <div className="start-confirmation-container"></div>;
        }
    }

    return (
        <div className="playing-interface-container">
            <div className="display-chessboard-container">
                <div className="top-timer-wrapper">
                    <Timer playerColor="black" position="top" />
                </div>

                <DisplayChessboard fenString={parsedFEN} orientation="White" />

                <div className="bottom-timer-wrapper">
                    <Timer playerColor="white" position="bottom" />
                </div>
            </div>

            <div className="time-control-selection-container">
                {renderTimeControlSelectionPanel()}
            </div>
        </div>
    );
}

export default Play;
