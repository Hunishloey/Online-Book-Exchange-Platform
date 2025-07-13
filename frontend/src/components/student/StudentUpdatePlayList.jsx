import React, { useEffect, useState } from "react";
import ApiServices from "../../ApiServices";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function StudentUpdatePlayList() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        title: '',
        subjectId: ''
    });
    const [videoLinks, setVideoLinks] = useState(['']);
    const [isPublic, setIsPublic] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Fetch subjects
        ApiServices.GetAllSubject({ status: true, limit: 100 })
            .then((res) => {
                setSubjects(res.data.data);
            })
            .catch((err) => {
                console.log(err);
                toast.error('Failed to load subjects');
            });

        // Fetch playlist data
        ApiServices.GetPlayListById(id)
            .then((response) => {
                const playlistData = response.data.data;
                setFormData({
                    title: playlistData.title,
                    subjectId: playlistData.subjectId?._id || playlistData.subjectId
                });
                setIsPublic(playlistData.isPublic);
                
                // Initialize video links (max 5)
                if (playlistData.videoLinks && playlistData.videoLinks.length > 0) {
                    const links = [...playlistData.videoLinks];
                    if (links.length < 5) links.push('');
                    setVideoLinks(links.slice(0, 5));
                }
            })
            .catch((error) => {
                console.log(error);
                toast.error('Failed to load playlist data');
            });
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleVideoLinkChange = (index, value) => {
        const newLinks = [...videoLinks];
        newLinks[index] = value;
        setVideoLinks(newLinks);
    };

    const addVideoLink = () => {
        if (videoLinks.length < 5) {
            setVideoLinks([...videoLinks, '']);
        }
    };

    const removeVideoLink = (index) => {
        if (videoLinks.length > 1) {
            const newLinks = [...videoLinks];
            newLinks.splice(index, 1);
            setVideoLinks(newLinks);
        }
    };

    const togglePublicStatus = async () => {
        try {
            const newStatus = !isPublic;
            await ApiServices.ChangePublicStatus(id, { isPublic: newStatus });
            setIsPublic(newStatus);
            toast.success(`Playlist is now ${newStatus ? 'public' : 'private'}!`);
        } catch (error) {
            console.error("Failed to update public status", error);
            toast.error('Failed to update visibility status');
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const validLinks = videoLinks.filter(link => link.trim() !== '');

        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.subjectId) newErrors.subjectId = 'Subject is required';
        if (validLinks.length === 0) newErrors.videoLinks = 'At least one video link is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!validateForm()) {
            setIsSubmitting(false);
            return;
        }

        try {
            // Filter out empty video links
            const validLinks = videoLinks.filter(link => link.trim() !== '');
            
            const payload = {
                ...formData,
                videoLinks: validLinks
            };

            const response = await ApiServices.UpdatePlayList(id, payload);
            if (response.data.success) {
                toast.success('Playlist updated successfully!');
                setTimeout(() => navigate('/student/playlist/your'), 1000);
            } else {
                throw new Error('Update failed');
            }
        } catch (error) {
            console.error("Update failed", error);
            toast.error('Failed to update playlist. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            
            <div className="bg-gradient-to-r from-rose-50 to-violet-50 py-6 px-8 border-b border-rose-100">
                <h1 className="text-2xl font-bold text-gray-800">Update Playlist</h1>
                <p className="text-gray-600 mt-1">
                    Update your playlist information
                </p>
            </div>

            <form onSubmit={submitHandler} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            placeholder="Playlist title"
                            className={`w-full px-4 py-2.5 rounded-lg border ${errors.title ? 'border-rose-500' : 'border-gray-300'
                                } focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                            value={formData.title}
                            onChange={handleInputChange}
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-rose-600">{errors.title}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                name="subjectId"
                                className={`w-full px-4 py-2.5 rounded-lg appearance-none border ${errors.subjectId ? 'border-rose-500' : 'border-gray-300'
                                    } focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                                value={formData.subjectId}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Subject</option>
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
                        {errors.subjectId && (
                            <p className="mt-1 text-sm text-rose-600">{errors.subjectId}</p>
                        )}
                    </div>
                </div>

                {/* Video Links Section */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Video Links (Max 5) <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-xs text-gray-500">
                            {videoLinks.filter(link => link.trim() !== '').length}/5 added
                        </span>
                    </div>
                    
                    {videoLinks.map((link, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <input
                                type="url"
                                value={link}
                                onChange={(e) => handleVideoLinkChange(index, e.target.value)}
                                placeholder="Paste video link (YouTube, Vimeo, etc.)"
                                className={`flex-grow px-4 py-2.5 rounded-lg border ${errors.videoLinks && index === 0 ? 'border-rose-500' : 'border-gray-300'} focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                            />
                            
                            {videoLinks.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeVideoLink(index)}
                                    className="ml-2 p-2 text-rose-500 hover:bg-rose-50 rounded-full"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                            
                            {index === videoLinks.length - 1 && videoLinks.length < 5 && (
                                <button
                                    type="button"
                                    onClick={addVideoLink}
                                    className="ml-2 p-2 text-green-500 hover:bg-green-50 rounded-full"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                    
                    {errors.videoLinks && (
                        <p className="mt-1 text-sm text-rose-600">{errors.videoLinks}</p>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                        Add links to your videos (e.g., YouTube, Vimeo). Maximum 5 links allowed.
                    </p>
                </div>

                {/* Public/Private Toggle */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Visibility Status</h3>
                            <p className="text-xs text-gray-500">
                                {isPublic
                                    ? "This playlist is visible to all users"
                                    : "This playlist is only visible to you"}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={togglePublicStatus}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublic ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isPublic ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        Toggle to make your playlist {isPublic ? 'private' : 'public'}
                    </p>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate('/student/playlist/your')}
                        className="px-6 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex items-center justify-center px-6 py-3 rounded-lg text-white font-medium ${isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700'
                            } transition-all duration-300 shadow-md hover:shadow-lg`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating...
                            </>
                        ) : (
                            <>
                                Update Playlist
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}