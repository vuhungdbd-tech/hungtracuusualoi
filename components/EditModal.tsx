
import React, { useState } from 'react';
import { StudentResult } from '../types';

interface EditModalProps {
  student: StudentResult;
  onSave: (updated: StudentResult) => void;
  onClose: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ student, onSave, onClose }) => {
  const [formData, setFormData] = useState<StudentResult>({ ...student });
  const [cccdError, setCccdError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue: string | number = value;

    if (name === 'score') {
      finalValue = parseFloat(value) || 0;
    } else if (name === 'full_name' || name === 'sbd') {
      finalValue = value.toUpperCase();
    } else if (name === 'cccd') {
      const cleaned = value.replace(/\D/g, '').slice(0, 12);
      finalValue = cleaned;
      if (cleaned.length > 0 && cleaned.length < 12) {
        setCccdError('Số định danh (CCCD) phải đủ 12 chữ số');
      } else {
        setCccdError('');
      }
    }

    setFormData(prev => ({ 
      ...prev, 
      [name]: finalValue 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.cccd.length !== 12) {
      setCccdError('LỖI: Số CCCD không hợp lệ (Phải đủ 12 số)');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-[#1e40af] p-5 text-white font-bold text-center uppercase tracking-[0.2em] text-sm">CẬP NHẬT HỒ SƠ THÍ SINH</div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Họ và tên thí sinh <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              name="full_name" 
              value={formData.full_name} 
              onChange={handleChange} 
              placeholder="NGUYỄN VĂN A" 
              className="w-full p-4 border border-gray-200 rounded-xl uppercase font-black focus:border-blue-500 outline-none bg-slate-50" 
              required 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Số báo danh <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="sbd" 
                value={formData.sbd} 
                onChange={handleChange} 
                placeholder="HSG001" 
                className="w-full p-4 border border-gray-200 rounded-xl uppercase font-black focus:border-blue-500 outline-none bg-slate-50" 
                required 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Số CCCD (12 số) <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="cccd" 
                value={formData.cccd} 
                onChange={handleChange} 
                placeholder="001..." 
                maxLength={12}
                className={`w-full p-4 border rounded-xl focus:border-blue-500 outline-none font-mono font-bold bg-slate-50 ${cccdError ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                required 
              />
              {cccdError && <p className="text-[9px] text-red-500 font-black mt-1 uppercase italic">{cccdError}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Đơn vị / Trường học</label>
            <input 
              type="text" 
              name="school" 
              value={formData.school} 
              onChange={handleChange} 
              placeholder="Tên trường..." 
              className="w-full p-4 border border-gray-200 rounded-xl focus:border-blue-500 outline-none bg-slate-50" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Môn dự thi</label>
            <input 
              type="text" 
              name="subject" 
              value={formData.subject} 
              onChange={handleChange} 
              placeholder="Toán, Lý, Hóa..." 
              className="w-full p-4 border border-gray-200 rounded-xl focus:border-blue-500 outline-none bg-slate-50" 
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Điểm thi</label>
              <input 
                type="number" 
                step="0.01" 
                name="score" 
                value={formData.score} 
                onChange={handleChange} 
                placeholder="0.00" 
                className="w-full p-4 border border-gray-200 rounded-xl font-black focus:border-blue-500 outline-none bg-slate-50" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-widest">Xếp giải</label>
              <select 
                name="award" 
                value={formData.award} 
                onChange={handleChange} 
                className="w-full p-4 border border-gray-200 rounded-xl font-black focus:border-blue-500 outline-none bg-slate-50"
              >
                <option value="Giải Nhất">Giải Nhất</option>
                <option value="Giải Nhì">Giải Nhì</option>
                <option value="Giải Ba">Giải Ba</option>
                <option value="Khuyến khích">Khuyến khích</option>
                <option value="Không đạt">Không đạt</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-4 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-4 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 uppercase text-[11px] tracking-widest transition-all">Hủy bỏ</button>
            <button 
              type="submit" 
              disabled={formData.cccd.length !== 12}
              className={`flex-1 py-4 text-white rounded-xl font-black uppercase text-[11px] tracking-widest transition-all shadow-lg ${formData.cccd.length === 12 ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-gray-300 cursor-not-allowed opacity-50'}`}
            >
              LƯU HỒ SƠ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
