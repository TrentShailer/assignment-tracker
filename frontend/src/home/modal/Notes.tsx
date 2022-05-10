import React, { useEffect, useState } from "react";

interface IProps {
	notes: string;
	SaveChanges: Function;
}

let timeout = setTimeout(() => {}, 100);

export default function Notes(props: IProps) {
	const [notes, setNotes] = useState(props.notes);

	useEffect(() => {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			props.SaveChanges({ notes: notes });
		}, 1000);
	}, [notes]);

	return (
		<div
			style={{
				marginTop: 20,
				marginLeft: 10,
				marginRight: 10,
				width: "calc(100% - 20px)",
			}}>
			<textarea
				placeholder="Notes"
				onChange={(e) => {
					setNotes(e.target.value);
				}}
				defaultValue={notes}
				style={{
					resize: "none",
					width: "calc(100% - 20px)",
					height: "400px",
				}}
			/>
		</div>
	);
}
