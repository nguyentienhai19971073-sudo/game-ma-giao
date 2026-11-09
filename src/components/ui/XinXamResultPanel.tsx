import { getTikTokDisplayName } from '../../utils/tiktokDisplayName';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FORTUNE_CLASSIFICATION_META,
  FortuneCategory,
  XinXamDrawResult,
  XinXamPopupDisplayMode,
  buildConciseXinXamCopy,
  formatQueXamHeader,
  formatTraditionalVerseLines,
  isValidFortuneCategory,
  normalizeSingleFlowVietnameseText,
  sanitizeCeremonialText,
} from '../../types/temple';
import { buildSacredAvatarDataUri } from '../../systems/DemoEventManager';
import { buildXinXamResultPanelStyle, calculateFortunePopupLayout, clampPanelScale } from '../../systems/OverlayTheme';

interface XinXamResultPanelProps {
  result: XinXamDrawResult | null;
  panelOpacity?: number;
  panelScale?: number;
  displayMode?: XinXamPopupDisplayMode;
  textScale?: number;
  showAvatar?: boolean;
}

function getClassificationTextClass(category: FortuneCategory): string {
  switch (category) {
    case 'Đại Cát':
      return 'text-[#ffea88]';
    case 'Trung Cát':
      return 'text-[#ffe08a]';
    case 'Tiểu Cát':
      return 'text-[#ffd4e2]';
    case 'Bình':
      return 'text-[#f5e7cb]';
    case 'Cần Thận Trọng':
      return 'text-[#ffd0a6]';
  }
}

/**
 * Compact, centered Fortune Result Popup ("🪷 KẾT QUẢ XIN XĂM")
 * - Width: 80% of the game frame, max-width: 520px; compact max-height 28% of the game frame.
 * - Semi-transparent burgundy RGBA background (default alpha 0.55) with crisp gold/category border.
 * - Centered inside the actual 9:16 game frame, including Google AI Studio preview.
 * - Full-width text (`width: 100%`, `min-width: 0`) with normal Vietnamese word wrapping and responsive `clamp()` sizing.
 */
