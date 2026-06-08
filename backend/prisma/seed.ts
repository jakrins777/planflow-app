import { prisma } from '../src/lib/prisma';
import dotenv from 'dotenv';

dotenv.config();

// ลบตัวแปร pool, adapter ออก แล้วใช้ตัวนี้แทน

async function main() {
  console.log('🌱 เริ่มทำการ Seed ข้อมูล...');

  // 1. ล้างข้อมูลเก่า (เพื่อป้องกันข้อมูลซ้ำซ้อนเวลาเรารันใหม่)
  await prisma.job.deleteMany();
  await prisma.project.deleteMany();
  await prisma.planManpower.deleteMany();
  await prisma.dailyPlan.deleteMany();
  await prisma.jobCatalog.deleteMany();
  
  // 2. เพิ่มข้อมูล Master Data: Job Catalog
  const catalogs = [
    { code: 'J01', name: 'เบิกน็อต (S/M/L)', timePerPiece: 10 },
    { code: 'J02', name: 'เบิกสายไฟ / เคเบิล', timePerPiece: 15 },
    { code: 'J03', name: 'เบิกเหล็กแผ่น / โครงเหล็ก', timePerPiece: 30 },
    { code: 'J04', name: 'เบิกมอเตอร์ / อะไหล่ใหญ่', timePerPiece: 45 },
    { code: 'J05', name: 'เบิกแผงวงจร (PCBA)', timePerPiece: 20 },
    { code: 'J06', name: 'งานแพ็คกิ้งลงกล่อง', timePerPiece: 12 },
  ];

  for (const item of catalogs) {
    await prisma.jobCatalog.upsert({
      where: { code: item.code },
      update: {},
      create: item,
    });
  }
  console.log('✅ เพิ่มข้อมูล Job Catalog สำเร็จ');

  // 3. เพิ่มข้อมูลพนักงาน 3 คน (เวลาปกติ 460 นาที, OE 85%)
  const employees = ['สมชาย', 'สมศรี', 'สมศักดิ์'];
  for (const name of employees) {
    const existingEmp = await prisma.employee.findFirst({ where: { name } });
    if (!existingEmp) {
      await prisma.employee.create({
        data: { name, baseTime: 460, defaultOe: 85 },
      });
    }
  }
  console.log('✅ เพิ่มข้อมูลพนักงานสำเร็จ');
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาดในการ Seed ข้อมูล:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });