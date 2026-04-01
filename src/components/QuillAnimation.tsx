const QuillAnimation = () => {
  // Carefully crafted cursive "Blog" - each letter clearly readable
  const letterB = `M 200 270 L 200 235 C 200 232 210 230 215 233 C 220 236 218 242 212 243 C 207 244 200 243 200 250 C 200 248 208 245 214 248 C 220 251 218 258 212 260 C 206 262 200 260 200 258`;
  const letterL = `M 230 270 L 230 232`;
  const letterO = `M 245 258 C 245 248 255 245 260 250 C 265 255 262 268 255 270 C 248 272 245 265 245 258`;
  const letterG = `M 275 258 C 275 248 285 245 290 250 C 295 255 292 265 285 267 C 278 269 275 265 275 260 L 278 270 C 278 280 274 286 270 286 C 266 286 266 282 268 279`;

  const blogPath = `${letterB} ${letterL} ${letterO} ${letterG}`;

  // Connecting strokes between letters
  const connections = `M 212 258 Q 220 268 230 270 M 230 270 Q 238 272 245 258 M 260 268 Q 268 274 275 258`;

  // Decorative flourish after g - flowing waves, loops, and curves
  const flourish = `M 268 279
    C 290 270 320 255 360 265
    C 400 275 420 250 450 240
    C 480 230 500 255 530 260
    C 560 265 580 235 610 225
    C 640 215 660 245 690 250
    C 720 255 740 220 770 210
    C 800 200 820 235 850 240
    C 870 244 880 215 910 208
    C 940 200 950 230 975 235
    C 1000 240 1010 210 1040 205
    C 1060 200 1075 220 1085 230
    C 1095 240 1100 225 1095 215
    C 1090 205 1075 210 1070 220
    C 1065 230 1075 240 1085 235`;

  // Full motion path for the pen
  const motionPath = `M 165 262 L 165 268 L 165 262 L ${letterB.replace('M 200 270', '200 270')} ${connections.replace(/M\s/g, 'L ').replace(/\sM\s/g, ' L ')} L 230 270 L 230 232 L 245 258 ${letterO.replace('M 245 258', '')} L 275 258 ${letterG.replace('M 275 258', '')} ${flourish.replace('M 268 279', 'L 268 279')}`;

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
        {/* Ink well */}
        <g transform="translate(145, 240)">
          <ellipse cx="0" cy="20" rx="12" ry="4.5" stroke="white" strokeWidth="1.5" fill="none" />
          <path d="M-8 20 L-8 8 Q-8 2 -2 0 L2 0 Q8 2 8 8 L8 20" stroke="white" strokeWidth="1.5" fill="none" />
          <ellipse cx="0" cy="0" rx="6" ry="2.5" stroke="white" strokeWidth="1" fill="none" />
        </g>

        {/* Hidden motion path */}
        <path id="penPath" d={motionPath} stroke="none" fill="none" />

        {/* Animated pen */}
        <g>
          <animateMotion dur="10s" repeatCount="indefinite" rotate="auto">
            <mpath href="#penPath" />
          </animateMotion>

          <g>
            {/* Writing pressure */}
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,1.5; 0,0"
              dur="1.2s"
              repeatCount="indefinite"
            />

            {/* Pen body - sleek fountain pen shape */}
            {/* Nib at origin */}
            <path d="M0 0 L-2 -1 L-6 -0.5 L-2 1 Z" stroke="white" strokeWidth="0.7" fill="none" strokeLinejoin="round" />
            {/* Grip section */}
            <path d="M-6 -0.5 L-7 -1.2 L-18 -6 L-17 -7.5 L-6 -1.5" stroke="white" strokeWidth="0.9" fill="none" strokeLinecap="round" />
            {/* Barrel */}
            <path d="M-18 -6 L-40 -16 M-17 -7.5 L-39 -17.5" stroke="white" strokeWidth="0.8" fill="none" strokeLinecap="round" />
            {/* Cap / end */}
            <path d="M-40 -16 L-42 -16.8 L-41 -18.2 L-39 -17.5" stroke="white" strokeWidth="0.7" fill="none" />
            {/* Clip */}
            <path d="M-35 -17 L-28 -14 L-28 -13" stroke="white" strokeWidth="0.5" fill="none" strokeLinecap="round" />
          </g>
        </g>

        {/* Blog calligraphy - letter B */}
        <path
          d={`${letterB} ${connections}`}
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="500"
          strokeDashoffset="500"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="500;500;350;0;0;0;500"
            keyTimes="0;0.04;0.2;0.48;0.52;0.9;1"
            dur="10s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;1;1;1;1;0;0"
            keyTimes="0;0.04;0.48;0.52;0.85;0.95;1"
            dur="10s"
            repeatCount="indefinite"
          />
        </path>

        {/* Blog calligraphy - letters l, o, g */}
        <path
          d={`${letterL} ${letterO} ${letterG}`}
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="400"
          strokeDashoffset="400"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="400;400;400;0;0;0;400"
            keyTimes="0;0.18;0.22;0.5;0.54;0.9;1"
            dur="10s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0;1;1;1;0;0"
            keyTimes="0;0.18;0.22;0.54;0.85;0.95;1"
            dur="10s"
            repeatCount="indefinite"
          />
        </path>

        {/* Decorative flourish */}
        <path
          d={flourish}
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
            keyTimes="0;0.5;0.54;0.88;0.9;1"
            dur="10s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0;0.7;0.7;0;0"
            keyTimes="0;0.52;0.56;0.84;0.95;1"
            dur="10s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
};

export default QuillAnimation;
