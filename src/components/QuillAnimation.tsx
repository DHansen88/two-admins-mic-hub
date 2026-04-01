const QuillAnimation = () => {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
      <svg
        viewBox="0 0 1200 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.1 }}
      >
        {/* Quill feather group - positioned bottom-left, angled for writing */}
        <g transform="translate(120, 230)">
          {/* Subtle writing pressure animation */}
          <animateTransform
            attributeName="transform"
            type="translate"
            values="120,230; 120,234; 120,230"
            dur="2s"
            repeatCount="indefinite"
            additive="replace"
          />
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0; 2; 0"
              dur="2s"
              repeatCount="indefinite"
            />

            {/* Central spine - the backbone of the feather */}
            <path
              d="M0 0 Q-20 -15 -40 -35 Q-55 -52 -65 -72 Q-72 -88 -74 -105 Q-75 -118 -72 -128 Q-68 -138 -62 -142"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Right barbs - elegant thin curves */}
            <path d="M-20 -15 Q-14 -22 -10 -20" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M-28 -25 Q-20 -34 -14 -30" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M-36 -35 Q-26 -46 -18 -42" stroke="white" strokeWidth="1.1" strokeLinecap="round" fill="none" />
            <path d="M-44 -46 Q-34 -58 -24 -52" stroke="white" strokeWidth="1.1" strokeLinecap="round" fill="none" />
            <path d="M-52 -56 Q-42 -70 -30 -64" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" />
            <path d="M-58 -66 Q-48 -80 -36 -74" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" />
            <path d="M-63 -76 Q-54 -90 -42 -84" stroke="white" strokeWidth="0.9" strokeLinecap="round" fill="none" />
            <path d="M-67 -86 Q-58 -100 -48 -94" stroke="white" strokeWidth="0.9" strokeLinecap="round" fill="none" />
            <path d="M-70 -96 Q-62 -108 -54 -104" stroke="white" strokeWidth="0.8" strokeLinecap="round" fill="none" />
            <path d="M-72 -106 Q-66 -116 -58 -114" stroke="white" strokeWidth="0.7" strokeLinecap="round" fill="none" />
            <path d="M-73 -115 Q-68 -124 -62 -122" stroke="white" strokeWidth="0.6" strokeLinecap="round" fill="none" />

            {/* Left barbs */}
            <path d="M-20 -15 Q-26 -20 -30 -16" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M-28 -25 Q-36 -30 -40 -24" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M-36 -35 Q-46 -40 -50 -32" stroke="white" strokeWidth="1.1" strokeLinecap="round" fill="none" />
            <path d="M-44 -46 Q-54 -50 -60 -42" stroke="white" strokeWidth="1.1" strokeLinecap="round" fill="none" />
            <path d="M-52 -56 Q-62 -60 -68 -50" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" />
            <path d="M-58 -66 Q-68 -68 -74 -60" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" />
            <path d="M-63 -76 Q-72 -78 -78 -70" stroke="white" strokeWidth="0.9" strokeLinecap="round" fill="none" />
            <path d="M-67 -86 Q-76 -86 -80 -80" stroke="white" strokeWidth="0.9" strokeLinecap="round" fill="none" />
            <path d="M-70 -96 Q-78 -96 -82 -90" stroke="white" strokeWidth="0.8" strokeLinecap="round" fill="none" />
            <path d="M-72 -106 Q-78 -106 -80 -100" stroke="white" strokeWidth="0.7" strokeLinecap="round" fill="none" />
            <path d="M-73 -115 Q-78 -116 -78 -110" stroke="white" strokeWidth="0.6" strokeLinecap="round" fill="none" />

            {/* Nib / tip - small sharp point */}
            <path d="M0 0 L4 2 L8 0 L4 -1.5 Z" stroke="white" strokeWidth="1" strokeLinejoin="round" fill="none" />
            <line x1="2" y1="0.5" x2="7" y2="0" stroke="white" strokeWidth="0.5" />
          </g>
        </g>

        {/* Writing line - continuous from quill tip, writes "Blog" in calligraphy */}
        <path
          d="M128 230
             Q140 232 160 240
             Q170 244 175 238
             Q180 228 185 225
             Q192 220 195 228
             Q198 238 195 244
             Q190 250 182 248
             Q176 246 175 240
             Q176 236 180 235
             L200 248

             L215 220 L215 252

             Q220 248 228 240
             Q236 232 244 232
             Q252 232 254 240
             Q256 250 248 254
             Q240 256 234 250
             Q230 244 236 238

             L262 252
             Q268 248 274 240
             Q280 232 288 232
             Q296 232 298 240
             Q300 250 292 254
             Q284 256 280 250
             L278 252
             L278 270
             Q278 280 272 282
             Q266 284 266 278
             Q266 272 272 272

             Q290 260 320 248
             Q360 232 400 228
             Q450 222 500 230
             Q540 238 570 225
             Q600 212 640 220
             Q680 230 720 215
             Q760 200 800 210
             Q840 220 880 205
             Q920 190 960 200
             Q1000 210 1040 195
             Q1060 188 1080 195
             Q1100 202 1090 215
             Q1080 225 1068 218
             Q1058 210 1070 200"
          stroke="white"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2000"
          strokeDashoffset="2000"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="2000;2000;0;0;0;2000"
            keyTimes="0;0.05;0.85;0.88;0.92;1"
            dur="10s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;1;1;1;0;0"
            keyTimes="0;0.05;0.85;0.88;0.95;1"
            dur="10s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
};

export default QuillAnimation;
