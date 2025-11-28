# TTA-1 Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd tta-1
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database (SQLite for development)
DATABASE_URL="file:./dev.db"

# Google Gemini API Key (Get from https://ai.google.dev/)
GEMINI_API_KEY="your-gemini-api-key-here"

# NextAuth (generate secret with: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# App Configuration
MAX_ITERATIONS=5
VALIDATION_THRESHOLD=80
NODE_ENV="development"
```

### 3. Initialize Database
```bash
npm run db:push
```

### 4. Test the System

Run the test workflow to verify everything works:
```bash
npm test
```

This will:
- Load the sample CSV from `public/sample.csv`
- Analyze student performance
- Run the multi-agent workflow
- Show the improved lesson plan

### 5. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Testing the API

### Using curl:
```bash
curl -X POST http://localhost:3000/api/analysis/run \
  -F "file=@public/sample.csv" \
  -F "class_id=7A" \
  -F "teacher_id=T1" \
  -F "initial_lesson=Today we will learn about equations. Solve x + 5 = 10."
```

### Using Postman:
1. Create a new POST request to `http://localhost:3000/api/analysis/run`
2. Select Body → form-data
3. Add fields:
   - `file` (File): Select `public/sample.csv`
   - `class_id` (Text): `7A`
   - `teacher_id` (Text): `T1`
   - `initial_lesson` (Text): Your lesson text
4. Send request

## Project Structure

```
tta-1/
├── app/
│   ├── api/analysis/run/route.ts    # Main API endpoint
│   └── page.tsx                      # Home page
├── lib/
│   ├── agents/
│   │   ├── agent-a.ts               # CSV Analysis
│   │   ├── agent-b.ts               # Gemini Auditor
│   │   └── agent-c.ts               # Gemini Architect
│   ├── orchestrator/workflow.ts     # Main workflow
│   ├── ai/
│   │   ├── gemini.ts                # Gemini client
│   │   └── prompts.ts               # AI prompts
│   ├── utils/
│   │   ├── csv-parser.ts            # CSV parsing
│   │   └── validation.ts            # Scoring logic
│   └── db/client.ts                 # Prisma client
├── types/
│   ├── agent.ts                     # Agent types
│   └── student.ts                   # Student types
├── prisma/schema.prisma             # Database schema
├── public/sample.csv                # Test data
└── test-workflow.ts                 # Test script
```

## How It Works

1. **Upload CSV**: Teacher uploads student performance data
2. **Agent A**: Analyzes data, finds weak topics and at-risk students
3. **Agent B**: Uses Gemini AI to audit lesson against standards
4. **Validation**: Scores lesson 0-100 across 5 dimensions
5. **Agent C**: If score < 80, Gemini AI rewrites the lesson
6. **Iterate**: Repeat 3-5 up to 5 times until passing
7. **Return**: Final improved lesson with full history

## Validation Scoring

Lessons are scored out of 100 points:
- **Standards Coverage** (40 pts): How well it covers curriculum objectives
- **Targeting** (20 pts): Addresses identified student weaknesses
- **Readability** (15 pts): Clear structure and appropriate length
- **Assessment** (15 pts): Includes examples and practice problems
- **Safety** (10 pts): Appropriate content

Threshold: 80/100 to pass

## Troubleshooting

### Prisma Issues
If you see "Environment variable not found: DATABASE_URL":
1. Make sure `.env.local` exists with `DATABASE_URL="file:./dev.db"`
2. Run `npm run db:push`

### Gemini API Errors
- Verify your API key is correct in `.env.local`
- Check you have credits at https://ai.google.dev/
- The system has fallback mock responses if API fails

### CSV Parsing Errors
Required columns: `student_id`, `question_id`, `score`, `max_score`
Optional: `topic_tag`, `student_name`, `timestamp`, `item_text`

## Next Steps

- [ ] Add authentication (NextAuth.js)
- [ ] Build UI components for dashboard
- [ ] Add database persistence for runs
- [ ] Create student profile pages
- [ ] Deploy to Vercel

## License
MIT
