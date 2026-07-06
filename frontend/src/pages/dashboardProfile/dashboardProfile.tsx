import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Calendar from "./Calendar";
import PriorityChart from "./PriorityChart";
import Requests from "./requests";
import helpers from "../../utilities/helpers";
import type { TaskInfos } from "../../data/types";
import { useLocation, useNavigate } from "react-router-dom";
import FirstLogin from "../PopUpFirstLogin/firstLoginpage"
import { Plus } from "lucide-react"
import CreateEventModal from "../EventModal/CreateEventModal";
import { useWebSocket } from "../../utilities/WebSocketContext";

function DashboardProf() 
{
    const { t } = useTranslation();
    const [tasksInfos, setTasksInfo] = useState<TaskInfos | null>(null)
	const { setActiveUser } = useWebSocket();
    const [infoFetched, setInfoFetched] = useState<boolean>(false)
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);

    const handleProfileUpdate = async (formData: any) =>
    {
        const { avatarFile, ...profileData } = formData;

        try {
            if (avatarFile) 
			{
                const fileUploadData = new FormData();
                fileUploadData.append("file", avatarFile);

                const avatarRes = await helpers.uploadFile("/api/v1/files/avatar", fileUploadData);

                if (avatarRes.success) {
                    console.log(t("dashboard.avatar_upload_success"));
                } else {
                    console.error(t("dashboard.avatar_upload_failed"), avatarRes);
                }
            }

            const { success } = await helpers.putter('/api/v1/users/modifyUserProfile', profileData);

            if (success) {
				setActiveUser((prev: any) => prev ? { ...prev, ...profileData } : null);
            } else {
                console.error(t("dashboard.error_fetching"));
            }
        } catch (error) {
            console.error("Errore di rete o di esecuzione:", error);
        } finally {
            setIsPopupOpen(false);
        }
    };

    useEffect(() => 
    {
        if (location.state?.isFirstLogin) 
        {
            setIsPopupOpen(true);
            navigate(location.pathname, { replace: true, state: {} });
        }

        (async () => 
        {
            const tasks = await helpers.getter('/api/v1/tasks/activeUserTasks', null)
            if (tasks.success) 
            {
                setTasksInfo(tasks.data)
                setInfoFetched(true)
            }
            else 
            {
                console.log(t('dashboard.error_fetching'))
                setInfoFetched(false)
            }
        })()
        return () => {};
    }, [location.state]);

    return (
        <div className="w-full h-full lg:overflow-hidden overflow-y-auto custom-scrollbar p-2">
                
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 ml-2">
                <button 
                    onClick={() => setIsEventModalOpen(true)}
                    className="flex items-center gap-2 bg-owner-color text-white px-5 py-2.5 rounded-xl hover:scale-105 transition-all shadow-lg text-sm font-bold cursor-pointer active:scale-95"
                >
                    <Plus size={18} />
                    {t("dashboard.create_event")}
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_1.5fr] gap-2 w-full h-[94%]">

                <FirstLogin
                    isOpen={isPopupOpen}
                    onClose={() => setIsPopupOpen(false)}
                    onSave={handleProfileUpdate}
                />

                <div className="col-span-1 lg:col-span-2 flex flex-col gap-2 h-auto lg:h-full ">
                    
                    <div className="h-[400px] lg:flex-1 bg-side-bg-color border border-overlay-border-color rounded-lg shadow p-4 min-h-[50%] custom-scrollbar">
                        <Calendar />
                    </div>

                    <div className="h-[400px] lg:flex-1 bg-side-bg-color min-h-[49%] border border-overlay-border-color rounded-lg">
                        <PriorityChart taskData={infoFetched ? tasksInfos : null} />
                    </div>

                </div>

                {/* Notifiche */}
                <div className="col-span-1 bg-side-bg-color rounded-lg shadow p-2 border border-overlay-border-color lg:h-full flex flex-col min-h-0 h-[500px] mb-8 lg:mb-0">
                    <Requests />
                </div>

                {isEventModalOpen && (
                    <CreateEventModal onClose={() => setIsEventModalOpen(false)} />
                )}
            </div>
        </div>
    );
}

export default DashboardProf;