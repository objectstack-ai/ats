# ATS — 设计蓝图

> 本文是架构权威：对象、隔离模型、受众端、自动化、里程碑。改设计先改这里，再改代码。
> 派发循环（`AGENTS.md` → PM dispatch）把它当作 ADR 目录使用：一个卡片与本文冲突时，本文胜出，或者先在这里落一条修订。

## 01 定位与边界

**平台型招聘，不是单企业 ATS。** 多雇主入驻、候选人求职、平台方治理。

| 类型 | 谁在用 | 代表 | 本项目 |
|---|---|---|---|
| 单企业 ATS | 一家公司的 HR，管自己的招聘 | Greenhouse · Lever · Moka | 否 |
| **平台型招聘** | 平台方运营，多雇主入驻，候选人求职 | BOSS 直聘 · 前程无忧 | **是** |

选平台型的理由：开源里几乎空白；只入驻一个雇主它就退化为单企业 ATS；它正好压在 ObjectStack 的强项上（跨租户 RLS、审批链、审计、一套元数据三个受众端）。

**范围内**：岗位发布与审核 · 投递与阶段流转 · 面试排期与评价 · Offer 与审批 · 候选人档案与持证 · 人才库检索 · 举报与处置 · 平台治理与看板。
**范围外**：课程/考试（LMS）· IM 与社区 · 直播 · 支付 · 薪酬绩效与人事档案 · 简历解析与匹配算法。

**命名纪律**：对象名、字段名、选项值一律通用，**零行业词汇**。行业特征只进种子数据 —— 换一套 seed 就是另一个行业的版本。

## 02 对象模型

前缀 `ats_`（Applicant Tracking System）。11 个对象，三个域，各对应一个受众端。

```
雇主域                      招聘事务域                   候选人域
ats_employer   [private]    ats_application [private]    ats_candidate            [private]
ats_employer_member [MD]    ats_interview   [MD]         ats_candidate_credential [MD]
ats_job        [public_read] ats_offer      [private]    ats_skill                [public_read]
                            ats_report      [private]    ats_credential_type      [public_read]
```

`[MD]` = master-detail 子对象，`sharingModel: 'controlled_by_parent'`。

### 字段清单

`*` = required；_斜体_ = 受字段级安全约束。枚举值即机器值。

| 对象 | 字段 |
|---|---|
| `ats_employer` `private` | name* · short_name · logo · industry `technology/manufacturing/healthcare/retail/education/finance/logistics/hospitality/construction/other` · size `micro/small/medium/large` · city · website · intro richtext · **verification_status** `draft/pending/verified/rejected/suspended` · verification_docs file×n · _verification_note_（仅平台角色）· service_tier `trial/standard/premium` · service_expires_at · owner user · can_publish formula |
| `ats_employer_member` `by parent` | display_name（存储镜像 "<user> · <access level>"，nameField）· employer* MD cascade inlineEdit grid · user* · access_level `admin/recruiter/viewer` · is_active |
| `ats_job` `public_read` | title* · employer* lookup · department · description richtext · requirements richtext · employment_type `full_time/part_time/contract/internship/temporary` · work_mode `onsite/hybrid/remote` · city · salary_min / salary_max currency · salary_period `monthly/yearly/hourly` · headcount · required_skills lookup×n · required_credentials lookup×n · experience_min_years · education_min `none/high_school/associate/bachelor/master/doctorate` · **status** `draft/pending_review/published/paused/closed/rejected` · rejection_reason · _review_note_（仅平台角色）· is_featured · published_at · expires_at · is_open formula |
| `ats_candidate` `private` | full_name* · user · avatar · _phone_ · _email_ · city · experience_years · education（同 job.education_min）· current_title · current_employer · skills lookup×n · summary · resume_file · _expected_salary_min / max_ · salary_period · seeking_status `actively_looking/open/not_looking` · profile_visibility `public/limited/hidden` |
| `ats_candidate_credential` `by parent` | display_name（镜像 "<credential> · <level>"）· candidate* MD cascade · credential_type* lookup · level · certificate_no · issued_at · expires_at · certificate_file · verification_status `pending/verified/rejected` · is_expiring formula（90 天内到期）|
| `ats_application` `private` | display_name（镜像 "<candidate> → <job>"）· job* · candidate* · employer lookup（RLS 冗余，beforeInsert 自 job 复制）· **stage*** `applied/screening/interview/offer/hired/rejected/withdrawn` · source `direct/referral/recommendation/agency/import` · applied_at · resume_snapshot · cover_letter · rating slider 1–5 · rejection_reason `not_a_fit/insufficient_experience/salary_mismatch/position_filled/candidate_withdrew/other` · last_activity_at。唯一索引 `(job, candidate)` scope organization |
| `ats_interview` `by parent` | display_name（镜像 "<candidate> · R<round>"）· application* MD cascade · round · scheduled_at* datetime · duration_minutes · mode `onsite/video/phone` · location_or_link · interviewers user×n · status `scheduled/completed/cancelled/no_show` · rating · feedback |
| `ats_offer` `private` | display_name · application* · employer lookup（RLS 冗余）· salary currency · salary_period · start_date · **status** `draft/pending_approval/approved/sent/accepted/declined/withdrawn` · approved_by user · expires_at · notes |
| `ats_report` `private` | subject* · target_type* `job/candidate/application/employer` · target_ref* · reason `fake_info/harassment/spam/discrimination/other` · description · reporter user · status `new/investigating/resolved/dismissed` · resolution · handled_by user |
| `ats_skill` `public_read` | name* · category `technical/domain/tool/language/soft` · aliases · description |
| `ats_credential_type` `public_read` | name* · issuer · description · has_levels · validity_months |

