// Builds the submitter-facing decision email. Pure (no network, no env) so
// the copy can be unit-tested and previewed without deploying.
// Approval assumes the tool page already exists: new_tool suggestions are
// approved only after their page has been created.

import { escapeHtml, oneLiner, type Suggestion } from './suggestion-email.ts';

export const SITE_URL = 'https://aitoolreview.ai';

export interface DecisionEmailInput {
    suggestion: Suggestion;
    displayName: string | null;
}

export interface EmailContent {
    subject: string;
    html: string;
}

// The tool this suggestion is about, if any: the proposed slug for a new
// tool, or the existing tool's slug for edits/placements.
export function toolSlugFor(s: Suggestion): string | null {
    if (s.kind === 'new_tool') {
        const slug = s.payload?.slug;
        return typeof slug === 'string' && slug ? slug : null;
    }
    return s.tool_slug;
}

export function toolNameFor(s: Suggestion): string | null {
    const name = s.payload?.name;
    if (typeof name === 'string' && name.trim()) return name.trim();
    return s.tool_slug;
}

export function toolPageUrl(slug: string): string {
    return `${SITE_URL}/tools/${encodeURIComponent(slug)}/`;
}

export function buildDecisionEmail(input: DecisionEmailInput): EmailContent {
    return input.suggestion.status === 'approved'
        ? buildApprovedEmail(input)
        : buildRejectedEmail(input);
}

function link(href: string, label: string): string {
    return `<a href="${href}" style="color:#2563eb;font-weight:600;text-decoration:underline;">${label}</a>`;
}

function greeting(displayName: string | null): string {
    return `<p>${displayName ? `Hi ${escapeHtml(displayName)},` : 'Hi there,'}</p>`;
}

function signoff(): string {
    return `<p>Thanks,<br>The AI Tool Review team</p>`;
}

function wrap(inner: string): string {
    return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.6;color:#111827;max-width:560px;">${inner}</div>`;
}

function footer(): string {
    return `<p style="font-size:13px;color:#6b7280;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:16px;">You are getting this because you made a suggestion on AI Tool Review. ${link(`${SITE_URL}/my-suggestions`, 'Track your suggestions')}.</p>`;
}

function suggestMoreLine(): string {
    return `<p>Know another tool we're missing? ${link(`${SITE_URL}/`, 'Suggest it')}. Any feedback, on this tool or others? Just reply.</p>`;
}

function buildApprovedEmail({ suggestion, displayName }: DecisionEmailInput): EmailContent {
    const isNewTool = suggestion.kind === 'new_tool';
    const slug = toolSlugFor(suggestion);
    const rawName = toolNameFor(suggestion);
    const label = rawName ? escapeHtml(rawName) : 'the tool';
    const pageUrl = slug ? toolPageUrl(slug) : null;

    const subject = isNewTool && rawName
        ? `${rawName} is live on AI Tool Review, thanks to you`
        : `Your suggestion was approved${rawName ? ` for ${rawName}` : ''}`;
    const intro = isNewTool
        ? `<p><strong>${label}</strong> is now live on AI Tool Review, thanks to you!</p>`
        : `<p>We approved your suggestion: <em>${escapeHtml(oneLiner(suggestion))}</em>. Thanks for helping keep the site accurate!</p>`;

    const parts = [greeting(displayName), intro];
    if (pageUrl) {
        parts.push(`<p>You know it best, ${link(`${pageUrl}?review=1`, isNewTool ? 'share the first review' : 'share your review')}.</p>`);
        parts.push(`<p>Know people who use ${label}? ${link(pageUrl, 'Share the page')} and ask for their review.</p>`);
    }
    parts.push(suggestMoreLine(), signoff(), footer());

    return { subject, html: wrap(parts.join('\n')) };
}

function buildRejectedEmail({ suggestion, displayName }: DecisionEmailInput): EmailContent {
    const rawName = toolNameFor(suggestion);
    const what = suggestion.kind === 'new_tool'
        ? `suggesting <strong>${rawName ? escapeHtml(rawName) : 'a tool'}</strong>`
        : `your suggestion: <em>${escapeHtml(oneLiner(suggestion))}</em>`;
    const note = suggestion.admin_note?.trim();

    const parts = [
        greeting(displayName),
        `<p>Thank you for ${what}. After reviewing it, we're not able to add it at this time.</p>`,
        note ? `<p><strong>Reason:</strong> ${escapeHtml(note)}</p>` : '',
        `<p>If you can address this, you're welcome to ${link(`${SITE_URL}/my-suggestions`, 'update and resubmit it')}. Questions? Just reply, we're happy to help.</p>`,
        signoff(),
        footer(),
    ];
    const subject = rawName ? `About your suggestion: ${rawName}` : 'About your AI Tool Review suggestion';
    return { subject, html: wrap(parts.filter(Boolean).join('\n')) };
}
