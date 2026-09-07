import {
  EmployerMemberStampHook,
  JobStampHook,
  ApplicationStampHook,
  InterviewStampHook,
  OfferStampHook,
  OfferTimeToOfferHook,
  CandidateCredentialStampHook,
} from './stamp.hook.js';
import { InquiryStampHook, InquiryConvertHook } from './inquiry.hook.js';

export const allHooks = [
  EmployerMemberStampHook,
  JobStampHook,
  ApplicationStampHook,
  InterviewStampHook,
  OfferStampHook,
  // Writes ats_application.days_to_offer once, on the first offer (stamp.hook.ts).
  OfferTimeToOfferHook,
  CandidateCredentialStampHook,
  // The public application entry: stamps, then the inquiry → candidate +
  // application conversion (inquiry.hook.ts).
  InquiryStampHook,
  InquiryConvertHook,
];
