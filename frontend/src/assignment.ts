import dayjs, { Dayjs } from "dayjs";
import { Assignment as RawAssignment } from "../../backend/bindings/Assignment";

type Assignment = {
    id: string;
    name: string;
    course_id: string;
    out_date: Dayjs;
    due_date: Dayjs;
    progress: number;
};

const parse_assignment = (raw: RawAssignment): Assignment => {
    const out_date = dayjs(raw.out_date);
    const due_date = dayjs(raw.out_date);

    return {
        ...raw,
        out_date,
        due_date,
    };
};

const compare_assignments = (a: Assignment, b: Assignment) => {
    // sort incomplete ones above completed ones
    if (a.progress === 100 && b.progress !== 100) return 1;
    if (b.progress === 100 && a.progress !== 100) return -1;

    // if both are completed sort by due date
    if (a.progress === 100 && b.progress === 100) {
        // if a as due before b
        // sort a before b
        if (a.due_date.isBefore(b.due_date)) return 1;
        if (b.due_date.isBefore(a.due_date)) return -1;

        // if same due date, just use name
        return a.name.localeCompare(b.name);
    }

    // both are not completed
    // sort out before not out
    const a_is_out = a.out_date.isBefore(dayjs());
    const b_is_out = b.out_date.isBefore(dayjs());
    if (a_is_out && !b_is_out) return -1;
    if (b_is_out && !a_is_out) return 1;

    // if both are not out, then such that those out closer to now are ahead
    if (!a_is_out && !b_is_out) {
        if (a.out_date.isAfter(b.out_date)) return 1;
        if (b.out_date.isAfter(a.out_date)) return -1;

        return a.name.localeCompare(b.name);
    }

    // both are out
    // sort those that are
    const a_is_past_due = a.due_date.isBefore(dayjs());
    const b_is_past_due = b.due_date.isBefore(dayjs());
    if (a_is_past_due && !b_is_past_due) return 1;
    if (b_is_past_due && !a_is_past_due) return -1;

    // both are past their due date, sort such that those closer to now are first
    if (a_is_past_due && b_is_past_due) {
        if (a.due_date.isBefore(b.due_date)) return 1;
        if (b.due_date.isBefore(a.due_date)) return -1;

        return a.name.localeCompare(b.name);
    }

    // both are not past due
    // sort such that those that are due are sorted first
    if (a.due_date.isAfter(b.due_date)) return 1;
    if (b.due_date.isAfter(b.due_date)) return -1;
    return a.name.localeCompare(b.name);
};

export { Assignment, parse_assignment, compare_assignments };
