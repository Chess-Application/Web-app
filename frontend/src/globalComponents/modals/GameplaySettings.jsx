import useGameplaySettings from "../../hooks/useGameplaySettings";
import Setting from "../settings/Setting.jsx";

import "../../styles/modals/gameplay-settings.css";

function GameplaySettings({ visible }) {
    const gameplaySettings = useGameplaySettings();
    if (!gameplaySettings) {
        return null;
    }

    // if (!visible) {
    //     return null;
    // }

    const autoQueen = gameplaySettings["auto_queen"];
    const showLegalMoves = gameplaySettings["show_legal_moves"];

    return (
        <div className="gameplay-settings-container">
            <h1 className="gameplay-settings-heading">Settings</h1>
            <Setting
                settingName="Auto queen"
                settingId="auto_queen"
                settingValue={autoQueen}
                settingType="switch"
            />

            <Setting
                settingName="Show legal moves"
                settingType="switch"
                settingId="show_legal_moves"
                settingValue={showLegalMoves}
            />
        </div>
    );
}

export default GameplaySettings;