### 状态机（写入层强制，非前端隐藏）

- `ats_employer.verification_status`：draft→pending；pending→verified/rejected；verified→suspended；rejected→pending；suspended→verified
- `ats_job.status`：draft→pending_review；pending_review→published/rejected；published→paused/closed；paused→published/closed；rejected→draft/pending_review；closed 终态
- `ats_application.stage`：applied→screening/rejected/withdrawn；screening→interview/rejected/withdrawn；interview→offer/rejected/withdrawn；offer→hired/rejected/withdrawn；hired/rejected/withdrawn 终态
- `ats_offer.status`：draft→pending_approval/withdrawn；pending_approval→approved/draft；approved→sent/withdrawn；sent→accepted/declined/withdrawn；accepted/declined/withdrawn 终态
- `ats_report.status`：new→investigating/dismissed；investigating→resolved/dismissed；resolved/dismissed 终态

### 两个刻意的取舍

- **没有「人才库」对象。** 人才库是 `ats_candidate` 上的筛选视图；多一个对象只会制造两份真相。
- **`ats_credential_type` 进核心。** "持证上岗 + 到期复训"在护理、电工、消防、金融、特种作业都是硬需求，是国外开源 ATS 普遍缺的一块，也是本项目的真实差异点。

### 与首版蓝图的修订

- `ats_employer_member.member_role` → **`access_level`**：`role` 是平台保留词（ADR-0090 D3，`security-role-word`）。
- 无自然标题的对象（member / credential / application / interview / offer）统一加**存储的 `display_name` 镜像**作 `nameField`：镜像必须是存储字段而非 formula（objectstack-data §Search Fields）。
- `ats_job.application_count` **暂不做**：`summary` 汇总走 master-detail，而 application→job 是 lookup；数量由 #13 的 analytics dataset 计算。
- `ats_report` 增加 `subject*` 作标题。

## 03 隔离模型

多雇主平台的核心风险只有一条：A 雇主看到 B 雇主的候选人。

| 强度 | 对象 | 机制 |
|---|---|---|
| **硬隔离** | candidate · application · offer · employer · report | `private` + `readScope: 'org'` + RLS。雇主侧经 `employer_org IN (current_user.accessible_org_ids)` 判定；求职者侧按 `user` / `candidate_user` 自持。越权可读即事故。 |
| **软过滤** | job | `public_read` + 视图过滤 + FLS。岗位终将公开；草稿/待审靠列表条件与 App 导航隐藏，`review_note` 靠 FLS。**刻意降级，非遗漏**（见 08 Q1）。 |
| 公开字典 | skill · credential_type | `public_read`，写权限仅平台角色。 |

### 雇主身份怎么传给 RLS —— 裁决记录（2026-09-06）

**雇主 = 平台组织。** 每个雇主对应一个 organization，其员工是该组织成员；雇主侧对象上反范式一个 `employer_org` 标量，谓词写 `employer_org IN (current_user.accessible_org_ids)`。

**为什么不能按原设计"经 `ats_employer_member` 判定"**：RLS 谓词是 canonical CEL，只能把**字段**与 `current_user.*` 占位符比较，**跨对象 traversal 是编译错误**（ADR-0055）。"当前用户是不是这行雇主的成员"表达不了。可用占位符仅 `id` / `email` / `organization_id` / `accessible_org_ids` / `org_user_ids` / `positions`。

