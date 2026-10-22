import { describe, expect, it } from 'vitest';
import { sitePath } from '../src/lib/urls';

describe('internal URLs on root and GitHub Pages hosting', () => {
  it('keeps root-hosted links unchanged', () => {
    expect(sitePath('/', '/')).toBe('/');
    expect(sitePath('/lessons/simplex/', '/')).toBe('/lessons/simplex/');
  });
  it('keeps the project directory on navigation and favicon URLs', () => {
    expect(sitePath('/', '/consensus-field-guide/')).toBe('/consensus-field-guide/');
    expect(sitePath('/favicon.svg', '/consensus-field-guide/')).toBe('/consensus-field-guide/favicon.svg');
    expect(sitePath('/lessons/simplex/', '/consensus-field-guide/')).toBe('/consensus-field-guide/lessons/simplex/');
  });
  it('preserves family-tree queries and glossary anchors', () => {
    expect(sitePath('/?p=tm', '/consensus-field-guide/')).toBe('/consensus-field-guide/?p=tm');
    expect(sitePath('/glossary/#view', '/consensus-field-guide/')).toBe('/consensus-field-guide/glossary/#view');
  });
});
