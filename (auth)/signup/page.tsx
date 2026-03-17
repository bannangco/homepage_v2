export const metadata = {
  title: "회원가입 - 반낭코",
  description: "반낭코 계정 회원가입 페이지",
};

import Link from "next/link";

export default function SignUp() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="pb-12 text-center">
            <h1 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,theme(colors.gray.200),theme(colors.indigo.200),theme(colors.gray.50),theme(colors.indigo.300),theme(colors.gray.200))] bg-[length:200%_auto] bg-clip-text font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
              반낭코 계정 만들기
            </h1>
          </div>
          <form className="mx-auto max-w-[400px]">
            <div className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-indigo-200/65" htmlFor="name">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input id="name" type="text" className="form-input w-full" placeholder="이름을 입력하세요" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-indigo-200/65" htmlFor="company">
                  회사명 <span className="text-red-500">*</span>
                </label>
                <input id="company" type="text" className="form-input w-full" placeholder="회사명을 입력하세요" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-indigo-200/65" htmlFor="email">
                  업무용 이메일 <span className="text-red-500">*</span>
                </label>
                <input id="email" type="email" className="form-input w-full" placeholder="업무용 이메일을 입력하세요" />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-200/65" htmlFor="password">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <input id="password" type="password" className="form-input w-full" placeholder="비밀번호를 입력하세요 (10자 이상)" />
              </div>
            </div>
            <div className="mt-6 space-y-5">
              <button className="btn w-full bg-gradient-to-t from-indigo-600 to-indigo-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-[inset_0px_1px_0px_0px_theme(colors.white/.16)] hover:bg-[length:100%_150%]">
                회원가입
              </button>
            </div>
          </form>
          <div className="mt-6 text-center text-sm text-indigo-200/65">
            이미 계정이 있으신가요? <Link className="font-medium text-indigo-500" href="/signin">로그인</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
