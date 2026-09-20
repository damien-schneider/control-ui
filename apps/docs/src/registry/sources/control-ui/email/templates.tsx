import { Column, Img, Row, Section } from "react-email";
import {
  EmailAddress,
  EmailBrowserLink,
  EmailBulletList,
  EmailButton,
  EmailCaption,
  EmailCode,
  EmailDetailRow,
  EmailDivider,
  EmailFooter,
  EmailFooterLinks,
  EmailHeader,
  EmailHeading,
  EmailLayout,
  EmailLink,
  EmailLogo,
  type EmailNavLink,
  EmailPanel,
  type EmailSocialLink,
  EmailSocialLinks,
  EmailText,
  EmailUnsubscribe,
} from "./email";
import type { EmailTheme } from "./theme";

export type EmailBrand = { name: string; logoUrl?: string; homeUrl: string };

export type EmailFooterContent = {
  tagline: string;
  socialLinks: EmailSocialLink[];
  helpLinks: EmailNavLink[];
  sender: { company: string; addressLines: string[] };
  reason: string;
  legal: string;
} & ({ mailing: "transactional" } | { mailing: "marketing"; unsubscribeUrl: string; preferencesUrl?: string });

type EmailMessageProps = { theme: EmailTheme; brand: EmailBrand; footer: EmailFooterContent };
type EmailBrandProps = EmailMessageProps & { browserUrl?: string };

export function EmailBrandHeader({ brand, browserUrl }: { brand: EmailBrand; browserUrl?: string }) {
  return (
    <EmailHeader aside={browserUrl ? <EmailBrowserLink href={browserUrl} /> : null}>
      <EmailLogo name={brand.name} src={brand.logoUrl} href={brand.homeUrl} />
    </EmailHeader>
  );
}

export function EmailBrandFooter({ footer }: { footer: EmailFooterContent }) {
  return (
    <EmailFooter>
      <EmailSocialLinks links={footer.socialLinks} />
      <EmailFooterLinks links={footer.helpLinks} />
      <EmailCaption className="mb-2">{footer.tagline}</EmailCaption>
      <EmailAddress company={footer.sender.company} lines={footer.sender.addressLines} />
      <EmailCaption className="mb-2">{footer.reason}</EmailCaption>
      {footer.mailing === "marketing" ? (
        <EmailUnsubscribe unsubscribeUrl={footer.unsubscribeUrl} preferencesUrl={footer.preferencesUrl} />
      ) : null}
      <EmailCaption className="mb-0">{footer.legal}</EmailCaption>
    </EmailFooter>
  );
}

