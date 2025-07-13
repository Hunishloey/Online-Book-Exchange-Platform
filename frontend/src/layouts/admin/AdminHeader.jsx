import { useState } from 'react';
import { FaBars, FaTimes, FaPhoneAlt,FaSignOutAlt} from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function AdminHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const navItems = [
        { name: 'DASHBOARD', path: '/admin' },
        { name: 'STUDENTS', path: '/admin/students' },
        { name: 'SUBJECT', path: '/admin/subject' },
        { name: 'COURSE', path: '/admin/course' },
        { name: 'MATERIAL TYPE', path: '/admin/material-type' },
    ];

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50  ">
            {/* Top Info Bar */}
            <div className="bg-gray-100 border-b border-gray-300 hidden md:block">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-3 divide-x divide-gray-200">
                        <div className="py-2">
                            <p className="text-lg text-gray-600">
                                Need any help? Feel Free to Call us{' '}
                                <a href="tel:7696173705" className="text-gray-600 hover:!text-rose-400 hover:underline">
                                    7696173705
                                </a>
                            </p>
                        </div>
                        <div className="py-2">
                            <p className="text-sm text-center">
                                <Link
                                    to="/"
                                    className="text-gray-600 hover:!text-rose-400 hover:underline font-medium flex items-center justify-center gap-1 text-2xl"
                                >
                                    <FaSignOutAlt className="text-xl"/>
                                    Logout Now !!
                                </Link>
                            </p>
                        </div>
                        <div className="py-2">
                            <p className="text-lg text-center text-gray-600">
                                Your university is for you, like service pure and true.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="container mx-auto px-4 py-3 flex items-center justify-between lg:px-10">
                {/* Logo */}
                <a href="/" className="flex items-center">
                    <img
                        src="/assets/images/main-logo-1.png"
                        alt="Logo"
                        className="h-10 w-auto"
                    />
                </a>

                {/* Desktop Navigation */}
                <div className="hidden md:flex md:items-center md:space-x-8">
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className="text-gray-100 hover:!text-rose-400 hover:underline font-medium text-xl transition-colors duration-300 !text-inherit visited:text-green-800"
                        >
                            {item.name}
                        </Link>
                    ))}

                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-gray-800 focus:outline-none"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? (
                        <FaTimes className="h-6 w-6" />
                    ) : (
                        <FaBars className="h-6 w-6" />
                    )}
                </button>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4 px-6 z-50">
                        <div className="flex flex-col space-y-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item}
                                    href={item.path}
                                    className={`text-gray-800 hover:text-gray-600 font-medium py-2 border-b border-gray-100 ${item === 'Home' ? 'text-gray-600' : ''
                                        }`}
                                    onClick={toggleMenu}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-gray-200">
                                <a
                                    href="tel:7696173705"
                                    className="flex items-center text-gray-800 hover:text-blue-600"
                                >
                                    <FaPhoneAlt className="mr-2" />
                                    7696173705
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}