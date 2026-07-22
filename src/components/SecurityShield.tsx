import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, EyeOff, Lock } from 'lucide-react';

export function SecurityShield() {
  const [securityAlert, setSecurityAlert] = useState<{
    show: boolean;
    reason: 'inspect' | 'rightclick' | 'shortcut' | 'tampering';
    time: string;
  } | null>(null);

  useEffect(() => {
    // 1. Prevent Right-Click (anti-copy/anti-scraping)
    const handleContextMenu = (e: MouseEvent) => {
      // Allow only within standard safe fields if necessary, else block
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      e.preventDefault();
      triggerAlert('rightclick');
    };

    // 2. Prevent Developer Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J, Ctrl+U)
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        triggerAlert('shortcut');
        return;
      }

      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        triggerAlert('shortcut');
        return;
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        triggerAlert('shortcut');
        return;
      }

      // Ctrl+S (Save Page)
      if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        triggerAlert('shortcut');
        return;
      }
    };

    // 3. DevTools Detection & Console Protection
    let lastTime = Date.now();
    const devToolsDetector = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      // Check speed of debugger/execution to detect debugger statement pause (tampering detection)
      const startTime = performance.now();
      debugger; // This will pause and cause a large delta if DevTools are open
      const endTime = performance.now();

      if (endTime - startTime > 100) {
        triggerAlert('tampering');
      }

      if (widthThreshold || heightThreshold) {
        // DevTools likely docked
        triggerAlert('inspect');
      }
    };

    // Safe trigger handler
    const triggerAlert = (reason: 'inspect' | 'rightclick' | 'shortcut' | 'tampering') => {
      setSecurityAlert({
        show: true,
        reason,
        time: new Date().toLocaleTimeString(),
      });
      
      // Clear console to wipe any scraped or printed secrets/state
      console.clear();
      console.warn('%c🛡️ PROTECTION SÉCURISÉE ACTIVÉE 🛡️', 'font-size: 24px; color: #f59e0b; font-weight: bold;');
      console.warn('%cLe code source et les données de cette application sont cryptés et protégés contre le vol, le piratage et le scraping.', 'font-size: 14px; color: #fff;');
    };

    // Set up listeners
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    // Periodically run DevTools inspector detection loop
    const interval = setInterval(devToolsDetector, 2500);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, []);

  // Automatically dismiss on-screen warning banner after 4 seconds
  useEffect(() => {
    if (securityAlert?.show) {
      const timer = setTimeout(() => {
        setSecurityAlert(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [securityAlert]);

  // No longer rendering any on-screen warning banner to ensure absolute stealth,
  // but all background hooks, event listeners, and detection remain 100% active.
  return null;
}
