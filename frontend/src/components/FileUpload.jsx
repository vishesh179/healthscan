import { useCallback, useState } from 'react';

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
];

const ACCEPTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];

export default function FileUpload({ onUpload, loading }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext) && !ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a PDF, PNG, JPG, or JPEG file.';
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be under 10 MB.';
    }
    return null;
  };

  const handleFile = useCallback((file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }
    setError('');
    setSelectedFile(file);
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-health-accent bg-blue-50/50 scale-[1.01]'
            : 'border-slate-200 bg-white hover:border-slate-300 shadow-soft'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleChange}
        />

        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div>
            <p className="text-lg font-semibold text-slate-700">
              Drag & drop your blood test report
            </p>
            <p className="text-sm text-slate-500 mt-1">
              or click to browse — PDF, PNG, JPG supported
            </p>
          </div>

          {selectedFile && (
            <div className="mt-2 px-4 py-2 bg-slate-100 rounded-xl">
              <p className="text-sm font-medium text-slate-800">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
      )}

      <div className="mt-6 flex justify-center">
        <button
          className="btn-primary min-w-[200px]"
          disabled={!selectedFile || loading}
          onClick={(e) => {
            e.stopPropagation();
            handleSubmit();
          }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Uploading...
            </span>
          ) : (
            'Analyze My Report'
          )}
        </button>
      </div>
    </div>
  );
}
