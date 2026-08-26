export const COLOR_PRIMARY = '#00408C';
export const COLOR_PRIMARY_SOFT = '#eef2fb';
export const COLOR_CEMENTO = '#8a93a3';
export const COLOR_CEMENTO_CLARO = '#aab1bd';
export const COLOR_TEXTO = '#1c2430';
export const COLOR_ERROR = '#d64545';
export const COLOR_OK = '#2E8B57';

export const COLOR_CARD = '#ffffff';
export const COLOR_TEXT_LIGHT = '#ffffff';
export const COLOR_TEXT_LIGHT_MUTED = 'rgba(255,255,255,0.7)';

export const BG_DARK = 'radial-gradient(130% 130% at 18% -10%, #123b78 0%, #0a2149 48%, #071531 100%)';
export const SHADOW_CARD = '0 20px 44px rgba(3,13,33,0.38)';
export const SHADOW_SOFT = '0 10px 24px rgba(3,13,33,0.2)';

export const FONT_TITULO = "'Dunk95', 'Aktiv Grotesk', system-ui, sans-serif";
export const FONT_TEXTO = "'Aktiv Grotesk', system-ui, sans-serif";

export const pageStyle = { minHeight: '100vh', background: BG_DARK, fontFamily: FONT_TEXTO };

export const containerStyle = (maxWidth) => ({ padding: '36px 20px 64px', maxWidth: maxWidth || '620px', margin: '0 auto' });

export const heroTitleStyle = { color: COLOR_TEXT_LIGHT, fontFamily: FONT_TITULO, fontSize: '30px', margin: '0 0 8px', textAlign: 'center', letterSpacing: '0.3px' };

export const heroSubtitleStyle = { color: COLOR_TEXT_LIGHT_MUTED, fontSize: '14.5px', margin: '0 0 32px', textAlign: 'center', lineHeight: '1.5' };

export const cardStyle = { backgroundColor: COLOR_CARD, borderRadius: '22px', padding: '26px 24px', boxShadow: SHADOW_CARD };

export const iaBoxStyle = { backgroundColor: COLOR_PRIMARY_SOFT, borderRadius: '16px', padding: '16px 18px' };
