import { useState, useEffect, useRef } from 'react';
import {
    FaBars, FaTimes, FaPhoneAlt, FaSignOutAlt, FaUser, FaBook,
    FaPlay, FaBell, FaLayerGroup, FaHome, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function StudentHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [notificationCount] = useState(3);
    const location = useLocation();
    const navigate = useNavigate();
    const headerRef = useRef(null);

    const profileItems = [
        { name: 'My Profile', path: '/student/profile' },
    ];

    const playlistItems = [
        { name: 'All Playlists', path: '/student/playlist' },
        { name: 'My Playlists', path: '/student/playlist/your' },
        { name: 'Create New', path: '/student/playlist/add' },
    ];

    const materialItems = [
        { name: 'All Material', path: '/student/material' },
        { name: 'My Material', path: '/student/material/your' },
        { name: 'Add New', path: '/student/material/add' },
    ];

    const flashcardItems = [
        { name: 'All Flashcards', path: '/student/flashcard' },
        { name: 'My Flashcards', path: '/student/flashcard/your' },
        { name: 'Add New', path: '/student/flashcard/add' },
    ];

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);
    const toggleDropdown = (dropdown) => setActiveDropdown(activeDropdown === dropdown ? null : dropdown);

    const handleLogout = () => {
        toast.success('You have been logged out successfully');
        setTimeout(() => navigate('/'), 1500);
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => setActiveDropdown(null), [location]);

    const navItems = [
        { name: 'Home', path: '/student', icon: <FaHome className="text-lg" /> },
        { name: 'Playlist', path: '/student/playlist', icon: <FaPlay className="text-lg" />, dropdown: true },
        { name: 'Material', path: '/student/material', icon: <FaBook className="text-lg" />, dropdown: true },
        { name: 'Flashcard', path: '/student/flashcard', icon: <FaLayerGroup className="text-lg" />, dropdown: true },
    ];

    const getDropdownItems = (name) => {
        switch (name) {
            case 'Playlist': return playlistItems;
            case 'Material': return materialItems;
            case 'Flashcard': return flashcardItems;
            default: return [];
        }
    };

    return (
        <header
            ref={headerRef}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${scrolled ? 'bg-gray-500 shadow-lg py-0 backdrop-blur-sm bg-opacity-90' : 'bg-gradient-to-r from-cyan-50 to-rose-50 py-2'}`}
        >
            
            {/* <div className="bg-gradient-to-r from-cyan-700 to-rose-700 text-white hidden md:block">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center py-2">
                        <div className="flex items-center">
                            <div className="animate-pulse flex items-center">
                                <div className="h-2 w-2 bg-rose-300 rounded-full mr-2"></div>
                                <p className="text-xs sm:text-sm">
                                    <span className="hidden sm:inline">Need help? Call us </span>
                                    <a
                                        href="tel:7696173705"
                                        className="font-medium text-cyan-100 hover:text-white transition-colors flex items-center"
                                    >
                                        <FaPhoneAlt className="mr-1 inline" />
                                        7696173705
                                    </a>
                                </p>
                            </div>
                        </div>

                        <div className="text-center italic text-cyan-100 text-xs sm:text-sm">
                            Your university is for you, like service pure and true.
                        </div>
                        <div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-cyan-100 hover:text-white transition-colors group"
                            >
                                <FaSignOutAlt className="group-hover:animate-pulse" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div> */}
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/student" className="flex items-center group">
                    <div className="bg-gradient-to-r from-cyan-600 to-rose-600 p-1.5 rounded-lg mr-3">
                        <div className="bg-white p-1 rounded">
                            <div className="bg-gradient-to-r from-cyan-600 to-rose-600 w-8 h-8 rounded flex items-center justify-center">
                                <span className="text-white font-bold text-lg">S</span>
                            </div>
                        </div>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-rose-600 bg-clip-text text-transparent">Shelf</span>
                </Link>

                <div className="hidden md:flex items-center space-x-1">
                    {navItems.map((item) => (
                        <div key={item.path} className="relative">
                            <Link
                                to={item.path}
                                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 group ${location.pathname === item.path ? 'bg-gradient-to-r from-cyan-600 to-rose-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-50 hover:text-cyan-600'}`}
                                onClick={(e) => {
                                    if (item.dropdown) {
                                        e.preventDefault();
                                        toggleDropdown(item.name);
                                    }
                                }}
                            >
                                <span className="mr-2">{item.icon}</span>
                                <span className="font-medium">{item.name}</span>
                                {item.dropdown && <span className="ml-1">{activeDropdown === item.name ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}</span>}
                            </Link>
                            {item.dropdown && activeDropdown === item.name && (
                                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl overflow-hidden z-50 animate-fadeIn">
                                    {getDropdownItems(item.name).map((subItem) => (
                                        <Link
                                            key={subItem.path}
                                            to={subItem.path}
                                            className={`block px-4 py-3 text-gray-700 hover:bg-cyan-50 transition-colors ${location.pathname === subItem.path ? 'bg-cyan-50 text-cyan-600 font-medium' : ''}`}
                                            onClick={closeMenu}
                                        >
                                            {subItem.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="hidden md:flex items-center space-x-4">
                    <Link to="/student/request" className="p-2 rounded-full hover:bg-cyan-50 transition-colors text-gray-700 relative">
                        <FaBell className="text-xl" />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">{notificationCount}</span>
                        )}
                    </Link>

                    <div className="relative">
                        <button onClick={() => toggleDropdown('profile')} className="flex items-center p-2 rounded-full hover:bg-cyan-50 transition-colors text-gray-700">
                            <div className="bg-gradient-to-r from-cyan-600 to-rose-600 rounded-full p-0.5">
                                <div className="bg-white rounded-full p-1">
                                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-6 h-6" />
                                </div>
                            </div>
                        </button>
                        {activeDropdown === 'profile' && (
                            <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-lg shadow-xl overflow-hidden z-50 animate-fadeIn">
                                {profileItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`block px-4 py-3 text-gray-700 hover:bg-cyan-50 transition-colors ${location.pathname === item.path ? 'bg-cyan-50 text-cyan-600 font-medium' : ''}`}
                                        onClick={() => setActiveDropdown(null)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors border-t border-gray-100">
                                    <div className="flex items-center">
                                        <FaSignOutAlt className="mr-2" /> Logout
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
