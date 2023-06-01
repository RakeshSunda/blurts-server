/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactElement } from "react";
import styles from "./ExposureCard.module.scss";
import { StatusPill } from "./StatusPill";
import { StaticImageData } from "next/image";
import Image from "next/image";
import { Button } from "./Button";

export type Props = {
  exposureImg: StaticImageData;
  exposureName: string;
  exposureType: string;
  exposureDetailsLink: string;
  dateFound: string;
  statusPillType: string;
  statusPillContent: string;
};

export const ExposureCard = (props: Props) => {
  const {
    exposureImg,
    exposureName,
    exposureType,
    exposureDetailsLink,
    dateFound,
    statusPillContent,
    statusPillType,
  } = props;

  const elementCard = (
    <div>
      <div className={styles.exposureHeader}>
        <ul className={styles.exposureHeaderList}>
          <li className={styles.exposureImageWrapper}>
            <Image className={styles.exposureImage} alt="" src={exposureImg} />
          </li>
          <li>{exposureName}</li>
          <li>{exposureType}</li>
          <li>{dateFound}</li>
          <li>
            <StatusPill type={statusPillType} content={statusPillContent} />
          </li>
        </ul>
        <div className={styles.exposureDetailsSection}>
          <p>
            This site is selling and publishing{" "}
            <a href={exposureDetailsLink}>details about you.</a> Remove this
            profile to protect your privacy.
          </p>
          <ul>
            <li>Your exposed info:</li>
            <li>Family Members</li>
            <li>Phone Number</li>
            <li>Email</li>
            <li>Address</li>
            <li>
              <Button type={"primary"} content={"Lets fix it"} large={false} />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  return elementCard;
};
