# HR Data Lens

轻量招聘数据分析工具 — 上传招聘漏斗 Excel，自动生成超越简单漏斗的深度分析。

## 功能

- **📤 Excel/CSV 上传** — 拖拽上传，自动识别列类型（信息列 / 阶段列）
- **📊 KPI 指标卡** — 简历总数、面试率、终面通过率、Offer率、入职率
- **📈 月度趋势图** — 双轴展示简历量与入职量变化
- **🔻 阶段衰减漏斗** — 各阶段转化率可视化，自动标注异常环节
- **🏷️ 分群对比** — 按部门 / 岗位拆分对比各阶段转化率
- **⏱️ 流程耗时分析** — 阶段间平均/最短/最长间隔天数
- **✏️ 源数据编辑** — 可编辑表格，下拉选择结果，修改实时生效
- **🔍 筛选器** — 部门 / 岗位 / 日期范围筛选

## 技术栈

| 层面 | 选型 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| UI | Tailwind CSS v4 + shadcn/ui |
| 图表 | Recharts |
| 数据库 | SQLite (Prisma v7) |
| 表格 | @tanstack/react-table |
| Excel | xlsx (SheetJS) |
| 文件上传 | react-dropzone |

## 本地运行

```bash
# 克隆项目
git clone https://github.com/FinchS1018/hr-data-lens.git
cd hr-data-lens

# 安装依赖
npm install

# 初始化数据库
npx prisma migrate deploy

# 启动开发服务器
npm run dev
```

打开浏览器访问 **http://localhost:3000**

## 上传数据格式

上传 Excel/CSV 文件，需包含以下列（列名支持中英文自动识别）：

| 列类型 | 示例列名 | 说明 |
|--------|---------|------|
| 信息列 | 姓名、部门、岗位、渠道来源、招聘负责人 | 候选人基本信息 |
| 阶段列 | 简历筛选结果、一面结果、二面结果、终面结果 | 值为日期（通过）或 淘汰/放弃 |
| 其他 | Offer结果、是否入职 | 录用与入职状态 |

## 项目地址

https://github.com/FinchS1018/hr-data-lens
