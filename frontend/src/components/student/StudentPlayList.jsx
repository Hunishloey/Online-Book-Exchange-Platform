import { useEffect, useState, useCallback } from "react";
import ApiServices from "../../ApiServices";
import { Link } from "react-router-dom";
import { FaUser, FaCalendarAlt, FaLock, FaLockOpen, FaBook, FaVideo, FaSearch, FaTimes } from "react-icons/fa";

// Helper function to extract YouTube video IDs
function getYouTubeId(url) {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Format date to "Month Day, Year"
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Debounce function
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};

export default function StudentPlayList() {
    const [playlists, setPlaylists] = useState([]);
    const [filteredPlaylists, setFilteredPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [filters, setFilters] = useState({
        title: "",
        subjectId: ""
    });

    const debouncedTitle = useDebounce(filters.title, 500);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const response = await ApiServices.GetAllPlayList({ isPublic: true });
                console.log("Playlists fetched successfully:", response.data.data);
                setPlaylists(response.data.data);
                setFilteredPlaylists(response.data.data);
            } catch (error) {
                console.error("Error fetching playlists:", error);
                setError("Failed to load playlists. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        const fetchSubjects = async () => {
            try {
                const response = await ApiServices.GetAllSubject({ status: true, limit: 100 });
                setSubjects(response.data.data);
            } catch (error) {
                console.error("Error fetching subjects:", error);
            }
        };

        fetchPlaylists();
        fetchSubjects();
    }, []);

    // Apply filters whenever filters change
    useEffect(() => {
        if (!playlists.length) return;

        const filtered = playlists.filter(playlist => {
            // Filter by title
            const matchesTitle = filters.title === "" || 
                playlist.title.toLowerCase().includes(filters.title.toLowerCase());
            
            // Filter by subject
            const matchesSubject = filters.subjectId === "" || 
                playlist.subjectId?._id === filters.subjectId;
            
            return matchesTitle && matchesSubject;
        });

        setFilteredPlaylists(filtered);
    }, [playlists, debouncedTitle, filters.subjectId]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const resetFilters = () => {
        setFilters({ title: "", subjectId: "" });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-rose-50 text-rose-700 rounded-lg text-center">
                {error}
                <button
                    className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">            
            {/* Filters Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 " style={{ marginTop: "5rem" }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <FaSearch className="mr-2 text-violet-600" />
                            Search by Title
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search playlists by title..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                value={filters.title}
                                onChange={(e) => handleFilterChange("title", e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            {filters.title && (
                                <button
                                    onClick={() => handleFilterChange("title", "")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <FaBook className="mr-2 text-violet-600" />
                            Filter by Subject
                        </label>
                        <div className="relative">
                            <select
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all bg-white"
                                value={filters.subjectId}
                                onChange={(e) => handleFilterChange("subjectId", e.target.value)}
                            >
                                <option value="">All Subjects</option>
                                {subjects.map(subject => (
                                    <option key={subject._id} value={subject._id}>
                                        {subject.subjectName}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {(filters.title || filters.subjectId) && (
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={resetFilters}
                            className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                            <FaTimes className="mr-1" />
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Playlist count */}
            <div className="text-sm text-gray-600 font-medium mb-6">
                Showing {filteredPlaylists.length} of {playlists.length} playlists
            </div>

            {/* Playlist Grid */}
            {filteredPlaylists.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
                    <div className="text-5xl mb-4 text-rose-400">📭</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No playlists found</h3>
                    <p className="text-gray-600 mb-4">
                        Try adjusting your search filters
                    </p>
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPlaylists.map((playlist) => (
                        <div
                            key={playlist._id}
                            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 group"
                        >
                            {/* Header with subject info */}
                            <div className="bg-gradient-to-r from-rose-100 to-violet-100 py-5 px-6 border-b border-rose-200">
                                <div className="flex items-center">
                                    <div className="bg-white rounded-full p-2 shadow-sm">
                                        {playlist.subjectId?.logo ? (
                                            <img
                                                src={playlist.subjectId.logo}
                                                alt={playlist.subjectId.subjectName}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-rose-200 to-violet-200 flex items-center justify-center">
                                                <FaBook className="text-violet-600 text-xl" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <div className="flex items-center">
                                            <FaBook className="text-rose-500 mr-2" />
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {playlist.subjectId?.subjectName || "No Subject"}
                                            </h3>
                                        </div>
                                        <div className="flex items-center mt-1">
                                            <FaVideo className="text-violet-500 mr-2 text-sm" />
                                            <p className="text-sm text-gray-600">
                                                {playlist.videoLinks?.length || 0} videos
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Playlist content */}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-bold text-gray-800 group-hover:text-violet-700 transition-colors">
                                        {playlist.title}
                                    </h2>
                                    <span className={`flex items-center text-xs font-semibold px-2.5 py-0.5 rounded ${playlist.isPublic
                                        ? "bg-green-100 text-green-800"
                                        : "bg-amber-100 text-amber-800"
                                        }`}>
                                        {playlist.isPublic ? (
                                            <>
                                                <FaLockOpen className="mr-1" /> Public
                                            </>
                                        ) : (
                                            <>
                                                <FaLock className="mr-1" /> Private
                                            </>
                                        )}
                                    </span>
                                </div>

                                {/* Creator info */}
                                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="bg-gradient-to-r from-rose-200 to-violet-200 w-10 h-10 rounded-full flex items-center justify-center">
                                            <FaUser className="text-violet-600" />
                                        </div>
                                        <div className="ml-3">
                                            <div className="flex items-center">
                                                <FaUser className="text-rose-500 mr-2 text-sm" />
                                                <p className="text-sm font-medium text-gray-700">
                                                    {playlist.addedById?.name || "Unknown Creator"}
                                                </p>
                                            </div>
                                            <div className="flex items-center mt-1">
                                                <FaCalendarAlt className="text-violet-500 mr-2 text-sm" />
                                                <p className="text-xs text-gray-500">
                                                    Created: {formatDate(playlist.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Video previews */}
                                <div className="mb-6">
                                    <div className="flex items-center mb-3">
                                        <FaVideo className="text-rose-500 mr-2" />
                                        <h4 className="text-sm font-medium text-gray-700">Videos in this playlist:</h4>
                                    </div>
                                    <div className="space-y-3">
                                        {playlist.videoLinks?.slice(0, 3).map((link, index) => {
                                            const videoId = getYouTubeId(link);
                                            return (
                                                <a
                                                    key={index}
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex-shrink-0 relative">
                                                        {videoId ? (
                                                            <div className="relative">
                                                                <img
                                                                    src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                                                    alt="Video thumbnail"
                                                                    className="w-16 h-9 rounded object-cover"
                                                                />
                                                                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                                                                    <svg
                                                                        className="w-5 h-5 text-white opacity-80"
                                                                        viewBox="0 0 24 24"
                                                                        fill="currentColor"
                                                                    >
                                                                        <path d="M8 5v14l11-7z" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-9" />
                                                        )}
                                                    </div>
                                                    <div className="ml-3 flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-violet-600 group-hover:text-violet-800 truncate">
                                                            Video {index + 1}
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate flex items-center">
                                                            <svg
                                                                className="w-3 h-3 mr-1 text-gray-400"
                                                                viewBox="0 0 24 24"
                                                                fill="currentColor"
                                                            >
                                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                                                            </svg>
                                                            {new URL(link).hostname.replace('www.', '')}
                                                        </div>
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>
                                    {playlist.videoLinks?.length > 3 && (
                                        <div className="mt-3 text-sm text-gray-500 flex items-center">
                                            <svg
                                                className="w-4 h-4 mr-1 text-gray-400"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                                            </svg>
                                            + {playlist.videoLinks.length - 3} more videos
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}