import 'server-only';
import { Resend } from 'resend';

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(apiKey);
}

export async function sendErrorEmail(errors: string[]): Promise<void> {
  const errorEmail = process.env.ERROR_EMAIL;
  if (!errorEmail) {
    console.error('ERROR_EMAIL not set — skipping error email');
    return;
  }

  const resend = getResend();
  const message = errors.join('\n');

  const { error } = await resend.emails.send({
    from: 'stracker-errors@visegripped.com',
    to: errorEmail,
    subject: 'Stracker errors',
    text: message,
  });

  if (error) {
    console.error('Failed to send error email:', error);
  }
}

export interface AlertMatch {
  symbol: string;
  type: string;
  sector?: string | null;
  industry?: string | null;
}

export interface TodaysAlerts {
  [symbol: string]: string;
}

function buildAlertEmailHtml(
  matched: AlertMatch[],
  todaysAlerts: TodaysAlerts,
  baseUrl = 'https://stracker.visegripped.com'
): string {
  const matchedHtml = matched
    .map((a) => `<a href="${baseUrl}/symbol/${a.symbol}">${a.symbol}</a> — ${a.type}`)
    .join('<br />');

  const allHtml = Object.entries(todaysAlerts)
    .map(
      ([sym, type]) =>
        `<a href="${baseUrl}/symbol/${sym}">${sym}</a> = ${type}`
    )
    .join('<br />');

  return `
    <h3>Matched alerts:</h3>
    ${matchedHtml || '<em>None</em>'}
    <br /><br />
    <h3>Today's alerts:</h3>
    ${allHtml || '<em>None</em>'}
  `;
}

export async function sendAlertEmail(
  to: string,
  matched: AlertMatch[],
  todaysAlerts: TodaysAlerts
): Promise<void> {
  const resend = getResend();

  const { error } = await resend.emails.send({
    from: 'stracker@visegripped.com',
    to,
    subject: 'Stracker - Tracked symbol(s) notification',
    html: buildAlertEmailHtml(matched, todaysAlerts),
  });

  if (error) {
    console.error(`Failed to send alert email to ${to}:`, error);
  }
}

function buildSectorSummaryHtml(
  alertsBySector: Record<string, { symbol: string; type: string; industry: string | null }[]>,
  baseUrl = 'https://stracker.visegripped.com'
): string {
  const sections = Object.entries(alertsBySector)
    .map(([sector, items]) => {
      const rows = items
        .map(
          (i) =>
            `<tr><td><a href="${baseUrl}/symbol/${i.symbol}">${i.symbol}</a></td><td>${i.industry ?? '—'}</td><td>${i.type}</td></tr>`
        )
        .join('');
      return `
        <h3>${sector}</h3>
        <table border="1" cellpadding="4">
          <thead><tr><th>Symbol</th><th>Industry</th><th>Signal</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
    })
    .join('<br />');

  return `<h2>Today's sector/industry alert summary</h2>${sections}`;
}

export async function sendSectorSummaryEmail(
  alertsBySector: Record<string, { symbol: string; type: string; industry: string | null }[]>
): Promise<void> {
  const errorEmail = process.env.ERROR_EMAIL;
  if (!errorEmail || Object.keys(alertsBySector).length === 0) return;

  const resend = getResend();
  const date = new Date().toISOString().slice(0, 10);

  const { error } = await resend.emails.send({
    from: 'stracker@visegripped.com',
    to: errorEmail,
    subject: `Stracker sector summary — ${date}`,
    html: buildSectorSummaryHtml(alertsBySector),
  });

  if (error) {
    console.error('Failed to send sector summary email:', error);
  }
}
