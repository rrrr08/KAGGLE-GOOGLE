# Student Features - Setup & Usage Guide

## Overview

PRASHIKSHAN now includes a comprehensive student portal with AI-powered personalized learning features. Students can view their weak areas, access AI-generated practice materials, take adaptive quizzes, and track their progress over time.

## What's New

### For Students
- **Personalized Dashboard**: See your weak topics, recent quiz scores, and upcoming assignments
- **AI-Generated Practice Materials**: Get custom practice content tailored to your weak areas
- **Adaptive Quizzes**: Take AI-generated quizzes that focus on topics you need to improve
- **Progress Tracking**: Visualize your learning journey with charts and analytics
- **Instant Feedback**: Get detailed explanations for quiz answers

### For Teachers
- **Class Codes**: Each class now has a unique code for student enrollment
- **Student Analytics**: View student progress and quiz attempts
- **Assignment System**: Assign practice materials to individual students or entire classes

## Setup Instructions

### 1. Database Migration

Run the following command to update your database schema:

```bash
cd apps/tta-1
npx prisma db push
```

This will add the new tables:
- `StudentProfile` - Links users to student data
- `Assignment` - Teacher-assigned work
- `Quiz` - AI-generated assessments
- `QuizAttempt` - Student quiz submissions
- `PracticeMaterial` - AI-generated practice content

### 2. Environment Variables

Ensure your `.env.local` file includes:

```bash
DATABASE_URL="your-postgresql-connection-string"
GEMINI_API_KEY="your-gemini-api-key"
JWT_SECRET="your-secret-key-for-jwt-tokens"
```

### 3. Install Dependencies

Dependencies should already be installed, but if needed:

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3003`

## Usage Guide

### For Teachers

#### 1. Create a Class
- Log in to the teacher portal
- Create a new class
- Note the **Class Code** - share this with your students

#### 2. Upload Student Data
- Upload CSV files with student performance data
- The AI will analyze and identify weak topics
- Students will see personalized recommendations based on this data

#### 3. Assign Practice Materials
- Generate practice materials for specific topics
- Assign them to individual students or the entire class

### For Students

#### 1. Sign Up
- Go to `/auth`
- Click "Sign Up"
- Select "Student" as your role
- Enter the **Class Code** provided by your teacher
- Fill in your details and create an account

#### 2. Dashboard
- After logging in, you'll see your personalized dashboard at `/student/dashboard`
- View your weak topics identified by AI
- See recent quiz scores
- Check upcoming assignments

#### 3. Practice Materials
- Click "Practice" on any weak topic
- AI will generate personalized practice content with:
  - Clear explanations
  - Worked examples
  - Practice exercises with hints and answers

#### 4. Take Quizzes
- Click "Take Quiz" on any topic
- Answer AI-generated questions
- Get instant feedback with detailed explanations
- See your score and review each answer

#### 5. Track Progress
- Click "My Progress" in the header
- View charts showing:
  - Score trends over time
  - Topic-wise performance
  - Improvement indicators
- Filter by time range (7, 30, or 90 days)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account (teacher or student)
- `POST /api/auth/login` - Login and get JWT token

### Student Endpoints (Require Authentication)
- `GET /api/student/dashboard?studentId={id}` - Get dashboard data
- `POST /api/student/practice/generate` - Generate practice material
- `POST /api/student/quiz/generate` - Generate adaptive quiz
- `POST /api/student/quiz/submit` - Submit quiz answers
- `GET /api/student/progress?studentId={id}&timeRange={7d|30d|90d}` - Get progress analytics

## Features

### AI-Powered Personalization
- **Practice Materials**: Generated using Google Gemini based on student's weak topics
- **Adaptive Quizzes**: Questions tailored to areas where the student struggles
- **Difficulty Levels**: Content adapts to student performance

### Progress Tracking
- **Time Series Charts**: Visualize score trends over time
- **Topic Breakdown**: See performance in each topic
- **Improvement Indicators**: Track which topics are improving or declining

### Secure Authentication
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Role-Based Access**: Students can only access their own data

## Database Schema

### New Models

```prisma
model StudentProfile {
  id          String   @id
  userId      String   @unique
  studentId   String   @unique
  grade       String?
  parentEmail String?
  // Relations: user, student, quizAttempts, assignments
}

model Quiz {
  id             String   @id
  title          String
  topic          String
  difficulty     String
  questionsJson  String   // JSON array
  classId        String
  createdById    String
  // Relations: class, createdBy, attempts
}

model QuizAttempt {
  id          String    @id
  quizId      String
  studentId   String
  answersJson String
  score       Float
  maxScore    Float
  completedAt DateTime?
  // Relations: quiz, student
}

model PracticeMaterial {
  id              String @id
  title           String
  topic           String
  difficulty      String
  contentMarkdown String
  exercisesJson   String // JSON array
  classId         String
  generatedById   String
  // Relations: class, generatedBy, assignments
}

model Assignment {
  id          String    @id
  title       String
  description String
  dueDate     DateTime?
  classId     String
  teacherId   String
  materialId  String?
  studentId   String?
  completed   Boolean
  completedAt DateTime?
  // Relations: class, teacher, material, studentProfile
}
```

## Troubleshooting

### Database Migration Fails
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env.local
- Try `npx prisma migrate reset` (WARNING: This will delete all data)

### AI Generation Fails
- Verify GEMINI_API_KEY is set correctly
- Check API quota limits
- Review console logs for specific errors

### Authentication Issues
- Clear localStorage in browser
- Verify JWT_SECRET is set
- Check token expiration (default: 7 days)

### Charts Not Displaying
- Ensure recharts is installed: `npm install recharts`
- Check browser console for errors
- Verify progress data is being returned from API

## Next Steps

### Recommended Enhancements
1. **Email Notifications**: Notify students of new assignments
2. **Parent Portal**: Allow parents to view student progress
3. **Gamification**: Add badges and achievements
4. **Collaborative Learning**: Enable peer-to-peer study groups
5. **Mobile App**: Create React Native version

## Support

For issues or questions:
1. Check the console logs for errors
2. Review the API responses in Network tab
3. Verify database schema matches expected structure
4. Ensure all environment variables are set correctly
