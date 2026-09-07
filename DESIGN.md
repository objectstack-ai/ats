# ATS — 设计蓝图

> 本文是架构权威：对象、隔离模型、受众端、自动化、里程碑。改设计先改这里，再改代码。
> 派发循环（`AGENTS.md` → PM dispatch）把它当作 ADR 目录使用：一个卡片与本文冲突时，本文胜出，或者先在这里落一条修订。

## 01 定位与边界

**平台型招聘，不是单企业 ATS。** 多雇主入驻、候选人求职、平台方治理。

| 类型 | 谁在用 | 代表 | 本项目 |
|---|---|---|---|
| 单企业 ATS | 一家公司的 HR，管自己的招聘 | Greenhouse · Lever · Moka | 否 |
| **平台型招聘** | 平台方运营，多雇主入驻，候选人求职 | BOSS 直聘 · 前程无忧 | **是** |

选平台型的理由：开源里几乎空白；只入驻一个雇主它就退化为单企业 ATS；它正好压在 ObjectStack 的强项上（跨租户 RLS、审批链、审计、一套元数据三组受众分区）。

**范围内**：岗位发布与审核 · 投递与阶段流转 · 面试排期与评价 · Offer 与审批 · 候选人档案与持证 · 人才库检索 · 举报与处置 · 平台治理与看板。
**范围外**：课程/考试（LMS）· IM 与社区 · 直播 · 支付 · 薪酬绩效与人事档案 · 简历解析与匹配算法。

**命名纪律**：对象名、字段名、选项值一律通用，**零行业词汇**。行业特征只进种子数据 —— 换一套 seed 就是另一个行业的版本。

## 02 对象模型

前缀 `ats_`（Applicant Tracking System）。12 个对象，三个域，各对应一组受众分区。

```
雇主域                      招聘事务域                   候选人域
ats_employer   [private]    ats_application [private]    ats_candidate            [private]
ats_employer_member [MD]    ats_interview   [MD]         ats_candidate_credential [MD]
ats_job        [public_read] ats_offer      [private]    ats_skill                [public_read]
                            ats_report      [private]    ats_credential_type      [public_read]
                            ats_inquiry     [private]    ← 公开投递入口（2026-09-07 裁决，#3 → #37）
```

`[MD]` = master-detail 子对象，`sharingModel: 'controlled_by_parent'`。

### 字段清单

`*` = required；_斜体_ = 受字段级安全约束。枚举值即机器值。

