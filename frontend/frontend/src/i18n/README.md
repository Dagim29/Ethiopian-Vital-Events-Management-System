# Multi-Language Support (i18n)

This application supports multiple Ethiopian languages using react-i18next.

## Supported Languages

1. **English** (en) - Default
2. **Amharic** (am) - አማርኛ
3. **Oromo** (om) - Afaan Oromoo
4. **Tigrinya** (ti) - ትግርኛ

## Usage

### In Components

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.save')}</h1>
      <p>{t('dashboard.title')}</p>
    </div>
  );
}
```

### Language Selector

The `LanguageSelector` component is available in:
- Navigation bar (top right)
- Settings page (System tab)

Users can switch languages and their preference is saved in localStorage.

## Adding New Translations

1. Add the translation key to all language files in `src/i18n/locales/`:
   - `en.json` (English)
   - `am.json` (Amharic)
   - `om.json` (Oromo)
   - `ti.json` (Tigrinya)

2. Use the translation key in your component:
   ```jsx
   {t('your.new.key')}
   ```

## Translation File Structure

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "nav": {
    "dashboard": "Dashboard"
  },
  "settings": {
    "title": "Settings"
  }
}
```

## Current Translation Coverage

- ✅ Common actions (save, cancel, delete, etc.)
- ✅ Navigation menu
- ✅ Authentication pages
- ✅ Dashboard
- ✅ Settings page
- ✅ Record management
- ✅ Success/error messages

## To-Do

- [ ] Translate all form labels
- [ ] Translate all record pages
- [ ] Translate certificate templates
- [ ] Translate reports
- [ ] Add more Ethiopian languages (Somali, Afar, etc.)

## Notes

- Language preference persists across sessions (stored in localStorage)
- Default language is English
- RTL (Right-to-Left) support can be added if needed for certain languages
