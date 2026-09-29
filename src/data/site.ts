/**
 * Single place for the addresses and endpoints the site talks to, so going
 * live is a one-line change rather than a grep across components.
 */
export const site = {
  /**
   * Where the newsletter form POSTs {email, consent, source, ts} as JSON.
   *
   * Empty on purpose: there is no list yet, and a form that silently swallows
   * an address is worse than one that admits where it goes. While this is
   * empty the form opens a pre-addressed email to `subscribeEmail` instead,
   * which actually reaches a person. Set this when the list exists.
   */
  newsletterEndpoint: '',

  subscribeEmail: 'subscribe@bundle.ai',
  privacyEmail: 'privacy@bundle.ai',
  accessibilityEmail: 'accessibility@bundle.ai',
  legalEmail: 'legal@bundle.ai',
  generalEmail: 'hello@bundle.ai',

  /** What the subscribe consent actually commits us to, quoted on the form. */
  newsletter: {
    cadence: 'About twice a month',
    covers: 'new venues added, what changed in UK private-market rules, and the occasional Academy piece',
  },
} as const;