| 对象 | 字段 |
|---|---|
| `ats_employer` `private` | name* · short_name · logo · industry `technology/manufacturing/healthcare/retail/education/finance/logistics/hospitality/construction/other` · size `micro/small/medium/large` · city · website · intro richtext · **verification_status** `draft/pending/verified/rejected/suspended` · verification_docs file×n · _verification_note_（仅平台角色）· service_tier `trial/standard/premium` · service_expires_at · owner user · can_publish formula |
| `ats_employer_member` `by parent` | display_name（存储镜像 "<user> · <access level>"，nameField）· employer* MD cascade inlineEdit grid · user* · access_level `admin/recruiter/viewer` · is_active |
| `ats_job` `public_read` | title* · employer* lookup · department · description richtext · requirements richtext · employment_type `full_time/part_time/contract/internship/temporary` · work_mode `onsite/hybrid/remote` · city · salary_min / salary_max currency · salary_period `monthly/yearly/hourly` · headcount · required_skills lookup×n · required_credentials lookup×n · experience_min_years · education_min `none/high_school/associate/bachelor/master/doctorate` · **status** `draft/pending_review/published/paused/closed/rejected` · rejection_reason · _review_note_（仅平台角色）· is_featured · published_at · expires_at · is_open formula |
| `ats_candidate` `private` | full_name* · user · avatar · _phone_ · _email_ · city · experience_years · education（同 job.education_min）· current_title · current_employer · skills lookup×n · summary · resume_file · _expected_salary_min / max_ · salary_period · seeking_status `actively_looking/open/not_looking` · profile_visibility `public/limited/hidden`（public/limited 对所有雇主可发现，二者仅呈现面不同；hidden 仅投递过的雇主可达，由 RLS 强制 —— 见 §03《候选人同意门控池》）|
| `ats_candidate_credential` `by parent` | display_name（镜像 "<credential> · <level>"）· candidate* MD cascade · credential_type* lookup · level · certificate_no · issued_at · expires_at · certificate_file · verification_status `pending/verified/rejected` · is_expiring formula（90 天内到期）|
| `ats_application` `private` | display_name（镜像 "<candidate> → <job>"）· job* · candidate* · employer lookup（RLS 冗余，beforeInsert 自 job 复制）· **stage*** `applied/screening/interview/offer/hired/rejected/withdrawn` · source `direct/referral/recommendation/agency/import` · applied_at · resume_snapshot · cover_letter · rating slider 1–5 · rejection_reason `not_a_fit/insufficient_experience/salary_mismatch/position_filled/candidate_withdrew/other` · last_activity_at。唯一索引 `(job, candidate)` scope organization |
| `ats_interview` `by parent` | display_name（镜像 "<candidate> · R<round>"）· application* MD cascade · round · scheduled_at* datetime · duration_minutes · mode `onsite/video/phone` · location_or_link · interviewers user×n · status `scheduled/completed/cancelled/no_show` · rating · feedback |
| `ats_offer` `private` | display_name · application* · employer lookup（RLS 冗余）· salary currency · salary_period · start_date · **status** `draft/pending_approval/approved/sent/accepted/declined/withdrawn` · approved_by user · expires_at · notes |
| `ats_report` `private` | subject* · target_type* `job/candidate/application/employer` · target_ref* · reason `fake_info/harassment/spam/discrimination/other` · description · reporter user · status `new/investigating/resolved/dismissed` · resolution · handled_by user |
| `ats_inquiry` `private` | display_name（镜像 "<applicant> → <job>"，nameField）· job* lookup · full_name* · email* · phone · cover_letter · resume file · employer lookup + employer_org（自 job 盖章，RLS 冗余）· submitted_at · **status** `new/converted/rejected/spam` · candidate lookup · application lookup · converted_at（后三者由转换写入）。匿名投递者经公开表单写入的**隔离对象**：只接受表单白名单字段，转换后才有候选人与投递 |
| `ats_skill` `public_read` | name* · category `technical/domain/tool/language/soft` · aliases · description |
| `ats_credential_type` `public_read` | name* · issuer · description · has_levels · validity_months |

### 状态机（写入层强制，非前端隐藏）

- `ats_employer.verification_status`：draft→pending；pending→verified/rejected；verified→suspended；rejected→pending；suspended→verified
- `ats_job.status`：draft→pending_review；pending_review→published/rejected；published→paused/closed；paused→published/closed；rejected→draft/pending_review；closed 终态
- `ats_application.stage`：applied→screening/rejected/withdrawn；screening→interview/rejected/withdrawn；interview→offer/rejected/withdrawn；offer→hired/rejected/withdrawn；hired/rejected/withdrawn 终态
- `ats_offer.status`：draft→pending_approval/withdrawn；pending_approval→approved/draft；approved→sent/withdrawn；sent→accepted/declined/withdrawn；accepted/declined/withdrawn 终态
- `ats_report.status`：new→investigating/dismissed；investigating→resolved/dismissed；resolved/dismissed 终态
- `ats_inquiry.status`：`initialStates: ['new']`（任何写入都不能生出已转换/已分诊的行）；new→converted/rejected/spam；rejected→new；spam→new；converted 终态

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
| **硬隔离** | candidate · application · offer · employer · report | `private` + `readScope: 'org'` + RLS。雇主侧经 `record.employer_org in current_user.employer_org_ids` 判定（`employer_org_ids` 由应用自有的 membership resolver 转发内核算好的 `accessible_org_ids`，见下）；candidate 一行没有 `employer_org`，雇主侧按**同意门控池**判定（`profile_visibility` ∪ 本机构申请人，见下节）；求职者侧按 `user` / `candidate_user` 自持。越权可读即事故。 |
| **软过滤** | job | `public_read` + 视图过滤 + FLS。岗位终将公开；草稿/待审靠列表条件与 App 导航隐藏，`review_note` 靠 FLS。**刻意降级，非遗漏**（见 08 Q1）。 |
| 公开字典 | skill · credential_type | `public_read`，写权限仅平台角色。 |

