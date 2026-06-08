import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; // ดึง prisma มาจาก lib/prisma.ts

export const saveDailyPlan = async (req: Request, res: Response) => {
  try {
    const { date, totalWorkload, totalCapacity, estimatedDays, projects, manpowers } = req.body;

    // ตรวจสอบข้อมูลเบื้องต้น
    if (!projects || projects.length === 0) {
      return res.status(400).json({ error: 'ต้องมีข้อมูลโปรเจกต์อย่างน้อย 1 โปรเจกต์' });
    }

    // ใช้คำสั่งบันทึกแบบ Nested
    const newPlan = await prisma.dailyPlan.create({
      data: {
        date: new Date(date),
        totalWorkload: parseFloat(totalWorkload),
        totalCapacity: parseFloat(totalCapacity),
        estimatedDays: parseFloat(estimatedDays),
        projects: {
          create: projects.map((p: any) => ({
            projectName: p.name,
            customer: p.customer,
            jobs: {
              create: p.jobs.map((j: any) => ({
                catalogCode: j.catalogCode,
                jobName: j.name,
                timePerPiece: parseFloat(j.timePerPiece),
                quantity: parseInt(j.qty)
              }))
            }
          }))
        },
       
        manpowers: {
          create: manpowers.map((m: any) => ({
            employeeId: parseInt(m.id), 
            otMinutes: parseInt(m.ot),
            oe: parseFloat(m.oe)
          }))
        }
        
      }
    });

    res.status(201).json({ message: 'บันทึกสำเร็จ!', data: newPlan });
  } catch (error) {
    console.error('Save Plan Error:', error);
    res.status(500).json({ error: 'บันทึกข้อมูลไม่สำเร็จ กรุณาตรวจสอบรูปแบบข้อมูล' });
  }
};

export const getDailyPlans = async (req: Request, res: Response) => {
  try {
    // ดึงข้อมูลแผนงานทั้งหมด เรียงจากวันที่ล่าสุดไปเก่าสุด
    const plans = await prisma.dailyPlan.findMany({
      orderBy: { date: 'desc' },
      include: {
        projects: {
          include: { 
            jobs: true // ดึงข้อมูล Job ที่อยู่ใน Project ด้วย
          }
        },
        manpowers: true // ดึงข้อมูลพนักงานของวันนั้นด้วย
      }
    });
    res.status(200).json(plans);
  } catch (error) {
    console.error('Get Plans Error:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลแผนงานได้' });
  }
};

export const deleteDailyPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // รับ ID จาก URL
    
    // สั่งลบ DailyPlan (ตารางลูกๆ จะโดนลบตามอัตโนมัติด้วย Cascade)
    await prisma.dailyPlan.delete({
      where: { id: parseInt(id as string) }
    });
    
    res.status(200).json({ message: 'ลบแผนงานเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Delete Plan Error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
  }
};

// เพิ่มฟังก์ชันแก้ไขข้อมูล
export const updateDailyPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { totalWorkload, totalCapacity, estimatedDays, projects, manpowers } = req.body;

    // ใช้คำสั่ง update ของ Prisma โดยลบของเก่าข้างในทิ้งก่อน (deleteMany) แล้วสร้างใหม่
    const updatedPlan = await prisma.dailyPlan.update({
      where: { id: parseInt(id as string) },
      data: {
        totalWorkload,
        totalCapacity,
        estimatedDays,
        projects: {
          deleteMany: {}, // ลบโปรเจกต์และงานย่อยเดิมของแผนนี้ทิ้ง
          create: projects.map((p: any) => ({
            projectName: p.name,
            customer: p.customer,
            jobs: {
              create: p.jobs.map((j: any) => ({
                catalogCode: j.catalogCode,
                jobName: j.name,
                timePerPiece: j.timePerPiece,
                quantity: j.qty
              }))
            }
          }))
        },
        manpowers: {
          deleteMany: {}, // ลบข้อมูล OT เดิมของแผนนี้ทิ้ง
          create: manpowers.map((m: any) => ({
            employeeId: parseInt(m.id),
            otMinutes: parseInt(m.ot),
            oe: parseFloat(m.oe)
          }))
        }
      }
    });
    
    res.status(200).json(updatedPlan);
  } catch (error) {
    console.error('Update Plan Error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' });
  }
};