import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowRight, ArrowLeft, Home, Users, CheckCircle, Plus, X, Calendar, RotateCcw, User as UserIcon, PenTool, StickyNote, Trash2, Edit2, MessageSquare, Link as LinkIcon, Share2 } from 'lucide-react';

const CHORE_TEMPLATES = [
  { id: 'bath', icon: '🚽', label: '화장실 청소' },
  { id: 'trash', icon: '🗑️', label: '쓰레기 배출' },
  { id: 'kitchen', icon: '🍳', label: '주방 정리' },
  { id: 'recycle', icon: '♻️', label: '분리수거' },
  { id: 'laundry', icon: '🧺', label: '빨래 돌리기' },
  { id: 'shopping', icon: '🛒', label: '생필품 주문' },
  { id: 'floor', icon: '🧹', label: '바닥 청소' },
  { id: 'dishes', icon: '🍽️', label: '설거지' },
];

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    setupHouse, 
    updateHouseInfo,
    addRoommate, 
    removeRoommate,
    updateRoommateName,
    addRule, 
    updateTask, 
    deleteTask, 
    setHouseMemo, 
    completeOnboarding, 
    loadHouseData,
    roomies, 
    tasks, 
    houseName, 
    houseMemo, 
    currentUser,
    houseId
  } = useApp();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // ✅ 중요: 한 번만 실행되었는지 추적
  const hasLoadedRef = useRef(false);
  
  // Step 1 State
  const [myName, setMyName] = useState('');
  const [inputHouseName, setInputHouseName] = useState('');

  // Step 2 State
  const [roomieName, setRoomieName] = useState('');
  const [editingRoomieId, setEditingRoomieId] = useState<string | null>(null);

  // Step 3 State
  const [isEditing, setIsEditing] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  // Rule Form State
  const [ruleTitle, setRuleTitle] = useState('');
  const [frequency, setFrequency] = useState('매주');
  const [specificDay, setSpecificDay] = useState('월');
  const [assignmentType, setAssignmentType] = useState<'Rotate' | 'Fixed'>('Rotate');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  
  // Step 4 (Memo) State
  const [inputMemo, setInputMemo] = useState('');

  // ⚡ 최적화된 useEffect - 기존 Onboarding.tsx에서 이 부분만 교체

