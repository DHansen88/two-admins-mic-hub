const QuillAnimation = () => {
  return (
    <div className="absolute bottom-[40px] left-[60px] w-[180px] md:w-[260px] z-[1] pointer-events-none">
      <svg
        viewBox="0 0 260 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        style={{ opacity: 0.1 }}
      >
        {/* Ink well */}
        <g className="inkwell">
          <ellipse cx="30" cy="95" rx="18" ry="8" stroke="white" strokeWidth="2" fill="none" />
          <path d="M12 95 L12 75 Q12 68 18 68 L42 68 Q48 68 48 75 L48 95" stroke="white" strokeWidth="2" fill="none" />
          <ellipse cx="30" cy="68" rx="18" ry="6" stroke="white" strokeWidth="2" fill="none" />
        </g>

        {/* Feather quill */}
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,6; 0,0; 0,0; 40,0; 90,0; 140,0; 160,-5; 160,-5; 0,0"
            keyTimes="0; 0.08; 0.16; 0.2; 0.4; 0.6; 0.8; 0.85; 0.92; 1"
            dur="11s"
            repeatCount="indefinite"
          />
          {/* Quill shaft */}
          <line x1="30" y1="65" x2="75" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round" />
          {/* Feather barbs */}
          <path d="M75 20 Q85 10 95 8 Q80 15 78 22" stroke="white" strokeWidth="1.5" fill="none" />
          <path d="M70 27 Q78 18 90 14 Q76 22 73 30" stroke="white" strokeWidth="1.2" fill="none" />
          <path d="M65 34 Q72 26 82 23 Q70 30 68 37" stroke="white" strokeWidth="1" fill="none" />
          <path d="M60 40 Q66 34 74 32 Q65 37 63 43" stroke="white" strokeWidth="0.8" fill="none" />
          {/* Nib */}
          <path d="M30 65 L26 72 L30 70 L34 72 Z" stroke="white" strokeWidth="1.5" fill="none" />
        </g>

        {/* Calligraphy "blog" stroke */}
        <path
          d="M50 88 Q50 78 55 78 Q60 78 60 85 Q60 92 55 92 Q50 92 50 88 Z
             M65 75 L65 92
             M75 82 Q75 78 80 78 Q85 78 85 82 Q85 92 80 92 Q75 92 75 82 Z
             M95 82 Q95 78 100 78 Q107 78 107 82 Q107 88 100 92 L107 92"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="200"
          strokeDashoffset="200"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="200; 200; 200; 0; 0; 0; 200"
            keyTimes="0; 0.2; 0.25; 0.75; 0.85; 0.92; 1"
            dur="11s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="1; 1; 1; 1; 0.6; 0; 0"
            keyTimes="0; 0.75; 0.85; 0.88; 0.92; 0.95; 1"
            dur="11s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
};

export default QuillAnimation;
