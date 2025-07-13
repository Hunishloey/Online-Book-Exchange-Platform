import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ApiServices from "../../ApiServices";
import toast from "react-hot-toast";

export default function StudentViewMaterialCard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [material, setMaterial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const response = await ApiServices.GetAllFlashCardsItems({ flashCardId: id, status: true });
        setMaterial(response.data?.data || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load material");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [id]);

  const handlePrev = () => {
    setActiveCard(prev => (prev > 0 ? prev - 1 : material.length - 1));
    setShowAnswer(false);
  };

  const handleNext = () => {
    setActiveCard(prev => (prev < material.length - 1 ? prev + 1 : 0));
    setShowAnswer(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!material.length) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <div className="bg-gray-100 border-2 border-dashed rounded-xl w-32 h-32 mx-auto flex items-center justify-center text-violet-500 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Flashcards Found</h2>
        <p className="text-gray-600 mb-6">This flashcard set doesn't contain any items yet.</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition duration-200 shadow-md"
        >
          Back to Flashcards
        </button>
      </div>
    );
  }

  const currentCard = material[activeCard];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Study Flashcards</h1>
        <div className="bg-violet-100 text-violet-800 px-4 py-2 rounded-full font-medium">
          Card {activeCard + 1} of {material.length}
        </div>
      </div>

      {/* Flashcard Container */}
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl shadow-lg overflow-hidden mb-8">
        {/* Card Content */}
        <div 
          className="min-h-[400px] flex flex-col items-center justify-center p-8 cursor-pointer"
          onClick={() => setShowAnswer(!showAnswer)}
        >
          <div className="text-center max-w-2xl">
            <div className="mb-6">
              <span className="inline-block bg-violet-600 text-white text-xs px-3 py-1 rounded-full mb-4">
                {showAnswer ? "ANSWER" : "QUESTION"}
              </span>
            </div>
            
            <div className="relative">
              <div className={`text-2xl font-bold text-gray-800 transition-all duration-500 ${showAnswer ? 'opacity-0 scale-90 absolute' : 'opacity-100 scale-100'}`}>
                {currentCard.question}
              </div>
              
              <div className={`text-xl text-gray-700 transition-all duration-500 ${showAnswer ? 'opacity-100 scale-100' : 'opacity-0 scale-90 absolute'}`}>
                {currentCard.answer}
              </div>
            </div>
            
            <p className="mt-8 text-violet-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Click card to {showAnswer ? "see question" : "reveal answer"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between mb-8">
        <button
          onClick={handlePrev}
          className="flex items-center px-5 py-2.5 bg-white text-violet-700 border border-violet-300 rounded-lg hover:bg-violet-50 transition duration-200 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition duration-200 shadow-md"
        >
          {showAnswer ? "Show Question" : "Reveal Answer"}
        </button>
        
        <button
          onClick={handleNext}
          className="flex items-center px-5 py-2.5 bg-white text-violet-700 border border-violet-300 rounded-lg hover:bg-violet-50 transition duration-200 shadow-sm"
        >
          Next
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-violet-700">Your progress</span>
          <span className="text-sm font-medium text-violet-700">{Math.round(((activeCard + 1) / material.length) * 100)}%</span>
        </div>
        <div className="w-full bg-violet-200 rounded-full h-2.5">
          <div 
            className="bg-violet-600 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${((activeCard + 1) / material.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Card List Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-800 mb-4">Flashcard Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {material.map((item, index) => (
            <div 
              key={item._id} 
              onClick={() => {
                setActiveCard(index);
                setShowAnswer(false);
              }}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                index === activeCard 
                  ? "border-violet-500 bg-violet-50 shadow-sm" 
                  : "border-gray-200 hover:border-violet-300"
              }`}
            >
              <h4 className="font-medium text-gray-800 truncate mb-2">{item.question}</h4>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Click to view</span>
                {index === activeCard && (
                  <span className="bg-violet-600 text-white text-xs px-2 py-1 rounded-full">
                    Current
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}