'use client';

import { useState } from 'react';
import { GuestbookEntry as GuestbookEntryType } from '@/types/database';
import { formatDistance } from 'date-fns';
import { he } from 'date-fns/locale';

interface GuestbookEntryProps {
  entry: GuestbookEntryType;
  canDelete: boolean;
  onDelete: () => void;
}

export default function GuestbookEntry({ entry, canDelete, onDelete }: GuestbookEntryProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const timeAgo = formatDistance(new Date(entry.created_at), new Date(), {
    addSuffix: true,
    locale: he,
  });

  const handleDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-lg">👤</span>
          </div>
          <div>
            <p className="font-semibold text-gray-800">{entry.guest_name}</p>
            <p className="text-xs text-gray-500">{timeAgo}</p>
          </div>
        </div>

        {/* כפתור מחיקה - רק אם יש הרשאה */}
        {canDelete && (
          !showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              title="מחק הודעה"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={handleDelete}
                className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                אישור
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                ביטול
              </button>
            </div>
          )
        )}
      </div>

      <p className="text-gray-700 whitespace-pre-wrap break-words">
        {entry.message}
      </p>
    </div>
  );
}

