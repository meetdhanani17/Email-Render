import { EmailTemplateNames } from './email-template-names.enum';
import { RequiredAllEnumKeys } from './required-all-enum-keys';

export type EmailTemplatePayload = RequiredAllEnumKeys<
  typeof EmailTemplateNames,
  {
    [EmailTemplateNames.STRIPE_SUCCESS]: {date: string, expiryDate: string, userName: string};
    [EmailTemplateNames.STRIPE_UPDATE]: {};
    [EmailTemplateNames.STRIPE_CANCEL]: {date: string, userName: string};
  }
>;
