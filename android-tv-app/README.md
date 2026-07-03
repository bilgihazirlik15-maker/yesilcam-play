# Yeşilçam Arşivi Android TV

Bu klasör, yayındaki web sitesini Android TV'de uygulama olarak açan basit bir WebView wrapper projesidir.

## APK üretme

Android Studio yoksa repoda `Actions > Build Android TV APK > Run workflow` çalıştırın. İş bittikten sonra `yesilcam-arsivi-tv-apk` artifact dosyasını indirin ve içindeki `app-debug.apk` dosyasını kullanın.

Android Studio varsa:

1. Android Studio ile `android-tv-app` klasörünü açın.
2. Gradle senkronizasyonunun bitmesini bekleyin.
3. `Build > Build Bundle(s) / APK(s) > Build APK(s)` menüsünü çalıştırın.
4. APK genellikle `app/build/outputs/apk/debug/app-debug.apk` altında oluşur.

## TV'ye yükleme

Android TV'de geliştirici seçeneklerini ve USB hata ayıklamayı açtıktan sonra:

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

Uygulama adı TV launcher'da `Yeşilçam Arşivi` olarak görünür.
