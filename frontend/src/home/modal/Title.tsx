import React, { useEffect, useState } from "react";

interface IProps {
	title: string;
	SaveChanges: Function;
}

let timeout = setTimeout(() => {}, 100);

export default function Title(props: IProps) {
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [title, setTitle] = useState(props.title);

	const SaveChange = () => {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			props.SaveChanges({ title: title });
		}, 1000);
	};

	return (
		<div
			onClick={() => {
				setIsEditingTitle(true);
			}}
			style={{
				fontSize: 20,
				fontWeight: 500,
				cursor: "text",
			}}>
			{isEditingTitle ? (
				<div
					style={{
						paddingTop: 0,
						paddingLeft: 0,
						paddingRight: 0,
						paddingBottom: 0,
					}}>
					<input
						className="containerInput"
						style={{
							width: 268,
						}}
						autoFocus
						onChange={(e) => {
							setTitle(e.target.value);
						}}
						onBlur={() => {
							setIsEditingTitle(false);
							SaveChange();
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								setIsEditingTitle(false);
								SaveChange();
							}
						}}
						defaultValue={title}
					/>
				</div>
			) : (
				<div
					style={{
						paddingLeft: 10,
						paddingTop: 2,
						paddingBottom: 2,
					}}>
					{title}
				</div>
			)}
		</div>
	);
}
