/**
 * PromptShift Transactional Email Dispatcher
 * Multi-provider support (Resend, Brevo, or simulated fallback)
 */

import { EmailTemplates } from './emailTemplates';

export interface SendEmailPayload {
  action: 'welcome_account' | 'pro_pass_activated' | 'order_completed';
  email: string;
  projectName?: string;
  fileCount?: number;
  planName?: string;
  amount?: string;
  currency?: string;
  orderId?: string;
}

export interface EmailDispatchResult {
  success: boolean;
  delivered: boolean;
  provider: 'resend' | 'brevo' | 'simulated';
  messageId?: string;
  error?: string;
}

export class EmailDispatcher {
  public static async dispatch(payload: SendEmailPayload): Promise<EmailDispatchResult> {
    const { action, email } = payload;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        success: false,
        delivered: false,
        provider: 'simulated',
        error: 'Invalid recipient email address.',
      };
    }

    let emailData: { subject: string; html: string; text?: string };

    if (action === 'welcome_account') {
      emailData = EmailTemplates.welcomeAccount(email);
    } else if (action === 'pro_pass_activated') {
      emailData = EmailTemplates.proPassActivated(
        email,
        payload.projectName || 'Universal AI Project',
        payload.fileCount
      );
    } else if (action === 'order_completed') {
      emailData = EmailTemplates.orderCompleted(
        email,
        payload.planName || 'PromptShift Pass',
        payload.amount || '0.00',
        payload.currency || 'EUR',
        payload.orderId || `ORD-${Date.now()}`
      );
    } else {
      return {
        success: false,
        delivered: false,
        provider: 'simulated',
        error: 'Unsupported email action.',
      };
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const brevoApiKey = process.env.BREVO_API_KEY;
    const fromAddress = process.env.EMAIL_FROM || 'PromptShift <onboarding@resend.dev>';

    // Provider 1: Resend
    if (resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [email],
            reply_to: 'support@promptshift.dev',
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
            headers: {
              'List-Unsubscribe': '<mailto:support@promptshift.dev?subject=unsubscribe>',
              'X-Entity-Ref-ID': payload.orderId || `ord_${Date.now()}`,
            },
          }),
        });

        const data = await response.json();
        if (response.ok && data.id) {
          return {
            success: true,
            delivered: true,
            provider: 'resend',
            messageId: data.id,
          };
        } else {
          console.warn('[EmailDispatcher] Resend error:', data);
          return {
            success: false,
            delivered: false,
            provider: 'resend',
            error: data.message || 'Resend delivery failed',
          };
        }
      } catch (err: any) {
        console.error('[EmailDispatcher] Resend exception:', err);
      }
    }

    // Provider 2: Brevo (Sendinblue)
    if (brevoApiKey) {
      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'PromptShift', email: 'notifications@promptshift.dev' },
            to: [{ email }],
            replyTo: { email: 'support@promptshift.dev', name: 'PromptShift Support' },
            subject: emailData.subject,
            htmlContent: emailData.html,
            textContent: emailData.text,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          return {
            success: true,
            delivered: true,
            provider: 'brevo',
            messageId: data.messageId,
          };
        }
      } catch (err: any) {
        console.error('[EmailDispatcher] Brevo exception:', err);
      }
    }

    // Provider 3: Simulated mode (zero retention / local development — no plaintext PII in logs)
    const maskedDomain = email.includes('@') ? email.split('@')[1] : 'redacted';
    console.info(`[EmailDispatcher:Simulated] Prepared ${action} email for domain <***@${maskedDomain}>`);
    return {
      success: true,
      delivered: false,
      provider: 'simulated',
      messageId: `sim-${Date.now()}`,
    };
  }
}
