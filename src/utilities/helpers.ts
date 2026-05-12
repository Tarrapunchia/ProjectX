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

const poster = async (api: string, body: any)
: Promise<{ success: boolean, data: any }> => {
    try {
        const res = await fetch(
            `${CONSTS.BE + api}`,
            {
                method: 'POST',
                headers: { 
                    "Accept": 'application/json' 
                },
                credentials: 'include',
                body: body
            }
        )
        if (res.ok) {
            const data = await res.json()
            return { success: true, data: data }
        }
        return { success: false, data: res.statusText }
    } catch (error) {
        console.log(error)
        return { success: false, data: '' }
    }
}

const putter = async (api: string, body: any): Promise<{ success: boolean, data: any }> => {
    try {
        const res = await fetch(
            `${CONSTS.BE + api}`,
            {
                method: 'PUT', // Cambiato in PUT
                headers: { 
                    "Accept": 'application/json',
                    "Content-Type": 'application/json' // Fondamentale per inviare JSON
                },
                credentials: 'include',
                body: JSON.stringify(body) // Trasformiamo l'oggetto in stringa JSON
            }
        )
        
        if (res.ok) {
            const data = await res.json()
            return { success: true, data: data }
        }
        
        // In caso di errore (400, 401, 404, ecc.)
        const errorData = await res.json().catch(() => ({}));
        return { success: false, data: errorData.error || res.statusText }
        
    } catch (error) {
        console.error("Putter Error:", error)
        return { success: false, data: 'Network error' }
    }
}

export default {
    getter,
	poster,
	putter,
}