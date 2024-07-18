/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use client";

import { ReactNode, createContext, useEffect, useState } from "react";
import { MetricFlowData } from "../app/functions/universal/getFreeScanSearchParams";
import { captureException } from "@sentry/nextjs";

interface SessionProviderProps {
  children: ReactNode;
  enabled: boolean;
  metricsFlowParams: {
    entrypoint: string;
    entrypoint_experiment: string;
    entrypoint_variation: string;
    form_type: string;
    service: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
  };
}

type ContextValues = {
  data: MetricFlowData | null;
};

export const AccountsMetricsFlowContext = createContext<ContextValues>({
  data: null,
});

export const AccountsMetricsFlowProvider = ({
  children,
  enabled,
  metricsFlowParams,
}: SessionProviderProps) => {
  const [data, setData] = useState<ContextValues["data"]>(null);

  useEffect(() => {
    async function fetchMetricsFlowData() {
      try {
        const searchParams = new URLSearchParams(metricsFlowParams);
        const response = await fetch(
          `/api/v1/accounts-metrics-flow?${searchParams.toString()}`,
        );
        const data: {
          success: boolean;
          flowData?: MetricFlowData;
        } = await response.json();
        setData(data.flowData ?? null);

        // This catch block is only reporting an error to Sentry.
        /* c8 ignore next 3 */
      } catch (error) {
        captureException(error);
      }
    }

    if (enabled) {
      void fetchMetricsFlowData();
    }
    // This effect should only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AccountsMetricsFlowContext.Provider value={{ data }}>
      {children}
    </AccountsMetricsFlowContext.Provider>
  );
};
