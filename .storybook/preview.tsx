import React from "react";
import { Inter } from "next/font/google";
import type { Preview } from "@storybook/react";
import "../src/app/globals.css";
import { L10nProvider } from "../src/contextProviders/localization";
import { getL10nBundles, getLocale } from "../src/app/functions/server/l10n";
import { metropolis } from "../src/app/fonts/Metropolis/metropolis";
import { ReactAriaI18nProvider } from "../src/contextProviders/react-aria";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const AppDecorator: Exclude<Preview["decorators"], undefined>[0] = (
  storyFn
) => {
  const l10nBundles = getL10nBundles();
  return (
    <L10nProvider bundleSources={l10nBundles}>
      <ReactAriaI18nProvider locale={getLocale(l10nBundles)}>
        <div
          className={`${inter.className} ${inter.variable} ${metropolis.variable}`}
        >
          {storyFn()}
        </div>
      </ReactAriaI18nProvider>
    </L10nProvider>
  );
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [AppDecorator],
};

export default preview;
