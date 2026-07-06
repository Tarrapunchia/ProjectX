import type { ProjectDetailed } from "../../utilities/WebSocketContext";

const getRoomId = async (serverUrl: string, project: ProjectDetailed)
: Promise<string> => {
        const res = await fetch(
            `${serverUrl}/api/v1/projects/room/${project.id}`,
            {
                credentials: "include",
                headers: { Accept: "application/json" },
            });

        if (!res.ok) { throw new Error(`HTTP ${res.status}`) };
        const data = await res.json()
        return data.roomId

}

const getRoomHistory = async (serverUrl: string, roomKey: string) => {
	const res = await fetch(
		`${serverUrl}/api/v1/messages/roomHistory?roomKey=${roomKey}`,
		{
			credentials: "include",
			headers: { Accept: "application/json" },
		});

	if (!res.ok) {
		throw new Error(`HTTP ${res.status}`) };
	const data = await res.json()
	if (data.count === 0) return {count: 0}
	return data

}

export default {
    getRoomId: getRoomId,
    getRoomHistory: getRoomHistory
}