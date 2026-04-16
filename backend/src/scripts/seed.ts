import prisma from '../lib/prisma.js';
import { hashPassword } from '../utils/helpers.js';

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@rwandapolytechnic.edu' },
    update: {},
    create: {
      email: 'admin@rwandapolytechnic.edu',
      password: await hashPassword('Admin@123456'),
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      active: true,
    },
  });

  console.log(`✓ Created admin user: ${adminUser.email}`);

  // Create sample programs
  const programs = [
    {
      code: 'CS101',
      name: 'Bachelor of Science in Computer Science',
      college: 'College of Science and Technology',
      capacity: 50,
      acceptsReb: true,
      acceptsTvet: true,
      minMathSkill: 60,
      minTechnicalSkill: 55,
      minScienceSkill: 50,
      minCommunication: 50,
      minProblemSolving: 55,
      mathWeight: 0.3,
      technicalWeight: 0.35,
      scienceWeight: 0.15,
      communicationWeight: 0.1,
      problemSolvingWeight: 0.1,
    },
    {
      code: 'ENG101',
      name: 'Bachelor of Science in Civil Engineering',
      college: 'College of Engineering',
      capacity: 40,
      acceptsReb: true,
      acceptsTvet: true,
      minMathSkill: 65,
      minTechnicalSkill: 60,
      minScienceSkill: 60,
      minCommunication: 45,
      minProblemSolving: 60,
      mathWeight: 0.35,
      technicalWeight: 0.3,
      scienceWeight: 0.2,
      communicationWeight: 0.05,
      problemSolvingWeight: 0.1,
    },
    {
      code: 'BUS101',
      name: 'Bachelor of Business Administration',
      college: 'College of Business',
      capacity: 60,
      acceptsReb: true,
      acceptsTvet: false,
      minMathSkill: 50,
      minTechnicalSkill: 40,
      minScienceSkill: 40,
      minCommunication: 60,
      minProblemSolving: 50,
      mathWeight: 0.2,
      technicalWeight: 0.1,
      scienceWeight: 0.1,
      communicationWeight: 0.4,
      problemSolvingWeight: 0.2,
    },
  ];

  for (const program of programs) {
    const created = await prisma.program.upsert({
      where: { code: program.code },
      update: {},
      create: program,
    });
    console.log(`✓ Created program: ${created.name}`);
  }

  console.log('✅ Database seeding complete!');
}

main()
  .catch(err => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
