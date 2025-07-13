// AdminMaterialType.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import ApiServices from "../../ApiServices";
import { toast } from "react-toastify";
import { BeatLoader } from "react-spinners";

// Custom debounce hook
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

export default function AdminMaterialType() {
    const [materialTypes, setMaterialTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const [newMaterialType, setNewMaterialType] = useState({ typeName: "", status: true });
    const [currentMaterialType, setCurrentMaterialType] = useState(null);

    const [filters, setFilters] = useState({ typeName: "", status: "" });
    const debouncedTypeName = useDebounce(filters.typeName, 500);
    const debouncedStatus = useDebounce(filters.status, 500);

    const [pagination, setPagination] = useState({
        pageNo: 1,
        limit: 10,
        totalPages: 1,
        totalItems: 0
    });

    // Fetch material types with filters
    const fetchMaterialTypes = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                pageno: pagination.pageNo,
                limit: pagination.limit
            };

            if (debouncedTypeName.trim()) params.typeName = debouncedTypeName.trim();
            if (debouncedStatus !== "") params.status = debouncedStatus === "true";

            const response = await ApiServices.GetAllMaterialType(params);
            const { data, totalPages, totalDocuments, message } = response.data;

            setMaterialTypes(data || []);
            setPagination(prev => ({
                ...prev,
                totalPages: totalPages || 1,
                totalItems: totalDocuments || 0
            }));

            if (message) toast.success(message);
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to fetch material types";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [pagination.pageNo, pagination.limit, debouncedTypeName, debouncedStatus]);

    const changeMaterialTypeStatus = useCallback(async (id, status) => {
        try {
            const response = await ApiServices.ChangeMaterialTypeStatus({ id, status: !status });
            toast.success(response.data.message || "Status updated successfully");
            fetchMaterialTypes();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    }, [fetchMaterialTypes]);

    const addMaterialType = useCallback(async () => {
        if (!newMaterialType.typeName.trim()) {
            toast.error("Type name is required");
            return;
        }

        try {
            const response = await ApiServices.AddMaterialType(newMaterialType);
            toast.success(response.data.message || "Material type added successfully");
            setNewMaterialType({ typeName: "", status: true });
            setShowAddModal(false);
            fetchMaterialTypes();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add material type");
        }
    }, [newMaterialType, fetchMaterialTypes]);

    const updateMaterialType = useCallback(async () => {
        if (!currentMaterialType?.typeName?.trim()) {
            toast.error("Type name is required");
            return;
        }

        try {
            const response = await ApiServices.UpdateMaterialType(currentMaterialType._id, {
                typeName: currentMaterialType.typeName,
                status: currentMaterialType.status
            });

            toast.success(response.data.message || "Material type updated successfully");
            setShowUpdateModal(false);
            fetchMaterialTypes();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update material type");
        }
    }, [currentMaterialType, fetchMaterialTypes]);

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
        fetchMaterialTypes();
    }, [fetchMaterialTypes]);

    const paginationControls = useMemo(() => {
        const pages = [];
        const { pageNo, totalPages } = pagination;

        if (totalPages <= 6) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (pageNo > 3) pages.push("...");
            const start = Math.max(2, pageNo - 1);
            const end = Math.min(totalPages - 1, pageNo + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (pageNo < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }

        return pages;
    }, [pagination]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 to-rose-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header with Add Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-violet-900">Material Types</h1>
                        <p className="text-violet-700 mt-2">Manage all material types in the system</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-violet-600 to-rose-600 text-white rounded-lg font-medium hover:from-violet-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add New Type
                    </button>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-violet-100">
                    <h2 className="text-lg font-semibold text-violet-800 mb-3">Filter Options</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-violet-700 mb-1">Type Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by type name"
                                    className="w-full px-4 py-2 pl-10 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-violet-50"
                                    value={filters.typeName}
                                    onChange={(e) => handleFilterChange("typeName", e.target.value)}
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-400 absolute left-3 top-2.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-violet-700 mb-1">Status</label>
                            <select
                                className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-violet-50"
                                value={filters.status}
                                onChange={(e) => handleFilterChange("status", e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Material Types Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-violet-100">
                    {loading ? (
                        <div className="p-8 flex justify-center">
                            <BeatLoader color="#7e22ce" size={12} />
                        </div>
                    ) : materialTypes.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-violet-100">
                                    <thead className="bg-violet-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-violet-800 uppercase tracking-wider">Type Name</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-violet-800 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-violet-800 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-violet-100">
                                        {materialTypes.map((type) => (
                                            <tr key={type._id} className="hover:bg-violet-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{type.typeName}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${type.status
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-rose-100 text-rose-800"
                                                        }`}>
                                                        {type.status ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => {
                                                            setCurrentMaterialType(type);
                                                            setShowUpdateModal(true);
                                                        }}
                                                        className="text-violet-700 hover:text-violet-900 mr-4 flex items-center gap-1"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => changeMaterialTypeStatus(type._id, type.status)}
                                                        className={`flex items-center gap-1 ${type.status
                                                            ? "text-rose-600 hover:text-rose-800"
                                                            : "text-emerald-600 hover:text-emerald-800"
                                                            }`}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            {type.status ? (
                                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            ) : (
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                                            )}
                                                        </svg>
                                                        {type.status ? "Deactivate" : "Activate"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="bg-violet-50 px-4 py-3 flex items-center justify-between border-t border-violet-100 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => handlePageChange(pagination.pageNo - 1)}
                                        disabled={pagination.pageNo === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-violet-300 text-sm font-medium rounded-md text-violet-700 bg-white hover:bg-violet-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.pageNo + 1)}
                                        disabled={pagination.pageNo === pagination.totalPages}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-violet-300 text-sm font-medium rounded-md text-violet-700 bg-white hover:bg-violet-50"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-violet-700">
                                            Showing <span className="font-medium">{materialTypes.length}</span> of{' '}
                                            <span className="font-medium">{pagination.totalItems}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            <button
                                                onClick={() => handlePageChange(pagination.pageNo - 1)}
                                                disabled={pagination.pageNo === 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-violet-300 bg-white text-sm font-medium text-violet-500 hover:bg-violet-50"
                                            >
                                                <span className="sr-only">Previous</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            {paginationControls.map((page, index) => (
                                                page === '...' ? (
                                                    <span key={index} className="relative inline-flex items-center px-4 py-2 border border-violet-300 bg-white text-sm font-medium text-violet-700">
                                                        ...
                                                    </span>
                                                ) : (
                                                    <button
                                                        key={index}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pagination.pageNo
                                                            ? "z-10 bg-violet-100 border-violet-500 text-violet-700"
                                                            : "bg-white border-violet-300 text-violet-500 hover:bg-violet-50"
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            ))}
                                            <button
                                                onClick={() => handlePageChange(pagination.pageNo + 1)}
                                                disabled={pagination.pageNo === pagination.totalPages}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-violet-300 bg-white text-sm font-medium text-violet-500 hover:bg-violet-50"
                                            >
                                                <span className="sr-only">Next</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="text-violet-400 mb-4">
                                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-violet-900">No material types found</h3>
                            <p className="mt-1 text-sm text-violet-700">Try adjusting your search filters</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => {
                                        setFilters({ typeName: "", status: "" });
                                        setPagination(prev => ({ ...prev, pageNo: 1 }));
                                    }}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Material Type Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border-2 border-violet-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-violet-900">Add New Material Type</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-violet-400 hover:text-violet-600 transition-colors"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-violet-700 mb-2">Type Name *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-violet-50"
                                    value={newMaterialType.typeName}
                                    onChange={(e) => setNewMaterialType({ ...newMaterialType, typeName: e.target.value })}
                                    placeholder="Enter type name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-violet-700 mb-2">Status</label>
                                <div className="flex space-x-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio h-4 w-4 text-violet-600"
                                            checked={newMaterialType.status}
                                            onChange={() => setNewMaterialType({ ...newMaterialType, status: true })}
                                        />
                                        <span className="ml-2 text-violet-700">Active</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio h-4 w-4 text-rose-600"
                                            checked={!newMaterialType.status}
                                            onChange={() => setNewMaterialType({ ...newMaterialType, status: false })}
                                        />
                                        <span className="ml-2 text-violet-700">Inactive</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="px-5 py-2.5 border border-violet-300 rounded-lg shadow-sm text-sm font-medium text-violet-700 bg-white hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={addMaterialType}
                                className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                            >
                                Add Material Type
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Material Type Modal */}
            {showUpdateModal && currentMaterialType && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border-2 border-violet-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-violet-900">Update Material Type</h3>
                            <button
                                onClick={() => setShowUpdateModal(false)}
                                className="text-violet-400 hover:text-violet-600 transition-colors"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-violet-700 mb-2">Type Name *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-violet-50"
                                    value={currentMaterialType.typeName}
                                    onChange={(e) => setCurrentMaterialType({ ...currentMaterialType, typeName: e.target.value })}
                                    placeholder="Enter type name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-violet-700 mb-2">Status</label>
                                <div className="flex space-x-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio h-4 w-4 text-violet-600"
                                            checked={currentMaterialType.status}
                                            onChange={() => setCurrentMaterialType({ ...currentMaterialType, status: true })}
                                        />
                                        <span className="ml-2 text-violet-700">Active</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio h-4 w-4 text-rose-600"
                                            checked={!currentMaterialType.status}
                                            onChange={() => setCurrentMaterialType({ ...currentMaterialType, status: false })}
                                        />
                                        <span className="ml-2 text-violet-700">Inactive</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowUpdateModal(false)}
                                className="px-5 py-2.5 border border-violet-300 rounded-lg shadow-sm text-sm font-medium text-violet-700 bg-white hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={updateMaterialType}
                                className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                            >
                                Update Material Type
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}