import { Column, Hr, Img, Row, Section } from "react-email";
import { EmailButton, EmailHeading, EmailLayout, EmailLink, EmailText } from "./email";
import type { EmailTheme } from "./theme";

type EmailBrandProps = { theme: EmailTheme; brand: string; footer: string };

function EmailFooter({ brand, children }: { brand: string; children: string }) {
  return (
    <>
      <Hr className="my-6 border-0 border-t border-solid border-t-border" />
      <EmailText tone="muted" className="mb-1 text-caption">
        {brand}
      </EmailText>
      <EmailText tone="muted" className="mb-0 text-caption">
        {children}
      </EmailText>
    </>
  );
}

export function InvitationEmail({
  theme,
  brand,
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
      <EmailText tone="muted" className="mb-8 text-caption">
        {brand}
      </EmailText>
      <EmailHeading>A place for your next idea.</EmailHeading>
      <EmailText>
        {inviter} invited you to join <strong>{workspace}</strong>. Bring your work, share a little inspiration, and make something
        together.
      </EmailText>
      <Section className="my-6 rounded-panel bg-muted p-5">
        <EmailHeading as="h3">Your team is waiting</EmailHeading>
        <EmailText className="mb-0">Projects, conversations, and the details that move work forward. All in one shared space.</EmailText>
      </Section>
      <EmailButton href={inviteUrl}>Join {workspace}</EmailButton>
      <EmailFooter brand={brand}>{footer}</EmailFooter>
    </EmailLayout>
  );
}

export function ProductEmail({
  theme,
  brand,
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
      <EmailText tone="muted" className="mb-6 text-caption">
        {brand} / NEW RELEASE
      </EmailText>
      <Img src={imageUrl} alt={imageAlt} width="552" className="mb-6 block h-auto w-full rounded-scene" />
      <EmailHeading>{title}</EmailHeading>
      <EmailText>{description}</EmailText>
      <EmailButton href={actionUrl}>Explore what’s new</EmailButton>
      <EmailFooter brand={brand}>{footer}</EmailFooter>
    </EmailLayout>
  );
}

export function EditorialEmail({
  theme,
  brand,
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
      <EmailText tone="muted" className="mb-6 text-caption">
        {brand} / IN GOOD COMPANY
      </EmailText>
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
      <EmailFooter brand={brand}>{footer}</EmailFooter>
    </EmailLayout>
  );
}

export type EmailArticle = { title: string; description: string; href: string; imageUrl: string; imageAlt: string };

export function NewsletterEmail({
  theme,
  brand,
  footer,
  articles,
  unsubscribeUrl,
}: EmailBrandProps & {
  articles: EmailArticle[];
  unsubscribeUrl: string;
}) {
  return (
    <EmailLayout theme={theme} preview="A few things worth making time for.">
      <EmailText tone="muted" className="mb-6 text-caption">
        {brand} / THE WEEKLY EDIT
      </EmailText>
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
      <EmailFooter brand={brand}>{footer}</EmailFooter>
      <EmailLink href={unsubscribeUrl} className="text-caption">
        Unsubscribe
      </EmailLink>
    </EmailLayout>
  );
}

export function SummaryEmail({
  theme,
  brand,
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
      <EmailText tone="muted" className="mb-6 text-caption">
        {brand} / {period}
      </EmailText>
      <EmailHeading>Good work adds up.</EmailHeading>
      <EmailText>Here’s what your team moved forward this week.</EmailText>
      <Section className="my-6 rounded-panel bg-muted p-4">
        <Row className="table-fixed">
          {metrics.map((metric) => (
            <Column key={metric.label} className="px-2 align-top">
              <EmailText className="mb-1 text-heading-2 font-semibold">{metric.value}</EmailText>
              <EmailText tone="muted" className="mb-0 text-caption">
                {metric.label}
              </EmailText>
            </Column>
          ))}
        </Row>
      </Section>
      {details.map((detail) => (
        <Row key={detail.label} className="table-fixed">
          <Column>
            <EmailText>{detail.label}</EmailText>
          </Column>
          <Column align="right">
            <EmailText>{detail.value}</EmailText>
          </Column>
        </Row>
      ))}
      <EmailButton href={dashboardUrl}>View your workspace</EmailButton>
      <EmailFooter brand={brand}>{footer}</EmailFooter>
    </EmailLayout>
  );
}
