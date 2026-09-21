import type { ReactNode } from "react";
import { Column, Img, type PrismLanguage, Row } from "react-email";
import {
  EmailBulletList,
  EmailButton,
  EmailCaption,
  EmailColumns,
  EmailDetailRow,
  EmailDivider,
  EmailHeading,
  EmailLayout,
  EmailLink,
  EmailOneTimeCode,
  EmailPanel,
  EmailSection,
  EmailText,
  type EmailVariant,
} from "./email";
import { type EmailBrand, EmailBrandFooter, EmailBrandHeader, type EmailFooterContent } from "./email-brand";
import { EmailCodeBlock, EmailInlineCode, EmailMarkdown } from "./email-code";
import type { EmailTheme } from "./theme";

type EmailMessageProps = { theme: EmailTheme; brand: EmailBrand; footer: EmailFooterContent; variant?: EmailVariant; head?: ReactNode };
type EmailBrandProps = EmailMessageProps & { browserUrl?: string };

export type EmailHighlight = { title: string; description: string };

export function InvitationEmail({
  theme,
  variant,
  head,
  brand,
  browserUrl,
  footer,
  inviter,
  workspace,
  inviteUrl,
}: EmailBrandProps & {
  inviter: string;
  workspace: string;
  inviteUrl: string;
}) {
  const layout = { theme, variant, head, footer: <EmailBrandFooter footer={footer} />, footerPlacement: footer.placement };
  return (
    <EmailLayout {...layout} preview={`${inviter} invited you to ${workspace}`}>
      <EmailBrandHeader brand={brand} browserUrl={browserUrl} colorScheme={theme.colorScheme} />
      <EmailHeading>A place for your next idea.</EmailHeading>
      <EmailText>
        {inviter} invited you to join <strong>{workspace}</strong>. Bring your work, share a little inspiration, and make something
        together.
      </EmailText>
      <EmailPanel>
        <EmailHeading as="h3">Your team is waiting</EmailHeading>
        <EmailText className="mb-0">Projects, conversations, and the details that move work forward. All in one shared space.</EmailText>
      </EmailPanel>
      <EmailButton href={inviteUrl} width="full">
        Join {workspace}
      </EmailButton>
    </EmailLayout>
  );
}

export function ProductEmail({
  theme,
  variant,
  head,
  brand,
  browserUrl,
  footer,
  title,
  description,
  imageUrl,
  imageAlt,
  highlights = [],
  actionUrl,
}: EmailBrandProps & {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  highlights?: EmailHighlight[];
  actionUrl: string;
}) {
  const layout = { theme, variant, head, footer: <EmailBrandFooter footer={footer} />, footerPlacement: footer.placement };
  return (
    <EmailLayout {...layout} preview={title}>
      <EmailBrandHeader brand={brand} browserUrl={browserUrl} colorScheme={theme.colorScheme} align="center" />
      <EmailCaption align="center" className="mb-6">
        ANNOUNCEMENT
      </EmailCaption>
      <Img src={imageUrl} alt={imageAlt} width="552" className="mb-6 block h-auto w-full rounded-scene" />
      <EmailHeading size="display" align="center">
        {title}
      </EmailHeading>
      <EmailText align="center">{description}</EmailText>
      <EmailColumns>
        {highlights.map((highlight) => (
          <EmailSection key={highlight.title} align="center">
            <EmailHeading as="h4" align="center" className="mb-1">
              {highlight.title}
            </EmailHeading>
            <EmailCaption align="center" className="mb-0">
              {highlight.description}
            </EmailCaption>
          </EmailSection>
        ))}
      </EmailColumns>
      <EmailSection align="center">
        <EmailButton href={actionUrl}>Explore what’s new</EmailButton>
      </EmailSection>
    </EmailLayout>
  );
}

