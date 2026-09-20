import { content, example, part } from "./types";

export const agentsCompositions = {
  email: [
    example(
      "Email layout",
      part(
        "EmailLayout",
        part("EmailHeader", part("EmailLogo"), part("EmailBrowserLink")),
        part(
          "Section",
          part("EmailHeading"),
          part("EmailText", part("EmailLink")),
          part("EmailPanel", part("EmailDetailRow"), part("EmailDivider")),
          part("EmailBulletList"),
          part("EmailCode"),
          part("EmailButton"),
          part("Row", part("Column", part("Img"))),
        ),
      ),
      "Section, Row, Column, and Img come from React Email.",
    ),
    example(
      "Footer",
      part(
        "EmailFooter",
        part("EmailSocialLinks"),
        part("EmailFooterLinks"),
        part("EmailCaption"),
        part("EmailAddress"),
        part("EmailUnsubscribe"),
      ),
      "EmailUnsubscribe belongs to marketing sends; transactional messages keep the sender identity and address only.",
    ),
  ],
  "chat-message": [
    example(
      "Message with actions",
      part(
        "ChatMessage",
        part(
          "ChatMessageRow",
          part("ChatMessageAvatar"),
          part(
            "ChatMessageBody",
            part("ChatMessageHeader"),
            part("ChatMessageContent", content("message content")),
            part("ChatMessageActions", part("ActionBar")),
          ),
        ),
      ),
    ),
  ],
  "chat-composer": [
    example(
      "Anatomy",
      part(
        "ChatComposer",
        part(
          "ChatComposerShell",
          part("ChatComposerAccent"),
          part("ChatComposerTextarea"),
          part("ChatComposerToolbar", part("ChatComposerTools"), part("ChatComposerSubmit")),
          part("ChatComposerFooter"),
        ),
      ),
    ),
  ],
  "chat-composer-attachment": [
    example(
      "Attachment rail",
      part(
        "ChatComposerAttachments",
        part(
          "ChatComposerAttachment",
          part("ChatComposerAttachmentPreview"),
          part("ChatComposerAttachmentContent", part("ChatComposerAttachmentTitle"), part("ChatComposerAttachmentDescription")),
          part("ChatComposerAttachmentRemove"),
          part("ChatComposerAttachmentProgress"),
        ),
      ),
    ),
  ],
  "user-ask": [
    example(
      "Anatomy",
      part(
        "UserAsk",
        part("UserAskHeader", part("UserAskTitle"), part("UserAskPagination")),
        part(
          "UserAskQuestion",
          part("UserAskOption", part("UserAskOptionLabel"), part("UserAskOptionDescription")),
          part("UserAskOptionInput"),
        ),
        part("UserAskFooter", part("UserAskDismiss"), part("UserAskSubmit")),
      ),
    ),
  ],
  "task-list": [
    example(
      "Expandable task progress",
      part(
        "TaskList",
        part("TaskListTrigger", part("TaskListIndicator"), part("TaskListProgress"), part("TaskListLabel")),
        part("TaskListContent", part("TaskListItem", part("TaskListIndicator"))),
      ),
      "Trigger and item children can be omitted to use their built-in content.",
    ),
  ],
  "audio-recorder": [
    example(
      "Anatomy",
      part(
        "AudioRecorder",
        part("AudioRecorderTrigger"),
        part("AudioRecorderStatus"),
        part("AudioRecorderVisualizer"),
        part("AudioRecorderDuration"),
        part("AudioRecorderCancel"),
        part("AudioRecorderSubmit"),
      ),
    ),
  ],
  "audio-visualizer": [
    example("Levels-driven visualizer", part("AudioVisualizer"), "Both the bars and line versions use the same component and levels prop."),
  ],
  "dynamic-notification": [
    example(
      "Notification with liquid backdrop",
      part(
        "DynamicNotification",
        part(
          "DynamicNotificationIsland",
          part("DynamicNotificationLiquid"),
          part("DynamicNotificationPill", part("DynamicNotificationIndicator")),
          part(
            "DynamicNotificationContent",
            part("DynamicNotificationTitle"),
            part("DynamicNotificationClose"),
            part("DynamicNotificationMessage"),
            part("DynamicNotificationReply", part("DynamicNotificationReplyInput"), part("DynamicNotificationReplySubmit")),
          ),
        ),
      ),
    ),
    example(
      "Glass backdrop alternative",
      part(
        "DynamicNotification",
        part(
          "DynamicNotificationIsland",
          part("DynamicNotificationGlass"),
          part("DynamicNotificationPill", part("DynamicNotificationIndicator")),
          part("DynamicNotificationContent", part("DynamicNotificationMessage")),
        ),
      ),
      "Use Glass or Liquid as the backdrop; omit both for the CSS surface.",
    ),
  ],
  "environment-variables": [
    example("Ready-made editor", part("EnvironmentVariables"), "The ready-made editor supplies the editable composition below."),
    example(
      "Custom editable form",
      part(
        "EnvironmentVariablesRoot",
        part("EnvironmentVariablesHeader"),
        part("EnvironmentVariablesToolbar", part("EnvironmentVariablesUploadButton")),
        part("EnvironmentVariablesUploadError"),
        part("EnvironmentVariablesRows", part("EnvironmentVariablesRow")),
        part("EnvironmentVariablesDuplicateKeysError"),
        part("EnvironmentVariablesMessage"),
        part(
          "EnvironmentVariablesActions",
          part("EnvironmentVariablesAddButton"),
          part("EnvironmentVariablesResetButton"),
          part("EnvironmentVariablesSubmitButton"),
        ),
      ),
    ),
    example("Read-only values", part("EnvironmentVariablesReadOnlyList", part("EnvironmentVariablesReadOnlyItem"))),
  ],
  activity: [
    example("Static activity", part("Activity", part("ActivityRow", part("ActivityIcon"), part("ActivityTitle"), part("ActivityStatus")))),
    example(
      "Collapsible activity",
      part(
        "Activity",
        part("ActivityTrigger", part("ActivityIcon"), part("ActivityTitle"), part("ActivityStatus")),
        part(
          "ActivityContent",
          part("Timeline"),
          part("SourceBadge"),
          part("ActivityDetail", part("ActivityDetailLabel"), part("ActivityDetailContent")),
        ),
      ),
    ),
  ],
  "transcript-divider": [example("Run boundary", part("TranscriptDivider", part("TranscriptDividerLabel")))],
  context: [
    example(
      "Context inspector",
      part(
        "Context",
        part("ContextTrigger"),
        part(
          "ContextContent",
          part("ContextHeader", part("ContextTitle"), part("ContextDescription"), part("ContextClose")),
          part("ContextSummary"),
          part("ContextGraph"),
          part("ContextLegend"),
        ),
      ),
      "Omitting children uses the built-in trigger and content. Add a header when composing a custom inspector.",
    ),
  ],
  "inline-citation": [
    example(
      "Source preview and navigation",
      part(
        "InlineCitation",
        part("InlineCitationTrigger", part("InlineCitationFavicons"), part("InlineCitationLabel")),
        part(
          "InlineCitationContent",
          part("InlineCitationNavigation", part("InlineCitationPrevious"), part("InlineCitationNext"), part("InlineCitationPosition")),
          part("InlineCitationSource"),
        ),
      ),
      "These are also the built-in parts when children are omitted.",
    ),
  ],
  "source-badge": [
    example(
      "Linked source",
      part("SourceBadge", part("SourceFavicon")),
      "The badge supplies its favicon automatically; SourceFavicon can also be used independently.",
    ),
  ],
  "action-bar": [example("Anatomy", part("ActionBar", part("ActionBarCopy"), part("ActionBarItem"), part("ActionBarEdit")))],
  "inline-attachment": [
    example(
      "Attachment with actions",
      part(
        "InlineAttachment",
        part("InlineAttachmentMedia"),
        part("InlineAttachmentContent", part("InlineAttachmentTitle"), part("InlineAttachmentDescription")),
        part("InlineAttachmentActions", part("InlineAttachmentAction")),
      ),
    ),
  ],
  "markdown-block": [
    example(
      "Anatomy",
      part(
        "MarkdownBlock",
        part("MarkdownBlockHeader", part("MarkdownBlockTitle"), part("MarkdownBlockCopy")),
        part("MarkdownBlockContent"),
      ),
    ),
  ],
  "chat-layout": [
    example(
      "Conversation and composer",
      part(
        "ChatLayout",
        part(
          "ChatThread",
          part(
            "ChatTurn",
            part("ChatMessage"),
            part("Activity", part("ActivityTrigger", part("ActivityTitle")), part("ActivityContent", content("reasoning content"))),
          ),
          part("ChatComposer"),
        ),
      ),
    ),
  ],
  "thread-rail": [
    example(
      "Anatomy",
      part(
        "ThreadRail",
        part(
          "ThreadRailItem",
          part("ThreadRailLine"),
          part(
            "ThreadRailPopover",
            part("ThreadRailTitle"),
            part("ThreadRailSummary"),
            part("ThreadRailFooter", part("ThreadRailFile", part("ThreadRailFileIcon")), part("ThreadRailMore")),
          ),
        ),
      ),
    ),
  ],
} as const;