export function XinXamResultPanel({
  result,
  panelOpacity = 0.55,
  panelScale = 1.0,
  displayMode = 'compact',
  textScale = 1.0,
  showAvatar = true,
}: XinXamResultPanelProps) {
  const [phase, setPhase] = useState<'enter' | 'steady' | 'exit'>('enter');
  const [imgFailed, setImgFailed] = useState(false);
  const popupRootRef = useRef<HTMLDivElement | null>(null);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0, browserHeight: 0 });

  // Measure the real in-game frame, including the embedded Google AI Studio preview.
  // Independent of fortune data: only recalculates when the viewport actually resizes.
  useEffect(() => {
    const gameFrame = popupRootRef.current?.closest('.chua-readability-v2') || popupRootRef.current?.parentElement; // CHUA_THONG_BAO_DUOI_CONG_DUC_V5
    if (!gameFrame) return;
    const measure = () => {
      const rect = gameFrame.getBoundingClientRect();
      setFrameSize(prev =>
        prev.width === rect.width && prev.height === rect.height && prev.browserHeight === window.innerHeight
          ? prev
          : { width: rect.width, height: rect.height, browserHeight: window.innerHeight },
      );
    };
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(gameFrame);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [Boolean(result)]);

  useEffect(() => {
    if (!result) return;
    setImgFailed(false);
    setPhase('enter');

    const now = Date.now();
    const remainingMs = Math.max(500, result.expiresAt - now);
    const enterTimer = window.setTimeout(() => {
      setPhase('steady');
    }, 30);
    const exitLeadMs = Math.max(220, remainingMs - 340);
    const exitTimer = window.setTimeout(() => {
      setPhase('exit');
    }, exitLeadMs);

    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(exitTimer);
    };
  }, [result?.drawId, result?.expiresAt]);

  const resolvedFortuneType: FortuneCategory = useMemo(() => {
    const candidate = result?.fortuneType || result?.category;
    return isValidFortuneCategory(candidate) ? candidate : 'Trung Cát';
  }, [result?.fortuneType, result?.category]);

  const cardStyle = useMemo(
    () => buildXinXamResultPanelStyle(panelOpacity, resolvedFortuneType),
    [panelOpacity, resolvedFortuneType],
  );

  if (!result) return null;

  const scale = clampPanelScale(panelScale);
  const ts = Math.max(0.8, Math.min(1.3, Number(textScale || 1.0)));
  const isCompact = displayMode !== 'detailed';
  const popupLayout = calculateFortunePopupLayout(
    frameSize.width,
    frameSize.height,
    frameSize.browserHeight,
    !isCompact,
  );

  const singleLineQueXam = formatQueXamHeader(result.fortuneNumber);
  const meta = FORTUNE_CLASSIFICATION_META[resolvedFortuneType];
  const classificationUpper = meta?.upperLabel || resolvedFortuneType.toUpperCase();
  const classificationColorClass = getClassificationTextClass(resolvedFortuneType);

  const cleanTitle = normalizeSingleFlowVietnameseText(
    sanitizeCeremonialText(result.fortuneTitle || result.title, 'Tâm An Vạn Sự Lành'),
  );
  const cleanVerse = formatTraditionalVerseLines(
    sanitizeCeremonialText(result.shortVerse || result.poem, ''),
    4,
  );
  const cleanInterpretation = normalizeSingleFlowVietnameseText(
    sanitizeCeremonialText(
      result.interpretation,
      'Tâm thành lễ Phật, giữ lòng thiện lành thì mọi việc hanh thông.',
    ),
  );
  const cleanAdvice = normalizeSingleFlowVietnameseText(
    sanitizeCeremonialText(result.advice, ''),
  );

  // Live popup uses the SAME balanced-length meaning/advice as the voice narration.
  // Detailed/Admin records remain unchanged; the original fortune text is preserved.
  const concise = buildConciseXinXamCopy(cleanInterpretation, cleanAdvice);
  const compactExcerpt = concise.interpretation || formatTraditionalVerseLines(cleanVerse, 2);
  const compactIsVerseFallback = !cleanInterpretation && Boolean(compactExcerpt);
  const conciseAdvice = concise.advice;

  const displayName = getTikTokDisplayName(result);
  const fallbackAvatarUri = buildSacredAvatarDataUri(
    result.userId,
    result.nickname || result.username,
  );
  const resolvedAvatarSrc =
    !imgFailed && result.avatarUrl ? result.avatarUrl : fallbackAvatarUri;

  const animClasses =
    phase === 'enter'
      ? 'translate-y-2 opacity-0 scale-[0.98]'
      : phase === 'exit'
        ? 'translate-y-1.5 opacity-0 scale-[0.98]'
        : 'translate-y-0 opacity-100 scale-100';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Kết quả Xin Xăm"
      ref={popupRootRef}
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-2 py-2"
    >
      <div
        style={{
          width: popupLayout.width ? `${popupLayout.width}px` : 'min(80vw, 520px, calc(100% - 8px))',
          maxWidth: 'calc(100% - 8px)',
          height: 'auto',
          transform: Math.abs(scale - 1) > 0.005 ? `scale(${scale})` : undefined,
          transformOrigin: 'center center',
        }}
        className="min-w-0"
      >
        <div
          style={{
            ...cardStyle,
            maxHeight: popupLayout.maxHeight ? `${popupLayout.maxHeight}px` : (isCompact ? '28vh' : '40vh'),
          }}
          className={`fortune-result-card pointer-events-auto w-full min-w-0 overflow-y-auto temple-scroll rounded-lg border px-2 py-1 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${animClasses}`}
        >
          {/* Header: full width and easy-to-read, independently of username length. */}
          <h3
            style={{ fontSize: `calc(clamp(12.5px, 1.45vw, 15px) * ${ts})` }}
            className="w-full min-w-0 text-center font-display font-extrabold tracking-[0.03em] text-[#ffe89e] leading-[1.2]"
          >
            🪷 KẾT QUẢ XIN XĂM
          </h3>

          {/* Separate full-width identity row: avatar on the left, username using all remaining space.
              DO NOT constrain the username to 44% of the card or float it to the right. */}
          <div className="mt-0.5 flex w-full min-w-0 items-center justify-start gap-1.5">
            {showAvatar && (
              <div className="w-[20px] h-[20px] rounded-full p-[1px] bg-gradient-to-b from-[#ffe89e] via-[#d4af37] to-[#8f6814] shrink-0">
                <img
                  src={resolvedAvatarSrc}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="w-full h-full rounded-full object-cover bg-[#24080e]"
                />
              </div>
            )}
            <span
              style={{ fontSize: `calc(clamp(12px, 1.35vw, 14px) * ${ts})` }}
              className="block flex-1 min-w-0 font-semibold text-[#fff1dc] leading-[1.25] whitespace-normal break-words [overflow-wrap:anywhere]"
            >
              @{result.username}
            </span>
          </div>

          {/* Row 3 & 4: "QUẺ XĂM 73 · TIỂU CÁT" + Fortune Title */}
          <div className="mt-0.5 pt-0.5 border-t border-[#d4af37]/25 w-full min-w-0 flex flex-col gap-y-0.5">
            <div className="flex w-full min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-tight">
              <span
                data-testid="xinxam-single-line-number"
                style={{ fontSize: `calc(clamp(12px, 1.35vw, 14px) * ${ts})` }}
                className="fortune-number-heading inline-flex shrink-0 whitespace-nowrap font-bold text-[#ffe89e] leading-none"
              >
                {singleLineQueXam}
              </span>
              <span className="shrink-0 text-[#d4af37]/80 text-[10px]" aria-hidden="true">
                ·
              </span>
              <span
                data-testid="xinxam-fortune-classification"
                style={{ fontSize: `calc(clamp(11px, 1.25vw, 12.5px) * ${ts})` }}
                className={`shrink-0 font-sans font-bold tracking-[0.02em] uppercase whitespace-nowrap ${classificationColorClass}`}
              >
                {classificationUpper}
              </span>
            </div>

            <p
              style={{ fontSize: `calc(clamp(11.5px, 1.35vw, 13.5px) * ${ts})` }}
              className="font-display font-bold text-[#fff1c2] leading-snug whitespace-normal break-words [word-break:normal] min-w-0 w-full"
            >
              {cleanTitle}
            </p>
          </div>

          {/* Row 5 & 6: Body — Compact (2 meaningful sentences + 1 practical advice) OR Detailed (4-line verse + full text) */}
          {isCompact ? (
            <div className="mt-0.5 w-full min-w-0 space-y-0.5 text-left">
              {compactExcerpt && (
                <p
                  style={{ fontSize: `calc(clamp(11px, 1.25vw, 12.5px) * ${ts})` }}
                  className={`w-full min-w-0 text-[#fff8ec] leading-[1.32] break-words [word-break:normal] ${
                    compactIsVerseFallback
                      ? 'font-display italic whitespace-pre-line text-[#f7e5c6]'
                      : 'whitespace-normal'
                  }`}
                >
                  {compactExcerpt}
                </p>
              )}

              {conciseAdvice && (
                <p
                  style={{ fontSize: `calc(clamp(11px, 1.25vw, 12.5px) * ${ts})` }}
                  className="w-full min-w-0 text-[#ffe59e] font-medium leading-[1.3] whitespace-normal break-words [word-break:normal]"
                >
                  <span className="text-[#ffd778] font-semibold">Lời khuyên:</span> {conciseAdvice}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-1 pt-1 border-t border-[#d4af37]/20 w-full min-w-0 grid grid-cols-1 sm:grid-cols-12 gap-x-2.5 gap-y-1 text-left">
              {cleanVerse && (
                <p
                  style={{ fontSize: `calc(clamp(11px, 1.2vw, 12.5px) * ${ts})` }}
                  className="sm:col-span-5 w-full min-w-0 font-display italic text-[#f7e5c6] leading-[1.34] whitespace-pre-line break-words [word-break:normal]"
                >
                  {cleanVerse}
                </p>
              )}

              <div
                className={`${
                  cleanVerse ? 'sm:col-span-7' : 'sm:col-span-12'
                } w-full min-w-0 space-y-0.5`}
              >
                <p
                  style={{ fontSize: `calc(clamp(11px, 1.2vw, 12.5px) * ${ts})` }}
                  className="w-full min-w-0 text-[#fff8ec] leading-[1.34] whitespace-normal break-words [word-break:normal]"
                >
                  {cleanInterpretation}
                </p>
                {cleanAdvice && (
                  <p
                    style={{ fontSize: `calc(clamp(10.5px, 1.15vw, 12px) * ${ts})` }}
                    className="w-full min-w-0 text-[#ffe59e] font-medium leading-[1.32] whitespace-normal break-words [word-break:normal]"
                  >
                    <span className="text-[#ffd778] font-semibold">Lời khuyên:</span> {cleanAdvice}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
