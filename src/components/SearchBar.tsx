import React, { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiFolder, FiLoader } from 'react-icons/fi';
import helpers from '../utilities/helpers';

interface SearchBarProps {
    activeUserId: string | number | null;
}

const SearchBar: React.FC<SearchBarProps> = ({activeUserId}) => 
{
	
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ users: any[], projects: any[] }>({ users: [], projects: [] });
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (!activeUserId) return;
        const timeoutId = setTimeout(() => {
            if (query.length > 0) {
                performSearch(query);
            } else {
                setResults({ users: [], projects: [] });
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, activeUserId]);

    const performSearch = async (searchTerm: string) => 
	{
        setLoading(true);
        setShowDropdown(true);
        try {
            const [usersRes, projectsRes] = await Promise.all([
                helpers.getter(`/api/v1/users/search?username=${searchTerm}`, null),
                helpers.getter(`/api/v1/projects/user-participation/${activeUserId}/search?name=${searchTerm}`, null)
            ]);

            setResults({
                users: usersRes.data || [],
                projects: projectsRes.data.projects || []
            });
        } catch (error) {
            console.error("Errore durante la ricerca:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-50 md:max-w-75 mr-6">
            {/* Icona di ricerca o Loader */}
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                {loading ? <FiLoader className="animate-spin" size={18} /> : <FiSearch size={18} />}
            </span>
            
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length > 0 && setShowDropdown(true)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-bg-color border border-overlay-border-color rounded-full text-sm text-text-main placeholder-slate-500 focus:outline-none focus:border-border-focus transition-all duration-200"
            />

            {/* Dropdown dei risultati */}
            {showDropdown && (query.length > 0) && (
                <div className="absolute top-full mt-2 w-full bg-side-bg-color border border-overlay-border-color rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto p-2 no-scrollbar">
                    
                    {/* Sezione Utenti */}
                    <div className="mb-2">
                        <h3 className="text-xs font-semibold text-slate-500 px-3 py-1 uppercase">Utenti</h3>
                        {results.users.length > 0 ? results.users.map((user: any) => (
                            <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-overlay-hover rounded-lg cursor-pointer transition-colors">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs">
                                    <FiUser />
                                </div>
                                <span className="text-sm text-text-main">{user.name} {user.surname}</span>
                            </div>
                        )) : <p className="text-xs text-text-main px-3">Nessun utente trovato</p>}
                    </div>

                    <hr className="border-overlay-border-color my-2" />

                    {/* Sezione Progetti */}
                    <div>
                        <h3 className="text-xs font-semibold text-slate-500 px-3 py-1 uppercase">Progetti</h3>
                        {results.projects.length > 0 ? results.projects.map((project: any) => (
                            <div key={project.id} className="flex items-center gap-3 p-2 hover:bg-overlay-hover rounded-lg cursor-pointer transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-blue-900/30 text-blue-400 flex items-center justify-center">
                                    <FiFolder />
                                </div>
                                <span className="text-sm text-text-main">{project.name}</span>
                            </div>
                        )) : <p className="text-xs text-text-main px-3">Nessun progetto trovato</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;