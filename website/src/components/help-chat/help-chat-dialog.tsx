'use client'

import { type FormEvent, type KeyboardEvent, useEffect, useId, useRef, useState } from 'react'
import { findHelpTopicTitle } from '@/content/help'
import { type HelpChatProblemKey, helpChatContent } from '@/content/help-chat'
import { helpChatApiUrl } from '@/content/site'
import {
  askHelpChat,
  type HelpChatMessage,
  MAX_HELP_CHAT_MESSAGE_LENGTH,
} from '@/lib/help-chat-request'
import { ArrowIcon } from '../ui/arrow-icon'
import { MetaLabel } from '../ui/meta-label'
import { buildPillClassName, PillContent } from '../ui/pill-button'

type HelpChatDialogProps = {
  isOpen: boolean
  onClose: () => void
}

const labelLinkClass =
  'group inline-flex min-h-11 items-center gap-2 self-start text-label font-medium tracking-[0.08em] uppercase'

/**
 * The help chatbot (Part 8, D-048): a modal `<dialog>` in the pass sheet's look, a bottom sheet on
 * a phone. Answers come from the API, each with links to its help answers; every problem says what
 * to do next and links to the help page. The conversation lives in memory only.
 */
export function HelpChatDialog({ isOpen, onClose }: HelpChatDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const headingId = useId()
  const [messages, setMessages] = useState<HelpChatMessage[]>([])
  const [draftText, setDraftText] = useState('')
  const [isWaiting, setIsWaiting] = useState(false)
  const [problemKey, setProblemKey] = useState<HelpChatProblemKey | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog === null) return
    if (isOpen && !dialog.open) {
      dialog.showModal()
      // With a mouse, typing can start at once. On a phone, focus would open the keyboard over the
      // suggested questions, so the dialog keeps its own focus (the close button).
      if (window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus()
    }
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  // Keep the newest message, the wait line or the problem in view.
  // biome-ignore lint/correctness/useExhaustiveDependencies: scrolls when any of these change.
  useEffect(() => {
    scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isWaiting, problemKey])

  const isCapReached = problemKey === 'monthlyCapReached'
  const trimmedDraft = draftText.trim()
  const isDraftTooLong = trimmedDraft.length > MAX_HELP_CHAT_MESSAGE_LENGTH
  const canSend = trimmedDraft !== '' && !isDraftTooLong && !isWaiting && !isCapReached

  async function sendConversation(conversation: HelpChatMessage[]) {
    setIsWaiting(true)
    setProblemKey(null)
    const outcome = await askHelpChat(helpChatApiUrl, conversation)
    setIsWaiting(false)
    if (outcome.kind === 'problem') {
      setProblemKey(outcome.problemKey)
      return
    }
    setMessages([
      ...conversation,
      { role: 'assistant', text: outcome.answerText, helpTopicIds: outcome.helpTopicIds },
    ])
  }

  function askQuestion(questionText: string) {
    const conversation: HelpChatMessage[] = [...messages, { role: 'visitor', text: questionText }]
    setMessages(conversation)
    setDraftText('')
    void sendConversation(conversation)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (canSend) askQuestion(trimmedDraft)
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter asks; Shift+Enter makes a new line.
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    if (canSend) askQuestion(trimmedDraft)
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the click only catches the backdrop; the keyboard closes a modal dialog with Escape.
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      onClose={onClose}
      onClick={(event) => {
        // A click on the dimmed backdrop lands on the dialog itself.
        if (event.target === dialogRef.current) onClose()
      }}
      className="pass-sheet help-chat-sheet"
    >
      <div className="flex w-full flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-hairline px-4 pt-4 pb-3 md:px-6 md:pt-5">
          <div className="flex flex-col gap-2 pt-1">
            <MetaLabel items={helpChatContent.metaLabels} />
            <h2 id={headingId} className="text-2xl leading-[1.1]">
              {helpChatContent.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={helpChatContent.closeLabel}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-muted transition-colors duration-300 ease-standard active:bg-surface"
          >
            <svg
              aria-hidden="true"
              className="size-4"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M4 4l10 10M14 4 4 14" />
            </svg>
          </button>
        </header>

        <div
          ref={scrollAreaRef}
          className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-4 py-5 md:px-6"
        >
          <div className="flex flex-col gap-2 text-sm leading-[1.45] text-ink-secondary-small">
            {helpChatContent.introLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          {messages.length === 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
                {helpChatContent.suggestionsLabel}
              </p>
              <ul className="flex flex-wrap gap-2">
                {helpChatContent.suggestedQuestions.map((question) => (
                  <li key={question}>
                    <button
                      type="button"
                      onClick={() => askQuestion(question)}
                      className="min-h-11 rounded-full bg-surface px-4 text-left text-sm leading-[1.25] transition-colors duration-300 ease-standard active:bg-surface-muted"
                    >
                      {question}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <ol aria-live="polite" className="flex flex-col gap-4">
            {messages.map((message, messageIndex) => (
              // The conversation only grows, so a message's place is its identity.
              // biome-ignore lint/suspicious/noArrayIndexKey: see above.
              <li key={messageIndex}>
                <HelpChatMessageView message={message} onHelpLinkPress={onClose} />
              </li>
            ))}
          </ol>

          {isWaiting ? (
            <p role="status" className="help-chat-thinking text-sm text-ink-secondary-small">
              {helpChatContent.thinkingText}
            </p>
          ) : null}

          {problemKey !== null ? (
            <div role="alert" className="flex flex-col gap-1 rounded-panel bg-surface p-4">
              <p className="text-sm leading-[1.45]">{helpChatContent.problems[problemKey]}</p>
              <div className="flex flex-wrap items-center gap-x-6">
                {isCapReached ? null : (
                  <button
                    type="button"
                    onClick={() => void sendConversation(messages)}
                    className={labelLinkClass}
                  >
                    {helpChatContent.tryAgainLabel}
                  </button>
                )}
                <a href={helpChatContent.helpPagePath} onClick={onClose} className={labelLinkClass}>
                  {helpChatContent.helpPageLabel}
                  <ArrowIcon className="transition-transform duration-300 ease-standard group-hover:translate-x-[3px]" />
                </a>
              </div>
            </div>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 border-t border-hairline px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6 md:pb-5"
        >
          <label htmlFor={`${headingId}-input`} className="sr-only">
            {helpChatContent.inputLabel}
          </label>
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              id={`${headingId}-input`}
              value={draftText}
              onChange={(event) => setDraftText(event.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={isCapReached}
              rows={2}
              placeholder={helpChatContent.inputPlaceholder}
              className="min-h-11 flex-1 resize-none rounded-panel bg-surface px-3 py-2.5 text-base leading-[1.35] placeholder:text-ink-secondary-small disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!canSend}
              className={buildPillClassName('primary', 'compact', 'shrink-0 disabled:opacity-40')}
            >
              <PillContent label={helpChatContent.sendLabel} />
            </button>
          </div>
          {isDraftTooLong ? (
            <p className="text-sm text-ink-secondary-small">
              {helpChatContent.tooLongText(MAX_HELP_CHAT_MESSAGE_LENGTH)}
            </p>
          ) : null}
        </form>
      </div>
    </dialog>
  )
}

function HelpChatMessageView({
  message,
  onHelpLinkPress,
}: {
  message: HelpChatMessage
  onHelpLinkPress: () => void
}) {
  if (message.role === 'visitor') {
    return (
      <div className="ml-auto flex max-w-[85%] flex-col items-end gap-1">
        <p className="sr-only">{helpChatContent.visitorLabel}</p>
        <p className="rounded-panel bg-primary px-3.5 py-2.5 text-base leading-[1.4] whitespace-pre-line text-on-dark">
          {message.text}
        </p>
      </div>
    )
  }

  const helpLinks = (message.helpTopicIds ?? []).flatMap((helpTopicId) => {
    const title = findHelpTopicTitle(helpTopicId)
    return title === null ? [] : [{ helpTopicId, title }]
  })
  return (
    <div className="flex max-w-[92%] flex-col gap-2">
      <p className="text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
        {helpChatContent.assistantLabel}
      </p>
      <p className="text-base leading-[1.45] whitespace-pre-line">{message.text}</p>
      {helpLinks.length === 0 ? null : (
        <ul className="flex flex-col">
          {helpLinks.map((helpLink) => (
            <li key={helpLink.helpTopicId}>
              <a
                href={`${helpChatContent.helpPagePath}#${helpLink.helpTopicId}`}
                onClick={onHelpLinkPress}
                aria-label={`${helpChatContent.readMoreLabel}: ${helpLink.title}`}
                className="group inline-flex min-h-11 items-center gap-2 text-sm leading-[1.3] underline decoration-hairline underline-offset-4"
              >
                {helpLink.title}
                <ArrowIcon className="shrink-0 transition-transform duration-300 ease-standard group-hover:translate-x-[3px]" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
