# ✅ Divorce Certificate Nationality - Fixed!

## 🐛 **Issue**

Divorce certificates were showing "N/A" for nationality instead of "Ethiopian" as default.

---

## ✅ **Solution**

Changed default nationality from "N/A" to "Ethiopian" for both spouses in divorce certificates.

---

## 🔧 **What Was Changed**

### **File:** `frontend/src/pages/CertificateView.jsx`

**Before:**
```javascript
// Spouse 1
<p className="font-semibold">{record?.spouse1_nationality || 'N/A'}</p>

// Spouse 2
<p className="font-semibold">{record?.spouse2_nationality || 'N/A'}</p>
```

**After:**
```javascript
// Spouse 1
<p className="font-semibold">{record?.spouse1_nationality || 'Ethiopian'}</p>

// Spouse 2
<p className="font-semibold">{record?.spouse2_nationality || 'Ethiopian'}</p>
```

---

## 📝 **Why This Change**

### **Reason:**
- Most records in Ethiopia are for Ethiopian citizens
- "N/A" looks unprofessional on official certificates
- Consistent with Birth certificates (which default to "Ethiopian")
- If nationality is not specified, Ethiopian is the logical default

### **Behavior:**
- ✅ If `spouse1_nationality` is filled → Shows actual nationality
- ✅ If `spouse1_nationality` is empty → Shows "Ethiopian"
- ✅ If `spouse2_nationality` is filled → Shows actual nationality
- ✅ If `spouse2_nationality` is empty → Shows "Ethiopian"

---

## 🎯 **Consistency Across Certificates**

### **All Certificates Now:**

**Birth Certificate:**
- Child nationality: `child_nationality || 'Ethiopian'` ✅
- Father nationality: Shows `father_nationality` ✅
- Mother nationality: Shows `mother_nationality` ✅

**Death Certificate:**
- Deceased nationality: Shows actual value ✅

**Marriage Certificate:**
- Spouse 1 nationality: Shows `spouse1_nationality` ✅
- Spouse 2 nationality: Shows `spouse2_nationality` ✅

**Divorce Certificate:**
- Spouse 1 nationality: `spouse1_nationality || 'Ethiopian'` ✅ **FIXED**
- Spouse 2 nationality: `spouse2_nationality || 'Ethiopian'` ✅ **FIXED**

---

## 📋 **How to Ensure Nationality is Captured**

### **When Creating Divorce Records:**

1. Fill in **Spouse 1 Nationality** field
2. Fill in **Spouse 2 Nationality** field
3. If left empty, certificate will show "Ethiopian"

### **For Existing Records:**

- Records without nationality will now show "Ethiopian" instead of "N/A"
- Can be updated by editing the divorce record

---

## ✅ **Summary**

**Fixed:**
- ✅ Divorce certificate nationality defaults to "Ethiopian"
- ✅ No more "N/A" on certificates
- ✅ Professional appearance
- ✅ Consistent with other certificates

**Result:**
- ✅ Better looking certificates
- ✅ More professional
- ✅ Logical defaults

**Divorce certificates now show proper nationality!** 🎉
