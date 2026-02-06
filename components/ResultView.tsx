
import React from 'react';
import { StudentResult } from '../types';

interface ResultViewProps {
  result: StudentResult;
  onClose: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ result, onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-white/20 animate-in zoom-in-95 duration-500 font-times">
        {/* Header - Chuyên nghiệp và trang trọng */}
        <div className="bg-[#1e40af] px-10 py-6 flex justify-between items-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-transparent opacity-30"></div>
          <h3 className="font-bold uppercase tracking-[0.1em] text-xl md:text-2xl">KẾT QUẢ TRA CỨU CHI TIẾT</h3>
          <button 
            onClick={onClose} 
            className="hover:rotate-90 transition-all duration-300 p-2 bg-white/10 hover:bg-white/20 rounded-full"
            aria-label="Đóng kết quả"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 bg-white">
          {/* Thông tin học sinh - Trình bày to, rõ, dễ quan sát tổng quát */}
          <div className="space-y-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between px-10 py-6 border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
              <span className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mb-1 md:mb-0">HỌ VÀ TÊN THÍ SINH</span>
              <span className="text-[#1e40af] font-black text-2xl md:text-3xl uppercase tracking-tight">{result.full_name}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between px-10 py-6 border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
              <span className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mb-1 md:mb-0">SỐ BÁO DANH</span>
              <span className="text-black font-black text-2xl md:text-3xl font-mono">{result.sbd}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between px-10 py-6 border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
              <span className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mt-1 mb-1 md:mb-0">ĐƠN VỊ / TRƯỜNG HỌC</span>
              <span className="text-black font-bold text-right max-w-[400px] leading-relaxed text-xl md:text-2xl">
                {result.school || "Không có dữ liệu"}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between px-10 py-6 border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
              <span className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mb-1 md:mb-0">MÔN DỰ THI</span>
              <span className="text-[#1e40af] font-black text-2xl md:text-3xl">{result.subject}</span>
            </div>

            {/* Phần Điểm - Trọng tâm của bảng kết quả */}
            <div className="flex flex-col md:flex-row md:items-center justify-between px-10 py-10 bg-blue-50/30 rounded-2xl mt-2">
              <span className="text-blue-800 font-black text-sm uppercase tracking-[0.3em] mb-2 md:mb-0">TỔNG ĐIỂM THI</span>
              <div className="flex items-baseline space-x-3">
                <span className="text-black font-black text-6xl md:text-7xl drop-shadow-sm">{result.score.toFixed(2)}</span>
                <span className="text-gray-500 font-black text-2xl uppercase">Điểm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nút thao tác dưới cùng */}
        <div className="px-10 py-8 bg-slate-50 border-t border-gray-100 flex flex-col sm:flex-row justify-center sm:justify-end gap-4">
           <button 
             onClick={onClose}
             className="px-8 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
           >
             ĐÓNG CỬA SỔ
           </button>
           <button 
             onClick={() => window.print()} 
             className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl flex items-center justify-center space-x-3 active:scale-95 border-b-4 border-slate-700"
           >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>XUẤT PHIẾU ĐIỂM</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
