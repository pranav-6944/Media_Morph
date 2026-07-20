const fs = require('fs');
let css = fs.readFileSync('frontend/src/index.css', 'utf8');

// Replace standard variables in :root
css = css.replace(':root {', `:root {
  /* Default Dark Mode */
`);

// Add Light Theme
css += `

/* ── Light Theme Overrides ────────────────────────────────────── */
:root[data-theme='light'] {
  --bg:        #F5F2EE;
  --bg-1:      #FFFFFF;
  --bg-2:      #F0ECE4;
  --bg-3:      #E8E2D8;

  --gold:      #A87A3E;
  --gold-lt:   #C09A5F;
  --gold-dim:  #876231;
  --gold-faint:rgba(168,122,62,.08);

  --cream:     #2A2825;
  --muted:     #6D665E;
  --dim:       #A39E97;
  
  --sh-sm: 0 2px 6px rgba(0,0,0,.04), 0 8px 20px rgba(0,0,0,.03), inset 0 1px 0 rgba(255,255,255,.6), inset 0 0 0 1px rgba(0,0,0,.02);
  --sh-md: 0 4px 12px rgba(0,0,0,.05), 0 20px 48px rgba(0,0,0,.04), 0 40px 80px rgba(0,0,0,.03), inset 0 1px 0 rgba(255,255,255,.8), inset 0 0 0 1px rgba(0,0,0,.03);
  --sh-lg: 0 8px 20px rgba(0,0,0,.06), 0 32px 64px rgba(0,0,0,.05), 0 64px 120px rgba(0,0,0,.04), inset 0 1px 0 rgba(255,255,255,.9), inset 0 0 0 1px rgba(0,0,0,.03);
  --sh-btn:0 2px 4px rgba(0,0,0,.08), 0 8px 24px rgba(0,0,0,.06), inset 0 1px 0 rgba(255,255,255,.8), inset 0 -1px 3px rgba(0,0,0,.05);
}
@media (prefers-color-scheme: light) {
  :root:not([data-theme='dark']) {
    --bg:        #F5F2EE;
    --bg-1:      #FFFFFF;
    --bg-2:      #F0ECE4;
    --bg-3:      #E8E2D8;

    --gold:      #A87A3E;
    --gold-lt:   #C09A5F;
    --gold-dim:  #876231;
    --gold-faint:rgba(168,122,62,.08);

    --cream:     #2A2825;
    --muted:     #6D665E;
    --dim:       #A39E97;
    
    --sh-sm: 0 2px 6px rgba(0,0,0,.04), 0 8px 20px rgba(0,0,0,.03), inset 0 1px 0 rgba(255,255,255,.6), inset 0 0 0 1px rgba(0,0,0,.02);
    --sh-md: 0 4px 12px rgba(0,0,0,.05), 0 20px 48px rgba(0,0,0,.04), 0 40px 80px rgba(0,0,0,.03), inset 0 1px 0 rgba(255,255,255,.8), inset 0 0 0 1px rgba(0,0,0,.03);
    --sh-lg: 0 8px 20px rgba(0,0,0,.06), 0 32px 64px rgba(0,0,0,.05), 0 64px 120px rgba(0,0,0,.04), inset 0 1px 0 rgba(255,255,255,.9), inset 0 0 0 1px rgba(0,0,0,.03);
    --sh-btn:0 2px 4px rgba(0,0,0,.08), 0 8px 24px rgba(0,0,0,.06), inset 0 1px 0 rgba(255,255,255,.8), inset 0 -1px 3px rgba(0,0,0,.05);
  }
}
`;

// Replace hardcoded RGBA and colors to support dynamic theme switching
css = css.replace(/rgba\(192,154,95,([^)]+)\)/g, 'color-mix(in srgb, var(--gold) calc(100% * $1), transparent)');
css = css.replace(/rgba\(255,255,255,([^)]+)\)/g, 'color-mix(in srgb, var(--cream) calc(100% * $1), transparent)');
css = css.replace(/rgba\(9,8,15,([^)]+)\)/g, 'color-mix(in srgb, var(--bg) calc(100% * $1), transparent)');

// We leave black shadows alone since light mode still needs shadows. 

// A few specific replacements for hardcoded hex backgrounds
css = css.replace(/background:linear-gradient\(145deg,#1C1A2E,#14122A\)/g, 'background:linear-gradient(145deg,var(--bg-3),var(--bg-2))');
css = css.replace(/background:linear-gradient\(145deg,#1A1C2E,#12142A\)/g, 'background:linear-gradient(145deg,var(--bg-3),var(--bg-2))');
css = css.replace(/background:linear-gradient\(145deg,#2A1C1C,#1E1414\)/g, 'background:linear-gradient(145deg,var(--bg-3),var(--bg-2))');

fs.writeFileSync('frontend/src/index.css', css);
console.log('Done!');
