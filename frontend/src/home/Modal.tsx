import Slider from "rc-slider";
import React, { useEffect, useState } from "react";
import Button from "../components/Button";
import formatDistance from "date-fns/formatDistance";
import subDays from "date-fns/subDays";
import isPast from "date-fns/isPast";
import addDays from "date-fns/addDays";
import format from "date-fns/format";

let timeout = setTimeout(() => {}, 100);

export default function Modal() {
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [title, setTitle] = useState("PLACEHOLDER");
	const [notes, setNotes] = useState("");
	const [progress, setProgress] = useState(100);
	const [progressColor, setProgressColor] = useState("#fdd835");
	const [outDate, setOutDate] = useState<Date>(addDays(new Date(), 2));
	const [dueDate, setDueDate] = useState<Date>(addDays(new Date(), 8));

	const [outText, setOutText] = useState("");
	const [dueText, setDueText] = useState("");
	const [show, setShow] = useState(true);

	useEffect(() => {
		if (progress < 60) {
			setProgressColor("#fdd835");
		} else if (progress < 85) {
			setProgressColor("#aed581");
		} else {
			setProgressColor("#8bc34a");
		}
	}, [progress]);

	useEffect(() => {
		let now = new Date();
		if (isPast(outDate)) {
			setOutText(
				`Out ${formatDistance(outDate, now, { addSuffix: true })} (${format(
					outDate,
					"EEEE"
				)})`
			);
			setDueText(
				`Due ${formatDistance(dueDate, now, { addSuffix: true })} (${format(
					dueDate,
					"EEEE"
				)})`
			);
		} else {
			setOutText(
				`Out ${formatDistance(outDate, now, { addSuffix: true })} (${format(
					outDate,
					"EEEE"
				)})`
			);
			setDueText(
				`Due ${formatDistance(dueDate, outDate)} later  (${format(dueDate, "EEEE")})`
			);
		}
	}, [outDate, dueDate]);

	useEffect(() => {
		// Saves values after 1 second of no edits
		const saveValues = () => {};

		clearTimeout(timeout);
		timeout = setTimeout(saveValues, 1000);
	}, [title, notes, progress, outDate, dueDate]);

	const handleClose = () => {
		setShow(false);
	};

	return (
		<div>
			{show ? (
				<div
					style={{
						position: "absolute",
						overflow: "hidden",
						zIndex: 1000,
						width: "100vw",
						height: "100vh",
						background: "#00000066",
						backdropFilter: "blur(2px)",
					}}>
					<div
						style={{ width: "100vw", height: "100vh", position: "absolute" }}
						onClick={handleClose}
					/>
					<div
						style={{
							position: "absolute",
							left: 0,
							right: 0,
							top: 0,
							bottom: 0,
							margin: "auto",
							height: "max-content",
							width: "min(600px, 85vw)",
							background: "#fff",
							paddingTop: 20,
							paddingBottom: 20,
							paddingLeft: 20,
							paddingRight: 20,
							borderRadius: 10,
							boxShadow: "0px 0px 30px rgba(0, 0, 0, 0.5)",
						}}>
						<div
							style={{
								position: "relative",
								height: "max-content",
							}}>
							<div
								onClick={handleClose}
								style={{
									position: "absolute",
									right: 0,
									top: 0,
									cursor: "pointer",
								}}>
								<svg width="24" height="24" viewBox="0 0 24 24">
									<path
										fill="#424242"
										d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
									/>
								</svg>
							</div>
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
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													setIsEditingTitle(false);
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
							<div
								style={{
									width: "calc(100% - 20px)",
									marginTop: 20,
									marginLeft: 10,
									marginRight: 10,
									display: "flex",
									flexDirection: "row",
									justifyContent: "space-between",
								}}>
								<div style={{ fontWeight: 500, fontSize: 18 }}>{outText}</div>
								<div style={{ fontWeight: 500, fontSize: 18 }}>{dueText}</div>
							</div>
							<div
								style={{
									marginTop: 20,
									marginLeft: 10,
									marginRight: 10,
									width: "calc(100% - 20px)",
								}}>
								<textarea
									placeholder="Notes"
									onChange={() => {
										setNotes(notes);
									}}
									defaultValue={notes}
									style={{
										resize: "none",
										width: "calc(100% - 20px)",
										height: "400px",
									}}
								/>
							</div>
							<div
								style={{
									width: "calc(100% - 20px)",
									marginTop: 40,
									marginLeft: 10,
									marginRight: 10,
									display: "flex",
									flexDirection: "row",
									justifyContent: "space-between",
								}}>
								<Button>Edit out date</Button>
								<Button>Edit due date</Button>
							</div>
							<div
								style={{
									width: "calc(100% - 20px)",
									marginTop: 40,
									marginLeft: 10,
									marginRight: 10,
									marginBottom: 40,
								}}>
								<div style={{ marginBottom: 10 }}>Progress:</div>
								<Slider
									trackStyle={{ backgroundColor: progressColor }}
									onChange={(v) => {
										if (typeof v === "number") {
											setProgress(v);
										}
									}}
									defaultValue={progress}
									step={5}
									marks={{
										0: "Core",
										33: "Completion",
										66: "Challenge",
										100: "Completed",
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
