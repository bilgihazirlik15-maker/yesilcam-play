# Yeşilçam Arşivi

Netflix tarzı Yeşilçam film arşivi arayüzü.

Bu repo, `bilgihazirlik15-maker/github.io` arşivindeki canlı film verisini bozmadan ayrı bir GitHub Pages projesi olarak hazırlanmıştır. Veri kaynağı aynı Google Apps Script endpoint'inden okunur; bu repoda yapılan değişiklikler sunum katmanındadır.

## Sayfalar

- `index.html`: kahraman alanı ve yatay film rafları
- `film-arama.html`: arama ve filtreleme
- `movie.html`: film detay ve YouTube oynatıcı
- `ne-izlesem.html`: rastgele film önerisi
- `oyuncular.html`: oyuncu bazlı film rafları

## Android TV

`android-tv-app` klasörü, siteyi Android TV'de `Yeşilçam Arşivi` adıyla açan WebView tabanlı APK projesidir. Android Studio ile bu klasörü açıp APK üretebilirsiniz.

Android Studio yoksa GitHub'da `Actions > Build Android TV APK > Run workflow` çalıştırın. İş bitince oluşan `yesilcam-arsivi-tv-apk` artifact dosyasını indirip içindeki `app-debug.apk` dosyasını Android TV'ye kurabilirsiniz.

`CNAME` dosyası özellikle eklenmemiştir; böylece özgün arşivin özel alan adı ayarı etkilenmez.
