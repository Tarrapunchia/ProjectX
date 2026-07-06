// import React, { useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import { FiAlertTriangle } from 'react-icons/fi';
// import Category from './category';
// import ProgressBar from './progressBar';
// import TaskCard from './taskCard';
// import { CreateProject } from './createProject';
// import { useWebSocket, type ProjectDetailed, ROLES, type Role } from '../../utilities/WebSocketContext';
// import helpers from '../../utilities/helpers';

// interface ProjectsPageProps {
//     setActivePage: (page: string) => void;
//     setSelectedProject: (project: ProjectDetailed) => void;
// }

// const ProjectsPage: React.FC<ProjectsPageProps> = ({ setActivePage, setSelectedProject }) => {
//     const { t } = useTranslation();
//     const { projects, activeOrg, activeUser, setProjects } = useWebSocket();
//     const filteredProjects = projects.filter(proj =>
//         proj.participants?.some(p => p.user.id === activeUser?.id)
//     );
    
//     const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
//         TODO: false,
//         ACTIVE: false,
//         REVIEW: false,
//         COMPLETED: false,
//     });

//     const toggleCategory = (category: ProjectDetailed['status']) => {
//         setExpandedCategories(prev => ({
//             ...prev,
//             [category]: !prev[category],
//         }));
//     };

//     const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
//     const selectedCard = filteredProjects.find(p => p.id === selectedCardId) ?? null;
//     const [isExpanding, setIsExpanding] = useState(false);
//     const [cardPosition, setCardPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
//     const [createProject, setCreateProject] = useState(false);
//     const [deleteProject, setDeleteProject] = useState(false);
//     const [changeRoleFor, setChangeRoleFor] = useState<number | null>(null);
//     const [rolePosition, setRolePosition] = useState({ top: 0, left: 0 });

//     const isOwner = selectedCard?.participants?.some(
//         p => p.user.id === activeUser?.id && p.role === "OWNER"
//     ) ?? false;

//     const handleCardClick = (project: ProjectDetailed, e: React.MouseEvent<HTMLDivElement>) => {
//         const cardRect = e.currentTarget.getBoundingClientRect();
//         setCardPosition({
//             top: cardRect.top,
//             left: cardRect.left,
//             width: cardRect.width,
//             height: cardRect.height,
//         });

//         setSelectedCardId(project.id);
//         setTimeout(() => setIsExpanding(true), 10);
//     };

//     const handleClose = () => {
//         setIsExpanding(false);
//         setChangeRoleFor(null);
//         setTimeout(() => setSelectedCardId(null), 400);
//     }

//     const handleDeleteProject = async () => {
//         if (!selectedCard) return;

//         const res = await helpers.deleter(`/api/v1/projects/delete/${selectedCard.id}`);

//         if (res.success)
//             setProjects(prev => prev.filter(p => p.id !== selectedCard.id));

//         setDeleteProject(false);
//     }

//     const handleRoleChange = async (participantId: number, newRole: Role) => {
//         if (!selectedCard) return;

//         const updatedParticipants = selectedCard.participants.map(p =>
//             p.user.id === participantId
//                 ? { ...p, role: newRole }
//                 : p
//         );

//         const payloadParticipants = updatedParticipants.map(p => ({
//             user: {
//                 id: p.user.id,
//                 name: p.user.name,
//                 surname: p.user.surname,
//                 email: p.user.email
//             },
//             role: p.role
//         }));

//         const res = await helpers.putter(`/api/v1/projects/${selectedCard.id}/participants`, {
//             participants: payloadParticipants
//         });

//         if (res.success) {
//             setProjects(prev => prev.map(proj =>
//                 proj.id === selectedCard.id
//                     ? { ...proj, participants: updatedParticipants }
//                     : proj
//             ));
//         }

//         setChangeRoleFor(null);
//     }

