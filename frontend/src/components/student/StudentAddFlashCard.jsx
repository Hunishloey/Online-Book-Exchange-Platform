import React, { useState, useEffect } from "react";
import ApiServices from "../../ApiServices";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function StudentAddFlashCard() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        subjectId: ''
    });
    const [flashcards, setFlashcards] = useState([
        { front: '', back: '' }
    ]);
    const [isPublic, setIsPublic] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Fetch subjects
        ApiServices.GetAllSubject({ status: true, limit: 100 })
            .then((res) => {
                setSubjects(res.data.data);
            })
            .catch((err) => {
                console.log(err);
                toast.error('Failed to load subjects');
            });
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleFlashcardChange = (index, field, value) => {
        const newFlashcards = [...flashcards];
        newFlashcards[index] = {
            ...newFlashcards[index],
            [field]: value
        };
        setFlashcards(newFlashcards);
        
        // Clear error if both fields are filled
        if (errors.flashcards && errors.flashcards[index]) {
            if (value.trim() !== '') {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    if (newErrors.flashcards) {
                        delete newErrors.flashcards[index];
                        // If no more errors in flashcards, remove the entire key
                        if (Object.keys(newErrors.flashcards).length === 0) {
                            delete newErrors.flashcards;
                        }
                    }
                    return newErrors;
                });
            }
        }
    };

    const addFlashcard = () => {
        if (flashcards.length < 50) {
            setFlashcards([...flashcards, { front: '', back: '' }]);
        }
    };

    const removeFlashcard = (index) => {
        if (flashcards.length > 1) {
            const newFlashcards = [...flashcards];
            newFlashcards.splice(index, 1);
            setFlashcards(newFlashcards);
            
            // Remove any associated error
            setErrors(prev => {
                const newErrors = { ...prev };
                if (newErrors.flashcards && newErrors.flashcards[index]) {
                    delete newErrors.flashcards[index];
                    // If no more errors in flashcards, remove the entire key
                    if (Object.keys(newErrors.flashcards).length === 0) {
                        delete newErrors.flashcards;
                    }
                }
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let hasCardError = false;
        const cardErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.subjectId) newErrors.subjectId = 'Subject is required';
        
        // Validate each flashcard
        flashcards.forEach((card, index) => {
            if (!card.front.trim() || !card.back.trim()) {
                hasCardError = true;
                cardErrors[index] = 'Both front and back are required';
            }
        });
        
        if (hasCardError) {
            newErrors.flashcards = cardErrors;
        }
        
        // Check if at least one card is added
        if (flashcards.length === 0) {
            newErrors.flashcards = { 0: 'At least one flashcard is required' };
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!validateForm()) {
            setIsSubmitting(false);
            return;
        }

        try {
            // Step 1: Create the flashcard set
            const setPayload = {
                title: formData.title,
                subjectId: formData.subjectId,
                isPublic
            };

            const setResponse = await ApiServices.AddFlashCard(setPayload);
            
            if (!setResponse.data.success) {
                throw new Error('Flashcard set creation failed');
            }
            
            const flashCardId = setResponse.data.data._id; // Assuming the response returns the ID
            
            // Step 2: Add each flashcard item
            const validFlashcards = flashcards.filter(card => 
                card.front.trim() !== '' && card.back.trim() !== ''
            );
            
            // Create an array of promises for each flashcard item
            const itemPromises = validFlashcards.map(card => 
                ApiServices.AddFlashCardItem({
                    flashCardId,
                    question: card.front,
                    answer: card.back
                })
            );
            
            // Wait for all items to be created
            const itemResponses = await Promise.all(itemPromises);
            
            // Check if all items were created successfully
            const allItemsCreated = itemResponses.every(res => res.data.success);
            
            if (!allItemsCreated) {
                throw new Error('Some flashcards failed to create');
            }
            
            toast.success('Flashcard set created successfully!');
            setTimeout(() => navigate('/student/flashcard/your'), 1000);
        } catch (error) {
            console.error("Creation failed", error);
            toast.error('Failed to create flashcard set. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            
            <div className="bg-gradient-to-r from-cyan-50 to-rose-50 py-6 px-8 border-b border-cyan-100">
                <h1 className="text-2xl font-bold text-gray-800">Create New Flashcard Set</h1>
                <p className="text-gray-600 mt-1">
                    Create a new set of flashcards to enhance your learning
                </p>
            </div>

            <form onSubmit={submitHandler} className="p-6">
                <div className="grid grid-cols-1 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            placeholder="Flashcard set title"
                            className={`w-full px-4 py-2.5 rounded-lg border ${errors.title ? 'border-rose-500' : 'border-gray-300'
                                } focus:ring-2 focus:ring-rose-500 focus:border-transparent`}
                            value={formData.title}
                            onChange={handleInputChange}
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-rose-600">{errors.title}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                name="subjectId"
                                className={`w-full px-4 py-2.5 rounded-lg appearance-none border ${errors.subjectId ? 'border-rose-500' : 'border-gray-300'
                                    } focus:ring-2 focus:ring-rose-500 focus:border-transparent`}
                                value={formData.subjectId}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Subject</option>
                                {subjects.map(subject => (
                                    <option key={subject._id} value={subject._id}>
                                        {subject.subjectName}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        {errors.subjectId && (
                            <p className="mt-1 text-sm text-rose-600">{errors.subjectId}</p>
                        )}
                    </div>
                </div>

                {/* Flashcards Section */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Flashcards <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-xs text-gray-500">
                            {flashcards.filter(card => card.front.trim() && card.back.trim()).length}/{flashcards.length} completed
                        </span>
                    </div>
                    
                    <div className="space-y-4">
                        {flashcards.map((card, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-medium text-gray-700">Card #{index + 1}</h3>
                                    {flashcards.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeFlashcard(index)}
                                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-full"
                                            title="Remove card"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Front (Question)</label>
                                        <textarea
                                            value={card.front}
                                            onChange={(e) => handleFlashcardChange(index, 'front', e.target.value)}
                                            placeholder="Enter question or term"
                                            className={`w-full px-3 py-2 rounded-lg border ${errors.flashcards && errors.flashcards[index] ? 'border-rose-500' : 'border-gray-300'} focus:ring-2 focus:ring-rose-500 focus:border-transparent`}
                                            rows="3"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Back (Answer)</label>
                                        <textarea
                                            value={card.back}
                                            onChange={(e) => handleFlashcardChange(index, 'back', e.target.value)}
                                            placeholder="Enter answer or definition"
                                            className={`w-full px-3 py-2 rounded-lg border ${errors.flashcards && errors.flashcards[index] ? 'border-rose-500' : 'border-gray-300'} focus:ring-2 focus:ring-rose-500 focus:border-transparent`}
                                            rows="3"
                                        />
                                    </div>
                                </div>
                                
                                {errors.flashcards && errors.flashcards[index] && (
                                    <p className="mt-2 text-xs text-rose-600">{errors.flashcards[index]}</p>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <button
                        type="button"
                        onClick={addFlashcard}
                        className="mt-4 flex items-center text-cyan-600 hover:text-cyan-800 font-medium text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Another Card
                    </button>
                    
                    <p className="text-xs text-gray-500 mt-3">
                        Add terms and definitions to create your flashcards. Maximum 50 cards per set.
                    </p>
                </div>

                {/* Public/Private Toggle */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Visibility Status</h3>
                            <p className="text-xs text-gray-500">
                                {isPublic
                                    ? "This flashcard set will be visible to all users"
                                    : "This flashcard set will only be visible to you"}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsPublic(!isPublic)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublic ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isPublic ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        Toggle to make your flashcard set {isPublic ? 'private' : 'public'}
                    </p>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate('/student/flashcards/your')}
                        className="px-6 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex items-center justify-center px-6 py-3 rounded-lg text-white font-medium ${isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-rose-600 to-cyan-600 hover:from-rose-700 hover:to-cyan-700'
                            } transition-all duration-300 shadow-md hover:shadow-lg`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                            </>
                        ) : (
                            <>
                                Create Flashcard Set
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
                
            </form>
        </div>
    );
}