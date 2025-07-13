import React from 'react';
import { useState } from 'react';
import ApiServices from '../../ApiServices';
import { useNavigate } from 'react-router-dom';
export default function MaterialCard({ material }) {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const navigate = useNavigate();
    const pdfAttachments = material.attachements?.filter(
        (att) => att.fileType === "application/pdf"
    );

    const imageAttachments = material.attachements?.filter(
        (att) => att.fileType?.startsWith("image/")
    );

    const buyHandler = async (materialId, sellerId, buyerId, price) => {
        // Input validation
        if (!materialId || !sellerId || !buyerId || !price) {
            console.error('Missing required parameters');
            return;
        }

        if (isNaN(price) || price <= 0) {
            console.error('Invalid price value');
            return;
        }

        try {
            const response = await ApiServices.PaymentInitialization({
                materialId,
                sellerId,
                buyerId,
            });

            if (!response.data) {
                throw new Error('No response data received');
            }

            if (response.data.success) {
                console.log('Payment initialized successfully:');
                sessionStorage.setItem("paymentData", JSON.stringify(response.data.data));
                navigate("/payment");
            } else {
                // Handle API success:false case
                console.error('Payment initialization failed:', response.data.message);
                showErrorToast(response.data.message || 'Payment failed'); // UI feedback
            }
        } catch (error) {
            console.error('Payment initialization error:', error);

            // Handle specific error cases
            if (error.response) {
                // The request was made and the server responded with a status code
                console.error('Server responded with error status:', error.response.status);
                showErrorToast(error.response.data?.message || 'Server error');
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
                showErrorToast('Network error - please try again');
            } else {
                // Something happened in setting up the request
                console.error('Request setup error:', error.message);
                showErrorToast('Payment processing error');
            }
        } finally {
        }
    };

    return (
        <div className="bg-gradient-to-br from-white to-rose-50 rounded-2xl shadow-xl overflow-hidden border border-rose-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1" >
            {/* Premium badge */}
            {material.price > 0 && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                    PREMIUM
                </div>
            )}

            <div className="p-6">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-rose-300 w-full">
                        {material.title || "Untitled Material"}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                        <div className="bg-rose-100 p-2 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-rose-600 font-medium">Subject</p>
                            <p className="text-gray-800 font-medium">
                                {material.subjectId?.subjectName || "N/A"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="bg-violet-100 p-2 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-violet-600 font-medium">Material Type</p>
                            <p className="text-gray-800 font-medium">
                                {material.materialTypeId?.typeName || "N/A"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="bg-rose-100 p-2 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-rose-600 font-medium">Added By</p>
                            <p className="text-gray-800 font-medium">
                                {material.addedById?.name || "Unknown"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="bg-violet-100 p-2 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-violet-600 font-medium">Created At</p>
                            <p className="text-gray-800">
                                {new Date(material.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="my-6">
                    <p className="font-medium text-rose-600 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Description
                    </p>
                    <p className="text-gray-700 bg-rose-50 p-4 rounded-xl min-h-20 border border-rose-100">
                        {material.description || "No description available"}
                    </p>
                </div>

                {/* Price and Buy Now Section */}
                {material.price > 0 && (
                    <div className="bg-gradient-to-r from-violet-50 to-rose-50 p-4 rounded-xl border border-violet-100 mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-violet-600 font-medium">Price</p>
                                <p className="text-2xl font-bold text-gray-800">₹{material.price.toFixed(2)}</p>
                            </div>
                            <button onClick={() => buyHandler(
                                material["_id"],
                                material["addedById"]?.["_id"], // Optional chaining still recommended
                                userData?.["_id"],
                                material["price"]
                            )}
                                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50">
                                Buy Now
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block ml-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {pdfAttachments?.length > 0 && (
                    <div className="border-t border-rose-100 pt-5 mt-4">
                        <h3 className="font-medium text-violet-700 mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            PDF Attachments
                        </h3>
                        <div className="space-y-4">
                            {pdfAttachments.map((pdf) => (
                                <div key={pdf._id} className="bg-gradient-to-br from-white to-rose-50 p-4 rounded-xl border border-rose-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center">
                                            <div className="bg-rose-100 p-2 rounded-lg mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <span className="font-medium text-gray-700 truncate max-w-[180px]">
                                                {pdf.originalName}
                                            </span>
                                        </div>
                                        <span className="text-xs bg-violet-100 text-violet-800 px-2 py-1 rounded-full font-semibold">
                                            {Math.round(pdf.size / 1024)} KB
                                        </span>
                                    </div>
                                    <div className="flex space-x-3 mt-4">
                                        <a
                                            href={pdf.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 text-center bg-rose-500 hover:bg-rose-600 text-white py-2.5 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View
                                        </a>
                                        <a
                                            href={pdf.url}
                                            download
                                            className="flex-1 text-center bg-violet-500 hover:bg-violet-600 text-white py-2.5 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                {/* console.log(material.attachements[0].url) */}

                {/* Image Attachments Gallery */}
                {imageAttachments?.length > 0 && (
                    <div className="border-t border-rose-100 pt-5 mt-4 px-6 pb-6">
                        <h3 className="font-medium text-violet-700 mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                            {/* Overlay Info */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white p-4">
                                <p className="font-medium truncate">{imageAttachments[currentImageIndex].originalName}</p>
                                <p className="text-sm text-rose-200">{Math.round(imageAttachments[currentImageIndex].size / 1024)} KB</p>
                            </div>

                            {/* Download Button */}
                            <a
                                href={imageAttachments[currentImageIndex].url}
                                download
                                className="absolute top-3 right-3 bg-white/90 text-rose-600 p-2 rounded-full shadow-md hover:bg-white"
                                title="Download image"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </a>

                            {/* Navigation Arrows */}
                            {imageAttachments.length > 1 && (
                                <>
                                    <button
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-rose-600 p-2 rounded-full shadow"
                                        onClick={() =>
                                            setCurrentImageIndex((prev) =>
                                                prev === 0 ? imageAttachments.length - 1 : prev - 1
                                            )
                                        }
                                    >
                                        ◀
                                    </button>
                                    <button
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-rose-600 p-2 rounded-full shadow"
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
        </div >
    );
}