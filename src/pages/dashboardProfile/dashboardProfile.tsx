import { useEffect, useState } from "react";
import Calendar from "./Calendar";
import PriorityChart from "./PriorityChart";
import Notification from "./notification";
import helpers from "../../utilities/helpers";
import type { TaskInfos } from "../../data/types";
import { MOCK_USER_TASKS } from "../../data/mockData";
import { useLocation } from "react-router-dom";
import FirstLogin from "../PopUpFirstLogin/firstLoginpage"

function DashboardProf() {
  	const [tasksInfos, setTasksInfo] = useState<TaskInfos>(MOCK_USER_TASKS)
  	const [infoFetched, setInfoFetched] = useState<boolean>(false)

	const [isPopupOpen, setIsPopupOpen] = useState(true);

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
		<div className="grid grid-cols-[2fr_2fr_1.5fr] gap-4 p-6 h-full w-full">

			<FirstLogin 
				isOpen={isPopupOpen}
				onClose={() => setIsPopupOpen(false)}
				onSave={handleProfileUpdate}
			/>
		{/* Colonna sinistra: calendario + grafico */}
		<div className="col-span-2 grid grid-rows-[50%_49%] grid-cols-[100%] gap-2">

			{/* Calendario */}
			<div className="border border-radius: 8px border-overlay-border-color rounded-lg shadow p-4 overflow-hidden relative h-full w-full text-base leading-tight text-white">
				<Calendar />
			</div>

			{/* Grafico */}
			{(infoFetched && <PriorityChart taskData={ tasksInfos }/>)}
			{(!infoFetched && <PriorityChart taskData={ MOCK_USER_TASKS }/>)}

		</div>

		{/* Notifiche */}
		<div className="col-span-1 rounded-lg shadow p-4 overflow-y-auto text-gray-800 border border-radius: 8px border-overlay-border-color">
			<Notification />
		</div>

		</div>
	);
	}

	export default DashboardProf;
