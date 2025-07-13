import { useState } from "react";
import ApiServices from "../../ApiServices";

export default function StudentUpdatePassword() {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: "", text: "" });

        // Validation
        if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
            setMessage({ type: "error", text: "All fields are required" });
            setIsSubmitting(false);
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: "error", text: "New password and confirm password do not match" });
            setIsSubmitting(false);
            return;
        }

        if (formData.oldPassword === formData.newPassword) {
            setMessage({ type: "error", text: "New password must be different from old password" });
            setIsSubmitting(false);
            return;
        }

        ApiServices.UpdatePassword({
            _id: userData._id,
            ...formData
        })
        .then((res) => {
            setMessage({ 
                type: "success", 
                text: res.data.message || "Password updated successfully!" 
            });
            setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        })
        .catch((err) => {
            const errorMsg = err.response?.data?.message || "Failed to update password";
            setMessage({ type: "error", text: errorMsg });
        })
        .finally(() => {
            setIsSubmitting(false);
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-violet-100 py-12 px-4 sm:px-6">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-violet-600 to-rose-600 py-6 px-6 text-center">
                        <h1 className="text-2xl font-bold text-white">Update Password</h1>
                        <p className="text-violet-100 mt-1">Secure your account with a new password</p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-8">
                        {message.text && (
                            <div className={`mb-6 p-3 rounded-lg text-center ${
                                message.type === "success" 
                                    ? "bg-green-100 text-green-700" 
                                    : "bg-rose-100 text-rose-700"
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Old Password */}
                            <div>
                                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    id="oldPassword"
                                    name="oldPassword"
                                    value={formData.oldPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
                                    placeholder="Enter your current password"
                                />
                            </div>

                            {/* New Password */}
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
                                    placeholder="Create a new password"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
                                    placeholder="Confirm your new password"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-3 px-4 rounded-lg font-medium text-white shadow-md transition-all ${
                                        isSubmitting
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 hover:shadow-lg"
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating Password...
                                        </span>
                                    ) : "Update Password"}
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500">
                                Use a strong password with a mix of letters, numbers, and symbols
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}