import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const metrics = [
  { label: "활성 작업", value: "24", tone: "bg-sky-100 text-sky-800" },
  { label: "배포 대기", value: "7", tone: "bg-amber-100 text-amber-800" },
  { label: "완료율", value: "91%", tone: "bg-emerald-100 text-emerald-800" },
];

const tasks = [
  {
    title: "결제 플로우 상태 모델 정리",
    owner: "Frontend",
    status: "검토 중",
  },
  {
    title: "공통 버튼 접근성 회귀 테스트",
    owner: "Platform",
    status: "진행 중",
  },
  {
    title: "릴리즈 전 E2E 스모크 확인",
    owner: "QA",
    status: "대기",
  },
];

export function HomePage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">
            Client Operations
          </p>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950">
            제품 워크스페이스
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            릴리즈 흐름, UI 작업, 품질 신호를 한 화면에서 확인합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary">
            <RefreshCw aria-hidden className="size-4" />
            새로고침
          </Button>
          <Button>
            <Plus aria-hidden className="size-4" />새 작업
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-md border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-500">
                {metric.label}
              </span>
              <span className={`rounded-md px-2 py-1 text-xs ${metric.tone}`}>
                Live
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-normal text-slate-950">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold">우선순위 작업</h2>
            <Button variant="ghost" size="sm">
              전체 보기
              <ArrowUpRight aria-hidden className="size-4" />
            </Button>
          </div>
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <article
                key={task.title}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-medium text-slate-950">{task.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{task.owner}</p>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-700">
                  <Clock3 aria-hidden className="size-4 text-amber-600" />
                  {task.status}
                </span>
              </article>
            ))}
          </div>
        </section>

        <aside className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold">품질 게이트</h2>
          <ul className="mt-4 space-y-3">
            {["타입 체크", "유닛 테스트", "E2E 스모크"].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm">
                <CheckCircle2 aria-hidden className="size-5 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
