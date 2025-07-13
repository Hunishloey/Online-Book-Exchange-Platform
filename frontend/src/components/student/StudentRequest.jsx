import React, { useState, useEffect } from "react";
import ApiServices from "../../ApiServices";
import toast, { Toaster } from "react-hot-toast";
import { FaPlus, FaSearch, FaSync, FaTrash, FaCheck, FaTimes } from "react-icons/fa";

export default function StudentRequest() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [requirementInput, setRequirementInput] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    // Theme colors
    const themeColors = {
        primary: "bg-indigo-600 hover:bg-indigo-700",
        secondary: "bg-violet-600 hover:bg-violet-700",
        success: "bg-green-500",
        warning: "bg-yellow-500",
        danger: "bg-rose-500",
        card: "bg-white",
        header: "bg-gradient-to-r from-indigo-50 to-violet-50",
        border: "border-gray-200"
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = () => {
        setLoading(true);
        ApiServices.GetAllRequest({})
            .then((res) => {
                setRequests(res.data.data || []);
                toast.success("Requests loaded successfully");
            })
            .catch((err) => {
                console.error("Error fetching requests:", err);
                toast.error("Failed to load requests");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleAddRequest = async () => {
        if (!requirementInput.trim()) {
            toast.error("Requirement cannot be empty");
            return;
        }

        setIsAdding(true);
        try {
            const response = await ApiServices.AddRequest({
                requirement: requirementInput
            });
            
            if (response.data.success) {
                toast.success("Request added successfully");
                setRequirementInput("");
                fetchRequests();
            } else {
                throw new Error("Failed to add request");
            }
        } catch (error) {
            console.error("Error adding request:", error);
            toast.error("Failed to add request");
        } finally {
            setIsAdding(false);
        }
    };


    const filteredRequests = requests.filter(request => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (request.requirement?.toLowerCase().includes(searchLower)) ||
            (request.addedById?.name?.toLowerCase().includes(searchLower)) ||
            (request.status?.toLowerCase().includes(searchLower))
        );
    });


    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Toaster position="top-right" />
            
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Request Management</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Submit and manage your requests for new content or features
                </p>
            </div>
            
            {/* Add Request Form */}
            <div className={`${themeColors.card} rounded-xl shadow-md ${themeColors.border} border p-6 mb-8`}>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FaPlus className="mr-2 text-indigo-600" />
                    Add New Request
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Requirement <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="What would you like to request?"
                            className={`w-full px-4 py-3 rounded-lg border ${themeColors.border} focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                            value={requirementInput}
                            onChange={(e) => setRequirementInput(e.target.value)}
                            disabled={isAdding}
                        />
                    </div>
                    
                    <div className="flex items-end">
                        <button
                            onClick={handleAddRequest}
                            disabled={isAdding || !requirementInput.trim()}
                            className={`w-full flex items-center justify-center px-6 py-3 rounded-lg text-white font-medium transition-all shadow-md hover:shadow-lg
                                ${isAdding || !requirementInput.trim() 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : themeColors.primary}`}
                        >
                            {isAdding ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    Submit Request
                                    <FaPlus className="ml-2" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
                
                <p className="text-sm text-gray-500">
                    Your request will be reviewed by our team. Please be specific about what you need.
                </p>
            </div>
            
            {/* Search and Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="relative w-full md:w-1/3">
                    <input
                        type="text"
                        placeholder="Search requests..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={fetchRequests}
                        disabled={loading}
                        className={`flex items-center px-4 py-2.5 rounded-lg font-medium transition-all
                            ${loading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>
            
            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            )}
            
            {/* Empty State */}
            {!loading && filteredRequests.length === 0 && (
                <div className={`${themeColors.card} rounded-xl shadow-md ${themeColors.border} border p-12 text-center`}>
                    <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <FaSearch className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No requests found</h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm 
                            ? "No requests match your search. Try different keywords." 
                            : "Submit your first request using the form above."}
                    </p>
                </div>
            )}
            
            {/* Requests Grid */}
            {!loading && filteredRequests.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRequests.map((request) => (
                        <div 
                            key={request._id} 
                            className={`${themeColors.card} rounded-xl shadow-md ${themeColors.border} border overflow-hidden transition-transform duration-200 hover:shadow-lg hover:-translate-y-1`}
                        >
                            <div className="p-6">
                            
                                
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    {request.requirement}
                                </h3>
                                
                                <div className="flex items-center mb-4">
                                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center mr-3">
                                        <span className="text-gray-600 font-bold">
                                            {request.addedById?.name?.charAt(0) || '?'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {request.addedById?.name || 'Unknown'}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between pt-4 border-t border-gray-100">
                                    <div className="text-sm text-gray-500">
                                        ID: {request.autoId}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {request.expiresIn ? "Expires in 24h" : "Active"}
                                    </div>
                                </div>
                            </div>
        
                        </div>
                    ))}
                </div>
            )}
            
            {/* Pagination/Info */}
            {!loading && filteredRequests.length > 0 && (
                <div className="mt-8 flex flex-col sm:flex-row justify-between items-center">
                    <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                        Showing <span className="font-medium">{filteredRequests.length}</span> of{' '}
                        <span className="font-medium">{requests.length}</span> requests
                    </div>
                    <div className="flex space-x-2">
                        <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
                            Previous
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}