import type { TranslationData } from '@objectstack/spec/system';

/**
 * English strings for every translatable surface this app authors: the twelve
 * `ats_*` objects (labels, field labels and help, option labels, sections,
 * validation messages, actions), the one app and its three navigation groups,
 * the three dashboards and the five datasets.
 *
 * `en` is the source locale: every inline `label:` in src/ already IS the
 * English text, and the runtime falls back to it. This file restates those
 * strings so the two locale files have the same shape and a translator can
 * diff them line for line. ⚠️ That means a label renamed in an object file
 * must be renamed here too — a stale entry here wins over the source label at
 * runtime, and no gate catches it (coverage counts a key as translated as soon
 * as it exists).
 *
 * Coverage is measured, not asserted: `pnpm lint` runs `objectstack lint
 * --i18n-strict`, which fails on any key this file lacks for a locale in
 * `supportedLocales` (objectstack.config.ts). `npx objectstack i18n check
 * --show-keys` lists the gaps. The Studio's own metadata-form strings are not
 * here on purpose — the platform packages ship those, and lint hides that
 * bucket unless `--include-platform` is passed.
 *
 * Keys are the object / field / option / view / app / dashboard / dataset
 * NAMES, never their labels (`objects.ats_job.fields.status.options.published`).
 * The file follows the source order of the metadata so it can be reviewed
 * side by side with its sibling locale.
 */
