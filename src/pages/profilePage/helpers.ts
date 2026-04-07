import CONSTS from '../../data/consts'
import type { Friend } from '../../data/types'

const getUserInfos = async ()
: Promise<{ success: boolean, usr: any }> => {
    try {
        const res = await fetch(
            `${CONSTS.BE}/api/v1/users/activeUser`,
            {
                method: 'GET',
                headers: { "Content-Type": 'application/json' },
                credentials: 'include'
            }
        )
        if (res.ok) {
            const user = await res.json()
            console.log(user)

            return {success: true, usr: user}
        }
    } catch (error) {
        console.log(error)
        return { success: false, usr: '' }
    }
    return { success: false, usr: '' }
}

const getUserFriends = async ()
: Promise<{ success: boolean, friends: {count: number, friends: Friend[]} }> => {
    try {
        const res = await fetch(
            `${CONSTS.BE}/api/v1/friends/ACCEPTED`,
            {
                method: 'GET',
                headers: { "Content-Type": 'application/json' },
                credentials: 'include'
            }
        )
        if (res.ok) {
            const data = await res.json()
            const friends = data.friends.map((f: any) => ({
                id: f.id,
                name: f.name,
                surname: f.surname,
                email: f.email,
                job: f.jobQualifier,
                avatar: f.avatarUrl
            }))
            
            return {success: true, friends: {
                count: data.count,
                friends: friends
            }
            }
        }
    } catch (error) {
        console.log(error)
        return { success: false, friends: {count: 0, friends: []} }
    }
    return { success: false, friends: {count: 0, friends: []} }
}

export default {
    getUserInfos: getUserInfos,
    getUserFriends: getUserFriends
}