//     return (
//         <div className="flex no-scrollbar overflow-y-auto gap-x-[1vw] gap-y-5 ml-[2vw] flex-wrap justify-start items-start content-start bg-bg-color">
//             <div className="flex flex-between w-full items-center">
//                 <h1 className="w-full ml-[2vw] text-[3.2em] font-bold leading-[1.1] my-8">{t('projects_page.title')}</h1>
//                 {activeOrg && (
//                     <button
//                         onClick={() => setCreateProject(true)}
//                         className="flex items-center justify-center text-lg p-8 mr-[8%] border rounded-md border-overlay-border-color h-15 transition-all duration-300 hover:border-owner-color hover:scale-110 active:scale-90">
//                         {t('projects_page.create_button')}
//                     </button>
//                 )}
//             </div>
//             <div className="flex flex-wrap items-start gap-8">
//                 <Category label={t('projects_page.categories.todo')} status="TODO" projList={filteredProjects}
//                     isExpanded={expandedCategories['TODO']}
//                     onToggle={() => toggleCategory('TODO')}
//                     onCardClick={handleCardClick}
//                 />
//                 <Category label={t('projects_page.categories.in_progress')} status="ACTIVE" projList={filteredProjects}
//                     isExpanded={expandedCategories['ACTIVE']}
//                     onToggle={() => toggleCategory('ACTIVE')}
//                     onCardClick={handleCardClick}
//                 />
//                 <Category label={t('projects_page.categories.code_review')} status="REVIEW" projList={filteredProjects}
//                     isExpanded={expandedCategories['REVIEW']}
//                     onToggle={() => toggleCategory('REVIEW')}
//                     onCardClick={handleCardClick}
//                 />
//                 <Category label={t('projects_page.categories.done')} status="COMPLETED" projList={filteredProjects}
//                     isExpanded={expandedCategories['COMPLETED']}
//                     onToggle={() => toggleCategory('COMPLETED')}
//                     onCardClick={handleCardClick}
//                 />
//             </div>

//             {selectedCard && (
//                 <div className="fixed inset-0 bg-black/50 z-100" onClick={handleClose}>
//                     <div
//                         className={`fixed grid grid-cols-[3fr_1fr] bg-overlay-bg-color p-7.5 rounded-lg transition-all duration-400 overflow-hidden 
//                             ${isExpanding 
//                                 ? 'top-[10vh]! left-[16vw]! w-[83vw]! h-[85vh]! opacity-100 border border-overlay-border-color' 
//                                 : 'opacity-0'
//                             }`}
//                         style={!isExpanding ? {
//                             top: cardPosition.top,
//                             left: cardPosition.left,
//                             width: cardPosition.width,
//                             height: cardPosition.height,
//                         } : undefined}
//                         onClick={(e) => e.stopPropagation()}
//                     >
//                         <div className="flex flex-col items-start border-r border-overlay-border-color h-full pr-4">
//                             <div className="flex flex-wrap items-center w-full">
//                                 <h2 className="text-[50px] font-bold m-0 leading-tight">{selectedCard.name}</h2>
//                                 <p className="line-clamp-1 min-w-50 max-w-87.5 mr-5 ml-auto bg-owner-color text-center rounded-[5px] text-[20px] px-2">
//                                     {selectedCard.organization.name}
//                                 </p>
//                             </div>
                            
//                             <div className="line-clamp-6 break-all w-[98%] mt-7.5 ml-2.5 text-[20px] font-extralight">
//                                 {t('projects_page.modal.description')} {selectedCard.description}
//                             </div>

//                             <ProgressBar 
//                                 projectId={String(selectedCard.id)}
//                                 createdAt={selectedCard.createdAt}
//                                 closedAt={selectedCard.closedAt}
//                                 showDetails
//                             />

//                             <div className="flex flex-col border border-overlay-border-color rounded-sm w-80 max-h-40 overflow-y-auto ml-10">
//                                 <span className="border-b border-overlay-border-color p-2 text-2xl">{t('projects_page.modal.members')}</span>
//                                 {selectedCard.participants?.map(p => 
//                                     <div
//                                         key={p.user.id}
//                                         className="flex flex-row justify-between p-2 border-b border-overlay-border-color/50"
//                                     >
//                                         <div>
//                                             {p.user.name} {p.user.surname}
//                                         </div>
//                                         {isOwner && p.user.id !== activeUser?.id ? (
//                                             <div
//                                                 onClick={(e) => {
//                                                     const rect = e.currentTarget.getBoundingClientRect();
//                                                     setRolePosition({ top: rect.bottom, left: rect.left });
//                                                     setChangeRoleFor(prev => prev === p.user.id ? null : p.user.id);
//                                                 }}
//                                                 className="hover:cursor-pointer"
//                                             >
//                                                 {p.role}
//                                             </div>
//                                         ) : (
//                                             <div>
//                                                 {p.role}
//                                             </div>
//                                         )}
//                                     </div>
//                                 )}
//                             </div>

