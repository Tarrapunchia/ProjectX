import chat from "../../components/chat"
import type { ProjectInfo } from "../../data/types"

interface ChatPageProps {
    selectedProject: ProjectInfo | null
}

const ChatPage: React.FC<ChatPageProps> = ({ selectedProject }) => {
    return (chat({selectedProject}))
}

export default ChatPage