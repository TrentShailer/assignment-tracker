interface Assignment {
	assignment_id: string;
	assignment_name: string;
	outDate: Date;
	dueDate: Date;
	notes: string;
	progress: number;
	course_name?: string;
}

interface Course {
	course_id: string;
	course_name: string;
	assignments: Assignment[];
}

export type { Assignment, Course };
