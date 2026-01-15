import React, { useState } from 'react';

interface EditableAnalysisProps {
  title: string;
  content: string;
  onSave: (newContent: string) => void;
  isAdmin: boolean;
  bgColor?: string;
  borderColor?: string;
  iconColor?: string;
  icon?: React.ReactNode;
  showTitle?: boolean;
}

const EditableAnalysis: React.FC<EditableAnalysisProps> = ({
  title,
  content,
  onSave,
  isAdmin,
  bgColor = 'bg-blue-50',
  borderColor = 'border-blue-500',
  iconColor = 'text-blue-600',
  icon,
  showTitle = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleSave = () => {
    onSave(editedContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  return (
    <div className={`${bgColor} border-l-4 ${borderColor} p-4 rounded`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          {icon && (
            <div className={`flex-shrink-0 ${iconColor}`}>
              {icon}
            </div>
          )}
          <div className={`${icon ? 'ml-3' : ''} flex-1`}>
            {showTitle && (
              <div className="flex items-center justify-between mb-2">
                <h4 className={`text-sm font-medium ${iconColor.replace('text-', 'text-').replace('-600', '-900')}`}>
                  {title}
                </h4>
                {isAdmin && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="ml-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            {!showTitle && isAdmin && !isEditing && (
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}
            {isEditing ? (
              <div>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm leading-relaxed"
                  rows={6}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSave}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    저장
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-900 leading-relaxed">
                {content}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditableAnalysis;
