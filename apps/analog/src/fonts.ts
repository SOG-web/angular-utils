// Font declarations for AnalogJS app
import { Inter, Roboto_Mono } from 'angular-fonts/google';

export const inter = Inter({
  weights: [400, 700],
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const robotoMono = Roboto_Mono({
  weights: [400],
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
});
