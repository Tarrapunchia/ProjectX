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
  view_url: string;
  download_url: string;
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
	const [projectData, setProjectData] = useState<any>(null);
	const [activeUser, setActiveUser] = useState<any>(null);

	const initData = async () => 
	{
		try 
		{
			const userData = (await helpers.getter("/api/v1/users/activeUser", null)).data;
			setActiveUser(userData);

			if (!selectedProject) 
				return { user: userData, project: null };

			const pData = (await helpers.getter("/api/v1/projects/" + selectedProject.id, null)).data;
			setProjectData(pData);
			
			return { user: userData, project: pData };
		} catch (e) {
			console.error(e);
			return null;
		}
	};
	
    const checkPermissions = async (pData: any, uData: any) => 
	{
		if (!selectedProject)
			return
		try 
		{
			const ownerStatus = pData.participants.some(
			(p: any) => p.user.id === uData.id && (p.role === "OWNER" || p.role === "EDITOR")
			);
			
			setIsOwner(ownerStatus);
		} catch (error) {
			console.error("Errore nel controllo permessi:", error);
		}
	};
	
    const loadFiles = async (pData: any) => 
	{
		if (!selectedProject)
			return
		try
		{
			const organizationId = pData.organization.id
			const BASE_URL = "http://localhost:5000/api/v1/files/files/preview/" + organizationId + "/" + selectedProject?.id
			const files_url = "/api/v1/files/" + organizationId + "/" + selectedProject?.id
			const download_url = "http://localhost:5000/api/v1/files/files/" + organizationId + "/" + selectedProject?.id

			const data = (await helpers.getter(files_url, null)).data
			const formatted = data.files.map((name: string, i: number) => ({
				id: String(i + 1),
				name: name,
				view_url: `${BASE_URL}/${name}`,
				download_url: `${download_url}/${name}`,
				type: getFileType(name)
			}));

			setFiles(formatted);
		} catch (error) {
			console.error("Errore nel fetch:", error);
		}
    };

	const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => 
  	{
		const file = event.target.files?.[0];
		if (!file || !selectedProject) return;

		const userId = activeUser.id
		const organizationId = projectData.organization.id
		const formData = new FormData();
		formData.append('userId', userId);
		formData.append('organizationId', organizationId);
		formData.append('projectId', selectedProject.id.toString());
		formData.append('file', file);

		try 
		{
			const res = await helpers.poster('/api/v1/files', formData);

			if (res.success) {
				console.log("Caricato con successo!", res.data);
				loadFiles(projectData)
			} else {
				console.error("Errore durante l'upload:", res.data);
			}
		} catch (error) {
			console.error("Errole di rete:", error);
		} finally {
			if (event.target) event.target.value = "";
		}
  	};

    const delete_file = async (fileName: string) => {
        if (!selectedProject || !projectData) return;

        if (!confirm(`Are ypu sure to delete file ? ${fileName}?`)) return;

        try {
            const organizationId = projectData.organization.id;
            const projectId = selectedProject.id;
            console.log(organizationId, projectId)
			const res = await fetch(`http://localhost:5000/api/v1/files/${organizationId}/${projectId}/${fileName}`, {
				method: 'DELETE',
				headers: { 'accept': '*/*' },
				credentials: 'include'
			});

            if (res.ok)
			{
                setPreview(null);
                loadFiles(projectData);
                
            } else {
                alert("Errore durante l'eliminazione");
            }
        } catch (error) {
            console.error("Errore di rete durante l'eliminazione:", error);
        }
    };

	useEffect(() => 
	{
		const sequence = async () => 
		{
			const results = await initData();
			
			if (results) 
			{
				checkPermissions(results.project, results.user);
				loadFiles(results.project);
			}
		};

		sequence();
	}, [selectedProject]);


	if (!selectedProject)
		return (<div className="flex h-full items-center justify-center text-zinc-500">Select a project.</div>);

	if (!files.length)
		return (
			<div className="relative flex h-full w-full items-center justify-center text-zinc-500 ">
				
				<div className="absolute top-0 left-0 w-full flex justify-between items-center">
					<h1 className="text-xs font-bold text-text-main">
						Project Documents
					</h1>

					{isOwner && (
						<div>
							<input 
								type="file" 
								ref={fileInputRef} 
								onChange={handleUpload} 
								className="hidden"
							/>
							<button 
								className="border border-category-bg-color bg-side-bg-color rounded-lg px-3 py-1 text-m text-text-main cursor-pointer hover:scale-105 hover:border-text-main transition-all"
								onClick={() => fileInputRef.current?.click()}>
								📤 Upload Files
							</button>
						</div>
					)}
				</div>

				{/* Testo centrale: rimane al centro esatto del padre flex */}
				<p className="text-center">
					There are no documents to display for this project.
				</p>
				
			</div>
		);

	return (
		
		<div className="min-w-0 custom-scrollbar">
			{/* INTESTAZIONE CON BOTTONE CONDIZIONALE */}
			<div className="flex justify-between items-center ">
                <h1 className="text-xs font-bold text-text-main">Project Documents</h1>
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
							📤 Upload Files
						</button>
					</>
				)}
			</div>
			{/* ==========================================
				3. GRIGLIA FILE (I QUADRATINI)
				========================================== */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 custom-scrollbar">
				{files.map((file) => (
				<div
					key={file.id}
					onClick={() => setPreview(file)}
					className="group cursor-pointer flex flex-col rounded-lg shadow-sm border 
					overflow-hidden hover:shadow-md border rounded-[14px] border-overlay-border-color hover:border-text-main transition-all hover:scale-105 custom-scrollbar"
				>
					{/* AREA ANTEPRIMA (IL QUADRATO) */}
					<div className="bg-overlay-border-color flex justify-center items-center overflow-hidden max-w-full min-h-[300px] max-h-[300px] relative ">
					
						{file.type === "image" ? 
						(
							<img src={file.view_url} alt={file.name} className="w-full h-full object-contain pointer-events-none" />
						) 
						: file.type === "text" || file.type === "pdf" ? 
						(
							<iframe 
							src={`${file.view_url}#toolbar=0&navpanes=0&scrollbar=0`}
							className="w-full h-[300px] border-none bg-white pointer-events-none scale-90"
							/>
						) 
						: 
						(
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
							<button onClick={() => setPreview(null)} className="border border-category-bg-color bg-side-bg-color 
								rounded-full w-8 h-8 flex items-center justify-center
								text-text-main cursor-pointer hover:scale-105 hover:border-text-main">✕
							</button>
						</div>

						<div className="bg-overlay-border-color flex justify-center items-center overflow-hidden h-[90vh] ">
						{(() => {
									switch (preview.type) 
									{
										case "image": return <img src={preview.view_url} className="max-w-full max-h-full object-contain" />;
										case "pdf": return ( <iframe src={`${preview.view_url}#view=FitH`} className="w-full h-full" />);
										case "text": return <iframe src={preview.view_url} className="w-full h-full border-none bg-white" />;
										case "video": return <video controls className="max-w-full max-h-full"><source src={preview.view_url} /></video>;
										default: return (
											<div className="text-center py-20">
											<span className="text-8xl block mb-6">{preview.type === "zip" ? "🗂️" : "📄"}</span>
											</div>
										);
									}
								}
						)()}
						</div>
						
						<div className="p-4 border-t flex justify-between">
							{ isOwner && <button onClick={() => delete_file(preview.name)} className="border border-category-bg-color bg-side-bg-color rounded-xl p-2 !text-text-main cursor-pointer hover:scale-105 hover:border-text-main">Delete File</button>}
							{<a href={preview.download_url} download className="border border-category-bg-color bg-side-bg-color rounded-xl p-2 !text-text-main cursor-pointer hover:scale-105 hover:border-text-main">Download File</a>}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}