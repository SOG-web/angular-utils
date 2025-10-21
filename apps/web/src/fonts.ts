// Font declarations for build-time optimization
// The Angular builder will scan this file and download fonts at build time
import { Inter, Roboto, Open_Sans, Poppins, Playfair_Display } from '@angular-utils/font/google';

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