export const en: TranslationData = {
  objects: {
    ats_application: {
      label: 'Application',
      pluralLabel: 'Applications',
      description: 'A candidate applying to a job, and its progress through the pipeline.',
      fields: {
        display_name: {
          label: 'Application',
          help: 'Stamped as "<candidate> → <job>" on write.',
        },
        job: {
          label: 'Job',
        },
        candidate: {
          label: 'Candidate',
        },
        employer: {
          label: 'Employer',
          help: 'Copied from job.employer on insert; row-level rules key on it.',
        },
        employer_org: {
          label: 'Employer Organization',
          help: 'Organization id of the employer, stamped on write. Row-level policies compare it to the caller\'s org memberships — a predicate cannot traverse the employer lookup (ADR-0055).',
        },
        candidate_user: {
          label: 'Candidate User',
          help: 'User id of the candidate, stamped on write. Lets the seeker\'s own policy match without traversing the candidate lookup.',
        },
        stage: {
          label: 'Stage',
          options: {
            applied: 'Applied',
            screening: 'Screening',
            interview: 'Interview',
            offer: 'Offer',
            hired: 'Hired',
            rejected: 'Rejected',
            withdrawn: 'Withdrawn',
          },
        },
        source: {
          label: 'Source',
          options: {
            direct: 'Direct',
            referral: 'Referral',
            recommendation: 'Recommendation',
            agency: 'Agency',
            import: 'Import',
          },
        },
        applied_at: {
          label: 'Applied At',
        },
        resume_snapshot: {
          label: 'Résumé (as submitted)',
          help: 'The résumé at the moment of applying — the live profile may move on.',
        },
        cover_letter: {
          label: 'Cover Letter',
        },
        rating: {
          label: 'Rating',
        },
        rejection_reason: {
          label: 'Rejection Reason',
          options: {
            not_a_fit: 'Not a fit',
            insufficient_experience: 'Insufficient experience',
            salary_mismatch: 'Salary mismatch',
            position_filled: 'Position filled',
            candidate_withdrew: 'Candidate withdrew',
            other: 'Other',
          },
        },
        last_activity_at: {
          label: 'Last Activity',
        },
        days_to_offer: {
          label: 'Days to Offer',
          help: 'Whole days from applying to the first offer on this application. Stamped when that offer is inserted; not editable and not recomputed.',
        },
        interview_count: {
          label: 'Interviews',
        },
      },
      _validations: {
        application_stage_transitions: {
          message: 'Invalid application stage transition.',
        },
      },
      _views: {
        ats_application: {
          label: 'Applications',
        },
        all: {
          label: 'All Applications',
        },
        pipeline: {
          label: 'Pipeline',
        },
        inbox_new: {
          label: 'Inbox · New',
        },
        inbox_screening: {
          label: 'Inbox · Screening',
        },
        inbox_interview: {
          label: 'Inbox · Interview',
        },
        inbox_offer: {
          label: 'Inbox · Offer',
        },
        inbox_hired: {
          label: 'Inbox · Hired',
        },
        mine: {
          label: 'My Applications',
        },
      },
      _sections: {
        application: {
          label: 'Application',
        },
      },
    },
    ats_candidate: {
      label: 'Candidate',
      pluralLabel: 'Candidates',
      description: 'A person looking for work, with their skills, history and credentials.',
      fields: {
        full_name: {
          label: 'Full Name',
        },
        user: {
          label: 'Account',
          help: 'The signed-in user this profile belongs to. Row-level rules key on it.',
        },
        avatar: {
          label: 'Photo',
        },
        phone: {
          label: 'Phone',
        },
        email: {
          label: 'Email',
        },
        city: {
          label: 'City',
        },
        experience_years: {
          label: 'Years of Experience',
        },
        education: {
          label: 'Highest Education',
          options: {
            none: 'None',
            high_school: 'High school',
            associate: 'Associate',
            bachelor: 'Bachelor\'s',
            master: 'Master\'s',
            doctorate: 'Doctorate',
          },
        },
        current_title: {
          label: 'Current Title',
        },
        current_employer: {
          label: 'Current Employer',
        },
        skills: {
          label: 'Skills',
        },
        summary: {
          label: 'Summary',
        },
        resume_file: {
          label: 'Résumé',
        },
        expected_salary_min: {
          label: 'Expected Salary (min)',
        },
        expected_salary_max: {
          label: 'Expected Salary (max)',
        },
        salary_period: {
          label: 'Salary Period',
          options: {
            monthly: 'Monthly',
            yearly: 'Yearly',
            hourly: 'Hourly',
          },
        },
        seeking_status: {
          label: 'Seeking Status',
          options: {
            actively_looking: 'Actively looking',
            open: 'Open to offers',
            not_looking: 'Not looking',
          },
        },
        profile_visibility: {
          label: 'Profile Visibility',
          help: 'Who may find this profile. `public` and `limited` are both discoverable by every employer and differ only in presentation — `public` is showcased in the gallery, `limited` is found through the Talent Pool search only; that split is not a security boundary. `hidden` is enforced: the profile is reachable only by employers this candidate has applied to.',
          options: {
            public: 'Public',
            limited: 'Limited (search only)',
            hidden: 'Hidden',
          },
        },
      },
      _validations: {
        candidate_salary_range: {
          message: 'Minimum expected salary cannot exceed the maximum.',
        },
      },
      _views: {
        ats_candidate: {
          label: 'Candidates',
        },
        talent_pool: {
          label: 'Talent Pool',
        },
        gallery: {
          label: 'Gallery',
        },
      },
      _sections: {
        identity: {
          label: 'About You',
        },
        background: {
          label: 'Background',
        },
        preferences: {
          label: 'Job Search',
        },
        salary: {
          label: 'Expected Salary',
        },
      },
    },
    ats_candidate_credential: {
      label: 'Credential',
      pluralLabel: 'Credentials',
      description: 'A credential held by a candidate, with its level, number and expiry.',
      fields: {
        display_name: {
          label: 'Credential',
          help: 'Stamped as "<credential> · <level>" on write.',
        },
        candidate: {
          label: 'Candidate',
        },
        credential_type: {
          label: 'Credential Type',
        },
        level: {
          label: 'Level',
        },
        certificate_no: {
          label: 'Certificate No.',
        },
        issued_at: {
          label: 'Issued',
        },
        expires_at: {
          label: 'Expires',
        },
        certificate_file: {
          label: 'Certificate',
        },
        verification_status: {
          label: 'Verification',
          options: {
            pending: 'Pending',
            verified: 'Verified',
            rejected: 'Rejected',
          },
        },
        is_expiring: {
          label: 'Expiring Soon',
        },
        expiry_reminded_at: {
          label: 'Expiry Reminder Sent',
          help: 'When the expiry reminder (F5) last notified the candidate; the next reminder waits 30 days.',
        },
      },
      _validations: {
        credential_verification_transitions: {
          message: 'Invalid credential verification transition.',
        },
      },
      _views: {
        ats_candidate_credential: {
          label: 'Candidate Credentials',
        },
        all: {
          label: 'All Credentials',
        },
      },
    },
    ats_credential_type: {
      label: 'Credential Type',
      pluralLabel: 'Credential Types',
      description: 'A licence or certificate that a job can require and a candidate can hold.',
      fields: {
        name: {
          label: 'Credential',
        },
        issuer: {
          label: 'Issuing Body',
        },
        description: {
          label: 'Description',
        },
        has_levels: {
          label: 'Has Levels',
          help: 'Whether this credential is graded (e.g. level 1–5) rather than pass/fail.',
        },
        validity_months: {
          label: 'Validity (months)',
          help: 'How long a certificate stays valid. Drives the re-certification reminder; leave empty for credentials that never expire.',
        },
      },
      _views: {
        ats_credential_type: {
          label: 'Credential Types',
        },
        all: {
          label: 'All Credential Types',
        },
      },
    },
    ats_employer: {
      label: 'Employer',
      pluralLabel: 'Employers',
      description: 'A hiring organisation registered on the platform.',
      fields: {
        name: {
          label: 'Employer Name',
        },
        short_name: {
          label: 'Short Name',
        },
        logo: {
          label: 'Logo',
        },
        industry: {
          label: 'Industry',
          options: {
            technology: 'Technology',
            manufacturing: 'Manufacturing',
            healthcare: 'Healthcare',
            retail: 'Retail',
            education: 'Education',
            finance: 'Finance',
            logistics: 'Logistics',
            hospitality: 'Hospitality',
            construction: 'Construction',
            other: 'Other',
          },
        },
        size: {
          label: 'Company Size',
          options: {
            micro: '1–49',
            small: '50–199',
            medium: '200–999',
            large: '1000+',
          },
        },
        city: {
          label: 'City',
        },
        website: {
          label: 'Website',
        },
        intro: {
          label: 'About',
        },
        verification_status: {
          label: 'Verification',
          options: {
            draft: 'Draft',
            pending: 'Pending',
            verified: 'Verified',
            rejected: 'Rejected',
            suspended: 'Suspended',
          },
        },
        verification_docs: {
          label: 'Verification Documents',
          help: 'Business registration, operating licence, or equivalent.',
        },
        verification_note: {
          label: 'Verification Note',
          help: 'Platform-internal note from the reviewer. Not shown to the employer.',
        },
        service_tier: {
          label: 'Service Tier',
          options: {
            trial: 'Trial',
            standard: 'Standard',
            premium: 'Premium',
          },
        },
        service_expires_at: {
          label: 'Service Expires',
        },
        organization: {
          label: 'Organization',
          help: 'Platform organization backing this employer. Its staff are members of it; every employer-side row-level policy resolves through it.',
        },
        owner: {
          label: 'Primary Contact',
        },
        can_publish: {
          label: 'Can Publish',
        },
      },
      _validations: {
        employer_verification_transitions: {
          message: 'Invalid verification status transition.',
        },
      },
      _views: {
        ats_employer: {
          label: 'Employers',
        },
        all: {
          label: 'All Employers',
        },
      },
      _sections: {
        company: {
          label: 'Company',
        },
        verification: {
          label: 'Verification',
        },
        service: {
          label: 'Service',
        },
      },
    },
    ats_employer_member: {
      label: 'Employer Member',
      pluralLabel: 'Employer Members',
      description: 'A user\'s membership in an employer, with their role there.',
      fields: {
        display_name: {
          label: 'Member',
          help: 'Stamped as "<user name> · <access level>" on write.',
        },
        employer: {
          label: 'Employer',
        },
        employer_org: {
          label: 'Employer Organization',
          help: 'Organization id of the employer, stamped on write. Row-level policies compare it to the caller\'s org memberships — a predicate cannot traverse the employer lookup (ADR-0055).',
        },
        user: {
          label: 'User',
        },
        access_level: {
          label: 'Access Level',
          options: {
            admin: 'Admin',
            recruiter: 'Recruiter',
            viewer: 'Viewer',
          },
        },
        is_active: {
          label: 'Active',
        },
      },
    },
    ats_inquiry: {
      label: 'Inquiry',
      pluralLabel: 'Inquiries',
      description: 'An anonymous application submitted through the public form, waiting to be converted into a candidate and an application.',
      fields: {
        display_name: {
          label: 'Inquiry',
          help: 'Stamped as "<applicant> → <job>" on write, the same shape an application carries.',
        },
        job: {
          label: 'Job',
          help: 'The job applied to. Only a published job accepts an inquiry (enforced by the stamp hook).',
        },
        full_name: {
          label: 'Full Name',
        },
        email: {
          label: 'Email',
          help: 'Normalised to lower case on write; conversion de-duplicates candidates on it.',
        },
        phone: {
          label: 'Phone',
        },
        cover_letter: {
          label: 'Cover Letter',
        },
        resume: {
          label: 'Résumé',
        },
        employer: {
          label: 'Employer',
          help: 'Copied from job.employer on insert; the employer-side policies key on the organization below.',
        },
        employer_org: {
          label: 'Employer Organization',
          help: 'Organization id of the job\'s employer, stamped on write. Row-level policies compare it to the caller\'s org memberships — a predicate cannot traverse the job lookup (ADR-0055).',
        },
        submitted_at: {
          label: 'Submitted At',
        },
        status: {
          label: 'Status',
          options: {
            new: 'New',
            converted: 'Converted',
            rejected: 'Rejected',
            spam: 'Spam',
          },
        },
        candidate: {
          label: 'Converted Candidate',
          help: 'Set by conversion: the candidate this inquiry became, or was matched to by e-mail.',
        },
        application: {
          label: 'Converted Application',
          help: 'Set by conversion: the application this inquiry became.',
        },
        converted_at: {
          label: 'Converted At',
        },
      },
      _actions: {
        ats_convert_inquiry: {
          label: 'Convert to Application',
          description: 'Creates the candidate (or matches one by e-mail) and files the application for this job.',
          confirmText: 'Convert this inquiry? A candidate is created (or matched by e-mail) and an application is filed for the job.',
          successMessage: 'Inquiry converted — the application is in the pipeline.',
        },
        ats_reject_inquiry: {
          label: 'Reject',
          successMessage: 'Inquiry rejected.',
        },
        ats_spam_inquiry: {
          label: 'Mark as Spam',
          successMessage: 'Inquiry marked as spam.',
        },
      },
      _validations: {
        inquiry_status_transitions: {
          message: 'Invalid inquiry status transition.',
        },
      },
      _views: {
        ats_inquiry: {
          label: 'Inquiries',
        },
        all: {
          label: 'All Inquiries',
        },
        inbox: {
          label: 'Inquiries · New',
        },
        apply_public: {
          label: 'Apply',
          description: 'Tell the employer who you are. They will be in touch through the platform.',
        },
      },
      _sections: {
        applicant: {
          label: 'Applicant',
        },
        application: {
          label: 'Application',
        },
        triage: {
          label: 'Triage',
        },
        apply: {
          label: 'Your application',
        },
      },
    },
    ats_interview: {
      label: 'Interview',
      pluralLabel: 'Interviews',
      description: 'A scheduled interview round on an application, with its outcome.',
      fields: {
        display_name: {
          label: 'Interview',
          help: 'Stamped as "<candidate> · R<round>" on write.',
        },
        application: {
          label: 'Application',
        },
        round: {
          label: 'Round',
        },
        scheduled_at: {
          label: 'Scheduled At',
        },
        duration_minutes: {
          label: 'Duration (min)',
        },
        mode: {
          label: 'Mode',
          options: {
            onsite: 'On-site',
            video: 'Video',
            phone: 'Phone',
          },
        },
        location_or_link: {
          label: 'Location / Link',
        },
        interviewers: {
          label: 'Interviewers',
        },
        status: {
          label: 'Status',
          options: {
            scheduled: 'Scheduled',
            completed: 'Completed',
            cancelled: 'Cancelled',
            no_show: 'No show',
          },
        },
        rating: {
          label: 'Rating',
        },
        feedback: {
          label: 'Feedback',
        },
        reminder_sent: {
          label: 'Reminder Sent',
          help: 'Set by the T-24h interview reminder (F6) once the candidate and interviewers have been notified.',
        },
      },
      _validations: {
        interview_status_transitions: {
          message: 'Invalid interview status transition.',
        },
      },
      _views: {
        ats_interview: {
          label: 'Interviews',
        },
        all: {
          label: 'All Interviews',
        },
        calendar: {
          label: 'Interview Calendar',
        },
      },
    },
    ats_job: {
      label: 'Job',
      pluralLabel: 'Jobs',
      description: 'A position an employer is hiring for.',
      fields: {
        title: {
          label: 'Job Title',
        },
        employer: {
          label: 'Employer',
        },
        employer_org: {
          label: 'Employer Organization',
          help: 'Organization id of the employer, stamped on write. Row-level policies compare it to the caller\'s org memberships — a predicate cannot traverse the employer lookup (ADR-0055).',
        },
        department: {
          label: 'Department',
        },
        description: {
          label: 'Description',
        },
        requirements: {
          label: 'Requirements',
        },
        employment_type: {
          label: 'Employment Type',
          options: {
            full_time: 'Full-time',
            part_time: 'Part-time',
            contract: 'Contract',
            internship: 'Internship',
            temporary: 'Temporary',
          },
        },
        work_mode: {
          label: 'Work Mode',
          options: {
            onsite: 'On-site',
            hybrid: 'Hybrid',
            remote: 'Remote',
          },
        },
        city: {
          label: 'City',
        },
        salary_min: {
          label: 'Salary (min)',
        },
        salary_max: {
          label: 'Salary (max)',
        },
        salary_period: {
          label: 'Salary Period',
          options: {
            monthly: 'Monthly',
            yearly: 'Yearly',
            hourly: 'Hourly',
          },
        },
        headcount: {
          label: 'Openings',
        },
        required_skills: {
          label: 'Required Skills',
        },
        required_credentials: {
          label: 'Required Credentials',
          help: 'Licences or certificates a candidate must hold to be considered.',
        },
        experience_min_years: {
          label: 'Min. Experience (years)',
        },
        education_min: {
          label: 'Min. Education',
          options: {
            none: 'None required',
            high_school: 'High school',
            associate: 'Associate',
            bachelor: 'Bachelor\'s',
            master: 'Master\'s',
            doctorate: 'Doctorate',
          },
        },
        status: {
          label: 'Status',
          options: {
            draft: 'Draft',
            pending_review: 'Pending Review',
            published: 'Published',
            paused: 'Paused',
            closed: 'Closed',
            rejected: 'Rejected',
          },
        },
        rejection_reason: {
          label: 'Rejection Reason',
          help: 'Returned to the employer when a job is rejected.',
        },
        review_note: {
          label: 'Review Note',
          help: 'Platform-internal reviewer note. Hidden from employer and seeker roles.',
        },
        is_featured: {
          label: 'Featured',
        },
        published_at: {
          label: 'Published At',
        },
        expires_at: {
          label: 'Expires',
        },
        is_open: {
          label: 'Open',
        },
      },
      _actions: {
        ats_public_apply_link: {
          label: 'Public Apply Link',
          description: 'Open the anonymous application form for this job — the link to share with applicants.',
        },
      },
      _validations: {
        job_status_transitions: {
          message: 'Invalid job status transition.',
        },
        job_salary_range: {
          message: 'Minimum salary cannot exceed maximum salary.',
        },
      },
      _views: {
        ats_job: {
          label: 'Jobs',
        },
        all: {
          label: 'All Jobs',
        },
        mine: {
          label: 'My Jobs',
        },
        published: {
          label: 'Published Jobs',
        },
      },
    },
    ats_offer: {
      label: 'Offer',
      pluralLabel: 'Offers',
      description: 'An offer extended on an application, with its approval and response.',
      fields: {
        display_name: {
          label: 'Offer',
          help: 'Stamped as "Offer · <candidate> · <job>" on write.',
        },
        application: {
          label: 'Application',
        },
        employer: {
          label: 'Employer',
          help: 'Copied from the application on insert; row-level rules key on it.',
        },
        employer_org: {
          label: 'Employer Organization',
          help: 'Organization id of the employer, stamped on write. Row-level policies compare it to the caller\'s org memberships — a predicate cannot traverse the employer lookup (ADR-0055).',
        },
        candidate_user: {
          label: 'Candidate User',
          help: 'User id of the candidate, stamped on write. Lets the seeker\'s own policy match without traversing the candidate lookup.',
        },
        salary: {
          label: 'Salary',
        },
        salary_period: {
          label: 'Salary Period',
          options: {
            monthly: 'Monthly',
            yearly: 'Yearly',
            hourly: 'Hourly',
          },
        },
        start_date: {
          label: 'Start Date',
        },
        status: {
          label: 'Status',
          options: {
            draft: 'Draft',
            pending_approval: 'Pending approval',
            approved: 'Approved',
            sent: 'Sent',
            accepted: 'Accepted',
            declined: 'Declined',
            withdrawn: 'Withdrawn',
          },
        },
        approved_by: {
          label: 'Approved By',
        },
        expires_at: {
          label: 'Offer Expires',
        },
        notes: {
          label: 'Notes',
        },
      },
      _validations: {
        offer_status_transitions: {
          message: 'Invalid offer status transition.',
        },
      },
    },
    ats_report: {
      label: 'Report',
      pluralLabel: 'Reports',
      description: 'A user-submitted report about a job, candidate, application or employer.',
      fields: {
        subject: {
          label: 'Subject',
        },
        target_type: {
          label: 'Target Type',
          options: {
            job: 'Job',
            candidate: 'Candidate',
            application: 'Application',
            employer: 'Employer',
          },
        },
        target_ref: {
          label: 'Target Record',
          help: 'Id of the reported record, within the object named by target_type.',
        },
        reason: {
          label: 'Reason',
          options: {
            fake_info: 'False information',
            harassment: 'Harassment',
            spam: 'Spam',
            discrimination: 'Discrimination',
            other: 'Other',
          },
        },
        description: {
          label: 'What happened',
        },
        reporter: {
          label: 'Reported By',
        },
        status: {
          label: 'Status',
          options: {
            new: 'New',
            investigating: 'Investigating',
            resolved: 'Resolved',
            dismissed: 'Dismissed',
          },
        },
        resolution: {
          label: 'Resolution',
        },
        handled_by: {
          label: 'Handled By',
        },
      },
      _validations: {
        report_status_transitions: {
          message: 'Invalid report status transition.',
        },
      },
      _views: {
        ats_report: {
          label: 'Reports',
        },
        all: {
          label: 'All Reports',
        },
        open: {
          label: 'Open Reports',
        },
      },
    },
    ats_skill: {
      label: 'Skill',
      pluralLabel: 'Skills',
      description: 'A skill tag shared by job requirements and candidate profiles.',
      fields: {
        name: {
          label: 'Skill',
        },
        category: {
          label: 'Category',
          options: {
            technical: 'Technical',
            domain: 'Domain',
            tool: 'Tool',
            language: 'Language',
            soft: 'Soft Skill',
          },
        },
        aliases: {
          label: 'Aliases',
          help: 'Comma-separated synonyms, so a search for one spelling finds the tag.',
        },
        description: {
          label: 'Description',
        },
      },
      _views: {
        ats_skill: {
          label: 'Skills',
        },
        all: {
          label: 'All Skills',
        },
      },
    },
  },
  apps: {
    ats: {
      label: 'ATS',
      description: 'Recruiting marketplace — platform review queues, employer hiring, and the job seeker portal.',
      navigation: {
        grp_platform: {
          label: 'Platform',
        },
        nav_platform_overview: {
          label: 'Platform Overview',
        },
        nav_platform_funnel: {
          label: 'Hiring Funnel',
        },
        grp_platform_review_queue: {
          label: 'Review Queue',
        },
        nav_platform_employers_pending: {
          label: 'Employers Pending',
        },
        nav_platform_jobs_pending: {
          label: 'Jobs Pending',
        },
        nav_platform_inquiries: {
          label: 'Inquiries',
        },
        nav_platform_employers: {
          label: 'Employers',
        },
        nav_platform_jobs: {
          label: 'Jobs',
        },
        nav_platform_reports: {
          label: 'Reports',
        },
        grp_platform_dictionaries: {
          label: 'Dictionaries',
        },
        nav_platform_skills: {
          label: 'Skills',
        },
        nav_platform_credential_types: {
          label: 'Credential Types',
        },
        grp_hiring: {
          label: 'Hiring',
        },
        nav_hiring_overview: {
          label: 'Hiring Overview',
        },
        nav_hiring_jobs: {
          label: 'Jobs',
        },
        nav_hiring_pipeline: {
          label: 'Pipeline',
        },
        nav_hiring_inquiries: {
          label: 'Inquiries',
        },
        grp_hiring_inbox: {
          label: 'Inbox',
        },
        nav_hiring_inbox_new: {
          label: 'New',
        },
        nav_hiring_inbox_screening: {
          label: 'Screening',
        },
        nav_hiring_inbox_interview: {
          label: 'Interview',
        },
        nav_hiring_inbox_offer: {
          label: 'Offer',
        },
        nav_hiring_inbox_hired: {
          label: 'Hired',
        },
        nav_hiring_interviews: {
          label: 'Interviews',
        },
        nav_hiring_talent_pool: {
          label: 'Talent Pool',
        },
        grp_seeker: {
          label: 'Job Seeker',
        },
        nav_seeker_find_jobs: {
          label: 'Find Jobs',
        },
        nav_seeker_my_applications: {
          label: 'My Applications',
        },
        nav_seeker_my_interviews: {
          label: 'My Interviews',
        },
        nav_seeker_my_profile: {
          label: 'My Profile',
        },
        nav_seeker_my_credentials: {
          label: 'My Credentials',
        },
      },
    },
  },
  dashboards: {
    ats_employer_hiring: {
      label: 'Hiring Overview',
      description: 'Your open jobs, applications awaiting action, interviews this week, average days to offer and the pipeline by stage.',
      widgets: {
        open_jobs: {
          title: 'Open Jobs',
          description: 'Published jobs.',
        },
        awaiting_action: {
          title: 'Applications Awaiting Action',
          description: 'In "applied" or "screening".',
        },
        interviews_this_week: {
          title: 'Interviews This Week',
          description: 'Rounds scheduled Monday to Sunday, cancelled ones excluded.',
        },
        avg_days_to_offer: {
          title: 'Average Days to Offer',
          description: 'Applied to first offer, over your hired applications.',
        },
        pipeline_by_stage: {
          title: 'Pipeline by Stage',
          description: 'Your applications in each stage, exits included.',
        },
      },
    },
    ats_hiring_funnel: {
      label: 'Hiring Funnel',
      description: 'Applications by pipeline stage, and the two exits kept out of the funnel.',
      widgets: {
        stage_funnel: {
          title: 'Pipeline Funnel',
          description: 'Applications currently in each progressing stage.',
        },
        rejected: {
          title: 'Rejected',
          description: 'Exited the pipeline — not a funnel stage.',
        },
        withdrawn: {
          title: 'Withdrawn',
          description: 'Candidate withdrew — not a funnel stage.',
        },
        total_in_funnel: {
          title: 'In Pipeline',
          description: 'Applications in the five progressing stages.',
        },
      },
    },
    ats_platform_overview: {
      label: 'Platform Overview',
      description: 'Employers, open jobs, applications this month, active candidates and the review queue.',
      widgets: {
        verified_employers: {
          title: 'Verified Employers',
        },
        open_jobs: {
          title: 'Open Jobs',
          description: 'Published jobs.',
        },
        applications_this_month: {
          title: 'Applications This Month',
          description: 'Applied since the 1st of this month.',
        },
        active_candidates: {
          title: 'Active Candidates',
          description: 'Seeking status other than "not looking".',
        },
        pending_employers: {
          title: 'Review Queue · Employers',
          description: 'Employers awaiting verification.',
        },
        pending_jobs: {
          title: 'Review Queue · Jobs',
          description: 'Jobs awaiting publication review.',
        },
        applications_per_week: {
          title: 'Applications per Week',
          description: 'Applications filed in the last 12 weeks, by ISO week.',
        },
      },
    },
  },
  datasets: {
    ats_application_metrics: {
      label: 'Application Metrics',
      description: 'Applications by stage, source and week applied. Slice with a widget filter; a count and the average days to offer.',
      dimensions: {
        stage: {
          label: 'Stage',
        },
        source: {
          label: 'Source',
        },
        applied_at: {
          label: 'Week Applied',
        },
      },
      measures: {
        application_count: {
          label: 'Applications',
        },
        avg_days_to_offer: {
          label: 'Avg Days to Offer',
        },
      },
    },
    ats_candidate_metrics: {
      label: 'Candidate Metrics',
      description: 'Candidates by seeking status, education and profile visibility. Slice with a widget filter; one count measure.',
      dimensions: {
        seeking_status: {
          label: 'Seeking Status',
        },
        education: {
          label: 'Education',
        },
        profile_visibility: {
          label: 'Profile Visibility',
        },
      },
      measures: {
        candidate_count: {
          label: 'Candidates',
        },
      },
    },
    ats_employer_metrics: {
      label: 'Employer Metrics',
      description: 'Employers by verification status, industry and size. Slice with a widget filter; one count measure.',
      dimensions: {
        verification_status: {
          label: 'Verification',
        },
        industry: {
          label: 'Industry',
        },
        size: {
          label: 'Size',
        },
      },
      measures: {
        employer_count: {
          label: 'Employers',
        },
      },
    },
    ats_interview_metrics: {
      label: 'Interview Metrics',
      description: 'Interview rounds by status, mode and week scheduled. Slice with a widget filter; one count measure.',
      dimensions: {
        status: {
          label: 'Status',
        },
        mode: {
          label: 'Mode',
        },
        scheduled_at: {
          label: 'Week Scheduled',
        },
      },
      measures: {
        interview_count: {
          label: 'Interviews',
        },
      },
    },
    ats_job_metrics: {
      label: 'Job Metrics',
      description: 'Jobs by status, employer, employment type and month published. Slice with a widget filter; one count measure.',
      dimensions: {
        status: {
          label: 'Status',
        },
        employer: {
          label: 'Employer',
        },
        employment_type: {
          label: 'Employment Type',
        },
        published_at: {
          label: 'Month Published',
        },
      },
      measures: {
        job_count: {
          label: 'Jobs',
        },
      },
    },
  },
};
