/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-16 h-16", showText = false, onClick }) => {
  return (
    <div 
      className={`flex items-center gap-3 ${showText ? 'flex-row' : ''} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <svg
        className={`${className} transition-transform hover:rotate-3 duration-300`}
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        id="amel-hassi-logo-svg"
      >
        {/* Golden Gradient Ring */}
        <circle cx="200" cy="200" r="185" stroke="url(#gold-gradient)" strokeWidth="6" fill="#FDFBF7" />
        <circle cx="200" cy="200" r="180" stroke="#B45309" strokeWidth="1" fill="none" />
        
        {/* Inner Golden Ring */}
        <circle cx="200" cy="200" r="155" stroke="url(#gold-gradient)" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />

        {/* --- Palm Trees --- */}
        {/* Left Palm Tree */}
        <g id="left-palm" transform="translate(60, 160) scale(0.65)">
          {/* Trunk */}
          <path d="M40,240 Q45,150 20,40 Q25,150 45,240 Z" fill="#78350F" />
          <path d="M40,240 Q45,150 20,40" stroke="#92400E" strokeWidth="1.5" fill="none" />
          <path d="M40,220 C43,200 35,180 25,160" stroke="#5F370E" strokeWidth="1" fill="none" />
          <path d="M41,180 C44,160 36,140 23,120" stroke="#5F370E" strokeWidth="1" fill="none" />
          {/* Leaves */}
          <path d="M20,40 Q-40,20 -70,50 Q-30,40 20,40" fill="#15803D" />
          <path d="M20,40 Q-30,-10 -50,-40 Q-15,-10 20,40" fill="#166534" />
          <path d="M20,40 Q0,-40 30,-70 Q20,-30 20,40" fill="#15803D" />
          <path d="M20,40 Q40,-30 80,-40 Q40,-10 20,40" fill="#166534" />
          <path d="M20,40 Q60,20 90,50 Q40,30 20,40" fill="#15803D" />
          <path d="M20,40 Q10,10 -20,100 Q10,50 20,40" fill="#166534" />
          <path d="M20,40 Q30,10 60,100 Q30,50 20,40" fill="#15803D" />
        </g>

        {/* Right Palm Tree */}
        <g id="right-palm" transform="translate(340, 160) scale(0.65) scale(-1, 1)">
          {/* Trunk */}
          <path d="M40,240 Q45,150 20,40 Q25,150 45,240 Z" fill="#78350F" />
          <path d="M40,240 Q45,150 20,40" stroke="#92400E" strokeWidth="1.5" fill="none" />
          {/* Leaves */}
          <path d="M20,40 Q-40,20 -70,50 Q-30,40 20,40" fill="#15803D" />
          <path d="M20,40 Q-30,-10 -50,-40 Q-15,-10 20,40" fill="#166534" />
          <path d="M20,40 Q0,-40 30,-70 Q20,-30 20,40" fill="#15803D" />
          <path d="M20,40 Q40,-30 80,-40 Q40,-10 20,40" fill="#166534" />
          <path d="M20,40 Q60,20 90,50 Q40,30 20,40" fill="#15803D" />
          <path d="M20,40 Q10,10 -20,100 Q10,50 20,40" fill="#166534" />
        </g>

        {/* --- Dove of Peace (Top Center) --- */}
        <g id="white-dove" transform="translate(155, 30) scale(0.9)">
          {/* Left Wing */}
          <path d="M40,55 C20,35 15,10 5,-10 C20,0 35,15 45,30 C38,15 30,-5 20,-25 C35,-15 45,10 50,25 C45,5 40,-15 35,-35 C50,-20 55,10 60,35" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          {/* Right Wing */}
          <path d="M55,30 C65,10 75,-20 90,-35 C85,-15 80,5 75,25 C85,10 95,-10 105,-25 C95,-10 90,5 85,30 C95,20 110,10 120,0 C105,15 95,30 80,45" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          {/* Body */}
          <path d="M35,55 C40,40 50,30 65,30 C80,30 90,40 85,55 C80,65 70,75 55,75 C42,75 35,65 35,55 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          {/* Tail */}
          <path d="M55,75 C50,90 45,105 35,115 C50,105 60,95 65,75 C60,95 70,105 85,115 C75,105 70,90 65,75" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          {/* Head & Beak */}
          <path d="M35,55 C30,53 25,48 24,43 C26,45 30,46 33,48 Z" fill="#F59E0B" /> {/* Beak */}
          <circle cx="30" cy="50" r="1.5" fill="#1E293B" /> {/* Eye */}
          
          {/* Olive Branch in Beak */}
          <path d="M24,43 Q12,42 0,45" stroke="#15803D" strokeWidth="1.5" fill="none" />
          <path d="M12,42 Q8,36 10,32 Q12,38 12,42" fill="#22C55E" />
          <path d="M6,43 Q2,38 4,34 Q6,40 6,43" fill="#22C55E" />
          <path d="M16,42 Q16,35 20,33 Q18,39 16,42" fill="#22C55E" />
        </g>

        {/* --- Main Text (Middle) --- */}
        {/* Large "أمل" (Amel) Calligraphy-style shape */}
        <text
          x="200"
          y="235"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="72"
          fill="#0B4393"
          textAnchor="middle"
          id="amel-main-text"
        >
          أمل
        </text>

        {/* "حاسي البكاي" (Hassi El Bkay) Text */}
        <text
          x="200"
          y="280"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="bold"
          fontSize="24"
          fill="#1E293B"
          textAnchor="middle"
          letterSpacing="0.5"
          id="hassi-elbkay-subtext"
        >
          حاسي البكاي
        </text>

        {/* Gold Horizontal divider */}
        <line x1="100" y1="295" x2="300" y2="295" stroke="url(#gold-gradient)" strokeWidth="1.5" />

        {/* --- Three Pillar Circular Icons (Bottom) --- */}
        {/* Separator Lines */}
        <line x1="165" y1="305" x2="165" y2="345" stroke="#E2E8F0" strokeWidth="1" />
        <line x1="235" y1="305" x2="235" y2="345" stroke="#E2E8F0" strokeWidth="1" />

        {/* Pillar 1: وعي (Conscience) - Right side in Arabic order */}
        <g id="pillar-awareness" transform="translate(265, 325)">
          <circle cx="0" cy="-12" r="14" stroke="#0B4393" strokeWidth="1" fill="#EFF6FF" />
          {/* Minimal Book Icon */}
          <path d="M-6,-16 L0,-14 L6,-16 L6,-8 L0,-10 L-6,-8 Z" fill="#0B4393" />
          <text x="0" y="16" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" fontSize="12" fill="#1E293B" textAnchor="middle">وعي</text>
        </g>

        {/* Pillar 2: مشاركة (Participation) - Center */}
        <g id="pillar-participation" transform="translate(200, 325)">
          <circle cx="0" cy="-12" r="14" stroke="#D97706" strokeWidth="1" fill="#FEF3C7" />
          {/* Minimal Users Icon */}
          <circle cx="-4" cy="-12" r="3" fill="#D97706" />
          <circle cx="4" cy="-12" r="3" fill="#D97706" />
          <path d="M-8,-6 C-8,-9 -4,-9 -4,-9 C-4,-9 0,-9 0,-6" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M0,-6 C0,-9 4,-9 4,-9 C4,-9 8,-9 8,-6" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <text x="0" y="16" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" fontSize="12" fill="#1E293B" textAnchor="middle">مشاركة</text>
        </g>

        {/* Pillar 3: تنمية (Développement) - Left side */}
        <g id="pillar-development" transform="translate(135, 325)">
          <circle cx="0" cy="-12" r="14" stroke="#10B981" strokeWidth="1" fill="#ECFDF5" />
          {/* Minimal Sprout/Plant Icon */}
          <path d="M0,-5 L0,-17" stroke="#10B981" strokeWidth="1.5" />
          <path d="M0,-14 Q-5,-18 -4,-20 Q0,-18 0,-14" fill="#10B981" />
          <path d="M0,-11 Q5,-15 4,-17 Q0,-15 0,-11" fill="#10B981" />
          <text x="0" y="16" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" fontSize="12" fill="#1E293B" textAnchor="middle">تنمية</text>
        </g>

        {/* Olive Branch Bottom Garland */}
        <g id="bottom-garland" transform="translate(140, 360)">
          <path d="M0,0 Q60,15 120,0" stroke="#15803D" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Leaves */}
          <path d="M15,2 Q10,-5 5,-3 Q10,2 15,2" fill="#166534" />
          <path d="M35,5 Q30,-2 25,0 Q30,5 35,5" fill="#15803D" />
          <path d="M55,6 Q50,-1 45,1 Q50,6 55,6" fill="#166534" />
          <path d="M75,5 Q70,-2 65,0 Q70,5 75,5" fill="#15803D" />
          <path d="M95,3 Q90,-4 85,-2 Q90,3 95,3" fill="#166534" />
          <path d="M105,1 Q100,-6 95,-4 Q100,1 105,1" fill="#15803D" />
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D97706" />   {/* Dark Gold */}
            <stop offset="35%" stopColor="#F59E0B" />  {/* Medium Gold */}
            <stop offset="70%" stopColor="#FBBF24" />  {/* Light Gold */}
            <stop offset="100%" stopColor="#B45309" /> {/* Bronze Gold */}
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div className="flex flex-col select-none">
          <span className="text-xl font-black tracking-wide text-blue-900 dark:text-amber-100 font-display leading-none">
            أمل حاسي البكاي
          </span>
          <span className="text-[10px] font-semibold tracking-widest text-amber-600 dark:text-amber-400 uppercase leading-normal">
            Amel Hassi El Bekay
          </span>
        </div>
      )}
    </div>
  );
};
