ScriptFlow Pro - Analytics Booking Definition

The Today / Week / Month counters and Analytics Hub scheduling metrics are centralized on one definition:

A booking is counted when an appointment is a meeting appointment and its createdAt timestamp falls inside the selected calendar period.

Important:
- appointment.date is the date the meeting is supposed to occur.
- appointment.createdAt is the date/time the appointment was newly scheduled.
- Today/Week/Month counts use createdAt.
- A meeting scheduled today for next month counts Today and Month (because it was newly scheduled today/this month).
- A meeting created last month but scheduled to occur today does NOT count Today/Week/Month.
- Callback-only appointments are excluded.
- Missing/invalid createdAt is excluded from booking-period metrics rather than falling back to appointment.date.
- Firebase user data is already scoped to the signed-in user's users/{uid}/appointments collection, so the counters are per signed-in user.

This definition is intentionally centralized in Utils.getAppointmentCreatedAt(), Utils.getAppointmentCreationDateKey(), Utils.isNewlyScheduledAppointment(), and Stats.getNewlyScheduledAppointments().
