import { useEffect, useState } from "react";
import Calendar from "./Calendar";
import PriorityChart from "./PriorityChart";
import Requests from "./requests";
import helpers from "../../utilities/helpers";
import type { TaskInfos } from "../../data/types";
import { useLocation, useNavigate } from "react-router-dom";
import FirstLogin from "../PopUpFirstLogin/firstLoginpage"
import { Plus } from "lucide-react"
import CreateEventModal from "../EventModal/CreateEventModal";

function DashboardProf() 
{
	const [tasksInfos, setTasksInfo] = useState<TaskInfos | null>(null)
	const [infoFetched, setInfoFetched] = useState<boolean>(false)
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	const [isEventModalOpen, setIsEventModalOpen] = useState(false);

	const handleProfileUpdate = async (formData: any) =>
	{
		console.log("Dati ricevuti dal Modal:", formData);
		
		const { success } = await helpers.putter('/api/v1/users/modifyUserProfile', formData);

		if (success) {
			console.log("Profilo aggiornato!");
			
		} else {
			console.error("Errore durante l'aggiornamento:");
		}
		setIsPopupOpen(false);
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
				console.log('non fetchato')
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
					Create Event
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
