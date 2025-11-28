# TTA-1 (The Teacher's Teacher Assistant)

A Next.js-based multi-agent system that analyzes student performance data and automatically improves teaching materials using AI.

## Features

- **Agent A (Insight Analyst)**: Analyzes CSV data to identify class trends and at-risk students
- **Agent B (Curriculum Auditor)**: Uses Google Gemini AI to audit lessons against standards
- **Agent C (Content Architect)**: Uses Google Gemini AI to rewrite and improve lesson content
- **Iterative Validation**: Automatically refines lessons until they meet quality thresholds
- **Modern UI**: Built with Next.js 14, TypeScript, and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Prisma + SQLite (dev) / PostgreSQL (prod)
- **AI**: Google Gemini API
- **Auth**: NextAuth.js v5

## Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API key ([Get one here](https://ai.google.dev/))

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with:
   ```bash
   DATABASE_URL="file:./dev.db"
   GEMINI_API_KEY="your-gemini-api-key"
   NEXTAUTH_SECRET="your-secret-key"
   MAX_ITERATIONS=5
   VALIDATION_THRESHOLD=80
   ```

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Usage

### API Endpoint

**POST** `/api/analysis/run`

Upload a CSV file with student data and get an improved lesson plan.

**Request (multipart/form-data)**:
- `file`: CSV file with columns: `student_id`, `question_id`, `score`, `max_score`, `topic_tag` (optional)
- `class_id`: Class identifier
- `teacher_id`: Teacher identifier
- `initial_lesson`: Initial lesson text

**Response**:
```json
{
  "run_id": "uuid",
  "final_score": 85,
  "final_draft": "improved lesson text...",
  "agent_a_summary": { ... },
  "history": [ ... ],
  "passed": true
}
```

### Testing with Sample Data

A sample CSV is provided in `public/sample.csv`. You can test the API using curl:

```bash
curl -X POST http://localhost:3000/api/analysis/run \
  -F "file=@public/sample.csv" \
  -F "class_id=7A" \
  -F "teacher_id=T1" \
  -F "initial_lesson=Today we will learn about equations."
```

## Project Structure

```
tta-1/
├── app/
│   ├── api/
│   │   └── analysis/
│   │       └── run/
│   │           └── route.ts
│   └── page.tsx
├── lib/
│   ├── agents/
│   │   ├── agent-a.ts
│   │   ├── agent-b.ts
│   │   └── agent-c.ts
│   ├── orchestrator/
│   │   └── workflow.ts
│   ├── ai/
│   │   ├── gemini.ts
│   │   └── prompts.ts
│   └── utils/
│       ├── csv-parser.ts
│       └── validation.ts
├── types/
│   ├── agent.ts
│   └── student.ts
└── prisma/
    └── schema.prisma
```

## How It Works

1. **Upload CSV**: Teacher uploads student performance data
2. **Agent A Analyzes**: Identifies weak topics and at-risk students
3. **Agent B Audits**: Compares lesson against curriculum standards using Gemini AI
4. **Validation**: Scores the lesson (0-100) across multiple dimensions
5. **Agent C Rewrites**: If score < 80, Gemini AI improves the lesson
6. **Iterate**: Repeat steps 3-5 up to 5 times until validation passes
7. **Return Result**: Final improved lesson with full audit trail

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.
