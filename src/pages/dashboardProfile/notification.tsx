

export default function Notification() {

  function renderNotification(color: string, message: string, time: string) 
  {
    return (
      <div
        className="
          flex items-start gap-3 p-3 rounded-lg cursor-pointer bg-gray-100
          hover:bg-gray-300 transition-colors shadow-sm">
        <span className={`${color} text-xl leading-none`}>•</span>

        <div className="flex-1">
          <p className="text-gray-800 font-medium">{message}</p>
          <p className="text-gray-500 text-sm">{time}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
        <h2 className="text-lg font-semibold mb-4 flex justify-center mb-12">
            Notifiche
        </h2>
        {renderNotification("text-blue-500", "Nuovo task assegnato", "2 minuti fa")}
        {renderNotification("text-yellow-500", "Deadline in arrivo", "1 ora fa")}
        {renderNotification("text-green-500", "Progetto aggiornato", "Ieri")}
        {renderNotification("text-red-500", "Task scaduto", "3 giorni fa")}
    </div>
  );
}

