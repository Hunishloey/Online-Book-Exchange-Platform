import React from 'react';
import { FaBook, FaExchangeAlt, FaGraduationCap, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

export default function StudentFooter() {
    return (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
                    {/* Platform Information */}
                    <div className="space-y-6">
                        <div className="flex items-center">
                            <img
                                src="/assets/images/main-logo-1.png"
                                alt="Academic Exchange Logo"
                                className="h-10 w-auto brightness-0 invert"
                            />
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                            Connecting students across universities to exchange textbooks, notes, and study materials.
                            Save money, reduce waste, and build academic communities through our trusted platform.
                        </p>
                        <div className="flex space-x-4">
                            {[
                                { icon: 'facebook-f', label: 'Facebook', color: 'hover:text-blue-500' },
                                { icon: 'instagram', label: 'Instagram', color: 'hover:text-rose-500' },
                                { icon: 'twitter', label: 'Twitter', color: 'hover:text-sky-500' },
                                { icon: 'linkedin-in', label: 'LinkedIn', color: 'hover:text-blue-600' },
                                { icon: 'youtube', label: 'YouTube', color: 'hover:text-red-600' }
                            ].map((social) => (
                                <a
                                    key={social.icon}
                                    href="#"
                                    className={`text-gray-400 ${social.color} transition-colors duration-300`}
                                    aria-label={social.label}
                                >
                                    <i className={`fab fa-${social.icon} text-xl`}></i>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Resource Categories */}
                    <div className="space-y-6">
                        <h5 className="text-white text-lg font-bold pb-2 border-b-2 border-rose-500 inline-block">
                            Resource Categories
                        </h5>
                        <ul className="space-y-3">
                            {[
                                'Engineering Textbooks',
                                'Medical Study Materials',
                                'Computer Science Notes',
                                'Previous Year Question Papers',
                                'Research Papers',
                                'Study Guides & Summaries'
                            ].map((category) => (
                                <li key={category}>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-rose-400 transition-colors duration-300 flex items-start"
                                    >
                                        <FaBook className="text-rose-500 mt-1 mr-2 flex-shrink-0" />
                                        <span>{category}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h5 className="text-white text-lg font-bold pb-2 border-b-2 border-violet-500 inline-block">
                            Quick Links
                        </h5>
                        <ul className="space-y-3">
                            {[
                                { name: 'Home', icon: FaExchangeAlt },
                                { name: 'About Us', icon: FaGraduationCap },
                                { name: 'Resource Shop', icon: FaBook },
                                { name: 'Exchange Hub', icon: FaExchangeAlt },
                                { name: 'Student Blogs', icon: FaGraduationCap },
                                { name: 'Contact Support', icon: FaPhone }
                            ].map((link) => (
                                <li key={link.name}>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-violet-400 transition-colors duration-300 flex items-start"
                                    >
                                        <link.icon className="text-violet-500 mt-1 mr-2 flex-shrink-0" />
                                        <span>{link.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-6">
                        <h5 className="text-white text-lg font-bold pb-2 border-b-2 border-rose-500 inline-block">
                            Contact Us
                        </h5>
                        <ul className="space-y-4">
                            {[
                                {
                                    icon: FaPhone,
                                    title: 'Phone Support',
                                    details: '+91 98765 43210',
                                    description: 'Mon-Fri, 9am-6pm'
                                },
                                {
                                    icon: FaEnvelope,
                                    title: 'Email Us',
                                    details: 'support@academicexchange.com',
                                    description: 'Response within 24 hours'
                                },
                                {
                                    icon: FaMapMarkerAlt,
                                    title: 'Head Office',
                                    details: '123 Education Street',
                                    description: 'Mumbai, Maharashtra 400001'
                                },
                                {
                                    icon: FaClock,
                                    title: 'Working Hours',
                                    details: 'Monday-Friday: 9AM-6PM',
                                    description: 'Saturday: 10AM-4PM'
                                }
                            ].map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <div className="mt-1 mr-3 text-rose-500">
                                        <item.icon />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-200">{item.title}</h3>
                                        <p className="text-gray-400">{item.details}</p>
                                        <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Newsletter Subscription */}
                <div className="mt-16 pt-8 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Stay Updated</h3>
                            <p className="text-gray-400 max-w-md">
                                Subscribe to our newsletter for updates on new resources, exchange opportunities, and student discounts.
                            </p>
                        </div>
                        <div className="w-full md:w-auto">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="px-5 py-3 bg-gray-800 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 w-full sm:w-72"
                                />
                                <button className="bg-gradient-to-r from-rose-600 to-violet-600 text-white font-medium py-3 px-6 rounded-lg hover:from-rose-700 hover:to-violet-700 transition-all duration-300 whitespace-nowrap">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright and Additional Links */}
                <div className="mt-12 pt-6 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 text-sm">
                            © {new Date().getFullYear()} AcademicExchange. All rights reserved.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            {['Privacy Policy', 'Terms of Service', 'Refund Policy', 'Security', 'Sitemap'].map((item) => (
                                <a
                                    key={item}
                                    href="#"
                                    className="text-gray-500 hover:text-rose-400 text-sm transition-colors"
                                >
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}