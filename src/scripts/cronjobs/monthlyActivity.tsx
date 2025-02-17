/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SubscriberRow } from "knex/types/tables";
import {
  getSubscribersWaitingForMonthlyEmail,
  markMonthlyActivityEmailAsJustSent,
} from "../../db/tables/subscribers";
import { initEmail, sendEmail } from "../../utils/email";
import { renderEmail } from "../../emails/renderEmail";
import { MonthlyActivityEmail } from "../../emails/templates/monthlyActivity/MonthlyActivityEmail";
import { getCronjobL10n } from "../../app/functions/l10n/cronjobs";
import { sanitizeSubscriberRow } from "../../app/functions/server/sanitize";
import { getDashboardSummary } from "../../app/functions/server/dashboard";
import { getLatestOnerepScanResults } from "../../db/tables/onerep_scans";
import { getSubscriberBreaches } from "../../app/functions/server/getSubscriberBreaches";
import { getLocale } from "../../app/functions/universal/getLocale";
import { refreshStoredScanResults } from "../../app/functions/server/refreshStoredScanResults";
import { getSignupLocaleCountry } from "../../emails/functions/getSignupLocaleCountry";

void run();

async function run() {
  const batchSize = Number.parseInt(
    process.env.MONTHLY_ACTIVITY_EMAIL_BATCH_SIZE ?? "10",
    10,
  );
  if (Number.isNaN(batchSize)) {
    throw new Error(
      `Could not send monthly activity emails, because the env var MONTHLY_ACTIVITY_EMAIL_BATCH_SIZE has a non-numeric value: [${process.env.MONTHLY_ACTIVITY_EMAIL_BATCH_SIZE}].`,
    );
  }
  const subscribersToEmail = await getSubscribersWaitingForMonthlyEmail({
    limit: batchSize,
    // We're currently only sending this email to Plus subscribers. Down the
    // road, we might also send it to a limited number of free users, but we
    // still have to come up with the criteria to determine which:
    plusOnly: true,
  });
  await initEmail();

  await Promise.allSettled(
    subscribersToEmail.map((subscriber) => {
      return sendMonthlyActivityEmail(subscriber);
    }),
  );
  console.log(
    `[${new Date(Date.now()).toISOString()}] Sent [${subscribersToEmail.length}] monthly activity emails.`,
  );
}

async function sendMonthlyActivityEmail(subscriber: SubscriberRow) {
  const sanitizedSubscriber = sanitizeSubscriberRow(subscriber);
  const l10n = getCronjobL10n(sanitizedSubscriber);
  const locale = getLocale(l10n);
  /**
   * Without an active user session, we don't know the user's country. This is
   * our best guess based on their locale. At the time of writing, it's only
   * used to determine whether to count SSN breaches (which we don't have
   * recommendations for outside the US).
   */
  const countryCodeGuess = getSignupLocaleCountry(subscriber);

  // OneRep suggested not relying on webhooks, but instead to fetch the latest
  // data from their API. Thus, let's refresh the data in our DB in real-time:
  if (subscriber.onerep_profile_id !== null) {
    await refreshStoredScanResults(subscriber.onerep_profile_id);
  }

  const latestScan = await getLatestOnerepScanResults(
    subscriber.onerep_profile_id,
  );
  const subscriberBreaches = await getSubscriberBreaches({
    fxaUid: subscriber.fxa_uid,
    countryCode: countryCodeGuess,
  });
  const data = getDashboardSummary(latestScan.results, subscriberBreaches);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    month: "long",
  });
  const currentMonth = dateFormatter.format(new Date(Date.now()));

  let subject = l10n.getString("email-monthly-free-subject", {
    month: currentMonth,
  });
  if (subscriber.fxa_profile_json?.subscriptions?.includes("monitor")) {
    subject = l10n.getString("email-monthly-plus-auto-subject", {
      month: currentMonth,
    });
  }

  // Update the last-sent date *first*, so that if something goes wrong, we
  // don't keep resending the email a brazillion times.
  await markMonthlyActivityEmailAsJustSent(subscriber);

  await sendEmail(
    sanitizedSubscriber.primary_email,
    subject,
    renderEmail(
      <MonthlyActivityEmail
        subscriber={sanitizedSubscriber}
        data={data}
        l10n={l10n}
      />,
    ),
  );
}
