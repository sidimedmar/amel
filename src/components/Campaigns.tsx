/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Filter, Droplet, ArrowUpRight, CheckCircle2, AlertCircle, X, Users, MessageSquare, Upload, Trash2, RotateCw, Plus, Check, Crop } from 'lucide-react';
import { Language, CampaignItem } from '../types';
import { TRANSLATIONS, CAMPAIGNS_DATA } from '../data';
import { useEditable } from '../context/EditableContext';
import { ShareButtons } from './ShareButtons';
import { ImageCropperModal } from './ImageCropperModal';

export const Campaigns: React.FC = () => {
  const {
    currentLang,
    t,
    isAdminMode,
    campaignsData,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    budgetRecords,
  } = useEditable();

  const [activeFilter, setActiveFilter] = useState<'all' | 'water' | 'political' | 'community'>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(null);

  // Image Cropping Modal State
  const [cropperRawSrc, setCropperRawSrc] = useState<string | null>(null);
  const [cropperTargetCampId, setCropperTargetCampId] = useState<string | null>(null);

  // Collapse toggle for custom campaign form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFormImage, setSelectedFormImage] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form states for new campaign
  const [formCategory, setFormCategory] = useState<'water' | 'political' | 'community'>('water');
  const [formStatus, setFormStatus] = useState<'ongoing' | 'completed'>('ongoing');
  const [formDateFr, setFormDateFr] = useState('');
  const [formDateAr, setFormDateAr] = useState('');
  const [formTitleFr, setFormTitleFr] = useState('');
  const [formTitleAr, setFormTitleAr] = useState('');
  const [formDescFr, setFormDescFr] = useState('');
  const [formDescAr, setFormDescAr] = useState('');
  const [formLongDescFr, setFormLongDescFr] = useState('');
  const [formLongDescAr, setFormLongDescAr] = useState('');
  
  // Custom stats values
  const [stat1Val, setStat1Val] = useState('100+');
  const [stat1LblFr, setStat1LblFr] = useState('Bénéficiaires');
  const [stat1LblAr, setStat1LblAr] = useState('مستفيد');
  const [stat2Val, setStat2Val] = useState('1');
  const [stat2LblFr, setStat2LblFr] = useState('Campagne');
  const [stat2LblAr, setStat2LblAr] = useState('حملة');
  const [stat3Val, setStat3Val] = useState('100%');
  const [stat3LblFr, setStat3LblFr] = useState('Soutien');
  const [stat3LblAr, setStat3LblAr] = useState('دعم');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Combine static and custom campaigns using unified state
  const allCampaigns = campaignsData;

  const filteredCampaigns = allCampaigns.filter((camp) => {
    if (activeFilter === 'all') return true;
    return camp.category === activeFilter;
  });

  // Client-side image optimization and rotation helpers
  const resizeAndCompressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 2048;
          const MAX_HEIGHT = 1536;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.96));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => reject(new Error('Failed to parse image file'));
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const rotateImageBase64 = (base64Str: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.height;
        canvas.height = img.width;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((90 * Math.PI) / 180);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          resolve(canvas.toDataURL('image/jpeg', 0.96));
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => reject(new Error('Failed to rotate image'));
    });
  };

  const handleCampaignImageUpload = async (campId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert(currentLang === 'fr' ? 'Veuillez sélectionner une image valide.' : 'يرجى تحديد صورة صالحة.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCropperRawSrc(event.target.result as string);
          setCropperTargetCampId(campId);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCampaignImageRotate = async (campId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetCamp = campaignsData.find(c => c.id === campId);
    if (!targetCamp) return;
    try {
      const rotated = await rotateImageBase64(targetCamp.image);
      const updated = { ...targetCamp, image: rotated };
      updateCampaign(campId, updated);
      if (selectedCampaign && selectedCampaign.id === campId) {
        setSelectedCampaign(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetCampaignImage = (campId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(currentLang === 'fr' ? "Réinitialiser l'image par défaut ?" : "إعادة تعيين الصورة الافتراضية؟")) {
      return;
    }
    const originalCamp = CAMPAIGNS_DATA.find(c => c.id === campId);
    const targetCamp = campaignsData.find(c => c.id === campId);
    if (originalCamp && targetCamp) {
      const updated = { ...targetCamp, image: originalCamp.image };
      updateCampaign(campId, updated);
      if (selectedCampaign && selectedCampaign.id === campId) {
        setSelectedCampaign(updated);
      }
    }
  };

  const handleDeleteCustomCampaign = (campId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(currentLang === 'fr' ? 'Supprimer cette campagne définitivement ?' : 'هل تريد حذف هذه الحملة نهائياً؟')) {
      return;
    }
    deleteCampaign(campId);
    if (selectedCampaign && selectedCampaign.id === campId) {
      setSelectedCampaign(null);
    }
  };

  // Form submission for new custom campaign
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFormImage) {
      setUploadError(currentLang === 'fr' ? 'Veuillez importer une image.' : 'يرجى استيراد صورة أولاً.');
      return;
    }

    const finalTitleFr = formTitleFr.trim() || 'Campagne terrain';
    const finalTitleAr = formTitleAr.trim() || 'حملة ميدانية';
    const finalDescFr = formDescFr.trim() || 'Action directe sur le terrain de Hassi El Bekay.';
    const finalDescAr = formDescAr.trim() || 'عمل ميداني مباشر في قرى حاسي البكاي.';
    const finalLongFr = formLongDescFr.trim() || finalDescFr;
    const finalLongAr = formLongDescAr.trim() || finalDescAr;
    const finalDateFr = formDateFr.trim() || 'Juillet 2026';
    const finalDateAr = formDateAr.trim() || 'يوليو 2026';

    const newCamp: CampaignItem = {
      id: `custom_camp_${Date.now()}`,
      title: { fr: finalTitleFr, ar: finalTitleAr },
      description: { fr: finalDescFr, ar: finalDescAr },
      longDescription: { fr: finalLongFr, ar: finalLongAr },
      date: { fr: finalDateFr, ar: finalDateAr },
      status: formStatus,
      image: selectedFormImage,
      category: formCategory,
      stats: [
        { label: { fr: stat1LblFr, ar: stat1LblAr }, value: stat1Val },
        { label: { fr: stat2LblFr, ar: stat2LblAr }, value: stat2Val },
        { label: { fr: stat3LblFr, ar: stat3LblAr }, value: stat3Val }
      ]
    };

    addCampaign(newCamp);

    // Reset fields
    setSelectedFormImage(null);
    setFormTitleFr('');
    setFormTitleAr('');
    setFormDescFr('');
    setFormDescAr('');
    setFormLongDescFr('');
    setFormLongDescAr('');
    setFormDateFr('');
    setFormDateAr('');
    setIsFormOpen(false);
  };


  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError(currentLang === 'fr' ? 'Sélectionnez un fichier image.' : 'حدد ملف صورة صالحة.');
      return;
    }
    try {
      setUploadProgress(true);
      setUploadError(null);
      const base64 = await resizeAndCompressImage(file);
      setSelectedFormImage(base64);
    } catch {
      setUploadError('Error processing image');
    } finally {
      setUploadProgress(false);
    }
  };

  const handleRotateFormImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedFormImage) return;
    try {
      setUploadProgress(true);
      const rotated = await rotateImageBase64(selectedFormImage);
      setSelectedFormImage(rotated);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadProgress(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'water':
        return <Droplet className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'political':
        return <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'community':
        return <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return null;
    }
  };

  return (
    <section
      id="campaigns"
      className="py-24 bg-slate-50 dark:bg-slate-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display mb-4 tracking-tight">
            {t.campaignsTitle}
          </h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {t.campaignsSubtitle}
          </p>
        </div>

        {/* Categories Filtering Bar & Add Button */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-slate-100 dark:border-slate-800/60 pb-8">
          
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeFilter === 'all'
                  ? 'bg-blue-700 text-white dark:bg-amber-500 dark:text-slate-900 shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
              id="filter-all"
            >
              <Filter className="w-4 h-4" />
              <span>{currentLang === 'fr' ? "Tout" : "الكل"}</span>
            </button>
            
            <button
              onClick={() => setActiveFilter('water')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeFilter === 'water'
                  ? 'bg-blue-700 text-white dark:bg-amber-500 dark:text-slate-900 shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
              id="filter-water"
            >
              <Droplet className="w-4 h-4 text-blue-500" />
              <span>{t.galleryFilterWater}</span>
            </button>

            <button
              onClick={() => setActiveFilter('political')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeFilter === 'political'
                  ? 'bg-blue-700 text-white dark:bg-amber-500 dark:text-slate-900 shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
              id="filter-political"
            >
              <Users className="w-4 h-4 text-amber-500" />
              <span>{t.galleryFilterPolitical}</span>
            </button>

            <button
              onClick={() => setActiveFilter('community')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeFilter === 'community'
                  ? 'bg-blue-700 text-white dark:bg-amber-500 dark:text-slate-900 shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
              id="filter-community"
            >
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span>{t.galleryFilterCommunity}</span>
            </button>
          </div>

          {/* Add Campaign Action Button (ONLY Admin) */}
          {isAdminMode && (
            <div>
              <button
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 dark:from-amber-500 dark:to-amber-600 text-white dark:text-slate-950 font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-md transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                <span>{currentLang === 'fr' ? "Ajouter une campagne" : "إضافة حملة جديدة"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Collapsible Bilingual Campaign Form with Drag-and-Drop (ONLY Admin) */}
        {isAdminMode && isFormOpen && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 mb-12 shadow-md transition-all duration-300 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                {currentLang === 'fr' ? "Ajouter une Campagne de Terrain" : "إضافة حملة ميدانية جديدة"}
              </h3>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setSelectedFormImage(null);
                  setUploadError(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Drag & Drop Zone */}
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 text-left rtl:text-right">
                  {currentLang === 'fr' ? "Fichier Photo (Glisser-Déposer ou Cliquer)" : "ملف الصورة (اسحب وأفلت أو انقر)"}
                </label>
                
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 transition-all duration-200 cursor-pointer text-center min-h-[260px] relative overflow-hidden ${
                    isDragActive 
                      ? 'border-amber-500 bg-amber-500/5' 
                      : selectedFormImage 
                        ? 'border-emerald-500 bg-emerald-500/5' 
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-amber-500'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {selectedFormImage ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 bg-slate-950/45 text-white backdrop-blur-[2px]">
                      <img
                        src={selectedFormImage}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute top-3 right-3 flex gap-2 z-35" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={handleRotateFormImage}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-2 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
                          title={currentLang === 'fr' ? "Faire pivoter 90°" : "تدوير 90 درجة"}
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFormImage(null);
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
                          title={currentLang === 'fr' ? "Enlever la photo" : "إزالة الصورة"}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                        <Check className="w-3.5 h-3.5" />
                        <span>{currentLang === 'fr' ? "Prêt à ajouter" : "جاهز للإضافة"}</span>
                      </div>
                    </div>
                  ) : uploadProgress ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-slate-500">
                        {currentLang === 'fr' ? "Traitement et compression..." : "جاري معالجة وضغط الصورة..."}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="w-12 h-12 text-slate-400 dark:text-slate-600 group-hover:text-amber-500" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {currentLang === 'fr' ? "Glissez votre image ici, ou cliquez" : "اسحب الصورة هنا أو انقر لاختيارها"}
                      </p>
                      <p className="text-xs text-slate-400">
                        PNG, JPG, JPEG (Optimisé à 800px)
                      </p>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <div className="mt-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs px-3 py-2 rounded-lg flex items-center gap-2 border border-rose-100 dark:border-rose-950">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Stats Inputs Section inside the Form */}
                <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 text-left rtl:text-right">
                    {currentLang === 'fr' ? "Statistiques (3 Colonnes)" : "الإحصائيات والأرقام القياسية (3 أعمدة)"}
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Stat 1 */}
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Ex: 350,000+"
                        value={stat1Val}
                        onChange={(e) => setStat1Val(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Label FR"
                        value={stat1LblFr}
                        onChange={(e) => setStat1LblFr(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="العنوان بالعربية"
                        value={stat1LblAr}
                        onChange={(e) => setStat1LblAr(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-right"
                      />
                    </div>
                    {/* Stat 2 */}
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Ex: 12"
                        value={stat2Val}
                        onChange={(e) => setStat2Val(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Label FR"
                        value={stat2LblFr}
                        onChange={(e) => setStat2LblFr(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="العنوان بالعربية"
                        value={stat2LblAr}
                        onChange={(e) => setStat2LblAr(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-right"
                      />
                    </div>
                    {/* Stat 3 */}
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Ex: 100%"
                        value={stat3Val}
                        onChange={(e) => setStat3Val(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Label FR"
                        value={stat3LblFr}
                        onChange={(e) => setStat3LblFr(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="العنوان بالعربية"
                        value={stat3LblAr}
                        onChange={(e) => setStat3LblAr(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-right"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Metadata details */}
              <div className="flex flex-col gap-4 text-left rtl:text-right">
                
                {/* Category & Status Picker */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                      {currentLang === 'fr' ? "Filtre / Catégorie" : "تصنيف الحملة"}
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="water">
                        {currentLang === 'fr' ? "Campagne d'Eau / Séquaya" : "حملات السقاية ومواجهة العطش"}
                      </option>
                      <option value="political">
                        {currentLang === 'fr' ? "Rassemblement / Politique" : "الاجتماعات والأنشطة السياسية"}
                      </option>
                      <option value="community">
                        {currentLang === 'fr' ? "Vie Citoyenne / Social" : "العمل التطوعي والاجتماعي والتعليم"}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                      {currentLang === 'fr' ? "Statut" : "حالة الحملة"}
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="ongoing">
                        {currentLang === 'fr' ? "En Cours" : "مستمر"}
                      </option>
                      <option value="completed">
                        {currentLang === 'fr' ? "Réalisé" : "مكتمل"}
                      </option>
                    </select>
                  </div>
                </div>

                {/* Dates FR & AR */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      {currentLang === 'fr' ? "Date (Français)" : "التاريخ (بالفرنسية)"}
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Juillet 2026"
                      value={formDateFr}
                      onChange={(e) => setFormDateFr(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      {currentLang === 'fr' ? "Date (Arabe)" : "التاريخ (بالعربية)"}
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: يوليو 2026"
                      value={formDateAr}
                      onChange={(e) => setFormDateAr(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm focus:outline-none text-right"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Title FR & AR */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      {currentLang === 'fr' ? "Titre (Français)" : "العنوان (بالفرنسية)"}
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Caravane d'aide"
                      value={formTitleFr}
                      onChange={(e) => setFormTitleFr(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      {currentLang === 'fr' ? "Titre (Arabe)" : "العنوان (بالعربية)"}
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: قافلة مساعدات"
                      value={formTitleAr}
                      onChange={(e) => setFormTitleAr(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm focus:outline-none text-right"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Short Description FR & AR */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      {currentLang === 'fr' ? "Brève Description (FR)" : "وصف قصير (بالفرنسية)"}
                    </label>
                    <textarea
                      placeholder="Résumé court..."
                      value={formDescFr}
                      onChange={(e) => setFormDescFr(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      {currentLang === 'fr' ? "Brève Description (AR)" : "وصف قصير (بالعربية)"}
                    </label>
                    <textarea
                      placeholder="نبذة وجيزة..."
                      value={formDescAr}
                      onChange={(e) => setFormDescAr(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none resize-none text-right"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Long Description FR & AR */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    {currentLang === 'fr' ? "Description Détaillée (Français)" : "التفاصيل والقصة الطويلة (بالفرنسية)"}
                  </label>
                  <textarea
                    placeholder="Contexte et impact de cette action..."
                    value={formLongDescFr}
                    onChange={(e) => setFormLongDescFr(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    {currentLang === 'fr' ? "Description Détaillée (Arabe)" : "التفاصيل والقصة الطويلة (بالعربية)"}
                  </label>
                  <textarea
                    placeholder="خلفية النشاط الميداني والأثر الإنساني بالتفصيل..."
                    value={formLongDescAr}
                    onChange={(e) => setFormLongDescAr(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none resize-none text-right"
                    dir="rtl"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setSelectedFormImage(null);
                    }}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {currentLang === 'fr' ? "Annuler" : "إلغاء"}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-700 dark:bg-amber-500 text-white dark:text-slate-950 rounded-xl text-xs sm:text-sm font-extrabold hover:bg-blue-800 dark:hover:bg-amber-600 transition-colors shadow-md"
                  >
                    {currentLang === 'fr' ? "Ajouter la campagne" : "حفظ وإضافة الحملة"}
                  </button>
                </div>

              </div>
            </form>
          </div>
        )}

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {filteredCampaigns.map((camp) => {
            const isCompleted = camp.status === 'completed';
            const campTitle = currentLang === 'fr' ? camp.title.fr : camp.title.ar;
            const campDesc = currentLang === 'fr' ? camp.description.fr : camp.description.ar;
            const campDate = currentLang === 'fr' ? camp.date.fr : camp.date.ar;

            const isCustom = camp.id.startsWith('custom_camp_');
            const original = CAMPAIGNS_DATA.find(o => o.id === camp.id);
            const hasCustomImage = original ? (original.image !== camp.image) : false;
            const displayImage = camp.image;

            return (
              <div
                key={camp.id}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-350 flex flex-col group"
              >
                {/* Image Wrap */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-950">
                  <img
                    src={displayImage}
                    alt={campTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />

                  {/* Photo Actions Overlays (ONLY Admin) */}
                  {isAdminMode && (
                    <div className="absolute top-4 right-4 flex gap-2 z-20" onClick={(e) => e.stopPropagation()}>
                      {/* Upload New Image Input */}
                      <label 
                        className="bg-blue-700 hover:bg-blue-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 p-2 rounded-full shadow-lg cursor-pointer transition-all hover:scale-110 flex items-center justify-center"
                        title={currentLang === 'fr' ? "Remplacer l'image" : "تغيير الصورة"}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCampaignImageUpload(camp.id, e)}
                          className="hidden"
                        />
                      </label>

                      {/* Rotate Image (only if custom image is active) */}
                      {(isCustom || hasCustomImage) && (
                        <button
                          onClick={(e) => handleCampaignImageRotate(camp.id, e)}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-2 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
                          title={currentLang === 'fr' ? "Pivoter 90°" : "تدوير 90 درجة"}
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Reset Image (only if custom image is active for a static campaign) */}
                      {!isCustom && hasCustomImage && (
                        <button
                          onClick={(e) => handleResetCampaignImage(camp.id, e)}
                          className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
                          title={currentLang === 'fr' ? "Réinitialiser la photo" : "استعادة الصورة الافتراضية"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete Custom Campaign entirely */}
                      {isCustom && (
                        <button
                          onClick={(e) => handleDeleteCustomCampaign(camp.id, e)}
                          className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
                          title={currentLang === 'fr' ? "Supprimer la campagne" : "حذف الحملة"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                      isCompleted 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900' 
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-100 dark:border-blue-900'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5 animate-pulse" />}
                      <span>{isCompleted ? t.campaignStatusCompleted : t.campaignStatusOngoing}</span>
                    </span>
                  </div>

                  {/* Category overlay label */}
                  <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-900/95 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow">
                    {getCategoryIcon(camp.category)}
                    <span className="text-slate-800 dark:text-slate-200">
                      {camp.category === 'water' && t.galleryFilterWater}
                      {camp.category === 'political' && t.galleryFilterPolitical}
                      {camp.category === 'community' && t.galleryFilterCommunity}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs font-semibold mb-3">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{campDate}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white font-display mb-3 group-hover:text-blue-700 dark:group-hover:text-amber-400 transition-colors leading-snug">
                      {campTitle}
                    </h3>

                    {/* Short Description */}
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                      {campDesc}
                    </p>
                  </div>

                  {/* Micro stats and Details Trigger */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mt-auto">
                    {/* Mini Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {camp.stats.map((st, sIdx) => (
                        <div key={sIdx} className="text-center">
                          <p className="text-sm font-extrabold text-blue-700 dark:text-amber-400 leading-tight">
                            {st.value}
                          </p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight font-medium">
                            {currentLang === 'fr' ? st.label.fr : st.label.ar}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Trigger Button & Share Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedCampaign(camp)}
                        className="flex-1 flex items-center justify-center gap-1 bg-slate-50 hover:bg-blue-50 dark:bg-slate-950 dark:hover:bg-amber-950/20 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-800 hover:border-blue-100 dark:hover:border-amber-500/30 py-2.5 rounded-xl text-xs font-bold transition-all duration-300"
                      >
                        <span>{t.campaignLearnMore}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      {/* Compact Share buttons */}
                      <ShareButtons
                        title={campTitle}
                        description={campDesc}
                        currentLang={currentLang}
                        compact={true}
                      />
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Campaign Details Modal Backdrop & Overlay */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 relative"
            onClick={(e) => e.stopPropagation()}
            id="campaign-modal-card"
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedCampaign(null)}
              className="absolute top-4 right-4 z-10 bg-slate-950/50 hover:bg-slate-950/80 text-white p-2 rounded-full transition-all"
              aria-label="Close Modal"
              id="close-camp-modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner Image */}
            {(() => {
              const modalDisplayImage = selectedCampaign.image;
              return (
                <div className="relative h-64 sm:h-80 bg-slate-100 dark:bg-slate-950">
                  <img
                    src={modalDisplayImage}
                    alt={currentLang === 'fr' ? selectedCampaign.title.fr : selectedCampaign.title.ar}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
                  
                  <div className="absolute bottom-6 left-6 right-6 text-white text-left rtl:text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded bg-blue-600 dark:bg-amber-500 text-xs font-bold mb-2">
                      {selectedCampaign.category === 'water' && t.galleryFilterWater}
                      {selectedCampaign.category === 'political' && t.galleryFilterPolitical}
                      {selectedCampaign.category === 'community' && t.galleryFilterCommunity}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black font-display leading-tight text-white">
                      {currentLang === 'fr' ? selectedCampaign.title.fr : selectedCampaign.title.ar}
                    </h3>
                  </div>
                </div>
              );
            })()}

            {/* Modal Body Content */}
            <div className="p-6 sm:p-8">
              {/* Meta */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm font-semibold">
                  <Calendar className="w-4 h-4" />
                  <span>{currentLang === 'fr' ? selectedCampaign.date.fr : selectedCampaign.date.ar}</span>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  selectedCampaign.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{selectedCampaign.status === 'completed' ? t.campaignStatusCompleted : t.campaignStatusOngoing}</span>
                </span>
              </div>

              {/* Main Extended Story */}
              <div className="prose dark:prose-invert max-w-none text-left rtl:text-right">
                <h4 className="text-sm font-bold uppercase tracking-widest text-blue-800 dark:text-amber-400 mb-2">
                  {currentLang === 'fr' ? "CONTEXTE & IMPACT" : "خلفية الحملة والأثر الإنساني"}
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-8">
                  {currentLang === 'fr' ? selectedCampaign.longDescription.fr : selectedCampaign.longDescription.ar}
                </p>
              </div>

              {/* Stats Highlights in Modal */}
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-150 dark:border-slate-850 mb-6">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center mb-4">
                  {currentLang === 'fr' ? "Indicateurs de Performance Clés" : "مؤشرات الأداء الميداني"}
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {selectedCampaign.stats.map((st, sIdx) => (
                    <div key={sIdx} className="text-center">
                      <p className="text-2xl font-black text-blue-700 dark:text-amber-400">
                        {st.value}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold leading-snug">
                        {currentLang === 'fr' ? st.label.fr : st.label.ar}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Mauritanian MRU Budget Tracker inside Modal */}
              {(() => {
                const campaignBudgets = budgetRecords.filter(b => b.campaignId === selectedCampaign.id);
                if (campaignBudgets.length === 0) return null;
                return (
                  <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-150 dark:border-slate-850">
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-left rtl:text-right mb-4">
                      {currentLang === 'fr' ? "Suivi Financier & Dépenses (MRU)" : "تتبع الميزانية والمصروفات بالأوقية (MRU)"}
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left rtl:text-right">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                            <th className="pb-2 font-bold">{currentLang === 'fr' ? "Poste de dépense" : "البند"}</th>
                            <th className="pb-2 font-bold text-right rtl:text-left">{currentLang === 'fr' ? "Alloué" : "المخصص"}</th>
                            <th className="pb-2 font-bold text-right rtl:text-left">{currentLang === 'fr' ? "Dépensé" : "المصروف"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {campaignBudgets.map((b) => (
                            <tr key={b.id} className="text-slate-700 dark:text-slate-300">
                              <td className="py-2.5 font-medium">{currentLang === 'fr' ? b.title.fr : b.title.ar}</td>
                              <td className="py-2.5 text-right rtl:text-left font-black text-emerald-600">{b.allocatedMru.toLocaleString()} MRU</td>
                              <td className="py-2.5 text-right rtl:text-left font-black text-amber-500">{b.spentMru.toLocaleString()} MRU</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* Social Share section inside Modal */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <ShareButtons
                  title={currentLang === 'fr' ? selectedCampaign.title.fr : selectedCampaign.title.ar}
                  description={currentLang === 'fr' ? selectedCampaign.description.fr : selectedCampaign.description.ar}
                  currentLang={currentLang}
                />
              </div>

              {/* CTA footer close inside modal */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
                >
                  {currentLang === 'fr' ? "Fermer" : "إغلاق"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* HD Image Cropper Modal for Campaigns */}
      <ImageCropperModal
        isOpen={!!cropperRawSrc}
        imageSrc={cropperRawSrc || ''}
        currentLang={currentLang}
        onClose={() => {
          setCropperRawSrc(null);
          setCropperTargetCampId(null);
        }}
        onCropComplete={(croppedData) => {
          if (cropperTargetCampId) {
            const targetCamp = campaignsData.find(c => c.id === cropperTargetCampId);
            if (targetCamp) {
              const updated = { ...targetCamp, image: croppedData };
              updateCampaign(cropperTargetCampId, updated);
              if (selectedCampaign && selectedCampaign.id === cropperTargetCampId) {
                setSelectedCampaign(updated);
              }
            }
          } else {
            // For new campaign form
            setSelectedFormImage(croppedData);
          }
          setCropperRawSrc(null);
          setCropperTargetCampId(null);
        }}
      />

    </section>
  );
};

