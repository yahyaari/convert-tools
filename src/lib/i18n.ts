export type Lang = "tr" | "en";

export const i18n: Record<Lang, Record<string, string>> = {
    tr: {
        nav_products: "Ürünler",
        nav_about: "Hakkımda",
        nav_contact: "İletişim",

        hero_badge: "Dijital Çözümler",
        hero_title: "Dijital çözümlerle işinizi büyütün",
        hero_sub:
            "SAKU Studios; restoran, kafe ve işletmeler için QR menü, dijital menü ve özel teknoloji çözümleri geliştirir.",
        hero_cta_primary: "Ürünleri Gör",
        hero_cta_secondary: "İletişime Geç",

        products_head: "Ürünler & Çözümler",
        products_desc:
            "İşletmenize değer katan, markanıza özel dijital çözümler.",
        products_qrmenu_title: "QR Menü Sistemi",
        products_qrmenu_desc:
            "Restoran ve kafeler için modern dijital menü. Anlık güncelleme, çoklu dil, markaya özel tasarım.",
        products_qrmenu_cta: "Detayları Gör →",
        products_soon_title: "Yeni Ürün",
        products_soon_desc:
            "Yeni çözümler üzerinde çalışıyoruz. Yakında burada olacak.",
        products_soon_badge: "Yakında",

        about_head: "Hakkımda",
        about_body:
            "SAKU Studios hakkında kısa bir tanıtım yazısı yakında burada olacak.",

        contact_head: "İletişim",
        contact_desc:
            "Projeniz için birlikte çalışmak ister misiniz? WhatsApp, mail ya da formdan ulaşın.",
        contact_whatsapp: "WhatsApp",
        contact_email: "E-posta",
        contact_form_name: "Ad Soyad",
        contact_form_email: "E-posta",
        contact_form_subject: "Konu",
        contact_form_message: "Mesajınız",
        contact_form_submit: "Gönder",
        contact_form_sending: "Gönderiliyor…",
        contact_form_success:
            "Mesajınız alındı, en kısa sürede dönüş yapacağım.",
        contact_form_error:
            "Bir hata oluştu. WhatsApp üzerinden de ulaşabilirsiniz.",
        contact_form_disabled:
            "İletişim formu yakında aktif olacak. Bu arada WhatsApp veya mail ile ulaşabilirsiniz.",

        footer_tagline: "Dijital ürünler & teknoloji çözümleri.",
        footer_rights: "Tüm hakları saklıdır.",

        qr_badge: "Ürün",
        qr_breadcrumb_home: "Ana Sayfa",
        qr_breadcrumb_here: "QR Menü",
        qr_title: "QR Menü Sistemi",
        qr_sub:
            "Restoran, kafe ve işletmeler için modern QR menü çözümü. Anlık güncelleme, çoklu dil ve markanıza özel tasarımla dijital menüye hızlıca geçin.",
        qr_cta: "Demo / İletişim",

        qr_features_head: "Öne Çıkan Özellikler",
        qr_feat1_title: "Anlık Güncelleme",
        qr_feat1_desc:
            "Menü değişikliklerini anında yayınlayın; QR kodu değiştirmeden içeriği güncelleyin.",
        qr_feat2_title: "Çoklu Dil",
        qr_feat2_desc:
            "Türkçe, İngilizce ve diğer dillerde menü sunun; turist müşterilerinize kolaylık sağlayın.",
        qr_feat3_title: "Kategori & Ürün Yönetimi",
        qr_feat3_desc:
            "Kategoriler, ürünler, fiyatlar ve görselleri kolay bir panelden yönetin.",
        qr_feat4_title: "Markaya Özel Tasarım",
        qr_feat4_desc:
            "Renk, logo ve tipografi ile menüyü markanıza uygun hale getirin.",
        qr_feat5_title: "Mobil Öncelikli",
        qr_feat5_desc:
            "Müşteri deneyimi için hızlı yüklenen, mobilde mükemmel çalışan modern arayüz.",
        qr_feat6_title: "Güvenli Altyapı",
        qr_feat6_desc:
            "Supabase tabanlı güvenli veri altyapısı ve güvenilir bulut sunucular.",

        qr_preview_head: "Önizleme",
        qr_preview_desc: "Ekran görüntüleri yakında burada olacak.",

        qr_tech_head: "Teknoloji",
        qr_tech_desc: "Modern web teknolojileri üzerine inşa edilmiştir.",

        faq_head: "Sık Sorulan Sorular",
        faq_desc:
            "QR menü sistemi hakkında işletme sahiplerinin en çok sorduğu sorular.",
        faq_q1: "QR menü nedir ve nasıl çalışır?",
        faq_a1:
            "QR menü, masada duran bir QR kodunun telefonla okutulması sonucu müşterinin dijital menünüze anında ulaşmasını sağlayan sistemdir. Kâğıt menüye ihtiyaç kalmaz; müşteri menüyü her zaman güncel görür.",
        faq_q2: "Kurulum ne kadar sürer?",
        faq_a2:
            "Standart bir işletme için 24–48 saat içinde sistemi kurup teslim ediyoruz. Mevcut menünüzü (fotoğraf veya PDF) alıp sisteme aktarıyoruz.",
        faq_q3: "Menüyü güncellediğimde QR kodu yeniden bastırmam gerekir mi?",
        faq_a3:
            "Hayır. QR kod sabittir; menüyü yönetim panelinden değiştirdiğinizde müşteri bir sonraki açılışta güncel menüyü görür. Ek bir işlem gerekmez.",
        faq_q4: "Kaç dil desteği var?",
        faq_a4:
            "Türkçe ve İngilizce hazır olarak gelir. İhtiyaca göre başka diller eklenebilir; her dil için fiyat ve içerik ayrı yönetilir.",
        faq_q5: "Fiyatlandırma nasıl?",
        faq_a5:
            "Tek seferlik kurulum + aylık bakım modelini uyguluyoruz. İşletmenizin büyüklüğüne ve ihtiyacına göre özel teklif hazırlıyoruz; detaylar için iletişime geçin.",
        faq_q6: "Teknik destek ve güncellemeler dahil mi?",
        faq_a6:
            "Evet. Aylık bakım paketinde teknik destek, küçük içerik güncellemeleri ve sistem güncellemeleri dahildir. Büyük görsel değişiklikler ayrıca planlanır.",
    },
    en: {
        nav_products: "Products",
        nav_about: "About",
        nav_contact: "Contact",

        hero_badge: "Digital Solutions",
        hero_title: "Grow your business with digital solutions",
        hero_sub:
            "SAKU Studios builds QR menus, digital menus and custom technology solutions for restaurants, cafés and businesses.",
        hero_cta_primary: "See Products",
        hero_cta_secondary: "Get in Touch",

        products_head: "Products & Solutions",
        products_desc: "On-brand digital solutions that add value to your business.",
        products_qrmenu_title: "QR Menu System",
        products_qrmenu_desc:
            "A modern digital menu for restaurants and cafés. Real-time updates, multi-language support and on-brand design.",
        products_qrmenu_cta: "View Details →",
        products_soon_title: "New Product",
        products_soon_desc: "We're working on new solutions. Stay tuned.",
        products_soon_badge: "Coming Soon",

        about_head: "About",
        about_body:
            "A short introduction about SAKU Studios will be here soon.",

        contact_head: "Contact",
        contact_desc:
            "Interested in working together? Reach out via WhatsApp, email or the form below.",
        contact_whatsapp: "WhatsApp",
        contact_email: "Email",
        contact_form_name: "Full name",
        contact_form_email: "Email",
        contact_form_subject: "Subject",
        contact_form_message: "Your message",
        contact_form_submit: "Send",
        contact_form_sending: "Sending…",
        contact_form_success:
            "Your message was received. I'll get back to you shortly.",
        contact_form_error:
            "Something went wrong. You can also reach me on WhatsApp.",
        contact_form_disabled:
            "The contact form is coming online soon. In the meantime, please reach out via WhatsApp or email.",

        footer_tagline: "Digital products & technology solutions.",
        footer_rights: "All rights reserved.",

        qr_badge: "Product",
        qr_breadcrumb_home: "Home",
        qr_breadcrumb_here: "QR Menu",
        qr_title: "QR Menu System",
        qr_sub:
            "A modern QR menu solution for restaurants, cafés and businesses. Real-time updates, multi-language and on-brand design — switch to a digital menu in days.",
        qr_cta: "Demo / Contact",

        qr_features_head: "Key Features",
        qr_feat1_title: "Real-time Updates",
        qr_feat1_desc:
            "Publish menu changes instantly — update content without ever changing the QR code.",
        qr_feat2_title: "Multi-language",
        qr_feat2_desc:
            "Offer your menu in Turkish, English and more; make it effortless for tourist guests.",
        qr_feat3_title: "Category & Item Management",
        qr_feat3_desc:
            "Manage categories, items, prices and images from a simple admin panel.",
        qr_feat4_title: "On-brand Design",
        qr_feat4_desc:
            "Customize colors, logo and typography so the menu matches your brand.",
        qr_feat5_title: "Mobile First",
        qr_feat5_desc:
            "Fast-loading, smooth mobile experience tuned for real customers on real devices.",
        qr_feat6_title: "Secure Infrastructure",
        qr_feat6_desc:
            "Built on Supabase with secure data handling and reliable cloud hosting.",

        qr_preview_head: "Preview",
        qr_preview_desc: "Screenshots will be added here soon.",

        qr_tech_head: "Technology",
        qr_tech_desc: "Built on modern web technologies.",

        faq_head: "Frequently Asked Questions",
        faq_desc:
            "The most common questions business owners ask about our QR menu system.",
        faq_q1: "What is a QR menu and how does it work?",
        faq_a1:
            "A QR menu is a system where guests scan a QR code at their table and instantly open your digital menu on their phone. No paper menus needed — guests always see the latest version.",
        faq_q2: "How long does setup take?",
        faq_a2:
            "For a typical business, we set up and deliver the system within 24–48 hours. We import your existing menu (photos or PDF) into the system.",
        faq_q3: "Do I need to reprint the QR code when I update the menu?",
        faq_a3:
            "No. The QR code is permanent; you change the menu from the admin panel and guests see the updated menu the next time they open it. No extra steps.",
        faq_q4: "How many languages are supported?",
        faq_a4:
            "Turkish and English are ready out of the box. Other languages can be added on request; each language is priced and managed separately.",
        faq_q5: "What is the pricing model?",
        faq_a5:
            "We use a one-time setup fee plus a monthly maintenance plan. We tailor a quote to your business size and needs — reach out for details.",
        faq_q6: "Is technical support and are updates included?",
        faq_a6:
            "Yes. The monthly maintenance plan includes technical support, small content updates and system updates. Larger visual redesigns are scoped separately.",
    },
};