//                             <div className="flex flex-wrap justify-between mt-auto mb-1.25 w-full">
//                                 <button 
//                                     className="border border-overlay-border-color text-xl p-3 rounded-sm m-2 w-50 h-15 transition-all duration-300 hover:border-owner-color hover:text-owner-color hover:scale-110 active:scale-90"
//                                     onClick={() => {
//                                         setSelectedProject(selectedCard);
//                                         setActivePage('dashboard');
//                                         handleClose();
//                                     }}
//                                 >
//                                     {t('projects_page.modal.set_active')}
//                                 </button>
//                                 <button
//                                     onClick={() => setDeleteProject(true)}
//                                     className="flex items-center justify-center gap-2 border border-overlay-border-color text-xl p-3 rounded-sm m-2 w-50 h-15 transition-all duration-300 hover:border-red-500 hover:scale-110 active:scale-90">
//                                     <FiAlertTriangle 
//                                         size={24}
//                                         className="text-red-500"
//                                     />
//                                     {t('projects_page.modal.delete')}
//                                 </button>
//                                 <button 
//                                     className="border border-overlay-border-color text-xl p-3 rounded-sm m-2 w-50 h-15 transition-all duration-300 hover:border-owner-color hover:text-owner-color hover:scale-110 active:scale-90"
//                                     onClick={handleClose}
//                                 >
//                                     {t('projects_page.modal.close')}
//                                 </button>
//                             </div>
//                         </div>
//                         <TaskCard
//                             selectedProject={selectedCard}
//                         />
//                     </div>
//                 </div>
//             )}
//             {changeRoleFor !== null && selectedCard && (
//                 <div
//                     style={{ top: rolePosition.top, left: rolePosition.left }}
//                     className="fixed w-40 h-auto bg-bg-color border border-overlay-border-color rounded-sm z-200"
//                 >
//                     {ROLES.map(role =>
//                         <div
//                             key={role}
//                             onClick={() => handleRoleChange(changeRoleFor, role)}
//                             className="p-2 hover:bg-owner-color/20 transition-colors hover:cursor-pointer"
//                         >
//                             {role}
//                         </div>
//                     )}
//                 </div>
//             )}
//             {createProject && (
//                 <CreateProject
//                     setCreateProject={setCreateProject}
//                 />
//             )}
//             <div
//                 onClick={() => setDeleteProject(false)}
//                 className={`flex items-center justify-center fixed inset-0 z-100 w-full h-full bg-bg-color/30 backdrop-blur-xs transition-all duration-100 origin-center
//                     ${deleteProject ? "opacity-100" : "opacity-0 pointer-events-none"}
//                 `}
//             >
//                 <div
//                     onClick={(e) => e.stopPropagation()}
//                     className={`flex flex-col items-center bg-bg-color w-150 h-60 border border-red-500 rounded-lg transition-all duration-300 origin-center
//                     ${deleteProject ? "scale-100" : "scale-0 pointer-events-none"}
//                 `}
//                 >
//                     <span className="text-3xl pt-2 line-clamp-2 text-center">
//                         {t('projects_page.delete_modal.title', { name: selectedCard?.name || '' })}
//                     </span>
//                     <span className="flex items-center gap-2 p-2 font-light text-lg text-center"><FiAlertTriangle className="text-red-500"/>{t('projects_page.delete_modal.warning')}</span>
//                     <div className="flex flex-row gap-20 pt-10">
//                         <button
//                             onClick={handleDeleteProject}
//                             className="border border-overlay-border-color rounded-sm p-2 w-40 h-15 transition-all duration-300 hover:border-owner-color hover:text-owner-color hover:scale-110 active:scale-90">{t('projects_page.delete_modal.confirm')}</button>
//                         <button
//                             onClick={() => setDeleteProject(false)}
//                             className="border border-overlay-border-color rounded-sm p-2 w-40 h-15 transition-all duration-300 hover:border-owner-color hover:text-owner-color hover:scale-110 active:scale-90">{t('projects_page.delete_modal.cancel')}</button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ProjectsPage;

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiAlertTriangle, FiUser, FiUserPlus, FiCheck } from 'react-icons/fi';
import Category from './category';
import ProgressBar from './progressBar';
import TaskCard from './taskCard';
import { CreateProject } from './createProject';
import { useWebSocket, type ProjectDetailed, type ProjectParticipant, ROLES, type Role } from '../../utilities/WebSocketContext';
import helpers from '../../utilities/helpers';

