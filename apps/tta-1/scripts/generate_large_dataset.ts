import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting data generation...');

  // 1. Create Teacher and Class
  const teacherEmail = 'teacher_demo@example.com';
  let teacher = await prisma.user.findUnique({ where: { email: teacherEmail } });

  if (!teacher) {
    console.log('Creating teacher...');
    teacher = await prisma.user.create({
      data: {
        email: teacherEmail,
        name: 'Demo Teacher',
        passwordHash: 'hashed_password_placeholder', // In real app, hash this
        role: 'TEACHER',
      },
    });
  }

  const className = 'Class 10-A';
  let classObj = await prisma.class.findFirst({
    where: { name: className, teacherId: teacher.id },
  });

  if (!classObj) {
    console.log('Creating class...');
    classObj = await prisma.class.create({
      data: {
        name: className,
        grade: '10th',
        teacherId: teacher.id,
      },
    });
  }

  console.log(`Using Class: ${classObj.name} (${classObj.id})`);

  // 2. Generate Students and CSV Data
  const NUM_STUDENTS = 1000;
  const QUESTIONS_PER_STUDENT = 10;
  const TOTAL_ROWS = NUM_STUDENTS * QUESTIONS_PER_STUDENT; // 10,000 rows

  console.log(`Generating ${NUM_STUDENTS} students and ${TOTAL_ROWS} CSV rows...`);

  const csvRows = [];
  csvRows.push('student_id,question_id,score,max_score');

  // Batch create students to be faster
  // Note: Prisma createMany is supported in SQLite
  const studentsData = [];
  
  for (let i = 1; i <= NUM_STUDENTS; i++) {
    const studentId = `S${i.toString().padStart(4, '0')}`; // S0001, S0002...
    studentsData.push({
      hashedId: studentId,
      name: `Student ${i}`,
      classId: classObj.id,
      skillsJson: '{}',
      notesJson: '[]',
      interventionsJson: '[]',
    });

    // Generate CSV rows for this student
    for (let q = 1; q <= QUESTIONS_PER_STUDENT; q++) {
      const questionId = `Q${q}`;
      const maxScore = 10;
      // Random score between 0 and 10, skewed towards higher scores
      const score = Math.floor(Math.random() * 3) + Math.floor(Math.random() * 8); 
      const finalScore = Math.min(score, maxScore);
      
      csvRows.push(`${studentId},${questionId},${finalScore},${maxScore}`);
    }
  }

  // Upsert students (create if not exists)
  // SQLite doesn't support createMany with skipDuplicates efficiently in all Prisma versions, 
  // but let's try transaction or just loop if needed. 
  // For 1000 records, a loop with Promise.all or transaction is fine.
  
  console.log('Seeding students to database...');
  
  // We'll use a transaction for atomicity
  await prisma.$transaction(
    studentsData.map((s) => 
      prisma.student.upsert({
        where: { hashedId: s.hashedId },
        update: {},
        create: s,
      })
    )
  );

  // 3. Write CSV
  const csvContent = csvRows.join('\n');
  const csvPath = path.join(__dirname, '..', 'student_data.csv');
  
  fs.writeFileSync(csvPath, csvContent);
  
  console.log(`Successfully generated ${TOTAL_ROWS} rows in ${csvPath}`);
  console.log(`Seeded ${NUM_STUDENTS} students in the database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
