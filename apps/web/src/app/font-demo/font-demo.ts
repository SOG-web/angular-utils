import { Component, signal, computed } from '@angular/core';
import { inter, roboto, openSans, poppins, playfairDisplay, rubikFamily } from '../../fonts';

interface FontOption {
  name: string;
  family: string;
  description: string;
  fontResult: any; // FontResult from the font loader
}

@Component({
  selector: 'app-font-demo',
  templateUrl: './font-demo.html',
  styleUrl: './font-demo.css',
  host: {
    '[class]': 'fontClasses',
  },
})
export class FontDemo {
  // Available fonts with pre-loaded font results
  protected readonly fonts: FontOption[] = [
    {
      name: 'Inter',
      family: 'Inter',
      description: 'Modern sans-serif for UI/body text',
      fontResult: inter,
    },
    {
      name: 'Roboto',
      family: 'Roboto',
      description: "Google's signature font",
      fontResult: roboto,
    },
    {
      name: 'Open Sans',
      family: 'Open Sans',
      description: 'Friendly and readable',
      fontResult: openSans,
    },
    {
      name: 'Poppins',
      family: 'Poppins',
      description: 'Geometric sans-serif',
      fontResult: poppins,
    },
    {
      name: 'Playfair Display',
      family: 'Playfair Display',
      description: 'Elegant serif for headings',
      fontResult: playfairDisplay,
    },
    {
      name: 'Rubik',
      family: 'Rubik Light',
      description: 'Local font - Sans-serif with rounded edges',
      fontResult: rubikFamily,
    },
  ];

  // Available weights
  protected readonly weights = [300, 400, 500, 600, 700, 800, 900];

  // Current selections
  protected readonly selectedFont = signal<FontOption>(this.fonts[0]);
  protected readonly selectedWeight = signal(400);

  // Sample texts
  protected readonly heading = 'The Quick Brown Fox Jumps Over the Lazy Dog';
  protected readonly paragraph =
    'Typography is the art and technique of arranging type to make written language legible, readable and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing, and adjusting the space between pairs of letters.';

  // Computed font style
  protected readonly currentFontStyle = computed(() => {
    const font = this.selectedFont();
    const weight = this.selectedWeight();
    return {
      fontFamily: font.fontResult.style.fontFamily,
      fontWeight: weight,
    };
  });

  // Font classes for host binding (CSS variables)
  protected readonly fontClasses = [
    inter.className,
    roboto.className,
    openSans.className,
    poppins.className,
    playfairDisplay.className,
    rubikFamily.className,
  ].join(' ');

  protected selectFont(font: FontOption) {
    this.selectedFont.set(font);
  }

  protected selectWeight(weight: number) {
    this.selectedWeight.set(weight);
  }
}
