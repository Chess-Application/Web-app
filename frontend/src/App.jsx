import { Navigate, BrowserRouter, Routes, Route } from "react-router-dom"

import GuestHomePage from "./pages/GuestHomePage.jsx"
import "./styles/global.css"

function App() {
	return (
		<>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<GuestHomePage/>}/>
				</Routes>
			</BrowserRouter>
		</>
	)
}

export default App
