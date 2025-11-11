# 🔧 Certificate Download - Troubleshooting

## 🐛 **Issue: Blank White PDF**

The PDF downloads but shows a blank white page.

---

## ✅ **Fixes Applied**

### **1. Made Element Visible**
- Changed from `left: -9999px` (hidden) to `left: 0` (visible)
- Used `z-index: -1` to keep it behind content
- html2canvas needs visible elements to render

### **2. Added Proper Dimensions**
- Width: `794px` (A4 width at 96 DPI)
- Height: `1123px` (A4 height at 96 DPI)
- Ensures proper rendering

### **3. Added Rendering Delay**
- Wait 100ms after adding element
- Gives browser time to render

### **4. Enabled Logging**
- `logging: true` in html2canvas options
- Check browser console for errors

---

## 🧪 **Test Steps**

### **1. Test Download:**
```
1. View birth certificate
2. Click "Download PDF"
3. Check browser console for errors
4. Check downloaded PDF
```

### **2. Check Console:**
Look for:
- ✅ No errors
- ✅ html2canvas logs
- ✅ PDF generation logs

### **3. If Still Blank:**
- Check console for oklch errors
- Check if template HTML is valid
- Check if fonts are loading

---

## 🔍 **Debugging**

### **Check Browser Console:**
```javascript
// Should see:
- "html2canvas: Rendering..."
- "html2canvas: Finished rendering"
- No "oklch" errors
- No "Failed to load" errors
```

### **Common Issues:**

1. **oklch Colors:**
   - Template uses hex colors only
   - Should not be an issue

2. **Fonts Not Loading:**
   - Template uses 'Times New Roman'
   - Should be available on all systems

3. **Element Not Rendered:**
   - Element must be visible (not hidden)
   - Fixed with z-index: -1

4. **Dimensions Wrong:**
   - Using A4 pixel dimensions
   - Should work correctly

---

## 💡 **Alternative: Use Print Dialog**

If PDF generation still doesn't work:

```javascript
const handleDownload = () => {
  window.print();
};
```

User can:
1. Select "Save as PDF"
2. Enable "Background graphics"
3. Save file

**This always works!**

---

## ✅ **Summary**

**Fixes:**
- ✅ Element visible (z-index: -1)
- ✅ Proper dimensions (794x1123px)
- ✅ Rendering delay (100ms)
- ✅ Logging enabled

**Test:**
- Check browser console
- Download PDF
- Verify content

**Fallback:**
- Use print dialog method
- Always reliable
