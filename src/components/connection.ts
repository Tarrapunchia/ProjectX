import type { Projects } from "../data/types";

const getRoomId = async (serverUrl: string, project: Projects)
: Promise<string> => {
        const res = await fetch(
            `${serverUrl}/api/v1/projects/room/${project.id}`,
            // `${serverUrl}/api/v1/projects/room/19`,
            {
                credentials: "include",
                headers: { Accept: "application/json" },
            });

        if (!res.ok) { throw new Error(`HTTP ${res.status}`) };
        const data = await res.json()
        console.log(data)
        return data.roomId

}

const getRoomHistory = async (serverUrl: string, roomKey: string) => {
    console.log(`ROOM KEY FETCHED ${roomKey}`)
    // const key = roomKey.replaceAll(":", "%3A")
        const res = await fetch(
            `${serverUrl}/api/v1/messages/roomHistory?roomKey=${roomKey}`,
            {
                credentials: "include",
                headers: { Accept: "application/json" },
            });

        if (!res.ok) {
            console.log(res) 
            throw new Error(`HTTP ${res.status}`) };
        const data = await res.json()
        if (data.count === 0) return {count: 0}
        return data

}

export default {
    getRoomId: getRoomId,
    getRoomHistory: getRoomHistory
}