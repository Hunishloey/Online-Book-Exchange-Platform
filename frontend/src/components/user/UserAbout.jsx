import React from 'react';
import { FaBook, FaSearch, FaExchangeAlt, FaMoneyBillWave, FaRecycle, FaUsers, FaGraduationCap } from 'react-icons/fa';

export default function UserAbout() {
    const arr = [1, 2, 3, 4];
    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Academic Exchange <span className="text-rose-500">Reimagined</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
                    We're building a sustainable academic ecosystem where students exchange textbooks, notes,
                    and resources to support each other's educational journey.
                </p>

                <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
                    <div className="flex flex-wrap items-center justify-center gap-8">
                        <div className="grid grid-cols-2 gap-4">
                            {arr.map(item => (
                                <div key={item} className="bg-gray-100 rounded-lg p-4">
                                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24">
                                        <img
                                            src={`/assets/images/person${item}.jpg`}
                                            alt="Student exchanging books"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>



                        <div className="text-left">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Our Impact</h3>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-center">
                                    <span className="text-rose-500 mr-2 font-bold">✓</span>
                                    Over 1 million resources exchanged
                                </li>
                                <li className="flex items-center">
                                    <span className="text-rose-500 mr-2 font-bold">✓</span>
                                    Serving 500+ universities worldwide
                                </li>
                                <li className="flex items-center">
                                    <span className="text-rose-500 mr-2 font-bold">✓</span>
                                    95% student satisfaction rate
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="max-w-7xl mx-auto mb-20">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
                    How Our <span className="text-rose-500">Exchange System</span> Works
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "List Your Resources",
                            description: "Upload textbooks, notes, question papers, or study materials you no longer need.",
                            icon: <FaBook className="h-10 w-10 text-rose-500" />,
                            bg: "bg-gray-100"
                        },
                        {
                            title: "Discover & Request",
                            description: "Find resources you need and request them from other students.",
                            icon: <FaSearch className="h-10 w-10 text-rose-500" />,
                            bg: "bg-gray-100"
                        },
                        {
                            title: "Exchange & Connect",
                            description: "Arrange exchanges locally or ship materials to fellow students.",
                            icon: <FaExchangeAlt className="h-10 w-10 text-rose-500" />,
                            bg: "bg-gray-100"
                        }
                    ].map((item, index) => (
                        <div
                            key={index}
                            className={`${item.bg} rounded-xl p-8 transition-all duration-300 hover:shadow-lg`}
                        >
                            <div className="mb-6">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                            <p className="text-gray-700">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Benefits Section */}
            <div className="max-w-7xl mx-auto mb-20">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    <div className="lg:w-1/2">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">
                            Why Students <span className="text-rose-500">Choose Us</span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                {
                                    title: "Save Money",
                                    description: "Access materials at a fraction of the cost",
                                    icon: <FaMoneyBillWave className="h-6 w-6 text-rose-500" />,
                                    bg: "bg-gray-100"
                                },
                                {
                                    title: "Reduce Waste",
                                    description: "Give your old materials new life",
                                    icon: <FaRecycle className="h-6 w-6 text-rose-500" />,
                                    bg: "bg-gray-100"
                                },
                                {
                                    title: "Build Community",
                                    description: "Connect with students in your field",
                                    icon: <FaUsers className="h-6 w-6 text-rose-500" />,
                                    bg: "bg-gray-100"
                                },
                                {
                                    title: "Quality Materials",
                                    description: "Get resources vetted by fellow students",
                                    icon: <FaGraduationCap className="h-6 w-6 text-rose-500" />,
                                    bg: "bg-gray-100"
                                }
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className={`${item.bg} rounded-lg p-6 hover:shadow-md transition-all duration-300`}
                                >
                                    <div className="flex items-start">
                                        <div className="mr-4 mt-1">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                                            <p className="text-gray-700">{item.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:w-1/2">
                        <div className="relative">
                            <div className="grid grid-cols-2 gap-4">
                                {arr.map(item => (
                                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64">
                                        <img
                                            src={`/assets/images/category${item}.jpg`}
                                            alt="Textbook collection"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white rounded-full p-3 shadow-lg">
                                    <div className="bg-gray-100 rounded-full p-2">
                                        <div className="bg-rose-500 rounded-full w-16 h-16 flex items-center justify-center">
                                            <FaExchangeAlt className="h-8 w-8 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonials */}
            <div className="max-w-7xl mx-auto mb-20">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
                    Student <span className="text-rose-500">Testimonials</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            name: "Priya Sharma",
                            role: "Computer Science Student",
                            text: "This platform saved me over ₹5000 in textbooks during my first year alone.",
                            bg: "bg-gray-100"
                        },
                        {
                            name: "Raj Patel",
                            role: "Engineering Student",
                            text: "The previous year question papers I found here were invaluable for exam prep.",
                            bg: "bg-gray-100"
                        },
                        {
                            name: "Ananya Singh",
                            role: "Medical Student",
                            text: "Exchanging notes with seniors has been a game-changer for my studies.",
                            bg: "bg-gray-100"
                        }
                    ].map((testimonial, index) => (
                        <div
                            key={index}
                            className={`${testimonial.bg} rounded-xl p-6 hover:shadow-md transition-all duration-300`}
                        >
                            <div className="flex items-center mb-4">
                                <div className="bg-gray-300 rounded-full w-16 h-16 flex items-center justify-center mr-4">
                                    <span className="text-xl font-bold text-gray-700">
                                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{testimonial.name}</h3>
                                    <p className="text-gray-600">{testimonial.role}</p>
                                </div>
                            </div>
                            <p className="text-gray-700">"{testimonial.text}"</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Call to Action */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-gray-900 rounded-2xl p-10 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Ready to Join the Exchange?
                    </h2>
                    <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-lg">
                        Become part of our growing community of students helping each other succeed
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button className="bg-rose-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-rose-600 transition-all duration-300">
                            Start Listing Resources
                        </button>
                        <button className="bg-transparent border-2 border-gray-300 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-800 transition-all duration-300">
                            Browse Available Materials
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
}