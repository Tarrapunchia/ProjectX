import Calendar from "./Calendar";
import PriorityChart from "./PriorityChart";

function DashboardProf() {
  return (
    <div className="grid grid-cols-3 gap-4 p-6 h-screen">

      {/* Colonna sinistra: calendario + grafico */}
      <div className="col-span-2 grid grid-rows-[50%_49%] grid-cols-[100%] gap-2">

        {/* Calendario */}
        <div className="bg-category-bg-color rounded-lg shadow p-4 overflow-hidden">
          <Calendar />
        </div>

        {/* Grafico */}
        <div className="bg-white rounded-lg shadow p-4">
          <PriorityChart />
        </div>

      </div>

      {/* Notifiche */}
    <div className="col-span-1 bg-white rounded-lg shadow p-4 overflow-y-auto text-gray-800">
        <h2 className="text-lg font-semibold mb-4 flex justify-center">Notifiche</h2>

        {/* Notifica */}
        <div className="flex items-start gap-3 py-3 border-b border-gray-200">
            <span className="text-blue-500 text-xl">•</span>
            <div>
                <p className="text-gray-800 font-medium">Nuovo task assegnato</p>
                <p className="text-gray-500 text-sm">2 minuti fa</p>
            </div>
        </div>

        {/* Notifica */}
        <div className="flex items-start gap-3 py-3 border-b border-gray-200">
            <span className="text-yellow-500 text-xl">•</span>
            <div>
                <p className="text-gray-800 font-medium">Deadline in arrivo</p>
                <p className="text-gray-500 text-sm">1 ora fa</p>
            </div>
        </div>

        {/* Notifica */}
        <div className="flex items-start gap-3 py-3">
            <span className="text-green-500 text-xl">•</span>
            <div>
                <p className="text-gray-800 font-medium">Progetto aggiornato</p>
                <p className="text-gray-500 text-sm">Ieri</p>
            </div>
        </div>
    </div>


    </div>
  );
}

export default DashboardProf;
