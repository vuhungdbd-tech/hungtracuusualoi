
import React, { useState, useRef } from 'react';
import { SiteConfig } from '../types';
import { supabase } from '../lib/supabase';

interface ConfigModalProps {
  config: SiteConfig;
  onSave: (newConfig: SiteConfig) => void;
  onClose: () => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ config, onSave, onClose }) => {
  const [formData, setFormData] = useState<SiteConfig>({ ...config });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng file
    const allowedTypes = ['image/png', 'image/x-icon', 'image/jpeg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ hỗ trợ các định dạng .png, .ico, .jpg, .svg');
      return;
    }

    // Kiểm tra kích thước (max 1MB cho favicon)
    if (file.size > 1024 * 1024) {
      alert('Kích thước file quá lớn (tối đa 1MB)');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `favicon-${Math.random()}.${fileExt}`;
      const filePath = `icons/${fileName}`;

      // Tải lên Supabase Storage (Bucket 'assets')
      const { error: uploadError, data } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Lấy URL công khai
      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, favicon_url: publicUrl }));
      alert('Tải ảnh lên thành công!');
    } catch (error: any) {
      console.error('Lỗi tải ảnh:', error.message);
      alert('Không thể tải ảnh lên. Hãy đảm bảo bạn đã tạo bucket "assets" với quyền Public trong Supabase Storage.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-800 p-4 text-white font-bold text-center uppercase tracking-wider">CẤU HÌNH HỆ THỐNG</div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Tiêu đề cấp trên</label>
              <input type="text" name="header_top" value={formData.header_top} onChange={handleChange} className="w-full p-3 border rounded-xl outline-none focus:border-blue-500 transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Tiêu đề đơn vị</label>
              <input type="text" name="header_sub" value={formData.header_sub} onChange={handleChange} className="w-full p-3 border rounded-xl outline-none focus:border-blue-500 transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Tên kỳ thi</label>
              <input type="text" name="main_title" value={formData.main_title} onChange={handleChange} className="w-full p-3 border rounded-xl font-bold text-blue-900 outline-none focus:border-blue-500 transition-all" />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Cấu hình Favicon (Biểu tượng trang)</label>
            <div className="flex flex-col space-y-3">
              <div className="flex space-x-3 items-center">
                <input 
                  type="text" 
                  name="favicon_url" 
                  value={formData.favicon_url} 
                  onChange={handleChange} 
                  placeholder="Nhập link URL hoặc tải lên..." 
                  className="flex-1 p-3 border rounded-xl outline-none focus:border-blue-500 bg-white" 
                />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".png,.ico,.jpg,.jpeg,.svg" 
                />
                <button 
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-4 py-3 rounded-xl font-bold text-xs uppercase transition-all flex items-center space-x-2 ${uploading ? 'bg-gray-200 text-gray-400' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>{uploading ? 'Đang tải...' : 'Tải lên'}</span>
                </button>
              </div>
              
              {formData.favicon_url && (
                <div className="flex items-center space-x-3 bg-white p-2 rounded-lg border border-gray-100 w-fit">
                   <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center overflow-hidden border">
                      <img src={formData.favicon_url} alt="Favicon Preview" className="max-w-full max-h-full object-contain" />
                   </div>
                   <span className="text-[10px] text-gray-500 font-medium">Xem trước biểu tượng</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 italic font-medium">* Khuyên dùng: Ảnh vuông, nền trong suốt (.png hoặc .ico), kích thước 32x32 hoặc 64x64.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Bản quyền (Footer)</label>
              <input type="text" name="footer_copyright" value={formData.footer_copyright} onChange={handleChange} className="w-full p-3 border rounded-xl outline-none focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Địa chỉ</label>
              <input type="text" name="footer_address" value={formData.footer_address} onChange={handleChange} className="w-full p-3 border rounded-xl outline-none focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Thông tin hỗ trợ</label>
              <input type="text" name="footer_support" value={formData.footer_support} onChange={handleChange} className="w-full p-3 border rounded-xl outline-none focus:border-blue-500 transition-all" />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all">Đóng</button>
            <button type="submit" className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg hover:shadow-slate-200">Lưu cấu hình</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigModal;
