const QuillAnimation = () => {
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
        {/* Ink well - bottom left */}
        <g transform="translate(60, 200)">
          <path d="M-10 60 Q-10 65 0 68 L50 68 Q60 65 60 60 L60 55 Q60 50 50 48 L0 48 Q-10 50 -10 55 Z" stroke="white" strokeWidth="2" fill="none" />
          <path d="M8 48 L8 20 Q8 12 16 10 L34 10 Q42 12 42 20 L42 48" stroke="white" strokeWidth="2" fill="none" />
          <path d="M16 10 L16 4 Q16 0 20 0 L30 0 Q34 0 34 4 L34 10" stroke="white" strokeWidth="2" fill="none" />
          <ellipse cx="25" cy="0" rx="10" ry="3" stroke="white" strokeWidth="1.5" fill="none" />
          <path d="M20 -3 Q25 -8 30 -3" stroke="white" strokeWidth="1.5" fill="none" />
          <rect x="12" y="22" width="26" height="16" rx="2" stroke="white" strokeWidth="1" fill="none" />
          <line x1="16" y1="28" x2="36" y2="28" stroke="white" strokeWidth="0.5" />
          <line x1="18" y1="32" x2="34" y2="32" stroke="white" strokeWidth="0.5" />
          <path d="M10 40 Q25 36 40 40" stroke="white" strokeWidth="0.8" fill="none" />
        </g>

        {/* Quill pen - animated along motion path */}
        <g style={{ opacity: 1 }}>
          <animateMotion
            dur="16s"
            repeatCount="indefinite"
            rotate="auto"
            keyPoints="0;0;0.05;0.12;0.2;0.28;0.36;0.42;0.5;0.58;0.66;0.74;0.82;0.9;0.96;1"
            keyTimes="0;0.04;0.08;0.18;0.28;0.38;0.46;0.5;0.56;0.62;0.7;0.78;0.86;0.92;0.97;1"
          >
            <mpath href="#quillPath" />
          </animateMotion>

          <g transform="rotate(-135) translate(-80, -10)">
            <line x1="0" y1="0" x2="75" y2="0" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M75 0 Q82 -4 90 -6 Q85 -10 80 -18 Q78 -12 75 -6 Q72 -3 75 0" stroke="white" strokeWidth="1.2" fill="none" />
            <path d="M65 0 Q72 -3 78 -5 Q74 -9 70 -15 Q68 -10 65 -5 Q63 -2 65 0" stroke="white" strokeWidth="1" fill="none" />
            <path d="M55 0 Q60 -2 66 -4 Q63 -8 60 -13 Q58 -8 55 -4 Q54 -1 55 0" stroke="white" strokeWidth="0.8" fill="none" />
            <path d="M45 0 Q50 -2 55 -3 Q52 -6 50 -10 Q48 -6 45 -3 Q44 -1 45 0" stroke="white" strokeWidth="0.7" fill="none" />
            <path d="M75 0 Q82 4 90 6 Q85 10 80 18 Q78 12 75 6 Q72 3 75 0" stroke="white" strokeWidth="1.2" fill="none" />
            <path d="M65 0 Q72 3 78 5 Q74 9 70 15 Q68 10 65 5 Q63 2 65 0" stroke="white" strokeWidth="1" fill="none" />
            <path d="M55 0 Q60 2 66 4 Q63 8 60 13 Q58 8 55 4 Q54 1 55 0" stroke="white" strokeWidth="0.8" fill="none" />
            <path d="M45 0 Q50 2 55 3 Q52 6 50 10 Q48 6 45 3 Q44 1 45 0" stroke="white" strokeWidth="0.7" fill="none" />
            <line x1="40" y1="0" x2="90" y2="0" stroke="white" strokeWidth="0.6" />
            <circle cx="12" cy="0" r="3" stroke="white" strokeWidth="1.2" fill="none" />
            <path d="M15 0 Q18 -2 20 0 Q18 2 15 0" stroke="white" strokeWidth="1" fill="none" />
            <path d="M0 0 L-8 -2 L-12 0 L-8 2 Z" stroke="white" strokeWidth="1.2" fill="none" />
            <line x1="-6" y1="0" x2="0" y2="0" stroke="white" strokeWidth="0.6" />
          </g>
        </g>

        {/* Motion path */}
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
             Q440 230 480 210
             Q520 190 560 200
             Q580 206 600 190
             Q620 170 650 180 Q670 190 660 170 Q650 150 670 140 Q690 130 680 150
             Q700 180 740 160
             Q760 145 780 155 Q800 170 790 150 Q780 130 800 120 Q820 110 810 130
             Q830 160 870 140
             Q900 120 930 140 Q950 155 940 135 Q930 115 950 105 Q970 95 960 115
             Q980 145 1020 125
             Q1050 108 1080 120 Q1100 130 1090 115 Q1080 100 1100 90 Q1120 82 1110 100
             Q1130 130 1160 140
             Q1180 150 1170 170 Q1160 190 1140 175 Q1120 160 1140 145 Q1160 130 1150 150"
          stroke="none"
          fill="none"
        />

        {/* Calligraphy "Blog" */}
        <path
          d="M180 260
             Q180 240 190 235 Q200 230 200 245 Q200 260 190 260 Q180 260 180 250
             L220 230 L220 280
             L260 240 Q260 230 270 228 Q280 226 280 240 Q280 258 270 260 Q260 262 260 248
             L310 230 Q310 228 320 226 Q335 224 335 240 Q335 258 320 262 L340 270 Q345 272 340 268"
          stroke="white"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="500"
          strokeDashoffset="500"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="500;500;0;0;0;500"
            keyTimes="0;0.08;0.46;0.5;0.88;1"
            dur="16s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;1;1;1;0;0"
            keyTimes="0;0.08;0.5;0.82;0.92;1"
            dur="16s"
            repeatCount="indefinite"
          />
        </path>

        {/* Decorative swirls after "g" - main trail */}
        <path
          d="M400 250
             Q440 230 480 210
             Q520 190 560 200
             Q580 206 600 190
             Q620 170 650 180
             Q700 180 740 160
             Q830 160 870 140
             Q980 145 1020 125
             Q1130 130 1160 140"
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
            keyTimes="0;0.46;0.5;0.85;0.88;1"
            dur="16s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0;0.7;0.7;0;0"
            keyTimes="0;0.48;0.52;0.82;0.92;1"
            dur="16s"
            repeatCount="indefinite"
          />
        </path>

        {/* Loop cluster 1 */}
        <path
          d="M640 180 Q660 160 670 140 Q680 120 670 130 Q660 145 650 165 Q645 180 660 185 Q675 188 680 170 Q682 155 670 150"
          stroke="white"
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="250"
          strokeDashoffset="250"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="250;250;250;0;0;250"
            keyTimes="0;0.55;0.58;0.7;0.82;1"
            dur="16s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0;0.6;0.6;0;0"
            keyTimes="0;0.55;0.6;0.78;0.92;1"
            dur="16s"
            repeatCount="indefinite"
          />
        </path>

        {/* Loop cluster 2 */}
        <path
          d="M790 155 Q810 130 820 110 Q830 90 815 105 Q800 125 795 145 Q790 160 805 165 Q820 168 825 150 Q828 135 815 130
             M830 120 Q845 100 855 115 Q860 130 845 140 Q835 145 838 130"
          stroke="white"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="350"
          strokeDashoffset="350"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="350;350;350;0;0;350"
            keyTimes="0;0.62;0.65;0.78;0.84;1"
            dur="16s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0;0.5;0.5;0;0"
            keyTimes="0;0.62;0.67;0.8;0.92;1"
            dur="16s"
            repeatCount="indefinite"
          />
        </path>

        {/* Loop cluster 3 */}
        <path
          d="M940 140 Q960 110 975 95 Q990 80 975 95 Q960 115 955 135 Q950 155 965 158 Q980 160 985 140 Q988 125 975 120
             M990 115 Q1005 95 1015 108 Q1020 120 1005 130 Q995 135 1000 118
             M1020 108 Q1035 88 1045 100 Q1050 112 1038 120 Q1028 125 1032 110"
          stroke="white"
          strokeWidth="1.1"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="450"
          strokeDashoffset="450"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="450;450;450;0;0;450"
            keyTimes="0;0.7;0.73;0.86;0.88;1"
            dur="16s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0;0.5;0.5;0;0"
            keyTimes="0;0.7;0.75;0.84;0.92;1"
            dur="16s"
            repeatCount="indefinite"
          />
        </path>

        {/* Final flourish spiral */}
        <path
          d="M1100 120 Q1130 100 1150 110 Q1170 125 1155 145 Q1140 160 1120 150 Q1105 140 1115 125 Q1125 112 1140 118 Q1150 125 1145 135"
          stroke="white"
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="200"
          strokeDashoffset="200"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="200;200;200;0;0;200"
            keyTimes="0;0.78;0.8;0.9;0.92;1"
            dur="16s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0;0.7;0.7;0;0"
            keyTimes="0;0.78;0.82;0.88;0.95;1"
            dur="16s"
            repeatCount="indefinite"
          />
        </path>

        {/* Small decorative dots that appear along the trail */}
        {[
          { cx: 500, cy: 205, delay: "0.55" },
          { cx: 620, cy: 185, delay: "0.6" },
          { cx: 750, cy: 158, delay: "0.68" },
          { cx: 880, cy: 138, delay: "0.75" },
          { cx: 1010, cy: 122, delay: "0.82" },
        ].map((dot, i) => (
          <circle key={i} cx={dot.cx} cy={dot.cy} r="2" fill="white">
            <animate
              attributeName="opacity"
              values={`0;0;0.6;0.6;0;0`}
              keyTimes={`0;${dot.delay};${(parseFloat(dot.delay) + 0.03).toFixed(2)};0.85;0.92;1`}
              dur="16s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values="0;0;2.5;2;0;0"
              keyTimes={`0;${dot.delay};${(parseFloat(dot.delay) + 0.03).toFixed(2)};0.85;0.92;1`}
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
