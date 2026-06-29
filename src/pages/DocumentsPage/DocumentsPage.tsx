import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ProjectInfo } from "../../data/types";
import helpers from "../../utilities/helpers";
import consts from "../../data/consts";
import { useWebSocket } from "../../utilities/WebSocketContext";

const getFileType = (fileName: string): "image" | "pdf" | "doc" | "zip" | "text" | "video" => 
{
    const extension = fileName.split('.').pop()?.toLowerCase();
    const map: Record<string, string[]> = {
        image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
        pdf: ['pdf'],
        text: ['txt', 'md', 'log', 'json', 'csv'],
        video: ['mp4', 'webm', 'ogg'],
        zip: ['zip', 'rar', '7z', 'tar'],
    };

    for (const [type, extensions] of Object.entries(map)) {
        if (extensions.includes(extension || '')) return type as any;
    }
    return "doc";
};

type FileItem = {
    id: string;
    name: string;
    view_url: string;
    download_url: string;
    type: "image" | "pdf" | "doc" | "zip" | "text" | "video";
};

interface ChatPageProps {
    selectedProject: ProjectInfo | null;
}

export default function DocumentsPage({ selectedProject }: ChatPageProps) 
{
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { activeUser } = useWebSocket();
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [preview, setPreview] = useState<FileItem | null>(null);
    const [projectData, setProjectData] = useState<any>(null);

    const isOwner = useMemo(() => 
    {
        if (!projectData || !activeUser) return false;
        return projectData.participants?.some(
            (p: any) => p.user.id === activeUser.id && (p.role === "OWNER" || p.role === "EDITOR")
        );
    }, [projectData, activeUser]);

    const memoizedFilesGrid = useMemo(() => 
    {
        if (!files.length) return null;

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {files.map((file) => (
                    <div
                        key={file.id}
                        onClick={() => setPreview(file)}
                        className="group cursor-pointer flex flex-col rounded-lg shadow-sm border border-overlay-border-color overflow-hidden hover:shadow-md hover:border-text-main transition-all hover:scale-105"
                    >
                        <div className="bg-overlay-border-color flex justify-center items-center overflow-hidden w-full h-[220px] relative">
                            {file.type === "image" ? (
                                <img src={file.view_url} alt={file.name} className="w-full h-full object-contain pointer-events-none" />
                            ) : file.type === "text" || file.type === "pdf" ? (
                                <iframe 
                                    src={`${file.view_url}#toolbar=0&navpanes=0&scrollbar=0`}
                                    className="w-full h-[300px] border-none bg-white pointer-events-none scale-90"
                                />
                            ) : (
                                <div className="py-20 text-center">
                                    <span className="text-6xl block mb-4">
                                        {file.type === "doc" && "📝"}
                                        {file.type === "zip" && "🗂️"}
                                        {file.type === "video" && "🎬"}
                                    </span>
                                    <p className="text-gray-100 text-xs">{t("documents.no_preview")}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-3 bg-category-bg-color">
                            <p className="text-sm font-semibold text-text-main truncate" title={file.name}>{file.name}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">{file.type}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    }, [files, t]);

    const loadFiles = useCallback(async (pData: any) => 
    {
        if (!selectedProject || !pData?.organization?.id) return;
        
        try 
        {
            const orgId = pData.organization.id;
            const projId = selectedProject.id;

            const BASE_URL = `${consts.BE}/api/v1/files/files/preview/${orgId}/${projId}`;
            const download_url = `${consts.BE}/api/v1/files/files/${orgId}/${projId}`;
            const files_url = `/api/v1/files/${orgId}/${projId}`;

            const res = await helpers.getter(files_url, null);
            if (res.success) {
                const formatted = res.data.files.map((name: string, i: number) => ({
                    id: `${projId}-${i}`,
                    name,
                    view_url: `${BASE_URL}/${name}`,
                    download_url: `${download_url}/${name}`,
                    type: getFileType(name)
                }));
                setFiles(formatted);
            }
        } catch (error) {
            console.error("Errore nel fetch documenti:", error);
        }
    }, [selectedProject]);

    const delete_file = async (fileName: string) => 
    {
        if (!selectedProject || !projectData) return;
        if (!confirm(t("documents.delete_confirm", { fileName }))) return;

        try {
            const orgId = projectData.organization.id;
            const res = await helpers.deleter(`/api/v1/files/${orgId}/${selectedProject.id}/${fileName}`, null);

            if (res.success) {
                setPreview(null);
                loadFiles(projectData);
            } else {
                alert(t("documents.delete_error"));
            }
        } catch (error) {
            console.error("Errore di rete:", error);
        }
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => 
    {
        const file = event.target.files?.[0];
        if (!file || !selectedProject || !activeUser || !projectData) return;

        const formData = new FormData();
        formData.append('userId', activeUser.id.toString());
        formData.append('organizationId', projectData.organization.id);
        formData.append('projectId', selectedProject.id.toString());
        formData.append('file', file);

        try {
            const res = await helpers.uploadFile('/api/v1/files', formData);
            if (res.success) {
                loadFiles(projectData);
            }
        } catch (error) {
            console.error("Errore upload:", error);
        } finally {
            if (event.target) event.target.value = "";
        }
    };

    useEffect(() => 
    {
        if (!selectedProject) return;

        const fetchData = async () => 
        {
            const res = await helpers.getter(`/api/v1/projects/${selectedProject.id}`, null);
            if (res.success) {
                setProjectData(res.data);
                await loadFiles(res.data);
            }
            setLoading(false);
        };
        fetchData();
    }, [selectedProject, loadFiles]);

    if (!selectedProject)
        return (<div className="flex h-full items-center justify-center text-zinc-500">{t("documents.select_project")}</div>);

    if (loading) return (
        <div className="h-full w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-owner-color"></div>
        </div>
    );

    return (
        <div className="h-full w-full">
            <div className="min-w-0 h-full w-full overflow-y-auto custom-scrollbar p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="hidden md:block text-xs font-bold text-text-main">{t("documents.project_documents")}</h1>
                    {isOwner && (
                        <div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleUpload} 
                                className="hidden"
                            />
                            <button 
                                className="flex items-center justify-center gap-2 bg-owner-color text-white px-4 py-2.5 rounded-xl hover:scale-105 transition-all shadow-lg font-bold cursor-pointer active:scale-95 w-12 h-12 md:w-auto md:h-auto md:px-5"
                                onClick={() => fileInputRef.current?.click()}>
                                <span className={""}>📤</span>
                                <span className="hidden md:inline">{t("documents.upload_file")}</span>
                            </button>
                        </div>
                    )}
                </div>

                {files.length === 0 ? (
                    <p className="text-center text-zinc-500">{t("documents.no_documents")}</p>
                ) : (
                    memoizedFilesGrid
                )}

                {preview && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setPreview(null)}>
                        <div className="bg-category-bg-color border-text-main rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                            <div className="p-4 border-b border-overlay-border-color flex justify-between items-center">
                                <h2 className="text-lg font-bold text-text-main">{preview.name}</h2>
                                <button onClick={() => setPreview(null)} className="bg-side-bg-color rounded-full w-8 h-8 text-text-main hover:scale-105 border border-transparent hover:border-text-main transition-all cursor-pointer">✕</button>
                            </div>
                            
                            <div className="bg-overlay-border-color flex justify-center items-center h-[70vh]">
                                {preview.type === "image" && <img src={preview.view_url} className="max-w-full max-h-full object-contain" />}
                                {preview.type === "pdf" && <iframe src={`${preview.view_url}#view=FitH`} className="w-full h-full" />}
                                {preview.type === "text" && <iframe src={preview.view_url} className="w-full h-full bg-white" />}
                                {preview.type === "video" && <video controls className="max-w-full max-h-full"><source src={preview.view_url} /></video>}
                                {["zip", "doc"].includes(preview.type) && <span className="text-8xl">{preview.type === "zip" ? "🗂️" : "📄"}</span>}
                            </div>
                            
                            <div className="p-4 border-t border-overlay-border-color flex justify-between">
                                {isOwner && (
                                    <button 
                                        onClick={() => delete_file(preview.name)} 
                                        className="border border-category-bg-color bg-side-bg-color rounded-xl p-2 !text-text-main cursor-pointer hover:scale-105 hover:border-text-main transition-all"
                                    >
                                        {t("documents.delete_button")}
                                    </button>
                                )}
                                <a 
                                    href={preview.download_url} 
                                    download 
                                    className="border border-category-bg-color bg-side-bg-color rounded-xl p-2 !text-text-main cursor-pointer hover:scale-105 hover:border-text-main transition-all"
                                >
                                    {t("documents.download_button")}
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}