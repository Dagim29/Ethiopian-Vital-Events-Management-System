# Certificate Download Feature - Setup Guide

## Install Required Packages

Run this command in your frontend directory:

```bash
cd frontend/frontend
npm install jspdf html2canvas
```

## What Was Added

### ViewBirthRecord.jsx
- Download certificate button (blue)
- Only shows for approved records
- Generates PDF from certificate content
- Downloads as: Birth_Certificate_[number].pdf

## How to Use

1. Open an approved birth record
2. Click "Download Certificate" button
3. PDF will be generated and downloaded

## Features
- High quality PDF (A4 format)
- Includes all certificate details
- Loading state while generating
- Success/error notifications

## Next Steps

Apply same feature to:
- Death certificates
- Marriage certificates  
- Divorce certificates
