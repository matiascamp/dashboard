import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("🔌 Probando conexión...");
    
    // Test básico de conexión
    await prisma.$connect();
    console.log("✅ Conexión exitosa");
    
    // Test de query directa
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log("✅ Query raw exitosa:", result);
    
    // Test de modelo User
    console.log("👥 Buscando usuarios...");
    const users = await prisma.user.findMany();
    console.log("👤 Usuarios encontrados:", users.length);
    console.log("📄 Usuarios:", users);
    
    // Test de búsqueda específica
    console.log("🔍 Probando findUnique...");
    const firstUser = users[0];
    if (firstUser) {
      const user = await prisma.user.findUnique({ 
        where: { email: firstUser.email } 
      });
      console.log("✅ FindUnique exitoso:", !!user);
      console.log("📧 Usuario encontrado:", user);
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();