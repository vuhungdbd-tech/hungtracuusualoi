
import React from 'react';
import { StudentResult } from '../types';

interface ResultViewProps {
  result: StudentResult;
  onClose: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ result, onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] border border-gray-100 animate-in zoom-in-95 duration-300 font-times">
        {/* Header - Gọn gàng hơn */}
        <div className="bg-[#1e40af] px-6 py-4 flex justify-between items-center text-white relative">
          <h3 className="font-bold uppercase tracking-[0.05em] text-lg">KẾT QUẢ CHI TIẾT</h3>
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

        <div className="p-2 bg-white">
          {/* Thông tin học sinh - Bố cục tối ưu diện tích */}
          <div className="space-y-0.5">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50">
              <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">HỌ VÀ TÊN</span>
              <span className="text-[#1e40af] font-black text-xl uppercase">{result.full_name}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50">
              <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">SỐ BÁO DANH</span>
              <span className="text-black font-black text-xl font-mono">{result.sbd}</span>
            </div>

            <div className="flex justify-between items-start px-6 py-4 border-b border-gray-50">
              <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mt-1">ĐƠN VỊ</span>
              <span className="text-black font-bold text-right max-w-[280px] leading-tight text-lg">
                {result.school || "---"}
              </span>
            </div>

            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50">
              <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">MÔN DỰ THI</span>
              <span className="text-[#1e40af] font-black text-xl">{result.subject}</span>
            </div>

            {/* Điểm - Hiển thị nguyên bản giá trị số */}
            <div className="flex justify-between items-center px-6 py-6 bg-blue-50/40 rounded-xl mt-2 mb-2 mx-2">
              <span className="text-blue-800 font-black text-[10px] uppercase tracking-widest">TỔNG ĐIỂM</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-black font-black text-5xl tracking-tighter">{result.score}</span>
                <span className="text-gray-400 font-bold text-sm uppercase">Điểm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Nút nhỏ gọn hơn */}
        <div className="px-6 py-5 bg-slate-50 border-t border-gray-100 flex justify-end gap-3">
           <button 
             onClick={onClose}
             className="px-5 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
           >
             ĐÓNG
           </button>
           <button 
             onClick={() => window.print()} 
             className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-black transition-all shadow-lg flex items-center space-x-2 active:scale-95 border-b-2 border-slate-700"
           >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>IN PHIẾU ĐIỂM</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
