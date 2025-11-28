# Flexible Lesson Content Input - Feature Guide

## Overview

The TTA-1 system now supports **multiple ways** to provide lesson content, making it more flexible and user-friendly for teachers.

## Input Methods

### 1. 📝 **Type Text** (Default)
- Traditional textarea for typing or pasting lesson content
- Best for: Quick edits, short lessons, or copying from other sources

### 2. 📄 **Upload File**
- Drag-and-drop or click to upload lesson files
- **Supported formats**:
  - `.txt` - Plain text files
  - `.md` - Markdown files
  - `.docx` - Microsoft Word documents
  - `.pdf` - PDF documents
- Best for: Existing lesson plans, formatted documents

### 3. 🔗 **From URL**
- Fetch lesson content from a web URL
- Enter any public URL and click "Fetch"
- Best for: Online resources, shared documents, web-based lesson plans

## How to Use

### Step 1: Choose Input Method
Click one of the three buttons at the top:
- **Type Text** - Opens a textarea
- **Upload File** - Shows file upload area
- **From URL** - Shows URL input field

### Step 2: Provide Content

**For Text Input:**
1. Type or paste your lesson content directly
2. Content updates in real-time

**For File Upload:**
1. Drag a file into the upload area, or click to browse
2. Select a supported file (.txt, .md, .docx, .pdf)
3. File content is automatically extracted
4. Preview shows the first few lines
5. Click "Remove" to clear and select a different file

**For URL Input:**
1. Paste the URL of your lesson content
2. Click "Fetch" button
3. Content is downloaded and displayed
4. Preview shows the fetched content

### Step 3: Proceed with Analysis
Once content is loaded (via any method), continue with the normal workflow:
1. Upload CSV file
2. Enter class/teacher IDs
3. Click "Analyze & Improve Lesson"

## Examples

### Example 1: Upload a Word Document
```
1. Click "Upload File"
2. Drag "Algebra_Lesson_Plan.docx" into the upload area
3. Content automatically extracted
4. Proceed to analysis
```

### Example 2: Fetch from URL
```
1. Click "From URL"
2. Enter: https://example.com/lessons/equations.txt
3. Click "Fetch"
4. Content loaded from URL
5. Proceed to analysis
```

### Example 3: Type Directly
```
1. Click "Type Text" (default)
2. Type or paste lesson content
3. Edit as needed
4. Proceed to analysis
```

## Technical Details

### Component: `LessonContentInput`
**Location**: `components/lesson/LessonContentInput.tsx`

**Props**:
- `value: string` - Current lesson content
- `onChange: (value: string) => void` - Callback when content changes

**Features**:
- Tab-based interface for switching input methods
- File validation (type and size)
- URL fetching with error handling
- Content preview for uploaded files and URLs
- Responsive design

### Supported File Types
| Extension | Type | Notes |
|-----------|------|-------|
| `.txt` | Plain Text | Fully supported |
| `.md` | Markdown | Fully supported |
| `.docx` | Word Document | Requires browser support |
| `.pdf` | PDF | Requires browser support |

### URL Fetching
- Uses browser `fetch` API
- Supports any publicly accessible URL
- CORS restrictions may apply
- Error handling for failed requests

## Benefits

1. **Flexibility**: Teachers can use their preferred method
2. **Efficiency**: No need to copy-paste from documents
3. **Integration**: Works with existing lesson management systems
4. **Accessibility**: Multiple input options for different workflows

## Future Enhancements

Potential additions:
- [ ] Google Docs integration
- [ ] Rich text editor
- [ ] Template library
- [ ] Lesson history/favorites
- [ ] Batch upload multiple lessons

## Troubleshooting

**File won't upload?**
- Check file format (must be .txt, .md, .docx, or .pdf)
- Ensure file size is reasonable (< 10MB recommended)

**URL fetch failed?**
- Verify URL is publicly accessible
- Check for CORS restrictions
- Ensure URL points to text content

**Content not displaying?**
- Try switching to "Type Text" and pasting manually
- Check browser console for errors
- Refresh the page and try again

## Summary

The flexible content input feature makes TTA-1 more versatile by supporting multiple ways to provide lesson content. Teachers can now choose the method that best fits their workflow, whether that's typing directly, uploading existing files, or fetching content from online resources.
