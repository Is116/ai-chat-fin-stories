# PDF Upload Feature for Books

## ✅ Feature Successfully Implemented!

This document describes the PDF upload functionality added to the Literary Chat application for managing book PDF files.

---

## 📋 What Was Added

### 1. Database Schema Update
- **New Column**: `pdf_file TEXT` added to the `books` table
- **Migration Script**: `server/migrate-add-pdf.js` created and executed
- Stores the file path to the uploaded PDF (e.g., `/books/pdfs/book-1234567890.pdf`)

### 2. Backend API Updates (`server/routes/books.js`)

#### Multer Configuration for Large Files:
```javascript
// Separate configurations for images and PDFs
- Image Upload: Max 5MB (JPEG, PNG, GIF, WebP, SVG)
- PDF Upload: Max 100MB (PDF only)
- Combined Upload: Handles both files simultaneously
```

#### File Storage:
- **Cover Images**: Stored in `public/books/`
- **PDF Files**: Stored in `public/books/pdfs/`
- **Naming Convention**: 
  - Images: `book-cover-[timestamp]-[random].jpg`
  - PDFs: `book-[timestamp]-[random].pdf`

#### Updated API Endpoints:

**POST /api/books** (Create Book)
- Accepts `multipart/form-data` with fields:
  - `cover_image` (optional) - Image file
  - `pdf_file` (optional) - PDF file
  - `title`, `author`, `description`, `genre`, `published_year` - Text fields
- Both files are optional
- Automatically saves file paths to database

**PUT /api/books/:id** (Update Book)
- Same multipart fields as POST
- Automatically deletes old files when new ones are uploaded
- Preserves existing files if not replaced

#### File Management:
- ✅ Auto-delete old files when replaced
- ✅ Prevents orphaned files in public directory
- ✅ Validates file types and sizes
- ✅ Generates unique filenames to prevent conflicts

### 3. Server Configuration (`server/index.js`)

```javascript
// Increased body parser limits for large files
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Static file serving for PDFs
app.use('/books', express.static(path.join(__dirname, '../public/books')));
// This serves both images and PDFs under /books/*
```

### 4. Admin Dashboard UI (`src/components/admin/AdminDashboard.jsx`)

#### New State Variables:
```javascript
const [bookPdfFile, setBookPdfFile] = useState(null);
const [bookPdfFileName, setBookPdfFileName] = useState(null);
```

#### New Functions:
- `handleBookPdfChange()` - Validates and sets PDF file for upload
- `removeBookPdf()` - Removes selected PDF before upload

#### UI Components Added:

**PDF Upload Section** in Book Form:
1. **PDF File Display**:
   - Shows current PDF file name
   - Displays "View PDF" link for existing PDFs
   - Shows uploaded file name before saving

2. **Upload Button**:
   - Labeled "Upload PDF File" or "Change PDF File"
   - Accepts only PDF files
   - File picker opens on click

3. **Remove Button**:
   - Red X button to remove selected PDF
   - Clears both uploaded and existing PDFs

4. **Validation Messages**:
   - "Supported format: PDF (Max 100MB)"
   - Alerts on invalid file type
   - Alerts on file size exceeding limit

---

## 🎯 How to Use

### For Administrators:

1. **Navigate to Admin Panel**:
   ```
   http://localhost:3000/admin
   Login: admin / admin123
   ```

2. **Create New Book with PDF**:
   - Click "Add New Book"
   - Fill in book details (Title, Author, etc.)
   - Click "Upload Cover Image" to add book cover
   - Click "Upload PDF File" to add book PDF
   - Click "Create Book"

3. **Edit Existing Book to Add/Update PDF**:
   - Find the book in the list
   - Click "Edit" button
   - Click "Upload PDF File"
   - Select your PDF file (up to 100MB)
   - Click "Update Book"

4. **View/Download PDF**:
   - When editing a book with a PDF
   - Click "View PDF" link to open in new tab
   - PDF will be served from: `http://localhost:3001/books/pdfs/[filename].pdf`

5. **Remove PDF**:
   - When editing a book
   - Click the red X button next to the PDF name
   - Click "Update Book"

---

## 📁 File Structure

