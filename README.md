# Kitting Manpower Calculation System (Planflow)

ระบบเว็บแอปพลิเคชันสำหรับการวางแผนและคำนวณกำลังคน (Capacity Planning) ในกระบวนการจัดชุดชิ้นส่วนและสินค้า (Kitting) ภายในคลังสินค้า เพื่อวิเคราะห์ภาระงาน (**Workload**) เปรียบเทียบกับขีดความสามารถจริง (**Capacity**) ของทีมทำงานในแต่ละวันแบบ **Data-Driven**

---

## 🚀 Features

* **Dynamic Capacity Planning:** คำนวณจำลองกำลังคนและภาระงานรวมในแต่ละวันแบบเรียลไทม์
* **Bottleneck & Overload Detection:** ระบบแจ้งเตือนอัจฉริยะเมื่อภาระงานรวม (`estimatedDays`) เกินขีดจำกัด (> 1.0 วัน)
* **Dynamic Master Data:** เชื่อมต่อระบบจัดการฐานข้อมูลรายการงานและเวลามาตรฐาน (Job Catalog) ดึงข้อมูลสดจาก Cloud Database
* **Operational Reporting:** ระบบส่งออกใบสรุปสั่งงานรายวันในรูปแบบไฟล์ PDF พร้อมใช้งานหน้างานทันที
* **Responsive UI/UX:** หน้าจอทันสมัย รองรับการเปิดใช้งานผ่านแท็บเล็ตและสมาร์ทโฟนของเจ้าหน้าที่คลังสินค้า

---

## 🛠️ Tech Stack & Architecture

ระบบถูกออกแบบด้วยสถาปัตยกรรมแบบ **Decoupled Architecture** (แยกฝั่งหน้าบ้านและหลังบ้าน) เพื่อความยืดหยุ่นและปลอดภัยในการจัดการระบบ

### 📺 Frontend
* **Core:** React 19 (TypeScript)
* **Build Tool:** Vite 8
* **Styling:** Tailwind CSS v4
* **Icons:** Lucide React
* **Hosting:** Vercel

### ⚙️ Backend & Database
* **Core:** Node.js + Express (TypeScript)
* **Database Connect:** Prisma ORM
* **Database:** Cloud PostgreSQL บน **Supabase**
* **Hosting:** Render

---

## 📊 Relational Database Schema (Supabase)

ระบบเชื่อมต่อข้อมูลความสัมพันธ์แบบ 3 ชั้น (Cascade Mapping) เพื่อรองรับข้อมูลที่ซับซ้อน:
$$\text{Daily Plan} \longrightarrow \text{Projects} \longrightarrow \text{Job Items}$$

* **JobCatalog:** จัดเก็บข้อมูลรหัสงาน ชื่อกระบวนการ และเวลามาตรฐาน (Standard Time)
* **DailyPlan:** จัดเก็บข้อมูลสรุปแผนรายวันและประวัติย้อนหลัง
* **Project:** จัดเก็บรายชื่อโครงการ/ลูกค้า และเวลางาน OT
* **JobItem:** จัดเก็บข้อมูลรายการงานย่อย จำนวนชิ้นงาน และจำนวนพนักงานที่มอบหมาย

---

## ⚙️ Installation & Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
# ทำการเชื่อมต่อฐานข้อมูล Supabase ในไฟล์ .env
npx prisma db pull
npx prisma generate
npm run dev
