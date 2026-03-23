export function Footer() {
  return (
    <footer className="bg-card-light border-t border-card-border mt-12 py-8 px-4 lg:px-8">
      <div className="lg:max-w-[1600px] lg:mx-auto lg:px-0">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div>
            <h3 className="text-lg font-bold font-display text-text-main">
              Festiverse
            </h3>
            <p className="text-sm text-subtext mt-2 max-w-sm">
              당신의 음악적 여정을 더 넓은 우주로 연결합니다.
              <br />
              국내 최대의 페스티벌 큐레이션 플랫폼 페스티버스.
            </p>
          </div>
          <div className="flex gap-6 text-sm text-subtext">
            <a href="/terms" className="hover:text-primary transition-colors">
              이용약관
            </a>
            <a href="/privacy" className="hover:text-primary transition-colors">
              개인정보처리방침
            </a>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-card-border">
          <p className="text-xs text-subtext">
            &copy; 2025 Festiverse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
