// src/api/planService.ts
import axios from 'axios';
import type { DailyPlanPayload } from '../types/plan';

const API_BASE = 'https://psychic-doodle-jjqxqq54g5rqcpq67-5000.app.github.dev/api/plans';

export const saveDailyPlanService = async (data: DailyPlanPayload) => {
  try {
    const response = await axios.post(`${API_BASE}/save`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    // ดึง Error มาจากฝั่ง Backend ถ้ามี
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const getPlanHistoryService = async () => {
  try {
    const response = await axios.get(`${API_BASE}/history`);
    return response.data;
  } catch (error: any) {
    console.error('API Error (Get History):', error.response?.data || error.message);
    throw error;
  }
};

export const deletePlanService = async (id: number) => {
  try {
    const response = await axios.delete(`${API_BASE}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('API Error (Delete Plan):', error.response?.data || error.message);
    throw error;
  }
};

// เพิ่มฟังก์ชันส่งคำสั่งอัปเดต
export const updatePlanService = async (id: number, data: DailyPlanPayload) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('API Error (Update Plan):', error.response?.data || error.message);
    throw error;
  }
};