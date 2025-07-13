import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApiServices from "../../ApiServices";
import toast from "react-hot-toast";

// Reusable loading spinner component
const LoadingSpinner = () => (
  <div 
    className="flex justify-center items-center h-64"
    aria-live="polite" 
    aria-busy="true"
  >
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-violet-600 border-b-2" />
    <span className="sr-only">Loading flashcard data...</span>
  </div>
);

// Basic input sanitization
const sanitizeInput = (value) => value.replace(/<[^>]*>?/gm, '');

export default function StudentCardUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    subjectId: "",
    isPublic: true,
  });
  
  const [subjects, setSubjects] = useState([]);
  const [loadingState, setLoadingState] = useState({
    initial: true,
    submitting: false
  });

  // Fetch data in parallel
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, cardRes] = await Promise.all([
          ApiServices.GetAllSubject({ status: true, limit: 100 }),
          ApiServices.GetFlashCardById(id)
        ]);

        setSubjects(subjectsRes.data?.data || []);
        const card = cardRes.data?.data || {};
        setFormData({
          title: card.title || "",
          subjectId: card.subjectId?._id || card.subjectId || "",
          isPublic: card.isPublic ?? true,
        });
      } catch (err) {
        const subjectError = err?.response?.data?.message || "Failed to load subjects";
        const cardError = err?.response?.data?.message || "Failed to load flashcard";
        toast.error(`${subjectError}. ${cardError}`);
      } finally {
        setLoadingState(prev => ({ ...prev, initial: false }));
      }
    };

    fetchData();
  }, [id]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" 
        ? checked 
        : sanitizeInput(value)  // Sanitize on change
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Additional sanitization before submit
    const sanitizedData = {
      ...formData,
      title: sanitizeInput(formData.title)
    };
    
    setLoadingState(prev => ({ ...prev, submitting: true }));

    try {
      const res = await ApiServices.UpdateFlashCard(id, sanitizedData);
      
      toast.success(res.data?.message || "Flashcard updated successfully!", {
        duration: 2000,
        ariaProps: {
          role: 'status',
          'aria-live': 'polite',
        },
      });
      
      navigate("/student/flashcard/your");
    } catch (err) {
      const errorMessage = err?.response?.data?.message 
        || "Failed to update flashcard. Please try again.";
      
      toast.error(errorMessage, {
        ariaProps: {
          role: 'alert',
          'aria-live': 'assertive',
        },
      });
    } finally {
      setLoadingState(prev => ({ ...prev, submitting: false }));
    }
  };

  if (loadingState.initial) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Update Flash Card</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label 
            htmlFor="titleInput" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            id="titleInput"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            aria-required="true"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
            placeholder="Enter card title"
            maxLength={100}
          />
        </div>

        <div>
          <label 
            htmlFor="subjectSelect" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Subject
          </label>
          <select
            id="subjectSelect"
            name="subjectId"
            value={formData.subjectId}
            onChange={handleChange}
            required
            aria-required="true"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 bg-white"
          >
            <option value="">Select Subject</option>
            {subjects.map((subj) => (
              <option key={subj._id} value={subj._id}>
                {subj.subjectName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            id="visibilityToggle"
            type="checkbox"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
            className="h-4 w-4 text-violet-600 border-gray-300 rounded"
          />
          <label 
            htmlFor="visibilityToggle" 
            className="ml-2 block text-sm text-gray-700"
          >
            Make this flashcard public
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loadingState.submitting}
            aria-disabled={loadingState.submitting}
            className={`px-6 py-3 rounded-lg text-white font-medium transition duration-200 shadow-md ${
              loadingState.submitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-violet-600 hover:bg-violet-700"
            }`}
          >
            {loadingState.submitting ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-white rounded-full" />
                Updating...
              </span>
            ) : (
              "Update Flash Card"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}