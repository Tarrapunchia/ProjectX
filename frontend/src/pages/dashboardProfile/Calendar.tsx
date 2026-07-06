import { useState, useEffect, useRef, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import itLocale from "@fullcalendar/core/locales/it";
import enLocale from "@fullcalendar/core/locales/en-gb";
import esLocale from "@fullcalendar/core/locales/es";
import { Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CalendarEntries, ProjectTasks, Event as ApiEvent, SelectedEvent, FCEvent } from "../../data/types";
import { useWebSocket } from "../../utilities/WebSocketContext";
import ModifyEventModal from "../EventModal/ModifyEventModal";
import helpers from "../../utilities/helpers";

const taskColors = [
  "cornflowerblue", "steelblue", "royalblue", "seagreen", "forestgreen",
  "goldenrod", "darkorange", "tomato", "slategray", "mediumpurple",
];

function mapCalendarEntriesToFullCalendar(entries: CalendarEntries): FCEvent[] 
{
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

    const calendarEvents: FCEvent[] = (entries.events ?? []).map((e: ApiEvent, i) => ({
        id: `event:${e.id}`,
        title: `📅 ${e.name}`,
        start: e.dueDate,
        color: taskColors[i % 75],
        extendedProps: {
            kind: "event", 
            type: e.type, 
            description: e.description,
            ownerId: e.ownerId,
            participants: e.participants
        },
    }));

    return [...taskEvents, ...calendarEvents];
}

const locales = {
  it: itLocale,
  en: enLocale,
  es: esLocale
};

function Calendar() 
{
	const { t, i18n } = useTranslation();
    const { activeUser, calendarEntries } = useWebSocket();
    const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);
    const modalRef = useRef<HTMLDivElement | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
    const [isModifyOpen, setIsModifyOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const fcEvents = useMemo(() => {
        if (!calendarEntries) return [];
        return mapCalendarEntriesToFullCalendar(calendarEntries);
    }, [calendarEntries]);

    function closeModal() {
        setIsClosing(true);
        setTimeout(() => {
        setSelectedEvent(null);
        setIsModifyOpen(false);
        setIsClosing(false);
        }, 180);
    }

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (isModifyOpen) return; 
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) closeModal();
        }
        if (selectedEvent) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [selectedEvent, isModifyOpen]);

    const handleDeleteEvent = async () => 
    {
        if (!selectedEvent) return;

        const eventId = String(selectedEvent.id).replace("event:", "");

        try 
        {
            setIsDeleting(true);

            const response = await helpers.deleter(`/api/v1/events/${eventId}`);

            if (!response.success) {
                throw new Error("Failed to delete event");
            }

            closeModal();

        } catch (error) {
            console.error("Errore durante l'eliminazione:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="relative h-full w-full
            [&_.fc-scroller::-webkit-scrollbar]:!w-[10px]
            [&_.fc-scroller::-webkit-scrollbar]:!h-[10px]

            /* .custom-scrollbar::-webkit-scrollbar-track */
            [&_.fc-scroller::-webkit-scrollbar-track]:!rounded-[100vh]
            [&_.fc-scroller::-webkit-scrollbar-track]:!bg-[#0000000]

            /* .custom-scrollbar::-webkit-scrollbar-thumb */
            [&_.fc-scroller::-webkit-scrollbar-thumb]:!bg-[var(--color-text)]
            [&_.fc-scroller::-webkit-scrollbar-thumb]:!rounded-[100vh]
            [&_.fc-scroller::-webkit-scrollbar-thumb]:!border-t-[1px]
            [&_.fc-scroller::-webkit-scrollbar-thumb]:!border-t-solid
            [&_.fc-scroller::-webkit-scrollbar-thumb]:!border-t-[#00000000]
            [&_.fc-scroller::-webkit-scrollbar-thumb]:!border-b-[1px]
            [&_.fc-scroller::-webkit-scrollbar-thumb]:!border-b-solid
            [&_.fc-scroller::-webkit-scrollbar-thumb]:!border-b-[#00000000]

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
            locale={locales[i18n.language as keyof typeof locales] || itLocale}
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
                    rawStart: info.event.start?.toISOString() ?? "",
                    type: ext?.type,
                    description: ext?.description,
                    status: ext?.status,
                    ownerId: ext?.ownerId,
                    participants: ext?.participants || []
                } as any);
            }}
            editable
            selectable
        />

        {/* MODAL DI VISUALIZZAZIONE */}
        {selectedEvent && (
            <div className={`absolute inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 ${isClosing ? "animate-fadeZoomOut" : "animate-fadeZoomIn"}`}>
                <div ref={modalRef} className="rounded-lg bg-zinc-900 p-6 w-full max-w-md shadow-2xl border border-zinc-700 relative">
                    <h2 className="text-xl font-semibold text-white">{selectedEvent.name}</h2>
                    <p className="text-green-300 mt-3 text-sm"><b>{t('calendar.modal.start')}:</b> {selectedEvent.start}</p>
                    {selectedEvent.status && <p className="text-white/80 mt-2 text-sm"><b>{t('calendar.modal.status')}:</b> {selectedEvent.status}</p>}
                    {selectedEvent.type && <p className="text-white/80 mt-1 text-sm"><b>{t('calendar.modal.type')}:</b> {selectedEvent.type}</p>}
                    {selectedEvent.description && <p className="text-white/80 mt-2 text-sm text-pretty"><b>{t('calendar.modal.description')}:</b> {selectedEvent.description}</p>}
                    
                    <div className="flex gap-2 mt-5">
                        {String(selectedEvent.id).startsWith("event:") && String(activeUser?.id) === String(selectedEvent.ownerId) && (
                            <>
                                <button 
                                    className="px-4 py-2 text-xs bg-owner-color text-white rounded font-bold hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
                                    onClick={() => setIsModifyOpen(true)}
                                >
                                    {t('calendar.modal.modify')}
                                </button>
                                
                                <button 
                                    className="flex items-center gap-1 px-4 py-2 text-xs bg-red-600/20 text-white border border-red-600/30 rounded font-bold hover:bg-red-600 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleDeleteEvent}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    {isDeleting ? t('calendar.modal.deleting') : t('calendar.modal.delete')}
                                </button>
                            </>
                        )}
                        <button 
                            className="px-4 py-2 text-xs border border-white/20 rounded hover:bg-white/10 text-white transition-colors cursor-pointer ml-auto" 
                            onClick={closeModal}
                        >
                            {t('calendar.modal.close')}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* MODAL DI MODIFICA */}
        {isModifyOpen && selectedEvent && (
            <ModifyEventModal 
                event={selectedEvent} 
                onClose={(updatedData?: any) => {
                    setIsModifyOpen(false);
                    
                    if (updatedData) {
                        setSelectedEvent(prev => prev ? {
                            ...prev,
                            name: `📅 ${updatedData.name}`,
                            type: updatedData.type,
                            description: updatedData.message, 
                            start: new Date(updatedData.dueDate).toLocaleString() 
                        } : null);
                    }
                }} 
            />
        )}
        </div>
    );
}

export default Calendar;