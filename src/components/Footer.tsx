export default function Footer() {
  return (
    <footer className="mt-24 border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-gray-500">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
          <div>
            <div className="mb-2 flex items-center gap-2 text-lg font-extrabold text-brand-600">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-white text-sm">T</span>
              Trainize
            </div>
            <p className="max-w-sm">Free online courses with certificates. Learn new skills, advance your career.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="mb-2 font-semibold text-gray-700">Explore</p>
              <ul className="space-y-1">
                <li>Courses</li>
                <li>Categories</li>
                <li>Certificates</li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-semibold text-gray-700">Company</p>
              <ul className="space-y-1">
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-8 text-xs text-gray-400">© {new Date().getFullYear()} Trainize. All rights reserved.</p>
      </div>
    </footer>
  );
}
