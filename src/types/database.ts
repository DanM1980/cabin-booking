export type DayStatus = 'closed' | 'open' | 'booked';

export type Database = {
  public: {
    Tables: {
      calendar: {
        Row: {
          date: string;
          status: DayStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          date: string;
          status?: DayStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          date?: string;
          status?: DayStatus;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          date: string;
          guest_name: string;
          guest_phone: string;
          guest_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          guest_name: string;
          guest_phone: string;
          guest_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          guest_name?: string;
          guest_phone?: string;
          guest_email?: string | null;
          updated_at?: string;
        };
      };
      guestbook: {
        Row: {
          id: string;
          guest_name: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          guest_name: string;
          message: string;
          created_at?: string;
        };
        Update: {
          guest_name?: string;
          message?: string;
        };
      };
    };
  };
};

export type CalendarDay = Database['public']['Tables']['calendar']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type GuestbookEntry = Database['public']['Tables']['guestbook']['Row'];