**为什么用 `accessible_org_ids` 而不是 `organization_id`**：前者是调用者的**全部**组织成员集（ADR-0105 D2），一个服务两家雇主的招聘顾问无需切换上下文即可同时看到两边；无有效成员资格解析为空集，谓词 fail-closed 到零行，绝不 fail-open。

**为什么当时判断「对象不开 `tenancy`」**：那道 Layer 0 墙按组织判定，会连带把求职者**自己的投递**也挡住 —— 求职者不是任何雇主组织的成员。业务 RLS 允许两类受众对同一批行各带各的策略，这才是 marketplace 的形状。

> ⚠️ **这句话在 2026-09-07 被修订为「按对象划分」，不再是「全都不开」。** 见下方《租户墙划分契约》—— Layer 0 墙对 `tenancy: { enabled: false }` 的对象**有豁免**，所以正确做法是分类，不是一刀切。

**组合顺序（关键）**：OWD `private` 定基线 → `readScope: 'org'` 把 owner 匹配放宽到组织范围 → RLS 收窄到真正的雇主。只给 `allowRead` 不给 `readScope`，招聘专员将只能看到自己创建的记录 —— 那不是 marketplace，是一堆私人收件箱。

**遗留的运维前提**：雇主入驻时需创建对应 organization 并把员工加为成员（`sys_organization` / `sys_member`）。M1 由种子数据承担，正式流程挂在 F1 机构资质审核通过之后 —— 已记入卡 11。

### ⚠️ 现状：`accessible_org_ids` 在 RLS 里解析不出来（2026-09-07）

**上面这套雇主侧谓词今天是失效的。**平台的 `RLSUserContext`（`plugin-security/src/rls-compiler.ts:43`）只声明
`id` / `organization_id` / `positions` / `org_user_ids` / `email`，**从不把 `accessible_org_ids` 填进去**；
而它又在 `RESERVED_RLS_MEMBERSHIP_KEYS` 里，应用侧的 membership resolver 被禁止提供它
（ADR-0105 D11 的原话是「core-resolved, not an app resolver」）。

变量解析不出 → 策略被丢弃 → `RLS_DENY_FILTER` → **静默返回零行，不报错**。

