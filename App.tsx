
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchForm from './components/SearchForm';
import ResultView from './components/ResultView';
import AdminDashboard from './components/AdminDashboard';
import { SearchParams, StudentResult, ViewMode, SiteConfig } from './types';
import { supabase } from './lib/supabase';

const DEFAULT_CONFIG: SiteConfig = {
  header_top: "PHÒNG GIÁO DỤC VÀ ĐÀO TẠO",
  header_sub: "HỆ THỐNG TRA CỨU ĐIỂM THI TRỰC TUYẾN",
  main_title: "TRA CỨU KÌ THI HỌC SINH GIỎI CÁC MÔN VĂN HÓA CẤP XÃ, NĂM HỌC 2025-2026",
  footer_copyright: "Bản quyền thuộc về Ban Tổ chức Kỳ thi Học sinh giỏi",
  footer_address: "Địa chỉ: Trụ sở UBND Xã - Ban Giáo dục & Đào tạo",
  footer_support: "Hỗ trợ kỹ thuật: 1900 xxxx - Email: hotro@giaoduc.gov.vn",
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
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = siteConfig.favicon_url;
    }
  }, [siteConfig.favicon_url]);

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

  const checkDuplicate = async (sbd: string, cccd: string, excludeId?: string) => {
    let query = supabase.from('students').select('id').or(`sbd.eq.${sbd},cccd.eq.${cccd}`);
    if (excludeId) query = query.neq('id', excludeId);
    const { data } = await query;
    return data && data.length > 0;
  };

  const handleAddStudent = async (newStudent: Omit<StudentResult, 'id'>) => {
    if (await checkDuplicate(newStudent.sbd, newStudent.cccd)) {
      alert(`LỖI: Số báo danh ${newStudent.sbd} hoặc CCCD ${newStudent.cccd} đã tồn tại trong hệ thống!`);
      return;
    }
    const { error } = await supabase.from('students').insert([newStudent]);
    if (error) alert('Lỗi: ' + error.message);
    else {
      alert('Đã thêm 01 học sinh mới thành công.');
      fetchAdminData();
    }
  };

  const handleBulkAdd = async (list: Omit<StudentResult, 'id'>[]) => {
    let successCount = 0;
    let failCount = 0;
    
    const { data: existing } = await supabase.from('students').select('sbd, cccd');
    const existingSBDs = new Set(existing?.map(e => e.sbd) || []);
    const existingCCCDs = new Set(existing?.map(e => e.cccd) || []);

    const toInsert = list.filter(item => {
      if (existingSBDs.has(item.sbd) || existingCCCDs.has(item.cccd)) {
        failCount++;
        return false;
      }
      return true;
    });

    if (toInsert.length > 0) {
      const { error } = await supabase.from('students').insert(toInsert);
      if (!error) successCount = toInsert.length;
      else alert('Lỗi: ' + error.message);
    }

    alert(`HOÀN TẤT NHẬP DỮ LIỆU:\n- Thêm mới thành công: ${successCount} học sinh.\n- Bị loại bỏ do trùng SBD/CCCD: ${failCount} bản ghi.`);
    fetchAdminData();
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

  if (initializing) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="font-bold text-blue-900 uppercase tracking-widest text-sm">Hệ thống đang khởi tạo...</div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header config={siteConfig} />
      <main className="flex-grow py-10 px-4 relative">
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
                onUpdate={async (u) => { 
                   if (await checkDuplicate(u.sbd, u.cccd, u.id)) {
                     alert('Lỗi: SBD hoặc CCCD này đã tồn tại ở học sinh khác!');
                     return;
                   }
                   await supabase.from('students').update(u).eq('id', u.id); 
                   fetchAdminData(); 
                }} 
                onDelete={async (id) => { if(confirm('Xóa?')) { await supabase.from('students').delete().eq('id', id); fetchAdminData(); } }}
                onDeleteAll={async () => { if(confirm('Xóa sạch?')) { await supabase.from('students').delete().not('id', 'is', null); fetchAdminData(); } }} 
                onAdd={handleAddStudent}
                onBulkAdd={handleBulkAdd}
                onConfigUpdate={async (c) => { await supabase.from('site_config').upsert([{ ...c, id: 1 }]); setSiteConfig(c); }}
                onLogout={() => setIsLoggedIn(false)}
              />
            )}
          </div>
        ) : (
          <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl font-black text-[#1e40af] text-center uppercase mb-10 tracking-normal leading-tight max-w-2xl mx-auto">
              {siteConfig.main_title}
            </h2>
            
            {error && <div className="max-w-xl mx-auto mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-center font-medium animate-pulse">{error}</div>}
            
            <div className="mb-10">
              <SearchForm onSearch={handleSearch} loading={loading} />
            </div>

            {/* Kết quả hiện nay được hiển thị dưới dạng Modal nổi (trong ResultView component) */}
            {result && (
              <ResultView result={result} onClose={() => setResult(null)} />
            )}
          </div>
        )}
      </main>
      <Footer config={siteConfig} />
    </div>
  );
};

export default App;
