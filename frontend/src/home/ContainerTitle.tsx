import React, { useEffect, useState } from "react";

interface IProps {
	title: string;
	SaveChanges: Function;
}

let timeout = setTimeout(() => {}, 100);

export default function ContainerTitle(props: IProps) {
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [title, setTitle] = useState(props.title);

	const SaveChange = () => {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			props.SaveChanges(title);
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
						paddingTop: 19,
						paddingLeft: 20,
						paddingRight: 20,
						paddingBottom: 3,
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
						padding: "21px 20px 5px 30px",
					}}>
					{title}
				</div>
			)}
		</div>
	);
}
