import express from 'express';
import cors from 'cors'; // 🔴 1. เพิ่ม import บรรทัดนี้
import planRoutes from './routes/planRoutes'; // ตัวจัดการเส้นทางของคุณ

const app = express();

app.use(cors()); // 🔴 2. เพิ่มบรรทัดนี้ (สำคัญมาก: ต้องอยู่ก่อนหน้าพวกรวม Routes และ express.json)
app.use(express.json());

// ข้อมูลเส้นทาง API เดิมของคุณ
app.use('/api/plans', planRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});