import { FiX, FiCheck } from 'react-icons/fi';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import helper from '../../../utilities/helpers';
import { useWebSocket } from '../../../utilities/WebSocketContext';

interface ChatMenuGroupCreateProps {
    createGroup: boolean;
    setCreateGroup: (value: boolean) => void;
}


export const ChatMenuGroupCreate = ({ createGroup, setCreateGroup }: ChatMenuGroupCreateProps) => {
    const { t } = useTranslation();
    const { loadGroups } = useWebSocket();
    const groupNameRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    const [isError, setIsError] = useState(false);
    const [shakeKey, setShakeKey] = useState(0);

    const resetFields = () => {
        if (groupNameRef.current)
            groupNameRef.current.value = '';
        if (descriptionRef.current)
            descriptionRef.current.value = '';
        setIsError(false);
    };

    const handleGroupCreation = async () => {
        const nameValue = groupNameRef.current?.value.trim() || '';
        const descValue = descriptionRef.current?.value.trim() || '';

        if (!nameValue) {
            setIsError(true);
            setShakeKey(prev => prev + 1);
            return;
        }

        setIsError(false);
        await helper.poster("/api/v1/groups/addGroup", {name: nameValue, description: descValue})
        await loadGroups();

        resetFields();
        setCreateGroup(false);
    };

    const handleCancel = () => {
        resetFields();
        setCreateGroup(false);
    }

    return (
        <div className={`absolute w-full h-full origin-center bg-bg-color transition-all duration-300
            ${createGroup ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}
        `}>
            <div className="mt-3">
                <span className="ml-7">
                    {t('chat_menu_group_create.group_name_label')}
                </span>
                <div className="flex items-center justify-center mt-2">
                    <input
                        key={shakeKey}
                        ref={groupNameRef}
                        type="text"
                        placeholder={t('chat_menu_group_create.group_name_placeholder')}
                        onChange={(e) => {
                            if (isError && e.target.value.trim()) setIsError(false);
                        }}
                        className={`flex relative border border-overlay-border-color rounded-full h-10 w-90 pl-3 focus:outline-none focus:border-owner-color
                                ${isError
                                    ? 'border-red-500 bg-red-50/5 focus:border-red-500'
                                    : 'border-overlay-border-color focus:border-owner-color'
                                }
                                ${isError && shakeKey > 0 ? 'animate-shake' : ''}`}
                    />
                </div>
            </div>
            <div className="mt-7">
                <span className="ml-7">
                    {t('chat_menu_group_create.description_label')}
                </span>
                <div className="flex items-center justify-center mt-2">
                    <textarea 
                        ref={descriptionRef}
                        placeholder={t('chat_menu_group_create.description_placeholder')}
                        spellCheck="false"
                        className="flex relative border border-overlay-border-color rounded-md h-40 w-90 pl-3 resize-none no-scrollbar focus:outline-none focus:border-owner-color"
                    />
                </div>
            </div>
            <div className="flex items-center justify-around mt-20">
                <button
                    onClick={handleGroupCreation}
                    className="flex items-center justify-start w-40 rounded-md border border-overlay-border-color bg-bg-color p-2 hover:bg-side-bg-color hover:text-owner-color hover:border-owner-color hover:cursor-pointer"
                >
                    <FiCheck size={24} className="mr-4"/>
                    <span>
                        {t('chat_menu_group_create.confirm_btn')}
                    </span>
                </button>
                <button
                    onClick={handleCancel}
                    className="flex items-center justify-start w-40 rounded-md border border-overlay-border-color bg-bg-color p-2 m-1 hover:bg-side-bg-color hover:text-red-600 hover:border-owner-color hover:cursor-pointer"
                >
                    <FiX size={24} className="mr-6"/>
                    <span>
                        {t('chat_menu_group_create.cancel_btn')}
                    </span>
                </button>
            </div>
        </div>
    )
}