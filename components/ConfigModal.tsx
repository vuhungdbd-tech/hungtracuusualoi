
import React, { useState, useRef } from 'react';
import { SiteConfig } from '../types';

interface ConfigModalProps {
  config: SiteConfig;
  onSave: (newConfig: SiteConfig) => void;
  onClose: () => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ config, onSave, onClose }) => {
  const [formData, setFormData] = useState<SiteConfig>({ ...config });
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng file
    const allowedTypes = ['image/png', 'image/x-icon', 'image/jpeg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ hỗ trợ các định dạng .png, .ico, .jpg, .svg');
      return;
    }

    // Kiểm tra kích thước (max 500KB cho favicon vì lưu Base64 vào DB)
    if (file.size > 500 * 1024) {
      alert('Kích thước file quá lớn (tối đa 500KB để đảm bảo hiệu suất)');
      return;
    }

    setProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setFormData(prev => ({ ...prev, favicon_url: base64String }));
      setProcessing(false);
      alert('Đã xử lý ảnh thành công! Hãy nhấn "Lưu cấu hình" để hoàn tất.');
    };
    
    reader.onerror = () => {
      alert('Có lỗi xảy ra khi đọc file.');
      setProcessing(false);
    };

    reader.readAsDataURL(file);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
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
                  value={formData.favicon_url?.startsWith('data:image') ? 'Đã tải ảnh lên (Dạng chuỗi mã hóa)' : formData.favicon_url} 
                  onChange={handleChange} 
                  placeholder="Dán link URL hoặc chọn file từ máy tính..." 
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
                  disabled={processing}
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-4 py-3 rounded-xl font-bold text-xs uppercase transition-all flex items-center space-x-2 ${processing ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>{processing ? 'Đang xử lý...' : 'Chọn từ máy'}</span>
                </button>
              </div>
              
              {formData.favicon_url && (
                <div className="flex items-center space-x-3 bg-white p-2 rounded-lg border border-gray-100 w-fit">
                   <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center overflow-hidden border">
                      <img src={formData.favicon_url} alt="Favicon Preview" className="max-w-full max-h-full object-contain" />
                   </div>
                   <span className="text-[10px] text-gray-500 font-medium">Xem trước biểu tượng hiện tại</span>
                   <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({ ...prev, favicon_url: '' }))}
                    className="text-[10px] text-red-500 underline"
                   >
                    Xóa
                   </button>
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 italic font-medium">* Ảnh sẽ được lưu trực tiếp vào cơ sở dữ liệu. Không cần cấu hình Storage.</p>
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
