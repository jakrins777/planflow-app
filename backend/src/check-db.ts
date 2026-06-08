import { prisma } from './lib/prisma';

async function main() {
  try {
    // ลอง query ข้อมูลที่ง่ายที่สุด
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log("✅ เชื่อมต่อฐานข้อมูลสำเร็จ! ระบบพร้อมใช้งาน");
  } catch (error) {
    console.error("❌ เชื่อมต่อไม่สำเร็จ:", error);
  }
}

main();