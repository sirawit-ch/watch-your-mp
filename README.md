# 🗳️ Watch Your MP - Thai Parliament Voting Visualization

> **เว็บแอปพลิเคชันสำหรับติดตามและวิเคราะห์การลงมติของสมาชิกสภาผู้แทนราษฎร (ส.ส.) ในประเทศไทย**

[![Deploy to GitHub Pages](https://github.com/sirawit-ch/sirawit-ch.github.io/actions/workflows/nextjs.yml/badge.svg)](https://github.com/sirawit-ch/sirawit-ch.github.io/actions/workflows/nextjs.yml)

🔗 **Live Demo:** [https://sirawit-ch.github.io/watch-your-mp/](https://sirawit-ch.github.io/watch-your-mp/)

---

## 📖 About

**Watch Your MP** เป็น data visualization project ที่แสดงข้อมูลการลงมติของ ส.ส. ในรัฐสภาไทยผ่านแผนที่ประเทศไทยแบบ interactive โดยใช้ระบบไล่สีแบบ gradient เพื่อแสดงสัดส่วนการลงมติในแต่ละจังหวัด

สร้างขึ้นเพื่อการศึกษาในรายวิชา **Data Information Visualization** ปีการศึกษา 2025

---

## ✨ Key Features

### 🗺️ Interactive Thailand Map

- **Tile Grid Visualization** - แสดงแผนที่จังหวัดทั้งหมดในประเทศไทย
- **Gradient Color System** - ระบบไล่สีแบบต่อเนื่องตามสัดส่วนการลงมติ (0-100%)
- **Hover Tooltip** - แสดงสถิติการลงมติเมื่อวางเมาส์บนจังหวัด
- **Click to Explore** - คลิกเพื่อดูรายชื่อ ส.ส. ในจังหวัดนั้นๆ
- **Zoom & Pan** - ซูมและเลื่อนแผนที่ด้วย D3.js

### 🎯 Smart Filtering

- **Vote Event Selection** - เลือกดูการลงมติในแต่ละญัตติ/กฎหมาย
- **Vote Option Filter** - กรองตามผลการลงมติ (เห็นด้วย, ไม่เห็นด้วย, งดออกเสียง, ฯลฯ)
- **Dynamic Heatmap** - สีแผนที่เปลี่ยนตามตัวกรองแบบ real-time
- **Winning Vote Display** - แสดงผลโหวตที่ชนะในแต่ละจังหวัด (เมื่อเลือก "ทั้งหมด")

### 📊 MP Information Panel

- **Province-based Listing** - แสดงรายชื่อ ส.ส. จากจังหวัดที่เลือก
- **Vote Statistics** - สถิติการลงมติของ ส.ส. แต่ละคน
- **Party Affiliation** - ข้อมูลพรรคการเมืองและเขตเลือกตั้ง
- **Responsive Design** - ปรับขนาดตามเนื้อหาอัตโนมัติ

### 🎨 Color Legend

- **Dynamic Legend** - คำอธิบายสีที่เปลี่ยนตามตัวกรอง
- **Gradient Bar** - แสดงช่วงสีแบบ gradient (120px fixed width)
- **Positioned UI** - อยู่มุมซ้ายล่างของแผนที่แบบ fixed

---

## 🛠️ Tech Stack

### Frontend Framework

- **[Next.js 16.0.0](https://nextjs.org/)** - React framework with App Router
- **[React 19.2.0](https://react.dev/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe development

### Data Visualization

- **[D3.js 7.9.0](https://d3js.org/)** - Data-driven DOM manipulation
- **[d3-geo 3.1.1](https://github.com/d3/d3-geo)** - Geographic projections
- **Custom Gradient System** - Hex color interpolation algorithm

### UI Components & Styling

- **[Material-UI 7.3.5](https://mui.com/)** - React UI components
- **[Emotion 11.14](https://emotion.sh/)** - CSS-in-JS
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS

### Data Processing

- **Python 3** - Data pipeline scripts
- **pandas** - Data transformation
- **GraphQL API** - Politigraph WeVis API integration

### Deployment

- **GitHub Actions** - CI/CD automation
- **GitHub Pages** - Static site hosting
- **Environment Variables** - Configuration management

---

## 🚀 Getting Started

### Prerequisites

```bash
node >= 20.x
npm >= 10.x
python >= 3.x (for data updates)
```

### Installation

```bash
# Clone repository
git clone https://github.com/sirawit-ch/sirawit-ch.github.io.git
cd sirawit-ch.github.io

# Install dependencies
npm install

# Set up environment variables (create .env.local)
# NEXT_PUBLIC_BASE_PATH=
# NEXT_PUBLIC_DATA_PATH=/data/new-data
```

### Development

```bash
# Run development server
npm run dev

# Open browser at http://localhost:3000
```

### Build for Production

```bash
# Build static export
npm run build

# Output will be in ./out/ directory
```

### Update Data (Optional)

```bash
# Update JSON data from GraphQL API
npm run data:update

# Update data and rebuild
npm run data:update-and-build
```

---

## 📁 Project Structure

```
politigraph-webapp/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main application page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── dataHelpers.ts            # Data processing utilities
├── components/                   # React components
│   ├── ThailandMap.tsx          # D3.js map visualization
│   ├── FilterPanel.tsx          # Vote filter controls
│   ├── InfoPanel.tsx            # MP information display
│   ├── MapLegend.tsx            # Color legend component
│   ├── MapTooltip.tsx           # Hover tooltip
│   └── Statistics.tsx           # Stats overview
├── lib/                          # Utility libraries
│   ├── new-api.ts               # Data fetching API
│   ├── types.ts                 # TypeScript interfaces
│   ├── constants.ts             # Color constants
│   ├── colorUtils.ts            # Gradient calculations
│   └── metadata.ts              # Data metadata
├── public/                       # Static assets
│   └── data/new-data/           # JSON data files
│       ├── person_data.json
│       ├── person_vote_data.json
│       ├── fact_data.json
│       └── vote_detail_data.json
├── scripts/                      # Python data pipeline
│   └── generate-new-data.py
├── .github/workflows/            # CI/CD workflows
│   ├── nextjs.yml               # Deployment workflow
│   └── update-data.yml          # Data update workflow
├── .env.local                    # Local environment config
├── .env.production              # Production environment config
└── next.config.ts               # Next.js configuration
```

---

## 🎨 Color System

### Gradient Color Mapping

| Vote Option         | Light Color | Dark Color | Usage          |
| ------------------- | ----------- | ---------- | -------------- |
| **เห็นด้วย**        | `#5b83c2`   | `#2d3470`  | Agree votes    |
| **ไม่เห็นด้วย**     | `#ff9d87`   | `#be4d38`  | Disagree votes |
| **งดออกเสียง**      | `#b8b8b8`   | `#3f4040`  | Abstain votes  |
| **ไม่ลงคะแนนเสียง** | `#f4be94`   | `#a26426`  | No vote        |
| **ลา/ขาดลงมติ**     | `#b6b6a9`   | `#5c5a4b`  | Absent         |

**Algorithm:** Linear interpolation based on vote portion (0-100%)

---

## 🔧 Environment Variables

### Development (`.env.local`)

```bash
NEXT_PUBLIC_BASE_PATH=
NEXT_PUBLIC_DATA_PATH=/data/new-data
```

### Production (`.env.production` / GitHub Actions)

```bash
NEXT_PUBLIC_BASE_PATH=/watch-your-mp
NEXT_PUBLIC_DATA_PATH=/data/new-data
```

---

## 🚀 Deployment

### Automatic Deployment (GitHub Actions)

1. **Push to `main` branch** triggers automatic build
2. **Environment variables** injected during build
3. **Static site** deployed to GitHub Pages
4. **Live at:** `https://sirawit-ch.github.io/watch-your-mp/`

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy ./out/ directory to hosting service
```

---

## 📊 Data Flow

```
GraphQL API (WeVis Politigraph)
    ↓
Python Data Pipeline (generate-new-data.py)
    ↓
Static JSON Files (public/data/new-data/)
    ↓
Next.js App (Client-side Fetch)
    ↓
React Components (D3.js Visualization)
    ↓
User Interface (Interactive Map)
```

---

## 🤝 Contributing

This is an academic project. Here is our team!
- รินรดา คงเมือง
- ศิรวิชญ์ เจริญวุฒิ 
- ธนชาติ พงศติวัฒนากุล
- สุวิจักขณ์ ราคา
- ภาสพล พลายละหาร
- รชต วรสาร 

---

## 📄 License

Created for educational purposes - Data Information Visualization Course, 2025

---

## 🙏 Acknowledgments

- **Data Source:** [Politigraph by WeVis](https://politigraph.wevis.info/)
- **Built with:** Next.js, React, D3.js, Material-UI, Tailwind CSS

---
