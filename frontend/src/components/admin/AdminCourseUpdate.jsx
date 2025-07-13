import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiServices from "../../ApiServices";

export default function AdminCourseUpdate() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [formData, setFormData] = useState({
        courseName: "",
        logo: "",
        status: true
    });

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await ApiServices.GetCourseById(id);
                if (res.data.success) {
                    setFormData(res.data.data);
                } else {
                    setMessage({ text: "Failed to load course", type: "error" });
                }
            } catch (err) {
                setMessage({ text: "Error loading course", type: "error" });
            } finally {
                setLoading(false);
            }
        };
        
        if (id) fetchCourse();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            return setMessage({ text: "Only image files allowed", type: "error" });
        }
        if (file.size > 2 * 1024 * 1024) {
            return setMessage({ text: "Image must be under 2MB", type: "error" });
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = () => {
            setFormData(prev => ({ ...prev, logo: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: "", type: "" });

        if (!formData.courseName.trim()) {
            return setMessage({ text: "Course name is required", type: "error" });
        }

        try {
            setUploading(true);
            const payload = new FormData();
            payload.append("courseName", formData.courseName);
            payload.append("status", formData.status);
            
            // Handle image upload if changed
            if (formData.logo.startsWith("data:image")) {
                const blob = await fetch(formData.logo).then(r => r.blob());
                payload.append("logo", blob);
            }

            const res = await ApiServices.UpdateCourse(id, payload);
            if (res.data.success) {
                setMessage({ 
                    text: "Course updated successfully! Redirecting...", 
                    type: "success" 
                });
                setTimeout(() => navigate("/admin/course"), 1500);
            } else {
                setMessage({ text: res.data.message || "Update failed", type: "error" });
            }
        } catch (err) {
            setMessage({ text: "Error updating course", type: "error" });
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-violet-600 py-4 px-6">
                    <h2 className="text-xl font-bold text-white">Update Course</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    {message.text && (
                        <div className={`mb-4 px-4 py-2 rounded-lg ${
                            message.type === "error" 
                                ? "bg-red-100 text-red-700" 
                                : "bg-green-100 text-green-700"
                        }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Course Name */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Course Name
                        </label>
                        <input
                            type="text"
                            name="courseName"
                            value={formData.courseName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            placeholder="Enter course name"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Course Logo
                        </label>
                        <div className="flex flex-col items-center">
                            <div 
                                className="relative w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 cursor-pointer overflow-hidden group"
                                onClick={() => fileInputRef.current.click()}
                            >
                                {formData.logo ? (
                                    <img 
                                        src={formData.logo} 
                                        alt="Course logo" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-xs mt-1">Upload</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-medium">Change</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Click to upload (JPG, PNG, max 2MB)</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full bg-violet-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-violet-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-70 flex items-center justify-center"
                    >
                        {uploading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating...
                            </>
                        ) : "Update Course"}
                    </button>
                </form>
            </div>
        </div>
    );
}