```
project-root/
├── public/
│   └── books/
│       ├── pdfs/                    # PDF files stored here
│       │   └── book-*.pdf
│       └── book-cover-*.jpg         # Cover images here
├── server/
│   ├── routes/
│   │   └── books.js                 # Updated with PDF upload
│   ├── migrate-add-pdf.js           # Migration script
│   └── index.js                     # Updated body limits
└── src/
    └── components/
        └── admin/
            └── AdminDashboard.jsx   # Updated with PDF UI
```

---

## 🔧 Technical Specifications

### File Size Limits:
- **Cover Images**: 5 MB maximum
- **PDF Files**: 100 MB maximum
- **Body Parser**: 100 MB limit for entire request

### Supported Formats:
- **Cover Images**: JPEG, JPG, PNG, GIF, WebP, SVG
- **PDF Files**: PDF only (application/pdf)

### Security Features:
- ✅ File type validation (MIME type + extension)
- ✅ File size validation
- ✅ Protected routes (requires admin authentication)
- ✅ Unique file naming (prevents collisions)

### Performance Optimizations:
- ✅ Streaming uploads (multer handles large files efficiently)
- ✅ Auto-cleanup of old files
- ✅ Static file serving with Express (optimized delivery)

---

## 🧪 Testing the Feature

### Test Case 1: Upload Small PDF (< 1MB)
1. Go to admin panel
2. Create/edit a book
3. Upload a small PDF (e.g., sample.pdf)
4. Verify success message
5. Check `public/books/pdfs/` directory
6. Verify PDF can be viewed

### Test Case 2: Upload Large PDF (50-100MB)
1. Find or create a large PDF file
2. Upload via admin panel
3. Monitor upload progress (may take time)
4. Verify successful upload
5. Test download/view functionality

### Test Case 3: Replace Existing PDF
1. Edit a book with existing PDF
2. Upload new PDF
3. Verify old PDF is deleted from server
4. Verify new PDF is accessible

### Test Case 4: Remove PDF
1. Edit book with PDF
2. Click remove (X) button
3. Save changes
4. Verify PDF field is cleared
5. Verify old PDF file remains (until replaced)

---

## 🐛 Troubleshooting

### Issue: "PDF file too large" error
**Solution**: Current limit is 100MB. For larger files:
1. Increase limit in `server/routes/books.js` (pdfUpload.limits.fileSize)
2. Increase limit in `server/index.js` (body parser limits)
3. Restart server

### Issue: PDF not downloading/viewing
**Solution**: 
1. Check file exists in `public/books/pdfs/`
2. Verify file path in database (should start with `/books/pdfs/`)
3. Check server console for errors
4. Try direct URL: `http://localhost:3001/books/pdfs/[filename].pdf`

### Issue: Upload fails silently
**Solution**:
1. Check browser console for errors
2. Check server console for multer errors
3. Verify file meets requirements (PDF, < 100MB)
4. Check admin token is valid

---

## 📊 Database Schema

```sql
CREATE TABLE books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  pdf_file TEXT,              -- NEW COLUMN
  published_year INTEGER,
  genre TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Future Enhancements (Ideas)

1. **PDF Preview**: Show first page thumbnail
2. **Progress Bar**: Real-time upload progress for large files
3. **Multiple PDFs**: Support different editions/languages
4. **PDF Metadata**: Extract title, author from PDF
5. **Compression**: Auto-compress large PDFs
6. **Cloud Storage**: Move to AWS S3 or similar for production
7. **Download Statistics**: Track how many times PDFs are downloaded
8. **Reader Integration**: Embed PDF viewer in the app

---

## ✅ Verification Checklist

- [x] Database column added (`pdf_file`)
- [x] Migration script created and executed
- [x] Backend API updated (POST and PUT routes)
- [x] Multer configured for large files (100MB)
- [x] PDF file storage directory created
- [x] Static file serving configured
- [x] Body parser limits increased
- [x] Admin UI updated with PDF upload field
- [x] PDF preview/download link added
- [x] Remove PDF functionality added
- [x] File validation implemented
- [x] Old file cleanup implemented
- [x] Backend server restarted with changes

---

## 📝 Notes

- PDFs are served directly from the backend server at `http://localhost:3001`
- Frontend runs on `http://localhost:3000`
- Admin authentication required for upload/delete operations
- Public viewing/downloading does not require authentication
- Files are stored on local filesystem (not suitable for production without cloud storage)

---

**Status**: ✅ Fully Implemented and Tested
**Created**: November 9, 2025
**Version**: 1.0
