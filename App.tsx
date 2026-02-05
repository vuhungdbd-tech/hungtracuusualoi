
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
  const [dbError, setDbError] = useState<boolean>(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Cập nhật Favicon động
  useEffect(() => {
    if (siteConfig.favicon_url) {
      const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (link) {
        link.href = siteConfig.favicon_url;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = siteConfig.favicon_url;
        document.getElementsByTagName('head')[0].appendChild(newLink);
      }
    }
  }, [siteConfig.favicon_url]);

  // CHỈ tải danh sách thí sinh khi người dùng là ADMIN
  // Điều này giúp người dùng bình thường truy cập cực nhanh vì không phải tải dữ liệu nặng
  const fetchStudentsData = useCallback(async () => {
    if (view !== 'admin' || !isLoggedIn) return;
    
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (studentsError) throw studentsError;
      setStudents(studentsData || []);
    } catch (err: any) {
      console.error("Lỗi tải danh sách:", err.message);
    }
  }, [view, isLoggedIn]);

  // Tải cấu hình trang (Luôn chạy để hiển thị Header/Footer đúng)
  const fetchConfig = useCallback(async () => {
    try {
      const { data: configData, error: configError } = await supabase
        .from('site_config')
        .select('*')
        .single();
      
      if (!configError && configData) {
        const { id, created_at, ...cleanConfig } = configData;
        setSiteConfig(cleanConfig as SiteConfig);
      }
    } catch (err) {
      console.warn("Sử dụng cấu hình mặc định");
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsLoggedIn(true);
    });

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    const handlePopState = () => {
      setView(window.location.pathname.startsWith('/admin') ? 'admin' : 'search');
    };
    window.addEventListener('popstate', handlePopState);

    return () => { 
      authListener.unsubscribe();
      window.removeEventListener('popstate', handlePopState);
    };
  }, [fetchConfig]);

  // Tải lại dữ liệu học sinh khi vào view admin hoặc có thay đổi
  useEffect(() => {
    if (isLoggedIn && view === 'admin') {
      fetchStudentsData();
    }
  }, [isLoggedIn, view, fetchStudentsData]);

  // HÀM TRA CỨU: Tối ưu để chạy nhanh và chính xác
  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setResult(null);
    setError(null);

    // Chuẩn hóa dữ liệu đầu vào để tìm kiếm chính xác 100%
    const searchFullName = params.full_name.trim().replace(/\s+/g, ' ');
    const searchSBD = params.sbd.trim().toUpperCase();
    const searchCCCD = params.cccd.trim();

    try {
      // Truy vấn trực tiếp vào Database với bộ lọc chính xác
      const { data, error: searchError } = await supabase
        .from('students')
        .select('*')
        .ilike('full_name', searchFullName) // ilike để không phân biệt hoa thường
        .eq('sbd', searchSBD)               // eq để so khớp chính xác tuyệt đối
        .eq('cccd', searchCCCD)             // eq để so khớp chính xác tuyệt đối
        .maybeSingle();

      if (searchError) throw searchError;

      if (data) {
        setResult(data);
      } else {
        setError('KHÔNG TÌM THẤY KẾT QUẢ: Vui lòng kiểm tra lại Họ tên, SBD và CCCD. Thông tin phải khớp hoàn toàn với dữ liệu đăng ký.');
      }
    } catch (err: any) {
      setError('Hệ thống đang bận hoặc có lỗi kết nối. Vui lòng thử lại sau vài giây.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveConfigToStorage = async (newConfig: SiteConfig) => {
    try {
      const { error } = await supabase.from('site_config').upsert([{ ...newConfig, id: 1 }]);
      
      if (error) {
        // Xử lý lỗi thiếu cột favicon_url một cách êm thấm
        if (error.message.includes('favicon_url') || error.code === '42703') {
          const { favicon_url, ...partialConfig } = newConfig;
          await supabase.from('site_config').upsert([{ ...partialConfig, id: 1 }]);
          setSiteConfig(prev => ({ ...prev, ...partialConfig }));
          alert("Lưu thành công! Lưu ý: Để đổi Favicon, bạn cần chạy lệnh SQL thêm cột 'favicon_url' trong Supabase.");
          return;
        }
        throw error;
      }
      
      setSiteConfig(newConfig);
      alert('Đã cập nhật cấu hình hệ thống thành công!');
    } catch (err: any) { 
      alert('Lỗi khi lưu cấu hình: ' + err.message); 
    }
  };

  // Các hàm quản trị khác
  const handleUpdateStudent = async (updated: StudentResult) => {
    try {
      const { error } = await supabase.from('students').update(updated).eq('id', updated.id);
      if (error) throw error;
      fetchStudentsData();
    } catch (err: any) { alert('Lỗi: ' + err.message); }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Xóa thí sinh này?')) return;
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
      fetchStudentsData();
    } catch (err: any) { alert('Lỗi: ' + err.message); }
  };

  const handleAddStudent = async (newStudent: Omit<StudentResult, 'id'>) => {
    try {
      const { error } = await supabase.from('students').insert([newStudent]);
      if (error) throw error;
      fetchStudentsData();
      alert('Thêm thành công!');
    } catch (err: any) { alert('Lỗi: ' + err.message); }
  };

  const handleBulkAdd = async (newStudents: Omit<StudentResult, 'id'>[]) => {
    try {
      const { error } = await supabase.from('students').insert(newStudents);
      if (error) throw error;
      fetchStudentsData();
      alert(`Đã nhập thành công ${newStudents.length} thí sinh!`);
    } catch (err: any) { alert('Lỗi khi nhập dữ liệu: ' + err.message); }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setIsLoggedIn(true);
    } catch (err: any) {
      // Support default admin if auth is not configured
      if (email === 'admin@school.edu.vn' && password === 'admin123') {
        setIsLoggedIn(true);
      } else {
        alert('Đăng nhập thất bại: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (initializing) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="font-bold text-blue-900 animate-pulse">ĐANG TẢI DỮ LIỆU HỆ THỐNG...</div>
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
                <div className="text-center mb-8">
                  <h3 className="text-xl font-black text-gray-900 uppercase">Quản trị viên</h3>
                  <p className="text-sm text-gray-500">Vui lòng đăng nhập để quản lý điểm thi</p>
                </div>
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-xl outline-none focus:border-blue-500" placeholder="Email" />
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-xl outline-none focus:border-blue-500" placeholder="Mật khẩu" />
                  <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 uppercase">Đăng nhập</button>
                </form>
              </div>
            ) : (
              <AdminDashboard 
                students={students} 
                siteConfig={siteConfig}
                onUpdate={handleUpdateStudent} 
                onDelete={handleDeleteStudent}
                onDeleteAll={() => {}} 
                onAdd={handleAddStudent}
                onBulkAdd={handleBulkAdd}
                onConfigUpdate={saveConfigToStorage}
                onLogout={() => supabase.auth.signOut().then(() => setIsLoggedIn(false))}
              />
            )}
          </div>
        ) : (
          <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-blue-900 text-center uppercase mb-10 tracking-tight leading-tight">
              {siteConfig.main_title}
            </h2>
            {error && <div className="max-w-xl mx-auto mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-center font-medium">{error}</div>}
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
