
import React, { useState, useEffect } from 'react';
import { SearchParams } from '../types';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading }) => {
  const [formData, setFormData] = useState<SearchParams>({
    full_name: '',
    sbd: '',
    cccd: ''
  });

  const [captchaCode, setCaptchaCode] = useState('');
  const [userInputCaptcha, setUserInputCaptcha] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const [cccdError, setCccdError] = useState('');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    setCaptchaCode(result);
    setUserInputCaptcha('');
    setCaptchaError(false);
  };

  useEffect(() => { generateCaptcha(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cccd') {
      const onlyNums = value.replace(/\D/g, '').slice(0, 12);
      setFormData(prev => ({ ...prev, [name]: onlyNums }));
      
      if (onlyNums.length > 0 && onlyNums.length < 12) {
        setCccdError('Số CCCD phải đủ 12 chữ số');
      } else {
        setCccdError('');
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const isFormValid = formData.full_name.trim() !== '' && 
                      formData.sbd.trim() !== '' && 
                      formData.cccd.length === 12 && 
                      userInputCaptcha.trim() !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInputCaptcha.toUpperCase() !== captchaCode) {
      setCaptchaError(true);
      return;
    }
    if (formData.cccd.length !== 12) {
      setCccdError('YÊU CẦU: Nhập đủ 12 số CCCD');
      return;
    }
    onSearch(formData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
      {/* Header Form */}
      <div className="bg-[#1d88e5] px-4 py-4 md:px-6 md:py-5">
        <h3 className="text-lg md:text-xl font-bold text-white text-center uppercase tracking-wider">HỆ THỐNG TRA CỨU ĐIỂM THI</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-5 md:p-10 space-y-5 md:space-y-6">
        {/* Họ và tên */}
        <div>
          <label className="block text-[10px] md:text-[11px] font-bold text-gray-400 uppercase mb-1.5 md:mb-2 tracking-wide">
            Họ và tên thí sinh <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            name="full_name" 
            required 
            value={formData.full_name} 
            onChange={handleChange} 
            placeholder="ĐỖ QUANG ĐỨC" 
            className="w-full px-4 py-3.5 md:px-5 md:py-4 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl focus:border-blue-400 focus:bg-white outline-none uppercase font-bold text-gray-600 placeholder:text-gray-300 transition-all shadow-sm" 
          />
        </div>

        {/* SBD & CCCD Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-[10px] md:text-[11px] font-bold text-gray-400 uppercase mb-1.5 md:mb-2 tracking-wide">
              Số báo danh <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="sbd" 
              required 
              value={formData.sbd} 
              onChange={handleChange} 
              placeholder="HSG001" 
              className="w-full px-4 py-3.5 md:px-5 md:py-4 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl focus:border-blue-400 focus:bg-white outline-none uppercase font-black text-gray-600 placeholder:text-gray-300 transition-all shadow-sm" 
            />
          </div>
          <div>
            <label className="block text-[10px] md:text-[11px] font-bold text-gray-400 uppercase mb-1.5 md:mb-2 tracking-wide">
              Số CCCD (12 số) <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="cccd" 
              required 
              maxLength={12} 
              value={formData.cccd} 
              onChange={handleChange} 
              className={`w-full px-4 py-3.5 md:px-5 md:py-4 bg-gray-50 border rounded-xl md:rounded-2xl focus:border-blue-400 focus:bg-white outline-none transition-all font-mono font-bold text-gray-600 placeholder:text-gray-300 shadow-sm ${cccdError ? 'border-red-300 bg-red-50' : 'border-gray-100'}`} 
              placeholder="011..."
            />
            {cccdError && <p className="text-[9px] text-red-500 font-bold mt-1 uppercase italic tracking-tight">{cccdError}</p>}
          </div>
        </div>

        {/* Captcha - Tối ưu cho Mobile (Stack on mobile, row on tablet/desktop) */}
        <div>
          <label className="block text-[10px] md:text-[11px] font-bold text-gray-400 uppercase mb-1.5 md:mb-2 tracking-wide">
            Nhập mã bảo mật <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <input 
              type="text" 
              required 
              value={userInputCaptcha} 
              onChange={e => setUserInputCaptcha(e.target.value)} 
              placeholder="Nhập mã..."
              className={`flex-1 px-4 py-3.5 md:px-5 md:py-4 bg-gray-50 border rounded-xl md:rounded-2xl outline-none uppercase tracking-[0.2em] md:tracking-[0.3em] font-black text-gray-600 shadow-sm ${captchaError ? 'border-red-300' : 'border-gray-100'}`} 
            />
            <div 
              onClick={generateCaptcha} 
              className="bg-[#edf2f7] px-6 py-3.5 md:px-8 md:py-4 rounded-xl md:rounded-2xl border border-gray-100 cursor-pointer font-black text-[#1a365d] tracking-widest italic select-none shadow-inner flex items-center justify-center min-h-[50px] sm:min-w-[140px]" 
              title="Nhấn để đổi mã"
            >
              <span className="line-through decoration-blue-500/40 opacity-80 text-lg">{captchaCode}</span>
            </div>
          </div>
          {captchaError && <p className="text-[9px] text-red-500 font-bold mt-1 uppercase italic tracking-tight">Mã bảo mật không chính xác</p>}
        </div>

        {/* Nút tra cứu */}
        <button 
          type="submit" 
          disabled={loading || !isFormValid} 
          className={`w-full py-4 md:py-5 text-white font-black rounded-xl md:rounded-2xl transition-all uppercase tracking-[0.1em] md:tracking-[0.15em] text-sm md:text-base shadow-xl border-b-4 ${isFormValid ? 'bg-blue-600 border-blue-800 hover:bg-blue-700 active:translate-y-1 active:border-b-0' : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-80'}`}
        >
          {loading ? 'ĐANG TÌM KIẾM...' : 'BẮT ĐẦU TRA CỨU'}
        </button>
      </form>
    </div>
  );
};

export default SearchForm;
