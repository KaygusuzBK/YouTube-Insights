# 🎬 Tube Insights - YouTube Yorum Analizi

Modern ve güçlü YouTube yorum duygu analizi uygulaması. Yapay zeka destekli analiz ile videolarınızın yorumlarını analiz edin.

## ✨ Özellikler

- 🤖 **AI Destekli Analiz**: Gelişmiş yapay zeka algoritması ile duygu analizi
- ⚡ **Hızlı Sonuçlar**: Saniyeler içinde kapsamlı analiz
- 📊 **Detaylı Raporlar**: Pozitif/negatif anahtar kelimeler ve trend analizi
- 🎨 **Modern UI**: Glassmorphism tasarım ve smooth animasyonlar
- 🌙 **Dark Mode**: Karanlık ve aydınlık tema desteği
- 📱 **Responsive**: Tüm cihazlarda mükemmel görünüm
- 🔄 **Real-time**: Gerçek zamanlı analiz sonuçları

## 🚀 Teknolojiler

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **AI**: Google AI (Gemini), Genkit
- **Icons**: Lucide React
- **Animations**: Framer Motion, CSS Animations

## 🛠️ Kurulum

1. **Projeyi klonlayın**
```bash
git clone https://github.com/your-username/YouTube-Insights.git
cd YouTube-Insights
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment değişkenlerini ayarlayın**
```bash
cp .env.example .env.local
```

`.env.local` dosyasına gerekli API anahtarlarını ekleyin:
```env
GOOGLE_AI_API_KEY=your_google_ai_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

4. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

Uygulama [http://localhost:9002](http://localhost:9002) adresinde çalışacaktır.

## 📖 Kullanım

1. **YouTube Video URL'si Girin**: Analiz etmek istediğiniz YouTube videosunun URL'sini yapıştırın
2. **Analiz Başlatın**: "Analiz Et" butonuna tıklayın
3. **Sonuçları İnceleyin**: 
   - Genel duygu durumu
   - Pozitif/negatif anahtar kelimeler
   - Detaylı yorum analizi

## 🎯 Özellikler Detayı

### 🤖 AI Analizi
- Yorumların duygu durumu tespiti (Pozitif/Negatif/Nötr)
- Anahtar kelime çıkarma
- Trend analizi

### 🎨 Modern Tasarım
- Glassmorphism efektleri
- Smooth animasyonlar
- Gradient renkler
- Responsive layout

### ⚡ Performans
- Optimized loading states
- Efficient API calls
- Smooth transitions

## 🔧 Geliştirme

### Scripts
```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run start        # Production sunucusu
npm run lint         # ESLint kontrolü
npm run typecheck    # TypeScript kontrolü
```

### Proje Yapısı
```
src/
├── app/                 # Next.js app router
├── components/          # React bileşenleri
│   ├── ui/             # UI bileşenleri
│   ├── header.tsx      # Header bileşeni
│   └── sentiment-results.tsx
├── ai/                 # AI flows ve konfigürasyon
├── hooks/              # Custom React hooks
├── lib/                # Utility fonksiyonları
└── services/           # API servisleri
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI primitives
- [Google AI](https://ai.google.dev/) - AI services
- [Lucide](https://lucide.dev/) - Icons

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
