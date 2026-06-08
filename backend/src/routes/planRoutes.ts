import { Router } from 'express';
// 🔴 อย่าลืม import updateDailyPlan เข้ามาด้วย
import { saveDailyPlan, getDailyPlans, deleteDailyPlan, updateDailyPlan } from '../controllers/planController';

const router = Router();

router.post('/save', saveDailyPlan);
router.get('/history', getDailyPlans);
router.delete('/:id', deleteDailyPlan);
router.put('/:id', updateDailyPlan); // 🔴 เพิ่มเส้นทางสำหรับแก้ไข

export default router;