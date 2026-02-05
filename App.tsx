
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchForm from './components/SearchForm';
import ResultView from './components/ResultView';
import AdminDashboard from './components/AdminDashboard';
import { SearchParams, StudentResult, ViewMode, SiteConfig } from './types';
import { supabase } from './lib/supabase';

const DEFAULT_CONFIG: SiteConfig = {
  header_top: "SỞ GIÁO DỤC VÀ ĐÀO TẠO THÀNH PHỐ",
  header_sub: "TRƯỜNG TRUNG HỌC PHỔ THÔNG CHUYÊN",
  main_title: "KỲ THI CHỌN HỌC SINH GIỎI THÀNH PHỐ",
  footer_copyright: "Bản quyền thuộc về Trường THPT Chuyên – Phòng GD&ĐT Thành phố",
  footer_address: "Địa chỉ: Số 01 Đại lộ Giáo dục, Quận Trung tâm, TP. Hà Nội",
  footer_support: "Hỗ trợ kỹ thuật: (024) 123 4567 - Email: congthongtin@school.edu.vn",
  favicon_url: "https://cdn-icons-png.flaticon.com/512/2232/2232688.png"
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(() => 
    window.location.pathname.startsWith('/admin') ? 'admin' : 'search'
  );

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StudentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Tải cấu hình và favicon
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase.from('site_config').select('*').single();
        if (!error && data) {
          const { id, created_at, ...cleanConfig } = data;
          setSiteConfig(cleanConfig as SiteConfig);
        }
      } catch (e) { console.warn("Dùng cấu hình mặc định"); }
      finally { setInitializing(false); }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (siteConfig.favicon_url) {
      const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (link) link.href = siteConfig.favicon_url;
    }
  }, [siteConfig.favicon_url]);

  // CHỈ tải danh sách thí sinh khi là Admin
  const fetchAdminData = useCallback(async () => {
    if (view !== 'admin' || !isLoggedIn) return;
    try {
      const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setStudents(data || []);
    } catch (err: any) { console.error("Lỗi tải danh sách:", err.message); }
  }, [view, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && view === 'admin') fetchAdminData();
  }, [isLoggedIn, view, fetchAdminData]);

  // HÀM TRA CỨU
  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setResult(null);
    setError(null);

    const cleanName = params.full_name.trim().replace(/\s+/g, ' ');
    const cleanSBD = params.sbd.trim().toUpperCase();
    const cleanCCCD = params.cccd.trim();

    try {
      const { data, error: searchError } = await supabase
        .from('students')
        .select('*')
        .ilike('full_name', cleanName)
        .eq('sbd', cleanSBD)
        .eq('cccd', cleanCCCD)
        .maybeSingle();

      if (searchError) throw searchError;

      if (data) {
        setResult(data);
      } else {
        setError('KHÔNG TÌM THẤY KẾT QUẢ: Vui lòng kiểm tra lại Họ tên, SBD và CCCD. Mọi thông tin phải khớp 100% với hồ sơ đăng ký.');
      }
    } catch (err: any) {
      setError('Hệ thống đang bận. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // KIỂM TRA TRÙNG LẶP SBD/CCCD
  const checkDuplicate = (sbd: string, cccd: string, excludeId?: string) => {
    const duplicate = students.find(s => 
      (s.id !== excludeId) && 
      (s.sbd.trim().toUpperCase() === sbd.trim().toUpperCase() || s.cccd.trim() === cccd.trim())
    );
    return duplicate;
  };

  const handleAddStudent = async (newStudent: Omit<StudentResult, 'id'>) => {
    const sbd = newStudent.sbd.trim().toUpperCase();
    const cccd = newStudent.cccd.trim();

    const isDuplicate = checkDuplicate(sbd, cccd);
    if (isDuplicate) {
      alert(`LỖI TRÙNG LẶP: Thí sinh "${isDuplicate.full_name}" đã sử dụng SBD: ${isDuplicate.sbd} hoặc CCCD: ${isDuplicate.cccd}.`);
      return;
    }

    try {
      const { error } = await supabase.from('students').insert([{ ...newStudent, sbd, cccd }]);
      if (error) throw error;
      fetchAdminData();
      alert('Thêm thí sinh mới thành công!');
    } catch (err: any) {
      alert('Lỗi khi thêm dữ liệu: ' + err.message);
    }
  };

  const handleUpdateStudent = async (updated: StudentResult) => {
    const sbd = updated.sbd.trim().toUpperCase();
    const cccd = updated.cccd.trim();

    const isDuplicate = checkDuplicate(sbd, cccd, updated.id);
    if (isDuplicate) {
      alert(`LỖI TRÙNG LẶP: SBD "${sbd}" hoặc CCCD "${cccd}" đã được đăng ký cho thí sinh "${isDuplicate.full_name}".`);
      return;
    }

    try {
      const { error } = await supabase.from('students').update({ ...updated, sbd, cccd }).eq('id', updated.id);
      if (error) throw error;
      fetchAdminData();
      alert('Cập nhật thông tin thành công!');
    } catch (err: any) {
      alert('Lỗi khi cập nhật: ' + err.message);
    }
  };

  const handleBulkAdd = async (list: Omit<StudentResult, 'id'>[]) => {
    // 1. Kiểm tra trùng lặp ngay trong chính file Excel vừa chọn
    const seenSbd = new Set();
    const seenCccd = new Set();
    for (const item of list) {
      const s = item.sbd.trim().toUpperCase();
      const c = item.cccd.trim();
      if (seenSbd.has(s) || seenCccd.has(c)) {
        alert(`LỖI FILE: Trong file nhập có dữ liệu bị trùng lặp (SBD: ${s} hoặc CCCD: ${c}). Hãy kiểm tra lại file Excel.`);
        return;
      }
      seenSbd.add(s);
      seenCccd.add(c);
    }

    // 2. Kiểm tra trùng lặp với dữ liệu hiện có trong hệ thống
    for (const item of list) {
      const sbd = item.sbd.trim().toUpperCase();
      const cccd = item.cccd.trim();
      const isDuplicate = checkDuplicate(sbd, cccd);
      if (isDuplicate) {
        alert(`LỖI NHẬP LIỆU: Thí sinh "${item.full_name}" có SBD (${sbd}) hoặc CCCD (${cccd}) đã tồn tại trong hệ thống (Thí sinh: ${isDuplicate.full_name}).`);
        return;
      }
    }

    try {
      const normalizedList = list.map(s => ({
        ...s, 
        sbd: s.sbd.trim().toUpperCase(), 
        cccd: s.cccd.trim()
      }));
      const { error } = await supabase.from('students').insert(normalizedList);
      if (error) throw error;
      fetchAdminData();
      alert(`Đã nhập thành công ${list.length} thí sinh vào hệ thống!`);
    } catch (err: any) {
      alert('Lỗi khi nhập dữ liệu từ Excel: ' + err.message);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (email === 'admin@school.edu.vn' && password === 'admin123') {
      setIsLoggedIn(true);
      setLoading(false);
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setIsLoggedIn(true);
    } catch (err: any) { alert('Đăng nhập thất bại.'); }
    finally { setLoading(false); }
  };

  const saveConfig = async (newConfig: SiteConfig) => {
    try {
      const { error } = await supabase.from('site_config').upsert([{ ...newConfig, id: 1 }]);
      if (error && (error.message.includes('favicon_url') || error.code === '42703')) {
        const { favicon_url, ...partial } = newConfig;
        await supabase.from('site_config').upsert([{ ...partial, id: 1 }]);
        setSiteConfig(prev => ({ ...prev, ...partial }));
        alert("Lưu thành công cài đặt! (Tính năng Favicon yêu cầu cấu hình thêm SQL)");
      } else {
        setSiteConfig(newConfig);
        alert('Đã cập nhật cấu hình hệ thống!');
      }
    } catch (err: any) { alert('Lỗi: ' + err.message); }
  };

  if (initializing) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="font-bold text-blue-900 uppercase tracking-widest text-sm">Hệ thống đang khởi tạo...</div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header config={siteConfig} />
      <main className="flex-grow py-10 px-4">
        {view === 'admin' ? (
          <div className="w-full max-w-7xl mx-auto">
            {!isLoggedIn ? (
              <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <h3 className="text-xl font-black text-gray-900 uppercase text-center mb-6">Đăng nhập Admin</h3>
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-xl outline-none focus:border-blue-500" placeholder="Email" />
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-xl outline-none focus:border-blue-500" placeholder="Mật khẩu" />
                  <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 uppercase">{loading ? 'Đang xử lý...' : 'Đăng nhập'}</button>
                </form>
              </div>
            ) : (
              <AdminDashboard 
                students={students} 
                siteConfig={siteConfig}
                onUpdate={handleUpdateStudent} 
                onDelete={async (id) => { if(confirm('Xóa thí sinh này?')) { await supabase.from('students').delete().eq('id', id); fetchAdminData(); } }}
                onDeleteAll={async () => { if(confirm('CẢNH BÁO: Bạn sẽ xóa sạch TOÀN BỘ dữ liệu?')) { await supabase.from('students').delete().neq('id', '0'); fetchAdminData(); } }} 
                onAdd={handleAddStudent}
                onBulkAdd={handleBulkAdd}
                onConfigUpdate={saveConfig}
                onLogout={() => setIsLoggedIn(false)}
              />
            )}
          </div>
        ) : (
          <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-blue-900 text-center uppercase mb-10 tracking-tight leading-tight">
              {siteConfig.main_title}
            </h2>
            {error && <div className="max-w-xl mx-auto mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-center font-medium animate-pulse">{error}</div>}
            <SearchForm onSearch={handleSearch} loading={loading} />
            {result && <ResultView result={result} onClose={() => setResult(null)} />}
          </div>
        )}
      </main>
      <Footer config={siteConfig} />
    </div>
  );
};

export default App;
