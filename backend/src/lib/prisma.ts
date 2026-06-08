// backend/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// สร้างตัวแปร global เพื่อป้องกันการสร้าง Client ซ้ำซ้อนตอน Dev (Hot Reload)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// สร้าง Client แบบปกติ (ไม่ต้องส่ง options ถ้าไม่ใช่กรณีพิเศษ)
export const prisma = globalForPrisma.prisma || new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // เปิดดู log เพื่อเช็คว่าต่อติดไหม
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;