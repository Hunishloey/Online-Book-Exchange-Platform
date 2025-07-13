import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaPhone, FaMapMarkerAlt, FaIdCard, FaBook, FaGraduationCap, FaUniversity, FaEnvelope, FaLock } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from 'react-spinners';
import ApiServices from '../../ApiServices';

export default function UserRegister() {
    const [formData, setFormData] = useState({
        name: '',
        profileImage: null,
        contact: '',
        address: '',
        courseId: '',
        semester: '',
        universityRollNo: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitDisabled, setSubmitDisabled] = useState(false);

    // Course options
    const courses = [
        { id: 'cs', name: 'Computer Science' },
        { id: 'it', name: 'Information Technology' },
        { id: 'me', name: 'Mechanical Engineering' },
        { id: 'ee', name: 'Electrical Engineering' },
        { id: 'ce', name: 'Civil Engineering' },
    ];

    // Semester options
    const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

    // Rate limiting: Disable submit button for 5 seconds after successful submission
    useEffect(() => {
        if (submitDisabled) {
            const timer = setTimeout(() => {
                setSubmitDisabled(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [submitDisabled]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'profileImage') {
            const file = files[0];
            if (file && file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, profileImage: 'File size exceeds 5MB' });
                return;
            }
            
            setFormData({ ...formData, profileImage: file });
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setFormData({ ...formData, [name]: value });
        }

        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.contact) newErrors.contact = 'Contact number is required';
        else if (!/^\d{10}$/.test(formData.contact)) newErrors.contact = 'Invalid contact number';

        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.courseId) newErrors.courseId = 'Please select a course';
        if (!formData.semester) newErrors.semester = 'Please select semester';

        if (!formData.universityRollNo.trim()) newErrors.universityRollNo = 'Roll number is required';
        else if (!/^[a-zA-Z0-9]{6,12}$/.test(formData.universityRollNo)) newErrors.universityRollNo = 'Invalid roll number format';

        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        else if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Password must contain uppercase letter';
        else if (!/[a-z]/.test(formData.password)) newErrors.password = 'Password must contain lowercase letter';
        else if (!/[0-9]/.test(formData.password)) newErrors.password = 'Password must contain number';
        else if (!/[!@#$%^&*]/.test(formData.password)) newErrors.password = 'Password must contain special character';

        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (isSubmitting || submitDisabled) return;
        
        if (validate()) {
            setIsSubmitting(true);
            const formDataToSend = new FormData();

            formDataToSend.append("name", formData.name.trim());
            formDataToSend.append("contact", formData.contact);
            formDataToSend.append("address", formData.address.trim());
            formDataToSend.append("courseId", formData.courseId);
            formDataToSend.append("semester", formData.semester);
            formDataToSend.append("universityRollNo", formData.universityRollNo.trim());
            formDataToSend.append("email", formData.email.trim());
            formDataToSend.append("password", formData.password);
            formDataToSend.append("confirmPassword", formData.confirmPassword);

            if (formData.profileImage) {
                formDataToSend.append("profileImage", formData.profileImage);
            }

            ApiServices.AddStudent(formDataToSend)
                .then((res) => {
                    if (res.data && res.data.success) {
                        toast.success(res.data.message || 'Registration successful!', {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        });
                        
                        // Reset form after successful submission
                        setFormData({
                            name: '',
                            profileImage: null,
                            contact: '',
                            address: '',
                            courseId: '',
                            semester: '',
                            universityRollNo: '',
                            email: '',
                            password: '',
                            confirmPassword: ''
                        });
                        setPreviewImage(null);
                        setErrors({});
                        
                        // Enable rate limiting
                        setSubmitDisabled(true);
                    } else {
                        toast.error(res.data?.message || 'Registration failed', {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                        });
                    }
                })
                .catch((err) => {
                    const errorMessage = err.response?.data?.message || 
                                        err.response?.data?.error || 
                                        'Network error. Please try again.';
                    
                    toast.error(errorMessage, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                    });
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <ToastContainer />
            
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Create Your <span className="text-rose-500">Student Account</span>
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Join our academic exchange platform to buy, sell, and exchange educational resources with fellow students.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="md:flex">
                        {/* Left Side - Form */}
                        <div className="md:w-2/3 p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Personal Information Section */}
                                <div className="border-b border-gray-200 pb-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                        <FaUser className="text-rose-500 mr-2" />
                                        Personal Information
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Name */}
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FaUser className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className={`pl-10 w-full px-4 py-3 border ${errors.name ? 'border-rose-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                                                    placeholder="Enter your full name"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            {errors.name && <p className="mt-1 text-rose-500 text-sm">{errors.name}</p>}
                                        </div>

                                        {/* Contact */}
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">
                                                Contact Number
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FaPhone className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="tel"
                                                    name="contact"
                                                    value={formData.contact}
                                                    onChange={handleChange}
                                                    className={`pl-10 w-full px-4 py-3 border ${errors.contact ? 'border-rose-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent`}
                                                    placeholder="Enter 10-digit number"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            {errors.contact && <p className="mt-1 text-rose-500 text-sm">{errors.contact}</p>}
                                        </div>

                                        {/* Address */}
                                        <div className="md:col-span-2">
                                            <label className="block text-gray-700 font-medium mb-2">
                                                Address
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                                                    <FaMapMarkerAlt className="text-gray-400" />
                                                </div>
                                                <textarea
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    rows="3"
                                                    className={`pl-10 w-full px-4 py-3 border ${errors.address ? 'border-rose-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                                                    placeholder="Enter your full address"
                                                    disabled={isSubmitting}
                                                ></textarea>
                                            </div>
                                            {errors.address && <p className="mt-1 text-rose-500 text-sm">{errors.address}</p>}
                                        </div>

                                        {/* Profile Image */}
                                        <div className="md:col-span-2">
                                            <label className="block text-gray-700 font-medium mb-2">
                                                Profile Photo
                                            </label>
                                            <div className="flex items-center">
                                                <div className="relative">
                                                    {previewImage ? (
                                                        <img
                                                            src={previewImage}
                                                            alt="Profile preview"
                                                            className="w-20 h-20 rounded-full object-cover border-2 border-violet-500"
                                                        />
                                                    ) : (
                                                        <div className="bg-gray-200 border-2 border-dashed rounded-full w-20 h-20 flex items-center justify-center">
                                                            <FaUser className="text-gray-400 text-2xl" />
                                                        </div>
                                                    )}
                                                    <label
                                                        htmlFor="profileImage"
                                                        className="absolute bottom-0 right-0 bg-rose-500 text-white rounded-full p-1 cursor-pointer"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                                        </svg>
                                                    </label>
                                                    <input
                                                        type="file"
                                                        id="profileImage"
                                                        name="profileImage"
                                                        accept="image/*"
                                                        onChange={handleChange}
                                                        className="hidden"
                                                        disabled={isSubmitting}
                                                    />
                                                </div>
                                                <div className="ml-4 text-gray-600 text-sm">
                                                    <p>Upload a clear photo of yourself</p>
                                                    <p className="text-xs">JPG, PNG, or GIF (max 5MB)</p>
                                                    {errors.profileImage && <p className="mt-1 text-rose-500 text-sm">{errors.profileImage}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Academic Information Section */}
                                <div className="border-b border-gray-200 pb-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                        <FaGraduationCap className="text-violet-500 mr-2" />
                                        Academic Information
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Course */}
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">
                                                Course
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FaBook className="text-gray-400" />
                                                </div>
                                                <select
                                                    name="courseId"
                                                    value={formData.courseId}
                                                    onChange={handleChange}
                                                    className={`pl-10 w-full px-4 py-3 border ${errors.courseId ? 'border-rose-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none`}
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="">Select your course</option>
                                                    {courses.map(course => (
                                                        <option key={course.id} value={course.id}>
                                                            {course.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            {errors.courseId && <p className="mt-1 text-rose-500 text-sm">{errors.courseId}</p>}
                                        </div>

                                        {/* Semester */}
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">
                                                Semester
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FaUniversity className="text-gray-400" />
                                                </div>
                                                <select
                                                    name="semester"
                                                    value={formData.semester}
                                                    onChange={handleChange}
                                                    className={`pl-10 w-full px-4 py-3 border ${errors.semester ? 'border-rose-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent appearance-none`}
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="">Select current semester</option>
                                                    {semesters.map(sem => (
                                                        <option key={sem} value={sem}>
                                                            Semester {sem}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            {errors.semester && <p className="mt-1 text-rose-500 text-sm">{errors.semester}</p>}
                                        </div>

                                        {/* University Roll No */}
                                        <div className="md:col-span-2">
                                            <label className="block text-gray-700 font-medium mb-2">
                                                University Roll Number
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FaIdCard className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="universityRollNo"
                                                    value={formData.universityRollNo}
                                                    onChange={handleChange}
                                                    className={`pl-10 w-full px-4 py-3 border ${errors.universityRollNo ? 'border-rose-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                                                    placeholder="Enter your university roll number"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            {errors.universityRollNo && <p className="mt-1 text-rose-500 text-sm">{errors.universityRollNo}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Account Information Section */}
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                        <FaLock className="text-violet-500 mr-2" />
                                        Account Information
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Email */}
                                        <div className="md:col-span-2">
                                            <label className="block text-gray-700 font-medium mb-2">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FaEnvelope className="text-gray-400" />
                                                </div>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className={`pl-10 w-full px-4 py-3 border ${errors.email ? 'border-rose-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent`}
                                                    placeholder="Enter your email address"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            {errors.email && <p className="mt-1 text-rose-500 text-sm">{errors.email}</p>}
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FaLock className="text-gray-400" />
                                                </div>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className={`pl-10 w-full px-4 py-3 border ${errors.password ? 'border-rose-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                                                    placeholder="Create a strong password"
                                                    disabled={isSubmitting}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    disabled={isSubmitting}
                                                >
                                                    {showPassword ? (
                                                        <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                                                    ) : (
                                                        <FaEye className="text-gray-400 hover:text-gray-600" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.password && <p className="mt-1 text-rose-500 text-sm">{errors.password}</p>}
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FaLock className="text-gray-400" />
                                                </div>
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className={`pl-10 w-full px-4 py-3 border ${errors.confirmPassword ? 'border-rose-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent`}
                                                    placeholder="Confirm your password"
                                                    disabled={isSubmitting}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    disabled={isSubmitting}
                                                >
                                                    {showConfirmPassword ? (
                                                        <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                                                    ) : (
                                                        <FaEye className="text-gray-400 hover:text-gray-600" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && <p className="mt-1 text-rose-500 text-sm">{errors.confirmPassword}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-violet-600 to-rose-500 text-white font-bold py-4 px-6 rounded-lg hover:from-violet-700 hover:to-rose-600 transition-all duration-300 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                                        disabled={isSubmitting || submitDisabled}
                                    >
                                        {isSubmitting ? (
                                            <ClipLoader size={20} color="#ffffff" />
                                        ) : submitDisabled ? (
                                            "Registration Successful!"
                                        ) : (
                                            "Create Account"
                                        )}
                                    </button>

                                    <p className="mt-4 text-center text-gray-600">
                                        Already have an account?{' '}
                                        <a href="#" className="text-violet-600 hover:text-rose-500 font-medium">
                                            Sign in
                                        </a>
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Right Side - Illustration */}
                        <div className="hidden md:block md:w-1/3 bg-gradient-to-b from-violet-50 to-rose-50 p-8">
                            <div className="h-full flex flex-col justify-center">
                                <div className="text-center mb-8">
                                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 mx-auto">
                                        <img src="/assets/images/university.jpg" alt="" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mt-4">Join Our Academic Community</h3>
                                    <p className="text-gray-600 mt-2">Exchange resources with students across universities</p>
                                </div>

                                <div className="space-y-4 mt-auto">
                                    <div className="flex items-center bg-white p-4 rounded-lg shadow-sm">
                                        <div className="bg-violet-100 p-3 rounded-full mr-4">
                                            <FaBook className="text-violet-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Textbooks</h4>
                                            <p className="text-gray-600 text-sm">Buy and sell used textbooks</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center bg-white p-4 rounded-lg shadow-sm">
                                        <div className="bg-rose-100 p-3 rounded-full mr-4">
                                            <FaGraduationCap className="text-rose-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Study Materials</h4>
                                            <p className="text-gray-600 text-sm">Share notes and resources</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center bg-white p-4 rounded-lg shadow-sm">
                                        <div className="bg-violet-100 p-3 rounded-full mr-4">
                                            <FaUniversity className="text-violet-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">University Network</h4>
                                            <p className="text-gray-600 text-sm">Connect with students nationwide</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}