### 雇主身份怎么传给 RLS —— 裁决记录（2026-09-06）

**雇主 = 平台组织。** 每个雇主对应一个 organization，其员工是该组织成员；雇主侧对象上反范式一个 `employer_org` 标量，谓词写 `record.employer_org in current_user.employer_org_ids`（`ats_employer` 上是 `record.organization`）。

**为什么不能按原设计"经 `ats_employer_member` 判定"**：RLS 谓词是 canonical CEL，只能把**字段**与 `current_user.*` 占位符比较，**跨对象 traversal 是编译错误**（ADR-0055）。"当前用户是不是这行雇主的成员"表达不了。RLS 编译器实际填入的占位符只有 `id` / `email` / `organization_id` / `org_user_ids` / `positions`，加上 membership resolver 声明的自有键；`accessible_org_ids` 虽在保留名单里，编译器并不填它（见下节）。

**为什么用全部成员组织集合（`accessible_org_ids`，谓词里以 `employer_org_ids` 到场）而不是 `organization_id`**：前者是调用者的**全部**组织成员集（ADR-0105 D2），一个服务两家雇主的招聘顾问无需切换上下文即可同时看到两边；无有效成员资格解析为空集，谓词编译成 `$in: []`，fail-closed 到零行，绝不 fail-open。

**为什么当时判断「对象不开 `tenancy`」**：那道 Layer 0 墙按组织判定，会连带把求职者**自己的投递**也挡住 —— 求职者不是任何雇主组织的成员。业务 RLS 允许两类受众对同一批行各带各的策略，这才是 marketplace 的形状。

> ⚠️ **这句话在 2026-09-07 被修订为「按对象划分」，不再是「全都不开」。** 见下方《租户墙划分契约》—— Layer 0 墙对 `tenancy: { enabled: false }` 的对象**有豁免**，所以正确做法是分类，不是一刀切。

**组合顺序（关键）**：OWD `private` 定基线 → `readScope: 'org'` 把 owner 匹配放宽到组织范围 → RLS 收窄到真正的雇主。只给 `allowRead` 不给 `readScope`，招聘专员将只能看到自己创建的记录 —— 那不是 marketplace，是一堆私人收件箱。

**遗留的运维前提**：雇主入驻时需创建对应 organization 并把员工加为成员（`sys_organization` / `sys_member`）。M1 由种子数据承担，正式流程挂在 F1 机构资质审核通过之后 —— 已记入卡 11。

### `accessible_org_ids` 在 RLS 里解析不出来 —— 应用自有 resolver 转发（2026-09-07 裁决，#18）

