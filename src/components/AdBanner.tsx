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
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error", e);
    }
  }, []);

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
