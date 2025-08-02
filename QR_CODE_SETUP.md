# QR Kod Kurulum Rehberi

## 📱 Buy Me a Coffee QR Kodunuzu Ekleyin

### 1. QR Kod Resminizi Hazırlayın
- Buy Me a Coffee'dan QR kodunuzu indirin
- Resim formatı: PNG, JPG veya JPEG
- Önerilen boyut: 300x300px veya daha büyük

### 2. Resmi Projeye Ekleyin
```bash
# QR kod resminizi public klasörüne kopyalayın
cp /path/to/your/qr-code.png public/buy-me-a-coffee.png
```

### 3. Dosya Adı Önemli
Resminizin adı tam olarak `buy-me-a-coffee.png` olmalıdır.

### 4. Desteklenen Formatlar
- ✅ PNG (önerilen)
- ✅ JPG/JPEG
- ✅ WebP

### 5. Test Edin
1. Projeyi yeniden başlatın: `npm run dev`
2. Sayfayı yenileyin
3. 2 saniye bekleyin - popup otomatik açılacak
4. QR kodunuzun göründüğünü kontrol edin

### 6. Sorun Giderme

**QR kod görünmüyor:**
- Dosya adını kontrol edin: `buy-me-a-coffee.png`
- Dosyanın `public/` klasöründe olduğundan emin olun
- Resim formatının desteklendiğini kontrol edin

**Fallback görünüyor:**
- Resim yüklenemediğinde otomatik olarak simülasyon gösterilir
- Bu normal bir durumdur, resim yüklendikten sonra gerçek QR kod görünecektir

### 7. Özelleştirme

**Farklı dosya adı kullanmak istiyorsanız:**
`src/components/buy-me-coffee-popup.tsx` dosyasında şu satırı değiştirin:

```tsx
<Image
  src="/buy-me-a-coffee.png"  // ← Bu satırı değiştirin
  alt="Buy Me a Coffee QR Code"
  fill
  className="object-contain rounded-lg"
  onError={() => setImageError(true)}
  priority
/>
```

### 8. Link Güncelleme

**✅ Güncel Buy Me Coffee Linki:**
`https://buymeacoffee.com/KaygusuzBK`

Bu link zaten `src/components/buy-me-coffee-popup.tsx` dosyasında ayarlanmıştır.

---

## 🎯 Sonuç

QR kodunuzu ekledikten sonra:
- ✅ Sayfa yüklendiğinde otomatik popup
- ✅ Header'da "Destekle" butonu
- ✅ Gerçek QR kod görüntüleme
- ✅ Responsive tasarım
- ✅ Dark mode desteği
- ✅ Gerçek Buy Me Coffee linki: https://buymeacoffee.com/KaygusuzBK

Her şey hazır! 🚀 