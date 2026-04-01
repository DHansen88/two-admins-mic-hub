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
        {/* Ink well - bottom left */}
        <g transform="translate(60, 200)">
          {/* Base/stand */}
          <path d="M-10 60 Q-10 65 0 68 L50 68 Q60 65 60 60 L60 55 Q60 50 50 48 L0 48 Q-10 50 -10 55 Z" stroke="white" strokeWidth="2" fill="none" />
          {/* Bottle body */}
          <path d="M8 48 L8 20 Q8 12 16 10 L34 10 Q42 12 42 20 L42 48" stroke="white" strokeWidth="2" fill="none" />
          {/* Bottle neck */}
          <path d="M16 10 L16 4 Q16 0 20 0 L30 0 Q34 0 34 4 L34 10" stroke="white" strokeWidth="2" fill="none" />
          {/* Cap ornament */}
          <ellipse cx="25" cy="0" rx="10" ry="3" stroke="white" strokeWidth="1.5" fill="none" />
          <path d="M20 -3 Q25 -8 30 -3" stroke="white" strokeWidth="1.5" fill="none" />
          {/* Label area */}
          <rect x="12" y="22" width="26" height="16" rx="2" stroke="white" strokeWidth="1" fill="none" />
          <line x1="16" y1="28" x2="36" y2="28" stroke="white" strokeWidth="0.5" />
          <line x1="18" y1="32" x2="34" y2="32" stroke="white" strokeWidth="0.5" />
          {/* Ink level */}
          <path d="M10 40 Q25 36 40 40" stroke="white" strokeWidth="0.8" fill="none" />
        </g>

        {/* Quill pen that travels - animated along a motion path */}
        <g style={{ opacity: 1 }}>
          <animateMotion
            dur="12s"
            repeatCount="indefinite"
            rotate="auto"
            keyPoints="0;0;0.05;0.12;0.2;0.28;0.36;0.42;0.55;0.65;0.75;0.85;0.92;1"
            keyTimes="0;0.05;0.1;0.2;0.3;0.4;0.48;0.52;0.6;0.7;0.8;0.88;0.95;1"
          >
            <mpath href="#quillPath" />
          </animateMotion>

          {/* Feather */}
          <g transform="rotate(-135) translate(-80, -10)">
            {/* Main shaft */}
            <line x1="0" y1="0" x2="75" y2="0" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            {/* Feather body - left barbs */}
            <path d="M75 0 Q82 -4 90 -6 Q85 -10 80 -18 Q78 -12 75 -6 Q72 -3 75 0" stroke="white" strokeWidth="1.2" fill="none" />
            <path d="M65 0 Q72 -3 78 -5 Q74 -9 70 -15 Q68 -10 65 -5 Q63 -2 65 0" stroke="white" strokeWidth="1" fill="none" />
            <path d="M55 0 Q60 -2 66 -4 Q63 -8 60 -13 Q58 -8 55 -4 Q54 -1 55 0" stroke="white" strokeWidth="0.8" fill="none" />
            <path d="M45 0 Q50 -2 55 -3 Q52 -6 50 -10 Q48 -6 45 -3 Q44 -1 45 0" stroke="white" strokeWidth="0.7" fill="none" />
            {/* Feather body - right barbs */}
            <path d="M75 0 Q82 4 90 6 Q85 10 80 18 Q78 12 75 6 Q72 3 75 0" stroke="white" strokeWidth="1.2" fill="none" />
            <path d="M65 0 Q72 3 78 5 Q74 9 70 15 Q68 10 65 5 Q63 2 65 0" stroke="white" strokeWidth="1" fill="none" />
            <path d="M55 0 Q60 2 66 4 Q63 8 60 13 Q58 8 55 4 Q54 1 55 0" stroke="white" strokeWidth="0.8" fill="none" />
            <path d="M45 0 Q50 2 55 3 Q52 6 50 10 Q48 6 45 3 Q44 1 45 0" stroke="white" strokeWidth="0.7" fill="none" />
            {/* Central vane line */}
            <line x1="40" y1="0" x2="90" y2="0" stroke="white" strokeWidth="0.6" />
            {/* Ornate grip */}
            <circle cx="12" cy="0" r="3" stroke="white" strokeWidth="1.2" fill="none" />
            <path d="M15 0 Q18 -2 20 0 Q18 2 15 0" stroke="white" strokeWidth="1" fill="none" />
            {/* Nib */}
            <path d="M0 0 L-8 -2 L-12 0 L-8 2 Z" stroke="white" strokeWidth="1.2" fill="none" />
            <line x1="-6" y1="0" x2="0" y2="0" stroke="white" strokeWidth="0.6" />
          </g>
        </g>

        {/* Motion path for quill: start at inkwell, write Blog, then swirl to far right */}
        <path
          id="quillPath"
          d="M85 240
             L85 246 L85 240
             L180 260
             Q180 240 190 235 Q200 230 200 245 Q200 260 190 260 Q180 260 180 250
             L220 230 L220 280
             L260 240 Q260 230 270 228 Q280 226 280 240 Q280 258 270 260 Q260 262 260 248
             L310 230 Q310 228 320 226 Q335 224 335 240 Q335 258 320 262 L340 270 Q345 272 340 268
             L400 250
             Q450 220 500 200
             Q550 180 600 190
             Q650 200 680 170
             Q720 140 780 160
             Q830 180 880 150
             Q940 110 1000 140
             Q1040 155 1080 130
             Q1120 110 1160 140
             Q1180 160 1160 180
             Q1140 200 1120 180
             Q1100 160 1120 140"
          stroke="none"
          fill="none"
        />

        {/* The calligraphy trail that appears as quill writes */}
        {/* "Blog" text path */}
        <path
          d="M180 260
             Q180 240 190 235 Q200 230 200 245 Q200 260 190 260 Q180 260 180 250
             L220 230 L220 280
             L260 240 Q260 230 270 228 Q280 226 280 240 Q280 258 270 260 Q260 262 260 248
             L310 230 Q310 228 320 226 Q335 224 335 240 Q335 258 320 262 L340 270 Q345 272 340 268"
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
            values="500;500;0;0;0;500"
            keyTimes="0;0.1;0.5;0.55;0.9;1"
            dur="12s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;1;1;1;0;0"
            keyTimes="0;0.1;0.5;0.85;0.95;1"
            dur="12s"
            repeatCount="indefinite"
          />
        </path>

        {/* Decorative swirls trailing after "g" */}
        <path
          d="M400 250
             Q450 220 500 200
             Q550 180 600 190
             Q650 200 680 170
             Q720 140 780 160
             Q830 180 880 150
             Q940 110 1000 140
             Q1040 155 1080 130
             Q1120 110 1160 140
             Q1180 160 1160 180
             Q1140 200 1120 180
             Q1100 160 1120 140"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="800"
          strokeDashoffset="800"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="800;800;800;0;0;800"
            keyTimes="0;0.48;0.52;0.85;0.9;1"
            dur="12s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0;0.8;0.8;0;0"
            keyTimes="0;0.5;0.55;0.85;0.95;1"
            dur="12s"
            repeatCount="indefinite"
          />
        </path>

        {/* Extra decorative loops on the right side */}
        <path
          d="M900 160 Q920 120 950 140 Q970 160 950 180 Q930 195 920 170
             M1000 130 Q1020 100 1040 120 Q1055 140 1035 155 Q1015 165 1010 140"
          stroke="white"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="300"
          strokeDashoffset="300"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="300;300;300;0;0;300"
            keyTimes="0;0.6;0.65;0.82;0.88;1"
            dur="12s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0;0.6;0.6;0;0"
            keyTimes="0;0.6;0.65;0.85;0.95;1"
            dur="12s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
};

export default QuillAnimation;
