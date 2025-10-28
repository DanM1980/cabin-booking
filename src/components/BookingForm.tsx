'use client';

import { useState } from 'react';
import { formatDateHebrew, isValidIsraeliPhone, isValidEmail } from '@/lib/utils';

interface BookingFormProps {
  date: Date;
  onSubmit: (data: { name: string; phone: string; email?: string }) => Promise<void>;
  onCancel: () => void;
}

export default function BookingForm({ date, onSubmit, onCancel }: BookingFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'יש להזין שם';
    }

    if (!phone.trim()) {
      newErrors.phone = 'יש להזין מספר טלפון';
    } else if (!isValidIsraeliPhone(phone)) {
      newErrors.phone = 'מספר טלפון לא תקין (דוגמה: 050-1234567)';
    }

    if (email && !isValidEmail(email)) {
      newErrors.email = 'כתובת אימייל לא תקינה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
      });
    } catch (error) {
      console.error('שגיאה בהזמנה:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">הזמנת יום</h2>
      <p className="text-gray-700 text-center mb-6 font-medium">{formatDateHebrew(date)}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700">
            שם מלא <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`input ${errors.name ? 'border-red-500 ring-2 ring-red-500' : ''}`}
            placeholder="הזן שם מלא"
            disabled={isSubmitting}
            autoFocus
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-700">
            טלפון <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`input ${errors.phone ? 'border-red-500 ring-2 ring-red-500' : ''}`}
            placeholder="050-1234567"
            disabled={isSubmitting}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
            אימייל (אופציונלי)
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`input ${errors.email ? 'border-red-500 ring-2 ring-red-500' : ''}`}
            placeholder="example@email.com"
            disabled={isSubmitting}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary flex-1"
          >
            {isSubmitting ? 'מבצע הזמנה...' : 'הזמן עכשיו'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="btn btn-secondary"
          >
            ביטול
          </button>
        </div>
      </form>

      <p className="text-xs text-gray-600 text-center mt-4">
        * שדות חובה
      </p>
    </div>
  );
}

