import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import helpers from "../../utilities/helpers";
import consts from "../../data/consts";
import { useWebSocket, type ProjectDetailed } from "../../utilities/WebSocketContext";
import { formatters } from "../../utilities/formatters";

const getFileType = (fileName: string): "image" | "pdf" | "doc" | "zip" | "text" | "video" => {
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
    size?: number;
    createdAt?: string;
    userFullName?: string;
    uploaderId: number;
};

interface ChatPageProps {
    selectedProject: ProjectDetailed | null
}

export default function LibraryPage({ selectedProject }: ChatPageProps) 
{
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { activeUser } = useWebSocket();
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [preview, setPreview] = useState<FileItem | null>(null);
    const [projectData, setProjectData] = useState<any>(null);

    const isOwner = useMemo(() => {
        if (!projectData || !activeUser) return false;
        return projectData.participants?.some(
            (p: any) => p.user.id === activeUser.id && (p.role === "OWNER" || p.role === "EDITOR")
        );
    }, [projectData, activeUser]);

    const memoizedFilesTable = useMemo(() => {
        if (!files.length) return null;
        return (
            <div className="flex flex-col">
                {files.map((file) => (
                    <div
                        key={file.id}
                        onClick={() => setPreview(file)}
                        className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-4 border-b border-overlay-border-color/50 hover:bg-side-bg-color cursor-pointer transition-colors"
                    >
                        <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                            <span className="text-xl">
                                {file.type === "image" && "🖼️"}
                                {file.type === "pdf" && "📕"}
                                {file.type === "video" && "🎬"}
                                {file.type === "zip" && "🗂️"}
                                {file.type === "text" && "📄"}
                                {file.type === "doc" && "📝"}
                            </span>
                            <span className="text-sm font-medium text-text-main truncate" title={file.name}>{file.name}</span>
                        </div>
                        <div className="hidden md:contents">
                            <div className="col-span-2 text-center text-sm text-zinc-500">{file.userFullName}</div>
                            <div className="col-span-2 text-center text-sm text-zinc-500">{file.createdAt}</div>
                            <div className="col-span-2 text-center">
                                <span className="text-[10px] px-2 py-1 bg-overlay-border-color rounded uppercase">{file.type}</span>
                            </div>
                            <div className="col-span-2 text-right text-sm text-zinc-500">{file.size || "N/A"}</div>
                        </div>
                        <div className="md:hidden flex justify-between text-[10px] text-zinc-500 mt-2">
                            <span>{file.type.toUpperCase()}</span>
                            <span>{file.userFullName}</span>
                            <span>{file.size}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    }, [files]);

    const loadFiles = useCallback(async (pData: any) => 
    {
        if (!selectedProject || !pData?.organization?.id) return;
        try {
            const orgId = pData.organization.id;
            const projId = selectedProject.id;
            const files_url = `/api/v1/files/${orgId}/${projId}/user`;
            const res = await helpers.getter(files_url, null);
            if (res.success) {
                const formatted = res.data.files.map((file: any, i: number) => ({
                    id: String(i + 1),
                    name: file.filename,
                    uploaderId: file.uploaderId,
                    view_url: `${consts.BE}/api/v1/files/files/preview/${orgId}/${projId}/user/${file.uploaderId}/${file.filename}`,
                    download_url: `${consts.BE}/api/v1/files/files/${orgId}/${projId}/user/${file.uploaderId}/${file.filename}`,
                    userFullName: (file.uploaderFullName.toUpperCase()),
                    type: getFileType(file.filename),
                    createdAt: formatters.dateOnly(file.createdAt),
                    size: formatters.fileSize(file.size),
                }));
                setFiles(formatted);
            }
        } catch (error) {
            console.error("Errore nel fetch documenti:", error);
        }
    }, [selectedProject]);

    const delete_file = async (fileName: string) => {
        if (!selectedProject || !projectData) return;
        if (!confirm(t("library.delete_confirm", { fileName }))) return;
        try {
            const orgId = projectData.organization.id;
            const res = await helpers.deleter(`/api/v1/files/${orgId}/${selectedProject.id}/user/${fileName}`, null);
            if (res.success) {
                setPreview(null);
                loadFiles(projectData);
            } else {
                alert(t("library.delete_error"));
            }
        } catch (error) {
            console.error("Errore di rete:", error);
        }
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedProject || !activeUser || !projectData) return;
        const formData = new FormData();
        formData.append('organizationId', projectData.organization.id.toString());
        formData.append('projectId', selectedProject.id.toString());
        formData.append('userId', activeUser.id.toString());
        formData.append('file', file);
        try {
            const res = await helpers.uploadFile('/api/v1/files/user', formData);
            if (res.success) loadFiles(projectData);
        } catch (error) {
            console.error("Errore upload:", error);
        } finally {
            if (event.target) event.target.value = "";
        }
    };

    useEffect(() => {
        if (!selectedProject) return;
        const fetchData = async () => {
            const res = await helpers.getter(`/api/v1/projects/${selectedProject.id}`, null);
            if (res.success) {
                setProjectData(res.data);
                await loadFiles(res.data);
            }
            setLoading(false);
        };
        fetchData();
    }, [selectedProject, loadFiles]);

    if (!selectedProject) return <div className="flex h-full items-center justify-center text-zinc-500">{t("library.select_project")}</div>;
    if (loading) return <div className="h-full w-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-owner-color"></div></div>;

    return (
        <div className="w-full h-full overflow-y-auto custom-scrollbar p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="hidden md:block text-xs font-bold text-text-main">{t("library.project_files")}</h1>
                {isOwner && (
                    <div>
                        <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" />
                        <button className="flex items-center justify-center gap-2 bg-owner-color text-white px-4 py-2.5 rounded-xl hover:scale-105 transition-all shadow-lg font-bold cursor-pointer active:scale-95 w-12 h-12 md:w-auto md:h-auto md:px-5" onClick={() => fileInputRef.current?.click()}>
                            <span>📤</span>
                            <span className="hidden md:inline">{t("library.upload_file")}</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="w-full">
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold uppercase text-zinc-500 border-b border-overlay-border-color">
                    <div className="col-span-4">{t("library.file_name")}</div>
                    <div className="col-span-2 text-center">{t("library.created_by")}</div>
                    <div className="col-span-2 text-center">{t("library.date_created")}</div>
                    <div className="col-span-2 text-center">{t("library.extension")}</div>
                    <div className="col-span-2 text-right">{t("library.size")}</div>
                </div>
                {files.length === 0 ? <p className="text-center mt-10 text-zinc-500">{t("library.no_files")}</p> : memoizedFilesTable}
            </div>

            {preview && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setPreview(null)}>
                    <div className="bg-category-bg-color border-text-main rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-bold text-text-main">{preview.name}</h2>
                            <button onClick={() => setPreview(null)} className="cursor-pointer">✕</button>
                        </div>
                        <div className="bg-overlay-border-color flex justify-center items-center h-[70vh]">
                            {preview.type === "image" && <img src={preview.view_url} className="max-w-full max-h-full object-contain" />}
                            {preview.type === "pdf" && <iframe src={`${preview.view_url}#view=FitH`} className="w-full h-full" />}
                            {preview.type === "text" && <iframe src={preview.view_url} className="w-full h-full bg-white" />}
                            {preview.type === "video" && <video controls className="max-w-full max-h-full"><source src={preview.view_url} /></video>}
                        </div>
                        <div className="p-4 border-t flex justify-between">
                            {isOwner && <button onClick={() => delete_file(preview.name)} className="cursor-pointer">{t("library.delete_button")}</button>}
                            <a href={preview.download_url} download className="cursor-pointer">{t("library.download_button")}</a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}