import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApiServices from "../../ApiServices";
import { FaBook, FaSearch, FaTimes ,FaEye, FaChartBar } from "react-icons/fa";


const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};

export default function StudentFlashCard() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [filters, setFilters] = useState({ title: "", subjectId: "" });

    const debouncedTitle = useDebounce(filters.title, 500);

    useEffect(() => {
        ApiServices.GetAllFlashCards({ isPublic: true, status: true })
            .then((res) => {
                setData(res.data.data || []);
                setFilteredData(res.data.data || []);
            })
            .catch((err) => console.error("Error fetching flashcards:", err))
            .finally(() => setLoading(false));

        ApiServices.GetAllSubject({ status: true, limit: 100 })
            .then((res) => setSubjects(res.data.data || []))
            .catch((err) => console.error("Error fetching subjects:", err));
    }, []);

    useEffect(() => {
        if (!data.length) return;
        const filtered = data.filter((card) => {
            const matchesTitle = filters.title === "" || card.title.toLowerCase().includes(filters.title.toLowerCase());
            const matchesSubject = filters.subjectId === "" || card.subjectId?._id === filters.subjectId;
            return matchesTitle && matchesSubject;
        });
        setFilteredData(filtered);
    }, [debouncedTitle, filters.subjectId, data]);

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const resetFilters = () => {
        setFilters({ title: "", subjectId: "" });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-16">

            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <FaSearch className="mr-2 text-violet-600" />
                            Search by Title
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search flashcards by title..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                value={filters.title}
                                onChange={(e) => handleFilterChange("title", e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            {filters.title && (
                                <button
                                    onClick={() => handleFilterChange("title", "")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <FaBook className="mr-2 text-violet-600" />
                            Filter by Subject
                        </label>
                        <div className="relative">
                            <select
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all bg-white"
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
                    </div>
                </div>

                {(filters.title || filters.subjectId) && (
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={resetFilters}
                            className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                            <FaTimes className="mr-1" />
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <p className="text-center text-gray-500">Loading flash cards...</p>
            ) : filteredData.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
                    <div className="text-5xl mb-4 text-rose-400">📭</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No flash cards found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your filters</p>
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredData.map((flashCard) => (
                        <div
                            key={flashCard._id}
                            className="bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden border border-gray-200 transition-all group"
                        >
                            <div className="bg-gradient-to-r from-rose-100 to-violet-100 py-5 px-6 border-b border-rose-200">
                                <div className="flex items-center">
                                    <div className="bg-white rounded-full p-2 shadow-sm">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-rose-200 to-violet-200 flex items-center justify-center">
                                            <span className="text-lg font-semibold text-violet-700">
                                                {flashCard.title?.charAt(0)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {flashCard?.subjectId?.subjectName || "No Subject"}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">{flashCard?.title}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800 group-hover:text-violet-700 transition-colors">
                                        {flashCard?.title || "Untitled"}
                                    </h2>
                                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                        Public
                                    </span>
                                </div>

                                <div className="p-3 bg-gray-50 rounded-lg mb-6">
                                    <div className="flex items-center">
                                        <div className="bg-gradient-to-r from-rose-200 to-violet-200 w-10 h-10 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold text-white">A</span>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-700">
                                                {flashCard?.addedById?.name || "Unknown"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                    <Link
                                        to={`/student/flashcard/view/${flashCard._id}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-xl hover:from-cyan-700 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm font-medium"
                                    >
                                        <FaEye className="text-lg" />
                                        View Material
                                    </Link>

                                    <div className="relative group">
                                        <Link
                                            to={`/student/flashcard/view/${flashCard._id}`}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl hover:from-violet-700 hover:to-violet-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm font-medium"
                                        >
                                            <FaChartBar className="text-lg" />
                                            Rating
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}