import { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import itLocale from "@fullcalendar/core/locales/it";
import "./dashboardProfile.css";

type SelectedEvent = {
  title: string;
  start: string;
  end?: string;
};

function Calendar() 
{
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  function closeModal() 
  {
    setIsClosing(true);
    setTimeout(() => 
    {
      setSelectedEvent(null);
      setIsClosing(false);
    }, 180);
  }

  useEffect(() => 
  {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeModal();
      }
    }

    if (selectedEvent) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedEvent]);

  return (
    <div className="relative h-full w-full">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        handleWindowResize={true}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        initialDate={new Date().toISOString().split("T")[0]}
        locale={itLocale}
        height="100%"
        aspectRatio={2}
        events={[
          {
            title: "Evento Test",
            start: "2026-04-01T10:00:00",
            end: "2026-04-01T12:00:00",
          },
        ]}
        eventClick={(info) => 
        {
          setSelectedEvent({
            title: info.event.title,
            start: info.event.start?.toLocaleString() ?? "",
            end: info.event.end?.toLocaleString()});
        }}
        editable={true}
        selectable={true}
      />

      {selectedEvent && (
        <div
            ref={modalRef}
            className={`
              absolute inset-0 bg-bg-color/85 z-50
              flex flex-col items-center justify-center
              gap-4 p-6 rounded-lg
              ${isClosing ? "animate-fadeZoomOut" : "animate-fadeZoomIn"}
            `}
          >

          <h2 className="text-xl font-semibold text-white">
            {selectedEvent.title}
          </h2>

          <p className="text-green-300">
            <span className="font-medium">Inizio:</span> {selectedEvent.start}
          </p>

          <p className="text-red-300">
            <span className="font-medium">Fine:</span> {selectedEvent.end}
          </p>

          <button
            className="
              bg-bg-color text-white
              hover:bg-gray-700
              border border-gray-600
              focus:ring-4 focus:ring-gray-500/40
              font-medium leading-5 rounded-base text-xs px-3 py-2
              focus:outline-none
            "
            onClick={(e) =>
            {
              e.stopPropagation();
              closeModal();
            }}
          >
            Chiudi
          </button>
        </div>
      )}

    </div>
  );
}

export default Calendar;

