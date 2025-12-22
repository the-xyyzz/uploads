# 🟠 Slowly Uploader

**Slowly Uploader** adalah aplikasi berbagi file sementara yang **minimalis, cepat, dan modern**. Dibangun menggunakan **React**, **Vite**, dan **Supabase**, aplikasi ini memberikan pengalaman unggah file yang mulus dengan tema visual **Orange–Amber Sunset** yang hangat.

Aplikasi mendukung pengunggahan file melalui:

* Antarmuka web (Drag & Drop)
* **Public API** untuk integrasi pihak ketiga atau penggunaan via terminal

---

## ✨ Fitur Utama

* 🚀 **Fast Upload** — Antarmuka drag & drop yang responsif dan ringan
* 🕒 **Auto Expiration** — Masa berlaku file: **1 Jam**, **24 Jam**, atau **Selamanya**
* 🔌 **Developer API** — Endpoint `/upload` untuk integrasi via skrip atau terminal
* 📱 **Mobile Friendly** — Optimal di perangkat mobile hingga desktop
* 🔗 **Easy Sharing** — Salin URL publik file dengan satu klik
* 🎨 **Warm Aesthetics** — Desain gelap modern dengan aksen Oranye & Amber

---

## 🛠️ Tech Stack

**Frontend**

* React.js (Vite)
* Tailwind CSS

**Backend (Supabase)**

* **Storage** — Penyimpanan file
* **Database** — Metadata file
* **Edge Functions** — API endpoint `/upload`

---

## 🚀 Panduan Instalasi

### 1️⃣ Clone Repository

```bash
git clone https://github.com/slowlyh/uploader.git
cd uploader
```

### 2️⃣ Install Dependensi

```bash
npm install
```

### 3️⃣ Konfigurasi Environment Variables

Buat file `.env` di direktori root:

```env
VITE_SUPABASE_PROJECT_ID=project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

> ⚠️ Pastikan **Anon Key** memiliki izin untuk mengakses Storage dan Edge Functions.

---

### 4️⃣ Setup Supabase

#### 📦 Storage

* Buat bucket bernama **`public-files`**
* Atur policy agar **public read** dan **insert** diperbolehkan

#### 🗄️ Database

Jalankan query berikut di **Supabase SQL Editor**:

```sql
-- Create the files_metadata table for storing uploaded file information
CREATE TABLE public.files_metadata (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on the table
ALTER TABLE public.files_metadata ENABLE ROW LEVEL SECURITY;

-- Create policy for public SELECT (anyone can view files)
CREATE POLICY "Anyone can view files" 
ON public.files_metadata 
FOR SELECT 
USING (true);

-- Create policy for public INSERT (anyone can upload files)
CREATE POLICY "Anyone can upload files" 
ON public.files_metadata 
FOR INSERT 
WITH CHECK (true);

-- Create policy for public DELETE (anyone can delete files)
CREATE POLICY "Anyone can delete files" 
ON public.files_metadata 
FOR DELETE 
USING (true);

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.files_metadata;

-- Create the public-files storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-files', 'public-files', true);

-- Create storage policy for public file access
CREATE POLICY "Public file access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'public-files');

-- Create storage policy for public file upload
CREATE POLICY "Public file upload"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'public-files');

-- Create storage policy for public file delete
CREATE POLICY "Public file delete"
ON storage.objects
FOR DELETE
USING (bucket_id = 'public-files');

-- Add expires_at column to files_metadata table
ALTER TABLE public.files_metadata 
ADD COLUMN expires_at timestamp with time zone DEFAULT NULL;

-- Create index for efficient filtering of expired files
CREATE INDEX idx_files_metadata_expires_at ON public.files_metadata(expires_at);
```

---

### 5️⃣ Jalankan Aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan di:

```
http://localhost:5173
```

---

## 📡 Dokumentasi API

Unggah file secara terprogram tanpa menggunakan browser.

### Endpoint

```
POST https://[PROJECT_ID].supabase.co/functions/v1/upload
```

### Headers

| Key    | Value             |
| ------ | ----------------- |
| apikey | SUPABASE_ANON_KEY |

### Body (Form Data)

| Field      | Deskripsi                                   |
| ---------- | ------------------------------------------- |
| file       | File yang akan diunggah                     |
| expiration | Durasi file (1, 24, atau 0 untuk selamanya) |

---

### Contoh Menggunakan cURL

```bash
curl -X POST "https://[PROJECT_ID].supabase.co/functions/v1/upload" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -F "file=@./dokumen/data.pdf" \
  -F "expiration=24"
```

---

## 📌 Catatan

* File akan otomatis dihapus berdasarkan nilai `expires_at`
* Endpoint API cocok untuk CI/CD, automation, atau CLI tools
* Tidak memerlukan autentikasi user (public upload)

---

## ❤️ Kontribusi

Pull request dan ide pengembangan sangat diterima.
Silakan fork repository ini dan buat perubahan terbaikmu.

---

## 📄 Lisensi

MIT License

---

Dibuat dengan ❤️ oleh **Slowly**
