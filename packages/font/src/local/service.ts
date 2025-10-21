import { Injectable, signal, computed } from "@angular/core";
import type { LocalFontOptions, FontResult } from "../lib/core/types.js";
import { localFont } from "./loader.js";

/**
 * Service for managing local fonts at runtime
 */
@Injectable({
  providedIn: "root",
})
export class LocalFontService {
  private loadedFonts = signal<Map<string, FontResult>>(new Map());

  /**
   * Load a local font and return a signal with the result
   */
  loadFont(options: LocalFontOptions) {
    const cacheKey = `local:${JSON.stringify(options)}`;

    // Check if already loaded
    const existingFont = this.loadedFonts().get(cacheKey);
    if (existingFont) {
      return signal(existingFont);
    }

    // Load the font
    const fontResult = localFont(options);

    // Update the signal
    this.loadedFonts.update((fonts) => {
      const newMap = new Map(fonts);
      newMap.set(cacheKey, fontResult);
      return newMap;
    });

    return signal(fontResult);
  }

  /**
   * Get all loaded fonts
   */
  getAllLoadedFonts() {
    return computed(() => Array.from(this.loadedFonts().values()));
  }

  /**
   * Check if a font is loaded
   */
  isFontLoaded(options: LocalFontOptions): boolean {
    const cacheKey = `local:${JSON.stringify(options)}`;
    return this.loadedFonts().has(cacheKey);
  }

  /**
   * Preload multiple fonts
   */
  async preloadFonts(fontConfigs: LocalFontOptions[]) {
    const promises = fontConfigs.map((options) => this.loadFont(options));

    await Promise.all(promises);
  }

  /**
   * Get CSS variables for all loaded fonts (useful for Tailwind)
   */
  getCSSVariables() {
    return computed(() => {
      const variables: Record<string, string> = {};

      for (const font of this.loadedFonts().values()) {
        if (font.variable) {
          variables[font.variable] = font.style.fontFamily;
        }
      }

      return variables;
    });
  }

  /**
   * Generate CSS class string for all loaded fonts
   */
  getFontClasses() {
    return computed(() => {
      return Array.from(this.loadedFonts().values())
        .map((font) => font.className)
        .join(" ");
    });
  }
}