后果：`permission-sets.ts` 里**每一条**雇主侧策略对非平台角色都 fail-closed。平台角色不受影响，
因为它们持 `viewAllRecords`（读旁路）。已上报 [objectstack#16518](https://github.com/objectstack-ai/objectstack/issues/16518)，
本仓库跟踪于 #18。**改 CEL 拼写修不好它** —— 规范写法和 SQL 桥接写法都一样解析不出。

在它解决前：雇主侧的隔离是**已声明未生效**状态，任何以雇主身份的演示都会看到空列表。

### 租户墙划分契约（2026-09-07 裁决）

平台的单库多租户是**按企业 SaaS 设计的**：租户 = 组织，进去只看自己的数据。
市场型应用比它多两样东西 —— 一个跨墙可读的公共面（岗位），和**联合归属**的记录（一条申请同时属于求职者和雇主）。

Layer 0 墙不是全有全无的。`plugin-security/src/security-plugin.ts:2940` 明确列出豁免：
`tenancy.enabled:false` 的平台全局对象、没有 `organization_id` 列的对象、平台管理员、以及整个 `single` posture，
**在墙这一层全部产出 `null`，不受影响**。所以正确形态是按对象划分：

| 分类 | 对象 | 隔离由谁承担 |
|---|---|---|
| **进墙**（`tenancy` 开启） | `ats_employer` · `ats_employer_member` · `ats_interview` · `ats_offer` | Layer 0 引擎级墙 + RLS |
| **平台全局**（`tenancy: { enabled: false }`） | `ats_candidate` · `ats_candidate_credential` · `ats_skill` · `ats_credential_type` · `ats_report` | 仅 RLS |
| **平台全局 · 联合归属** | `ats_application` · `ats_job` | 仅 RLS：雇主侧按 `employer_org`，求职者侧按 `candidate_user` / 本人 |

`ats_application` 是唯一需要论证的一格：它同时属于求职者和雇主，而企业 SaaS 租户模型假设「每行恰好属于一个租户」。
让它出墙、隔离交给 Layer 1，是唯一能同时满足两侧的方案。

**这个划分是前向兼容的契约，不只是当下的权宜：**

- **今天（`single` posture，墙惰性）** —— 划分成立，求职者靠本人级规则访问自己的数据（这类规则不依赖
  `accessible_org_ids`，**今天就能工作**）。
- **墙立起来之后**（objectstack #16215 开源多组织包 + #16137 接通 serve 挂载）—— **同一套划分不用改**。
  进墙的对象额外获得引擎级隔离（强于 RLS），出墙的对象继续可被求职者访问。

⛔ 因此**不要**为了让种子写入通过而发明一个「平台组织」来持有候选人等行。那在今天只是个语义谎言，
墙立起来之后会变成一堵真墙，把候选人锁进一个谁都不该属于的租户里；而任何 `sys_member` 行把用户接进那个组织，
就能通过组织范围规则读到全部候选人。**用 `tenancy: { enabled: false }` 说实话。**

### 自助入驻的现状与到期条件（2026-09-07）

**求职者**：能自助注册，但需要两个配置动作，默认都是关的 ——
`audience.posture` 从默认的 `invite_only` 改为 `open` 或 `email_domain`（否则 `SELF_REGISTRATION_CLOSED`），
且 `membershipPolicy` 必须是 **`invite-only`**（不自动绑组织）。
⛔ 不要用 `auto`：那会把所有求职者绑进同一个默认组织，等于给他们一个共同的组织身份，
而组织在这个平台里是隔离边界。**求职者不属于任何组织是正确状态，不是待修的缺陷。**

**雇主**：今天**无法自助注册**。组织创建路由的裁判是生效的 tenancy posture
（`auth-manager.ts` 的 `beforeCreateOrganization`：`if (!this.multiOrgPostureEffective())` → FORBIDDEN），
理由是在没有墙的部署上创建组织等于铸造一个无人守卫的边界。
所以当前每个雇主组织只能由种子或运维带外创建。

**到期条件**：这是暂时的，不是永久约束。#16215 + #16137 落地后开源部署能带墙启动，
`multiOrgPostureEffective()` 为真，雇主自助注册随之打通 —— 届时 F1 机构资质审核才能接上真实的入驻流程。

### 角色与权限矩阵

五个 position ↔ 五个 permission set。R 读 · C 建 · U 改 · D 删；括号内为行级作用域。

| 对象 | platform_admin | platform_ops | employer_admin | employer_recruiter | job_seeker |
|---|---|---|---|---|---|
| ats_employer | RCUD | RU（审核字段）| RU（本机构）| R（本机构）| R（仅 verified）|
| ats_employer_member | RCUD | R | RCUD（本机构）| R（本机构）| — |
| ats_job | RCUD | RU（审核字段）| RCU（本机构）| RCU（本机构）| R（仅 published）|
| ats_candidate | RCUD | R | R（投递过本机构）| R（投递过本机构）| RCU（本人）|
| ats_application | RCUD | R | RU（本机构）| RU（本机构）| RC（本人）|
| ats_interview | RCUD | R | RCUD（本机构）| RCU（本机构）| R（本人）|
| ats_offer | RCUD | R | RCU（本机构·审批人）| RC（本机构·提交）| RU（本人·接受/拒绝）|
| ats_candidate_credential | RCUD | RU（核验）| R（随候选人）| R（随候选人）| RCUD（本人）|
| ats_report | RCUD | RU（处置）| C | C | C |
| ats_skill · ats_credential_type | RCUD | RCU | R | R | R |

### 字段级安全

| 字段 | 对谁遮蔽 | 理由 |
|---|---|---|
| `ats_candidate.phone / email` | employer_recruiter | 最易被批量抓取；仅 employer_admin 可见，读取落审计 |
| `ats_candidate.expected_salary_*` | employer_admin · employer_recruiter | 期望薪资先于议价暴露损害候选人；候选人可经 `profile_visibility` 自主放开 |
| `ats_job.review_note` · `ats_employer.verification_note` | 所有雇主侧与求职者角色 | 平台内部意见，驳回理由走独立字段回传 |

## 04 视图与三端

同一套对象元数据，三个 App 靠 `requiredPermissions` 与导航门控切分。

| App | 导航 | 主视图 |
|---|---|---|
| `ats_admin_app` 平台运营端 | 待审队列 · 雇主 · 岗位 · 举报处置 · 字典维护 · 平台看板 | 雇主待审 grid · 岗位待审 grid · 举报 grid · 平台总览 dashboard |
| `ats_employer_app` 雇主端 | 岗位 · 招聘看板 · 简历收件箱 · 面试日历 · 人才库 · 本机构看板 | **招聘看板** kanban(groupBy stage) · **面试日历** calendar(scheduled_at) · 收件箱 grid×5 listView · 人才库 grid + gallery |
| `ats_seeker_app` 求职者端 | 找工作 · 我的投递 · 我的面试 · 我的档案 · 我的证书 | 职位检索 grid · 我的投递 timeline · 我的面试 calendar · 档案 form |

**公开投递入口**：岗位详情挂 `sharing: { enabled: true, allowAnonymous: true }` 的公开表单视图，授权由表单声明推导，只接受白名单字段。

**看板**：平台总览（雇主数 · 在招岗位 · 本月投递 · 活跃候选人 · 待审队列）· 录用转化漏斗（applied→screening→interview→offer→hired）· 雇主招聘看板（在招岗位 · 待处理简历 · 本周面试 · 平均到 Offer 天数）。

## 05 自动化

| # | 名称 | 类型 | 行为 |
|---|---|---|---|
| F1 | `employer_verification` | 审批链 | 雇主提交 → platform_ops 初审 → platform_admin 复核 → `verified` + 站内信；驳回回传理由 |
| F2 | `job_publish_review` | 审批链 | `pending_review` → 平台审核 → `published` 并写 `published_at`，或 `rejected` + 理由 |
| F3 | `offer_approval` | 审批链 | recruiter 提交 → employer_admin 审批 → `approved` → 发送。雇主内部审批 |
| F4 | `application_stage_notify` | 记录触发 | `stage` 变更给候选人发站内信，刷新 `last_activity_at` |
| F5 | `credential_expiry_reminder` | 定时（日）| 扫 `is_expiring`，提醒候选人；雇主端标红即将失效的在职候选人 |
| F6 | `interview_reminder` | 定时（时）| T-24h 给候选人与面试官各发一次 |

## 06 种子数据

| 对象 | 条数 | 要点 |
|---|---|---|
| ats_employer | 12 | 跨行业；2 家 `pending` 让审核队列不空 |
| ats_job | 40 | 覆盖全部 status；6 条 `pending_review`；4 条 `is_featured` |
| ats_candidate | 80 | 带头像；经验与技能有梯度 |
| ats_application | 200 | 按漏斗铺：applied 88 · screening 46 · interview 28 · offer 14 · hired 9 · rejected 15 |
| ats_interview | 40 | **未来两周内**有排期 |
| ats_offer | 14 | 3 条 `pending_approval` |
| ats_skill / ats_credential_type | 60 / 15 | 字典先行 |

两套种子，一份 schema：`demo-en`（默认，跨行业英文）· `demo-zh`（中文）。

## 07 仓库与里程碑

```
objectstack.config.ts      defineStack 装配入口，engines.protocol '^17'
src/objects/               11 个 *.object.ts
src/views/                 看板 / 日历 / 收件箱 / 人才库 / 公开投递表单
src/apps/                  3 个受众端
src/flows/  src/jobs/      F1–F6
src/dashboards/            3 个看板 + dataset
src/security/              5 positions · 5 permission sets · RLS · FLS · onEnable 绑定
src/hooks/                 display_name 镜像、employer 冗余字段的 stamp
src/translations/          en / zh-CN
src/data/                  demo-en/ · demo-zh/
docs/backlog/              待派发卡片（正文即 issue body）
```

| 里程碑 | 内容 | 验收 |
|---|---|---|
| M1 数据与权限骨架 | 11 对象 + 5 positions/sets + RLS + FLS + 字典种子 | `validate`/`lint`/`typecheck` 绿；两个雇主账号经 REST 互相看不到对方数据 |
| M2 视图与三端 | 看板 · 日历 · 收件箱 · 人才库 · 三个 App · 公开投递表单 · 全量种子 | 三个角色登录各见一套界面 |
| M3 自动化与看板 | F1–F6 + 3 dashboard | 走通 发岗→审核→投递→面试→Offer 审批→录用，站内信与审计有记录 |
| M4 可发布 | README 中英 · live demo · 截图 · CI · CONTRIBUTING | 陌生人 clone 后一条命令跑起来 |

卡片切分见 `docs/backlog/README.md`。#1–#3（脚手架、字典、雇主域）已随初始提交落地。

## 08 待裁决项

**Q1 · 已发布岗位的可读性模型。** 当前 `ats_job` 用 `public_read`，草稿/待审靠视图条件隐藏。代价：草稿在对象层对所有登录用户可读，直接调 REST 能取到 —— 对终将公开的岗位可接受，但**不是安全边界**。可能升级：`private` + 按 `status == 'published'` 放开读的 sharing 规则；落地前先验证平台是否支持字段条件驱动的放开。

**Q2 · 联系方式的动态可见性。** 理想：投递进入 `interview` 后雇主才见手机/邮箱。FLS 按角色静态判定，表达不了"随关联记录阶段变化"。当前降级：对 recruiter 恒隐藏、employer_admin 恒可见，另配"申请查看联系方式"动作（候选人同意 + 审计）。
