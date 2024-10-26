/**
 * Data representation of an assignment, matching the database's model.
 */
export type Assignment = {
	id: string;
	course_id: string;
	name: string;
	out_date: string;
	due_date: string;
	progress: number;
};
