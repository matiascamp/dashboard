import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

async function main() {
  const email = 'campodonicomatias1@gmail.com';
  const password = '123456';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      role: 'admin'
    }
  });

  console.log('Usuario creado:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
