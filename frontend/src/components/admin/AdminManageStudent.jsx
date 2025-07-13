import { useEffect, useState, useCallback, useMemo } from "react";
import ApiServices from "../../ApiServices";

// Optimized debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export default function AdminManageStudent() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    pageNo: 1,
    limit: 12,
    totalPages: 1,
    totalStudents: 0,
  });

  const [filters, setFilters] = useState({
    name: "",
    semester: "",
    address: "",
    universityRollNo: "",
    status: "",
  });

  // Memoized debounced values
  const debouncedName = useDebounce(filters.name, 500);
  const debouncedSemester = useDebounce(filters.semester, 500);
  const debouncedAddress = useDebounce(filters.address, 500);
  const debouncedRollNo = useDebounce(filters.universityRollNo, 500);
  const debouncedStatus = useDebounce(filters.status, 500);

  // Optimized fetch with useCallback
  const fetchStudents = useCallback(async () => {
    if (!loading) setLoading(true);

    try {
      const filterParams = {
        pageno: pagination.pageNo,
        limit: pagination.limit,
      };

      if (debouncedName.trim()) filterParams.name = debouncedName.trim();
      if (debouncedSemester.trim()) filterParams.semester = debouncedSemester.trim();
      if (debouncedAddress.trim()) filterParams.address = debouncedAddress.trim();
      if (debouncedRollNo.trim()) filterParams.universityRollNo = debouncedRollNo.trim();
      if (debouncedStatus !== "") filterParams.status = debouncedStatus === "true";

      const response = await ApiServices.GetAllStudents(filterParams);
      setStudents(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages || 1,
        totalStudents: response.data.totalStudents || 0,
      }));
    } catch (error) {
      console.error("Error fetching students:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.pageNo,
    pagination.limit,
    debouncedName,
    debouncedSemester,
    debouncedAddress,
    debouncedRollNo,
    debouncedStatus,
  ]);

  // Memoized student status change handler
  const changeStudentStatus = useCallback(async (studentId, currentStatus) => {
    try {
      await ApiServices.ChangeStudentStatus({
        id: studentId,
        status: !currentStatus,
      });
      fetchStudents();
    } catch (error) {
      console.error("Error changing status:", error.response?.data || error.message);
    }
  }, [fetchStudents]);

  // Optimized filter handler
  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, pageNo: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, pageNo: newPage }));
    }
  }, [pagination.totalPages]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Memoized pagination controls
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
        {/* Header */}

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                placeholder="Search by name"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                value={filters.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <input
                type="text"
                placeholder="Semester"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                value={filters.semester}
                onChange={(e) => handleFilterChange("semester", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                placeholder="Address"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                value={filters.address}
                onChange={(e) => handleFilterChange("address", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Roll No</label>
              <input
                type="text"
                placeholder="University Roll No"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                value={filters.universityRollNo}
                onChange={(e) => handleFilterChange("universityRollNo", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all bg-white"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Students</option>
                <option value="true">Active Only</option>
                <option value="false">Blocked Only</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
            <div className="text-sm text-gray-600 font-medium">
              Showing {students.length} of {pagination.totalStudents} students
            </div>
            <button
              onClick={() => {
                setFilters({
                  name: "",
                  semester: "",
                  address: "",
                  universityRollNo: "",
                  status: "",
                });
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg font-medium hover:from-violet-600 hover:to-violet-700 transition-all shadow-md hover:shadow-lg"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(pagination.limit)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="p-5 animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="bg-gray-200 rounded-full w-14 h-14" />
                    <div className="ml-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : students.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {students.map((student) => (
                <div
                  key={student._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-violet-100"
                >
                  <div className="p-5">
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-br from-violet-100 to-violet-200 rounded-full w-14 h-14 flex items-center justify-center text-violet-800 font-bold text-lg overflow-hidden">
                        <img
                          src={`${student.profileImage}`}
                          alt=""
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-bold text-gray-800 truncate max-w-[140px]">{student.name}</h3>
                        <p className="text-gray-600 text-sm">Roll No: {student.universityRollNo}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-5">
                      <div className="flex items-center">
                        <span className="text-gray-700 font-medium w-20">Semester:</span>
                        <span className="font-semibold">{student.semester}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-700 font-medium w-20">Address:</span>
                        <span className="flex-1 text-gray-800 line-clamp-2">{student.address}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-700 font-medium w-20">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${student.status
                            ? "bg-green-100 text-green-800"
                            : "bg-rose-100 text-rose-800"
                          }`}>
                          {student.status ? "Active" : "Blocked"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => changeStudentStatus(student._id, student.status)}
                      className={`w-full py-2.5 rounded-lg font-semibold transition-all duration-300 ${student.status
                          ? "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white"
                          : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                        }`}
                    >
                      {student.status ? "Block Student" : "Unblock Student"}
                    </button>
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
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No students found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Try adjusting your search filters or reset to default settings
            </p>
            <button
              onClick={() => {
                setFilters({
                  name: "",
                  semester: "",
                  address: "",
                  universityRollNo: "",
                  status: "",
                });
              }}
              className="px-6 py-3 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg font-medium hover:from-violet-600 hover:to-violet-700 transition-all shadow-md"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}