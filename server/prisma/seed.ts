import 'dotenv/config';
import { prisma } from '../src/config/database.js';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Starting seed...');

  // Clean DB
  console.log('Wiping existing data...');
  await prisma.vote.deleteMany();
  await prisma.forumAnswer.deleteMany();
  await prisma.forumQuestion.deleteMany();
  await prisma.studyMaterial.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.studyGroup.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const passwordHash = await bcrypt.hash('password123', 10);
  console.log('Creating users...');
  
  // Test User
  const testUser = await prisma.user.create({
    data: {
      username: 'TestStudent',
      email: 'test@studyshare.com',
      passwordHash,
      bio: 'Just a test student ready to learn.',
    }
  });

  const users = [testUser];
  for (let i = 0; i < 9; i++) {
    const user = await prisma.user.create({
      data: {
        username: faker.internet.username(),
        email: faker.internet.email(),
        passwordHash,
        bio: faker.person.bio(),
      }
    });
    users.push(user);
  }

  // Create Groups
  console.log('Creating groups...');
  const groups = [];
  for (let i = 0; i < 5; i++) {
    const creator = users[Math.floor(Math.random() * users.length)];
    const group = await prisma.studyGroup.create({
      data: {
        title: faker.company.catchPhrase() + ' Study Group',
        description: faker.lorem.paragraph(),
        createdById: creator.id,
        members: {
          create: {
            userId: creator.id,
            role: 'OWNER'
          }
        }
      }
    });
    groups.push(group);
  }

  // Add members to groups
  console.log('Adding group members...');
  for (const group of groups) {
    const numMembers = faker.number.int({ min: 2, max: 6 });
    const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
    const membersToAdd = shuffledUsers.slice(0, numMembers).filter(u => u.id !== group.createdById);
    
    for (const member of membersToAdd) {
      await prisma.groupMember.create({
        data: {
          userId: member.id,
          groupId: group.id,
          role: 'MEMBER'
        }
      });
    }
  }

  // Create Materials
  console.log('Creating materials...');
  for (let i = 0; i < 15; i++) {
    const uploader = users[Math.floor(Math.random() * users.length)];
    const group = Math.random() > 0.5 ? groups[Math.floor(Math.random() * groups.length)] : null;
    
    await prisma.studyMaterial.create({
      data: {
        title: faker.system.fileName(),
        fileUrl: faker.image.url(), // mock url for now
        fileName: faker.system.fileName(),
        fileSize: faker.number.int({ min: 1024, max: 50 * 1024 * 1024 }),
        mimeType: 'application/pdf',
        uploadedById: uploader.id,
        groupId: group?.id,
      }
    });
  }

  // Create Forum Questions and Answers
  console.log('Creating forum questions and answers...');
  for (let i = 0; i < 10; i++) {
    const author = users[Math.floor(Math.random() * users.length)];
    const question = await prisma.forumQuestion.create({
      data: {
        title: faker.lorem.sentence() + '?',
        content: faker.lorem.paragraphs(2),
        userId: author.id,
      }
    });

    // Answers
    const numAnswers = faker.number.int({ min: 0, max: 5 });
    for (let j = 0; j < numAnswers; j++) {
      const answerAuthor = users[Math.floor(Math.random() * users.length)];
      await prisma.forumAnswer.create({
        data: {
          content: faker.lorem.paragraph(),
          userId: answerAuthor.id,
          questionId: question.id,
        }
      });
    }
  }

  console.log('Seed completed successfully!');
  console.log(`Test User Login -> Email: test@studyshare.com | Password: password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
