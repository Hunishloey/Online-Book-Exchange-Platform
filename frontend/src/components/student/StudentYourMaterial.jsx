import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiServices from "../../ApiServices";
import { FaEdit, FaTrash } from 'react-icons/fa';

export default function StudentYourMaterial() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userData = JSON.parse(sessionStorage.getItem("userData"));

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                setLoading(true);
                const res = await ApiServices.GetAllMaterial({ 
                    status: true, 
                    addedById: userData._id 
                });
                setMaterials(res.data.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load your materials. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchMaterials();
    }, [userData._id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-violet-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-600 mx-auto"></div>
                    <p className="mt-4 text-gray-700">Loading your materials...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-violet-50">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                    <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Materials</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (materials.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-violet-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                    <div className="bg-violet-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Materials Found</h2>
                    <p className="text-gray-600 mb-6">You haven't uploaded any study materials yet.</p>
                    <Link 
                        to="/student/material/add"
                        className="inline-block bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all shadow-md"
                    >
                        Upload Your First Material
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-violet-50 py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                        Your Study Materials
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Manage all the materials you've uploaded. You can edit or delete them at any time.
                    </p>
                    <div className="mt-4">
                        <Link 
                            to="/student/material/add"
                            className="inline-flex items-center bg-gradient-to-r from-rose-500 to-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-rose-600 hover:to-rose-700 transition-all shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Upload New Material
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materials.map(material => (
                        <MaterialItem key={material._id} material={material} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function MaterialItem({ material }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const pdfAttachments = material.attachements?.filter(
        (att) => att.fileType === "application/pdf"
    );

    const imageAttachments = material.attachements?.filter(
        (att) => att.fileType?.startsWith("image/")
    );

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this material?")) {
            try {
                await ApiServices.DeleteMaterial(material._id);
                alert("Material deleted successfully!");
                window.location.reload();
            } catch (err) {
                console.error(err);
                alert("Failed to delete material. Please try again.");
            }
        }
    };

    return (
        <div className="bg-gradient-to-br from-white to-rose-50 rounded-2xl shadow-xl overflow-hidden border border-rose-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative">
            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex space-x-2 z-10">
                <Link
                    to={`/student/material/your/update/${material._id}`}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-2 rounded-lg shadow-md hover:shadow-lg transition-all"
                    title="Edit material"
                >
                    <FaEdit className="w-4 h-4" />
                </Link>
                <button
                    onClick={handleDelete}
                    className="bg-gradient-to-r from-rose-500 to-rose-600 text-white p-2 rounded-lg shadow-md hover:shadow-lg transition-all"
                    title="Delete material"
                >
                    <FaTrash className="w-4 h-4" />
                </button>
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-rose-300 w-full">
                        {material.title || "Untitled Material"}
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-4">
                    <div className="flex items-center">
                        <div className="bg-rose-100 p-2 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-rose-600 font-medium">Subject</p>
                            <p className="text-sm font-medium text-gray-800">
                                {material.subjectId?.subjectName || "N/A"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="bg-violet-100 p-2 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-violet-600 font-medium">Material Type</p>
                            <p className="text-sm font-medium text-gray-800">
                                {material.materialTypeId?.typeName || "N/A"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="bg-violet-100 p-2 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-violet-600 font-medium">Created At</p>
                            <p className="text-sm text-gray-800">
                                {new Date(material.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="my-4">
                    <p className="text-xs font-medium text-rose-600 mb-1 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Description
                    </p>
                    <p className="text-sm text-gray-700 bg-rose-50 p-3 rounded-lg border border-rose-100">
                        {material.description || "No description available"}
                    </p>
                </div>

                {material.price > 0 && (
                    <div className="bg-gradient-to-r from-violet-50 to-rose-50 p-3 rounded-xl border border-violet-100 mb-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs text-violet-600 font-medium">Price</p>
                                <p className="text-lg font-bold text-gray-800">₹{material.price.toFixed(2)}</p>
                            </div>
                            {/* Price button removed as requested */}
                        </div>
                    </div>
                )}

                {pdfAttachments?.length > 0 && (
                    <div className="border-t border-rose-100 pt-4 mt-4">
                        <h3 className="text-sm font-medium text-violet-700 mb-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            PDF Attachments
                        </h3>
                        <div className="space-y-3">
                            {pdfAttachments.map((pdf) => (
                                <div key={pdf._id} className="bg-gradient-to-br from-white to-rose-50 p-3 rounded-xl border border-rose-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center">
                                            <div className="bg-rose-100 p-1.5 rounded-lg mr-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                                                {pdf.originalName}
                                            </span>
                                        </div>
                                        <span className="text-xs bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full font-semibold">
                                            {Math.round(pdf.size / 1024)} KB
                                        </span>
                                    </div>
                                    <div className="flex space-x-2 mt-2">
                                        <a
                                            href={pdf.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 text-center bg-rose-500 hover:bg-rose-600 text-white py-1.5 px-3 rounded-lg transition-all text-sm flex items-center justify-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View
                                        </a>
                                        <a
                                            href={pdf.url}
                                            download
                                            className="flex-1 text-center bg-violet-500 hover:bg-violet-600 text-white py-1.5 px-3 rounded-lg transition-all text-sm flex items-center justify-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {imageAttachments?.length > 0 && (
                    <div className="border-t border-rose-100 pt-4 mt-4">
                        <h3 className="text-sm font-medium text-violet-700 mb-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Image Gallery
                        </h3>
                        <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                            <div className="aspect-w-16 aspect-h-10 bg-gray-100 overflow-hidden">
                                <img
                                    src={imageAttachments[currentImageIndex].url}
                                    alt={imageAttachments[currentImageIndex].originalName}
                                    className="w-full h-full object-cover transition-transform duration-500"
                                />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white p-3">
                                <p className="text-xs font-medium truncate">{imageAttachments[currentImageIndex].originalName}</p>
                                <p className="text-xs text-rose-200">{Math.round(imageAttachments[currentImageIndex].size / 1024)} KB</p>
                            </div>

                            <a
                                href={imageAttachments[currentImageIndex].url}
                                download
                                className="absolute top-2 right-2 bg-white/90 text-rose-600 p-1.5 rounded-full shadow-sm hover:bg-white"
                                title="Download image"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </a>

                            {imageAttachments.length > 1 && (
                                <>
                                    <button
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-rose-600 p-1.5 rounded-full shadow text-sm"
                                        onClick={() =>
                                            setCurrentImageIndex((prev) =>
                                                prev === 0 ? imageAttachments.length - 1 : prev - 1
                                            )
                                        }
                                    >
                                        ◀
                                    </button>
                                    <button
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-rose-600 p-1.5 rounded-full shadow text-sm"
                                        onClick={() =>
                                            setCurrentImageIndex((prev) =>
                                                prev === imageAttachments.length - 1 ? 0 : prev + 1
                                            )
                                        }
                                    >
                                        ▶
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}