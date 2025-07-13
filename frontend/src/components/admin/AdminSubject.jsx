import { useEffect, useState, useCallback, useMemo } from "react";
import ApiServices from "../../ApiServices";
import { Link } from "react-router-dom";

// Debounce hook
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

export default function AdminSubject() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [pagination, setPagination] = useState({
        pageNo: 1,
        limit: 12,
        totalPages: 1,
        totalSubjects: 0,
    });

    const [filters, setFilters] = useState({
        subjectName: "",
        semester: "",
        status: "",
        courseId: "",
    });

    const debouncedSubjectName = useDebounce(filters.subjectName, 500);
    const debouncedCourseId = useDebounce(filters.courseId, 500);
    const debouncedSemester = useDebounce(filters.semester, 500);
    const debouncedStatus = useDebounce(filters.status, 500);

    // Fetch subjects with filters
    const fetchSubjects = useCallback(async () => {
        setLoading(true);
        try {
            const filterParams = {
                pageno: pagination.pageNo,
                limit: pagination.limit,
            };

            if (debouncedSubjectName.trim()) filterParams.subjectName = debouncedSubjectName.trim();
            if (debouncedCourseId) filterParams.courseId = debouncedCourseId;
            if (debouncedSemester) filterParams.semester = debouncedSemester;
            if (debouncedStatus !== "") filterParams.status = debouncedStatus === "true";

            const response = await ApiServices.GetAllSubject(filterParams);
            setSubjects(response.data.data || []);
            setPagination(prev => ({
                ...prev,
                totalPages: response.data.totalPages || 1,
                totalSubjects: response.data.totalSubjects || 0,
            }));
        } catch (error) {
            console.error("Error fetching subjects:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    }, [
        pagination.pageNo,
        pagination.limit,
        debouncedSubjectName,
        debouncedCourseId,
        debouncedSemester,
        debouncedStatus,
    ]);

    // Change subject status
    const changeSubjectStatus = useCallback(async (subjectId, currentStatus) => {
        try {
            await ApiServices.ChangeSubjectStatus({
                id: subjectId,
                status: !currentStatus,
            });
            fetchSubjects();
        } catch (error) {
            console.error("Error changing status:", error.response?.data || error.message);
        }
    }, [fetchSubjects]);

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
        fetchSubjects();
    }, [fetchSubjects]);

    // Pagination controls
    const paginationControls = useMemo(() => {
        const pages = [];
        const totalPages = pagination.totalPages;
        const currentPage = pagination.pageNo;

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

    const courseOptions = useMemo(() => {
        const courses = new Map();
        subjects.forEach(subject => {
            if (subject.courseId) {
                courses.set(subject.courseId._id, subject.courseId.courseName);
            }
        });
        return Array.from(courses.entries());
    }, [subjects]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header with Add Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Subject Management</h1>
                        <p className="text-gray-600 mt-2">Manage subjects under courses</p>
                    </div>
                    <Link
                        to="/admin/subject/add"
                        className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md flex items-center gap-2"
                    >
                        <span>+</span> Add New Subject
                    </Link>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                            <input
                                type="text"
                                placeholder="Search subjects"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={filters.subjectName}
                                onChange={(e) => handleFilterChange("subjectName", e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                            <select
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                value={filters.courseId || ""}
                                onChange={(e) => handleFilterChange("courseId", e.target.value)}
                            >
                                <option value="">All Courses</option>
                                {courseOptions.map(([id, name]) => (
                                    <option key={id} value={id}>{name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                            <select
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                value={filters.semester}
                                onChange={(e) => handleFilterChange("semester", e.target.value)}
                            >
                                <option value="">All Semesters</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                    <option key={sem} value={sem}>Semester {sem}</option>
                                ))}
                            </select>
                        </div>

                        {/* Added Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                value={filters.status || ""}
                                onChange={(e) => handleFilterChange("status", e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="true">Active</option>
                                <option value="false">Blocked</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                        <div className="text-sm text-gray-600 font-medium">
                            Showing {subjects.length} of {pagination.totalSubjects} subjects
                        </div>
                        <button
                            onClick={() => {
                                setFilters({
                                    subjectName: "",
                                    courseId: "",
                                    semester: "",
                                    status: "",
                                });
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Subjects List */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(pagination.limit)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                                <div className="p-5 animate-pulse">
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
                                        <div className="flex-1 space-y-3">
                                            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
                                        <div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : subjects.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {subjects.map((subject) => (
                                <div
                                    key={subject._id}
                                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-blue-100"
                                >
                                    <div className="p-5 flex flex-col h-full">
                                        <div className="flex gap-4 mb-4">
                                            {/* Logo on the left */}
                                            <div className="flex-shrink-0">
                                                <div className="bg-gray-100 rounded-xl w-20 h-20 flex items-center justify-center overflow-hidden">
                                                    {subject.logo ? (
                                                        <img
                                                            src={subject.logo}
                                                            alt={subject.subjectName}
                                                            className="w-full h-full object-cover"
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

                                            {/* Content on the right */}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">
                                                    {subject.subjectName}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    <span className="font-medium">Course:</span> {subject.courseId?.courseName || 'Not assigned'}
                                                </p>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    <span className="font-medium">Semester:</span> {subject.semester}
                                                </p>
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${subject.status
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-rose-100 text-rose-800"
                                                    }`}>
                                                    {subject.status ? "Active" : "Blocked"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex space-x-2 w-full mt-auto">
                                            <button
                                                onClick={() => changeSubjectStatus(subject._id, subject.status)}
                                                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 ${subject.status
                                                    ? "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white"
                                                    : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                                    }`}
                                            >
                                                {subject.status ? "Block" : "Unblock"}
                                            </button>

                                            <Link
                                                to={`/admin/subject/update/${subject._id}`}
                                                className="flex-1 py-2.5 rounded-lg bg-blue-300 hover:bg-blue-400 text-white font-semibold text-center transition-all duration-300 flex items-center justify-center"
                                            >
                                                Update
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination (unchanged) */}
                        <div className="flex flex-wrap justify-center items-center gap-2 mb-8">
                            {/* ... existing pagination code ... */}
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center max-w-2xl mx-auto border border-gray-100">
                        <div className="text-6xl mb-5 text-rose-400">📚</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">No subjects found</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Try adjusting your search filters or add a new subject
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <button
                                onClick={() => {
                                    setFilters({
                                        subjectName: "",
                                        courseId: "",
                                        semester: "",
                                        status: "",
                                    });
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
                            >
                                Reset Filters
                            </button>
                            <Link
                                to="/admin/subject/add"
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md text-center"
                            >
                                Add New Subject
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}