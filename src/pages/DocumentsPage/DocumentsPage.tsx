import { useState, useEffect } from "react";
import type { ProjectInfo } from "../../data/types"
import helpers from "../../utilities/helpers" 

type FileItem = {
  id: string;
  name: string;
  url: string;
  type: "image" | "pdf" | "doc" | "zip" | "text";
};

interface ChatPageProps {
    selectedProject: ProjectInfo | null
}

export default function DocumentsPage({ selectedProject }: ChatPageProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [preview, setPreview] = useState<FileItem | null>(null);

  useEffect(() => {
    // Funzione per caricare i file dall'API
	
    const loadFiles = async () => {
	  if (!selectedProject)
		return
      try {
        let data = (await helpers.getter("/api/v1/projects/" + selectedProject?.id, null)).data

		const organizationId = data.organization.id
        const BASE_URL = "http://localhost:5000/api/v1/files/files/preview/" + organizationId + "/" + selectedProject?.id 
		const files_url = "/api/v1/files/" + organizationId + "/" + selectedProject?.id

		data = (await helpers.getter(files_url, null)).data
        const formatted = data.files.map((name: string, i: number) => ({
          id: String(i + 1),
          name: name,
          url: `${BASE_URL}/${name}`,
          type: name.endsWith('.txt') ? "text" : 
                name.match(/\.(png|jpg|jpeg|gif)$/i) ? "image" : "doc"
        }));

        setFiles(formatted);
      } catch (error) {
        console.error("Errore nel fetch:", error);
      }
    };

    loadFiles();
  }, [selectedProject]);

  if (!selectedProject)
	return <div className="flex h-full items-center justify-center text-gray-500">Select a project.</div>

  return (
    <div className="p-6">
      {/* GRIGLIA FILE REATTIVA */}
      {/* grid-cols-1 (mobile), sm:grid-cols-2 (tablet), lg:grid-cols-4 (desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => setPreview(file)}
            className="group cursor-pointer flex flex-col rounded-lg shadow-sm border 
			overflow-hidden hover:shadow-md border border-radius: 14px border-overlay-border-color hover:border-white transition-all"
          >
            {/* AREA PREVIEW (Il quadrato) */}
		<div className="bg-overlay-border-color flex justify-center items-center overflow-auto min-h-[300px]">
		{file.type === "image" ? (
			<img
			src={file.url}
			alt={file.name}
			className="max-w-full max-h-[70vh] object-contain shadow-sm"
			/>
		) : 
		(
			<div className="py-20 text-center">
			<span className="text-6xl block mb-4">
				{file.type === "pdf" && "📄"}
				{file.type === "doc" && "📝"}
				{file.type === "zip" && "🗂️"}
			</span>
			<p className="text-gray-100">Anteprima non disponibile per {file.type}</p>
			</div>
		)}
		</div>

            {/* INFO FILE */}
            <div className="p-3">
              <p className="text-sm font-semibold text-white truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">
                {file.type}
              </p>
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-category-bg-color rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">{preview.name}</h2>
              <button 
                onClick={() => setPreview(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="bg-overlay-border-color flex justify-center items-center overflow-auto">
              {preview.type === "image" ? (
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="w-full h-full object-contain shadow-sm"
                />
				) : preview.type === "text" ? (
					/* Anteprima per i file di testo */
					<iframe
					src={preview.url}
					className="w-full h-full object-contain shadow-sm"
					title="text-preview"
					/>
				)
               : (
                <div className="py-20 text-center">
                  <span className="text-6xl block mb-4">
                     {preview.type === "pdf" && "📄"}
                     {preview.type === "doc" && "📝"}
                     {preview.type === "zip" && "🗂️"}
                  </span>
                  <p className="text-gray-100">Anteprima non disponibile per questo formato</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-category-bg-color border-t flex justify-end">
                <button
                  onClick={() => setPreview(null)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Chiudi
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}