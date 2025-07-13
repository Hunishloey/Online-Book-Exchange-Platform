import React, { useEffect, useState } from "react";
import ApiServices from "../../ApiServices";
import { useParams } from "react-router-dom";

export default function StudentUpdateMaterial() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    materialTypeId: '',
    subjectId: ''
  });
  const [subjects, setSubjects] = useState([]);
  const [materialType, setMaterialType] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch subjects and material types
    ApiServices.GetAllSubject({ status: true, limit: 100 })
      .then((res) => {
        setSubjects(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });

    ApiServices.GetAllMaterialType({ status: true, limit: 100 })
      .then((res) => {
        setMaterialType(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });

    // Fetch material data
    ApiServices.GetMaterialById(id)
      .then((response) => {
        const materialData = response.data.data;
        setFormData({
          title: materialData.title,
          description: materialData.description || '',
          price: materialData.price,
          materialTypeId: materialData.materialTypeId?._id || materialData.materialTypeId,
          subjectId: materialData.subjectId?._id || materialData.subjectId
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }, [id]);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.materialTypeId) newErrors.materialTypeId = 'Material type is required';
    if (!formData.subjectId) newErrors.subjectId = 'Subject is required';
    
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
      const response = await ApiServices.UpdateMaterial(id, formData);
      console.log("Update successful:", response.data.data);
      setSuccess(true);
      
      // Optional: Reset success message after delay
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Update failed", error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to update material. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-rose-50 to-violet-50 py-6 px-8 border-b border-rose-100">
        <h1 className="text-2xl font-bold text-gray-800">Update Study Material</h1>
        <p className="text-gray-600 mt-1">
          Update your study material information
        </p>
      </div>
      
      <form onSubmit={submitHandler} className="p-6">
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            Material updated successfully!
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="Material title"
              className={`w-full px-4 py-2.5 rounded-lg border ${
                errors.title ? 'border-rose-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
              value={formData.title}
              onChange={handleInputChange}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-rose-600">{errors.title}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹)
            </label>
            <input
              type="number"
              name="price"
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              value={formData.price}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material Type <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                name="materialTypeId"
                className={`w-full px-4 py-2.5 rounded-lg appearance-none border ${
                  errors.materialTypeId ? 'border-rose-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                value={formData.materialTypeId}
                onChange={handleInputChange}
              >
                <option value="">Select Material Type</option>
                {materialType.map(type => (
                  <option key={type._id} value={type._id}>
                    {type.typeName}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {errors.materialTypeId && (
              <p className="mt-1 text-sm text-rose-600">{errors.materialTypeId}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                name="subjectId"
                className={`w-full px-4 py-2.5 rounded-lg appearance-none border ${
                  errors.subjectId ? 'border-rose-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
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
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            placeholder="Describe your material..."
            rows="3"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>
        
        {errors.submit && (
          <div className="mb-6 p-3 bg-rose-50 text-rose-700 rounded-lg text-sm">
            {errors.submit}
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center justify-center px-6 py-3 rounded-lg text-white font-medium ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700'
            } transition-all duration-300 shadow-md hover:shadow-lg`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              <>
                Update Material
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