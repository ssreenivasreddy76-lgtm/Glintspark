import React, { useEffect } from 'react';

interface AdBannerProps {
  dataAdSlot: string;
  format?: string;
  responsive?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  dataAdSlot, 
  format = 'auto', 
  responsive = true 
}) => {
  useEffect(() => {
    // Only push to adsbygoogle if we're not in development mode to prevent infinite 400 loops
    if (import.meta.env.MODE !== 'development') {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // Silently ignore AdSense duplicate push errors
      }
    }
  }, []);

  if (import.meta.env.MODE === 'development') {
    return (
      <div className="w-full flex justify-center my-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 min-h-[100px] items-center text-slate-400 text-sm">
        <span className="font-semibold text-slate-400/80">Advertisement Placeholder (Dev Mode)</span>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center my-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 min-h-[100px] items-center text-slate-400 text-sm">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-3539119475922615"
        data-ad-slot={dataAdSlot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
};
