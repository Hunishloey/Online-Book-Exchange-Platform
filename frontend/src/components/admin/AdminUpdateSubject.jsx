import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiServices from "../../ApiServices";
import { toast } from "react-toastify";
import { BeatLoader } from "react-spinners";

export default function AdminUpdateSubject() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [originalData, setOriginalData] = useState(null);

    const [formData, setFormData] = useState({
        subjectName: "",
        courseId: "",
        semester: "",
        logo: "",
        status: true
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch subject data
                const subjectRes = await ApiServices.GetSubjectById(id);
                if (subjectRes.data.success) {
                    const subjectData = subjectRes.data.data;
                    const normalizedCourseId = subjectData.courseId?._id || subjectData.courseId;
                    setFormData({
                        ...subjectData,
                        courseId: normalizedCourseId
                    });
                    setOriginalData({
                        ...subjectData,
                        courseId: normalizedCourseId
                    });
                } else {
                    toast.error("Failed to load subject");
                }

                // Fetch courses for dropdown
                const filterParams = {
                    pageno: 1,
                    limit: 100
                };
                const coursesRes = await ApiServices.GetAllCourses(filterParams);
                if (coursesRes.data.success) {
                    setCourses(coursesRes.data.data || []);
                }
            } catch (err) {
                toast.error("Error loading data");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            return toast.error("Only image files allowed");
        }

        if (file.size > 2 * 1024 * 1024) {
            return toast.error("Image must be under 2MB");
        }

        const reader = new FileReader();
        reader.onload = () => {
            setFormData(prev => ({ ...prev, logo: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.subjectName.trim()) {
            return toast.error("Subject name is required");
        }

        if (!formData.courseId) {
            return toast.error("Please select a course");
        }

        try {
            setUploading(true);
            const payload = new FormData();

            // Compare and append only changed fields
            if (formData.subjectName !== originalData.subjectName) {
                payload.append("subjectName", formData.subjectName);
            }

            if (formData.courseId !== originalData.courseId) {
                payload.append("courseId", formData.courseId);
            }

            if (formData.semester !== originalData.semester) {
                payload.append("semester", formData.semester);
            }

            if (formData.status !== originalData.status) {
                payload.append("status", formData.status);
            }

            if (formData.logo && formData.logo.startsWith("data:image")) {
                const blob = await fetch(formData.logo).then(r => r.blob());
                payload.append("logo", blob);
            }

            if ([...payload.entries()].length === 0) {
                toast.info("No changes made.");
                return;
            }

            const res = await ApiServices.UpdateSubject(id, payload);
            if (res.data.success) {
                toast.success("Subject updated successfully!");
                setTimeout(() => navigate("/admin/subject"), 1500);
            } else {
                toast.error(res.data.message || "Update failed");
            }
        } catch (err) {
            toast.error("Error updating subject");
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <BeatLoader color="#7c3aed" size={15} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-violet-600 py-4 px-6">
                    <h2 className="text-xl font-bold text-white">Update Subject</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Subject Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject Name *
                        </label>
                        <input
                            type="text"
                            name="subjectName"
                            value={formData.subjectName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            placeholder="Enter subject name"
                        />
                    </div>

                    {/* Course Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Course *
                        </label>
                        <select
                            name="courseId"
                            value={formData.courseId}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        >
                            <option value="">Select a course</option>
                            {courses.length > 0 ? (
                                courses.map(course => (
                                    <option key={course._id} value={course._id}>
                                        {course.courseName}
                                    </option>
                                ))
                            ) : (
                                <option disabled>No courses available</option>
                            )}
                        </select>
                    </div>

                    {/* Semester Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Semester
                        </label>
                        <select
                            name="semester"
                            value={formData.semester}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        >
                            <option value="">Select semester</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                <option key={sem} value={sem}>Semester {sem}</option>
                            ))}
                        </select>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject Logo
                        </label>
                        <div className="flex flex-col items-center">
                            <div
                                className="relative w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 cursor-pointer overflow-hidden group"
                                onClick={() => fileInputRef.current.click()}
                            >
                                {formData.logo ? (
                                    <img
                                        src={formData.logo}
                                        alt="Subject logo"
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
                                <BeatLoader color="#ffffff" size={8} className="mr-2" />
                                Updating...
                            </>
                        ) : "Update Subject"}
                    </button>
                </form>
            </div>
        </div>
    );
}
