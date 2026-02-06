
import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';
import { StudentResult, SiteConfig } from '../types';
import EditModal from './EditModal';
import ConfigModal from './ConfigModal';

interface AdminDashboardProps {
  students: StudentResult[];
  siteConfig: SiteConfig;
  onUpdate: (updated: StudentResult) => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onAdd: (newStudent: Omit<StudentResult, 'id'>) => void;
  onBulkAdd: (newStudents: Omit<StudentResult, 'id'>[]) => void;
  onConfigUpdate: (newConfig: SiteConfig) => void;
  onLogout: () => void;
}

const ITEMS_PER_PAGE = 20;

const AdminDashboard: React.FC<AdminDashboardProps> = ({ students, siteConfig, onUpdate, onDelete, onDeleteAll, onAdd, onBulkAdd, onConfigUpdate, onLogout }) => {
  const [editingStudent, setEditingStudent] = useState<StudentResult | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);
  const currentData = useMemo(() => {
    const begin = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = begin + ITEMS_PER_PAGE;
    return students.slice(begin, end);
  }, [students, currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleDownloadTemplate = () => {
    const headers = ['Họ và tên', 'Số báo danh', 'CCCD (12 số)', 'Trường', 'Môn thi', 'Điểm', 'Xếp giải'];
    const sampleData = [
      ['NGUYỄN VĂN A', 'HSG001', '001203004567', 'THPT Chuyên', 'Toán học', 18.5, 'Giải Nhất'],
      ['TRẦN THỊ B', 'HSG002', '001203004568', 'THPT A', 'Vật lý', 15.0, 'Giải Ba']
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);

    const wscols = [
      { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 20 }, { wch: 10 }, { wch: 15 }
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Mau_Nhap_Lieu");
    XLSX.writeFile(wb, "Mau_Tra_Cuu_Diem.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const invalidRows: string[] = [];
        const newStudents = jsonData.slice(1).map((row, idx) => {
          const fullName = String(row[0] || '').trim().toUpperCase();
          const sbd = String(row[1] || '').trim().toUpperCase();
          const cccd = String(row[2] || '').replace(/\D/g, '').trim();
          
          if (cccd.length !== 12) {
            invalidRows.push(`Hàng ${idx + 2}: CCCD "${cccd}" không đủ 12 số.`);
            return null;
          }

          return {
            full_name: fullName,
            sbd: sbd,
            cccd: cccd,
            school: String(row[3] || '').trim(),
            subject: String(row[4] || '').trim(),
            score: parseFloat(row[5]) || 0,
            award: String(row[6] || 'Không đạt').trim()
          };
        }).filter(s => s !== null && s.full_name && s.sbd) as Omit<StudentResult, 'id'>[];
        
        if (invalidRows.length > 0) {
          if (!confirm(`Phát hiện ${invalidRows.length} hàng có CCCD không đủ 12 số (sẽ bị loại bỏ). Tiếp tục nhập số còn lại?`)) {
            return;
          }
        }

        if (newStudents.length === 0) {
          alert("Không tìm thấy dữ liệu hợp lệ (Yêu cầu Họ tên, SBD và CCCD 12 số).");
          return;
        }

        onBulkAdd(newStudents);
        setCurrentPage(1);
      } catch (error) {
        alert("Lỗi: Không thể đọc file Excel. Kiểm tra lại định dạng.");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100 gap-6">
        <div>
           <h3 className="text-2xl font-black text-blue-900 tracking-tight">DỮ LIỆU THÍ SINH</h3>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Tổng cộng: {students.length} bản ghi</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx" onChange={handleFileUpload} />
          
          <button onClick={handleDownloadTemplate} className="px-5 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-black text-[10px] uppercase flex items-center space-x-2 transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span>Tải file mẫu</span>
          </button>

          <button onClick={() => fileInputRef.current?.click()} className="px-5 py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-black text-[10px] uppercase flex items-center space-x-2 transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            <span>Nhập từ Excel</span>
          </button>

          <div className="w-px h-10 bg-slate-100 mx-2 hidden md:block"></div>

          <button onClick={onDeleteAll} className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-[10px] uppercase transition-all flex items-center space-x-2 shadow-lg shadow-rose-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            <span>XÓA SẠCH DỮ LIỆU</span>
          </button>

          <button onClick={() => setIsConfiguring(true)} className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-[10px] uppercase transition-all">Cấu hình</button>
          <button onClick={() => setIsAdding(true)} className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase transition-all shadow-lg shadow-blue-100">Thêm mới</button>
          <button onClick={onLogout} className="px-5 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-black text-[10px] uppercase transition-all">Thoát</button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <th className="p-4 border-b border-r border-slate-100 w-28">SBD</th>
                <th className="p-4 border-b border-r border-slate-100">Họ và tên thí sinh</th>
                <th className="p-4 border-b border-r border-slate-100 w-40">CCCD (12 Số)</th>
                <th className="p-4 border-b border-r border-slate-100">Trường / Đơn vị</th>
                <th className="p-4 border-b border-r border-slate-100 w-36">Môn thi</th>
                <th className="p-4 border-b border-r border-slate-100 w-20 text-center">Điểm</th>
                <th className="p-4 border-b border-r border-slate-100 w-32">Xếp giải</th>
                <th className="p-4 border-b border-slate-100 w-28 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {currentData.length > 0 ? currentData.map((s, index) => (
                <tr key={s.id} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                  <td className="p-4 border-b border-r border-slate-100 font-black text-blue-600 tracking-tight">{s.sbd}</td>
                  <td className="p-4 border-b border-r border-slate-100 font-black uppercase text-slate-800">{s.full_name}</td>
                  <td className="p-4 border-b border-r border-slate-100 font-mono text-xs font-bold text-slate-500">{s.cccd}</td>
                  <td className="p-4 border-b border-r border-slate-100 text-slate-600 font-medium">{s.school}</td>
                  <td className="p-4 border-b border-r border-slate-100 text-slate-600 font-bold">{s.subject}</td>
                  <td className="p-4 border-b border-r border-slate-100 text-center font-black text-base">{s.score}</td>
                  <td className="p-4 border-b border-r border-slate-100 font-black text-rose-600 italic">{s.award}</td>
                  <td className="p-4 border-b text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button onClick={() => setEditingStudent(s)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all" title="Sửa">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => onDelete(s.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all" title="Xóa">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">Hệ thống chưa có dữ liệu thí sinh</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="bg-slate-50 px-8 py-5 flex items-center justify-between border-t border-slate-100">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Hiển thị <span className="text-slate-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, students.length)}</span> / {students.length} hồ sơ
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => goToPage(currentPage - 1)} 
                disabled={currentPage === 1}
                className="p-2.5 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                  return (
                    <button 
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`min-w-[40px] px-3 py-2 text-xs font-black border rounded-xl transition-all ${currentPage === pageNum ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'hover:bg-white text-slate-500 bg-transparent border-slate-200'}`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="px-2 text-slate-300">...</span>;
                }
                return null;
              })}

              <button 
                onClick={() => goToPage(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="p-2.5 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {editingStudent && <EditModal student={editingStudent} onSave={u => { onUpdate(u); setEditingStudent(null); }} onClose={() => setEditingStudent(null)} />}
      {isAdding && (
        <EditModal 
          student={{ id: '', full_name: '', sbd: '', cccd: '', school: '', subject: '', score: 0, award: 'Không đạt' }} 
          onSave={n => { 
            const { id, ...rest } = n;
            onAdd(rest); 
            setIsAdding(false); 
          }} 
          onClose={() => setIsAdding(false)} 
        />
      )}
      {isConfiguring && <ConfigModal config={siteConfig} onSave={c => { onConfigUpdate(c); setIsConfiguring(false); }} onClose={() => setIsConfiguring(false)} />}
    </div>
  );
};

export default AdminDashboard;
