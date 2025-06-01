import { useState } from 'react';
import axios from 'axios';


const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`
  }
});

export default function Adminpage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [subjects, setSubjects] = useState(['']);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const classes = [
    'LKG', 'UKG', 'PREP',
    'Class-I', 'Class-II', 'Class-III', 'Class-IV', 'Class-V',
    'Class-VI', 'Class-VII', 'Class-VIII', 'Class-IX', 'Class-X'
  ];

  const validateSubjects = (subjects) => {
    const newErrors = [];
    let isValid = true;
    const seenSubjects = new Set();

    subjects.forEach((subject, index) => {
      const trimmed = subject.trim();
      if (!trimmed) {
        newErrors[index] = 'Subject name is required';
        isValid = false;
      } else if (trimmed.length < 2) {
        newErrors[index] = 'Minimum 2 characters required';
        isValid = false;
      } else if (seenSubjects.has(trimmed.toLowerCase())) {
        newErrors[index] = 'Duplicate subject';
        isValid = false;
      } else {
        newErrors[index] = '';
        seenSubjects.add(trimmed.toLowerCase());
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleAddSubject = () => {
    setSubjects([...subjects, '']);
    setErrors([...errors, '']);
  };

  const handleRemoveSubject = (index) => {
    if (subjects.length === 1) return;
    const newSubjects = subjects.filter((_, i) => i !== index);
    const newErrors = errors.filter((_, i) => i !== index);
    setSubjects(newSubjects);
    setErrors(newErrors);
  };

  const handleSubjectChange = (index, value) => {
    const newSubjects = [...subjects];
    newSubjects[index] = value;
    setSubjects(newSubjects);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateSubjects(subjects)) return;

    setIsLoading(true);
    try {
      const payload = {
        class: selectedClass,
        subjects: subjects.map(s => s.trim()).filter(s => s)
      };

      await api.post('/subjects', payload);
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        setShowModal(false);
        setSubjects(['']);
      }, 1500);
    } catch (error) {
      if (error.response) {
        setErrors([error.response.data?.message || 'Server error.']);
        console.error('API Error:', error.response);
      } else if (error.request) {
        setErrors(['No response from server. Check your backend and CORS settings.']);
        console.error('No response:', error.request);
      } else {
        setErrors([error.message || 'Submission failed. Please try again.']);
        console.error('Error:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Success Popup (Toast) */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed top-4 right-4 z-50 p-4 bg-green-100 border border-green-400 text-green-900 rounded-lg shadow-lg animate-fade-in-out">
            Subjects saved successfully!
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-blue-400 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Class Subject Management
        </h1>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a class</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowModal(true)}
          disabled={!selectedClass}
          className={`px-4 py-2 rounded-md ${
            selectedClass
              ? 'bg-violet-600 text-white'
              : 'bg-gray-300 cursor-not-allowed'
          } transition-colors`}
        >
          Add Subjects
        </button>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <form onSubmit={handleSubmit}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Add Subjects for {selectedClass}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {subjects.map((subject, index) => (
                    <div key={index}>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => handleSubjectChange(index, e.target.value)}
                          className={`flex-1 p-2 border rounded-md ${
                            errors[index] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder={`Subject ${index + 1}`}
                        />
                        {subjects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(index)}
                            className="px-3 text-red-600 hover:bg-red-50 rounded-md"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      {errors[index] && (
                        <p className="text-red-500 text-sm mt-1">{errors[index]}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="w-full py-2 text-violet-600  rounded-md"
                  >
                    + Add Another Subject
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2 text-white rounded-md ${
                      isLoading
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? 'Saving...' : 'Save Subjects'}
                  </button>
                </div>
                {errors[0] && (
                  <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md">
                    {errors[0]}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
