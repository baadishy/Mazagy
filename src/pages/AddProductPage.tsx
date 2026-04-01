import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import { 
  Plus, 
  X, 
  Upload, 
  DollarSign, 
  Package, 
  FileText, 
  Truck, 
  Tag, 
  Calendar,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { productService } from '../services/api';
import { DashboardLayout } from './DashboardPage';

export const AddProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    warranty: 'no warranty',
    images: [] as string[],
    isOnSale: false,
    salePrice: '',
    saleStart: '',
    saleEnd: '',
    deliveryAvailable: false,
    deliveryFee: '0',
    category: 'others'
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (isEdit && id) {
        try {
          const res = await productService.getProduct(id);
          const p = res.data;
          setFormData({
            name: p.name,
            description: p.description,
            price: p.price.toString(),
            warranty: p.warranty || 'no warranty',
            images: p.images,
            isOnSale: p.isOnSale || false,
            salePrice: p.salePrice?.toString() || '',
            saleStart: p.saleStart ? new Date(p.saleStart).toISOString().split('T')[0] : '',
            saleEnd: p.saleEnd ? new Date(p.saleEnd).toISOString().split('T')[0] : '',
            deliveryAvailable: p.deliveryAvailable || false,
            deliveryFee: p.deliveryFee?.toString() || '0',
            category: p.category || 'others'
          });
          setImagePreviews(p.images);
        } catch (err) {
          console.error('Error fetching product:', err);
          setError('فشل في تحميل بيانات المنتج');
        } finally {
          setFetching(false);
        }
      }
    };
    fetchProduct();
  }, [id, isEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        newImages.push(base64String);
        newPreviews.push(base64String);
        
        if (newImages.length === files.length) {
          setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      setError('يرجى إضافة صورة واحدة على الأقل');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        salePrice: formData.isOnSale ? parseFloat(formData.salePrice) : undefined,
        deliveryFee: formData.deliveryAvailable ? parseFloat(formData.deliveryFee) : 0,
      };
      
      if (isEdit && id) {
        await productService.updateProduct(id, productData);
      } else {
        await productService.createProduct(productData);
      }
      
      setSuccess(true);
      setTimeout(() => navigate('/seller/products'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || `فشل في ${isEdit ? 'تحديث' : 'إضافة'} المنتج، يرجى المحاولة مرة أخرى`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout title="جاري التحميل...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={isEdit ? "تعديل المنتج" : "إضافة منتج جديد"}>
      <div className="max-w-4xl mx-auto">
        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 p-6 bg-emerald-50 text-emerald-600 rounded-[2rem] border border-emerald-100 flex items-center gap-4 font-bold shadow-lg shadow-emerald-100"
            >
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg">{isEdit ? 'تم تحديث المنتج بنجاح!' : 'تمت إضافة المنتج بنجاح!'}</h4>
                <p className="text-sm opacity-80">سيتم توجيهك إلى قائمة المنتجات...</p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 p-6 bg-rose-50 text-rose-600 rounded-[2rem] border border-rose-100 flex items-center gap-4 font-bold shadow-lg shadow-rose-100"
            >
              <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg">خطأ في العملية</h4>
                <p className="text-sm opacity-80">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Basic Info */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">المعلومات الأساسية</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-secondary px-2">اسم المنتج</label>
                <div className="relative">
                  <Tag className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: هاتف ذكي حديث"
                    className="w-full bg-slate-50 border-none rounded-2xl pr-10 pl-4 py-3 text-sm focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-secondary px-2">السعر الأساسي ($)</label>
                <div className="relative">
                  <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border-none rounded-2xl pr-10 pl-4 py-3 text-sm focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-secondary px-2">الفئة</label>
                <div className="relative">
                  <Layers className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl pr-10 pl-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 appearance-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-secondary px-2">الضمان</label>
                <div className="relative">
                  <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                  <select 
                    value={formData.warranty}
                    onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl pr-10 pl-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 appearance-none"
                  >
                    <option value="no warranty">بدون ضمان</option>
                    <option value="6 months">6 أشهر</option>
                    <option value="1 year">سنة واحدة</option>
                    <option value="2 years">سنتان</option>
                    <option value="3 years">3 سنوات</option>
                    <option value="lifetime">ضمان مدى الحياة</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-xs font-bold text-secondary px-2">وصف المنتج</label>
                <div className="relative">
                  <FileText className="absolute right-4 top-4 w-4 h-4 text-secondary" />
                  <textarea 
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="اكتب وصفاً تفصيلياً للمنتج ومميزاته..."
                    className="w-full bg-slate-50 border-none rounded-2xl pr-10 pl-4 py-4 text-sm focus:ring-2 focus:ring-primary/20 resize-none" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">صور المنتج</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 left-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-secondary hover:text-primary">
                <Plus className="w-6 h-6" />
                <span className="text-[10px] font-bold">إضافة صورة</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* Sale Info */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900">العروض والخصومات</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={formData.isOnSale}
                  onChange={(e) => setFormData({ ...formData, isOnSale: e.target.checked })}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="mr-3 text-sm font-bold text-slate-900">تفعيل الخصم</span>
              </label>
            </div>

            {formData.isOnSale && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-50"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-secondary px-2">سعر العرض ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input 
                      type="number" 
                      step="0.01"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-slate-50 border-none rounded-2xl pr-10 pl-4 py-3 text-sm focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-secondary px-2">تاريخ البدء</label>
                  <div className="relative">
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input 
                      type="date" 
                      value={formData.saleStart}
                      onChange={(e) => setFormData({ ...formData, saleStart: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl pr-10 pl-4 py-3 text-sm focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-secondary px-2">تاريخ الانتهاء</label>
                  <div className="relative">
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input 
                      type="date" 
                      value={formData.saleEnd}
                      onChange={(e) => setFormData({ ...formData, saleEnd: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl pr-10 pl-4 py-3 text-sm focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Delivery Info */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900">خيارات التوصيل</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={formData.deliveryAvailable}
                  onChange={(e) => setFormData({ ...formData, deliveryAvailable: e.target.checked })}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="mr-3 text-sm font-bold text-slate-900">توصيل متاح</span>
              </label>
            </div>

            {formData.deliveryAvailable && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-4 border-t border-slate-50"
              >
                <div className="flex flex-col gap-2 max-w-xs">
                  <label className="text-xs font-bold text-secondary px-2">رسوم التوصيل ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input 
                      type="number" 
                      step="0.01"
                      value={formData.deliveryFee}
                      onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-slate-50 border-none rounded-2xl pr-10 pl-4 py-3 text-sm focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-5 rounded-[2rem] font-black text-lg hover:bg-blue-600 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isEdit ? <Save className="w-6 h-6" /> : <Plus className="w-6 h-6" />)}
            {isEdit ? 'حفظ التغييرات' : 'إضافة المنتج للمتجر'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};
