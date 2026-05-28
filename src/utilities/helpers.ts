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
                    "Accept": 'application/json',
                    "Content-Type": "application/json"
                },
                credentials: 'include',
                body: JSON.stringify(body)
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

const uploadFile = async (api: string, body: FormData)
: Promise<{ success: boolean, data: any }> => {
    try {
        const res = await fetch(
            `${CONSTS.BE + api}`,
            {
                method: 'POST',
                headers: { 
                    // Chiediamo comunque di ricevere JSON come risposta dal server
                    "Accept": 'application/json'
                    // NOTA: Niente "Content-Type" qui! Lo imposta il browser da solo con il boundary corretto.
                },
                credentials: 'include',
                // Passiamo direttamente il FormData senza stringify
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
                method: 'PUT',
                headers: { 
                    "Accept": 'application/json',
                    "Content-Type": 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(body)
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

const deleter = async (api: string, body: any = null) => {
    try 
	{
        const headers: Record<string, string> = {
            'Accept': 'application/json',
        };

        if (body) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${CONSTS.BE}${api}`, {
            method: 'DELETE',
            headers: headers,
            credentials: 'include',
            body: body ? JSON.stringify(body) : undefined, 
        });

        return {
            success: response.ok
        };
    } catch (error) {
        console.error("Helper Deleter Error:", error);
        return {
            success: false,
            data: { error: "Errore di rete" },
        };
    }
};

export default {
    getter,
	poster,
	putter,
	deleter,
	uploadFile,
}