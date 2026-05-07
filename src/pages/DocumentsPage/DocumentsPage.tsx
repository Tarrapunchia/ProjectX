import { useState, useEffect } from "react";
import { useRef } from "react";
import type { ProjectInfo } from "../../data/types"
import helpers from "../../utilities/helpers"

const getFileType = (fileName: string): "image" | "pdf" | "doc" | "zip" | "text" | "video" => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  const map: Record<string, string[]> = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    pdf: ['pdf'],
    text: ['txt', 'md', 'log', 'json', 'csv'],
    video: ['mp4', 'webm', 'ogg'],
    zip: ['zip', 'rar', '7z', 'tar'],
  };

  // Cerca in quale array della mappa si trova l'estensione
  for (const [type, extensions] of Object.entries(map)) {
    if (extensions.includes(extension || '')) {
      return type as any;
    }
  }

  return "doc"; // Tipo di default se non trova corrispondenze (es. .docx, .xlsx)
};

type FileItem = {
  id: string;
  name: string;
  url: string;
  type: "image" | "pdf" | "doc" | "zip" | "text" | "video";
};

interface ChatPageProps {
    selectedProject: ProjectInfo | null
}

export default function DocumentsPage({ selectedProject }: ChatPageProps) 
{
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [files, setFiles] = useState<FileItem[]>([]);
	const [preview, setPreview] = useState<FileItem | null>(null);
	const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {

    const checkPermissions = async () => 
	{
		if (!selectedProject)
			return
		try {
			// 1. Recuperiamo chi è l'utente loggato
			let user = (await helpers.getter("/api/v1/users/activeUser", null)).data

			// 2. Recuperiamo i dettagli del progetto (quelli con i participants)
			const res = await helpers.getter("/api/v1/projects/" + selectedProject.id, null);
			const projectData = res.data;

			// 3. Verifichiamo se l'utente loggato è nell'elenco OWNER
			const ownerStatus = projectData.participants.some(
			(p: any) => p.user.id === user.id && p.role === "OWNER"
			);
			
			setIsOwner(ownerStatus);
		} catch (error) {
			console.error("Errore nel controllo permessi:", error);
		}
	};
	
    const loadFiles = async () => 
	{
		if (!selectedProject)
			return
		try 
		{
			let data = (await helpers.getter("/api/v1/projects/" + selectedProject?.id, null)).data

			const organizationId = data.organization.id
			const BASE_URL = "http://localhost:5000/api/v1/files/files/preview/" + organizationId + "/" + selectedProject?.id 
			const files_url = "/api/v1/files/" + organizationId + "/" + selectedProject?.id

			data = (await helpers.getter(files_url, null)).data
			const formatted = data.files.map((name: string, i: number) => ({
				id: String(i + 1),
				name: name,
				url: `${BASE_URL}/${name}`,
				type: getFileType(name)
			}));

			setFiles(formatted);
		} catch (error) {
			console.error("Errore nel fetch:", error);
		}
    };
	checkPermissions();
    loadFiles();
  }, [selectedProject]);

  	const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => 
	{
		const file = event.target.files?.[0];
		if (!file || !selectedProject) return;

		let data = (await helpers.getter("/api/v1/projects/" + selectedProject?.id, null)).data
		let user = (await helpers.getter("/api/v1/users/activeUser", null)).data

		const userId = user.id
		const organizationId = data.organization.id
		const formData = new FormData();
		formData.append('userId', userId);
		formData.append('organizationId', organizationId);
		formData.append('projectId', selectedProject.id.toString());
		// Se hai l'organizzazioneId, aggiungi anche quella
		formData.append('file', file);

		try 
		{
			// Usiamo l'helper che include già i cookie (credentials: 'include')
			const res = await helpers.poster('/api/v1/files', formData);

			if (res.success) {
				console.log("Caricato con successo!", res.data);
				// Qui puoi richiamare la funzione per ricaricare la lista file
				//loadFiles(); 
			} else {
				console.error("Errore durante l'upload:", res.data);
			}
		} catch (error) {
			console.error("Errole di rete:", error);
		} finally {
			if (event.target) event.target.value = "";
		}
	};

  if (!selectedProject)
	return <div className="flex h-full items-center justify-center text-gray-500">Select a project.</div>

	return (
	
	<div className="p-1">
		{/* INTESTAZIONE CON BOTTONE CONDIZIONALE */}
		<div className="flex justify-center items-center mb-2 pb-1">
			{isOwner && (
				<>
					<input 
						type="file" 
						ref={fileInputRef} 
						onChange={handleUpload} 
						className="hidden"
					/>
					<button 
						className="border border-category-bg-color bg-side-bg-color rounded-lg px-3 text-m text-text-main cursor-pointer hover:scale-105 hover:border-text-main transition-all"
						onClick={() => fileInputRef.current?.click()}
					>
						➕ Upload Files
					</button>
				</>
			)}
		</div>
		{/* ==========================================
			3. GRIGLIA FILE (I QUADRATINI)
			========================================== */}
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 ">
			{files.map((file) => (
			<div
				key={file.id}
				onClick={() => setPreview(file)}
				className="group cursor-pointer flex flex-col rounded-lg shadow-sm border 
				overflow-hidden hover:shadow-md border rounded-[14px] border-overlay-border-color hover:border-text-main transition-all hover:scale-105"
			>
				{/* AREA ANTEPRIMA (IL QUADRATO) */}
				<div className="bg-overlay-border-color flex justify-center items-center overflow-hidden min-h-[300px] relative ">
				{/* Logica per mostrare contenuto reale nel quadrato */}
				{file.type === "image" ? (
					<img src={file.url} alt={file.name} className="w-full h-full object-contain pointer-events-none" />
				) : file.type === "text" || file.type === "pdf" ? (
					/* Mostriamo un'anteprima del file di testo o PDF direttamente nel quadrato */
					/* 'pointer-events-none' è fondamentale per permettere il click sulla card */
					<iframe 
					src={`${file.url}#toolbar=0&navpanes=0&scrollbar=0`}
					className="w-full h-[300px] border-none bg-white pointer-events-none scale-90"
					/>
				) : (
					/* Icona per file non visualizzabili in miniatura (Zip, Docx, ecc) */
					<div className="py-20 text-center">
					<span className="text-6xl block mb-4">
						{file.type === "doc" && "📝"}
						{file.type === "zip" && "🗂️"}
						{file.type === "video" && "🎬"}
					</span>
					<p className="text-gray-100 text-xs">No preview</p>
					</div>
				)}
				</div>

				{/* INFO FILE */}
				<div className="p-3 bg-category-bg-color">
				<p className="text-sm font-semibold text-text-main truncate" title={file.name}>
					{file.name}
				</p>
				<p className="text-[10px] text-gray-400 uppercase font-bold mt-1">
					{file.type}
				</p>
				</div>
			</div>
			))}
		</div>

		{/* ==========================================
			4. MODAL DI ANTEPRIMA (QUANDO CLICCHI)
			========================================== */}
		{preview && (
			<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
			onClick={() => setPreview(null)}>

				<div className="bg-category-bg-color border-text-main rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
					onClick={(e) => e.stopPropagation()}>

					<div className="p-4 border-b flex justify-between items-center">
						<h2 className="text-lg font-bold text-text-main">{preview.name}</h2>
						<button onClick={() => setPreview(null)} className="border border-category-bg-color bg-side-bg-color rounded-xl p-2 text-text-main cursor-pointer hover:scale-105 hover:border-text-main">✕</button>
					</div>

					<div className="bg-overlay-border-color flex justify-center items-center overflow-hidden h-[90vh] ">
					{(() => {
								switch (preview.type) 
								{
									case "image": return <img src={preview.url} className="max-w-full max-h-full object-contain" />;
									case "pdf": return ( <iframe src={`${preview.url}#view=FitH`} className="w-full h-full" />);
									case "text": return <iframe src={preview.url} className="w-full h-full border-none bg-white" />;
									case "video": return <video controls className="max-w-full max-h-full"><source src={preview.url} /></video>;
									default: return (
										<div className="text-center py-20">
										<span className="text-8xl block mb-6">{preview.type === "zip" ? "🗂️" : "📄"}</span>
										<a href={preview.url} download className="border border-category-bg-color bg-side-bg-color rounded-xl p-2 !text-text-main cursor-pointer hover:scale-105 hover:border-text-main">Scarica File</a>
										</div>
									);
								}
							}
					)()}
					</div>
					
					<div className="p-4 border-t flex justify-end">
						{/*<a href={preview.url} download className="border border-category-bg-color bg-side-bg-color rounded-xl p-2 !text-text-main cursor-pointer hover:scale-105 hover:border-text-main">Scarica File</a>*/}
					</div>
				</div>
			</div>
		)}
	</div>
  );
}