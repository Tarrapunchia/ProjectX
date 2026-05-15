import { useEffect, useState } from "react";
import Calendar from "./Calendar";
import PriorityChart from "./PriorityChart";
import Notification from "./notification";
import helpers from "../../utilities/helpers";
import type { TaskInfos } from "../../data/types";
import { useLocation } from "react-router-dom";
import FirstLogin from "../PopUpFirstLogin/firstLoginpage"


function DashboardProf() 
{
	const [tasksInfos, setTasksInfo] = useState<TaskInfos | null>(null)
	const [infoFetched, setInfoFetched] = useState<boolean>(false)

	const [isPopupOpen, setIsPopupOpen] = useState(false);

	const location = useLocation();

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
			window.history.replaceState({}, document.title);
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
		
		<div className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_1.5fr] gap-2 w-full h-full">

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
				<Notification />
			</div>

		</div>
	);
	}

	export default DashboardProf;
