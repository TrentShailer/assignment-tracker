import React from "preact";
import { Box, Container, CreateToastFnReturn, useToast } from "@chakra-ui/react";
import Footer from "./Footer";
import Header from "./Home/Header";
import Body from "./Home/Body";
import axios from "axios";
import { useEffect, useRef, useState } from "preact/hooks";
import { Course } from "../types/Course";
import { Assignment as RawAssignment } from "../types/Assignment";
import { User } from "../types/User";
import { ErrorResponse } from "../types/ErrorResponse";
import dayjs, { Dayjs } from "dayjs";
import {
	Assignment,
	// compare_assignments,
	parse_assignment,
} from "../assignment";

interface Props {
	SetUser: (user: User | null) => void;
	user: User;
}

const GetCourses = async (
	toast: CreateToastFnReturn,
	set_user: (user: User | null) => void
): Promise<Course[]> => {
	try {
		const { data } = await axios.get<Course[]>("/api/courses");
		return data;
	} catch (e) {
		if (axios.isAxiosError<ErrorResponse>(e) && e.response !== undefined) {
			const error = e.response.data;
			if (error.status === 401) {
				toast({
					title: "Failed to get courses",
					description: error.message,
					status: "warning",
					duration: 5000,
				});
				set_user(null);
			} else if (error.status === 410) {
				toast({
					title: "Failed to get courses",
					description: error.message,
					status: "error",
					duration: 5000,
				});
				set_user(null);
			} else if (error.status === 500) {
				toast({
					title: "Internal server error",
					description: error.message,
					status: "error",
					duration: 5000,
				});
				console.error(error);
			}
		} else {
			toast({
				title: "An unexpected error ocurred",
				description: e,
				status: "error",
				duration: 5000,
			});
			console.error(e);
		}
	}
	return [];
};

const GetAssignments = async (
	toast: CreateToastFnReturn,
	set_user: (user: User | null) => void
): Promise<Assignment[]> => {
	try {
		const { data } = await axios.get<RawAssignment[]>("/api/assignments", {
			params: {
				now: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
			},
		});
		return data.map(parse_assignment);
	} catch (e) {
		if (axios.isAxiosError<ErrorResponse>(e) && e.response !== undefined) {
			const error = e.response.data;
			if (error.status === 401) {
				toast({
					title: "Failed to get assignments",
					description: error.message,
					status: "warning",
					duration: 5000,
				});
				set_user(null);
			} else if (error.status === 410) {
				toast({
					title: "Failed to get assignments",
					description: error.message,
					status: "error",
					duration: 5000,
				});
				set_user(null);
			} else if (error.status === 500) {
				toast({
					title: "Internal server error",
					description: error.message,
					status: "error",
					duration: 5000,
				});
				console.error(error);
			}
		} else {
			toast({
				title: "An unexpected error ocurred",
				description: e,
				status: "error",
				duration: 5000,
			});
			console.error(e);
		}
	}
	return [];
};

let interval: number;
let last_fetch = 0;

export default function Home({ user, SetUser }: Props) {
	const [loading, setLoading] = useState(false);
	const [courses, setCourses] = useState<Course[]>([]);
	const [assignments, setAssignments] = useState<Assignment[]>([]);

	const toast = useToast();

	const Focus = () => {
		let now = new Date().getTime();
		if (now - last_fetch > 1000 * 60) {
			FetchData();
		}

		interval = setInterval(FetchData, 1000 * 60);
	};
	const Blur = () => {
		clearInterval(interval);
	};

	const FetchData = async () => {
		last_fetch = new Date().getTime();
		// setLoading(true);

		const courses = await GetCourses(toast, SetUser);
		const assignments = await GetAssignments(toast, SetUser); /* .sort(compare_assignments) */

		setCourses(courses);
		setAssignments(assignments);
	};

	useEffect(() => {
		FetchData();

		document.addEventListener("focus", Focus);
		document.addEventListener("blur", Blur);

		return () => {
			document.removeEventListener("focus", Focus);
			document.removeEventListener("blur", Blur);
		};
	}, []);

	return (
		<Box>
			<Header FetchData={FetchData} user={user} SetUser={SetUser} />
			<Container maxW="container.xs">
				<Box pt={4} minH="calc(100vh - 120px)">
					<Body
						FetchData={FetchData}
						assignments={assignments}
						courses={courses}
						SetUser={SetUser}
					/>
				</Box>
				<Footer />
			</Container>
		</Box>
	);
}
