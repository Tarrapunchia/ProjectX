import { useEffect, useState } from "react";
import Calendar from "./Calendar";
import PriorityChart from "./PriorityChart";
import Notification from "./notification";
import helpers from "../../utilities/helpers";
import type { TaskInfos } from "../../data/types";
import { MOCK_USER_TASKS } from "../../data/mockData";
import { useLocation } from "react-router-dom";
import FirstLogin from "../PopUpFirstLogin/firstLoginpage"


function DashboardProf() 
{
	const [tasksInfos, setTasksInfo] = useState<TaskInfos>(MOCK_USER_TASKS)
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

			// se l'utente ricarica la pagina (F5), il popup non si riapre da solo.
			window.history.replaceState({}, document.title);
		}

		(async () => {
			const tasks = await helpers.getter('/api/v1/tasks/activeUserTasks', null)
			if (tasks.success) {
			setTasksInfo(tasks.data)
			setInfoFetched(true)
			}
			else {
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
			

				<div className="col-span-1 lg:col-span-2 flex flex-col gap-2 h-auto lg:h-full">
					
					{/* Calendario - h-[400px] su mobile, flex-1 su desktop */}
					<div className="h-[400px] lg:flex-1 bg-side-bg-color border border-overlay-border-color rounded-lg shadow p-4">
						<Calendar />
					</div>

					{/* Grafico - h-[400px] su mobile, flex-1 su desktop */}
					<div className="h-[400px] lg:flex-1 bg-side-bg-color">
						{infoFetched ? <PriorityChart taskData={tasksInfos}/> : <PriorityChart taskData={MOCK_USER_TASKS}/>}
					</div>

				</div>

				{/* Notifiche */}
				<div className="col-span-1 bg-side-bg-color rounded-lg shadow p-4 border border-overlay-border-color h-[400px] lg:h-full">
					<Notification />
				</div>

			</div>
		);
	}

	export default DashboardProf;
