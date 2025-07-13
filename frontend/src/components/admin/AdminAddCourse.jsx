import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ApiServices from "../../ApiServices";

export default function AdminAddCourse() {
    const navigate = useNavigate();
    const [newCourse, setNewCourse] = useState({
        courseName: "",
        logo: null
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewCourse(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type and size
        if (!file.type.startsWith("image/")) {
            setMessage({ text: "Only image files allowed", type: "error" });
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setMessage({ text: "Image must be under 2MB", type: "error" });
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);

        // Update state
        setNewCourse(prev => ({ ...prev, logo: file }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: "", type: "" });

        if (!newCourse.courseName.trim()) {
            return setMessage({ text: "Course name is required", type: "error" });
        }

        try {
            setLoading(true);
            
            const formData = new FormData();
            formData.append("courseName", newCourse.courseName);
            
            if (newCourse.logo) {
                formData.append("logo", newCourse.logo);
            }

            const response = await ApiServices.AddCourse(formData);
            
            if (response.data.success) {
                setMessage({ 
                    text: "Course added successfully! Redirecting...", 
                    type: "success" 
                });
                setTimeout(() => navigate("/admin/course"), 1500);
            } else {
                setMessage({ 
                    text: response.data.message || "Failed to add course", 
                    type: "error" 
                });
            }
        } catch (error) {
            setMessage({ 
                text: error.response?.data?.message || "Error adding course", 
                type: "error" 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 to-indigo-700 py-4 px-6">
                    <h3 className="text-xl font-bold text-white">Add New Course</h3>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {message.text && (
                        <div className={`mb-4 px-4 py-3 rounded-lg ${
                            message.type === "error" 
                                ? "bg-red-50 text-red-700 border border-red-200" 
                                : "bg-green-50 text-green-700 border border-green-200"
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Course Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Course Name *
                            </label>
                            <input
                                type="text"
                                name="courseName"
                                placeholder="Enter course name"
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                value={newCourse.courseName}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Course Logo
                            </label>
                            
                            <div className="flex flex-col items-center">
                                {/* Image preview area */}
                                <div 
                                    className="relative w-40 h-40 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 overflow-hidden group cursor-pointer"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    {previewUrl ? (
                                        <img 
                                            src={previewUrl} 
                                            alt="Course preview" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm mt-2">Click to upload</span>
                                            <span className="text-xs text-gray-500 mt-1">(JPG, PNG, max 2MB)</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white font-medium">
                                            {previewUrl ? "Change Image" : "Upload Image"}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Hidden file input */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex space-x-3">
                        <button
                            type="button"
                            onClick={() => {
                                setNewCourse({ courseName: "", logo: null });
                                setPreviewUrl(null);
                                setMessage({ text: "", type: "" });
                            }}
                            disabled={loading}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-700 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Adding...
                                </>
                            ) : "Add Course"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}