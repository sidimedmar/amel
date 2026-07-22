/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Crop, RotateCw, ZoomIn, ZoomOut, Check, Sliders, RefreshCw, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Language } from '../types';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBase64: string) => void;
  currentLang: Language;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  currentLang,
}) => {
  const [aspectRatio, setAspectRatio] = useState<'free' | '16:9' | '4:3' | '1:1'>('16:9');
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
      img.onload = () => {
        imgRef.current = img;
        setZoom(1);
        setRotation(0);
        setPan({ x: 0, y: 0 });
      };
    }
  }, [imageSrc]);

  if (!isOpen || !imageSrc) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const generateCroppedHDImage = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;

    const canvas = document.createElement('canvas');
    let targetWidth = 1920;
    let targetHeight = 1080;

    if (aspectRatio === '1:1') {
      targetWidth = 1200;
      targetHeight = 1200;
    } else if (aspectRatio === '4:3') {
      targetWidth = 1600;
      targetHeight = 1200;
    } else if (aspectRatio === 'free') {
      targetWidth = img.width > 2400 ? 2400 : Math.max(img.width, 1200);
      targetHeight = Math.round((targetWidth / img.width) * img.height);
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Dark background fill
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Aspect ratio cover calculation to prevent squashing or stretching
      const imgAspect = img.width / img.height;
      const targetAspect = targetWidth / targetHeight;

      let renderW = targetWidth;
      let renderH = targetHeight;

      if (imgAspect > targetAspect) {
        renderH = targetHeight;
        renderW = targetHeight * imgAspect;
      } else {
        renderW = targetWidth;
        renderH = targetWidth / imgAspect;
      }

      ctx.save();
      ctx.translate(targetWidth / 2, targetHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Pan adjustment relative to centered scaled image
      const drawX = -renderW / 2 + pan.x;
      const drawY = -renderH / 2 + pan.y;

      ctx.drawImage(img, drawX, drawY, renderW, renderH);
      ctx.restore();

      // Export Ultra Sharp HD Base64 JPEG (Quality 0.96)
      const croppedData = canvas.toDataURL('image/jpeg', 0.96);
      onCropComplete(croppedData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold font-display">
              {currentLang === 'fr' 
                ? "Recadrage & Optimisation HD de l'image" 
                : "قص ومعالجة الصورة لرفع الدقة"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Image Preview Crop Stage */}
        <div 
          className="relative flex-1 bg-slate-950 min-h-[300px] sm:min-h-[380px] overflow-hidden flex items-center justify-center select-none cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="transition-transform duration-75 origin-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`
            }}
          >
            <img
              src={imageSrc}
              alt="Crop preview"
              className="max-h-[50vh] max-w-[80vw] object-contain shadow-2xl rounded-lg"
              draggable={false}
            />
          </div>

          {/* Grid Overlay Guide */}
          <div className="absolute inset-8 border-2 border-amber-400/50 pointer-events-none rounded-xl grid grid-cols-3 grid-rows-3">
            <div className="border-r border-b border-amber-400/20" />
            <div className="border-r border-b border-amber-400/20" />
            <div className="border-b border-amber-400/20" />
            <div className="border-r border-b border-amber-400/20" />
            <div className="border-r border-b border-amber-400/20" />
            <div className="border-b border-amber-400/20" />
            <div className="border-r border-amber-400/20" />
            <div className="border-r border-amber-400/20" />
            <div />
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="p-5 bg-slate-900 border-t border-slate-800 space-y-4">
          
          {/* Aspect Ratio Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-white">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentLang === 'fr' ? "Format de cadrage:" : "نسبة العرض:"}
            </span>

            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              {[
                { id: '16:9', label: '16:9 Landscape' },
                { id: '4:3', label: '4:3 Standard' },
                { id: '1:1', label: '1:1 Carré' },
                { id: 'free', label: 'Libre' }
              ].map(fmt => (
                <button
                  key={fmt.id}
                  onClick={() => setAspectRatio(fmt.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    aspectRatio === fmt.id ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom & Rotation Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-white">
              <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
            </div>

            {/* Rotation Button */}
            <div className="flex items-center justify-between bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-white">
              <span className="text-xs font-bold text-slate-400">
                {currentLang === 'fr' ? "Orientation:" : "الدوران:"} {rotation}°
              </span>
              <button
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg text-xs font-bold text-amber-400 transition-all"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>+90°</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              {currentLang === 'fr' ? "Annuler" : "إلغاء"}
            </button>

            <button
              type="button"
              onClick={generateCroppedHDImage}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all flex items-center gap-2 shadow-lg"
            >
              <Check className="w-4 h-4" />
              <span>{currentLang === 'fr' ? "Valider & Importer en HD" : "حفظ واستيراد بجودة عالية"}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
