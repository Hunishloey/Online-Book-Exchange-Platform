import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApiServices from "../../ApiServices";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function StudentYourCard() {
    const [flashCards, setFlashCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userData = JSON.parse(localStorage.getItem("userData")) || {};

    useEffect(() => {
        const fetchFlashCards = async () => {
            try {
                const res = await ApiServices.GetAllFlashCards({ addedById: userData._id, status: true });
                setFlashCards(res.data.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load your flash cards. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchFlashCards();
    }, [userData._id]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this flash card?")) {
            try {
                await ApiServices.DeleteFlashCard(id);
                setFlashCards(prev => prev.filter(card => card._id !== id));
            } catch (err) {
                alert("Error deleting flash card.");
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-violet-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-600 mx-auto"></div>
                    <p className="mt-4 text-gray-700">Loading your flash cards...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-violet-50">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Flash Cards</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button onClick={() => window.location.reload()} className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (flashCards.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-violet-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Flash Cards Found</h2>
                    <p className="text-gray-600 mb-6">You haven't created any flash cards yet.</p>
                    <Link to="/student/flashcard/add" className="inline-block bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all shadow-md">
                        Create Your First Flash Card
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-violet-50 py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Your Flash Cards</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        View, edit, or delete your flash cards. Keep your study resources updated!
                    </p>
                    <div className="mt-4">
                        <Link to="/student/flashcard/add" className="inline-flex items-center bg-gradient-to-r from-rose-500 to-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-rose-600 hover:to-rose-700 transition-all shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create New Flash Card
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flashCards.map((card) => (
                        <div key={card._id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 relative group">
                            <div className="absolute top-4 right-4 flex space-x-2 z-10">
                                <Link to={`/student/flashcard/your/update/${card._id}`} className="bg-violet-600 text-white p-2 rounded-lg hover:bg-violet-700">
                                    <FaEdit className="w-4 h-4" />
                                </Link>
                                <button onClick={() => handleDelete(card._id)} className="bg-rose-600 text-white p-2 rounded-lg hover:bg-rose-700">
                                    <FaTrash className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">Subject: {card.subjectId?.subjectName || 'N/A'}</p>
                            <p className="text-sm text-gray-600">Status: <span className="text-green-600 font-medium">Active</span></p>
                            <Link to={`/student/flashcard/view/${card._id}`} className="mt-4 inline-block bg-gradient-to-r from-violet-500 to-violet-600 text-white px-4 py-2 rounded-lg hover:from-violet-600 hover:to-violet-700 transition-all shadow-sm">
                                View Material
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
