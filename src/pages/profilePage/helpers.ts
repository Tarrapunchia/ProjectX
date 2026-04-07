import CONSTS from '../../data/consts'

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
            return {success: true, usr: user}
        }
    } catch (error) {
        console.log(error)
        return { success: false, usr: '' }
    }
    return { success: false, usr: '' }
}

export default {
    getUserInfos: getUserInfos
}