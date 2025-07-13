import React, { useEffect, useState } from 'react';
import ApiServices from '../../ApiServices';

export default function StudentAddMaterial() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    materialTypeId: '',
    subjectId: ''
  });
  const [attachements, setAttachments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [materialType, setMaterialType] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileType, setFileType] = useState(null);

  useEffect(() => {
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
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setErrors(prev => ({ ...prev, attachements: null }));
    
    // Validate file count
    if (files.length + attachements.length > 5) {
      setErrors(prev => ({
        ...prev,
        attachements: 'You can only upload up to 5 files'
      }));
      return;
    }
    
    // Validate file types
    const fileTypes = new Set();
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        fileTypes.add('image');
      } else if (file.type === 'application/pdf') {
        fileTypes.add('pdf');
      }
    });
    
    if (fileTypes.size > 1) {
      setErrors(prev => ({
        ...prev,
        attachements: 'All files must be the same type (PDF or Images)'
      }));
      return;
    }
    
    // Set file type for the batch
    const newFileType = files[0]?.type.startsWith('image/') ? 'image' : 'pdf';
    if (fileType && fileType !== newFileType) {
      setErrors(prev => ({
        ...prev,
        attachements: 'All files must be the same type (PDF or Images)'
      }));
      return;
    }
    
    if (!fileType) {
      setFileType(newFileType);
    }
    
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    const newAttachments = [...attachements];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
    
    // Reset file type if all attachements are removed
    if (newAttachments.length === 0) {
      setFileType(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.materialTypeId) newErrors.materialTypeId = 'Material type is required';
    if (!formData.subjectId) newErrors.subjectId = 'Subject is required';
    
    // File validation
    if (attachements.length === 0) {
      newErrors.attachements = 'At least one file is required';
    } else if (attachements.length > 5) {
      newErrors.attachements = 'Maximum 5 files allowed';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("materialTypeId", formData.materialTypeId);
    data.append("subjectId", formData.subjectId);

    console.log(attachements)
    attachements.forEach((file) => {
      data.append("attachements", file);
    });

    try {
      const res = await ApiServices.AddMaterial(data);
      console.log("Success:", res.data);
      // Reset form on success
      setFormData({
        title: '',
        description: '',
        price: 0,
        materialTypeId: '',
        subjectId: ''
      });
      setAttachments([]);
      setFileType(null);
    } catch (err) {
      console.error("Upload failed", err);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to upload material. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render file previews
  const renderFilePreviews = () => {
    return attachements.map((file, index) => {
      const isImage = file.type.startsWith('image/');
      const fileSize = Math.round(file.size / 1024);
      
      return (
        <div 
          key={index} 
          className="relative group bg-white rounded-lg border border-gray-200 p-3 shadow-sm transition-all duration-200 hover:shadow-md"
        >
          {isImage ? (
            <div className="flex items-center">
              <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt={file.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{fileSize} KB</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-16 h-16 flex-shrink-0 rounded-md bg-rose-50 border border-rose-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{fileSize} KB</p>
              </div>
            </div>
          )}
          
          <button
            type="button"
            onClick={() => removeAttachment(index)}
            className="absolute top-2 right-2 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-50"
            aria-label="Remove file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-rose-50 to-violet-50 py-6 px-8 border-b border-rose-100">
        <h1 className="text-2xl font-bold text-gray-800">Upload Study Material</h1>
        <p className="text-gray-600 mt-1">
          Share your notes, presentations, and study resources with other students
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
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
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Attachments <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-gray-500">
              {attachements.length}/5 files • {fileType ? `All must be ${fileType}s` : 'PDF or Images'}
            </span>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold text-violet-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF or images only (max 5 files, all same type)
                  </p>
                </div>
                <input
                  type="file"
                  name="attachements"
                  accept="application/pdf,image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            
            {errors.attachements && (
              <p className="mt-2 text-sm text-rose-600">{errors.attachements}</p>
            )}
          </div>
          
          {attachements.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {renderFilePreviews()}
            </div>
          )}
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
                Uploading...
              </>
            ) : (
              <>
                Upload Material
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}