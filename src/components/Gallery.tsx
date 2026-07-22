/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2, Image as ImageIcon, Plus, Upload, Trash2, Check, AlertCircle, RotateCw, Pencil, Crop } from 'lucide-react';
import { Language, GalleryItem } from '../types';
import { TRANSLATIONS, GALLERY_ITEMS } from '../data';
import { useEditable } from '../context/EditableContext';
import { ShareButtons } from './ShareButtons';
import { ImageCropperModal } from './ImageCropperModal';

export const Gallery: React.FC = () => {
  const {
    currentLang,
    t,
    isAdminMode,
    galleryItems,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
  } = useEditable();

  const [activeFilter, setActiveFilter] = useState<'all' | 'water' | 'political' | 'community'>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Upload Panel states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);

  // Form Fields
  const [formCategory, setFormCategory] = useState<'water' | 'political' | 'community'>('community');
  const [formTitleFr, setFormTitleFr] = useState('');
  const [formTitleAr, setFormTitleAr] = useState('');
  const [formDescFr, setFormDescFr] = useState('');
  const [formDescAr, setFormDescAr] = useState('');

  // Editing States
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [editCategory, setEditCategory] = useState<'water' | 'political' | 'community'>('community');
  const [editTitleFr, setEditTitleFr] = useState('');
  const [editTitleAr, setEditTitleAr] = useState('');
  const [editDescFr, setEditDescFr] = useState('');
  const [editDescAr, setEditDescAr] = useState('');
  const [editImage, setEditImage] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editProgress, setEditProgress] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Combine static and custom uploaded items using our context
  const allItems = galleryItems;

  const filteredItems = allItems.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.category === activeFilter;
  });

  // Client-side image optimization keeping ultra HD clarity (2048x1536 max) and crisp smoothing
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
            // Compressed high-definition JPEG at 0.96 quality for crisp rendering
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

  const handleRotatePreview = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedImage) return;
    try {
      setUploadProgress(true);
      const rotated = await rotateImageBase64(selectedImage);
      setSelectedImage(rotated);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadProgress(false);
    }
  };

  // Instant and lightweight CSS-based rotation that doesn't bloat local storage or trigger canvas taint errors
  const handleRotateItem = (itemId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const itemToRotate = galleryItems.find(item => item.id === itemId);
    if (!itemToRotate) return;
    const currentRotation = itemToRotate.rotation || 0;
    const nextRotation = (currentRotation + 90) % 360;
    const updated = { ...itemToRotate, rotation: nextRotation };
    updateGalleryItem(itemId, updated);
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError(currentLang === 'fr' ? 'Veuillez sélectionner un fichier image valide.' : 'يرجى تحديد ملف صورة صالحة.');
      return;
    }

    try {
      setUploadProgress(true);
      setUploadError(null);
      const optimizedBase64 = await resizeAndCompressImage(file);
      setSelectedImage(optimizedBase64);
    } catch (err) {
      setUploadError(currentLang === 'fr' ? 'Erreur lors du traitement de l’image.' : 'حدث خطأ أثناء معالجة الصورة.');
    } finally {
      setUploadProgress(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) {
      setUploadError(currentLang === 'fr' ? 'Veuillez choisir ou glisser-déposer une photo.' : 'يرجى تحديد أو سحب صورة أولاً.');
      return;
    }

    // Auto-fill blanks to avoid missing fields
    const finalTitleFr = formTitleFr.trim() || 'Photo ajoutée par l’utilisateur';
    const finalTitleAr = formTitleAr.trim() || 'صورة مضافة من قبل المستخدم';
    const finalDescFr = formDescFr.trim() || 'Image de contribution citoyenne à Hassi El Bekay.';
    const finalDescAr = formDescAr.trim() || 'توثيق لمساهمة مجتمعية في قرى حاسي البكاي.';

    const newItem: GalleryItem = {
      id: `custom_${Date.now()}`,
      src: selectedImage,
      category: formCategory,
      title: {
        fr: finalTitleFr,
        ar: finalTitleAr
      },
      description: {
        fr: finalDescFr,
        ar: finalDescAr
      },
      rotation: 0
    };

    addGalleryItem(newItem);

    // Reset Form
    setSelectedImage(null);
    setFormTitleFr('');
    setFormTitleAr('');
    setFormDescFr('');
    setFormDescAr('');
    setUploadError(null);
    setIsUploadOpen(false);
  };

  // Modify logic for editing existing gallery items
  const startEditItem = (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setEditCategory(item.category);
    setEditTitleFr(item.title.fr);
    setEditTitleAr(item.title.ar);
    setEditDescFr(item.description.fr);
    setEditDescAr(item.description.ar);
    setEditImage(item.src);
    setEditError(null);
  };

  const handleEditFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setEditError(currentLang === 'fr' ? 'Veuillez sélectionner un fichier image valide.' : 'يرجى تحديد ملف صورة صالحة.');
      return;
    }

    try {
      setEditProgress(true);
      setEditError(null);
      const optimizedBase64 = await resizeAndCompressImage(file);
      setEditImage(optimizedBase64);
    } catch (err) {
      setEditError(currentLang === 'fr' ? 'Erreur lors du traitement de l’image.' : 'حدث خطأ أثناء معالجة الصورة.');
    } finally {
      setEditProgress(false);
    }
  };

  const handleEditFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleEditFile(e.target.files[0]);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editImage) {
      setEditError(currentLang === 'fr' ? 'La photo ne peut pas être vide.' : 'لا يمكن أن تكون الصورة فارغة.');
      return;
    }

    const updatedItem: GalleryItem = {
      ...editingItem,
      src: editImage,
      category: editCategory,
      title: {
        fr: editTitleFr.trim() || 'Photo',
        ar: editTitleAr.trim() || 'صورة'
      },
      description: {
        fr: editDescFr.trim() || '',
        ar: editDescAr.trim() || ''
      }
    };

    updateGalleryItem(editingItem.id, updatedItem);
    setEditingItem(null);
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(currentLang === 'fr' ? 'Supprimer cette photo de votre galerie ?' : 'هل تريد حذف هذه الصورة من معرض الصور الخاص بك؟')) {
      return;
    }
    deleteGalleryItem(id);
    setLightboxIndex(null);
  };


  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    const newIdx = lightboxIndex === 0 ? filteredItems.length - 1 : lightboxIndex - 1;
    setLightboxIndex(newIdx);
    setZoomLevel(1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    const newIdx = lightboxIndex === filteredItems.length - 1 ? 0 : lightboxIndex + 1;
    setLightboxIndex(newIdx);
    setZoomLevel(1);
  };

  return (
    <section
      id="gallery"
      className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display mb-4 tracking-tight flex items-center justify-center gap-2">
            <ImageIcon className="w-8 h-8 text-amber-500" />
            <span>{t.galleryTitle}</span>
          </h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {t.gallerySubtitle}
          </p>
        </div>

        {/* Action Controls & Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 border-b border-slate-100 dark:border-slate-800/60 pb-8">
          
          {/* Filters (Left) */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                activeFilter === 'all'
                  ? 'bg-blue-700 text-white dark:bg-amber-500 dark:text-slate-900 shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t.galleryFilterAll}
            </button>
            
            <button
              onClick={() => setActiveFilter('water')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                activeFilter === 'water'
                  ? 'bg-blue-700 text-white dark:bg-amber-500 dark:text-slate-900 shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t.galleryFilterWater}
            </button>

            <button
              onClick={() => setActiveFilter('political')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                activeFilter === 'political'
                  ? 'bg-blue-700 text-white dark:bg-amber-500 dark:text-slate-900 shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t.galleryFilterPolitical}
            </button>

            <button
              onClick={() => setActiveFilter('community')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                activeFilter === 'community'
                  ? 'bg-blue-700 text-white dark:bg-amber-500 dark:text-slate-900 shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t.galleryFilterCommunity}
            </button>
          </div>

          {/* Import / Upload Action Button (Right - ONLY Admin) */}
          {isAdminMode && (
            <div>
              <button
                onClick={() => setIsUploadOpen(!isUploadOpen)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 dark:from-amber-500 dark:to-amber-600 text-white dark:text-slate-950 font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-md transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                <span>{currentLang === 'fr' ? "Ajouter vos propres photos" : "إضافة صورك الخاصة"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Collapsible Bilingual File Upload Form with Drag-and-Drop (ONLY Admin) */}
        {isAdminMode && isUploadOpen && (
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 mb-12 shadow-inner transition-all duration-300 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                {currentLang === 'fr' ? "Ajouter une photo à la galerie" : "إضافة صورة جديدة للمعرض"}
              </h3>
              <button
                onClick={() => {
                  setIsUploadOpen(false);
                  setSelectedImage(null);
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
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {currentLang === 'fr' ? "Fichier Photo (Glisser-Déposer ou Cliquer)" : "ملف الصورة (اسحب وأفلت أو انقر)"}
                </label>
                
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 transition-all duration-200 cursor-pointer text-center min-h-[220px] relative overflow-hidden ${
                    dragActive 
                      ? 'border-amber-500 bg-amber-500/5' 
                      : selectedImage 
                        ? 'border-emerald-500 bg-emerald-500/5' 
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-amber-500'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {selectedImage ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 bg-slate-950/45 text-white backdrop-blur-[2px]">
                      <img
                        src={selectedImage}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute top-3 right-3 flex gap-2 z-35">
                        <button
                          type="button"
                          onClick={handleRotatePreview}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-2 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
                          title={currentLang === 'fr' ? "Faire pivoter 90°" : "تدوير 90 درجة"}
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
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
              </div>

              {/* Right Column: Metadata details */}
              <div className="flex flex-col gap-4 text-left rtl:text-right">
                
                {/* Category Picker */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    {currentLang === 'fr' ? "Filtre / Catégorie de la photo" : "تصنيف الصورة / النشاط"}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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

                {/* Title FR & AR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      {currentLang === 'fr' ? "Titre (Français)" : "العنوان (بالفرنسية)"}
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Distribution d'eau"
                      value={formTitleFr}
                      onChange={(e) => setFormTitleFr(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      {currentLang === 'fr' ? "Titre (Arabe)" : "العنوان (بالعربية)"}
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: سقاية حي الصيانة"
                      value={formTitleAr}
                      onChange={(e) => setFormTitleAr(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 text-right"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Description FR & AR */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    {currentLang === 'fr' ? "Description (Français)" : "الوصف (بالفرنسية)"}
                  </label>
                  <textarea
                    placeholder="Ex: Arrivée du camion citerne dans les zones prioritaires."
                    value={formDescFr}
                    onChange={(e) => setFormDescFr(e.target.value)}
                    rows={2}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    {currentLang === 'fr' ? "Description (Arabe)" : "الوصف (بالعربية)"}
                  </label>
                  <textarea
                    placeholder="مثال: نجدة الأسر المتضررة من العطش في قرى حاسي البكاي."
                    value={formDescAr}
                    onChange={(e) => setFormDescAr(e.target.value)}
                    rows={2}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none text-right"
                    dir="rtl"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUploadOpen(false);
                      setSelectedImage(null);
                    }}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {currentLang === 'fr' ? "Annuler" : "إلغاء"}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-700 dark:bg-amber-500 text-white dark:text-slate-950 rounded-xl text-xs sm:text-sm font-extrabold hover:bg-blue-800 dark:hover:bg-amber-600 transition-colors shadow-md"
                  >
                    {currentLang === 'fr' ? "Ajouter au Galerie" : "إضافة إلى المعرض"}
                  </button>
                </div>

              </div>
            </form>
          </div>
        )}

        {/* Responsive Masonry / Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => {
            const itemTitle = currentLang === 'fr' ? item.title.fr : item.title.ar;
            const itemDesc = currentLang === 'fr' ? item.description.fr : item.description.ar;

            return (
              <div
                key={item.id}
                onClick={() => setLightboxIndex(index)}
                className="relative overflow-hidden rounded-2xl group cursor-pointer bg-slate-100 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 aspect-[4/3] shadow-sm hover:shadow-xl transition-all duration-350"
              >
                {/* Image */}
                <div className="w-full h-full overflow-hidden flex items-center justify-center bg-slate-950">
                  <img
                    src={item.src}
                    alt={itemTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    style={{ transform: `rotate(${item.rotation || 0}deg)` }}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </div>

                {/* Actions overlay for editing, rotating, and deleting any photo (ONLY Admin) */}
                {isAdminMode && (
                  <div className="absolute top-4 left-4 z-20 flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleRotateItem(item.id, e)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-2 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
                      title={currentLang === 'fr' ? "Faire pivoter la photo" : "تدوير الصورة"}
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => startEditItem(item, e)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
                      title={currentLang === 'fr' ? "Modifier la photo" : "تعديل الصورة"}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => deleteItem(item.id, e)}
                      className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
                      title={currentLang === 'fr' ? "Supprimer la photo" : "حذف الصورة"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Frosted glass caption drawer sliding up on hover */}
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                  {/* Zoom indicator icon */}
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white transform -translate-y-2 group-hover:translate-y-0 transition-all duration-350">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                  
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-350 text-left rtl:text-right">
                    <span className="text-amber-400 font-extrabold text-[10px] uppercase tracking-wider mb-1.5 block">
                      {item.category === 'water' && t.galleryFilterWater}
                      {item.category === 'political' && t.galleryFilterPolitical}
                      {item.category === 'community' && t.galleryFilterCommunity}
                    </span>
                    <h3 className="text-white font-bold text-lg leading-tight font-display">
                      {itemTitle}
                    </h3>
                    <p className="text-slate-300 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                      {itemDesc}
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Empty state when no photos matched */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {currentLang === 'fr' ? "Aucune photo ne correspond à ce filtre." : "لا توجد صور تطابق هذا التصنيف."}
            </p>
          </div>
        )}

      </div>

      {/* Edit Gallery Item Modal Overlay */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-8 relative animate-scale-up text-left">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-6">
              {currentLang === 'fr' ? "Modifier les détails de la photo" : "تعديل تفاصيل الصورة"}
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Image Preview & Change Field */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  {currentLang === 'fr' ? "Aperçu de la photo (Cliquez pour remplacer)" : "معاينة الصورة (انقر لاستبدالها)"}
                </label>
                <div 
                  onClick={() => editFileInputRef.current?.click()}
                  className="relative group cursor-pointer border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden aspect-[16/10] bg-slate-50 dark:bg-slate-950 flex items-center justify-center"
                >
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEditFileInputChange}
                    className="hidden"
                  />
                  {editImage ? (
                    <>
                      <img 
                        src={editImage} 
                        alt="Edit preview" 
                        className="w-full h-full object-cover"
                        style={{ transform: `rotate(${editingItem.rotation || 0}deg)` }}
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-all">
                        {currentLang === 'fr' ? "Remplacer l'image" : "استبدال الصورة"}
                      </div>
                    </>
                  ) : editProgress ? (
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Upload className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                {editError && (
                  <p className="text-rose-500 text-xs mt-1">{editError}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  {currentLang === 'fr' ? "Catégorie" : "التصنيف / النشاط"}
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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

              {/* Title FR & AR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    {currentLang === 'fr' ? "Titre (Français)" : "العنوان (بالفرنسية)"}
                  </label>
                  <input
                    type="text"
                    value={editTitleFr}
                    onChange={(e) => setEditTitleFr(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 text-right">
                    {currentLang === 'fr' ? "Titre (Arabe)" : "العنوان (بالعربية)"}
                  </label>
                  <input
                    type="text"
                    value={editTitleAr}
                    onChange={(e) => setEditTitleAr(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm focus:outline-none text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Description FR & AR */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  {currentLang === 'fr' ? "Description (Français)" : "الوصف (بالفرنسية)"}
                </label>
                <textarea
                  value={editDescFr}
                  onChange={(e) => setEditDescFr(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1 text-right">
                  {currentLang === 'fr' ? "Description (Arabe)" : "الوصف (بالعربية)"}
                </label>
                <textarea
                  value={editDescAr}
                  onChange={(e) => setEditDescAr(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm focus:outline-none resize-none text-right"
                  dir="rtl"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {currentLang === 'fr' ? "Annuler" : "إلغاء"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 dark:bg-amber-500 text-white dark:text-slate-950 rounded-xl text-xs sm:text-sm font-extrabold hover:bg-blue-800 dark:hover:bg-amber-600 transition-colors shadow-md"
                >
                  {currentLang === 'fr' ? "Enregistrer" : "حفظ التعديلات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox full-screen overlay */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-4 sm:p-6"
          onClick={() => setLightboxIndex(null)}
          id="gallery-lightbox-overlay"
        >
          {/* Top Header details */}
          <div className="flex flex-wrap items-center justify-between text-white w-full max-w-7xl mx-auto py-2 border-b border-white/10 relative z-10 gap-3">
            <div className="text-left rtl:text-right">
              <span className="text-xs text-amber-400 font-black tracking-widest uppercase">
                {filteredItems[lightboxIndex].category === 'water' && t.galleryFilterWater}
                {filteredItems[lightboxIndex].category === 'political' && t.galleryFilterPolitical}
                {filteredItems[lightboxIndex].category === 'community' && t.galleryFilterCommunity}
              </span>
              <h3 className="text-sm sm:text-base font-bold font-display mt-0.5 animate-fade-in">
                {currentLang === 'fr' ? filteredItems[lightboxIndex].title.fr : filteredItems[lightboxIndex].title.ar}
              </h3>
            </div>

            {/* Interactive Zoom Toolbar for High Definition Zooming */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-white/15 px-3 py-1.5 rounded-2xl shadow-xl">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel(prev => Math.max(prev - 0.5, 0.8));
                }}
                disabled={zoomLevel <= 0.8}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-30"
                title={currentLang === 'fr' ? "Dézoomer" : "تصغير"}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              
              <span className="text-xs font-mono font-bold text-amber-400 px-1 min-w-[42px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel(prev => Math.min(prev + 0.5, 3.5));
                }}
                disabled={zoomLevel >= 3.5}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-30"
                title={currentLang === 'fr' ? "Zoomer HD" : "تكبير عالي الدقة"}
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {zoomLevel !== 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomLevel(1);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all text-[10px] font-bold"
                  title={currentLang === 'fr' ? "Taille réelle" : "الحجم الأصلي"}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            {/* Action buttons (Close + Rotate/Edit/Delete ONLY Admin) */}
            <div className="flex items-center gap-2">
              {isAdminMode && (
                <div className="flex gap-2 mr-2 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRotateItem(filteredItems[lightboxIndex].id);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                    title={currentLang === 'fr' ? "Faire pivoter" : "تدوير"}
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{currentLang === 'fr' ? "Pivoter" : "تدوير"}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditItem(filteredItems[lightboxIndex], e);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                    title={currentLang === 'fr' ? "Modifier" : "تعديل"}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>{currentLang === 'fr' ? "Modifier" : "تعديل"}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(filteredItems[lightboxIndex].id, e);
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                    title={currentLang === 'fr' ? "Supprimer" : "حذف"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{currentLang === 'fr' ? "Supprimer" : "حذف"}</span>
                  </button>
                </div>
              )}
              
              {/* Close Overlay btn */}
              <button
                onClick={() => {
                  setLightboxIndex(null);
                  setZoomLevel(1);
                }}
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full text-white transition-all shadow-md relative z-20"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Core Image Display & Arrows */}
          <div className="flex-1 flex items-center justify-center max-w-6xl mx-auto w-full relative my-4 overflow-hidden">
            {/* Left Button */}
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 z-10 bg-black/65 hover:bg-black/90 p-3 rounded-full text-white transition-all border border-white/15 shadow-xl"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Display Image with Ultra HD Crisp Zoom */}
            <div
              className="max-h-[65vh] sm:max-h-[75vh] w-full flex justify-center items-center overflow-auto p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filteredItems[lightboxIndex].src}
                alt="Lightbox Full view"
                className="max-h-full max-w-full object-contain rounded-xl shadow-2xl border border-white/10 transition-transform duration-200"
                style={{ 
                  transform: `rotate(${filteredItems[lightboxIndex].rotation || 0}deg) scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  imageRendering: 'high-quality'
                }}
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Right Button */}
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 z-10 bg-black/65 hover:bg-black/90 p-3 rounded-full text-white transition-all border border-white/15 shadow-xl"
              aria-label="Next Image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Descriptive Caption Card + Share Buttons */}
          <div className="bg-slate-900/90 border border-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 text-white max-w-3xl mx-auto w-full text-center relative z-10 space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {currentLang === 'fr' ? filteredItems[lightboxIndex].description.fr : filteredItems[lightboxIndex].description.ar}
            </p>

            {/* Social Share buttons */}
            <div className="flex justify-center border-t border-white/10 pt-3">
              <ShareButtons
                title={currentLang === 'fr' ? filteredItems[lightboxIndex].title.fr : filteredItems[lightboxIndex].title.ar}
                description={currentLang === 'fr' ? filteredItems[lightboxIndex].description.fr : filteredItems[lightboxIndex].description.ar}
                currentLang={currentLang}
                compact={true}
              />
            </div>

            <div className="text-slate-500 font-bold text-xs">
              {`${lightboxIndex + 1} / ${filteredItems.length}`}
            </div>
          </div>

        </div>
      )}

    </section>
  );
};

