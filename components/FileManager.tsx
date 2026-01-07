
import React, { useState } from 'react';
import { SharedFile } from '../types';

const MOCK_FILES: SharedFile[] = [
  { id: 'f1', name: 'Design_System_v2.fig', size: '24.5 MB', type: 'Figma', uploadedBy: 'Alex R.', uploadedAt: 'Nov 24, 2024' },
  { id: 'f2', name: 'Product_Brief.pdf', size: '1.2 MB', type: 'PDF', uploadedBy: 'Sarah M.', uploadedAt: 'Nov 22, 2024' },
  { id: 'f3', name: 'Marketing_Assets.zip', size: '128 MB', type: 'Archive', uploadedBy: 'Mike T.', uploadedAt: 'Nov 20, 2024' },
];

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<SharedFile[]>(MOCK_FILES);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFile: SharedFile = {
        id: Date.now().toString(),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type.split('/')[1] || 'Unknown',
        uploadedBy: 'You',
        uploadedAt: new Date().toLocaleDateString(),
      };
      setFiles([newFile, ...files]);
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Shared Files</h1>
        <label className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition-all text-sm font-semibold shadow-md cursor-pointer inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Upload File
          <input type="file" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">File Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Size</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Uploaded By</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {files.map((file) => (
              <tr key={file.id} className="hover:bg-slate-50 transition-all cursor-pointer group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <span className="text-sm font-medium text-slate-700">{file.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{file.size}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{file.uploadedBy}</td>
                <td className="px-6 py-4 text-sm text-slate-500 text-right">{file.uploadedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileManager;
