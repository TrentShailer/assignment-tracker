import axios from "axios";
import addHours from "date-fns/addHours";
import parseISO from "date-fns/parseISO";
import React, { useEffect, useState } from "react";
import { EventEmitter, EventType } from "../components/EventEmitter";
import { Course } from "../types/types";
import ActiveContainer from "./ActiveContainer";
import AddContainer from "./AddContainer";
import Container from "./Container";

export default function Homepage() {
	const [courses, setCourses] = useState<Course[]>();

	const FetchAssignments = () => {
		axios.get("/assignments").then((response) => {
			let result = response.data;
			let tempCourses: Course[] = result.courses;
			let finalCourses: Course[] = [];
			for (let i = 0; i < tempCourses.length; i++) {
				let course = tempCourses[i];
				finalCourses.push({
					course_id: course.course_id,
					course_name: course.course_name,
					assignments: [],
				});
				for (let j = 0; j < course.assignments.length; j++) {
					let assignment = course.assignments[j];
					finalCourses[i].assignments.push({
						assignment_id: assignment.assignment_id,
						assignment_name: assignment.assignment_name,
						notes: assignment.notes,
						progress: assignment.progress,
						// @ts-ignore
						dueDate: addHours(parseISO(assignment.dueDate), 12),
						// @ts-ignore
						outDate: addHours(parseISO(assignment.outDate), 12),
					});
				}
			}
			setCourses(finalCourses);
		});
	};

	useEffect(() => {
		EventEmitter.removeListener(EventType.UpdatedAssignments, "updatedAssignmentsHomepage");
		EventEmitter.on(
			EventType.UpdatedAssignments,
			FetchAssignments,
			"updatedAssignmentsHomepage"
		);

		FetchAssignments();

		return () => {
			EventEmitter.removeListener(EventType.UpdatedAssignments, "updatedAssignmentsHomepage");
		};
	}, []);
	return (
		<div
			style={{
				width: "max-content",
				height: "100%",
			}}>
			<div
				style={{
					width: "100vw",
					overflowX: "auto",
					display: "flex",
					flexDirection: "row",
				}}>
				<ActiveContainer courses={courses} />
				{courses?.map((course) => {
					return <Container key={course.course_id} course={course} />;
				})}
				<AddContainer />
			</div>
		</div>
	);
}
