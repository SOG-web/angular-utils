import { Component, signal, computed, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GoogleFontService } from '@angular-utils/font';

interface FontOption {
  name: string;
  family: string;
  description: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private fontService = inject(GoogleFontService);

  // Available fonts
  protected readonly fonts: FontOption[] = [
    { name: 'Inter', family: 'Inter', description: 'Modern sans-serif for UI/body text' },
    { name: 'Roboto', family: 'Roboto', description: "Google's signature font" },
    { name: 'Open Sans', family: 'Open Sans', description: 'Friendly and readable' },
    { name: 'Poppins', family: 'Poppins', description: 'Geometric sans-serif' },
    { name: 'Playfair Display', family: 'Playfair Display', description: 'Elegant serif for headings' },
  ];

  // Available weights
  protected readonly weights = [300, 400, 500, 600, 700, 900];

  // Current selections
  protected readonly selectedFont = signal<FontOption>(this.fonts[0]);
  protected readonly selectedWeight = signal(400);

  // Sample texts
  protected readonly heading = 'The Quick Brown Fox Jumps Over the Lazy Dog';
  protected readonly paragraph = 'Typography is the art and technique of arranging type to make written language legible, readable and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing, and adjusting the space between pairs of letters.';

  // Computed font style
  protected readonly currentFontStyle = computed(() => {
    const font = this.selectedFont();
    const weight = this.selectedWeight();
    return {
      fontFamily: font.family,
      fontWeight: weight,
    };
  });

  constructor() {
    // Load all fonts on initialization
    this.fonts.forEach(font => {
      this.fontService.loadFont(font.family, {
        weights: [300, 400, 500, 600, 700, 900],
        subsets: ['latin'],
        display: 'swap',
        preload: true,
      });
    });
  }

  protected selectFont(font: FontOption) {
    this.selectedFont.set(font);
  }

  protected selectWeight(weight: number) {
    this.selectedWeight.set(weight);
  }
}
