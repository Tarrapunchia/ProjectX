import { useEffect, useState } from "react";
import Calendar from "./Calendar";
import PriorityChart from "./PriorityChart";
import Notification from "./notification";
import helpers from "../../utilities/helpers";
import type { TaskInfos } from "../../data/types";
import { MOCK_USER_TASKS } from "../../data/mockData";

function DashboardProf() {
  const [tasksInfos, setTasksInfo] = useState<TaskInfos>(MOCK_USER_TASKS)
  const [infoFetched, setInfoFetched] = useState<boolean>(false)
  
    useEffect(() => {
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
    }, []);
  return (
    <div className="grid grid-cols-[2fr_2fr_1.5fr] gap-4 p-6 h-full w-full">

      {/* Colonna sinistra: calendario + grafico */}
      <div className="col-span-2 grid grid-rows-[50%_49%] grid-cols-[100%] gap-2">

        {/* Calendario */}
        <div className="bg-white rounded-lg shadow p-4 overflow-hidden relative h-full w-full text-base leading-tight text-gray-800">
          <Calendar />
        </div>

        {/* Grafico */}
        {(infoFetched && <PriorityChart taskData={ tasksInfos }/>)}
        {(!infoFetched && <PriorityChart taskData={ MOCK_USER_TASKS }/>)}

      </div>

      {/* Notifiche */}
      <div className="col-span-1 bg-white rounded-lg shadow p-4 overflow-y-auto text-gray-800">
        <Notification />
      </div>

    </div>
  );
}

export default DashboardProf;
