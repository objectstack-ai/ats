import type { TranslationData } from '@objectstack/spec/system';

/**
 * 简体中文 (zh-CN) strings for every translatable surface this app authors: the twelve
 * `ats_*` objects (labels, field labels and help, option labels, sections,
 * validation messages, actions), the one app and its three navigation groups,
 * the three dashboards and the five datasets.
 *
 * 简体中文。领域词汇跟随 DESIGN.md，不另造同义词：岗位 · 投递 · 面试 ·
 * Offer · 候选人 · 雇主 · 平台运营 · 求职者 · 人才库 · 招聘看板 · 面试日历 ·
 * 简历收件箱 · 待审队列 · 字典维护 · 平台总览 · 录用转化漏斗 · 公开投递。
 * 审核类否决用「驳回」（岗位审核、资质认证、证书核验），投递被雇主拒绝用「已拒绝」，
 * 候选人拒绝 Offer 用「已婉拒」。技术标记（ADR-0055、F5、F6、`public` /
 * `limited` / `hidden`、job.employer）保持原文。
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
export const zhCN: TranslationData = {
  objects: {
    ats_application: {
      label: '投递',
      pluralLabel: '投递',
      description: '候选人对某个岗位的一次投递，以及它在招聘流程中的推进。',
      fields: {
        display_name: {
          label: '投递',
          help: '写入时自动生成为「<候选人> → <岗位>」。',
        },
        job: {
          label: '岗位',
        },
        candidate: {
          label: '候选人',
        },
        employer: {
          label: '雇主',
          help: '新建时从 job.employer 复制；行级规则以它为键。',
        },
        employer_org: {
          label: '雇主组织',
          help: '雇主的组织 ID，写入时自动盖章。行级策略将它与调用者的组织成员资格比较——谓词不能穿越 employer 查找字段（ADR-0055）。',
        },
        candidate_user: {
          label: '候选人账号',
          help: '候选人的用户 ID，写入时自动盖章。求职者自身的策略据此匹配，无需穿越 candidate 查找字段。',
        },
        stage: {
          label: '阶段',
          options: {
            applied: '已投递',
            screening: '筛选中',
            interview: '面试中',
            offer: 'Offer',
            hired: '已录用',
            rejected: '已拒绝',
            withdrawn: '已撤回',
          },
        },
        source: {
          label: '来源',
          options: {
            direct: '直接投递',
            referral: '内部推荐',
            recommendation: '平台推荐',
            agency: '中介机构',
            import: '导入',
          },
        },
        applied_at: {
          label: '投递时间',
        },
        resume_snapshot: {
          label: '简历（投递时版本）',
          help: '投递那一刻的简历——候选人档案之后可能继续更新。',
        },
        cover_letter: {
          label: '求职信',
        },
        rating: {
          label: '评分',
        },
        rejection_reason: {
          label: '拒绝原因',
          options: {
            not_a_fit: '不匹配',
            insufficient_experience: '经验不足',
            salary_mismatch: '薪资不匹配',
            position_filled: '岗位已招满',
            candidate_withdrew: '候选人已撤回',
            other: '其他',
          },
        },
        last_activity_at: {
          label: '最近活动',
        },
        days_to_offer: {
          label: '到 Offer 天数',
          help: '从投递到本投递第一份 Offer 的整天数。该 Offer 写入时打戳；不可编辑，也不再重算。',
        },
        interview_count: {
          label: '面试次数',
        },
      },
      _validations: {
        application_stage_transitions: {
          message: '无效的投递阶段流转。',
        },
      },
      _views: {
        ats_application: {
          label: '投递',
        },
        all: {
          label: '全部投递',
        },
        pipeline: {
          label: '招聘看板',
        },
        inbox_new: {
          label: '收件箱 · 新投递',
        },
        inbox_screening: {
          label: '收件箱 · 筛选中',
        },
        inbox_interview: {
          label: '收件箱 · 面试中',
        },
        inbox_offer: {
          label: '收件箱 · Offer',
        },
        inbox_hired: {
          label: '收件箱 · 已录用',
        },
        mine: {
          label: '我的投递',
        },
      },
      _sections: {
        application: {
          label: '投递',
        },
      },
    },
    ats_candidate: {
      label: '候选人',
      pluralLabel: '候选人',
      description: '一位求职者，及其技能、经历与证书。',
      fields: {
        full_name: {
          label: '姓名',
        },
        user: {
          label: '账号',
          help: '这份档案所属的登录用户。行级规则以它为键。',
        },
        avatar: {
          label: '照片',
        },
        phone: {
          label: '手机',
        },
        email: {
          label: '邮箱',
        },
        city: {
          label: '城市',
        },
        experience_years: {
          label: '工作年限',
        },
        education: {
          label: '最高学历',
          options: {
            none: '无',
            high_school: '高中',
            associate: '大专',
            bachelor: '本科',
            master: '硕士',
            doctorate: '博士',
          },
        },
        current_title: {
          label: '当前职位',
        },
        current_employer: {
          label: '当前雇主',
        },
        skills: {
          label: '技能',
        },
        summary: {
          label: '个人简介',
        },
        resume_file: {
          label: '简历',
        },
        expected_salary_min: {
          label: '期望薪资（下限）',
        },
        expected_salary_max: {
          label: '期望薪资（上限）',
        },
        salary_period: {
          label: '薪资周期',
          options: {
            monthly: '月薪',
            yearly: '年薪',
            hourly: '时薪',
          },
        },
        seeking_status: {
          label: '求职状态',
          options: {
            actively_looking: '积极求职中',
            open: '可考虑机会',
            not_looking: '暂不求职',
          },
        },
        profile_visibility: {
          label: '档案可见性',
          help: '谁能找到这份档案。`public` 与 `limited` 对所有雇主都可发现，只是呈现方式不同——`public` 会在人才库画廊中展示，`limited` 仅能通过人才库检索找到；这一区分不是安全边界。`hidden` 是强制的：只有该候选人投递过的雇主才能访问这份档案。',
          options: {
            public: '公开',
            limited: '有限（仅可检索）',
            hidden: '隐藏',
          },
        },
      },
      _validations: {
        candidate_salary_range: {
          message: '期望薪资下限不能高于上限。',
        },
      },
      _views: {
        ats_candidate: {
          label: '候选人',
        },
        talent_pool: {
          label: '人才库',
        },
        gallery: {
          label: '画廊',
        },
      },
      _sections: {
        identity: {
          label: '基本信息',
        },
        background: {
          label: '背景经历',
        },
        preferences: {
          label: '求职意向',
        },
        salary: {
          label: '期望薪资',
        },
      },
    },
    ats_candidate_credential: {
      label: '候选人证书',
      pluralLabel: '候选人证书',
      description: '候选人持有的一项证书，含等级、编号与到期日。',
      fields: {
        display_name: {
          label: '证书',
          help: '写入时自动生成为「<证书> · <等级>」。',
        },
        candidate: {
          label: '候选人',
        },
        credential_type: {
          label: '证书类型',
        },
        level: {
          label: '等级',
        },
        certificate_no: {
          label: '证书编号',
        },
        issued_at: {
          label: '发证日期',
        },
        expires_at: {
          label: '到期日期',
        },
        certificate_file: {
          label: '证书文件',
        },
        verification_status: {
          label: '核验状态',
          options: {
            pending: '待核验',
            verified: '已核验',
            rejected: '未通过',
          },
        },
        is_expiring: {
          label: '即将到期',
        },
        expiry_reminded_at: {
          label: '到期提醒已发送',
          help: '到期提醒（F5）上一次通知候选人的时间；下一次提醒间隔 30 天。',
        },
      },
      _validations: {
        credential_verification_transitions: {
          message: '无效的证书核验状态流转。',
        },
      },
      _views: {
        ats_candidate_credential: {
          label: '候选人证书',
        },
        all: {
          label: '全部证书',
        },
      },
    },
    ats_credential_type: {
      label: '证书类型',
      pluralLabel: '证书类型',
      description: '岗位可以要求、候选人可以持有的一种执照或证书。',
      fields: {
        name: {
          label: '证书名称',
        },
        issuer: {
          label: '发证机构',
        },
        description: {
          label: '说明',
        },
        has_levels: {
          label: '分等级',
          help: '该证书是否分等级（如 1–5 级），而不是只有通过/未通过。',
        },
        validity_months: {
          label: '有效期（月）',
          help: '证书的有效时长。驱动复训提醒；永久有效的证书请留空。',
        },
      },
      _views: {
        ats_credential_type: {
          label: '证书类型',
        },
        all: {
          label: '全部证书类型',
        },
      },
    },
    ats_employer: {
      label: '雇主',
      pluralLabel: '雇主',
      description: '在平台入驻的一家用人单位。',
      fields: {
        name: {
          label: '雇主名称',
        },
        short_name: {
          label: '简称',
        },
        logo: {
          label: 'Logo',
        },
        industry: {
          label: '行业',
          options: {
            technology: '科技',
            manufacturing: '制造',
            healthcare: '医疗健康',
            retail: '零售',
            education: '教育',
            finance: '金融',
            logistics: '物流',
            hospitality: '酒店餐饮',
            construction: '建筑',
            other: '其他',
          },
        },
        size: {
          label: '企业规模',
          options: {
            micro: '1–49 人',
            small: '50–199 人',
            medium: '200–999 人',
            large: '1000 人以上',
          },
        },
        city: {
          label: '城市',
        },
        website: {
          label: '网站',
        },
        intro: {
          label: '简介',
        },
        verification_status: {
          label: '资质认证',
          options: {
            draft: '草稿',
            pending: '待审核',
            verified: '已认证',
            rejected: '已驳回',
            suspended: '已停用',
          },
        },
        verification_docs: {
          label: '资质文件',
          help: '营业执照、经营许可或同等证明。',
        },
        verification_note: {
          label: '审核备注',
          help: '审核人员的平台内部备注，不向雇主展示。',
        },
        service_tier: {
          label: '服务档位',
          options: {
            trial: '试用',
            standard: '标准',
            premium: '高级',
          },
        },
        service_expires_at: {
          label: '服务到期日',
        },
        organization: {
          label: '组织',
          help: '承载这家雇主的平台组织。其员工是该组织的成员；所有雇主侧的行级策略都经由它解析。',
        },
        owner: {
          label: '主要联系人',
        },
        can_publish: {
          label: '可发布岗位',
        },
      },
      _validations: {
        employer_verification_transitions: {
          message: '无效的资质认证状态流转。',
        },
      },
      _views: {
        ats_employer: {
          label: '雇主',
        },
        all: {
          label: '全部雇主',
        },
      },
      _sections: {
        company: {
          label: '企业信息',
        },
        verification: {
          label: '资质认证',
        },
        service: {
          label: '服务',
        },
      },
    },
    ats_employer_member: {
      label: '雇主成员',
      pluralLabel: '雇主成员',
      description: '用户在某家雇主中的成员身份及其访问级别。',
      fields: {
        display_name: {
          label: '成员',
          help: '写入时自动生成为「<用户名> · <访问级别>」。',
        },
        employer: {
          label: '雇主',
        },
        employer_org: {
          label: '雇主组织',
          help: '雇主的组织 ID，写入时自动盖章。行级策略将它与调用者的组织成员资格比较——谓词不能穿越 employer 查找字段（ADR-0055）。',
        },
        user: {
          label: '用户',
        },
        access_level: {
          label: '访问级别',
          options: {
            admin: '管理员',
            recruiter: '招聘专员',
            viewer: '只读成员',
          },
        },
        is_active: {
          label: '启用',
        },
      },
    },
    ats_inquiry: {
      label: '公开投递',
      pluralLabel: '公开投递',
      description: '经公开表单提交的匿名投递，等待被转换为候选人和投递。',
      fields: {
        display_name: {
          label: '公开投递',
          help: '写入时自动生成为「<投递人> → <岗位>」，与投递记录同一形态。',
        },
        job: {
          label: '岗位',
          help: '所投递的岗位。只有已发布的岗位接受公开投递（由盖章钩子强制）。',
        },
        full_name: {
          label: '姓名',
        },
        email: {
          label: '邮箱',
          help: '写入时统一转为小写；转换时据此对候选人去重。',
        },
        phone: {
          label: '手机',
        },
        cover_letter: {
          label: '求职信',
        },
        resume: {
          label: '简历',
        },
        employer: {
          label: '雇主',
          help: '新建时从 job.employer 复制；雇主侧策略以下方的组织为键。',
        },
        employer_org: {
          label: '雇主组织',
          help: '岗位所属雇主的组织 ID，写入时自动盖章。行级策略将它与调用者的组织成员资格比较——谓词不能穿越 job 查找字段（ADR-0055）。',
        },
        submitted_at: {
          label: '提交时间',
        },
        status: {
          label: '状态',
          options: {
            new: '待分诊',
            converted: '已转换',
            rejected: '已拒绝',
            spam: '垃圾信息',
          },
        },
        candidate: {
          label: '转换后的候选人',
          help: '由转换写入：这条公开投递生成的候选人，或按邮箱匹配到的既有候选人。',
        },
        application: {
          label: '转换后的投递',
          help: '由转换写入：这条公开投递生成的投递记录。',
        },
        converted_at: {
          label: '转换时间',
        },
      },
      _actions: {
        ats_convert_inquiry: {
          label: '转换为投递',
          description: '创建候选人（或按邮箱匹配既有候选人），并为该岗位建立投递记录。',
          confirmText: '确定转换这条公开投递？将创建候选人（或按邮箱匹配既有候选人），并为该岗位建立一条投递记录。',
          successMessage: '公开投递已转换——投递记录已进入招聘流程。',
        },
        ats_reject_inquiry: {
          label: '拒绝',
          successMessage: '公开投递已拒绝。',
        },
        ats_spam_inquiry: {
          label: '标记为垃圾信息',
          successMessage: '公开投递已标记为垃圾信息。',
        },
      },
      _validations: {
        inquiry_status_transitions: {
          message: '无效的公开投递状态流转。',
        },
      },
      _views: {
        ats_inquiry: {
          label: '公开投递',
        },
        all: {
          label: '全部公开投递',
        },
        inbox: {
          label: '公开投递 · 待分诊',
        },
        apply_public: {
          label: '投递申请',
          description: '告诉雇主你是谁，雇主会通过平台与你联系。',
        },
      },
      _sections: {
        applicant: {
          label: '投递人',
        },
        application: {
          label: '投递',
        },
        triage: {
          label: '分诊',
        },
        apply: {
          label: '你的投递',
        },
      },
    },
    ats_interview: {
      label: '面试',
      pluralLabel: '面试',
      description: '某次投递下已排期的一轮面试及其结果。',
      fields: {
        display_name: {
          label: '面试',
          help: '写入时自动生成为「<候选人> · 第<轮次>轮」。',
        },
        application: {
          label: '投递',
        },
        round: {
          label: '轮次',
        },
        scheduled_at: {
          label: '面试时间',
        },
        duration_minutes: {
          label: '时长（分钟）',
        },
        mode: {
          label: '方式',
          options: {
            onsite: '现场',
            video: '视频',
            phone: '电话',
          },
        },
        location_or_link: {
          label: '地点 / 链接',
        },
        interviewers: {
          label: '面试官',
        },
        status: {
          label: '状态',
          options: {
            scheduled: '已安排',
            completed: '已完成',
            cancelled: '已取消',
            no_show: '未出席',
          },
        },
        rating: {
          label: '评分',
        },
        feedback: {
          label: '面试评价',
        },
        reminder_sent: {
          label: '提醒已发送',
          help: '由面试前 24 小时提醒（F6）在通知候选人与面试官后置位。',
        },
      },
      _validations: {
        interview_status_transitions: {
          message: '无效的面试状态流转。',
        },
      },
      _views: {
        ats_interview: {
          label: '面试',
        },
        all: {
          label: '全部面试',
        },
        calendar: {
          label: '面试日历',
        },
      },
    },
    ats_job: {
      label: '岗位',
      pluralLabel: '岗位',
      description: '雇主正在招聘的一个岗位。',
      fields: {
        title: {
          label: '岗位名称',
        },
        employer: {
          label: '雇主',
        },
        employer_org: {
          label: '雇主组织',
          help: '雇主的组织 ID，写入时自动盖章。行级策略将它与调用者的组织成员资格比较——谓词不能穿越 employer 查找字段（ADR-0055）。',
        },
        department: {
          label: '部门',
        },
        description: {
          label: '岗位描述',
        },
        requirements: {
          label: '任职要求',
        },
        employment_type: {
          label: '用工类型',
          options: {
            full_time: '全职',
            part_time: '兼职',
            contract: '合同工',
            internship: '实习',
            temporary: '临时',
          },
        },
        work_mode: {
          label: '办公方式',
          options: {
            onsite: '现场办公',
            hybrid: '混合办公',
            remote: '远程办公',
          },
        },
        city: {
          label: '城市',
        },
        salary_min: {
          label: '薪资（下限）',
        },
        salary_max: {
          label: '薪资（上限）',
        },
        salary_period: {
          label: '薪资周期',
          options: {
            monthly: '月薪',
            yearly: '年薪',
            hourly: '时薪',
          },
        },
        headcount: {
          label: '招聘人数',
        },
        required_skills: {
          label: '技能要求',
        },
        required_credentials: {
          label: '证书要求',
          help: '候选人必须持有才会被考虑的执照或证书。',
        },
        experience_min_years: {
          label: '最低工作年限',
        },
        education_min: {
          label: '最低学历',
          options: {
            none: '不限',
            high_school: '高中',
            associate: '大专',
            bachelor: '本科',
            master: '硕士',
            doctorate: '博士',
          },
        },
        status: {
          label: '状态',
          options: {
            draft: '草稿',
            pending_review: '待审核',
            published: '已发布',
            paused: '已暂停',
            closed: '已关闭',
            rejected: '已驳回',
          },
        },
        rejection_reason: {
          label: '驳回原因',
          help: '岗位被驳回时回传给雇主。',
        },
        review_note: {
          label: '审核备注',
          help: '审核人员的平台内部备注。对雇主与求职者角色隐藏。',
        },
        is_featured: {
          label: '推荐岗位',
        },
        published_at: {
          label: '发布时间',
        },
        expires_at: {
          label: '截止日期',
        },
        is_open: {
          label: '在招',
        },
      },
      _actions: {
        ats_public_apply_link: {
          label: '公开投递链接',
          description: '打开该岗位的匿名投递表单——分享给应聘者的链接。',
        },
      },
      _validations: {
        job_status_transitions: {
          message: '无效的岗位状态流转。',
        },
        job_salary_range: {
          message: '薪资下限不能高于上限。',
        },
      },
      _views: {
        ats_job: {
          label: '岗位',
        },
        all: {
          label: '全部岗位',
        },
        mine: {
          label: '我的岗位',
        },
        published: {
          label: '已发布岗位',
        },
      },
    },
    ats_offer: {
      label: 'Offer',
      pluralLabel: 'Offer',
      description: '针对某次投递发出的 Offer，及其审批与候选人答复。',
      fields: {
        display_name: {
          label: 'Offer',
          help: '写入时自动生成为「Offer · <候选人> · <岗位>」。',
        },
        application: {
          label: '投递',
        },
        employer: {
          label: '雇主',
          help: '新建时从投递记录复制；行级规则以它为键。',
        },
        employer_org: {
          label: '雇主组织',
          help: '雇主的组织 ID，写入时自动盖章。行级策略将它与调用者的组织成员资格比较——谓词不能穿越 employer 查找字段（ADR-0055）。',
        },
        candidate_user: {
          label: '候选人账号',
          help: '候选人的用户 ID，写入时自动盖章。求职者自身的策略据此匹配，无需穿越 candidate 查找字段。',
        },
        salary: {
          label: '薪资',
        },
        salary_period: {
          label: '薪资周期',
          options: {
            monthly: '月薪',
            yearly: '年薪',
            hourly: '时薪',
          },
        },
        start_date: {
          label: '入职日期',
        },
        status: {
          label: '状态',
          options: {
            draft: '草稿',
            pending_approval: '待审批',
            approved: '已批准',
            sent: '已发出',
            accepted: '已接受',
            declined: '已婉拒',
            withdrawn: '已撤回',
          },
        },
        approved_by: {
          label: '审批人',
        },
        expires_at: {
          label: 'Offer 有效期至',
        },
        notes: {
          label: '备注',
        },
      },
      _validations: {
        offer_status_transitions: {
          message: '无效的 Offer 状态流转。',
        },
      },
    },
    ats_report: {
      label: '举报',
      pluralLabel: '举报',
      description: '用户针对岗位、候选人、投递或雇主提交的举报。',
      fields: {
        subject: {
          label: '主题',
        },
        target_type: {
          label: '举报对象类型',
          options: {
            job: '岗位',
            candidate: '候选人',
            application: '投递',
            employer: '雇主',
          },
        },
        target_ref: {
          label: '被举报记录',
          help: '被举报记录的 ID，属于「举报对象类型」所指的对象。',
        },
        reason: {
          label: '举报原因',
          options: {
            fake_info: '虚假信息',
            harassment: '骚扰',
            spam: '垃圾信息',
            discrimination: '歧视',
            other: '其他',
          },
        },
        description: {
          label: '事情经过',
        },
        reporter: {
          label: '举报人',
        },
        status: {
          label: '状态',
          options: {
            new: '新举报',
            investigating: '处理中',
            resolved: '已处置',
            dismissed: '不予受理',
          },
        },
        resolution: {
          label: '处置结果',
        },
        handled_by: {
          label: '处理人',
        },
      },
      _validations: {
        report_status_transitions: {
          message: '无效的举报状态流转。',
        },
      },
      _views: {
        ats_report: {
          label: '举报',
        },
        all: {
          label: '全部举报',
        },
        open: {
          label: '待处理举报',
        },
      },
    },
    ats_skill: {
      label: '技能',
      pluralLabel: '技能',
      description: '岗位要求与候选人档案共用的技能标签。',
      fields: {
        name: {
          label: '技能',
        },
        category: {
          label: '类别',
          options: {
            technical: '技术',
            domain: '领域',
            tool: '工具',
            language: '语言',
            soft: '软技能',
          },
        },
        aliases: {
          label: '别名',
          help: '逗号分隔的同义写法，搜索任一拼写都能找到这个标签。',
        },
        description: {
          label: '说明',
        },
      },
      _views: {
        ats_skill: {
          label: '技能',
        },
        all: {
          label: '全部技能',
        },
      },
    },
  },
  apps: {
    ats: {
      label: 'ATS',
      description: '招聘平台——平台待审队列、雇主招聘与求职者门户。',
      navigation: {
        grp_platform: {
          label: '平台运营',
        },
        nav_platform_overview: {
          label: '平台总览',
        },
        nav_platform_funnel: {
          label: '录用转化漏斗',
        },
        grp_platform_review_queue: {
          label: '待审队列',
        },
        nav_platform_employers_pending: {
          label: '雇主待审',
        },
        nav_platform_jobs_pending: {
          label: '岗位待审',
        },
        nav_platform_inquiries: {
          label: '公开投递',
        },
        nav_platform_employers: {
          label: '雇主',
        },
        nav_platform_jobs: {
          label: '岗位',
        },
        nav_platform_reports: {
          label: '举报处置',
        },
        grp_platform_dictionaries: {
          label: '字典维护',
        },
        nav_platform_skills: {
          label: '技能',
        },
        nav_platform_credential_types: {
          label: '证书类型',
        },
        grp_hiring: {
          label: '雇主',
        },
        nav_hiring_overview: {
          label: '本机构看板',
        },
        nav_hiring_jobs: {
          label: '岗位',
        },
        nav_hiring_pipeline: {
          label: '招聘看板',
        },
        nav_hiring_inquiries: {
          label: '公开投递',
        },
        grp_hiring_inbox: {
          label: '简历收件箱',
        },
        nav_hiring_inbox_new: {
          label: '新投递',
        },
        nav_hiring_inbox_screening: {
          label: '筛选中',
        },
        nav_hiring_inbox_interview: {
          label: '面试中',
        },
        nav_hiring_inbox_offer: {
          label: 'Offer',
        },
        nav_hiring_inbox_hired: {
          label: '已录用',
        },
        nav_hiring_interviews: {
          label: '面试日历',
        },
        nav_hiring_talent_pool: {
          label: '人才库',
        },
        grp_seeker: {
          label: '求职者',
        },
        nav_seeker_find_jobs: {
          label: '找工作',
        },
        nav_seeker_my_applications: {
          label: '我的投递',
        },
        nav_seeker_my_interviews: {
          label: '我的面试',
        },
        nav_seeker_my_profile: {
          label: '我的档案',
        },
        nav_seeker_my_credentials: {
          label: '我的证书',
        },
      },
    },
  },
  dashboards: {
    ats_employer_hiring: {
      label: '雇主招聘看板',
      description: '本机构的在招岗位、待处理投递、本周面试、平均到 Offer 天数，以及按阶段划分的招聘流程。',
      widgets: {
        open_jobs: {
          title: '在招岗位',
          description: '已发布的岗位。',
        },
        awaiting_action: {
          title: '待处理投递',
          description: '处于「已投递」或「筛选中」阶段。',
        },
        interviews_this_week: {
          title: '本周面试',
          description: '本周一至周日排期的面试轮次，不含已取消。',
        },
        avg_days_to_offer: {
          title: '平均到 Offer 天数',
          description: '本机构已录用投递从投递到第一份 Offer 的平均天数。',
        },
        pipeline_by_stage: {
          title: '各阶段投递',
          description: '本机构处于各阶段的投递，含已退出流程的。',
        },
      },
    },
    ats_hiring_funnel: {
      label: '录用转化漏斗',
      description: '按流程阶段统计的投递，以及不计入漏斗的两种退出。',
      widgets: {
        stage_funnel: {
          title: '流程漏斗',
          description: '当前处于各推进阶段的投递。',
        },
        rejected: {
          title: '已拒绝',
          description: '已退出流程——不是漏斗阶段。',
        },
        withdrawn: {
          title: '已撤回',
          description: '候选人主动撤回——不是漏斗阶段。',
        },
        total_in_funnel: {
          title: '流程中',
          description: '处于五个推进阶段的投递。',
        },
      },
    },
    ats_platform_overview: {
      label: '平台总览',
      description: '雇主数、在招岗位、本月投递、活跃候选人与待审队列。',
      widgets: {
        verified_employers: {
          title: '已认证雇主',
        },
        open_jobs: {
          title: '在招岗位',
          description: '已发布的岗位。',
        },
        applications_this_month: {
          title: '本月投递',
          description: '本月 1 日以来的投递。',
        },
        active_candidates: {
          title: '活跃候选人',
          description: '求职状态不是「暂不求职」的候选人。',
        },
        pending_employers: {
          title: '待审队列 · 雇主',
          description: '等待资质审核的雇主。',
        },
        pending_jobs: {
          title: '待审队列 · 岗位',
          description: '等待发布审核的岗位。',
        },
        applications_per_week: {
          title: '每周投递',
          description: '最近 12 周的投递，按 ISO 周统计。',
        },
      },
    },
  },
  datasets: {
    ats_application_metrics: {
      label: '投递指标',
      description: '按阶段、来源与投递周统计的投递。用组件筛选切片；一个计数度量与平均到 Offer 天数。',
      dimensions: {
        stage: {
          label: '阶段',
        },
        source: {
          label: '来源',
        },
        applied_at: {
          label: '投递周',
        },
      },
      measures: {
        application_count: {
          label: '投递数',
        },
        avg_days_to_offer: {
          label: '平均到 Offer 天数',
        },
      },
    },
    ats_candidate_metrics: {
      label: '候选人指标',
      description: '按求职状态、学历与档案可见性统计的候选人。用组件筛选切片；一个计数度量。',
      dimensions: {
        seeking_status: {
          label: '求职状态',
        },
        education: {
          label: '学历',
        },
        profile_visibility: {
          label: '档案可见性',
        },
      },
      measures: {
        candidate_count: {
          label: '候选人数',
        },
      },
    },
    ats_employer_metrics: {
      label: '雇主指标',
      description: '按资质认证状态、行业与规模统计的雇主。用组件筛选切片；一个计数度量。',
      dimensions: {
        verification_status: {
          label: '资质认证',
        },
        industry: {
          label: '行业',
        },
        size: {
          label: '规模',
        },
      },
      measures: {
        employer_count: {
          label: '雇主数',
        },
      },
    },
    ats_interview_metrics: {
      label: '面试指标',
      description: '按状态、方式与排期周统计的面试轮次。用组件筛选切片；一个计数度量。',
      dimensions: {
        status: {
          label: '状态',
        },
        mode: {
          label: '方式',
        },
        scheduled_at: {
          label: '排期周',
        },
      },
      measures: {
        interview_count: {
          label: '面试数',
        },
      },
    },
    ats_job_metrics: {
      label: '岗位指标',
      description: '按状态、雇主、用工类型与发布月统计的岗位。用组件筛选切片；一个计数度量。',
      dimensions: {
        status: {
          label: '状态',
        },
        employer: {
          label: '雇主',
        },
        employment_type: {
          label: '用工类型',
        },
        published_at: {
          label: '发布月',
        },
      },
      measures: {
        job_count: {
          label: '岗位数',
        },
      },
    },
  },
};
