
import React from 'react';
import { StudentResult } from '../types';

interface ResultViewProps {
  result: StudentResult;
  onClose: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ result, onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
      <div className="w-full max-w-md my-auto bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] border border-gray-100 animate-in zoom-in-95 duration-300 font-times">
        {/* Header */}
        <div className="bg-[#1e40af] px-4 py-3 md:px-6 md:py-4 flex justify-between items-center text-white relative">
          <h3 className="font-bold uppercase tracking-[0.05em] text-sm md:text-base">KẾT QUẢ TRA CỨU CHI TIẾT</h3>
          <button 
            onClick={onClose} 
            className="hover:rotate-90 transition-all duration-300 p-1.5 bg-white/10 hover:bg-white/20 rounded-full"
            aria-label="Đóng kết quả"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-1 bg-white">
          <div className="space-y-px">
            {/* Họ tên */}
            <div className="px-5 py-3 md:px-6 md:py-3.5 border-b border-gray-50">
              <div className="text-gray-400 font-bold text-[8px] md:text-[9px] uppercase tracking-widest mb-0.5">HỌ VÀ TÊN THÍ SINH</div>
              <div className="text-[#1e40af] font-black text-lg md:text-xl uppercase leading-tight">{result.full_name}</div>
            </div>

            {/* SBD & Môn thi */}
            <div className="grid grid-cols-2 border-b border-gray-50">
              <div className="px-5 py-3 md:px-6 md:py-3.5 border-r border-gray-50">
                <div className="text-gray-400 font-bold text-[8px] md:text-[9px] uppercase tracking-widest mb-0.5">SỐ BÁO DANH</div>
                <div className="text-black font-black text-base md:text-lg font-mono tracking-tighter">{result.sbd}</div>
              </div>
              <div className="px-5 py-3 md:px-6 md:py-3.5">
                <div className="text-gray-400 font-bold text-[8px] md:text-[9px] uppercase tracking-widest mb-0.5">MÔN DỰ THI</div>
                <div className="text-[#1e40af] font-black text-base md:text-lg">{result.subject}</div>
              </div>
            </div>

            {/* Đơn vị */}
            <div className="px-5 py-3 md:px-6 md:py-3.5 border-b border-gray-50">
              <div className="text-gray-400 font-bold text-[8px] md:text-[9px] uppercase tracking-widest mb-1">ĐƠN VỊ / TRƯỜNG HỌC</div>
              <div className="text-black font-bold leading-snug text-sm md:text-base">
                {result.school || "---"}
              </div>
            </div>

            {/* Điểm */}
            <div className="mx-2 my-2 md:mx-3 md:my-3 p-3 md:p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
              <div className="text-blue-800 font-black text-[9px] md:text-[10px] uppercase tracking-widest">TỔNG ĐIỂM THI</div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-black font-black text-4xl md:text-5xl tracking-tighter leading-none">{result.score}</span>
                <span className="text-gray-400 font-bold text-[10px] md:text-xs uppercase">Điểm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="px-4 py-3 md:px-6 md:py-4 bg-slate-50 border-t border-gray-100 flex justify-end gap-2 md:gap-2.5">
           <button 
             onClick={onClose}
             className="px-3 py-2 md:px-4 md:py-2 bg-white border border-gray-200 text-gray-500 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
           >
             ĐÓNG
           </button>
           <button 
             onClick={() => window.print()} 
             className="px-4 py-2 md:px-5 md:py-2 bg-slate-900 text-white rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] hover:bg-black transition-all shadow-md flex items-center space-x-2 active:scale-95"
           >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-3.5 md:w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>IN PHIẾU</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
