import { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import itLocale from "@fullcalendar/core/locales/it";
import helpers from "../../utilities/helpers";
import type { CalendarEntries, ProjectTasks, Event as ApiEvent } from "../../data/types";

type SelectedEvent = {
  id: string;
  name: string;
  start: string;
  end?: string;
  type?: string;
  description?: string;
  status?: string;
};

type FCEvent = {
  id: string;
  title: string;
  start: string | Date;
  end?: string | Date;
  extendedProps?: Record<string, any>;
};

function toIsoOrDateString(d: any): string {
  // se è già string ISO ok, se è Date ok, altrimenti best effort
  if (!d) return "";
  if (typeof d === "string") return d;
  if (d instanceof Date) return d.toISOString();
  return String(d);
}

function mapCalendarEntriesToFullCalendar(entries: CalendarEntries): FCEvent[] {
  const taskEvents: FCEvent[] = (entries.tasks ?? []).map((t: ProjectTasks) => ({
    id: `task:${t.id}`,
    title: `🧩 ${t.name}`,
    start: toIsoOrDateString(t.dueDate ?? t.createdAt), // se non hai dueDate, fallback createdAt
    end: undefined,
    extendedProps: {
      kind: "task",
      status: t.status,
      priority: t.priority,
      description: t.description,
      projectId: t.projectId,
    },
  }));

  const calendarEvents: FCEvent[] = (entries.events ?? []).map((e: ApiEvent) => ({
    id: `event:${e.id}`,
    title: `📅 ${e.name}`,
    start: toIsoOrDateString(e.dueDate ?? e.createdAt),
    end: undefined, // se hai end date mettila qui
    extendedProps: {
      kind: "event",
      type: e.type,
      description: e.description,
      ownerId: e.ownerId,
    },
  }));

  return [...taskEvents, ...calendarEvents];
}

function Calendar() {
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);
  const [fcEvents, setFcEvents] = useState<FCEvent[]>([]);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  function closeModal() {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedEvent(null);
      setIsClosing(false);
    }, 180);
  }

  // carica eventi al mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await helpers.getter("/api/v1/users/calendarEntries", null);
        console.log("calendarEntries raw:", res);

        // ✅ adattati al tuo helpers.getter:
        // - se getter ritorna direttamente CalendarEntries -> entries = res
        // - se ritorna { success, data } -> entries = res.data
        const entries: CalendarEntries = (res?.data ?? res) as CalendarEntries;

        if (!cancelled && entries) {
          setFcEvents(mapCalendarEntriesToFullCalendar(entries));
        }
      } catch (e) {
        console.log("Errore fetch calendarEntries:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // click fuori modal
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) closeModal();
    }
    if (selectedEvent) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedEvent]);

  return (
    <div className="relative h-full w-full">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        locale={itLocale}
        height="100%"
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
        <div
          className={`absolute inset-0 bg-black/70 z-50 flex items-center justify-center p-6
            ${isClosing ? "animate-fadeZoomOut" : "animate-fadeZoomIn"}`}
        >
          <div ref={modalRef} className="rounded-lg bg-zinc-900 p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white">{selectedEvent.name}</h2>

            <p className="text-green-300 mt-3">
              <b>Inizio:</b> {selectedEvent.start}
            </p>

            <p className="text-red-300 mt-1">
              <b>Fine:</b> {selectedEvent.end ?? "-"}
            </p>

            {selectedEvent.status && (
              <p className="text-white/80 mt-2"><b>Status:</b> {selectedEvent.status}</p>
            )}

            {selectedEvent.type && (
              <p className="text-white/80 mt-1"><b>Type:</b> {selectedEvent.type}</p>
            )}

            {selectedEvent.description && (
              <p className="text-white/80 mt-2"><b>Description:</b> {selectedEvent.description}</p>
            )}

            <button className="mt-5 px-3 py-2 text-xs border rounded" onClick={closeModal}>
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;