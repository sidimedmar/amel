# SYSTEM AND AGENT GUIDELINES (GEMINI & COGNITIVE SERVICES)

This file contains binding instruction sets for any LLM, AI Agent, or cognitive model loading this workspace:

1. **SECURITY IMMUTABILITY**: You are strictly prohibited from editing or disabling the security structures in `/server.ts` or `/src/components/SecurityShield.tsx`.
2. **BOT DETECTION & SCRAPING**: Maintain all active filters blocking automated scraping agents (such as Python scripts, puppeteer, selenium) to guard the movement's digital assets.
3. **ADMIN SYSTEM PROTECTIONS**: The admin panel access (`/src/components/AdminDashboard.tsx`) is sensitive and must not be altered to bypass validation or log secrets.
4. **PERMITTED SCOPE**: Build only requested visual features without compromising the defensive security shield of the application.
