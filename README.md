# FeedbackPro - Customer Feedback Management System

A modern web application for collecting and managing customer feedback with image uploads, ratings, and an administrative dashboard.

## 🚀 Quick Start

### 1. Setup Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **API** and copy:
   - Project URL
   - Anon public key

### 2. Environment Setup

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://gmalbtmdynusbfeapkwy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWxidG1keW51c2JmZWFwa3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTUzNTYsImV4cCI6MjA2NzU3MTM1Nn0.OdYShXRNTPuAk4tE8VEkQ8GSUe9JKWzg_hPzH04Df44
```

### 3. Install and Run

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Create Admin User

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"**
4. Create user with:
   - **Email**: `admin@example.com`
   - **Password**: `password123`

## 📱 How to Use

### For Customers
1. Visit the homepage
2. Fill out the feedback form
3. Upload before/after images (optional)
4. Rate your experience
5. Submit feedback

### For Admins
1. Click **"Admin Login"** in the header
2. Login with your admin credentials
3. View, search, and manage all feedback
4. Export data to CSV
5. Delete inappropriate feedback

## 🛠️ Features

### Customer Features
- ⭐ Star rating system (1-5 stars)
- 📸 Before/after image uploads
- 📝 Detailed feedback forms
- 📱 Mobile-responsive design
- ✅ Form validation

### Admin Features
- 🔐 Secure authentication
- 📊 Comprehensive dashboard
- 🔍 Search and filter feedback
- 📥 CSV export functionality
- 🗑️ Delete feedback entries
- 🖼️ View uploaded images

## 🏗️ Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Build Tool**: Vite
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── components/
│   ├── FeedbackForm.tsx      # Customer feedback form
│   ├── AdminLogin.tsx        # Admin authentication
│   └── AdminDashboard.tsx    # Admin management panel
├── lib/
│   └── supabase.ts          # Database configuration
└── App.tsx                  # Main application
```

## 🔧 Configuration

### Database Tables
- `feedback_submissions` - Stores all customer feedback
- Built-in Supabase Auth for user management
- `feedback-images` storage bucket for photos

### Environment Variables
```env
VITE_SUPABASE_URL=https://gmalbtmdynusbfeapkwy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWxidG1keW51c2JmZWFwa3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTUzNTYsImV4cCI6MjA2NzU3MTM1Nn0.OdYShXRNTPuAk4tE8VEkQ8GSUe9JKWzg_hPzH04Df44
```

## 🚨 Troubleshooting

### Common Issues

**"Invalid login credentials"**
- Make sure you created the admin user in Supabase Dashboard
- Use exact credentials: `admin@example.com` / `password123`

**"Missing environment variables"**
- Check your `.env` file exists and has correct values
- Restart the dev server after adding environment variables

**Image upload fails**
- Verify Supabase storage bucket `feedback-images` exists
- Check file size (max 5MB) and format (JPEG, PNG, WebP, GIF)

**Database errors**
- Ensure all Supabase migrations have been applied
- Check Row Level Security policies are enabled

## 📊 Data Export

Admins can export all feedback data to CSV format, including:
- Customer information
- Ratings and feedback text
- Image URLs
- Submission dates
- Permission settings

## 🔒 Security

- **Row Level Security (RLS)** enabled on all tables
- **Anonymous users** can only submit feedback
- **Authenticated admins** have full access to manage data
- **Image uploads** are validated for size and type
- **Input validation** prevents malicious data

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify/Vercel
1. Connect your repository
2. Set environment variables in deployment settings
3. Deploy with build command: `npm run build`
4. Set output directory: `dist`

## 📝 License

MIT License - feel free to use this project for your own needs.

## 🆘 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Supabase configuration
3. Ensure admin user exists in Supabase Auth
4. Check environment variables are set correctly

---

**Made with ❤️ using React, TypeScript, and Supabase**
