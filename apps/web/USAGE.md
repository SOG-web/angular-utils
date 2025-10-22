# Font Showcase App - Usage Guide

## 📚 Documentation

**For complete documentation with interactive examples, visit: [/docs](/docs)**

The documentation includes:

- Complete API reference with all options
- Interactive examples and live demos
- Advanced features (subsetting, variable fonts, CDN config)
- Performance tips and best practices
- Copy-to-clipboard code examples

## 🚀 Quick Start

```bash
cd apps/web
pnpm start
```

Open `http://localhost:4200`

**Expected:** No console errors, all fonts working! ✅

## 📖 How to Use Fonts

### Method 1: Tailwind Standard Classes (Recommended)

```html
<h1 class="font-sans text-4xl font-bold">Heading in Inter</h1>

<p class="font-serif text-lg">Elegant text in Playfair Display</p>
```

**Available Classes:**

- `font-sans` → Uses Inter (first sans font)
- `font-serif` → Uses Playfair Display
- `font-[family:inter]` → Specifically Inter
- `font-[family:roboto]` → Specifically Roboto
- `font-[family:open-sans]` → Specifically Open Sans
- `font-[family:poppins]` → Specifically Poppins
- `font-[family:playfair-display]` → Specifically Playfair Display

### Method 2: CSS Variables

```html
<div style="font-family: var(--font-inter)">Text in Inter</div>

<div style="font-family: var(--font-playfair-display)">Text in Playfair Display</div>
```

**Available Variables:**

- `--font-inter`
- `--font-roboto`
- `--font-open-sans`
- `--font-poppins`
- `--font-playfair-display`

### Method 3: Component-Level Styling

```typescript
import { inter, playfairDisplay } from '../fonts';

@Component({
  template: `
    <div [style.fontFamily]="headingFont">Heading</div>
    <p [style.fontFamily]="bodyFont">Body text</p>
  `,
})
export class MyComponent {
  headingFont = inter.style.fontFamily; // "'Inter'"
  bodyFont = playfairDisplay.style.fontFamily; // "'Playfair Display'"
}
```

## 🎨 Font Showcase Features

The demo app shows:

1. **Font Family Selector** - Switch between 5 fonts
2. **Weight Selector** - Choose from 300-900
3. **Live Preview** - See changes in real-time
4. **Weight Comparison** - View all weights side-by-side
5. **Font Details** - See configuration and code examples

## 🔧 Adding New Fonts

### 1. Update src/fonts.ts

```typescript
import { Lato } from '@angular-utils/font/google';

export const lato = Lato({
  weights: [400, 700],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lato',
  preload: true,
});
```

### 2. Run Optimizer

```bash
pnpm font:optimize
```

This will:

- Download Lato fonts
- Add to fonts.css
- Add `--font-lato` variable
- Update Tailwind config
- Inject preload links

### 3. Use in App

```html
<div class="font-[family:lato]">Text in Lato</div>
```

or

```typescript
import { lato } from '../fonts';
// Use lato.className, lato.style.fontFamily, etc.
```

## 📊 Build Process

### Development

```bash
# Run font optimizer (downloads fonts)
pnpm font:optimize

# Start dev server
pnpm start
```

### Production

```bash
# Build (includes font optimization)
pnpm build

# Or explicitly
pnpm build:prod
```

## 🎨 Customizing Tailwind Mapping

By default, the builder maps:

- **First sans font** → `font-sans` (Inter)
- **First serif font** → `font-serif` (Playfair Display)
- **All fonts** → `font-[family:font-name]`

To customize which font maps to `font-sans`:

1. **Reorder fonts in src/fonts.ts** - First font of each type wins
2. **Or use specific names** - `font-[family:roboto]` instead of `font-sans`

## 🔥 Performance Tips

### 1. Preload Critical Fonts Only

```typescript
export const inter = Inter({
  preload: true, // ✅ Above the fold
});

export const specialFont = SomeFont({
  preload: false, // ⬜ Below the fold or conditional
});
```

### 2. Minimize Weights

```typescript
// Don't load all weights if you don't need them
export const inter = Inter({
  weights: [400, 700], // Only regular and bold
});
```

### 3. Use font-display: swap

```typescript
export const inter = Inter({
  display: 'swap', // ✅ Show fallback immediately
});
```

## 🐛 Troubleshooting

### Fonts not loading?

1. Check `public/assets/fonts/` exists
2. Verify `public/assets/fonts.css` was generated
3. Check `src/index.html` has the CSS link
4. Run `pnpm font:optimize` again

### Tailwind not recognizing fonts?

1. Check `src/styles.css` has `@theme` block
2. Restart dev server after running optimizer
3. Verify `@import 'tailwindcss'` exists

### Old fonts still showing?

Clear browser cache or hard refresh (Cmd+Shift+R)

## ✅ Verification

Check everything is working:

```bash
# 1. Font files exist
ls public/assets/fonts/inter/

# 2. CSS is valid
cat public/assets/fonts.css | grep "@font-face"

# 3. Tailwind config exists
cat src/styles.css | grep "@theme"

# 4. Index has preloads
cat src/index.html | grep "preload"
```

## 🎉 Summary

You now have:

- ✅ **5 Google Fonts** self-hosted
- ✅ **33 font files** (woff2)
- ✅ **Zero runtime errors**
- ✅ **Tailwind CSS integrated**
- ✅ **Auto-configuration**
- ✅ **Production ready**

**Enjoy your optimized font system!** 🚀
