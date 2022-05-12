import axios from "axios";
import Slider from "rc-slider";
import React, { useEffect, useState } from "react";
import { EventEmitter, EventType } from "../../components/EventEmitter";
import { Assignment } from "../../types/types";

import Dates from "./Dates";
import Notes from "./Notes";
import Progress from "./Progress";
import Title from "./Title";

interface IAssignmentChanges {
	dueDate?: Date;
	outDate?: Date;
	assignment_name?: string;
	notes?: string;
	progress?: number;
}

export default function Modal() {
	const [assignment, setAssignment] = useState<Assignment | null>(null);
	const [canSave, setCanSave] = useState(false);

	const SaveChange = (newValues: IAssignmentChanges) => {
		if (canSave)
			setAssignment((assign) => {
				if (!assign) return assign;
				if (newValues.dueDate !== undefined) assign.dueDate = newValues.dueDate;
				if (newValues.outDate !== undefined) assign.outDate = newValues.outDate;
				if (newValues.assignment_name !== undefined)
					assign.assignment_name = newValues.assignment_name;
				if (newValues.notes !== undefined) assign.notes = newValues.notes;
				if (newValues.progress !== undefined) assign.progress = newValues.progress;
				axios
					.post("/assignment/update", {
						assignment_id: assign.assignment_id,
						assignment_name: assign.assignment_name,
						notes: assign.notes,
						progress: assign.progress,
						outDate: assign.outDate,
						dueDate: assign.dueDate,
					})
					.then((response) => {
						EventEmitter.emit(EventType.UpdatedAssignments);
					});

				return assign;
			});
	};

	const OpenModal = (assignment: any) => {
		setCanSave(false);
		setTimeout(() => {
			setCanSave(true);
		}, 500);
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
		setAssignment(null);
	};

	const handleDelete = () => {
		if (assignment) {
			axios
				.post("/assignment/delete", {
					assignment_id: assignment.assignment_id,
				})
				.then((response) => {
					EventEmitter.emit(EventType.UpdatedAssignments);
				});
			handleClose();
		}
	};

	return (
		<div>
			{assignment ? (
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
								onClick={handleDelete}
								style={{
									position: "absolute",
									right: 36,
									top: 0,
									cursor: "pointer",
								}}>
								<svg width="24" height="24" viewBox="0 0 24 24">
									<path
										fill="#ef5350"
										d="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z"
									/>
								</svg>
							</div>
							<Title title={assignment.assignment_name} SaveChanges={SaveChange} />

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
