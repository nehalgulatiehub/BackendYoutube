import React, { useState } from 'react';

function DashBoardUploadVideoModal({ handleUploadVideo, handleClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!title.trim() || !description.trim() || !videoFile || !thumbnail) {
      alert('Please fill all fields and select both video and thumbnail');
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('videoFile', videoFile); // Actual File object
    formData.append('thumbnail', thumbnail); // Actual File object

    // Get video name and size for UI display
    const videoName = videoFile.name;
    const videoSize = formatFileSize(videoFile.size);

    // Call parent handler with FormData
    handleUploadVideo(formData, videoName, videoSize);

    // Reset form
    setTitle('');
    setDescription('');
    setVideoFile(null);
    setThumbnail(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full max-w-lg bg-[#121212] p-6 rounded-lg">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:text-gray-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Upload Video</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              className="w-full bg-[#2a2a2a] text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-[#ae7aff]"
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
              rows={4}
              className="w-full bg-[#2a2a2a] text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-[#ae7aff]"
              required
            />
          </div>

          {/* Video File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Video File *
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
              className="w-full bg-[#2a2a2a] text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-[#ae7aff] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#ae7aff] file:text-black hover:file:bg-[#9c6cee]"
              required
            />
            {videoFile && (
              <p className="text-sm text-gray-400 mt-2">
                Selected: {videoFile.name} ({formatFileSize(videoFile.size)})
              </p>
            )}
          </div>

          {/* Thumbnail Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Thumbnail *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files[0])}
              className="w-full bg-[#2a2a2a] text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-[#ae7aff] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#ae7aff] file:text-black hover:file:bg-[#9c6cee]"
              required
            />
            {thumbnail && (
              <p className="text-sm text-gray-400 mt-2">
                Selected: {thumbnail.name}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#ae7aff] text-black font-semibold px-4 py-2 rounded hover:bg-[#9c6cee]"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DashBoardUploadVideoModal;
