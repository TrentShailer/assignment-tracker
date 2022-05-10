import Slider from "rc-slider";
import React, { useEffect, useState } from "react";
import { EventEmitter, EventType } from "../../components/EventEmitter";
import Assignment from "../../types/Assignment";

import Dates from "./Dates";
import Notes from "./Notes";
import Progress from "./Progress";
import Title from "./Title";

interface IAssignmentChanges {
	dueDate?: Date;
	outDate?: Date;
	title?: string;
	notes?: string;
	progress?: number;
}

export default function Modal() {
	const [assignment, setAssignment] = useState<Assignment>(Assignment.EmptyAssignment);

	const SaveChange = (newValues: IAssignmentChanges) => {
		setAssignment((assign) => {
			if (assign === Assignment.EmptyAssignment) return assign;
			if (newValues.dueDate) assign.dueDate = newValues.dueDate;
			if (newValues.outDate) assign.outDate = newValues.outDate;
			if (newValues.title) assign.title = newValues.title;
			if (newValues.notes) assign.notes = newValues.notes;
			if (newValues.progress) assign.progress = newValues.progress;
			console.log(newValues);
			return assign;
		});
	};

	const OpenModal = (assignment: any) => {
		console.log(assignment.assignment);
		setAssignment(assignment.assignment);
	};

	useEffect(() => {
		EventEmitter.removeListener(EventType.OpenModal, "openModal");
		EventEmitter.on(EventType.OpenModal, OpenModal, "openModal");

		return () => {
			EventEmitter.removeListener(EventType.OpenModal, "openModal");
		};
	}, []);

	const handleClose = () => {
		setAssignment(Assignment.EmptyAssignment);
	};

	return (
		<div>
			{assignment !== Assignment.EmptyAssignment ? (
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
							<Title title={assignment.title} SaveChanges={SaveChange} />

							<Notes notes={assignment.notes} SaveChanges={SaveChange} />
							<Dates
								dueDate={assignment.dueDate}
								outDate={assignment.outDate}
								SaveChanges={SaveChange}
							/>
							<Progress progress={assignment.progress} SaveChanges={SaveChange} />
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
