use std::cmp::Ordering;

use chrono::NaiveDateTime;
use uuid::Uuid;

use webserver::Assignment;

fn assignment(out_date: &str, due_date: &str, progress: i16) -> Assignment {
    Assignment {
        id: Uuid::new_v4(),
        course_id: Uuid::new_v4(),
        name: String::new(),
        out_date: date(out_date),
        due_date: date(due_date),
        progress,
    }
}

/// `%Y-%m-%d`
fn date(date: &str) -> NaiveDateTime {
    NaiveDateTime::parse_from_str(&format!("{} 00:00:00", date), "%Y-%m-%d %H:%M:%S").unwrap()
}

#[test]
fn incomplete_complete() {
    let complete = assignment("2024-01-01", "2024-01-20", 0);
    let now = date("2024-01-25");
    let incomplete = assignment("2024-01-01", "2024-01-30", 0);

    assert!(complete.is_complete(&now));
    assert!(!incomplete.is_complete(&now));

    assert_eq!(complete.cmp(&now, &incomplete), Ordering::Greater);

    let now = date("2024-01-25");
    let complete = assignment("2024-01-01", "2024-01-30", 100);
    let incomplete = assignment("2024-01-01", "2024-01-30", 0);

    assert!(complete.is_complete(&now));
    assert!(!incomplete.is_complete(&now));

    assert_eq!(complete.cmp(&now, &incomplete), Ordering::Greater);
}

#[test]
fn complete_complete() {
    let now = date("2024-02-01");
    let recently_due = assignment("2024-01-01", "2024-01-30", 0);
    let less_recently_due = assignment("2024-01-01", "2024-01-05", 0);

    assert!(recently_due.is_complete(&now));
    assert!(less_recently_due.is_complete(&now));

    assert_eq!(recently_due.cmp(&now, &less_recently_due), Ordering::Less);
}

#[test]
fn incomplete_out_incomplete_not_out() {
    let now = date("2024-01-15");
    let out = assignment("2024-01-01", "2024-02-01", 0);
    let not_out = assignment("2024-02-01", "2024-02-15", 0);

    assert!(!out.is_complete(&now));
    assert!(!not_out.is_complete(&now));

    assert!(out.is_out(&now));
    assert!(!not_out.is_out(&now));

    assert_eq!(out.cmp(&now, &not_out), Ordering::Less);
}

#[test]
fn incomplete_out_incomplete_out() {
    let now = date("2024-01-15");
    let due_soon = assignment("2024-01-01", "2024-02-01", 0);
    let due_later = assignment("2024-01-01", "2024-02-15", 0);

    assert!(!due_soon.is_complete(&now));
    assert!(!due_later.is_complete(&now));

    assert!(due_soon.is_out(&now));
    assert!(due_later.is_out(&now));

    assert_eq!(due_soon.cmp(&now, &due_later), Ordering::Less);
}

#[test]
fn incomplete_not_out_incomplete_not_out() {
    let now = date("2024-01-01");
    let out_soon = assignment("2024-02-01", "2024-02-10", 0);
    let out_later = assignment("2024-02-02", "2024-02-10", 0);

    assert!(!out_soon.is_complete(&now));
    assert!(!out_later.is_complete(&now));

    assert!(!out_soon.is_out(&now));
    assert!(!out_later.is_out(&now));

    assert_eq!(out_soon.cmp(&now, &out_later), Ordering::Less);
}

#[test]
fn sorting() {
    let now = date("2024-02-01");

    // Incomplete, Out, due soon - First
    let a = assignment("2024-01-01", "2024-02-02", 0);
    assert!(!a.is_complete(&now));
    assert!(a.is_out(&now));

    // Incomplete, Out, due later
    let b = assignment("2024-01-01", "2024-03-01", 0);
    assert!(!b.is_complete(&now));
    assert!(b.is_out(&now));

    // Incomplete, Not out, out soon
    let c = assignment("2024-03-01", "2024-04-01", 0);
    assert!(!c.is_complete(&now));
    assert!(!c.is_out(&now));

    // Incomplete, Not out, out later
    let d = assignment("2024-04-01", "2024-04-01", 0);
    assert!(!d.is_complete(&now));
    assert!(!d.is_out(&now));

    // Complete, recently due
    let e = assignment("2024-01-01", "2024-02-03", 100);
    assert!(e.is_complete(&now));

    // Complete, less recently due - Last
    let f = assignment("2024-01-01", "2024-01-15", 75);
    assert!(f.is_complete(&now));

    let mut assignments = vec![&b, &a, &c, &f, &e, &d];
    assignments.sort_by(|a, b| a.cmp(&now, b));
    assert_eq!(assignments, vec![&a, &b, &c, &d, &e, &f]);
}
