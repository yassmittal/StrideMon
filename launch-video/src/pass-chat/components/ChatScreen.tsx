import { interpolate } from 'remotion'
import { colors, easings, fontFamilies, fontWeights, passChatColors, radii } from '../../theme'
import { type ChatMessage, chatChrome, chatMessages } from '../content'
import { chatLayout, phoneScreen } from '../layout'
import { chatTimeline } from '../timeline'

// The chat on the phone's screen, as real DOM so it stays crisp: the bubbles stack up from the
// compose bar, each popping in from its tail corner while the older ones scroll up by its height.
// The scroll uses a grid row growing from 0fr to 1fr, so the browser does the measuring.

/** The screen, sized to phoneScreen, with the chat laid out from its bottom up, on a frame. */
export function ChatScreen({ frame }: { frame: number }) {
  return (
    <div
      style={{
        position: 'relative',
        width: phoneScreen.width,
        height: phoneScreen.height,
        borderRadius: phoneScreen.cornerRadius,
        overflow: 'hidden',
        backgroundColor: passChatColors.chatScreen,
        fontFamily: fontFamilies.satoshi,
        fontWeight: fontWeights.regular,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: phoneScreen.punchHoleTop,
          left: (phoneScreen.width - phoneScreen.punchHoleDiameter) / 2,
          width: phoneScreen.punchHoleDiameter,
          height: phoneScreen.punchHoleDiameter,
          borderRadius: radii.pill,
          backgroundColor: passChatColors.phoneInk,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: chatLayout.sidePadding,
          right: chatLayout.sidePadding,
          bottom: chatLayout.composeBottomInset + chatLayout.composeHeight + chatLayout.composeGap,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            alignSelf: 'center',
            marginBottom: chatLayout.timestampGap,
            fontSize: chatLayout.timestampFontSize,
            color: colors.textSecondarySmall,
          }}
        >
          {chatChrome.timestamp}
        </div>
        {chatMessages.map((message, messageIndex) => (
          <ArrivingBubble
            // biome-ignore lint/suspicious/noArrayIndexKey: the chat's fixed order.
            key={messageIndex}
            message={message}
            isFirst={messageIndex === 0}
            arrivalFrame={chatTimeline.bubbleFrames[messageIndex] ?? 0}
            frame={frame}
          />
        ))}
      </div>
      <ComposeBar />
    </div>
  )
}

/** A bubble's row: it grows to the bubble's height (scrolling the others up) as the bubble pops. */
function ArrivingBubble({
  message,
  isFirst,
  arrivalFrame,
  frame,
}: {
  message: ChatMessage
  isFirst: boolean
  arrivalFrame: number
  frame: number
}) {
  const scrollStartFrame = arrivalFrame - chatTimeline.scrollLeadFrames
  const scrollProgress = interpolate(
    frame,
    [scrollStartFrame, scrollStartFrame + chatTimeline.scrollDurationFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.outExpo },
  )
  const popProgress = interpolate(
    frame,
    [arrivalFrame, arrivalFrame + chatTimeline.popDurationFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.outExpo },
  )
  const isSent = message.side === 'sent'
  return (
    <div style={{ display: 'grid', gridTemplateRows: `${scrollProgress}fr` }}>
      <div
        style={{
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: isSent ? 'flex-end' : 'flex-start',
        }}
      >
        <div
          style={{
            paddingTop: isFirst ? 0 : chatLayout.bubbleGap,
            opacity: popProgress,
            scale: interpolate(popProgress, [0, 1], [0.6, 1]),
            transformOrigin: isSent ? '100% 100%' : '0% 100%',
          }}
        >
          <ChatBubble message={message} />
        </div>
      </div>
    </div>
  )
}

// The tail: a soft, curled hook off the bubble's bottom corner, in the bubble's frame (the corner
// at 0, 0). Drawn for a sent bubble; a received one mirrors it.
const TAIL_WIDTH = 44
const TAIL_HEIGHT = 38
const TAIL_PATH = 'M -40 -38 L -40 -6 C -26 -3 -6 4 6 10 C 0 2 -2 -10 0 -38 Z'

function ChatBubble({ message }: { message: ChatMessage }) {
  const isSent = message.side === 'sent'
  return (
    <div
      style={{
        position: 'relative',
        maxWidth: (phoneScreen.width - 2 * chatLayout.sidePadding) * chatLayout.bubbleMaxWidthRatio,
        padding: `${chatLayout.bubblePaddingVertical}px ${chatLayout.bubblePaddingHorizontal}px`,
        borderRadius: chatLayout.bubbleRadius,
        backgroundColor: passChatColors.chatBubble,
        color: colors.textOnDark,
        fontSize: chatLayout.bubbleFontSize,
        lineHeight: chatLayout.bubbleLineHeight,
      }}
    >
      {message.before}
      <span
        style={{
          fontFamily: fontFamilies.script,
          fontSize: `${chatLayout.scriptFontScale}em`,
          lineHeight: 0,
          color: colors.highlight,
          whiteSpace: 'nowrap',
        }}
      >
        {message.scriptWord}
      </span>
      {message.after}
      <svg
        width={TAIL_WIDTH}
        height={TAIL_HEIGHT + 12}
        viewBox={`-${TAIL_WIDTH - 6} -${TAIL_HEIGHT} ${TAIL_WIDTH} ${TAIL_HEIGHT + 12}`}
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -12,
          [isSent ? 'right' : 'left']: -6,
          scale: isSent ? '1 1' : '-1 1',
          overflow: 'visible',
        }}
      >
        <path d={TAIL_PATH} fill={passChatColors.chatBubble} />
      </svg>
    </div>
  )
}

/** The round "+" and the pill field with its placeholder and a mic, as chat apps have them. */
function ComposeBar() {
  const size = chatLayout.composeHeight
  return (
    <div
      style={{
        position: 'absolute',
        left: chatLayout.sidePadding,
        right: chatLayout.sidePadding,
        bottom: chatLayout.composeBottomInset,
        height: size,
        display: 'flex',
        gap: 22,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size,
          backgroundColor: passChatColors.chatField,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 3v18M3 12h18"
            stroke={colors.textPrimary}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div
        style={{
          flex: 1,
          height: size,
          borderRadius: size,
          backgroundColor: passChatColors.chatField,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${size * 0.34}px 0 ${size * 0.4}px`,
          fontSize: chatLayout.placeholderFontSize,
          color: colors.textSecondary,
        }}
      >
        {chatChrome.composePlaceholder}
        <svg
          width={size * 0.42}
          height={size * 0.42}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"
            stroke={colors.textSecondary}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}
