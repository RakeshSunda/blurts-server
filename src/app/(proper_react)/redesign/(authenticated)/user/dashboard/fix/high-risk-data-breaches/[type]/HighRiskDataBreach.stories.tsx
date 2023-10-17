/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from "@storybook/react";
import {
  createRandomBreach,
  createUserWithPremiumSubscription,
} from "../../../../../../../../../apiMocks/mockData";
import { Shell } from "../../../../../../Shell";
import { getEnL10nSync } from "../../../../../../../../functions/server/mockL10n";
import { HighRiskBreachLayout } from "../HighRiskBreachLayout";
import { HighRiskBreachTypes } from "../highRiskBreachData";
import { BreachDataTypes } from "../../../../../../../../functions/universal/breach";

const mockedBreaches = [...Array(5)].map(() => createRandomBreach());
// Ensure all high-risk data breaches are present in at least one breach:
mockedBreaches.push(
  createRandomBreach({
    dataClasses: [
      BreachDataTypes.SSN,
      BreachDataTypes.CreditCard,
      BreachDataTypes.BankAccount,
      BreachDataTypes.PIN,
    ],
  }),
);

const user = createUserWithPremiumSubscription();

const mockedSession = {
  expires: new Date().toISOString(),
  user: user,
};

const HighRiskBreachWrapper = (props: { type: HighRiskBreachTypes }) => {
  return (
    <Shell
      l10n={getEnL10nSync()}
      session={mockedSession}
      nonce=""
      monthlySubscriptionUrl=""
      yearlySubscriptionUrl=""
    >
      <HighRiskBreachLayout
        subscriberEmails={[]}
        type={props.type}
        data={{
          countryCode: "nl",
          latestScanData: { results: [], scan: null },
          subscriberBreaches: mockedBreaches,
          user: mockedSession.user,
        }}
      />
    </Shell>
  );
};

const meta: Meta<typeof HighRiskBreachWrapper> = {
  title: "Pages/Guided resolution/2. High-risk data breaches",
  component: HighRiskBreachWrapper,
};
export default meta;
type Story = StoryObj<typeof HighRiskBreachWrapper>;

export const SsnStory: Story = {
  name: "2a. Social Security Number",
  args: {
    type: "ssn",
  },
};

export const CreditCardStory: Story = {
  name: "2b. Credit card",
  args: {
    type: "credit-card",
  },
};

export const BankAccountStory: Story = {
  name: "2c. Bank account",
  args: {
    type: "bank-account",
  },
};

export const PinStory: Story = {
  name: "2d. PIN",
  args: {
    type: "pin",
  },
};
