
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { submitToGoogleSheet, logVisitor } from '../services/googleSheetService';
import { ArrowRight, CheckCircle2, Sparkles, MessageSquare, Heart, Shield, Bell } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [advice, setAdvice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Log visitor on component mount
  useEffect(() => {
    logVisitor();
  }, []);

  // Handle scroll to join section if state is present
  useEffect(() => {
    if (location.state && (location.state as any).scrollToJoin) {
       // Small timeout to ensure DOM is ready
       setTimeout(() => {
         scrollToFeedback();
       }, 300);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    await submitToGoogleSheet(email, advice);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const startOnboarding = () => {
    navigate('/onboarding');
  };

  const scrollToFeedback = () => {
    const section = document.getElementById('join');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-primary/20">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-green-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-primary tracking-tight">RoomEase</span>
              <span className="bg-green-100 text-[10px] px-2 py-0.5 rounded-full text-primary-dark font-bold uppercase tracking-wider hidden sm:inline-block border border-green-200">Beta</span>
            </div>
            {/* Clean Navbar - No button here to focus on Hero CTA */}
          </div>
        </div>
      </nav>

      {/* Hero Section - Bold Green Gradient */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-[#E3F9ED] via-[#F0FDF4] to-white">
        {/* Stronger Background Blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#32C36C] rounded-full blur-[100px] opacity-30 animate-pulse"></div>
        <div className="absolute top-40 left-0 -ml-20 w-80 h-80 bg-green-200 rounded-full blur-[100px] opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Mesh Pattern Overlay for Texture */}
        <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#28A058 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-green-200 px-5 py-2.5 rounded-full mb-8 shadow-md shadow-green-100/50 animate-fade-in-up">
             <span className="text-gray-700 font-bold text-xs sm:text-sm flex items-center gap-2">
               <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-sm shadow-primary"></span>
               🏠 좁은 기숙사 방, 평화를 지키는 스마트한 방법
             </span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black text-secondary leading-tight mb-8 break-keep animate-fade-in-up drop-shadow-sm" style={{ animationDelay: '0.1s' }}>
            "친구랑 같이 살면"<br />
            <span className="relative inline-block text-primary z-10">
              <span className="relative z-10">무조건 싸운다?</span>
              <span className="absolute bottom-1 left-0 w-full h-4 bg-green-200/50 -z-10 -rotate-1"></span>
            </span>"
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
             한 방에서 24시간 붙어 있다 보면, <strong>말하기 애매한 순간</strong>들이 꼭 오니까요.<br/>
             친구 사이 멀어지지 않게, <strong>시스템</strong>으로 해결하세요.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button onClick={startOnboarding} className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl shadow-green-200 transition-all hover:scale-105 flex items-center justify-center gap-2 ring-4 ring-green-100">
              지금 우리 방 약속 만들기 <ArrowRight size={22} />
            </button>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                scrollToFeedback();
              }}
              className="group bg-white border-2 border-green-100 text-secondary px-8 py-4 rounded-full text-lg font-bold hover:bg-green-50 hover:border-green-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              정식 출시 등록하고 기프티콘 받기 <span className="group-hover:translate-x-1 transition-transform">🔔</span>
            </button>
          </div>
          
          <div className="mt-12 flex justify-center items-center gap-6 text-gray-500 text-sm font-bold animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
             <div className="flex items-center gap-1.5"><CheckCircle2 size={18} className="text-primary"/> <span>회원가입 없음</span></div>
             <div className="flex items-center gap-1.5"><CheckCircle2 size={18} className="text-primary"/> <span>설치 필요 없음</span></div>
             <div className="flex items-center gap-1.5"><CheckCircle2 size={18} className="text-primary"/> <span>100% 무료</span></div>
          </div>
        </div>
      </section>

      {/* Problem Section - Light Green Background */}
      <section className="py-24 bg-[#F7FDF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-primary font-black tracking-widest uppercase mb-3 text-sm bg-green-100 inline-block px-3 py-1 rounded-lg">Silent Stress</h2>
            <h3 className="text-3xl font-bold text-secondary">
               이런 고민, 혼자만 하는 게 아니에요.
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             {/* Card 1: Cleaning */}
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-green-100 relative overflow-hidden group hover:shadow-xl hover:shadow-green-100/50 transition-all hover:-translate-y-1">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:bg-green-100 transition-colors">🧹</div>
                <h4 className="text-xl font-bold text-secondary mb-3">"바닥에 머리카락, 먼지..."</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                   좁은 방이라 더 잘 보이는데,<br/>
                   매번 내가 치우자니 왠지 모르게 <span className="font-bold text-green-600 bg-green-50 px-1">손해 보는 기분.</span><br/>
                   묘하게 늘 눈치 게임 시작이죠?
                </p>
             </div>

             {/* Card 2: Money */}
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-green-100 group hover:shadow-xl hover:shadow-green-100/50 transition-all hover:-translate-y-1">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:bg-blue-100 transition-colors">💬</div>
                <h4 className="text-xl font-bold text-secondary mb-3">"배달비 N빵 3,000원..."</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                   같이 시켜 먹은 치킨 배달비.<br/>
                   깜빡한 룸메에게 다시 달라고 말하기엔<br/>
                   <span className="font-bold text-blue-600 bg-blue-50 px-1">너무 쪼잔해 보일까 봐</span> 망설여지나요?
                </p>
             </div>

             {/* Card 3: Lifestyle */}
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-green-100 group hover:shadow-xl hover:shadow-green-100/50 transition-all hover:-translate-y-1">
                <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:bg-yellow-100 transition-colors">🌙</div>
                <h4 className="text-xl font-bold text-secondary mb-3">"새벽 키보드, 아침 알람..."</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                   시험 기간 생활 패턴이 다를 때,<br/>
                   누구의 잘못도 아니지만 스트레스는 쌓이죠.<br/>
                   <span className="font-bold text-yellow-600 bg-yellow-50 px-1">미리 정한 '룰'</span>이 있다면 달라집니다.
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* Solution Section - White for Contrast */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
           <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="relative order-2 md:order-1">
                 <div className="absolute -inset-4 bg-primary/20 rounded-full blur-3xl opacity-40"></div>
                 <img 
                   src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                   alt="Happy Roommates" 
                   className="relative rounded-3xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 z-10 border-4 border-white"
                 />
                 {/* Floating UI Element - Stronger Shadow */}
                 <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-2xl shadow-xl shadow-gray-200 z-20 border border-gray-100 max-w-xs animate-bounce-slow hidden sm:block">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                         <Bell size={16} fill="currentColor" />
                       </div>
                       <p className="font-bold text-sm text-secondary">룸이즈 알림</p>
                    </div>
                    <p className="text-xs text-gray-600">"민지님, 이번 주 <span className="font-bold text-primary bg-green-50 px-1 rounded">화장실 청소</span> 잊지 않으셨죠? (룸이즈가 응원해요! ✨)"</p>
                 </div>
              </div>

              <div className="order-1 md:order-2">
                 <h2 className="text-primary font-black mb-3 tracking-widest uppercase text-sm">RoomEase Solution</h2>
                 <h3 className="text-3xl sm:text-4xl font-black text-secondary mb-6 leading-tight">
                   하기 힘든 말은 <span className="text-primary underline decoration-green-200 decoration-4 underline-offset-4">룸이즈</span>가 할게요.<br/>
                   퇴실할 때까지 웃으면서 지내요.
                 </h3>
                 <p className="text-gray-500 mb-8 text-lg leading-relaxed">
                   룸메이트에게 "청소 좀 해"라고 말하는 건 어렵죠.<br/>
                   이제 <strong>"앱이 알림 보냈네?"</strong>라고 가볍게 넘기세요.<br/>
                   감정 상할 일 없이, 깔끔하게 시스템으로 관리해드립니다.
                 </p>

                 <div className="space-y-6">
                    <div className="flex gap-4 p-4 rounded-2xl hover:bg-[#F7FDF9] transition-colors border border-transparent hover:border-green-100">
                       <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                         <Shield size={24} />
                       </div>
                       <div>
                          <h4 className="font-bold text-secondary text-lg">감정 소모 없는 약속 관리</h4>
                          <p className="text-sm text-gray-500 mt-1">누가 했는지 안 했는지, 앱이 객관적으로 기록하고 알려줍니다.</p>
                       </div>
                    </div>
                    <div className="flex gap-4 p-4 rounded-2xl hover:bg-[#F7FDF9] transition-colors border border-transparent hover:border-green-100">
                       <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center flex-shrink-0">
                         <MessageSquare size={24} />
                       </div>
                       <div>
                          <h4 className="font-bold text-secondary text-lg">깔끔한 소통의 시작</h4>
                          <p className="text-sm text-gray-500 mt-1">말로 하기 애매한 요청들, 시스템을 통해 자연스럽게 전달하세요.</p>
                       </div>
                    </div>
                    <div className="flex gap-4 p-4 rounded-2xl hover:bg-[#F7FDF9] transition-colors border border-transparent hover:border-green-100">
                       <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center flex-shrink-0">
                         <Heart size={24} />
                       </div>
                       <div>
                          <h4 className="font-bold text-secondary text-lg">처음 약속 그대로</h4>
                          <p className="text-sm text-gray-500 mt-1">입주 첫날의 다짐이 흐지부지되지 않도록 룸이즈가 도와드려요.</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="mt-10">
                    <button onClick={startOnboarding} className="bg-secondary text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-xl shadow-gray-200 w-full sm:w-auto justify-center ring-4 ring-gray-100">
                       <Sparkles size={20} className="text-yellow-300"/> 무료로 우리 방 약속 만들기
                    </button>
                    <p className="mt-3 text-xs text-gray-400 text-center sm:text-left font-medium">
                      * 3분이면 룸메이트와 공유할 수 있는 '생활 약속'이 완성돼요.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Join / Footer - Feedback Loop */}
      <section id="join" className="py-24 bg-[#1A2A36] text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
          <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold mb-6 text-green-300">
             💌 여러분의 목소리가 필요해요
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">정식 런칭 소식을 가장 먼저 받아보세요!</h2>
          <p className="text-gray-300 mb-10 text-lg leading-relaxed">
            룸이즈는 아직 성장 중입니다.<br/>
            여러분의 소중한 피드백으로 더 나은 기숙사 생활을 만들어갈게요.<br/>
            <span className="text-white font-medium opacity-80 mt-2 block text-sm">(참여해주신 분들께는 정식 출시 시 특별한 혜택을 드립니다)</span>
          </p>
          
          {submitted ? (
             <div className="bg-white/10 border border-white/20 p-8 rounded-3xl animate-fade-in backdrop-blur-md shadow-2xl">
               <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg border-4 border-green-400">🎉</div>
               <h3 className="text-2xl font-bold text-white mb-2">소중한 의견 감사합니다!</h3>
               <p className="text-gray-200">
                 보내주신 응원에 힘입어,<br/>
                 더 멋진 서비스로 찾아뵙겠습니다.
               </p>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left bg-white/5 p-6 sm:p-8 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">이메일 주소</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="알림 받으실 이메일을 입력해주세요"
                  className="w-full px-5 py-4 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-4 focus:ring-primary/50 shadow-inner placeholder:text-gray-400 border border-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">하고 싶은 말 (선택)</label>
                <textarea 
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  placeholder="응원, 기능 제안, 혹은 현재 겪고 있는 룸메이트 고충을 자유롭게 적어주세요. 추첨하여 기프티콘을 드립니다 🎁"
                  className="w-full px-5 py-4 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-4 focus:ring-primary/50 h-32 resize-none shadow-inner placeholder:text-gray-400 border border-gray-100"
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-primary/30 transform hover:-translate-y-1 text-lg mt-2 ring-4 ring-primary/20"
              >
                {isSubmitting ? '제출 중...' : '지금 함께하기'}
              </button>
            </form>
          )}
        </div>
      </section>
      
      <footer className="bg-[#15232d] py-12 border-t border-gray-800">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-black text-white mb-6 tracking-tight">RoomEase</h2>
            <div className="flex justify-center gap-8 mb-8 text-gray-400 text-sm font-medium">
               <a href="#" className="hover:text-primary transition-colors">서비스 소개</a>
               <a href="#" className="hover:text-primary transition-colors">개인정보처리방침</a>
               <a href="#" className="hover:text-primary transition-colors">문의하기</a>
            </div>
            <p className="text-gray-600 text-xs leading-relaxed">
               &copy; {new Date().getFullYear()} RoomEase. All Right Reserved.<br/>
               Designed for peace in every dorm room.
            </p>
         </div>
      </footer>
    </div>
  );
};

export default Landing;