export function InvitationEmail({
  theme,
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
  return (
    <EmailLayout theme={theme} preview={`${inviter} invited you to ${workspace}`}>
      <EmailBrandHeader brand={brand} browserUrl={browserUrl} />
      <EmailHeading>A place for your next idea.</EmailHeading>
      <EmailText>
        {inviter} invited you to join <strong>{workspace}</strong>. Bring your work, share a little inspiration, and make something
        together.
      </EmailText>
      <EmailPanel>
        <EmailHeading as="h3">Your team is waiting</EmailHeading>
        <EmailText className="mb-0">Projects, conversations, and the details that move work forward. All in one shared space.</EmailText>
      </EmailPanel>
      <EmailButton href={inviteUrl}>Join {workspace}</EmailButton>
      <EmailBrandFooter footer={footer} />
    </EmailLayout>
  );
}

export function ProductEmail({
  theme,
  brand,
  browserUrl,
  footer,
  title,
  description,
  imageUrl,
  imageAlt,
  actionUrl,
}: EmailBrandProps & {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  actionUrl: string;
}) {
  return (
    <EmailLayout theme={theme} preview={title}>
      <EmailBrandHeader brand={brand} browserUrl={browserUrl} />
      <EmailCaption className="mb-6">ANNOUNCEMENT</EmailCaption>
      <Img src={imageUrl} alt={imageAlt} width="552" className="mb-6 block h-auto w-full rounded-scene" />
      <EmailHeading>{title}</EmailHeading>
      <EmailText>{description}</EmailText>
      <EmailButton href={actionUrl}>Explore what’s new</EmailButton>
      <EmailBrandFooter footer={footer} />
    </EmailLayout>
  );
}

export function EditorialEmail({
  theme,
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
  return (
    <EmailLayout theme={theme} preview={title}>
      <EmailBrandHeader brand={brand} browserUrl={browserUrl} />
      <EmailCaption className="mb-6">IN GOOD COMPANY</EmailCaption>
      <EmailHeading>Fresh perspectives.</EmailHeading>
      <Row>
        <Column width="36%" className="align-top">
          <Img src={imageUrl} alt={imageAlt} width="198" className="block h-auto w-full rounded-scene" />
        </Column>
        <Column width="64%" className="pl-5 align-top">
          <EmailHeading as="h2">{title}</EmailHeading>
          <EmailText>{description}</EmailText>
          <EmailLink href={articleUrl}>Read the story</EmailLink>
        </Column>
      </Row>
      <EmailBrandFooter footer={footer} />
    </EmailLayout>
  );
}

export type EmailArticle = { title: string; description: string; href: string; imageUrl: string; imageAlt: string };

export function NewsletterEmail({
  theme,
  brand,
  browserUrl,
  footer,
  articles,
}: EmailBrandProps & {
  articles: EmailArticle[];
}) {
  return (
    <EmailLayout theme={theme} preview="A few things worth making time for.">
      <EmailBrandHeader brand={brand} browserUrl={browserUrl} />
      <EmailCaption className="mb-6">THE WEEKLY EDIT</EmailCaption>
      <EmailHeading>A little room for inspiration.</EmailHeading>
      <EmailText tone="muted">A few things worth making time for. Stories, spaces, and ideas from our community.</EmailText>
      {articles.map((article) => (
        <Section key={article.href} className="mb-6">
          <Img src={article.imageUrl} alt={article.imageAlt} width="552" className="mb-4 block h-auto w-full rounded-scene" />
          <EmailHeading as="h2">{article.title}</EmailHeading>
          <EmailText>{article.description}</EmailText>
          <EmailLink href={article.href}>Read the story</EmailLink>
        </Section>
      ))}
      <EmailBrandFooter footer={footer} />
    </EmailLayout>
  );
}

export function SummaryEmail({
  theme,
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
  return (
    <EmailLayout theme={theme} preview={`Your team’s progress · ${period}`}>
      <EmailBrandHeader brand={brand} browserUrl={browserUrl} />
      <EmailCaption className="mb-6">{period}</EmailCaption>
      <EmailHeading>Good work adds up.</EmailHeading>
      <EmailText>Here’s what your team moved forward this week.</EmailText>
      <EmailPanel className="p-4">
        <Row className="table-fixed">
          {metrics.map((metric) => (
            <Column key={metric.label} className="px-2 align-top">
              <EmailText className="mb-1 text-heading-2 font-semibold">{metric.value}</EmailText>
              <EmailCaption className="mb-0">{metric.label}</EmailCaption>
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
      <EmailBrandFooter footer={footer} />
    </EmailLayout>
  );
}

export function VerificationEmail({
  theme,
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
  return (
    <EmailLayout theme={theme} preview={`${code} is your verification code`}>
      <EmailBrandHeader brand={brand} />
      <EmailHeading>Confirm your email address</EmailHeading>
      <EmailText>Enter this code to finish signing in. It works once, and only for this device.</EmailText>
      <EmailCode>{code}</EmailCode>
      <EmailCaption className="mb-6">The code expires in {expiresInMinutes} minutes.</EmailCaption>
      <EmailText className="mb-0">
        Didn’t ask for this code? Ignore this email, or <EmailLink href={supportUrl}>tell our team</EmailLink>.
      </EmailText>
      <EmailBrandFooter footer={footer} />
    </EmailLayout>
  );
}

export type EmailReceiptLine = { label: string; value: string };

export function ReceiptEmail({
  theme,
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
  return (
    <EmailLayout theme={theme} preview={`Receipt ${orderNumber} · ${total}`}>
      <EmailBrandHeader brand={brand} />
      <EmailCaption className="mb-6">RECEIPT</EmailCaption>
      <EmailHeading>Thanks for your order.</EmailHeading>
      <EmailText>
        Order <strong>{orderNumber}</strong> was confirmed on {orderDate}. Keep this receipt for your records.
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
      <EmailBrandFooter footer={footer} />
    </EmailLayout>
  );
}

export type EmailReleaseSection = { title: string; changes: string[] };

export function ReleaseNotesEmail({
  theme,
  brand,
  browserUrl,
  footer,
  version,
  summary,
  sections,
  changelogUrl,
}: EmailBrandProps & {
  version: string;
  summary: string;
  sections: EmailReleaseSection[];
  changelogUrl: string;
}) {
  return (
    <EmailLayout theme={theme} preview={`What shipped in ${version}`}>
      <EmailBrandHeader brand={brand} browserUrl={browserUrl} />
      <EmailCaption className="mb-6">RELEASE {version}</EmailCaption>
      <EmailHeading>What shipped this month.</EmailHeading>
      <EmailText>{summary}</EmailText>
      {sections.map((section) => (
        <Section key={section.title} className="mb-4">
          <EmailHeading as="h3">{section.title}</EmailHeading>
          <EmailBulletList items={section.changes} />
        </Section>
      ))}
      <EmailButton href={changelogUrl}>Read the full changelog</EmailButton>
      <EmailBrandFooter footer={footer} />
    </EmailLayout>
  );
}