interface ProjectsPageProps {
    setActivePage: (page: string) => void;
    setSelectedProject: (project: ProjectDetailed) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ setActivePage, setSelectedProject }) => {
    const { t } = useTranslation();
    const { projects, activeOrg, activeUser, setProjects } = useWebSocket();
    const filteredProjects = projects.filter(proj =>
        proj.participants?.some(p => p.user.id === activeUser?.id)
    );
    
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        TODO: false,
        ACTIVE: false,
        REVIEW: false,
        COMPLETED: false,
    });

    const toggleCategory = (category: ProjectDetailed['status']) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

    const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
    const selectedCard = filteredProjects.find(p => p.id === selectedCardId) ?? null;
    const [isExpanding, setIsExpanding] = useState(false);
    const [cardPosition, setCardPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const [createProject, setCreateProject] = useState(false);
    const [deleteProject, setDeleteProject] = useState(false);
    const [changeRoleFor, setChangeRoleFor] = useState<number | null>(null);
    const [rolePosition, setRolePosition] = useState({ top: 0, left: 0 });
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [selectedMembersIds, setSelectedMembersIds] = useState<Set<number>>(new Set());

    const isOwner = selectedCard?.participants?.some(
        p => p.user.id === activeUser?.id && p.role === "OWNER"
    ) ?? false;

    const handleCardClick = (project: ProjectDetailed, e: React.MouseEvent<HTMLDivElement>) => {
        const cardRect = e.currentTarget.getBoundingClientRect();
        setCardPosition({
            top: cardRect.top,
            left: cardRect.left,
            width: cardRect.width,
            height: cardRect.height,
        });

        setSelectedCardId(project.id);
        setTimeout(() => setIsExpanding(true), 10);
    };

    const handleClose = () => {
        setIsExpanding(false);
        setChangeRoleFor(null);
        setAddMemberOpen(false);
        setSelectedMembersIds(new Set());
        setTimeout(() => setSelectedCardId(null), 400);
    }

    const handleDeleteProject = async () => {
        if (!selectedCard) return;

        const res = await helpers.deleter(`/api/v1/projects/delete/${selectedCard.id}`);

        if (res.success)
            setProjects(prev => prev.filter(p => p.id !== selectedCard.id));

        setDeleteProject(false);
    }

    const syncParticipants = async (updatedParticipants: ProjectParticipant[]) => {
        if (!selectedCard) return;

        const payloadParticipants = updatedParticipants.map(p => ({
            user: {
                id: p.user.id,
                name: p.user.name,
                surname: p.user.surname,
                email: p.user.email
            },
            role: p.role
        }));

        const res = await helpers.putter(`/api/v1/projects/${selectedCard.id}/participants`, {
            participants: payloadParticipants
        });

        if (res.success) {
            setProjects(prev => prev.map(proj =>
                proj.id === selectedCard.id
                    ? { ...proj, participants: updatedParticipants }
                    : proj
            ));
        }

        return res;
    }

    const handleRoleChange = async (participantId: number, newRole: Role) => {
        if (!selectedCard) return;

        const updatedParticipants = selectedCard.participants.map(p =>
            p.user.id === participantId
                ? { ...p, role: newRole }
                : p
        );

        await syncParticipants(updatedParticipants);
        setChangeRoleFor(null);
    }

    const toggleMemberSelection = (memberId: number) => {
        setSelectedMembersIds(prev => {
            const next = new Set(prev);
            if (next.has(memberId))
                next.delete(memberId);
            else
                next.add(memberId);
            return next;
        });
    }

    const handleToggleAddMember = () => {
        if (!addMemberOpen && selectedCard)
            setSelectedMembersIds(new Set(selectedCard.participants.map(p => p.user.id)));

        setChangeRoleFor(null);
        setAddMemberOpen(prev => !prev);
    }

    const handleConfirmMembers = async () => {
        if (!selectedCard) return;

        const ownerIds = new Set(
            selectedCard.participants.filter(p => p.role === "OWNER").map(p => p.user.id)
        );
        const ownerParticipants = selectedCard.participants.filter(p => ownerIds.has(p.user.id));

        const selectedMembers = activeOrg?.members
            ?.filter(m => selectedMembersIds.has(m.id) && !ownerIds.has(m.id)) ?? [];

        const nonOwnerParticipants: ProjectParticipant[] = selectedMembers.map(m => {
            const existing = selectedCard.participants.find(p => p.user.id === m.id);
            return existing ?? {
                user: { id: m.id, name: m.name, surname: m.surname, email: m.email },
                role: "VIEWER",
                joinedAt: new Date()
            };
        });

        await syncParticipants([...ownerParticipants, ...nonOwnerParticipants]);
        setAddMemberOpen(false);
    }

    return (
        <div className="flex no-scrollbar overflow-y-auto gap-x-[1vw] gap-y-5 ml-[2vw] flex-wrap justify-start items-start content-start bg-bg-color">
            <div className="flex flex-between w-full items-center">
                <h1 className="w-full ml-[2vw] text-[3.2em] font-bold leading-[1.1] my-8">{t('projects_page.title')}</h1>
                {activeOrg && (
                    <button
                        onClick={() => setCreateProject(true)}
                        className="flex items-center justify-center text-lg p-8 mr-[8%] border rounded-md border-overlay-border-color h-15 transition-all duration-300 hover:border-owner-color hover:scale-110 active:scale-90">
                        {t('projects_page.create_button')}
                    </button>
                )}
            </div>
            <div className="flex flex-wrap items-start gap-8">
                <Category label={t('projects_page.categories.todo')} status="TODO" projList={filteredProjects}
                    isExpanded={expandedCategories['TODO']}
                    onToggle={() => toggleCategory('TODO')}
                    onCardClick={handleCardClick}
                />
                <Category label={t('projects_page.categories.in_progress')} status="ACTIVE" projList={filteredProjects}
                    isExpanded={expandedCategories['ACTIVE']}
                    onToggle={() => toggleCategory('ACTIVE')}
                    onCardClick={handleCardClick}
                />
                <Category label={t('projects_page.categories.code_review')} status="REVIEW" projList={filteredProjects}
                    isExpanded={expandedCategories['REVIEW']}
                    onToggle={() => toggleCategory('REVIEW')}
                    onCardClick={handleCardClick}
                />
                <Category label={t('projects_page.categories.done')} status="COMPLETED" projList={filteredProjects}
                    isExpanded={expandedCategories['COMPLETED']}
                    onToggle={() => toggleCategory('COMPLETED')}
                    onCardClick={handleCardClick}
                />
            </div>

            {selectedCard && (
                <div className="fixed inset-0 bg-black/50 z-100" onClick={handleClose}>
                    <div
                        className={`fixed grid grid-cols-[3fr_1fr] bg-overlay-bg-color p-7.5 rounded-lg transition-all duration-400 overflow-hidden 
                            ${isExpanding 
                                ? 'top-[10vh]! left-[16vw]! w-[83vw]! h-[85vh]! opacity-100 border border-overlay-border-color' 
                                : 'opacity-0'
                            }`}
                        style={!isExpanding ? {
                            top: cardPosition.top,
                            left: cardPosition.left,
                            width: cardPosition.width,
                            height: cardPosition.height,
                        } : undefined}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-start border-r border-overlay-border-color h-full pr-4">
                            <div className="flex flex-wrap items-center w-full">
                                <h2 className="text-[50px] font-bold m-0 leading-tight">{selectedCard.name}</h2>
                                <p className="line-clamp-1 min-w-50 max-w-87.5 mr-5 ml-auto bg-owner-color text-center rounded-[5px] text-[20px] px-2">
                                    {selectedCard.organization.name}
                                </p>
                            </div>
                            
                            <div className="line-clamp-6 break-all w-[98%] mt-7.5 ml-2.5 text-[20px] font-extralight">
                                {t('projects_page.modal.description')} {selectedCard.description}
                            </div>

                            <ProgressBar 
                                projectId={String(selectedCard.id)}
                                createdAt={selectedCard.createdAt}
                                closedAt={selectedCard.closedAt}
                                showDetails
                            />

                            <div className="flex flex-col w-[98%] ml-2.5 mt-6 border border-overlay-border-color rounded-md overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-2 border-b border-overlay-border-color">
                                    <span className="text-2xl">{t('projects_page.modal.members')}</span>
                                    {isOwner && (
                                        <button
                                            type="button"
                                            onClick={handleToggleAddMember}
                                            className="flex items-center gap-1 text-sm px-2 py-1 rounded-sm border border-overlay-border-color transition-all duration-300 hover:border-owner-color hover:text-owner-color hover:cursor-pointer"
                                        >
                                            {addMemberOpen ? (
                                                <>
                                                    <FiCheck size={16}/>
                                                    {t('projects_page.modal.done')}
                                                </>
                                            ) : (
                                                <>
                                                    <FiUserPlus size={16}/>
                                                    {t('projects_page.modal.manage_members')}
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-48 overflow-y-auto no-scrollbar">
                                    {addMemberOpen ? (
                                        (activeOrg?.members ?? [])
                                            .filter(m => !selectedCard.participants.some(p => p.user.id === m.id && p.role === "OWNER"))
                                            .map(m => (
                                                <label
                                                    key={m.id}
                                                    className="flex items-center gap-3 px-4 py-2 border-b border-overlay-border-color/50 text-lg transition-colors duration-300 hover:bg-owner-color/10 hover:cursor-pointer has-checked:bg-owner-color/15"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedMembersIds.has(m.id)}
                                                        onChange={() => toggleMemberSelection(m.id)}
                                                        className="sr-only"
                                                    />
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 uppercase text-sm bg-overlay-border-color text-text-main">
                                                        {m.name.charAt(0)}{m.surname.charAt(0)}
                                                    </div>
                                                    <span className="truncate">{m.name} {m.surname}</span>
                                                </label>
                                            ))
                                    ) : (
                                        selectedCard.participants?.length > 0 ? (
                                            selectedCard.participants.map(p =>
                                                <div
                                                    key={p.user.id}
                                                    className="flex items-center justify-between gap-3 px-4 py-2 border-b border-overlay-border-color/50 text-lg"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 uppercase text-sm bg-overlay-border-color text-text-main">
                                                            {p.user.name.charAt(0)}{p.user.surname.charAt(0)}
                                                        </div>
                                                        <span className="truncate">{p.user.name} {p.user.surname}</span>
                                                    </div>
                                                    {isOwner && p.user.id !== activeUser?.id ? (
                                                        <div
                                                            onClick={(e) => {
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                setRolePosition({ top: rect.bottom, left: rect.left });
                                                                setChangeRoleFor(prev => prev === p.user.id ? null : p.user.id);
                                                            }}
                                                            className="shrink-0 px-2 py-0.5 rounded-full text-sm border border-overlay-border-color hover:border-owner-color hover:text-owner-color hover:cursor-pointer transition-all duration-300"
                                                        >
                                                            {p.role}
                                                        </div>
                                                    ) : (
                                                        <div className="shrink-0 px-2 py-0.5 rounded-full text-sm border border-overlay-border-color/50">
                                                            {p.role}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        ) : (
                                            <div className="flex flex-col items-center justify-center gap-2 py-6 font-light">
                                                <FiUser size={32} strokeWidth={1.5}/>
                                                {t('projects_page.modal.no_participants')}
                                            </div>
                                        )
                                    )}
                                </div>

                                {addMemberOpen && (
                                    <div className="flex justify-end px-4 py-2 border-t border-overlay-border-color">
                                        <button
                                            type="button"
                                            onClick={handleConfirmMembers}
                                            className="flex items-center gap-2 text-sm px-3 py-1 rounded-sm border border-overlay-border-color transition-all duration-300 hover:border-owner-color hover:text-owner-color hover:cursor-pointer"
                                        >
                                            <FiCheck size={16}/>
                                            {t('projects_page.modal.confirm_members')}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap justify-between mt-auto mb-1.25 w-full">
                                <button 
                                    className="border border-overlay-border-color text-xl p-3 rounded-sm m-2 w-50 h-15 transition-all duration-300 hover:border-owner-color hover:text-owner-color hover:scale-110 active:scale-90"
                                    onClick={() => {
                                        setSelectedProject(selectedCard);
                                        setActivePage('dashboard');
                                        handleClose();
                                    }}
                                >
                                    {t('projects_page.modal.set_active')}
                                </button>
                                <button
                                    onClick={() => setDeleteProject(true)}
                                    className="flex items-center justify-center gap-2 border border-overlay-border-color text-xl p-3 rounded-sm m-2 w-50 h-15 transition-all duration-300 hover:border-red-500 hover:scale-110 active:scale-90">
                                    <FiAlertTriangle 
                                        size={24}
                                        className="text-red-500"
                                    />
                                    {t('projects_page.modal.delete')}
                                </button>
                                <button 
                                    className="border border-overlay-border-color text-xl p-3 rounded-sm m-2 w-50 h-15 transition-all duration-300 hover:border-owner-color hover:text-owner-color hover:scale-110 active:scale-90"
                                    onClick={handleClose}
                                >
                                    {t('projects_page.modal.close')}
                                </button>
                            </div>
                        </div>
                        <TaskCard
                            selectedProject={selectedCard}
                        />
                    </div>
                </div>
            )}
            {changeRoleFor !== null && selectedCard && (
                <div
                    style={{ top: rolePosition.top, left: rolePosition.left }}
                    className="fixed w-40 h-auto bg-bg-color border border-overlay-border-color rounded-sm z-200"
                >
                    {ROLES.map(role =>
                        <div
                            key={role}
                            onClick={() => handleRoleChange(changeRoleFor, role)}
                            className="p-2 hover:bg-owner-color/20 transition-colors hover:cursor-pointer"
                        >
                            {role}
                        </div>
                    )}
                </div>
            )}
            {createProject && (
                <CreateProject
                    setCreateProject={setCreateProject}
                />
            )}
            <div
                onClick={() => setDeleteProject(false)}
                className={`flex items-center justify-center fixed inset-0 z-100 w-full h-full bg-bg-color/30 backdrop-blur-xs transition-all duration-100 origin-center
                    ${deleteProject ? "opacity-100" : "opacity-0 pointer-events-none"}
                `}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={`flex flex-col items-center bg-bg-color w-150 h-60 border border-red-500 rounded-lg transition-all duration-300 origin-center
                    ${deleteProject ? "scale-100" : "scale-0 pointer-events-none"}
                `}
                >
                    <span className="text-3xl pt-2 line-clamp-2 text-center">
                        {t('projects_page.delete_modal.title', { name: selectedCard?.name || '' })}
                    </span>
                    <span className="flex items-center gap-2 p-2 font-light text-lg text-center"><FiAlertTriangle className="text-red-500"/>{t('projects_page.delete_modal.warning')}</span>
                    <div className="flex flex-row gap-20 pt-10">
                        <button
                            onClick={handleDeleteProject}
                            className="border border-overlay-border-color rounded-sm p-2 w-40 h-15 transition-all duration-300 hover:border-owner-color hover:text-owner-color hover:scale-110 active:scale-90">{t('projects_page.delete_modal.confirm')}</button>
                        <button
                            onClick={() => setDeleteProject(false)}
                            className="border border-overlay-border-color rounded-sm p-2 w-40 h-15 transition-all duration-300 hover:border-owner-color hover:text-owner-color hover:scale-110 active:scale-90">{t('projects_page.delete_modal.cancel')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectsPage;