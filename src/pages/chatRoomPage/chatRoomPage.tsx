import chat from "./chat"
import type { ProjectInfo } from "../../data/types"
import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiPaperclip } from 'react-icons/fi';

interface ChatPageProps {
    selectedProject: ProjectInfo | null
}

const ChatPage: React.FC<ChatPageProps> = ({ selectedProject }) => {
    return (chat({selectedProject}))
}

export default ChatPage