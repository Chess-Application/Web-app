import { useEffect, useState } from "react";
import SettingsSwitch from "./SettingsSwitch.jsx";
import api from "../../api.js";


function Setting({ settingName, settingId, settingType, initialSettingValue }) {
    const [settingValue, setSettingValue] = useState(initialSettingValue);

	useEffect(() => {
		updateSettings();
	}, [settingValue])

	async function updateSettings() {
		let newSettings = null;

        if (!settingValue) {
            return null;
        }

        console.log(settingValue);

		try {
			const response = await api.post("/gameplay_api/update-gameplay-settings/", {
                "setting_to_update": settingId,
                "updated_value": settingValue
            })

            console.log(response);

			if (response.status === 200) {
				newSettings = response.data;
				
				const newSettingValue = newSettings[settingId];
                console.log(newSettings);
				setSettingValue(newSettingValue);
			}
		} catch (error) {
			console.error(error);
		}
	}

    function getSettingInput() {
        switch (settingType) {
            case "switch":
                return (
                    <SettingsSwitch
                        setSwitchState={setSettingValue}
                        switchState={settingValue}
                    />
                );

            default:
                console.error(`Unknown setting type ${settingType}`);
        }
    }

    return (
        <div className="setting-container">
            <p className="setting-name">{settingName}</p>
            {getSettingInput()}
        </div>
    );
}

export default Setting;
