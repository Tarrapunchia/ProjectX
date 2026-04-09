import CONSTS from '../data/consts'

const getter = async (api: string, params: any | null)
: Promise<{ success: boolean, data: any }> => {
    try {
        const res = await fetch(
            `${CONSTS.BE + api}`,
            {
                method: 'GET',
                headers: { "Content-Type": 'application/json' },
                credentials: 'include'
            }
        )
        if (res.ok) {
            const data = await res.json()
            return {success: true, data: data}
        }
    } catch (error) {
        console.log(error)
        return { success: false, data: '' }
    }
    return { success: false, data: '' }
}

export default {
    getter,
}