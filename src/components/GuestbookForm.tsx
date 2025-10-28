'use client';

import { useState } from 'react';

interface GuestbookFormProps {
  onSubmit: (data: { name: string; message: string }) => Promise<void>;
  onCancel: () => void;
}

export default function GuestbookForm({ onSubmit, onCancel }: GuestbookFormProps) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !message.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        message: message.trim(),
      });
      setName('');
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 relative">
      {/* כפתור סגירה */}
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="סגור"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
        ✍️ כתוב הודעה בספר האורחים
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700">
            שם *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="input"
            placeholder="הכנס את שמך"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1 text-gray-700">
            הודעה *
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={4}
            className="input resize-none"
            placeholder="שתף אותנו בחוויה שלך..."
            required
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1 text-left">
            {message.length}/500
          </p>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading || !name.trim() || !message.trim()}
            className="btn btn-primary w-full"
          >
            {isLoading ? 'שולח...' : 'שלח הודעה'}
          </button>
        </div>
      </form>
    </div>
  );
}

