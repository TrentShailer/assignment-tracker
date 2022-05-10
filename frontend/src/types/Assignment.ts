class Assignment {
	id: string;
	course: string;
	title: string;
	outDate: Date;
	dueDate: Date;
	notes: string;
	progress: number;
	constructor(
		id: string,
		course: string,
		title: string,
		outDate: Date,
		dueDate: Date,
		notes: string,
		progress: number
	) {
		this.id = id;
		this.course = course;
		this.title = title;
		this.outDate = outDate;
		this.dueDate = dueDate;
		this.notes = notes;
		this.progress = progress;
	}

	static EmptyAssignment = new Assignment("", "", "", new Date(0), new Date(0), "", 0);
}

export default Assignment;
