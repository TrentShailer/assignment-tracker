import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Background from "./components/Background";
import Home from "./home/Home";
import Login from "./login/Login";

function App() {
	return (
		<div>
			<Background />
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/home" element={<Home />} />
			</Routes>
		</div>
	);
}

export default App;
