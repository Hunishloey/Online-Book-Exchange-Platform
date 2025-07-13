import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiServices from "../../ApiServices";
import { FaEdit, FaTrash, FaPlay } from 'react-icons/fa';

export default function StudentYourPlayList() {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userData = JSON.parse(sessionStorage.getItem("userData"));

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                setLoading(true);
                const res = await ApiServices.GetAllPlayList({ 
                    addedById: userData._id 
                });
                setPlaylists(res.data.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load your playlists. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylists();
    }, [userData._id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-violet-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-600 mx-auto"></div>
                    <p className="mt-4 text-gray-700">Loading your playlists...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-violet-50">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                    <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Playlists</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (playlists.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-violet-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                    <div className="bg-violet-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Playlists Found</h2>
                    <p className="text-gray-600 mb-6">You haven't created any playlists yet.</p>
                    <Link 
                        to="/student/playlist/add"
                        className="inline-block bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all shadow-md"
                    >
                        Create Your First Playlist
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-violet-50 py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                        Your Study Playlists
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Manage all the playlists you've created. You can edit or delete them at any time.
                    </p>
                    <div className="mt-4">
                        <Link 
                            to="/student/playlist/add"
                            className="inline-flex items-center bg-gradient-to-r from-rose-500 to-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-rose-600 hover:to-rose-700 transition-all shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create New Playlist
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {playlists.map(playlist => (
                        <PlaylistItem key={playlist._id} playlist={playlist} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function PlaylistItem({ playlist }) {
    // Helper function to extract YouTube video IDs
    function getYouTubeId(url) {
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this playlist?")) {
            try {
                await ApiServices.DeletePlayList(playlist._id);
                alert("Playlist deleted successfully!");
                window.location.reload();
            } catch (err) {
                console.error(err);
                alert("Failed to delete playlist. Please try again.");
            }
        }
    };

    return (
        <div className="bg-gradient-to-br from-white to-rose-50 rounded-2xl shadow-xl overflow-hidden border border-rose-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative">
            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex space-x-2 z-10">
                <Link
                    to={`/student/playlist/your/update/${playlist._id}`}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-2 rounded-lg shadow-md hover:shadow-lg transition-all"
                    title="Edit playlist"
                >
                    <FaEdit className="w-4 h-4" />
                </Link>
                <button
                    onClick={handleDelete}
                    className="bg-gradient-to-r from-rose-500 to-rose-600 text-white p-2 rounded-lg shadow-md hover:shadow-lg transition-all"
                    title="Delete playlist"
                >
                    <FaTrash className="w-4 h-4" />
                </button>
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-rose-300 w-full">
                        {playlist.title || "Untitled Playlist"}
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-4">
                    <div className="flex items-center">
                        <div className="bg-rose-100 p-2 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-rose-600 font-medium">Subject</p>
                            <p className="text-sm font-medium text-gray-800">
                                {playlist.subjectId?.subjectName || "N/A"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="bg-violet-100 p-2 rounded-lg mr-3">
                            <FaPlay className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-xs text-violet-600 font-medium">Videos</p>
                            <p className="text-sm font-medium text-gray-800">
                                {playlist.videoLinks?.length || 0} videos
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="bg-violet-100 p-2 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-violet-600 font-medium">Created At</p>
                            <p className="text-sm text-gray-800">
                                {new Date(playlist.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="my-4">
                    <p className="text-xs font-medium text-rose-600 mb-1 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Visibility
                    </p>
                    <p className="text-sm text-gray-700 bg-rose-50 p-3 rounded-lg border border-rose-100">
                        {playlist.isPublic ? "Public (Visible to everyone)" : "Private (Only visible to you)"}
                    </p>
                </div>

                {playlist.videoLinks?.length > 0 && (
                    <div className="border-t border-rose-100 pt-4 mt-4">
                        <h3 className="text-sm font-medium text-violet-700 mb-3 flex items-center">
                            <FaPlay className="h-4 w-4 mr-2" />
                            Video Preview
                        </h3>
                        <div className="space-y-3">
                            {playlist.videoLinks.slice(0, 3).map((link, index) => {
                                const videoId = getYouTubeId(link);
                                return (
                                    <div key={index} className="bg-gradient-to-br from-white to-rose-50 p-3 rounded-xl border border-rose-100 shadow-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center">
                                                <div className="bg-rose-100 p-1.5 rounded-lg mr-2">
                                                    <FaPlay className="h-4 w-4 text-rose-600" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                                                    Video {index + 1}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="relative mt-2 rounded-lg overflow-hidden">
                                            {videoId ? (
                                                <img
                                                    src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                                    alt="Video thumbnail"
                                                    className="w-full h-20 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-20" />
                                            )}
                                            <a
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-10 transition-all"
                                            >
                                                <FaPlay className="h-8 w-8 text-white opacity-80" />
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {playlist.videoLinks.length > 3 && (
                            <div className="mt-3 text-sm text-gray-500">
                                + {playlist.videoLinks.length - 3} more videos
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}