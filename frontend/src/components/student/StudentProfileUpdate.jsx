import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiServices from "../../ApiServices";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function StudentProfileUpdate() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        contact: "",
        address: "",
        semester: "",
        universityRollNo: "",
        courseId: "",
        profileImage: ""
    });
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const studentRes = await ApiServices.GetStudentById(id);
                const studentData = studentRes.data.data;

                const coursesRes = await ApiServices.GetAllCourses({});
                setCourses(coursesRes.data.data || []);

                setFormData({
                    name: studentData.name || "",
                    contact: studentData.contact || "",
                    address: studentData.address || "",
                    semester: studentData.semester || "",
                    universityRollNo: studentData.universityRollNo || "",
                    courseId: studentData.courseId?._id || studentData.courseId || "",
                    profileImage: studentData.profileImage || ""
                });

                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load student data");
                setIsLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({ ...prev, profileImage: event.target.result }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("name", formData.name);
            formDataToSend.append("contact", formData.contact);
            formDataToSend.append("address", formData.address);
            formDataToSend.append("semester", formData.semester);
            formDataToSend.append("universityRollNo", formData.universityRollNo);
            formDataToSend.append("courseId", formData.courseId);

            if (formData.profileImage.startsWith("data:image")) {
                const res = await fetch(formData.profileImage);
                const blob = await res.blob();
                formDataToSend.append("profileImage", blob, "profile.jpg");
            }

            const res = await ApiServices.UpdateStudent(id, formDataToSend);

            toast.success("Profile updated successfully!", {
                position: "top-right",
                autoClose: 2000,
                pauseOnHover: false,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "colored"
            });

            setTimeout(() => navigate("/student/profile"), 2200);

        } catch (err) {
            console.error("Update failed:", err);
            toast.error(err.response?.data?.message || "Update failed", {
                theme: "colored"
            });
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl font-semibold text-rose-600">Loading student data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl font-semibold text-rose-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-rose-100 py-8 px-4">
            <ToastContainer />
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Update Student Profile</h1>
                    <p className="text-gray-500 text-sm">Update your information below</p>
                </div>

                <form onSubmit={submitHandler}>
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative">
                            {formData.profileImage ? (
                                <img
                                    src={formData.profileImage}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-gray-300"
                                />
                            ) : (
                                <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-gray-600">No Image</span>
                                </div>
                            )}
                            <label
                                htmlFor="profile-upload"
                                className="absolute bottom-0 right-0 bg-white p-2 rounded-full cursor-pointer shadow-md"
                                title="Change photo"
                            >
                                <svg className="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793z" />
                                    <path d="M11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </label>
                            <input
                                type="file"
                                id="profile-upload"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Click on icon to change profile photo</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                        <FormField label="Contact" name="contact" value={formData.contact} onChange={handleChange} />
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 text-gray-700">Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="2"
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            />
                        </div>
                        <DropdownField
                            label="Semester"
                            name="semester"
                            value={formData.semester}
                            onChange={handleChange}
                            options={['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']}
                        />
                        <FormField label="University Roll No" name="universityRollNo" value={formData.universityRollNo} onChange={handleChange} />
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 text-gray-700">Course</label>
                            <select
                                name="courseId"
                                value={formData.courseId}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            >
                                <option value="">Select Course</option>
                                {courses.map((course) => (
                                    <option key={course._id} value={course._id}>
                                        {course.courseName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-2 text-white rounded-lg bg-gradient-to-r from-gray-700 to-rose-700 shadow-md ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:from-gray-800 hover:to-rose-800"
                                }`}
                        >
                            {isSubmitting ? "Updating..." : "Update Profile"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Reusable input field
function FormField({ label, name, value, onChange }) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
        </div>
    );
}

// Reusable dropdown field
function DropdownField({ label, name, value, onChange, options }) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
                <option value="">Select {label}</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt} Semester
                    </option>
                ))}
            </select>
        </div>
    );
}
