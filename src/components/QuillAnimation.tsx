const QuillAnimation = () => {
  // Calligraphy "Blog" - carefully shaped cursive letters
  const blogWriting = `
    M 220 265
    C 220 245 220 240 225 235
    C 232 228 240 232 238 242
    C 236 252 228 258 222 255
    C 218 252 220 248 222 245
    C 225 240 235 235 240 240
    C 245 248 240 258 232 260
    C 226 262 222 258 224 252
    L 250 265

    L 265 230
    L 265 268

    C 280 265 288 255 292 250
    C 298 242 305 240 308 245
    C 312 252 308 260 300 262
    C 292 264 286 258 288 250
    C 290 244 296 240 302 242

    L 318 268
    C 322 264 328 255 334 250
    C 340 244 348 242 350 248
    C 352 256 348 264 340 266
    C 332 268 328 262 330 255
    L 330 268
    L 332 280
    C 332 290 326 292 322 288
    C 320 284 322 278 328 278
  `;

  // Decorative swirls after Blog
  const swirls = `
    M 350 270
    C 380 258 420 248 460 252
    C 500 256 530 245 560 240
    C 600 232 640 238 680 230
    C 720 222 760 228 800 220
    C 840 212 880 218 920 210
    C 950 204 980 210 1000 205
    C 1030 198 1060 205 1080 200
    C 1100 195 1110 200 1105 210
    C 1100 218 1088 215 1085 208
  `;

  // Full motion path: inkwell dip → write Blog → swirl across
  const motionPath = `
    M 180 270
    L 180 276
    L 180 270
    ${blogWriting.replace(/M\s*220\s*265/, 'L 220 265')}
    ${swirls.replace(/M\s*350\s*270/, 'L 350 270')}
  `;

  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
      <svg
        viewBox="0 0 1200 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.12 }}
      >
        {/* Ink well - small elegant */}
        <g transform="translate(155, 248)">
          <ellipse cx="0" cy="18" rx="14" ry="5" stroke="white" strokeWidth="1.5" fill="none" />
          <path d="M-10 18 L-10 6 Q-10 0 -4 -2 L4 -2 Q10 0 10 6 L10 18" stroke="white" strokeWidth="1.5" fill="none" />
          <ellipse cx="0" cy="-2" rx="8" ry="3" stroke="white" strokeWidth="1" fill="none" />
        </g>

        {/* Motion path (hidden) */}
        <path id="qPath" d={motionPath} stroke="none" fill="none" />

        {/* Animated quill - small, nib-forward */}
        <g>
          <animateMotion dur="10s" repeatCount="indefinite" rotate="auto">
            <mpath href="#qPath" />
          </animateMotion>

          {/* Quill - nib at (0,0), feather trails behind */}
          <g>
            {/* Writing pressure bob */}
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,2; 0,0"
              dur="1.5s"
              repeatCount="indefinite"
            />

            {/* Nib */}
            <path d="M0 0 L-3 -1.5 L-5 0 L-3 1.5 Z" stroke="white" strokeWidth="0.8" strokeLinejoin="round" fill="none" />
            <line x1="-3.5" y1="0" x2="-1" y2="0" stroke="white" strokeWidth="0.4" />

            {/* Short shaft */}
            <line x1="-5" y1="0" x2="-14" y2="-5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />

            {/* Feather - small elegant quill shape */}
            {/* Spine */}
            <path d="M-14 -5 C-18 -8 -24 -16 -28 -26 C-32 -36 -34 -46 -32 -52 C-30 -56 -28 -58 -26 -56"
              stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" />

            {/* Right barbs - soft curves */}
            <path d="M-16 -8 C-14 -12 -12 -11 -11 -10" stroke="white" strokeWidth="0.6" strokeLinecap="round" fill="none" />
            <path d="M-19 -14 C-16 -18 -13 -17 -12 -15" stroke="white" strokeWidth="0.6" strokeLinecap="round" fill="none" />
            <path d="M-22 -20 C-18 -25 -15 -23 -14 -21" stroke="white" strokeWidth="0.55" strokeLinecap="round" fill="none" />
            <path d="M-25 -26 C-21 -32 -17 -30 -16 -27" stroke="white" strokeWidth="0.55" strokeLinecap="round" fill="none" />
            <path d="M-28 -32 C-24 -38 -20 -36 -19 -33" stroke="white" strokeWidth="0.5" strokeLinecap="round" fill="none" />
            <path d="M-30 -38 C-26 -44 -22 -42 -21 -39" stroke="white" strokeWidth="0.5" strokeLinecap="round" fill="none" />
            <path d="M-32 -44 C-28 -50 -25 -48 -24 -45" stroke="white" strokeWidth="0.45" strokeLinecap="round" fill="none" />

            {/* Left barbs */}
            <path d="M-16 -8 C-18 -10 -20 -8 -20 -6" stroke="white" strokeWidth="0.6" strokeLinecap="round" fill="none" />
            <path d="M-19 -14 C-22 -16 -24 -13 -24 -11" stroke="white" strokeWidth="0.6" strokeLinecap="round" fill="none" />
            <path d="M-22 -20 C-26 -22 -28 -18 -28 -16" stroke="white" strokeWidth="0.55" strokeLinecap="round" fill="none" />
            <path d="M-25 -26 C-30 -28 -32 -24 -32 -22" stroke="white" strokeWidth="0.55" strokeLinecap="round" fill="none" />
            <path d="M-28 -32 C-33 -33 -36 -29 -36 -27" stroke="white" strokeWidth="0.5" strokeLinecap="round" fill="none" />
            <path d="M-30 -38 C-35 -39 -38 -35 -38 -33" stroke="white" strokeWidth="0.5" strokeLinecap="round" fill="none" />
            <path d="M-32 -44 C-36 -45 -38 -42 -38 -40" stroke="white" strokeWidth="0.45" strokeLinecap="round" fill="none" />
          </g>
        </g>

        {/* The calligraphy "Blog" trail */}
        <path
          d={blogWriting}
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="600"
          strokeDashoffset="600"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="600;600;0;0;0;600"
            keyTimes="0;0.05;0.5;0.55;0.9;1"
            dur="10s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;1;1;1;0;0"
            keyTimes="0;0.05;0.55;0.84;0.94;1"
            dur="10s"
            repeatCount="indefinite"
          />
        </path>

        {/* Decorative swirls after g */}
        <path
          d={swirls}
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="900"
          strokeDashoffset="900"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="900;900;900;0;0;900"
            keyTimes="0;0.5;0.52;0.88;0.9;1"
            dur="10s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0;0.7;0.7;0;0"
            keyTimes="0;0.5;0.54;0.84;0.94;1"
            dur="10s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
};

export default QuillAnimation;
