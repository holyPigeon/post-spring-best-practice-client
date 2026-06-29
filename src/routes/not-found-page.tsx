import { Link } from "react-router";

import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-10 text-center">
      <p className="text-sm font-medium text-slate-500">404</p>
      <h1 className="mt-2 text-xl font-bold text-slate-950">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        요청하신 주소가 변경되었거나 존재하지 않습니다.
      </p>
      <div className="mt-5">
        <Button asChild variant="secondary">
          <Link to="/">홈으로 이동</Link>
        </Button>
      </div>
    </section>
  );
}
