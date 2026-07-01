
// const getProjOwner = async (orgId: string, BE: string)
// : Promise<{ success: boolean, orgName?: string }> => {
//     try {
//         const res = await fetch(
//             `${BE}/api/v1/organizations/${orgId}/organization`,
//             {
//             method: 'GET',
//             headers: { "Content-Type": "application/json" },
//             credentials: "include",
//             }
//         )
//         if (!res.ok) return { success: false }
//         const org = await res.json()
//         return { success: true, orgName: org.name }
//     } catch (error) {
//         return { success: false }
//     }
// } 

// const getProjOwner = async (orgId: string, BE: string) => {
//     try {
//         const res = await fetch(
//             `${BE}/api/v1/organizations/${orgId}/organization`,
//             {
//             method: 'GET',
//             headers: { "Content-Type": "application/json" },
//             credentials: "include",
//             }
//         )
//         if (!res.ok) return ''
//         const org = await res.json()
//         return org.name
//     } catch (error) {
//         return 'Err'
//     }
// } 

// 	const res = await fetch('https://localhost:5000/api/v1/projects', {
// 		method: "GET",
// 		headers: { "Content-Type": "application/json" },
// 		credentials: "include",
// 	});

// export interface Projects {
// 	id: string;
// 	owner: string;
// 	name: string;
// 	description: string;
// 	startDate: string;
// 	targetDate: string;
// 	completed: boolean;
// 	completedDate: string;
// 	role: string;
// 	status: string;
// }


// export default {
//     getProjOwner: getProjOwner
// }