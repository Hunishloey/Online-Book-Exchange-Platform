import { useState, useEffect } from "react";
import ApiServices from "../../ApiServices";
import { format } from 'date-fns';
import { Link } from "react-router-dom";

export default function StudentProfile() {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const studentId = userData?.studentId?._id || userData?.studentId;

    const [studentData, setStudentData] = useState(null);
    const [courseName, setCourseName] = useState("Loading...");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await ApiServices.GetStudentById(studentId);
                const student = res.data.data;
                setStudentData(student);

                if (student.courseId) {
                    const courseRes = await ApiServices.GetCourseById(student.courseId._id);
                    setCourseName(courseRes.data.data.courseName);
                } else {
                    setCourseName("No Course Assigned");
                }
            } catch (err) {
                console.error("Error loading student profile:", err);
                setCourseName("Unknown Course");
            } finally {
                setLoading(false);
            }
        };

        if (studentId) {
            fetchStudent();
        }
    }, [studentId]);

    if (loading || !studentData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl font-semibold text-gray-600">Loading student profile...</div>
            </div>
        );
    }

    const createdAt = format(new Date(studentData.createdAt), 'MMMM dd, yyyy h:mm a');
    const updatedAt = format(new Date(studentData.updatedAt), 'MMMM dd, yyyy h:mm a');

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-violet-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Profile Header */}
                    <div className="relative bg-gradient-to-r from-violet-600 to-rose-600 h-48">
                        <div className="absolute -bottom-14 left-8">
                            <div className="relative">
                                <img
                                    src={studentData.profileImage}
                                    alt={studentData.name}
                                    className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover"
                                />
                                <span className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white ${studentData.status ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 px-6 pb-6">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">{studentData.name}</h1>
                                <div className="flex items-center mt-1">
                                    <span className="text-violet-600 font-medium">University Roll No: </span>
                                    <span className="ml-2 text-gray-700">{studentData.universityRollNo}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                                <Link
                                    to={`/student/profile/update/${studentData._id}`}
                                    className="bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 text-white px-5 py-2 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5 shadow-md"
                                >
                                    Update Profile
                                </Link>
                                <Link
                                    to={`/student/profile/update/password`}
                                    className="bg-white border border-violet-600 text-violet-600 hover:bg-violet-50 px-5 py-2 rounded-lg font-medium transition-all duration-300 shadow-md"
                                >
                                    Change Password
                                </Link>
                            </div>
                        </div>

                        {/* Profile Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <DetailCard title="Personal Information">
                                <DetailItem label="Contact" value={studentData.contact} />
                                <DetailItem label="Address" value={studentData.address} />
                                <DetailItem label="Status" value={studentData.status ? "Active" : "Inactive"} />
                            </DetailCard>

                            <DetailCard title="Academic Information">
                                <DetailItem label="Semester" value={studentData.semester} />
                                <DetailItem label="Course" value={courseName} />
                            </DetailCard>

                            <DetailCard title="Account Information">
                                <DetailItem label="Email" value={userData.email} />
                                <DetailItem label="Created At" value={createdAt} />
                                <DetailItem label="Last Updated" value={updatedAt} />
                            </DetailCard>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Reusable detail card component
const DetailCard = ({ title, children }) => (
    <div className="bg-rose-50 rounded-xl border border-rose-200 p-5 hover:shadow-md transition-shadow">
        <h2 className="text-lg font-semibold text-violet-700 mb-3 pb-2 border-b border-violet-100">{title}</h2>
        <div className="space-y-3">{children}</div>
    </div>
);

// Reusable detail item component
const DetailItem = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-start">
        <span className="text-sm font-medium text-gray-600 min-w-[120px]">{label}:</span>
        <span className="text-gray-800 font-medium mt-0.5 sm:mt-0 break-all">{value}</span>
    </div>
);
