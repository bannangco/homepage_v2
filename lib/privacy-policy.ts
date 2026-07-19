type PrivacyPolicyFacts = {
  controller: string;
  representative: string;
  privacyOfficer: string;
  contactEmail: string;
  effectiveDate: string;
  inquiryRetention: {
    maximumYears: number;
    basis: "internal-maximum";
    unclearCompletionReference: "last-contact";
  };
  website: {
    contactForm: false;
    account: false;
    login: false;
    payment: false;
    newsletter: false;
    userDatabase: false;
    intentionallySetsFirstPartyCookies: false;
  };
  emailService: {
    provider: "Google LLC";
    service: "일반 무료 Gmail";
    accountType: "ordinary-free";
    privacyPolicyUrl: string;
  };
  cloudflare: {
    managedAnalyticsInjection: true;
    rumBeaconUrl: string;
    webAnalyticsFaqUrl: string;
    customerDpaUrl: string;
    unsampledRetentionDays: number;
    longTermAggregatePercentage: number;
    accessibleHistoryMonths: number;
  };
};

export const PRIVACY_POLICY_FACTS = {
  controller: "주식회사 반낭코",
  representative: "심윤보",
  privacyOfficer: "심윤보",
  contactEmail: "bannangko@gmail.com",
  effectiveDate: "2026-07-19",
  inquiryRetention: {
    maximumYears: 3,
    basis: "internal-maximum",
    unclearCompletionReference: "last-contact",
  },
  website: {
    contactForm: false,
    account: false,
    login: false,
    payment: false,
    newsletter: false,
    userDatabase: false,
    intentionallySetsFirstPartyCookies: false,
  },
  emailService: {
    provider: "Google LLC",
    service: "일반 무료 Gmail",
    accountType: "ordinary-free",
    privacyPolicyUrl: "https://policies.google.com/privacy?hl=ko",
  },
  cloudflare: {
    managedAnalyticsInjection: true,
    rumBeaconUrl:
      "https://developers.cloudflare.com/speed/observatory/rum-beacon/",
    webAnalyticsFaqUrl:
      "https://developers.cloudflare.com/web-analytics/faq/",
    customerDpaUrl: "https://www.cloudflare.com/cloudflare-customer-dpa/",
    unsampledRetentionDays: 7,
    longTermAggregatePercentage: 10,
    accessibleHistoryMonths: 6,
  },
} as const satisfies PrivacyPolicyFacts;
