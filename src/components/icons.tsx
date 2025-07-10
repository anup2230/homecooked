import type { SVGProps } from 'react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="170" height="28" viewBox="0 0 170 28" {...props}>
      <text x="0" y="22" fontFamily="'PT Sans', sans-serif" fontSize="24" fontWeight="bold" fill="hsl(var(--foreground))">
        Homecooked
      </text>
    </svg>
  ),
};
