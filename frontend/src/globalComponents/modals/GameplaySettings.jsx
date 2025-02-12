import useGameplaySettings from "../../hooks/useGameplaySettings";
import Setting from "../settings/Setting.jsx";

import "../../styles/modals/gameplay-settings.css";

function GameplaySettings({ visible }) {
    const gameplaySettings = useGameplaySettings();
    if (!gameplaySettings) {
        return null;
    }

    const autoQueen = gameplaySettings["auto_queen"];

    return (
        <div className="gameplay-settings-container">
            <h1 className="gameplay-settings-heading">Settings</h1>
            <Setting
                settingName="Auto queen"
                settingValue={autoQueen}
                settingType="switch"
            />
        </div>
    );
}

export default GameplaySettings;
