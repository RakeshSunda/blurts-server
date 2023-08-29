/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReactNode } from "react";
import styles from "./Toolbar.module.scss";
import { UserMenu } from "./UserMenu";
import { Session } from "next-auth";
import { AppPicker } from "./AppPicker";
import PremiumBadge from "../../server/PremiumBadge";
import { hasPremium } from "../../../functions/universal/user";

export type Props = {
  user: Session["user"] | null;
  children?: ReactNode;
};

export const Toolbar = (props: Props) => {
  return (
    <nav className={styles.toolbar}>
      <div className={styles.start}>{props.children}</div>
      <div className={styles.end}>
        {props.user && hasPremium(props.user) && <PremiumBadge />}
        <AppPicker />
        <UserMenu user={props.user} />
      </div>
    </nav>
  );
};