**问题。** 平台的 `RLSUserContext`（`plugin-security/src/rls-compiler.ts:43`）只声明
`id` / `organization_id` / `positions` / `org_user_ids` / `email` 加 membership 袋，**从不把 `accessible_org_ids` 填进去**；
而它又在 `RESERVED_RLS_MEMBERSHIP_KEYS` 里，应用侧的 membership resolver 被禁止提供它
（ADR-0105 D11 的原话是「core-resolved, not an app resolver」）。变量解析不出 → 策略被丢弃 → `RLS_DENY_FILTER` → **静默零行，不报错**。
**改 CEL 拼写修不好它**：`record.employer_org in current_user.accessible_org_ids` 与 SQL 桥接写法一样解析不出（#18 两种拼写都实测过；
日志里的 DEPRECATED 方言警告是叠在 DENY 之上的另一件事）。已上报 [objectstack#16518](https://github.com/objectstack-ai/objectstack/issues/16518)，
它保持 open：保留一个没人填的键仍是缺陷，下面的转发是应用在绕过它，不是关闭它的理由。

**机制。** 保留名单挡的是**名字**，不是能力。`IRlsMembershipResolver`（`@objectstack/spec` 的 `contracts/rls-membership-resolver`）
在每次请求时**收到** `accessible_org_ids` 作为输入 —— 内核算好后交给 resolver，只是从不交给编译器。所以本仓库自有一个 resolver
（`src/security/rls-membership-resolver.ts`）把同一个集合以 `employer_org_ids` 之名重新发布，十条雇主侧策略据此写
`record.employer_org in current_user.employer_org_ids`（`ats_employer` 上 `record.organization`），`check` 子句同。
自 #13 起同一个 resolver 还按请求预解析并发布 `applicant_candidate_ids`（见《候选人同意门控池》）。
不发明数据、不放宽任何授权：集合就是内核已经解析的那一个；无成员资格的调用者得到空集，谓词编译成 `$in: []`，fail-closed 到零行。

**为什么应用要自己拥有一个 resolver，而不是直接用 `accessible_org_ids`。** 因为那个名字在 RLS 里根本不到场（上面的问题），
又被保留、不许应用提供；能到场的只有 resolver 声明的自有键。`employer_org_ids` 不与任何具名上下文字段冲突，是契约文档明文允许的形状。

**注册锚点（cli 17.3.0 实测）。** plugin-security 在自己的 `start()` 里**只读一次** `rls-membership-resolver` 服务并缓存。
`onEnable` 由 AppPlugin 的 `start()` 调用，而 CLI 把 security plugin 排在应用之前：从 `onEnable` 注册**能注册、但太晚**
（内核记录了服务注册，security plugin 没看见，DENY 照旧）。内核先跑完所有插件的 `init()` 再跑任何 `start()`，
所以 resolver 由 `objectstack.config.ts` 的 `plugins: [AtsRlsMembershipResolverPlugin]` 在 `init()` 注册 —— 应用包唯一拥有的 Phase 1 缝隙。
仓内代码，不新增依赖。

**现状（2026-09-07）。** 变量已解析：`--log-level debug` 下 `[RLS] DENY (fail closed)` / `unresolved-variable` 为零，
雇主管理员读到且只读到本机构那一行 `ats_employer`，向他人机构范围写入被 `check` 子句拒绝。
消融（策略退回旧拼写、resolver 仍在）把一切打回零行并让 DENY 重现 —— 这个验证是能失败的。
但 `ats_job` / `ats_application` / `ats_offer` / `ats_employer_member` 对雇主仍是零行：**不是策略的问题**，是 stamp hook 把**任意一家**雇主的组织
写到了每一行上（所有 job 的 `employer_org` 都是 `org_ats_orbit`），见 #43。把 stamp 中和后的探针读数正是验收数字
（Quillstone 5 job / 27 application / 2 offer，Harborline 5 / 31 / 2，互见零），所以 #43 修好后这里不用再改。

### 租户墙划分契约（2026-09-07 裁决）

平台的单库多租户是**按企业 SaaS 设计的**：租户 = 组织，进去只看自己的数据。
市场型应用比它多两样东西 —— 一个跨墙可读的公共面（岗位），和**联合归属**的记录（一条申请同时属于求职者和雇主）。

Layer 0 墙不是全有全无的。`plugin-security/src/security-plugin.ts:2940` 明确列出豁免：
`tenancy.enabled:false` 的平台全局对象、没有 `organization_id` 列的对象、平台管理员、以及整个 `single` posture，
**在墙这一层全部产出 `null`，不受影响**。所以正确形态是按对象划分：

| 分类 | 对象 | 隔离由谁承担 |
|---|---|---|
| **进墙**（`tenancy` 开启） | `ats_employer` · `ats_employer_member` · `ats_interview` · `ats_offer` | Layer 0 引擎级墙 + RLS |
| **平台全局**（`tenancy: { enabled: false }`） | `ats_candidate` · `ats_candidate_credential` · `ats_skill` · `ats_credential_type` · `ats_report` · `ats_inquiry` | 仅 RLS |
| **平台全局 · 联合归属** | `ats_application` · `ats_job` | 仅 RLS：雇主侧按 `employer_org`，求职者侧按 `candidate_user` / 本人 |

`ats_application` 是唯一需要论证的一格：它同时属于求职者和雇主，而企业 SaaS 租户模型假设「每行恰好属于一个租户」。
让它出墙、隔离交给 Layer 1，是唯一能同时满足两侧的方案。

**这个划分是前向兼容的契约，不只是当下的权宜：**

- **今天（`single` posture，墙惰性）** —— 划分成立，求职者靠本人级规则访问自己的数据（这类规则不依赖
  `accessible_org_ids`，**今天就能工作**）。
- **墙立起来之后**（objectstack #16215 开源多组织包 **已于 2026-09-07 合并**；仍待 #16137 接通 serve 挂载）—— **同一套划分不用改**。
  进墙的对象额外获得引擎级隔离（强于 RLS），出墙的对象继续可被求职者访问。

⛔ 因此**不要**为了让种子写入通过而发明一个「平台组织」来持有候选人等行。那在今天只是个语义谎言，
墙立起来之后会变成一堵真墙，把候选人锁进一个谁都不该属于的租户里；而任何 `sys_member` 行把用户接进那个组织，
就能通过组织范围规则读到全部候选人。**用 `tenancy: { enabled: false }` 说实话。**

### 候选人同意门控池（2026-09-07 裁决，#13）

**裁决（维护者）。** 雇主可发现 `profile_visibility` 为 `public` 或 `limited` 的候选人；`hidden` 的候选人**只有**其投递过的雇主可达。

**此前的事实。** 两个雇主权限集对 `ats_candidate` 只有 `{ allowRead: true, readScope: 'org' }`，没有任何 RLS 策略。
`readScope: 'org'` 在 plugin-sharing 里的含义是**不加 owner 过滤**（`buildReadFilter`：`if (readScope === 'org') return null`）——
它不按组织过滤，而是把边界交给 Layer 0 与 RLS；`ats_candidate` 在墙外又没有策略，于是每个雇主读到全部 80 条，`hidden` 在内
（memory 与 sqlite 一致，#13 实测）。

**动手前的两项实测（cli 17.3.0，memory 与 sqlite 各跑一次）。**

| 问题 | 探针 | memory | sqlite | 结论 |
|---|---|---|---|---|
| 同一权限集内同一对象的多条 RLS 策略如何组合 | 招聘专员集上放两条**互斥**字面策略 `profile_visibility == 'public'` 与 `== 'hidden'`（种子 19 + 13） | 32 行 | 32 行 | **并集（OR）**；交集会是 0。编译器把同一对象/操作的全部适用策略收进一个 `$or`（`compileFilter`） |
| 多值包含能否表达：`record.<数组字段> in current_user.<集合>` | 临时 `exposed_org_ids`（`multiple: true`）字段 + 策略 `record.exposed_org_ids in current_user.employer_org_ids`，种子给 5 名候选人各 1–2 个组织 | Quillstone 4 / Harborline 1（重叠语义成立，含匹配在第二个元素的行） | **每次雇主读取都是 HTTP 400**：`Operator "$in" on field "exposed_org_ids" WAS NOT APPLIED … JSON TEXT column`（driver-sql #7398） | **不可移植**：RLS 编译器把 `in` 一律降为 `{ field: { $in } }`，不知道字段是数组；SQL 驱动拒绝对 JSON 列用 `$in`。反向拼写、`.exists()`、`.contains(变量)` 在编译期即被拒 |

**为什么既不是数组载体，也不是连接对象。** 数组载体如上被 sqlite 整体拒绝，且不是静默零行而是整个对象对雇主报错。
连接对象（candidate × employer_org）自身能被雇主读到，但候选人**那一行**仍然读不到：列表、直读 `GET /api/v1/data/ats_candidate/ID`、
投递上的 candidate lookup 都走同一条 `ats_candidate` 策略，而该策略引用不了连接对象（ADR-0055）。结果会是雇主在自己的看板上
打不开自己申请人的档案 —— 与验收第 3 条相反，也与 §02「没有人才库对象」的取舍相悖。

**采用的机制：预解析的申请人集合。** RLS 契约（`IRlsMembershipResolver`，`@objectstack/spec` `contracts`）明文把
「本需子查询的集合成员判定」交给运行时**预解析**进 `current_user.<key>`，并点名用途是「应用形状的集合：销售代表辖区内的账户、
案件组能触碰的记录」。本仓库已有的 resolver（`src/security/rls-membership-resolver.ts`）因此多发布一个键 `applicant_candidate_ids`：
按请求读取 `ats_application` 中 `employer_org` 落在调用者组织集合内的行，取 `candidate` 去重。两个雇主集各带两条 SELECT 策略，按并集组合：

```
record.profile_visibility in ['public', 'limited']      池
record.id in current_user.applicant_candidate_ids       本机构申请人
```

编译为标量 `id IN (…)`，两个驱动行为一致。分成两条而不写成一条 `||`：申请人集合解析失败时只有那一条脱落，雇主仍保有池；
一条不可解析的 `||` 谓词会整体 DENY。

**代价与边界（如实）。** 每个持有雇主成员资格的调用者每请求多一次 `ats_application` 读取（求职者与平台人员跳过）；
上限 5000 行，超出即**截断**（失败方向是变窄，不是变宽）；「投递过」= 存在申请行，与阶段无关；集合是活的 ——
新投递下一请求即可达，删除投递即撤回；没有 stamp hook，`claimSeedOwnership` 的谓词更新无列可污染（#43 的教训）。

**`limited` 的含义。** FLS 按权限集静态判定，不能让同一权限集对某一行遮蔽某个字段，所以 `limited` 不可能是「比 public 少几个字段」。
本仓库选择：`public` 与 `limited` 在访问上**完全等价**，只在呈现面不同 —— 人才库 grid 列出两者，Gallery 只展示 `public`。
这是呈现约定，**不是安全边界**，字段描述与视图注释都这样写；不再有「读起来像访问控制却什么都不强制」的第三档。
另一条可选路线（把 `limited` 退役、改为 discoverable/hidden 两档）改动枚举值这一公开契约与 48 条种子，且改写了裁决自己的用词，未采用。

**验收读数**（memory 与 sqlite 各一张按人物的表、直读与 lookup 的探针、消融）见 #13 的 PR 正文。

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

**到期条件（两项，已满足一项）**：这是暂时的，不是永久约束。#16215 + #16137 落地后开源部署能带墙启动，
`multiOrgPostureEffective()` 为真，雇主自助注册随之打通 —— 届时 F1 机构资质审核才能接上真实的入驻流程。

- ✅ **objectstack#16215 已合并（2026-09-07）** —— `@objectstack/organizations` 现为 Apache-2.0 开源包，
  `org-scoping` 注册器进入开源核心。**这解除了「多组织运行时是闭源的」这一条**。
- ⬜ **objectstack#16137 仍未落地**（open，`pm:blocked`，无 PR）。#16215 的 PR 正文**明确不认领**「开源部署能带墙启动」
  这条验收：`objectstack serve` 仍从被服务应用自己的声明解析运行时，**没有按 posture 挂载这个包**。

⇒ 所以今天的结论**不变**：雇主仍无法自助注册。变的是原因 —— 不再是「包是闭源的」，而只剩「serve 没接上挂载」。
下一次复核只需看 #16137。

### 角色与权限矩阵

五个 position ↔ 五个 permission set。R 读 · C 建 · U 改 · D 删；括号内为行级作用域。

| 对象 | platform_admin | platform_ops | employer_admin | employer_recruiter | job_seeker |
|---|---|---|---|---|---|
| ats_employer | RCUD | RU（审核字段）| RU（本机构）| R（本机构）| R（仅 verified）|
| ats_employer_member | RCUD | R | RCUD（本机构）| R（本机构）| — |
| ats_job | RCUD | RU（审核字段）| RCU（本机构）| RCU（本机构）| R（仅 published）|
| ats_candidate | RCUD | R | R（同意门控池：public/limited 全部 ∪ 投递过本机构的 hidden）| R（同上）| RCU（本人）|
| ats_application | RCUD | R | RU（本机构）| RU（本机构）| RC（本人）|
| ats_interview | RCUD | R | RCUD（本机构）| RCU（本机构）| R（本人）|
| ats_offer | RCUD | R | RCU（本机构·审批人）| RC（本机构·提交）| RU（本人·接受/拒绝）|
| ats_candidate_credential | RCUD | RU（核验）| R（随候选人）| R（随候选人）| RCUD（本人）|
| ats_report | RCUD | RU（处置）| C | C | C |
| ats_inquiry | RCUD | RU（分诊·转换）| RU（本机构岗位的投递）| RU（同上）| —（匿名经公开表单 C，由路由推导的 `publicFormGrant` 授权，不是权限集）|
| ats_skill · ats_credential_type | RCUD | RCU | R | R | R |

### 字段级安全

| 字段 | 对谁遮蔽 | 理由 |
|---|---|---|
| `ats_candidate.phone / email` | employer_recruiter | 最易被批量抓取；仅 employer_admin 可见，读取落审计 |
| `ats_inquiry.phone / email` | employer_recruiter | 同一份联系方式，只是早一行：投递转换后候选人行继承的正是它，这里不封则前一条封了也白封。转换不受影响 —— 钩子以 `runAs: 'system'` 读行 |
| `ats_candidate.expected_salary_*` | employer_admin · employer_recruiter | 期望薪资先于议价暴露损害候选人。FLS 按权限集静态判定，`profile_visibility` **不能**按行放开任何字段 —— 原句「候选人可经 `profile_visibility` 自主放开」是一个没有实现也实现不了的承诺，#13 删除 |
| `ats_job.review_note` · `ats_employer.verification_note` | 所有雇主侧与求职者角色 | 平台内部意见，驳回理由走独立字段回传 |

## 04 视图与受众端

> **修订（2026-09-07）：三个 App 改为一个 App、三组受众分区。**
> 平台强制**一个 `type: 'app'` 包最多定义一个 App** —— `defineStack` 直接抛错
> （`stack.zod.ts:1418`，ADR-0019 D3：*「聚合多个插件的垂直方案必须收敛为一个 App，其内部插件不可见；
> 真正想要独立产品的开发者应当发布独立的 App，而绝不是一个暴露 N 个 app 的包装」*）。
> 原设计的三 App 形态在这个包里无法存在，本节据此重写。ADR-0019 D3 给的另一条路是拆成三个独立包，
> 已否决：对一个共享同一套对象的市场应用来说那是仓库级重构，且三端本就共用元数据。

一个 App `ats`，导航按受众分成三组，每组用 `requiredPermissions` 门控 —— 用户看不到的组由服务端剔除，
空组自动折叠。**这不是降级，是平台自己的处方**：消费者面只有一个 App。

| 受众分区 | 门控能力 | 导航 | 主视图 |
|---|---|---|---|
| 平台运营 | `ats_platform.access` | 待审队列 · 雇主 · 岗位 · 举报处置 · 字典维护 · 平台看板 | 雇主待审 grid · 岗位待审 grid · 举报 grid · 平台总览 dashboard |
| 雇主 | `ats_employer.access` | 岗位 · 招聘看板 · 简历收件箱 · 面试日历 · 人才库 · 本机构看板 | **招聘看板** kanban(groupBy stage) · **面试日历** calendar(scheduled_at) · 收件箱 grid×5 listView · 人才库 grid + gallery |
| 求职者 | `ats_seeker.access` | 找工作 · 我的投递 · 我的面试 · 我的档案 · 我的证书 | 职位检索 grid · 我的投递 timeline · 我的面试 calendar · 档案 form |

能力由权限集的 `systemPermissions` 授予：`ats_platform.access` 挂 `ats_platform_admin` 与 `ats_platform_ops`；
`ats_employer.access` 挂 `ats_employer_admin` 与 `ats_employer_recruiter`；`ats_seeker.access` 挂 `ats_job_seeker`。
⚠️ `requiredPermissions` 引用一个未注册的能力时，`validate` 只给 `capability-reference-unknown` **警告**，
运行时 fail-closed —— 也就是说漏授权的表现是「导航项静默消失」，不是报错。

> **求职者分区的现实定位**：如 §03 所记，求职者门户最终是独立前端（浏览要 SEO、要移动端、要品牌），
> Console 里的这一组是给内部与调试用的兜底，不是产品面。


**公开投递入口（2026-09-07 裁决，#3 → #37：先入库，再转换）**：匿名投递不能直接落到 `ats_application` —— 公开表单契约在一个对象上插入**恰好一行**，而 `ats_application.candidate` 是必填且带 `(job, candidate)` 唯一索引，实测无论如何拼装都是 `400 Candidate is required`（`docs/evidence/issue-3/20-anonymous-public-form-probe-transcript.txt`）。所以入口是**隔离对象 `ats_inquiry`**：`ats_inquiry.formViews.apply_public` 挂 `sharing: { enabled: true, allowAnonymous: true, publicLink: '/forms/apply' }`，服务于 `GET/POST /api/v1/forms/apply` 与 `/_console/f/apply`；**授权由表单声明推导**（路由按请求生成 `publicFormGrant: { object: 'ats_inquiry' }`，只许在这一个对象上插入并回读刚写的那行），**表单的 `sections` 就是字段白名单**，其它键一律丢弃。⛔ 没有、也不可能有"访客权限集"：曾经声明的 `ats_guest_apply` 框架里无人读取，路由放到上下文里的唯一集名 `guest_portal` 也在授权分支之前就被短路（实测连同名且拒绝插入的集都拦不住，#32），已删除。岗位经 `?prefill_job=` 从岗位页的"公开投递链接"带入，不经搜索（匿名 lookup 路由上游损坏，objectstack#16581）；stamp hook 只接受 `published` 的岗位。平台或雇主用户在收件队列里**转换**（`status → converted`）：按 e-mail 找到或新建候选人（新建为 `hidden`，因为匿名投递者只同意了一家雇主看一个岗位）、按 `(job, candidate)` 找到或新建投递、把两者回写到同一次更新里。转换以调用者身份写入，谁能转换由其对 `ats_inquiry` 的更新授权与行级策略决定；新投递的 `employer_org` 正是让转换方读到该候选人的申请人路径（§03《候选人同意门控池》）。

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
| ats_inquiry | 8 | 全部 `new`；5 位无候选人行的投递者、3 位已入库候选人（转换后挂到既有行）；2 条 Quillstone、2 条 Harborline |
| ats_skill / ats_credential_type | 60 / 15 | 字典先行 |

两套种子，一份 schema：`demo-en`（默认，跨行业英文）· `demo-zh`（中文）。

## 07 仓库与里程碑

```
objectstack.config.ts      defineStack 装配入口，engines.protocol '^17'
src/objects/               12 个 *.object.ts
src/views/                 看板 / 日历 / 收件箱 / 人才库 / 公开投递表单（ats_inquiry）
src/apps/                  1 个 App，三组受众分区（ADR-0019 D3）
src/actions/               投递分诊（转换 / 拒绝 / 垃圾）· 岗位页公开投递链接
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
