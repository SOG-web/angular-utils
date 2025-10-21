// Font declarations for build-time optimization
// The Angular builder will scan this file and download fonts at build time
import { Inter, Roboto, Open_Sans, Poppins, Playfair_Display } from '@angular-utils/font/google';
import { localFont } from '@angular-utils/font/local';

export const inter = Inter({
  weights: [300, 400, 500, 600, 700, 900],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export const roboto = Roboto({
  weights: [300, 400, 500, 600, 700, 900],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
  preload: true,
});

export const openSans = Open_Sans({
  weights: [300, 400, 500, 600, 700, 800],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
  preload: true,
});

export const poppins = Poppins({
  weights: [300, 400, 500, 600, 700, 900],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  preload: true,
});

export const playfairDisplay = Playfair_Display({
  weights: [400, 500, 600, 700, 800, 900],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair-display',
  preload: true,
});

export const rubikFamily = localFont({
  src: [
    {
      path: './src/static/Rubik-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './src/static/Rubik-LightItalic.ttf',
      weight: '300',
      style: 'italic',
    },
    {
      path: './src/static/Rubik-Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: './src/static/Rubik-MediumItalic.ttf',
      weight: '500',
      style: 'italic',
    },
    {
      path: './src/static/Rubik-SemiBoldItalic.ttf',
      weight: '600',
      style: 'italic',
    },
    {
      path: './src/static/Rubik-BoldItalic.ttf',
      weight: '700',
      style: 'italic',
    },
    {
      path: './src/static/Rubik-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: './src/static/Rubik-ExtraBoldItalic.ttf',
      weight: '800',
      style: 'italic',
    },
    {
      path: './src/static/Rubik-Black.ttf',
      weight: '900',
      style: 'normal',
    },
    {
      path: './src/static/Rubik-BlackItalic.ttf',
      weight: '900',
      style: 'italic',
    },
  ],
  variable: '--font-rubik-family',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});
