import { isRouteErrorResponse, useRouteError } from "react-router";

export function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "요청한 화면을 불러오지 못했습니다.";

  return (
    <section className="rounded-md border border-red-200 bg-white p-6 text-red-900">
      <h1 className="text-lg font-semibold">오류가 발생했습니다</h1>
      <p className="mt-2 text-sm">{message}</p>
    </section>
  );
}
