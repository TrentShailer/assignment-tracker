import {
	Button,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Stack,
} from "@chakra-ui/react";
import { useEffect, useState } from "preact/hooks";
import { Dayjs } from "dayjs";
import Name from "./AssignmentModal/Name";
import CourseDisplay from "./AssignmentModal/CourseDisplay";
import ProgressBar from "./AssignmentModal/ProgressBar";
import Date from "./AssignmentModal/Date";
import DeleteButton from "./AssignmentModal/DeleteButton";
import SubmitButton from "./AssignmentModal/SubmitButton";
import { User } from "../../types/User";
import { Course } from "../../types/Course";
import { Assignment } from "../../assignment";

interface Props {
	course: Course;
	assignment: Assignment | null;
	isOpen: boolean;
	onClose: () => void;
	FetchData: () => void;
	SetUser: (user: User | null) => void;
}

export default function AssignmentModal({
	course,
	FetchData,
	assignment,
	isOpen,
	onClose,
	SetUser,
}: Props) {
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState("");
	const [nameError, setNameError] = useState<string | null>(null);
	const [outDate, setOutDate] = useState<Dayjs>(null);
	const [outDateError, setOutDateError] = useState<string | null>(null);
	const [dueDate, setDueDate] = useState<Dayjs>(null);
	const [dueDateError, setDueDateError] = useState<string | null>(null);
	const [progress, setProgress] = useState(0);
	const [progressError, setProgressError] = useState<string | null>(null);

	useEffect(() => {
		setLoading(false);
		if (assignment !== null) {
			setName(assignment.name);
			setDueDate(assignment.due_date);
			setOutDate(assignment.out_date);
			setProgress(assignment.progress);
		} else {
			setName("");
			setOutDate(null);
			setDueDate(null);
			setProgress(0);
		}
	}, [assignment]);

	const Cancel = () => {
		onClose();
		setLoading(false);
		setName("");
		setOutDate(null);
		setDueDate(null);
		setProgress(0);
		setNameError(null);
		setOutDateError(null);
		setDueDateError(null);
		setProgressError(null);
	};

	return (
		<Modal isOpen={isOpen} onClose={Cancel}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>{assignment !== null ? "Edit" : "Create"} Assignment</ModalHeader>
				<ModalCloseButton isDisabled={loading} />

				<ModalBody>
					<Stack gap={4}>
						<Name name={name} setName={setName} nameError={nameError} />
						<CourseDisplay course={course} />

						<Date
							label="Out Date"
							date={outDate}
							setDate={setOutDate}
							dateError={outDateError}
						/>
						<Date
							label="Due Date"
							date={dueDate}
							setDate={setDueDate}
							dateError={dueDateError}
						/>

						<ProgressBar
							progress={progress}
							setProgress={setProgress}
							progressError={progressError}
						/>
					</Stack>
				</ModalBody>

				<ModalFooter>
					{assignment !== null ? (
						<DeleteButton
							Close={Cancel}
							FetchData={FetchData}
							assignment={assignment}
							course={course}
							setLoading={setLoading}
							loading={loading}
							SetUser={SetUser}
						/>
					) : null}
					<Button isDisabled={loading} mr={3} onClick={Cancel}>
						Cancel
					</Button>
					<SubmitButton
						Close={Cancel}
						FetchData={FetchData}
						assignment={assignment}
						course={course}
						setLoading={setLoading}
						loading={loading}
						name={name}
						outDate={outDate}
						dueDate={dueDate}
						progress={progress}
						SetUser={SetUser}
						setNameError={setNameError}
						setOutDateError={setOutDateError}
						setDueDateError={setDueDateError}
						setProgressError={setProgressError}
					/>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
