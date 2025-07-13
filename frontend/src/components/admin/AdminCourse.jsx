import { useEffect, useState, useCallback, useMemo } from "react";
import ApiServices from "../../ApiServices";
import { Link } from "react-router-dom";
console
// Debounce hook
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};

export default function AdminCourse() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCourse, setNewCourse] = useState({ courseName: "", logo: "" });

    const [pagination, setPagination] = useState({
        pageNo: 1,
        limit: 12,
        totalPages: 1,
        totalCourses: 0,
    });

    const [filters, setFilters] = useState({
        courseName: "",
        status: "",
    });

    const debouncedCourseName = useDebounce(filters.courseName, 500);
    const debouncedStatus = useDebounce(filters.status, 500);

    // Fetch courses with filters
    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const filterParams = {
                pageno: pagination.pageNo,
                limit: pagination.limit,
            };

            if (debouncedCourseName.trim()) filterParams.courseName = debouncedCourseName.trim();
            if (debouncedStatus !== "") filterParams.status = debouncedStatus === "true";

            const response = await ApiServices.GetAllCourses(filterParams);
            setCourses(response.data.data || []);
            setPagination(prev => ({
                ...prev,
                totalPages: response.data.totalPages || 1,
                totalCourses: response.data.totalCourses || 0,
            }));
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }, [
        pagination.pageNo,
        pagination.limit,
        debouncedCourseName,
        debouncedStatus,
    ]);

    // Change course status
    const changeCourseStatus = useCallback(async (courseId, currentStatus) => {
        try {
            await ApiServices.ChangeCourseStatus({
                id: courseId,
                status: !currentStatus,
            });
            fetchCourses();
        } catch (error) {
            console.error("Error changing status:", error.response?.data || error.message);
        }
    }, [fetchCourses]);

    // Add new course
    const addNewCourse = useCallback(async () => {
        try {
            if (!newCourse.courseName.trim()) {
                alert("Course name is required");
                return;
            }

            await ApiServices.AddCourse({
                courseName: newCourse.courseName,
                logo: newCourse.logo || "https://via.placeholder.com/150",
            });

            setShowAddModal(false);
            setNewCourse({ courseName: "", logo: "" });
            fetchCourses();
        } catch (error) {
            console.error("Error adding course:", error.response?.data || error.message);
        }
    }, [newCourse, fetchCourses]);

    // Filter handlers
    const handleFilterChange = useCallback((field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPagination(prev => ({ ...prev, pageNo: 1 }));
    }, []);

    const handlePageChange = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, pageNo: newPage }));
        }
    }, [pagination.totalPages]);

    // Initialize data
    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    // Pagination controls
    const paginationControls = useMemo(() => {
        const pages = [];
        const totalPages = pagination.totalPages;
        const currentPage = pagination.pageNo;

        // Smart pagination rendering
        if (totalPages <= 6) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            if (currentPage > 3) pages.push('...');

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) pages.push('...');

            pages.push(totalPages);
        }

        return pages;
    }, [pagination.pageNo, pagination.totalPages]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header with Add Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Course Management</h1>
                        <p className="text-gray-600 mt-2">Manage courses and their status</p>
                    </div>
                    <Link
                        to="/admin/course/add" // <-- change path as needed
                        className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md flex items-center gap-2"
                    >
                        <span>+</span> Add New Course
                    </Link>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                            <input
                                type="text"
                                placeholder="Search courses"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                value={filters.courseName}
                                onChange={(e) => handleFilterChange("courseName", e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all bg-white"
                                value={filters.status}
                                onChange={(e) => handleFilterChange("status", e.target.value)}
                            >
                                <option value="">All Courses</option>
                                <option value="true">Active Only</option>
                                <option value="false">Blocked Only</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                        <div className="text-sm text-gray-600 font-medium">
                            Showing {courses.length} of {pagination.totalCourses} courses
                        </div>
                        <button
                            onClick={() => {
                                setFilters({
                                    courseName: "",
                                    status: "",
                                });
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg font-medium hover:from-violet-600 hover:to-violet-700 transition-all shadow-md hover:shadow-lg"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Courses List */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(pagination.limit)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                                <div className="p-5 animate-pulse">
                                    <div className="flex justify-center mb-4">
                                        <div className="bg-gray-200 rounded-xl w-24 h-24" />
                                    </div>
                                    <div className="space-y-3 mb-4">
                                        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
                                    </div>
                                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : courses.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {courses.map((course) => (
                                <div
                                    key={course._id}
                                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-violet-100"
                                >
                                    <div className="p-5 flex flex-col h-full">
                                        <div className="flex justify-center mb-4">
                                            <div className="bg-gray-100 rounded-xl w-24 h-24 flex items-center justify-center overflow-hidden">
                                                {course.logo ? (
                                                    <img
                                                        src={course.logo}
                                                        alt={course.courseName}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.parentNode.innerHTML = '<div class="text-3xl text-gray-400">📚</div>';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="text-3xl text-gray-400">📚</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-center mb-4 flex-grow">
                                            <h3 className="text-lg font-bold text-gray-800 mb-2">{course.courseName}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${course.status
                                                ? "bg-green-100 text-green-800"
                                                : "bg-rose-100 text-rose-800"
                                                }`}>
                                                {course.status ? "Active" : "Blocked"}
                                            </span>
                                        </div>

                                        <div className="flex space-x-2 w-full">
                                            <button
                                                onClick={() => changeCourseStatus(course._id, course.status)}
                                                className={`w-1/2 py-2.5 rounded-lg font-semibold transition-all duration-300 ${course.status
                                                    ? "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white"
                                                    : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                                    }`}
                                            >
                                                {course.status ? "Block" : "Unblock"}
                                            </button>

                                            <Link
                                                to={`/admin/course/update/${course._id}`}
                                                className="w-1/2 py-2.5 rounded-lg bg-violet-300 hover:bg-violet-400 text-white font-semibold text-center transition-all duration-300 flex items-center justify-center"
                                            >
                                                Update
                                            </Link>

                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-wrap justify-center items-center gap-2 mb-8">
                            <button
                                onClick={() => handlePageChange(pagination.pageNo - 1)}
                                disabled={pagination.pageNo === 1 || loading}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${pagination.pageNo === 1 || loading
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-violet-500 to-violet-600 text-white hover:from-violet-600 hover:to-violet-700"
                                    }`}
                            >
                                Previous
                            </button>

                            {paginationControls.map((page, index) => (
                                page === '...' ? (
                                    <span key={index} className="px-3 py-2 text-gray-500">...</span>
                                ) : (
                                    <button
                                        key={index}
                                        onClick={() => handlePageChange(page)}
                                        className={`w-10 h-10 rounded-lg font-medium transition-all ${page === pagination.pageNo
                                            ? "bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-md"
                                            : "bg-white text-gray-700 hover:bg-violet-50 border border-gray-200"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}

                            <button
                                onClick={() => handlePageChange(pagination.pageNo + 1)}
                                disabled={pagination.pageNo === pagination.totalPages || loading}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${pagination.pageNo === pagination.totalPages || loading
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-violet-500 to-violet-600 text-white hover:from-violet-600 hover:to-violet-700"
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center max-w-2xl mx-auto border border-gray-100">
                        <div className="text-6xl mb-5 text-rose-400">📭</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">No courses found</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Try adjusting your search filters or add a new course
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <button
                                onClick={() => {
                                    setFilters({
                                        courseName: "",
                                        status: "",
                                    });
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg font-medium hover:from-violet-600 hover:to-violet-700 transition-all shadow-md"
                            >
                                Reset Filters
                            </button>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md"
                            >
                                Add New Course
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}