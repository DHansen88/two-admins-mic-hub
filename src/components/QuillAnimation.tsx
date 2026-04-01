const QuillAnimation = () => {
  // Cursive "Blog" path - carefully crafted to be legible
  // B: start at baseline, up stem, two bumps
  // l: tall stroke
  // o: oval
  // g: oval with descender
  const blogPath = `
    M 140 260
    L 140 220
    Q 140 218 145 220
    Q 165 228 160 245
    Q 158 252 145 250
    Q 140 249 140 245
    Q 140 243 148 240
    Q 168 235 162 258
    Q 160 268 145 265
    Q 140 264 143 260
    L 170 260

    L 185 260
    L 185 222
    Q 185 220 188 225
    L 195 260

    Q 195 258 200 248
    Q 208 238 218 238
    Q 228 238 228 250
    Q 228 262 218 262
    Q 208 262 205 252
    Q 202 245 208 240
    L 230 260

    Q 232 258 238 248
    Q 245 238 255 238
    Q 265 238 265 248
    Q 265 260 255 262
    Q 245 262 240 255
    L 240 260
    L 240 278
    Q 240 290 232 290
    Q 224 290 225 282
    Q 226 276 232 278
  `;

  // Extended decorative trail after the "g"
  const swirlPath = `
    M 250 268
    Q 280 240 320 230
    Q 370 218 420 225
    Q 470 232 510 215
    Q 560 195 610 205
    Q 660 215 700 195
    Q 750 172 800 185
    Q 850 198 900 178
    Q 940 162 980 172
    Q 1020 182 1050 165
    Q 1080 150 1110 162
    Q 1130 172 1120 185
    Q 1108 200 1095 188
    Q 1085 175 1100 168
  `;

  // Loop flourishes
  const loops = `
    M 650 208
    Q 670 180 685 170
    Q 700 162 695 175
    Q 690 190 680 200
    Q 670 210 685 212
    Q 700 212 705 195

    M 850 192
    Q 870 165 885 155
    Q 900 148 895 162
    Q 888 178 878 188
    Q 868 198 882 200
    Q 898 200 902 182

    M 1020 175
    Q 1035 152 1048 145
    Q 1060 140 1055 152
    Q 1048 168 1040 178
    Q 1032 188 1045 188
    Q 1058 188 1060 172
  `;

  // Full motion path for quill (inkwell dip → Blog → swirls)
  const motionPath = `
    M 80 248
    L 80 255
    L 80 248
    L 140 260
    ${blogPath.replace(/M\s*140\s*260/, '')}
    ${swirlPath.replace(/M\s*250\s*268/, 'L 250 268')}
  `;

  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
      <svg
        viewBox="0 0 1200 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.15 }}
      >
        <defs>
          {/* Feather gradient for subtle depth */}
          <linearGradient id="featherGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0.6" />
            <stop offset="50%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Ink well */}
        <g transform="translate(55, 205)">
          {/* Base */}
          <path d="M-12 62 Q-8 70 25 72 Q58 70 62 62 L62 56 Q58 50 25 48 Q-8 50 -12 56 Z"
            stroke="white" strokeWidth="1.8" fill="none" />
          <ellipse cx="25" cy="48" rx="37" ry="8" stroke="white" strokeWidth="1.2" fill="none" />
          {/* Bottle */}
          <path d="M8 48 L8 18 Q8 10 18 8 L32 8 Q42 10 42 18 L42 48" stroke="white" strokeWidth="1.8" fill="none" />
          {/* Neck */}
          <path d="M14 8 L14 2 Q14 -2 20 -3 L30 -3 Q36 -2 36 2 L36 8" stroke="white" strokeWidth="1.5" fill="none" />
          {/* Cap */}
          <ellipse cx="25" cy="-3" rx="12" ry="3.5" stroke="white" strokeWidth="1.2" fill="none" />
          <path d="M19 -6 Q25 -12 31 -6" stroke="white" strokeWidth="1.2" fill="none" />
          {/* Label */}
          <rect x="13" y="22" width="24" height="14" rx="2" stroke="white" strokeWidth="0.8" fill="none" />
        </g>

        {/* Hidden motion path */}
        <path id="quillMotion" d={motionPath} stroke="none" fill="none" />

        {/* Animated quill group */}
        <g>
          <animateMotion
            dur="16s"
            repeatCount="indefinite"
            rotate="auto"
          >
            <mpath href="#quillMotion" />
          </animateMotion>

          {/* Quill - nib at origin (0,0) so it leads the writing */}
          <g transform="translate(0, 0)">
            {/* Nib point */}
            <path d="M0 0 L-3 -2 L-6 -1 L-3 1.5 Z" stroke="white" strokeWidth="0.6" fill="white" fillOpacity="0.8" />

            {/* Shaft */}
            <line x1="-6" y1="-1" x2="-18" y2="-8" stroke="white" strokeWidth="1.2" strokeLinecap="round" />

            {/* Feather - bold filled silhouette like the reference */}
            {/* Wide at base, sweeping curve, sharp point at tip */}
            <path d="M-18 -8
              Q-22 -12 -28 -22
              Q-34 -34 -38 -48
              Q-42 -62 -44 -76
              Q-46 -88 -44 -96
              Q-42 -104 -38 -108
              Q-34 -110 -32 -108
              Q-28 -104 -26 -96
              Q-24 -86 -24 -74
              Q-24 -60 -26 -46
              Q-28 -34 -30 -24
              Q-32 -16 -30 -12
              Q-26 -8 -22 -8
              Z"
              stroke="white" strokeWidth="0.8" fill="white" fillOpacity="0.7" />

            {/* Central rachis - white line through filled feather */}
            <path d="M-18 -8 Q-30 -30 -38 -60 Q-42 -80 -40 -100 Q-38 -108 -34 -110"
              stroke="hsl(var(--navy))" strokeWidth="0.8" fill="none" />

            {/* Vein lines branching from rachis - cutting through fill */}
            {/* Right side veins */}
            <path d="M-28 -24 Q-26 -30 -24 -28" stroke="hsl(var(--navy))" strokeWidth="0.4" fill="none" />
            <path d="M-32 -38 Q-28 -44 -26 -40" stroke="hsl(var(--navy))" strokeWidth="0.4" fill="none" />
            <path d="M-36 -52 Q-30 -58 -26 -54" stroke="hsl(var(--navy))" strokeWidth="0.4" fill="none" />
            <path d="M-40 -66 Q-34 -72 -28 -68" stroke="hsl(var(--navy))" strokeWidth="0.35" fill="none" />
            <path d="M-42 -78 Q-36 -84 -28 -80" stroke="hsl(var(--navy))" strokeWidth="0.35" fill="none" />
            <path d="M-44 -90 Q-38 -94 -30 -90" stroke="hsl(var(--navy))" strokeWidth="0.3" fill="none" />

            {/* Left side veins */}
            <path d="M-30 -24 Q-34 -28 -36 -24" stroke="hsl(var(--navy))" strokeWidth="0.4" fill="none" />
            <path d="M-34 -38 Q-38 -44 -40 -38" stroke="hsl(var(--navy))" strokeWidth="0.4" fill="none" />
            <path d="M-38 -52 Q-42 -58 -44 -52" stroke="hsl(var(--navy))" strokeWidth="0.4" fill="none" />
            <path d="M-40 -66 Q-44 -72 -46 -66" stroke="hsl(var(--navy))" strokeWidth="0.35" fill="none" />
            <path d="M-42 -78 Q-46 -84 -46 -78" stroke="hsl(var(--navy))" strokeWidth="0.35" fill="none" />
          </g>
        </g>

        {/* Calligraphy "Blog" - revealed by stroke animation */}
        <path
          d={blogPath}
          stroke="white"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="600"
          strokeDashoffset="600"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="600;600;0;0;0;600"
            keyTimes="0;0.06;0.44;0.48;0.88;1"
            dur="16s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;1;1;1;0;0"
            keyTimes="0;0.06;0.48;0.82;0.92;1"
            dur="16s"
            repeatCount="indefinite"
          />
        </path>

        {/* Decorative swirls */}
        <path
          d={swirlPath}
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="1000"
          strokeDashoffset="1000"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="1000;1000;1000;0;0;1000"
            keyTimes="0;0.44;0.48;0.85;0.88;1"
            dur="16s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0;0.7;0.7;0;0"
            keyTimes="0;0.46;0.5;0.82;0.92;1"
            dur="16s"
            repeatCount="indefinite"
          />
        </path>

        {/* Loop flourishes */}
        <path
          d={loops}
          stroke="white"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="500"
          strokeDashoffset="500"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="500;500;500;0;0;500"
            keyTimes="0;0.55;0.58;0.82;0.86;1"
            dur="16s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0;0.5;0.5;0;0"
            keyTimes="0;0.55;0.6;0.8;0.92;1"
            dur="16s"
            repeatCount="indefinite"
          />
        </path>

        {/* Ink dots along trail */}
        {[
          { cx: 420, cy: 225, delay: 0.55 },
          { cx: 610, cy: 205, delay: 0.62 },
          { cx: 800, cy: 185, delay: 0.7 },
          { cx: 980, cy: 172, delay: 0.78 },
        ].map((dot, i) => (
          <circle key={i} cx={dot.cx} cy={dot.cy} r="0" fill="white">
            <animate
              attributeName="r"
              values="0;0;2.5;2;0;0"
              keyTimes={`0;${dot.delay};${(dot.delay + 0.03).toFixed(2)};0.85;0.92;1`}
              dur="16s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0;0.6;0.5;0;0"
              keyTimes={`0;${dot.delay};${(dot.delay + 0.03).toFixed(2)};0.85;0.92;1`}
              dur="16s"
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
    </div>
  );
};

export default QuillAnimation;
