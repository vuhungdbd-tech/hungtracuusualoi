
import React from 'react';
import { StudentResult } from '../types';

interface ResultViewProps {
  result: StudentResult;
  onClose: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ result, onClose }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-times">
      <div className="bg-white rounded-lg overflow-hidden shadow-2xl border border-gray-100">
        {/* Header - To hơn, font Times New Roman */}
        <div className="bg-[#2563eb] px-8 py-5 flex justify-between items-center text-white">
          <h3 className="font-bold uppercase tracking-widest text-xl">KẾT QUẢ TRA CỨU CHI TIẾT</h3>
          <button 
            onClick={onClose} 
            className="hover:rotate-90 transition-transform duration-300 p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 bg-white">
          {/* Hàng: Họ và tên - To và nổi bật */}
          <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
            <span className="text-gray-500 font-bold text-sm uppercase tracking-widest">HỌ VÀ TÊN</span>
            <span className="text-[#1e40af] font-bold text-2xl uppercase tracking-tight">{result.full_name}</span>
          </div>

          {/* Hàng: SBD */}
          <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
            <span className="text-gray-500 font-bold text-sm uppercase tracking-widest">SỐ BÁO DANH</span>
            <span className="text-black font-black text-2xl">{result.sbd}</span>
          </div>

          {/* Hàng: Trường */}
          <div className="flex justify-between items-start px-8 py-6 border-b border-gray-100">
            <span className="text-gray-500 font-bold text-sm uppercase tracking-widest mt-1">ĐƠN VỊ / TRƯỜNG</span>
            <span className="text-black font-semibold text-right max-w-[380px] leading-relaxed text-lg">
              {result.school || "Chưa cập nhật"}
            </span>
          </div>

          {/* Hàng: Môn thi */}
          <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
            <span className="text-gray-500 font-bold text-sm uppercase tracking-widest">MÔN DỰ THI</span>
            <span className="text-[#1e40af] font-bold text-2xl">{result.subject}</span>
          </div>

          {/* Hàng: Điểm - Cực to và rõ ràng */}
          <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
            <span className="text-gray-500 font-bold text-sm uppercase tracking-widest">TỔNG ĐIỂM</span>
            <span className="text-black font-black text-4xl">{result.score.toFixed(2)}</span>
          </div>

          {/* Hàng: Xếp giải - Màu đỏ đặc trưng */}
          <div className="flex justify-between items-center px-8 py-6">
            <span className="text-gray-500 font-bold text-sm uppercase tracking-widest">XẾP GIẢI CHUNG CUỘC</span>
            <span className="text-red-600 font-black italic text-2xl tracking-[0.2em]">
              {result.award && result.award !== "Không đạt" ? result.award.toUpperCase() : '"" "" "" "" ""'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Nút in kết quả to hơn */}
      <div className="mt-6 flex justify-end">
         <button 
           onClick={() => window.print()} 
           className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-95 flex items-center space-x-3"
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>TẢI PHIẾU ĐIỂM ĐIỆN TỬ</span>
         </button>
      </div>
    </div>
  );
};

export default ResultView;
