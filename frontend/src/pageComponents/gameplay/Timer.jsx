import "../../styles/multiplayer/timer.css"
import { formatTime } from "../../utils/timeUtils.ts"

function Timer({ playerColor, timeInSeconds }) {
	return (
		<div className={`${playerColor}-player-timer-container`}>
			<p className="timer-amount">{formatTime(timeInSeconds)}</p>
		</div>
	)
}

export default Timer