
import React from 'react';
import { StudentResult } from '../types';

interface ResultViewProps {
  result: StudentResult;
  onClose: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ result, onClose }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 font-times">
      <div className="bg-white rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(8,_112,_184,_0.15)] border border-blue-100">
        {/* Header - Uy tín và chuyên nghiệp */}
        <div className="bg-[#2563eb] px-10 py-7 flex justify-between items-center text-white">
          <h3 className="font-bold uppercase tracking-[0.15em] text-2xl">KẾT QUẢ TRA CỨU CHI TIẾT</h3>
          <button 
            onClick={onClose} 
            className="hover:rotate-90 transition-transform duration-300 p-2 bg-white/20 rounded-full"
            aria-label="Đóng kết quả"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-3 bg-white">
          {/* Hàng: Họ và tên */}
          <div className="flex justify-between items-center px-10 py-8 border-b border-gray-100">
            <span className="text-gray-400 font-bold text-sm uppercase tracking-[0.2em]">HỌ VÀ TÊN</span>
            <span className="text-[#1e40af] font-bold text-3xl uppercase tracking-tight">{result.full_name}</span>
          </div>

          {/* Hàng: SBD */}
          <div className="flex justify-between items-center px-10 py-8 border-b border-gray-100">
            <span className="text-gray-400 font-bold text-sm uppercase tracking-[0.2em]">SỐ BÁO DANH</span>
            <span className="text-black font-black text-3xl">{result.sbd}</span>
          </div>

          {/* Hàng: Trường */}
          <div className="flex justify-between items-start px-10 py-8 border-b border-gray-100">
            <span className="text-gray-400 font-bold text-sm uppercase tracking-[0.2em] mt-1">ĐƠN VỊ / TRƯỜNG</span>
            <span className="text-black font-semibold text-right max-w-[420px] leading-relaxed text-2xl">
              {result.school || "Chưa cập nhật"}
            </span>
          </div>

          {/* Hàng: Môn thi */}
          <div className="flex justify-between items-center px-10 py-8 border-b border-gray-100">
            <span className="text-gray-400 font-bold text-sm uppercase tracking-[0.2em]">MÔN DỰ THI</span>
            <span className="text-[#1e40af] font-bold text-3xl">{result.subject}</span>
          </div>

          {/* Hàng: Điểm - Cực to để dễ quan sát nhất */}
          <div className="flex justify-between items-center px-10 py-10">
            <span className="text-gray-400 font-bold text-sm uppercase tracking-[0.2em]">TỔNG ĐIỂM THI</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-black font-black text-6xl">{result.score.toFixed(2)}</span>
              <span className="text-gray-400 font-bold text-xl uppercase">Điểm</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Nút in kết quả */}
      <div className="mt-8 flex justify-center sm:justify-end">
         <button 
           onClick={() => window.print()} 
           className="px-10 py-5 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-[0.25em] hover:bg-black transition-all shadow-2xl hover:shadow-blue-200 active:scale-95 flex items-center space-x-4 border-b-4 border-slate-700"
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>XUẤT PHIẾU ĐIỂM ĐIỆN TỬ</span>
         </button>
      </div>
    </div>
  );
};

export default ResultView;
