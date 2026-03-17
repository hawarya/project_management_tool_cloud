import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Upload, File as FileIcon, Download, Trash2, FileText, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

const FileUpload = ({ projectId }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    try {
      const { data } = await api.get(`/files/project/${projectId}`);
      setFiles(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);

    setUploading(true);
    try {
      await api.post('/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchFiles();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <FileIcon className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Project Files</h2>
        <div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className={`flex items-center px-4 py-2 ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'} text-white text-sm font-medium rounded-lg transition-colors shadow-sm`}
          >
            <Upload size={16} className="mr-2" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </label>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-8">
          <FileIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No files uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-600 transition-all hover:shadow-md group">
              <div className="flex items-start mb-3">
                <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg mr-3 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                  {getFileIcon(file.originalName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.originalName}>
                     {file.originalName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                     Added by {file.uploader?.name || 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(file.createdAt), 'MMM d, yyyy')}
                </span>
                <a 
                  href={`http://localhost:5000/uploads/${file.filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
                  title="Download"
                >
                  <Download size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
