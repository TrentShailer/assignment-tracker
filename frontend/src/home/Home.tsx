import React from "react";
import Homepage from "./Homepage";
import Menubar from "./Menubar";
import Modal from "./modal/Modal";

export default function Home() {
	return (
		<div>
			<Modal />
			<Menubar />
			<Homepage />
		</div>
	);
}
