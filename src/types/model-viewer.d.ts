/* eslint-disable @typescript-eslint/no-empty-object-type */
import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        poster?: string;
        loading?: 'auto' | 'lazy' | 'eager';
        reveal?: 'auto' | 'interaction' | 'manual';
        'auto-rotate'?: boolean | string;
        'auto-rotate-delay'?: number | string;
        'rotation-per-second'?: string;
        'camera-controls'?: boolean | string;
        'camera-orbit'?: string;
        'camera-target'?: string;
        'field-of-view'?: string;
        'min-camera-orbit'?: string;
        'max-camera-orbit'?: string;
        'min-field-of-view'?: string;
        'max-field-of-view'?: string;
        'environment-image'?: string;
        'shadow-intensity'?: string | number;
        'shadow-softness'?: string | number;
        exposure?: string | number;
        'tone-mapping'?: string;
        'interaction-prompt'?: 'auto' | 'none' | 'when-focused';
        'touch-action'?: string;
      };
    }
  }
}