export function EditorialEmail({
  theme,
  variant,
  head,
  brand,
  browserUrl,
  footer,
  title,
  description,
  imageUrl,
  imageAlt,
  articleUrl,
}: EmailBrandProps & {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  articleUrl: string;
}) {
  const layout = { theme, variant, head, footer: <EmailBrandFooter footer={footer} />, footerPlacement: footer.placement };
  return (
    <EmailLayout {...layout} preview={title}>
      <EmailBrandHeader brand={brand} browserUrl={browserUrl} colorScheme={theme.colorScheme} />
      <EmailCaption className="mb-6">IN GOOD COMPANY</EmailCaption>
      <EmailHeading size="heading-2">Fresh perspectives.</EmailHeading>
      <EmailColumns widths={["36%", "64%"]}>
        <Img src={imageUrl} alt={imageAlt} width="198" className="block h-auto w-full rounded-scene" />
        <EmailSection>
          <EmailHeading as="h2" size="heading-3">
            {title}
          </EmailHeading>
          <EmailText>{description}</EmailText>
          <EmailLink href={articleUrl}>Read the story</EmailLink>
        </EmailSection>
      </EmailColumns>
    </EmailLayout>
  );
}

export type EmailArticle = { title: string; description: string; href: string; imageUrl: string; imageAlt: string };

export function NewsletterEmail({
  theme,
  variant,
  head,
  brand,
  browserUrl,
  footer,
  articles,
}: EmailBrandProps & {
  articles: EmailArticle[];
}) {
  const layout = { theme, variant, head, footer: <EmailBrandFooter footer={footer} />, footerPlacement: footer.placement };
  return (
    <EmailLayout {...layout} preview="A few things worth making time for.">
      <EmailBrandHeader brand={brand} browserUrl={browserUrl} colorScheme={theme.colorScheme} align="center" />
      <EmailCaption align="center" className="mb-6">
        THE WEEKLY EDIT
      </EmailCaption>
      <EmailHeading align="center">A little room for inspiration.</EmailHeading>
      <EmailText align="center" tone="muted" className="mb-8">
        A few things worth making time for. Stories, spaces, and ideas from our community.
      </EmailText>
      {articles.map((article) => (
        <EmailSection key={article.href} className="mb-6">
          <Img src={article.imageUrl} alt={article.imageAlt} width="552" className="mb-4 block h-auto w-full rounded-scene" />
          <EmailHeading as="h2">{article.title}</EmailHeading>
          <EmailText>{article.description}</EmailText>
          <EmailLink href={article.href}>Read the story</EmailLink>
        </EmailSection>
      ))}
    </EmailLayout>
  );
}

export function SummaryEmail({
  theme,
  variant,
  head,
  brand,
  browserUrl,
  footer,
  period,
  metrics,
  details,
  dashboardUrl,
}: EmailBrandProps & {
  period: string;
  metrics: { label: string; value: string }[];
  details: { label: string; value: string }[];
  dashboardUrl: string;
}) {
  const layout = { theme, variant, head, footer: <EmailBrandFooter footer={footer} />, footerPlacement: footer.placement };
  return (
    <EmailLayout {...layout} preview={`Your team’s progress · ${period}`}>
      <EmailBrandHeader brand={brand} browserUrl={browserUrl} colorScheme={theme.colorScheme} />
      <EmailCaption className="mb-6">{period}</EmailCaption>
      <EmailHeading size="heading-2">Good work adds up.</EmailHeading>
      <EmailText>Here’s what your team moved forward this week.</EmailText>
      <EmailPanel className="p-4">
        <Row className="table-fixed">
          {metrics.map((metric) => (
            <Column key={metric.label} className="px-2 align-top">
              <EmailText align="center" className="mb-1 text-heading-2 font-semibold">
                {metric.value}
              </EmailText>
              <EmailCaption align="center" className="mb-0">
                {metric.label}
              </EmailCaption>
            </Column>
          ))}
        </Row>
      </EmailPanel>
      {details.map((detail) => (
        <EmailDetailRow key={detail.label} label={detail.label} value={detail.value} />
      ))}
      <EmailButton href={dashboardUrl} className="mt-4">
        View your workspace
      </EmailButton>
    </EmailLayout>
  );
}

