# 🚀 Apply Filter & Export to Marriage & Divorce Records

## ✅ **Quick Implementation Guide**

I've started the implementation for Marriage Records. Here's what needs to be completed:

---

## 📝 **For Marriage Records**

### **1. Add Handler Functions** (after `handleSearch`)

```javascript
const handleExport = () => {
  try {
    const exportData = records.map(record => ({
      'Certificate Number': record.certificate_number || 'N/A',
      'Husband Name': record.husband_full_name || 'N/A',
      'Wife Name': record.wife_full_name || 'N/A',
      'Marriage Date': record.marriage_date || 'N/A',
      'Marriage Place': record.marriage_place || 'N/A',
      'Marriage Type': record.marriage_type || 'N/A',
      'Region': record.marriage_region || 'N/A',
      'Zone': record.marriage_zone || 'N/A',
      'Woreda': record.marriage_woreda || 'N/A',
      'Registration Date': record.registration_date ? format(new Date(record.registration_date), 'MMM dd, yyyy') : 'N/A',
      'Registered By': record.registered_by_name || 'N/A',
      'Status': record.status || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Marriage Records');
    const filename = `Marriage_Records_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, filename);
    
    toast.success(`Exported ${exportData.length} records successfully!`);
  } catch (error) {
    console.error('Error exporting records:', error);
    toast.error('Failed to export records. Please try again.');
  }
};

const applyFilters = () => {
  fetchRecords();
  setShowFilters(false);
  toast.success('Filters applied!');
};

const clearFilters = () => {
  setFilters({
    status: '',
    dateFrom: '',
    dateTo: '',
    region: ''
  });
  toast.info('Filters cleared!');
};
```

### **2. Update Buttons** (replace existing Filter/Export buttons)

```javascript
<div className="flex gap-3">
  <Button 
    onClick={() => setShowFilters(!showFilters)}
    variant="outline" 
    size="sm" 
    className="border-2 border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200"
  >
    <FunnelIcon className="h-4 w-4 mr-1" />
    Filter
  </Button>
  <Button 
    onClick={handleExport}
    variant="outline" 
    size="sm" 
    className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200"
  >
    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
    Export
  </Button>
</div>
```

### **3. Add Filter Panel** (after search Card, before Records Table)

```javascript
{/* Filter Panel */}
{showFilters && (
  <Card className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Records</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
        <select
          value={filters.region}
          onChange={(e) => setFilters({...filters, region: e.target.value})}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
        >
          <option value="">All Regions</option>
          <option value="AD">Addis Ababa</option>
          <option value="AF">Afar</option>
          <option value="AM">Amhara</option>
          <option value="BG">Benishangul-Gumuz</option>
          <option value="DD">Dire Dawa</option>
          <option value="GM">Gambella</option>
          <option value="HR">Harari</option>
          <option value="OR">Oromia</option>
          <option value="SO">Somali</option>
          <option value="SN">Southern Nations</option>
          <option value="TG">Tigray</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <select
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
        >
          <option value="">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="draft">Draft</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
        />
      </div>
    </div>
    <div className="flex gap-3 mt-6">
      <Button
        onClick={applyFilters}
        className="bg-pink-600 text-white hover:bg-pink-700 px-6 py-2 rounded-lg"
      >
        Apply Filters
      </Button>
      <Button
        onClick={clearFilters}
        variant="outline"
        className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg"
      >
        Clear Filters
      </Button>
    </div>
  </Card>
)}
```

---

## 📝 **For Divorce Records**

Same implementation, but:
- Change theme color from `pink` to `orange`
- Update export fields for divorce data
- Use `divorce_region`, `divorce_date`, etc.

---

## 🔧 **Backend - Add Filters**

### **Marriage Records Backend** (`backend/app/routes/marriages.py`)

Add filters to `get_marriage_records()` function (same pattern as births/deaths):

```python
# Add after search filter
# Additional filters
additional_filters = []

# Region filter
region = request.args.get('region', '').strip()
if region:
    additional_filters.append({'marriage_region': region})

# Status filter
status = request.args.get('status', '').strip()
if status:
    additional_filters.append({'status': status})

# Date range filter
date_from = request.args.get('date_from', '').strip()
date_to = request.args.get('date_to', '').strip()
if date_from or date_to:
    date_filter = {}
    if date_from:
        date_filter['$gte'] = date_from
    if date_to:
        date_filter['$lte'] = date_to
    if date_filter:
        additional_filters.append({'marriage_date': date_filter})

# Combine all filters (same pattern as births.py)
```

### **Divorce Records Backend** (`backend/app/routes/divorces.py`)

Same pattern, use `divorce_region`, `divorce_date`, etc.

---

## ✅ **Summary**

**Status:**
- ✅ Birth Records - Complete
- ✅ Death Records - Complete
- 🔄 Marriage Records - Started (needs completion)
- ⏳ Divorce Records - Pending

**Would you like me to complete Marriage and Divorce implementations now?**
