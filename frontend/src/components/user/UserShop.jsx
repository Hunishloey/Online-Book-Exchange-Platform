import React, { useState } from 'react';
import { FaSearch, FaFilter, FaShoppingCart, FaHeart, FaStar, FaRegHeart } from 'react-icons/fa';

export default function UserShop() {
    const [favorites, setFavorites] = useState({});
    const [activeCategory, setActiveCategory] = useState('all');

    // Toggle favorite status
    const toggleFavorite = (id) => {
        setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Product data
    const products = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: `Academic Book ${i + 1}`,
        price: (15 + i * 2).toFixed(2),
        rating: (4 + Math.random() * 1).toFixed(1),
        image: `/assets/images/product-item${i + 1}.png`,
        category: i < 3 ? 'textbooks' : i < 6 ? 'notes' : i < 9 ? 'question-papers' : 'study-guides'
    }));

    // Filter products by category
    const filteredProducts = activeCategory === 'all'
        ? products
        : products.filter(product => product.category === activeCategory);

    // Categories for filtering
    const categories = [
        { id: 'all', name: 'All Resources' },
        { id: 'textbooks', name: 'Textbooks' },
        { id: 'notes', name: 'Lecture Notes' },
        { id: 'question-papers', name: 'Question Papers' },
        { id: 'study-guides', name: 'Study Guides' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Shop Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Academic <span className="text-rose-500">Resource</span> Shop
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Discover textbooks, notes, question papers and study materials from fellow students
                    </p>
                </div>

                {/* Shop Controls */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        {/* Search Bar */}
                        <div className="relative w-full md:w-1/3">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search resources..."
                                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            />
                        </div>

                        {/* Category Filters */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === category.id
                                            ? 'bg-gradient-to-r from-violet-600 to-rose-500 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button className="flex items-center bg-gray-100 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                                <FaFilter className="text-gray-600 mr-2" />
                                <span className="text-gray-700">Sort By</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                        >
                            {/* Product Image */}
                            <div className="relative bg-gray-100 h-60 flex items-center justify-center p-6">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="max-h-52 object-contain"
                                />

                                {/* Favorite Button */}
                                <button
                                    onClick={() => toggleFavorite(product.id)}
                                    className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:text-rose-500 transition-colors"
                                    aria-label="Add to favorites"
                                >
                                    {favorites[product.id] ? (
                                        <FaHeart className="text-rose-500" />
                                    ) : (
                                        <FaRegHeart className="text-gray-400" />
                                    )}
                                </button>

                                {/* Discount Badge */}
                                {product.id % 3 === 0 && (
                                    <div className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                        25% OFF
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg mb-1">{product.name}</h3>
                                        <p className="text-gray-500 text-sm">{product.category.replace('-', ' ')}</p>
                                    </div>
                                    <div className="flex items-center bg-amber-100 px-2 py-1 rounded">
                                        <FaStar className="text-amber-500 mr-1" />
                                        <span className="text-amber-700 font-medium">{product.rating}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                    <div>
                                        <span className="text-xl font-bold text-gray-900">${product.price}</span>
                                        {product.id % 4 === 0 && (
                                            <span className="text-gray-400 line-through ml-2">${(parseFloat(product.price) + 5).toFixed(2)}</span>
                                        )}
                                    </div>
                                    <button className="bg-gradient-to-r from-violet-600 to-rose-500 text-white px-4 py-2 rounded-lg hover:from-violet-700 hover:to-rose-600 transition-all flex items-center">
                                        <FaShoppingCart className="mr-2" />
                                        <span>Add to Cart</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="mt-16 flex justify-center">
                    <nav className="flex items-center bg-white rounded-lg shadow-sm p-2">
                        <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
                            Previous
                        </button>
                        {[1, 2, 3, 4].map(page => (
                            <button
                                key={page}
                                className={`w-10 h-10 mx-1 rounded-md ${page === 1
                                        ? 'bg-gradient-to-r from-violet-600 to-rose-500 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
                            Next
                        </button>
                    </nav>
                </div>

                {/* Featured Section */}
                <div className="mt-20 bg-gradient-to-r from-violet-50 to-rose-50 rounded-2xl shadow-lg p-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="md:w-1/2">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Need Academic Resources <span className="text-rose-500">Cheap?</span>
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Join thousands of students who are saving money by buying and selling used textbooks, notes, and study materials on our platform.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button className="bg-gradient-to-r from-violet-600 to-rose-500 text-white font-bold py-3 px-6 rounded-lg hover:from-violet-700 hover:to-rose-600 transition-all">
                                    Browse Resources
                                </button>
                                <button className="bg-white text-violet-600 border border-violet-500 font-bold py-3 px-6 rounded-lg hover:bg-violet-50 transition-colors">
                                    Sell Your Materials
                                </button>
                            </div>
                        </div>
                        <div className="md:w-1/2 flex justify-center">
                            <div className="relative">
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-64 h-64" />
                                <div className="absolute -top-6 -right-6 bg-gray-200 border-2 border-dashed rounded-xl w-48 h-48" />
                                <div className="absolute -bottom-6 -left-6 bg-gray-200 border-2 border-dashed rounded-xl w-40 h-40" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}