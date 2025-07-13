import { useEffect, useState, useCallback, useMemo } from "react";
import ApiServices from "../../ApiServices";
import MaterialCard from "./MaterialCard";
import { Link } from "react-router-dom";

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

export default function StudentMaterial() {
    const [materials, setMaterials] = useState([" "]);
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [materialTypes, setMaterialTypes] = useState([]);

    const [pagination, setPagination] = useState({
        pageno: 1,
        limit: 12,
        totalPages: 1,
        totalDocuments: 0,
    });

    const [filters, setFilters] = useState({
        title: "",
        subjectId: "",
        materialTypeId: "",
    });

    const debouncedTitle = useDebounce(filters.title, 500);
    const debouncedSubject = useDebounce(filters.subjectId, 300);
    const debouncedType = useDebounce(filters.materialTypeId, 300);

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        try {
            const filterParams = {
                pageno: pagination.pageno,
                limit: pagination.limit,
                status: true,
            };

            if (debouncedTitle.trim()) filterParams.title = debouncedTitle.trim();
            if (debouncedSubject) filterParams.subjectId = debouncedSubject;
            if (debouncedType) filterParams.materialTypeId = debouncedType;


            const response = await ApiServices.GetAllMaterial(filterParams);

            setMaterials(response.data.data);
            setPagination((prev) => ({
                ...prev,
                totalPages: response.data.totalPages || 1,
                totalDocuments: response.data.totalDocuments,
            }));
        } catch (error) {
            console.error("Error fetching materials:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    }, [
        pagination.pageno,
        pagination.limit,
        debouncedTitle,
        debouncedSubject,
        debouncedType,
    ]);

    const fetchInitialData = useCallback(async () => {
        try {
            const [subjectsRes, typesRes] = await Promise.all([
                ApiServices.GetAllSubject({ status: true }),
                ApiServices.GetAllMaterialType({ status: true }),
            ]);
            setSubjects(subjectsRes.data.data || []);
            setMaterialTypes(typesRes.data.data || []);
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    }, []);

    const handleFilterChange = useCallback((field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
        setPagination((prev) => ({ ...prev, pageno: 1 }));
    }, []);

    const handlePageChange = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination((prev) => ({ ...prev, pageno: newPage }));
            console.log(pagination)
        }
    }, [pagination.totalPages]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const paginationControls = useMemo(() => {
        const pages = [];
        const totalPages = pagination.totalPages;
        const currentPage = pagination.pageno;

        if (totalPages <= 6) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }

        return pages;
    }, [pagination.pageno, pagination.totalPages]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6"  style={{ marginTop: "5rem" }}>
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search by Title</label>
                            <input
                                type="text"
                                placeholder="Search materials..."
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                value={filters.title}
                                onChange={(e) => handleFilterChange("title", e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <select
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                value={filters.subjectId}
                                onChange={(e) => handleFilterChange("subjectId", e.target.value)}
                            >
                                <option value="">All Subjects</option>
                                {subjects.map((subject) => (
                                    <option key={subject._id} value={subject._id}>
                                        {subject.subjectName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Material Type</label>
                            <select
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                value={filters.materialTypeId}
                                onChange={(e) => handleFilterChange("materialTypeId", e.target.value)}
                            >
                                <option value="">All Types</option>
                                {materialTypes.map((type) => (
                                    <option key={type._id} value={type._id}>
                                        {type.typeName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                        <div className="text-sm text-gray-600 font-medium">
                            Showing {materials.length} of {pagination.totalDocuments} materials
                        </div>
                        <button
                            onClick={() => {
                                setFilters({ title: "", subjectId: "", materialTypeId: "" });
                                setPagination((prev) => ({ ...prev, pageno: 1 }));
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-indigo-700 shadow-md"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(pagination.limit)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="space-y-3 mb-4">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                                <div className="h-10 bg-gray-200 rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                ) : materials.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {materials.map((material) => (
                                <MaterialCard key={material._id} material={material} />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex flex-wrap justify-center items-center gap-2 mb-8">
                            <button
                                onClick={() => handlePageChange(pagination.pageno - 1)}
                                disabled={pagination.pageno === 1 || loading}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${pagination.pageno === 1 || loading
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700"
                                    }`}
                            >
                                Previous
                            </button>

                            {paginationControls.map((page, index) =>
                                page === "..." ? (
                                    <span key={index} className="px-3 py-2 text-gray-500">...</span>
                                ) : (
                                    <button
                                        key={index}
                                        onClick={() => handlePageChange(page)}
                                        className={`w-10 h-10 rounded-lg font-medium transition-all ${page === pagination.pageno
                                            ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md"
                                            : "bg-white text-gray-700 hover:bg-indigo-50 border border-gray-200"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                )
                            )}

                            <button
                                onClick={() => handlePageChange(pagination.pageno + 1)}
                                disabled={pagination.pageno === pagination.totalPages || loading}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${pagination.pageno === pagination.totalPages || loading
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700"
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center max-w-2xl mx-auto border border-gray-100">
                        <div className="text-6xl mb-5 text-indigo-400">📭</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">No materials found</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Try adjusting your search filters or check back later.
                        </p>
                        <button
                            onClick={() => {
                                setFilters({ title: "", subjectId: "", materialTypeId: "" });
                                setPagination((prev) => ({ ...prev, pageno: 1 }));
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-indigo-700 shadow-md"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
