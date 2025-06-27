# Dwello – Your Financial World, Visualized

**Dwello** is a Gen Z-focused, AI-powered financial advisor that transforms spending habits into a living, evolving pixel-art environment. It blends large language models with generative visuals to create a gamified, emotionally resonant budgeting experience.

---

## What It Does

- **Conversational Finance Guidance**  
  Input your expenses, income, or financial queries. Dwello's AI classifies the behavior (e.g., saving, overspending) and responds with tailored advice.

- **Dynamic Pixel Room**  
  Your virtual room evolves with your financial behavior. Saving habits light up the space with upgrades. Overspending causes visual decay.

- **Personalized Experience**  
  During onboarding, Dwello collects your financial profile (e.g., student/freelancer, average income, goals) to personalize all responses and thresholds.

- **Money Bar + State Log**  
  A live money bar tracks your progress toward financial goals. A visual timeline logs actions like saving, spending, and income received.

---

## How It Works

1. **User Input**  
   Text-based entries: "I bought coffee for ₹200", or "My freelance gig paid ₹6000".

2. **LangChain + OpenAI GPT**  
   Prompts include user profile and context. GPT classifies behavior and generates concise, relevant advice.

3. **Behavior Mapping**  
   Classified behavior updates a predefined pixel state:  
   `saving → upgrade`, `overspending → decay`, `neutral → no change`.

4. **Visual Update**  
   p5.js or Canvas API renders the updated pixel room and overlays advice through the chat UI.

---

## Tech Stack

### Frontend  
- HTML, CSS, JavaScript  
- TailwindCSS  
- p5.js / Canvas API (pixel visuals)

### AI & Logic  
- OpenAI GPT API  
- LangChain.js (prompt chaining, memory)  
- OpenAI Embeddings (semantic context)

### Backend & Storage  
- Supabase (auth, user profile, financial logs)  
- Fallback: LocalStorage (demo mode)

### Deployment  
- GitHub Pages / Vercel  

---

## Features

- Real-time AI-powered financial advice  
- Pixel-art room that reflects your behavior  
- Personalized goal tracking  
- Financial event timeline  
- Visual gamification of money habits  
- Mobile & desktop responsive layout  

---

## Theme Alignment: *Art & Code in Harmony*

Dwello converts raw financial data into ambient, generative visuals. It removes abstraction and lets users see, feel, and inhabit their financial reality—merging code logic with artistic feedback.

---

## Inspiration

Gen Z doesn’t respond to spreadsheets. Dwello offers feedback they can live inside. It’s not a chart—it’s a changing world. It’s not an app—it’s a reflection.

---

## Folder Structure (Prototype)


---

## Screenshots

---

## Known Limitations

- LLM response latency may affect real-time UX  
- Supabase rate limits in free tier  
- Canvas rendering can conflict with UI refreshes if not isolated  

---

## Team

Built during **Pixel Palettes 2025 Hackathon**  
Presented by: Crafting Lords  
Powered by: OpenAI, Supabase, LangChain, p5.js

---
