import React from 'react';

export interface CardData {
  id: string | number;
  colorClass: string;
  date: string;
  title: string;
  description: string;
  progressPercent: string;
  progressValue: string;
  imgSrc1?: string;
  imgAlt1?: string;
  imgSrc2?: string;
  imgAlt2?: string;
  countdownText: string;
}

interface CardProps {
  data: CardData;
}

const EllipsisIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white/40 hover:text-white/80 transition-colors cursor-pointer">
    <path fillRule="evenodd" d="M10.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0" clipRule="evenodd" />
  </svg>
);

const AddIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
  </svg>
);

const getColorStyles = (color: string) => {
  switch (color) {
    case 'green':
      return { accent: 'bg-green-500', text: 'text-green-400' };
    case 'orange':
      return { accent: 'bg-orange-500', text: 'text-orange-400' };
    case 'red':
      return { accent: 'bg-red-500', text: 'text-red-400' };
    case 'blue':
      return { accent: 'bg-blue-500', text: 'text-blue-400' };
    case 'yellow':
    default:
      return { accent: 'bg-yellow-400', text: 'text-yellow-400' };
  }
};

const CourseCard: React.FC<CardProps> = ({ data }) => {
  const {
    colorClass,
    date,
    title,
    description,
    progressPercent,
    progressValue,
    imgSrc1,
    imgAlt1,
    imgSrc2,
    imgAlt2,
    countdownText,
  } = data;

  const styles = getColorStyles(colorClass);

  return (
    <div 
      className={`relative rounded-2xl p-6 bg-[#121214] flex flex-col justify-between transition-all duration-400 hover:-translate-y-1 hover:shadow-2xl group overflow-hidden h-full`}
      style={{ boxShadow: "inset 0 1px 1px 0 rgba(255,255,255,0.08), inset 0 -2px 4px 0 rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.3)" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
      {/* Top glow based on accent */}
      <div className={`absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity blur-[40px] ${styles.accent}`} />

      <div className="flex justify-between items-start z-10 mb-5">
        <span className="text-[11px] font-bold text-white/60 bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-md uppercase tracking-wider">{date}</span>
        <EllipsisIcon />
      </div>
      
      <div className="z-10 flex-1">
        <h3 className="text-[18px] font-bold text-white tracking-tight capitalize mb-2">{title}</h3>
        <p className="text-[13px] text-white/60 leading-relaxed font-medium max-w-[90%]">{description}</p>
        
        <div className="mt-6">
          <div className="flex justify-between text-[11px] font-bold text-white/60 mb-2.5 uppercase tracking-wider">
            <span>Progress</span>
            <span className={styles.text}>{progressValue}</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${styles.accent} opacity-80`} style={{ width: progressPercent }}></div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-end mt-6 pt-5 border-t border-white/[0.06] z-10">
        <div className="flex items-center -space-x-1.5">
          {imgSrc1 && (
            <img src={imgSrc1} alt={imgAlt1 || 'user avatar'} className="w-8 h-8 rounded-full border-[2px] border-[#121214] object-cover ring-1 ring-white/10" />
          )}
          {imgSrc2 && (
            <img src={imgSrc2} alt={imgAlt2 || 'user avatar'} className="w-8 h-8 rounded-full border-[2px] border-[#121214] object-cover ring-1 ring-white/10" />
          )}
          <button className={`w-8 h-8 rounded-full border-[2px] border-[#121214] ${styles.accent} flex items-center justify-center text-black hover:opacity-90 transition-opacity ml-1 shadow-md`}>
            <AddIcon />
          </button>
        </div>
        <div className="text-[11px] font-bold text-white/70 bg-white/[0.04] px-3 py-1.5 rounded-md border border-white/[0.06] uppercase tracking-wider">
          {countdownText}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