export function VerificationEmail({
  theme,
  variant,
  head,
  brand,
  footer,
  code,
  expiresInMinutes,
  supportUrl,
}: EmailMessageProps & {
  code: string;
  expiresInMinutes: number;
  supportUrl: string;
}) {
  const layout = { theme, variant, head, footer: <EmailBrandFooter footer={footer} />, footerPlacement: footer.placement };
  return (
    <EmailLayout {...layout} preview={`${code} is your verification code`}>
      <EmailBrandHeader brand={brand} colorScheme={theme.colorScheme} align="center" />
      <EmailHeading size="heading-2" align="center">
        Confirm your email address
      </EmailHeading>
      <EmailText align="center">Enter this code to finish signing in. It works once, and only for this device.</EmailText>
      <EmailOneTimeCode>{code}</EmailOneTimeCode>
      <EmailCaption align="center" className="mb-6">
        The code expires in {expiresInMinutes} minutes.
      </EmailCaption>
      <EmailText align="center" className="mb-0">
        Didn’t ask for this code? Ignore this email, or <EmailLink href={supportUrl}>tell our team</EmailLink>.
      </EmailText>
    </EmailLayout>
  );
}

export type EmailReceiptLine = { label: string; value: string };

export function ReceiptEmail({
  theme,
  variant,
  head,
  brand,
  footer,
  orderNumber,
  orderDate,
  lines,
  total,
  paymentMethod,
  invoiceUrl,
}: EmailMessageProps & {
  orderNumber: string;
  orderDate: string;
  lines: EmailReceiptLine[];
  total: string;
  paymentMethod: string;
  invoiceUrl: string;
}) {
  const layout = { theme, variant, head, footer: <EmailBrandFooter footer={footer} />, footerPlacement: footer.placement };
  return (
    <EmailLayout {...layout} preview={`Receipt ${orderNumber} · ${total}`}>
      <EmailBrandHeader brand={brand} colorScheme={theme.colorScheme} />
      <EmailCaption className="mb-6">RECEIPT</EmailCaption>
      <EmailHeading size="heading-3">Thanks for your order.</EmailHeading>
      <EmailText>
        Order <EmailInlineCode>{orderNumber}</EmailInlineCode> was confirmed on {orderDate}. Keep this receipt for your records.
      </EmailText>
      <EmailPanel>
        {lines.map((line) => (
          <EmailDetailRow key={line.label} label={line.label} value={line.value} />
        ))}
        <EmailDivider className="my-3" />
        <EmailDetailRow label="Total" value={total} emphasis />
      </EmailPanel>
      <EmailCaption className="mb-6">Paid with {paymentMethod}.</EmailCaption>
      <EmailButton href={invoiceUrl}>View invoice</EmailButton>
    </EmailLayout>
  );
}

export type EmailReleaseSection = { title: string; changes: string[] };

export function ReleaseNotesEmail({
  theme,
  variant,
  head,
  brand,
  browserUrl,
  footer,
  version,
  summary,
  sections,
  migration,
  changelogUrl,
}: EmailBrandProps & {
  version: string;
  summary: string;
  sections: EmailReleaseSection[];
  migration?: { notes: string; language: PrismLanguage; code: string };
  changelogUrl: string;
}) {
  const layout = { theme, variant, head, footer: <EmailBrandFooter footer={footer} />, footerPlacement: footer.placement };
  return (
    <EmailLayout {...layout} preview={`What shipped in ${version}`}>
      <EmailBrandHeader brand={brand} browserUrl={browserUrl} colorScheme={theme.colorScheme} />
      <EmailCaption className="mb-6">RELEASE {version}</EmailCaption>
      <EmailHeading size="heading-2">What shipped this month.</EmailHeading>
      <EmailText>{summary}</EmailText>
      {sections.map((section) => (
        <EmailSection key={section.title} className="mb-4">
          <EmailHeading as="h3">{section.title}</EmailHeading>
          <EmailBulletList items={section.changes} />
        </EmailSection>
      ))}
      {migration ? (
        <>
          <EmailMarkdown theme={theme} variant={variant}>
            {migration.notes}
          </EmailMarkdown>
          <EmailCodeBlock theme={theme} language={migration.language} code={migration.code} />
        </>
      ) : null}
      <EmailButton href={changelogUrl}>Read the full changelog</EmailButton>
    </EmailLayout>
  );
}
