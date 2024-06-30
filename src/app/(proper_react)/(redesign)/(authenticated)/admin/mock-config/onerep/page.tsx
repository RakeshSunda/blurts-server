/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getServerSession } from "../../../../../../functions/server/getServerSession";
import { notFound } from "next/navigation";
import { isAdmin } from "../../../../../../api/utils/auth";
import ConfigPage from "./ConfigPage";

export default async function DevPage() {
  const session = await getServerSession();

  if (
    !session?.user?.email ||
    (!isAdmin(session.user.email) &&
      session.user.email !== process.env.E2E_TEST_ACCOUNT_EMAIL) ||
    process.env.APP_ENV !== "local"
  ) {
    return notFound();
  }

  return <ConfigPage />;
}
