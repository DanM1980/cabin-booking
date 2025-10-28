'use client';

import { useState } from 'react';
import { UserData, isValidIsraeliPhone, isValidEmail } from '@/lib/utils';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserData) => void;
  mode?: 'login' | 'edit';
  initialData?: UserData | null;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSubmit,
  mode = 'login',
  initialData
}: LoginModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { name?: string; phone?: string; email?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'שם חובה';
    }

    if (!phone.trim()) {
      newErrors.phone = 'טלפון חובה';
    } else if (!isValidIsraeliPhone(phone)) {
      newErrors.phone = 'מספר טלפון לא תקין';
    }

    if (email && !isValidEmail(email)) {
      newErrors.email = 'כתובת אימייל לא תקינה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* כפתור סגירה */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="סגור"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* תוכן */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">
            {mode === 'edit' ? '✏️' : '👋'}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {mode === 'edit' ? 'ערוך פרטים' : 'ברוך הבא לנופש בארי בגולן'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* שם */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700">
              שם מלא *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              className={`input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="הכנס את שמך המלא"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* טלפון */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-700">
              טלפון *
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors({ ...errors, phone: undefined });
              }}
              className={`input ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="050-1234567"
              dir="ltr"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* אימייל */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
              אימייל (אופציונלי)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              className={`input ${errors.email ? 'border-red-500' : ''}`}
              placeholder="email@example.com"
              dir="ltr"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* כפתור שליחה */}
          <button
            type="submit"
            className="btn btn-primary w-full"
          >
            {mode === 'edit' ? 'שמור שינויים' : 'שמור והמשך'}
          </button>
        </form>

        {/* הערת אבטחה */}
        {mode === 'login' && (
          <p className="text-center text-xs text-gray-500 mt-4">
            🔒 הפרטים נשמרים רק במכשיר שלך
          </p>
        )}
      </div>
    </div>
  );
}

