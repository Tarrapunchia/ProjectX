import { useState, useEffect } from 'react';
import Header from '../../components/header/header';
import Sidebar from '../../components/sidebar';
import ProfilePage from '../profilePage/profilePage';
import ProjectsPage from '../projectsPage/projectsPage';
import ChatPage from '../chatRoomPage/chatRoomPage';
import DashboardProfile from '../dashboardProfile/dashboardProfile'
import DocumentsPage from '../DocumentsPage/DocumentsPage';
import LibraryPage from '../libraryPage/libraryPage'
import SettingsPage from '../settingsPage/settingsPage';
import TasksPage from '../tasksPages/tasksPages'
import { type ProjectDetailed, useWebSocket } from '../../utilities/WebSocketContext'
import FloatingChat from '../../components/FloatingChat/FloatingChat';
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function DashboardPage() 
{
    const { t } = useTranslation();
    const { isReady, activeUser, projects } = useWebSocket();

    const [activePage, setActivePage] = useState(() => {
        return localStorage.getItem('activePage') || 'dashboard';
    });

    const [selectedProject, setSelectedProject] = useState<ProjectDetailed | null>(null);
    
    const [show404, setShow404] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (!isReady) {
            timer = setTimeout(() => {
                setShow404(true);
            }, 1500); 
        } else {
            setShow404(false);
        }
        
        return () => clearTimeout(timer);
    }, [isReady]);

    useEffect(() => {
        localStorage.setItem('activePage', activePage);
    }, [activePage]);

    useEffect(() => {
        if (activeUser) {
            const saved = localStorage.getItem(`selectedProject_${activeUser.id}`);
            if (saved) {
                setSelectedProject(JSON.parse(saved));
            } else {
                setSelectedProject(null);
            }
        }
    }, [activeUser]);

	useEffect(() => 
	{
        if (isReady && selectedProject) 
		{
            const projectStillExists = projects?.some(p => p.id === selectedProject.id);
            
            if (!projectStillExists) {
                setSelectedProject(null);
            }
        }
    }, [projects, selectedProject]);

    useEffect(() => {
        if (activeUser) {
            if (selectedProject) {
                localStorage.setItem(`selectedProject_${activeUser.id}`, JSON.stringify(selectedProject));
            } else {
                localStorage.removeItem(`selectedProject_${activeUser.id}`);
            }
        }
    }, [selectedProject, activeUser]);
    
    return (
        <>
            {isReady ? (
                <div className="grid h-screen overflow-hidden grid-cols-[75px_1fr] md:grid-cols-[11vw_1fr] grid-rows-[auto_1fr_auto] [grid-template-areas:'sidebar_header''sidebar_main''sidebar_footer']">
                    <Header className="[grid-area:header]" setActivePage={setActivePage} selectedProject={selectedProject}/>
                    <Sidebar className="[grid-area:sidebar]" activePage={activePage} setActivePage={setActivePage}/>
                    <main className="[grid-area:main] p-[20px] overflow-y-auto h-full min-w-0">
                        { activePage === 'dashboard' && <DashboardProfile /> }
                        { activePage === 'documents' && <DocumentsPage selectedProject={selectedProject}/> }
                        { activePage === 'tasks' && <TasksPage/>}
                        { activePage === 'projects' && <ProjectsPage setActivePage={setActivePage} setSelectedProject={setSelectedProject}/> }
                        { activePage === 'chat' && <ChatPage selectedProject={selectedProject}/> }
                        { activePage === 'files' && <LibraryPage selectedProject={selectedProject}/> }
                        { activePage === 'settings' && <SettingsPage /> }
                        { activePage === 'profile' && <ProfilePage /> }
                    </main>
                    <footer className="[grid-area:footer] bg-side-bg-color text-text-main py-2.5 px-5 text-center w-full border-t border-overlay-border-color min-w-0">
                        <p className="m-0 text-[14px]">© 2026 - Trascendence</p>
                    </footer>
                    <FloatingChat />
                </div>
            ) : show404 ? (
                <div className="min-h-screen bg-bg-color flex flex-col items-center justify-center px-[20px] text-center">
                    <h1 className="m-0 text-[clamp(6rem,15vw,12rem)] font-black text-owner-color leading-none tracking-[-0.05em] drop-shadow-[0_0_40px_color-mix(in_srgb,var(--color-owner)_30%,transparent)]">
                        404
                    </h1>
                    
                    <h2 className="mt-[20px] mb-[16px] text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-text-main tracking-[-0.02em]">
                        {t("notFound.title")}
                    </h2>
                    
                    <p className="max-w-[500px] mb-[40px] text-[1.1rem] text-white leading-[1.6]">
                        {t("notFound.description")}
                    </p>

                    <Link
                        to="/"
                        className="inline-flex items-center justify-center rounded-[10px] font-bold transition-[transform,box-shadow] duration-200 ease-in-out py-[13px] px-[28px] bg-owner-color !text-[#101010] shadow-[0_0_24px_color-mix(in_srgb,var(--color-owner)_35%,transparent)] hover:-translate-y-[2px]"
                    >
                        {t("notFound.button")}
                    </Link>
                </div>
            ) : (
                <div className="min-h-screen bg-bg-color flex flex-col items-center justify-center px-[20px]">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-owner-color border-solid"></div>
                    <p className="mt-4 text-text-main font-bold tracking-widest uppercase text-sm animate-pulse">
                        Loading...
                    </p>
                </div>
            )}
        </>
    );
}

export default DashboardPage;