import { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import itLocale from "@fullcalendar/core/locales/it";
import helpers from "../../utilities/helpers";
import type { CalendarEntries, ProjectTasks, Event as ApiEvent, SelectedEvent, FCEvent } from "../../data/types";

const taskColors = [
  "cornflowerblue", "steelblue", "royalblue", "seagreen", "forestgreen",
  "goldenrod", "darkorange", "tomato", "slategray", "mediumpurple",
];

function mapCalendarEntriesToFullCalendar(entries: CalendarEntries): FCEvent[] {
  const taskEvents: FCEvent[] = (entries.tasks ?? []).map((t: ProjectTasks, i) => ({
    id: `task:${t.id}`,
    title: `🧩 ${t.name}`,
    start: t.dueDate ?? t.createdAt,
    end: t.dueDate ?? undefined,
    color: taskColors[i % 10],
    extendedProps: {
      kind: "task", status: t.status, priority: t.priority,
      description: t.description, projectId: t.projectId,
    },
  }));

  const calendarEvents: FCEvent[] = (entries.events ?? []).map((e: ApiEvent) => ({
    id: `event:${e.id}`,
    title: `📅 ${e.name}`,
    start: e.dueDate,
    end: undefined,
    color: 'blue',
    extendedProps: {
      kind: "event", type: e.type, description: e.description, ownerId: e.ownerId,
    },
  }));

  return [...taskEvents, ...calendarEvents];
}

function Calendar() {
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);
  const [fcEvents, setFcEvents] = useState<FCEvent[]>([]);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  // --- LOGICA RESPONSIVE ---
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // --------------------------

  function closeModal() {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedEvent(null);
      setIsClosing(false);
    }, 180);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await helpers.getter("/api/v1/users/calendarEntries", null);
        const entries: CalendarEntries = (res?.data) as CalendarEntries;
        if (!cancelled && entries) {
          setFcEvents(mapCalendarEntriesToFullCalendar(entries));
        }
      } catch (e) {
        console.log("Errore fetch calendarEntries:", e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) closeModal();
    }
    if (selectedEvent) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedEvent]);

  return (
    <div className="relative h-full w-full
        [&_.fc-button]:!bg-category-bg-color
        [&_.fc-button]:!border-overlay-border-color
        [&_.fc-button]:!text-text-main
        [&_.fc-button]:!font-bold
        [&_.fc-button]:!transition-all
        [&_.fc-button:hover]:!bg-zinc-800
        [&_.fc-button:hover]:!text-white
        [&_.fc-button-active]:!bg-owner-color
        [&_.fc-button-active]:!border-owner-color
        [&_.fc-button-active]:!text-white
        [&_.fc-daygrid-day-number]:!text-text-main
        [&_.fc-button:focus]:!shadow-none
        /* Fix per titoli lunghi su mobile */
        [&_.fc-toolbar-title]:!text-sm
        md:[&_.fc-toolbar-title]:!text-xl
        [&_.fc-toolbar]:flex-wrap
        [&_.fc-toolbar]:gap-2
    ">
      <FullCalendar
        key={isMobile ? "mobile" : "desktop"}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        handleWindowResize={true}
        headerToolbar={{
          left: isMobile ? "prev,next" : "prev,next today",
          center: "title",
          right: isMobile ? "timeGridDay,dayGridMonth" : "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        initialDate={new Date().toISOString().split("T")[0]}
        locale={itLocale}
        height="100%"
        aspectRatio={isMobile ? 0.8 : 2}
        dayHeaderContent={(args) => ({
            html: `<span class='text-text-main text-xs md:text-base'>${args.text}</span>`
        })}
        events={fcEvents}
        eventClick={(info) => {
          const ext = info.event.extendedProps as any;
          setSelectedEvent({
            id: String(info.event.id),
            name: info.event.title,
            start: info.event.start?.toLocaleString() ?? "",
            end: info.event.end?.toLocaleString(),
            type: ext?.type,
            description: ext?.description,
            status: ext?.status,
          });
        }}
        editable
        selectable
      />

      {selectedEvent && (
        <div className={`absolute inset-0 bg-black/70 z-[100] flex items-center justify-center p-4
            ${isClosing ? "animate-fadeZoomOut" : "animate-fadeZoomIn"}`}>
          <div ref={modalRef} className="rounded-lg bg-zinc-900 p-6 w-full max-w-md shadow-2xl border border-zinc-700">
            <h2 className="text-xl font-semibold text-white">{selectedEvent.name}</h2>
            <p className="text-green-300 mt-3 text-sm"><b>Inizio:</b> {selectedEvent.start}</p>
            <p className="text-red-300 mt-1 text-sm"><b>Fine:</b> {selectedEvent.end ?? "-"}</p>
            {selectedEvent.status && <p className="text-white/80 mt-2 text-sm"><b>Status:</b> {selectedEvent.status}</p>}
            {selectedEvent.type && <p className="text-white/80 mt-1 text-sm"><b>Type:</b> {selectedEvent.type}</p>}
            {selectedEvent.description && <p className="text-white/80 mt-2 text-sm text-pretty"><b>Description:</b> {selectedEvent.description}</p>}
            <button className="mt-5 w-full md:w-auto px-4 py-2 text-xs border border-white/20 rounded hover:bg-white/10 text-white transition-colors" onClick={closeModal}>
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;