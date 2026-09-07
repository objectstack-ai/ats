import {
  EmployerMemberStampHook,
  JobStampHook,
  ApplicationStampHook,
  InterviewStampHook,
  OfferStampHook,
  CandidateCredentialStampHook,
} from './stamp.hook.js';
import { InquiryStampHook, InquiryConvertHook } from './inquiry.hook.js';

export const allHooks = [
  EmployerMemberStampHook,
  JobStampHook,
  ApplicationStampHook,
  InterviewStampHook,
  OfferStampHook,
  CandidateCredentialStampHook,
  // The public application entry: stamps, then the inquiry → candidate +
  // application conversion (inquiry.hook.ts).
  InquiryStampHook,
  InquiryConvertHook,
];
