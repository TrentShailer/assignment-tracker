use chrono::{NaiveDateTime, TimeDelta};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

/// Data representation of an assignment, matching the database's model.
#[derive(Serialize, Deserialize, FromRow, PartialEq, Debug)]
pub struct Assignment {
    pub id: Uuid,
    pub course_id: Uuid,
    pub name: String,
    pub out_date: NaiveDateTime,
    pub due_date: NaiveDateTime,
    pub progress: i16,
}

impl Assignment {
    /// Compares such that they are ordered as:
    /// 1. Incomplete, Out, due soon - First
    /// 2. Incomplete, Out, due later
    /// 3. Incomplete, Not out, out soon
    /// 4. Incomplete, Not out, out later
    /// 5. Complete, recently due
    /// 6. Complete, less recently due - Last
    pub fn cmp(&self, now: &NaiveDateTime, other: &Self) -> std::cmp::Ordering {
        let self_complete = self.is_complete(now);
        let other_complete = other.is_complete(now);

        if !self_complete && !other_complete {
            let self_out = self.is_out(now);
            let other_out = other.is_out(now);

            if self_out && other_out {
                self.due_date.cmp(&other.due_date)
            } else if !self_out && !other_out {
                self.out_date.cmp(&other.out_date)
            } else {
                self_out.cmp(&other_out).reverse()
            }
        } else if self_complete && other_complete {
            self.due_date.cmp(&other.due_date).reverse()
        } else {
            self_complete.cmp(&other_complete)
        }
    }

    /// Returns if an assignment is 'complete'. An assignment is complete if:
    /// 1. It is past it's due date, or
    /// 2. It's progress is 100%.
    pub fn is_complete(&self, now: &NaiveDateTime) -> bool {
        // positive if past due date
        let duration_since_due_date = now.signed_duration_since(self.due_date);
        self.progress == 100 || duration_since_due_date >= TimeDelta::zero()
    }

    /// An assignment is out if it's due date is after `now`.
    pub fn is_out(&self, now: &NaiveDateTime) -> bool {
        now.signed_duration_since(self.out_date) >= TimeDelta::zero()
    }
}
