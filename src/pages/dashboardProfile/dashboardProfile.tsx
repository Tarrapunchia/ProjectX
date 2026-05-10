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

	const handleProfileUpdate = async (data: any) => 
	{
		console.log("Dati ricevuti dal Modal:", data);
		
		// Esempio: invio al tuo backend
		// await helpers.poster('/api/v1/users/complete-profile', data);
		
		// Chiudiamo il pop-up dopo il salvataggio
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
			<div className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_1.5fr] gap-2 px-5 pt-5 pb-4 lg:p-6 min-w-full">

				<FirstLogin
					isOpen={isPopupOpen}
					onClose={() => setIsPopupOpen(false)}
					onSave={handleProfileUpdate}
				/>
				
				{/* Colonna Sinistra */}
				<div className="col-span-1 lg:col-span-2 grid grid-cols-1 gap-2">

					{/* Calendario */}
					<div className="bg-side-bg-color border border-overlay-border-color rounded-lg shadow p-4 overflow-hidden relative min-h-[350px] text-base leading-tight text-text-main">
						<Calendar />
					</div>

					{/* Grafico */}
					<div className="min-h-75 bg-side-bg-color text-text-main max-h-full overflow-hidden">
						{infoFetched ? <PriorityChart taskData={ tasksInfos }/> : <PriorityChart taskData={ MOCK_USER_TASKS }/>}
					</div>

				</div>

				{/* Notifiche - Ridotto il min-h così non spinge troppo in basso */}
				<div className="bg-side-bg-color col-span-1 rounded-lg shadow p-4 overflow-y-auto border border-overlay-border-color min-h-[300px] lg:h-full">
					<Notification />
				</div>

			</div>
		);
	}

	export default DashboardProf;
