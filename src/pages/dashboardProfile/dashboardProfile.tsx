import Calendar from "./Calendar";
import PriorityChart from "./PriorityChart";
import Notication from "./notification";

function DashboardProf() {
  return (
    <div className="grid grid-cols-[2fr_2fr_1.5fr] gap-4 p-6 h-full w-full">

      {/* Colonna sinistra: calendario + grafico */}
      <div className="col-span-2 grid grid-rows-[50%_49%] grid-cols-[100%] gap-2">

        {/* Calendario */}
        <div className="bg-white rounded-lg shadow p-4 overflow-hidden">
          <Calendar />
        </div>

        {/* Grafico */}
        <div className="bg-white rounded-lg shadow p-4">
          <PriorityChart />
        </div>

      </div>

      {/* Notifiche */}
      <div className="col-span-1 bg-white rounded-lg shadow p-4 overflow-y-auto text-gray-800">
        <Notication />
      </div>

    </div>
  );
}

export default DashboardProf;
