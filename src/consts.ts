// src/consts.ts

const SITE = {
    // Ürün / site adı (head <title> ve og:site_name için)
    name: "Convert Tools",

    // Yayıncı / marka adı (JSON-LD publisher/organization için)
    publisherName: "Saku Studios",

    descriptionTR:
        "Görsellerinizi saniyeler içinde dönüştürün, arka planları temizleyin. Tamamen tarayıcınızda çalışır.",
    descriptionEN:
        "Convert images in seconds and remove backgrounds. Everything runs in your browser.",

    // PROD URL (www'lü, tek standart)
    url: "https://www.sakustudios.com.tr",

    // Twitter handle varsa: "@sakustudios" gibi
    twitter: null as string | null,

    // Varsayılan OG görsel (mutlaka public/ içinde olmalı)
    defaultOgImage: "/og/og-default.png",

    // (Opsiyonel ama faydalı) Temel varlıklar: BaseLayout'ta tek yerden kullanmak için
    logo512: "/android-chrome-512x512.png",
    logo180: "/apple-touch-icon.png",
};

export default SITE;
