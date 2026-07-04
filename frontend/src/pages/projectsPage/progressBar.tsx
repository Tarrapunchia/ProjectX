import { useTranslation } from 'react-i18next';
import { MOCK_TASKS } from '../../data/mockData';

interface ProgressBarProps {
    projectId: string;
    createdAt: Date;
    closedAt: Date | null;
    showDetails?: boolean;
}

export default function ProgressBar({ projectId, createdAt, closedAt, showDetails = false }: ProgressBarProps) {
    const { i18n } = useTranslation();
    const tasks = MOCK_TASKS.filter((t) => t.projectId === projectId);
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    const percent = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

    const start = new Date(createdAt).getTime();
    const now = Date.now();
    const end = closedAt ? new Date(closedAt).getTime() : 0;
    const timePercent = end > start ? Math.min(Math.round(((now - start) / (end - start)) * 100), 100) : 0;

    return (
        <div className="w-[90%] px-[10px] mx-auto mt-30 mb-15">
            <div className="relative w-full h-[24px] bg-progressbar-bg rounded-[12px] mt-[20px] overflow-visible">
                <div className="h-full bg-gradient-color rounded-xl transition-[width] duration-500 ease-in-out"
                    style={{ width: `${percent}%` }}
                ></div>
                {timePercent > 0 && (
                    <div className="absolute top-[-20%] h-[140%] w-[2px] bg-[rgba(255,0,0,0.616)] rounded-[1px] z-[1] -translate-x-1/2"
                        style={{ left: `${timePercent}%` }}
                    ></div>
                )}
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[13px] font-medium text-bg-color whitespace-nowrap">
                    {showDetails ? `${completed}/${tasks.length}` : ''}({percent}%)
                </span>
            </div>
            {showDetails && (
                <div className="flex justify-between mt-[5px] text-[14px] font-light">
                    <span>{new Date(createdAt).toLocaleDateString(i18n.language)}</span>
                    {closedAt && (
                        <span>{new Date(closedAt).toLocaleDateString(i18n.language)}</span>
                        )}
                </div>
            )}
        </div>
    );
}