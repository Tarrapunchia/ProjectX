import chat from "../../components/chat"
import type { Projects } from "../../data/types"

interface ChatPageProps {
    selectedProject: Projects | null
}

const ChatPage: React.FC<ChatPageProps> = ({ selectedProject }) => {
    return (chat({selectedProject}))
}

export default ChatPage