useEffect(() => {
  // 이미 로드했으면 스킵
  if (hasLoadedRef.current) return;
    
  const extractHouseIdFromLocation = (): string | null => {
    const fromSearch = new URLSearchParams(location.search).get('houseId');
    if (fromSearch) return fromSearch;

    if (location.hash) {
      const hashQuery = location.hash.split('?')[1];
      if (hashQuery) {
        const fromHash = new URLSearchParams(hashQuery).get('houseId');
        if (fromHash) return fromHash;
      }
    }

    return null;
  };

  const sharedHouseId = extractHouseIdFromLocation();
  if (!sharedHouseId) return;

  // 로드 시작
  hasLoadedRef.current = true;
  setIsLoading(true);
  
  // ⚡ 즉시 실행 - async/await 제거
  loadHouseData(sharedHouseId).then((success) => {
    if (!success) {
      console.error('[Onboarding] Failed to load house data');
      setLoadError(`집 정보를 불러올 수 없습니다`);
      setIsLoading(false);
      hasLoadedRef.current = false;
      return;
    }

    console.log('[Onboarding] ✅ Data loaded, moving to step 5');
    // ⚡ 딜레이 없이 즉시 이동
    setStep(5);
    setIsLoading(false);
  }).catch((error) => {
    console.error('[Onboarding] Error:', error);
    setLoadError('오류가 발생했습니다.');
    setIsLoading(false);
    hasLoadedRef.current = false;
  });
}, [location.search, location.hash, loadHouseData]);

  // ✅ 수정: local state 업데이트 - 별도 useEffect
  useEffect(() => {
    if (houseName && !inputHouseName) {
      console.log('[Onboarding] Updating inputHouseName:', houseName);
      setInputHouseName(houseName);
    }
    if (houseMemo && !inputMemo) {
      console.log('[Onboarding] Updating inputMemo:', houseMemo);
      setInputMemo(houseMemo);
    }
    if (currentUser && currentUser.name && !myName) {
      console.log('[Onboarding] Updating myName:', currentUser.name);
      setMyName(currentUser.name);
    }

    // Ensure default assignee when roomies loaded
    if (roomies && roomies.length > 0 && selectedAssignees.length === 0) {
      console.log('[Onboarding] Setting default assignee:', roomies[0].id);
      setSelectedAssignees([roomies[0].id]);
    }
  }, [houseName, houseMemo, currentUser, roomies]); // 이건 그대로 유지

  const handleStep1 = async () => {
  if (myName && inputHouseName) {
    if (houseId) {
      // Edit 모드
      updateHouseInfo(myName, inputHouseName);
      setStep(2);
    } else {
      // ⚡ Create 모드 - 로딩 없이 즉시 이동
      setupHouse(myName, inputHouseName); // await 제거!
      setStep(2); // 바로 다음 단계로
    }
  }
};

  const handleCopyLink = () => {
    if (!houseId) return;
    const url = `${window.location.origin}/#/onboarding?houseId=${houseId}`;
    console.log('[Onboarding] Copying link:', url);
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        window.prompt("초대 링크를 복사하세요:", url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      window.prompt("초대 링크를 복사하세요:", url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddOrUpdateRoommate = () => {
    if (roomieName) {
      if (editingRoomieId) {
        updateRoommateName(editingRoomieId, roomieName);
        setEditingRoomieId(null);
      } else {
        addRoommate(roomieName);
      }
      setRoomieName('');
    }
  };

  const startEditingRoommate = (user: any) => {
    setRoomieName(user.name);
    setEditingRoomieId(user.id);
  };

  const handleDeleteRoommate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeRoommate(id);
    if (editingRoomieId === id) {
      setEditingRoomieId(null);
      setRoomieName('');
    }
  };

  const resetForm = () => {
    setRuleTitle('');
    setCustomMode(false);
    setEditingTaskId(null);
    setFrequency('매주');
    setSpecificDay('월');
    setAssignmentType('Rotate');
    const firstId = roomies.length > 0 ? roomies[0].id : '';
    setSelectedAssignees(firstId ? [firstId] : []);
  };

  const openRuleEditor = (templateLabel?: string) => {
    resetForm();
    setRuleTitle(templateLabel || '');
    setCustomMode(!templateLabel);
    setIsEditing(true);
    if (roomies.length > 0 && selectedAssignees.length === 0) {
      setSelectedAssignees([roomies[0].id]);
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTaskId(task.id);
    setRuleTitle(task.title);
    setFrequency(task.frequency || '매주');
    setSpecificDay(task.specificDay || '월');
    setAssignmentType(task.assignmentType || 'Rotate');
    if (task.assignmentType === 'Fixed') {
      setSelectedAssignees(task.assignees || []);
    } else {
      setSelectedAssignees([task.assigneeId]);
    }
    const isTemplate = CHORE_TEMPLATES.some(t => t.label === task.title);
    setCustomMode(!isTemplate);
    setIsEditing(true);
  };

  const handleDeleteTask = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation(); 
    e.preventDefault();
    deleteTask(taskId);
  };

  const toggleAssignee = (id: string) => {
    if (assignmentType === 'Rotate') {
      setSelectedAssignees([id]);
    } else {
      if (selectedAssignees.includes(id)) {
        if (selectedAssignees.length > 1) {
          setSelectedAssignees(prev => prev.filter(uid => uid !== id));
        }
      } else {
        setSelectedAssignees(prev => [...prev, id]);
      }
    }
  };

  const handleSaveRule = () => {
    if (ruleTitle && selectedAssignees.length > 0) {
      const ruleData = {
        title: ruleTitle,
        frequency,
        specificDay,
        assignmentType,
        assigneeIds: selectedAssignees
      };

      if (editingTaskId) {
        updateTask(editingTaskId, ruleData);
      } else {
        addRule(ruleData);
      }
      setIsEditing(false);
      resetForm();
    }
  };

  const handleSaveMemo = () => {
    setHouseMemo(inputMemo);
    setStep(5);
  };

  const handleFinish = () => {
    navigate('/', { state: { scrollToJoin: true } });
  };

  const exitDemo = () => {
    navigate('/');
  };

  const getAssigneeNames = (ids?: string[]) => {
    if (!ids) return '';
    if (ids.length === roomies.length) return '모두';
    return ids.map(id => roomies.find(r => r.id === id)?.name).join(', ');
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold">집 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-secondary mb-2">오류 발생</h2>
          <p className="text-gray-500 mb-6">{loadError}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden">
      <button 
        onClick={exitDemo} 
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-50 rounded-full hover:bg-gray-100"
        title="Back to Landing Page"
      >
        <X size={24} />
      </button>

      <div className="w-full bg-gray-100 h-1 flex-shrink-0">
        <div 
          className="bg-primary h-1 transition-all duration-500 ease-out" 
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        
        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <Home size={24} />
            </div>
            <h1 className="text-3xl font-black text-secondary leading-tight">
              {houseId ? '집 정보 수정' : '반가워요!'}<br />
              {houseId ? '이름을 변경할까요?' : '어떤 집을\n만들고 싶으신가요?'}
            </h1>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">내 이름 (별명)</label>
                <input 
                  type="text" 
                  value={myName}
                  onChange={(e) => setMyName(e.target.value)}
                  placeholder="예: 루미"
                  className="w-full text-lg border-b-2 border-gray-200 py-2 focus:outline-none focus:border-primary transition-colors bg-transparent placeholder-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">우리 집 이름</label>
                <input 
                  type="text" 
                  value={inputHouseName}
                  onChange={(e) => setInputHouseName(e.target.value)}
                  placeholder="예: 해피하우스"
                  className="w-full text-lg border-b-2 border-gray-200 py-2 focus:outline-none focus:border-primary transition-colors bg-transparent placeholder-gray-300"
                />
              </div>
            </div>
            <button 
              onClick={handleStep1}
              disabled={!myName || !inputHouseName}
              className="w-full bg-secondary text-white font-bold py-4 rounded-2xl mt-8 flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {houseId ? '수정하고 다음으로' : '다음'} <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Roommates */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex items-center gap-2 mb-2">
               <button onClick={() => setStep(1)} className="p-1 -ml-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
                  <ArrowLeft size={24} />
               </button>
               <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                 <Users size={24} />
               </div>
            </div>

            {/* ✅ 수정: 제목만 남기고 초대 링크 버튼 제거 */}
            <h1 className="text-3xl font-black text-secondary leading-tight">
              누구와 함께<br />
              살고 계신가요?
            </h1>

            <p className="text-gray-400 text-sm">
              함께 규칙을 지킬 룸메이트를 추가해주세요.
            </p>
            
            <div className="flex gap-2 mb-4 overflow-x-auto py-2">
              {roomies.map((user) => (
                <div 
                  key={user.id} 
                  onClick={() => startEditingRoommate(user)}
                  className={`flex flex-col items-center flex-shrink-0 animate-scale-in relative group cursor-pointer p-1 rounded-lg transition-colors ${editingRoomieId === user.id ? 'bg-blue-50 ring-2 ring-blue-100' : 'hover:bg-gray-50'}`}
                >
                  <div className="relative">
                    <img src={user.avatar} className="w-12 h-12 rounded-full bg-gray-100" alt={user.name} />
                    {!user.isCurrentUser && (
                      <button 
                        onClick={(e) => handleDeleteRoommate(e, user.id)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                  <span className={`text-xs mt-1 font-medium truncate max-w-[60px] ${editingRoomieId === user.id ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                    {user.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                value={roomieName}
                onChange={(e) => setRoomieName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddOrUpdateRoommate()}
                placeholder={editingRoomieId ? "이름 수정 중..." : "룸메이트 이름 입력"}
                className={`flex-1 text-lg border-b-2 py-2 focus:outline-none bg-transparent placeholder-gray-300 transition-colors ${editingRoomieId ? 'border-blue-300 text-blue-600' : 'border-gray-200 focus:border-primary'}`}
              />
              <button 
                onClick={handleAddOrUpdateRoommate}
                disabled={!roomieName}
                className={`font-bold px-4 rounded-xl text-sm disabled:opacity-50 transition-colors ${editingRoomieId ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-secondary'}`}
              >
                {editingRoomieId ? '수정' : '추가'}
              </button>
              {editingRoomieId && (
                <button 
                  onClick={() => {
                    setEditingRoomieId(null);
                    setRoomieName('');
                  }}
                  className="text-gray-400 p-2"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <button 
              onClick={() => setStep(3)}
              className="w-full bg-secondary text-white font-bold py-4 rounded-2xl mt-8 flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
            >
              {roomies.length > 1 ? '다음' : '혼자 살아요 (Skip)'} <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 3: Detailed Rule Creation */}
        {step === 3 && (
          <div className="flex flex-col h-full animate-fade-in">
            {!isEditing ? (
              <>
                <div className="flex-none space-y-4 mb-4">
                  <div className="flex items-center gap-2">
                     <button onClick={() => setStep(2)} className="p-1 -ml-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
                        <ArrowLeft size={24} />
                     </button>
                     <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-primary">
                        <CheckCircle size={24} />
                     </div>
                  </div>
                  
                  <h1 className="text-2xl font-black text-secondary leading-tight">
                    우리 집 규칙 만들기
                  </h1>
                  <p className="text-gray-400 text-sm">
                    구체적으로 정할수록 갈등이 줄어들어요.<br/>
                    누가, 언제, 어떻게 할지 정해볼까요?
                  </p>
                </div>

                {/* Added Rules List */}
                {tasks.length > 0 && (
                  <div className="flex-none mb-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">작성된 약속들 ({tasks.length})</h3>
                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto no-scrollbar border border-gray-100 rounded-xl p-2 bg-gray-50">
                      {tasks.map(task => (
                        <div 
                          key={task.id} 
                          onClick={() => handleEditTask(task)}
                          className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm animate-scale-in group cursor-pointer hover:border-primary transition-colors relative"
                        >
                          <div className="flex items-center gap-3 pointer-events-none">
                            <span className="text-lg">{CHORE_TEMPLATES.find(t => t.label === task.title)?.icon || '📌'}</span>
                            <div>
                              <p className="font-bold text-sm text-secondary">{task.title}</p>
                              <p className="text-xs text-gray-400">
                                {task.frequency} • {task.specificDay} • {task.assignmentType === 'Rotate' ? '돌아가며' : `고정: ${getAssigneeNames(task.assignees)}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1 relative z-20" onClick={(e) => e.stopPropagation()}>
                             <button type="button" onClick={(e) => { e.stopPropagation(); handleEditTask(task); }} className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg"><Edit2 size={16} /></button>
                             <button type="button" onClick={(e) => handleDeleteTask(e, task.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto no-scrollbar -mx-2 px-2 pb-24">
                    <div className="grid grid-cols-2 gap-3">
                      {CHORE_TEMPLATES.map((item) => (
                        <button key={item.id} onClick={() => openRuleEditor(item.label)} className="p-4 rounded-2xl border border-gray-100 hover:border-primary/50 hover:bg-gray-50 text-left transition-all flex flex-col items-center gap-2 group"><span className="text-3xl group-hover:scale-110 transition-transform">{item.icon}</span><span className="text-sm font-bold text-gray-600">{item.label}</span></button>
                      ))}
                      <button onClick={() => openRuleEditor()} className="p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary/50 hover:bg-gray-50 text-left transition-all flex flex-col items-center gap-2 group justify-center text-gray-400 hover:text-primary"><Plus size={32} /><span className="text-sm font-bold">직접 입력</span></button>
                    </div>
                </div>

                
                <div className="sticky bottom-0 left-0 right-0 -mx-8 px-8 py-8 bg-gradient-to-t from-white via-white to-transparent">
                  <button 
                    onClick={() => setStep(4)} 
                    disabled={tasks.length === 0} 
                    className="w-full bg-secondary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {tasks.length === 0 ? '규칙을 하나 이상 추가해주세요' : '다음으로'} <ArrowRight size={18} />
                  </button>
                </div>

              </>
            ) : (
                <div className="flex flex-col h-full animate-slide-up pt-16 pb-4">
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-secondary">{editingTaskId ? '규칙 수정하기' : (customMode ? '새로운 규칙' : ruleTitle)}</h2>
                    <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-100 rounded-full"><X size={18}/></button>
                 </div>
                 <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pb-20">
                    {(customMode || editingTaskId) && (
                      <div><label className="text-xs font-bold text-gray-400 uppercase mb-2 block">규칙 이름</label><input type="text" value={ruleTitle} onChange={(e) => setRuleTitle(e.target.value)} className="w-full text-lg border-b-2 border-gray-200 py-2 focus:outline-none focus:border-primary bg-transparent placeholder-gray-300" placeholder="예: 고양이 화장실 청소"/></div>
                    )}
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1"><Calendar size={14}/> 언제 할까요?</label>
                      <div className="flex gap-2 mb-4">
                         {['매일', '매주', '격주', '매달'].map(freq => (
                           <button key={freq} onClick={() => setFrequency(freq)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${frequency === freq ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-400'}`}>{freq}</button>
                         ))}
                      </div>
                      {(frequency === '매주' || frequency === '격주') && (
                        <div className="flex justify-between bg-gray-50 p-2 rounded-xl">{DAYS.map(day => (<button key={day} onClick={() => setSpecificDay(day)} className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${specificDay === day ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-white'}`}>{day}</button>))}</div>
                      )}
                      {frequency === '매달' && (
                         <select value={specificDay} onChange={(e) => setSpecificDay(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none text-sm">{Array.from({length: 31}, (_, i) => i + 1).map(d => (<option key={d} value={`${d}일`}>매달 {d}일</option>))} <option value="말일">매달 말일</option></select>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1"><UserIcon size={14}/> 누가 할까요?</label>
                      <div className="flex gap-4 mb-4">
                         <button onClick={() => { setAssignmentType('Rotate'); setSelectedAssignees([roomies[0]?.id || '']); }} className={`flex-1 p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${assignmentType === 'Rotate' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-400'}`}><RotateCcw size={24} /><span className="text-sm font-bold">돌아가면서</span></button>
                         <button onClick={() => setAssignmentType('Fixed')} className={`flex-1 p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${assignmentType === 'Fixed' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-400'}`}><UserIcon size={24} /><span className="text-sm font-bold">고정 담당</span></button>
                      </div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">{assignmentType === 'Rotate' ? '누구부터 시작할까요? (1명)' : '담당자 선택 (복수 가능)'}</label>
                      <div className="flex gap-3 overflow-x-auto py-2">
                        {roomies.map(user => {
                          const isSelected = selectedAssignees.includes(user.id);
                          return (
                            <button 
                              key={user.id} 
                              onClick={() => toggleAssignee(user.id)} 
                              className={`flex flex-col items-center flex-shrink-0 transition-all p-1 ${isSelected ? 'opacity-100 scale-105' : 'opacity-40 grayscale'}`}
                            >
                              {/* ↑ p-1 추가 */}
                              <div className={`relative ${isSelected ? 'ring-2 ring-primary ring-offset-1 rounded-full' : ''}`}>
                                <img src={user.avatar} className="w-10 h-10 rounded-full bg-gray-100" />
                                {assignmentType === 'Rotate' && isSelected && (
                                  <span className="absolute -right-1 -bottom-1 bg-primary text-white text-[10px] px-1.5 rounded-full border border-white">
                                    Start
                                  </span>
                                )}
                                {assignmentType === 'Fixed' && isSelected && (
                                  <span className="absolute -right-1 -bottom-1 bg-primary text-white p-1 rounded-full border border-white">
                                    <CheckCircle size={10} />
                                  </span>
                                )}
                              </div>
                              <span className="text-xs mt-1 font-medium">{user.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                 </div>
                 <div className="absolute bottom-0 left-0 w-full p-8 bg-white border-t border-gray-100">
                    <button onClick={handleSaveRule} disabled={!ruleTitle || selectedAssignees.length === 0} className="w-full bg-secondary text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-gray-800 transition-all disabled:opacity-50">{editingTaskId ? '규칙 수정하기' : '규칙 추가하기'}</button>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: House Memo */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
               <button onClick={() => setStep(3)} className="p-1 -ml-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
                  <ArrowLeft size={24} />
               </button>
               <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500">
                <StickyNote size={24} />
               </div>
            </div>
            
            <h1 className="text-3xl font-black text-secondary leading-tight">
              마지막으로<br />
              전하고 싶은 말
            </h1>
            <p className="text-gray-400 text-sm">
              우리 집만의 특별한 규칙이나,<br/>서로에게 지키고 싶은 매너를 적어보세요.
            </p>
            
            <textarea 
              value={inputMemo}
              onChange={(e) => setInputMemo(e.target.value)}
              placeholder="예: 
- 밤 12시 이후엔 조용히 하기
- 외부인 데려올 땐 미리 말하기
- 다 먹은 그릇은 바로 싱크대에!"
              className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-primary resize-none text-base leading-relaxed"
            />

            <button 
              onClick={handleSaveMemo}
              className="w-full bg-secondary text-white font-bold py-4 rounded-2xl mt-8 flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
            >
              약속 확정하기 <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 5: Certificate */}
        {step === 5 && (
          <div className="flex flex-col h-full py-6 animate-fade-in">
            <h1 className="text-2xl font-black text-secondary text-center mb-6">
              생활 약속이<br/>만들어졌어요!
            </h1>
            
            <div className="bg-white border-4 border-double border-gray-200 p-6 rounded-xl shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-500 relative flex-1 flex flex-col mb-4">
               <div className="text-center border-b-2 border-gray-100 pb-4 mb-4">
                  <div className="text-primary font-black text-lg tracking-widest uppercase mb-1">Living Agreement</div>
                  <h2 className="text-2xl font-bold text-secondary">{houseName}</h2>
               </div>
               <div className="flex justify-center -space-x-2 mb-6">
                  {roomies.map(r => (
                    <img key={r.id} src={r.avatar} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100" />
                  ))}
               </div>
               <div className="flex-1 overflow-y-auto space-y-3 mb-6 no-scrollbar">
                  {tasks.map((task, idx) => (
                    <div key={task.id} className="flex items-start gap-3 text-sm border-b border-gray-50 pb-2 last:border-0">
                       <span className="font-bold text-primary font-mono">{String(idx + 1).padStart(2, '0')}</span>
                       <div>
                          <p className="font-bold text-gray-800">{task.title}</p>
                          <p className="text-xs text-gray-500">{task.frequency} {task.specificDay && `• ${task.specificDay}`} • {task.assignmentType === 'Rotate' ? '돌아가며' : `담당: ${getAssigneeNames(task.assignees)}`}</p>
                       </div>
                    </div>
                  ))}
                  {houseMemo && (
                    <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                      <p className="text-[10px] font-bold text-yellow-600 uppercase mb-1">Memo</p>
                      <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{houseMemo}</p>
                    </div>
                  )}
               </div>
               <div className="mt-auto pt-4 border-t-2 border-gray-100">
                  <div className="flex justify-between items-end">
                     <div className="text-left">
                        <p className="text-[10px] text-gray-400 uppercase">Effective Date</p>
                        <p className="font-bold text-sm text-secondary">{new Date().toLocaleDateString()}</p>
                     </div>
                     <div className="text-right">
                        <div className="h-8 w-24 border-b border-gray-300 mb-1"></div>
                        <p className="text-[10px] text-gray-400 uppercase">Signature</p>
                     </div>
                  </div>
               </div>
               <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg transform rotate-12 border-4 border-white">SEALED</div>
            </div>

            <p className="text-center text-xs text-gray-400 mb-4 px-4">
              초대 링크를 복사해서 룸메이트에게 공유해보세요!<br/>
              함께 약속을 지켜나갈 수 있습니다.
            </p>
            
            <div className="flex flex-col gap-2">
               {/* Navigates to Step 1 for full edit flow */}
               <button onClick={() => setStep(1)} className="w-full bg-white text-gray-700 border border-gray-200 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                  <Edit2 size={18} /> 규칙 수정하기
               </button>
               <div className="flex gap-2">
                  <button onClick={handleCopyLink} className="flex-1 bg-green-50 text-primary border border-primary/20 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-100 transition-all">
                      {copied ? <CheckCircle size={18} /> : <LinkIcon size={18} />} {copied ? '복사 완료' : '링크 복사'}
                  </button>
                  <button onClick={handleFinish} className="flex-1 bg-secondary text-white font-bold py-3 rounded-2xl shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                      <MessageSquare size={18} /> 피드백 남기기
                  </button>
               </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
