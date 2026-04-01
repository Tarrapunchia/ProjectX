import { Temporal } from "@js-temporal/polyfill";
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import { createViewWeek, createViewMonthGrid } from "@schedule-x/calendar";
import "@schedule-x/theme-default/dist/index.css";
import "./dashboardProfile.css";

function Calendar() {
  const calendar = useCalendarApp({
    views: [
      createViewWeek(),
      createViewMonthGrid(),
    ],
    events: [
    ]
  });

  return (
    <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0 overflow-y-auto">
            <ScheduleXCalendar calendarApp={calendar} />
        </div>
    </div>
  );
}

export default Calendar;
