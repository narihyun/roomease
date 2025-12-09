import React, { createContext, useContext, useState, PropsWithChildren } from 'react';
import { AppState, Task, StockItem, Expense, StockStatus, User, TaskType } from '../types';
import { INITIAL_STATE, generateInitialsAvatar } from '../constants';
import { createHouseInBackend, updateHouseInBackend, getHouseFromBackend } from '../services/backendApi';

interface AppContextType extends AppState {
  setupHouse: (userName: string, houseName: string) => Promise<void>;
  updateHouseInfo: (userName: string, houseName: string) => void;
  addRoommate: (name: string) => void;
  removeRoommate: (id: string) => void;
  updateRoommateName: (id: string, name: string) => void;
  addRule: (ruleData: { title: string; frequency: string; specificDay: string; assignmentType: 'Rotate' | 'Fixed'; assigneeIds: string[] }) => void;
  updateTask: (taskId: string, ruleData: { title: string; frequency: string; specificDay: string; assignmentType: 'Rotate' | 'Fixed'; assigneeIds: string[] }) => void;
  deleteTask: (taskId: string) => void;
  setHouseMemo: (memo: string) => void;
  completeOnboarding: () => void;
  updateStockStatus: (id: string, status: StockStatus) => void;
  toggleTaskCompletion: (id: string) => void;
  addExpense: (expense: Expense) => void;
  loadHouseData: (houseId: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  // Sync to backend whenever state changes
  const syncToBackend = async (newState: AppState) => {
    if (newState.houseId) {
      try {
        await updateHouseInBackend(newState.houseId, newState);
      } catch (error) {
        console.error('[AppContext] syncToBackend error:', error);
      }
    }
  };

  // Initialize or Create House
const setupHouse = async (userName: string, houseName: string) => {
  const user: User = {
    id: 'u_' + Math.random().toString(36).substr(2, 5),
    name: userName,
    avatar: generateInitialsAvatar(userName),
    isCurrentUser: true
  };
  
  // 1단계: 임시 ID 생성 (즉시)
  const tempHouseId = `${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;
  
  const tempState = {
    ...INITIAL_STATE,
    houseName,
    currentUser: user,
    roomies: [user],
    houseId: tempHouseId // 임시 ID 바로 설정
  };

  // 2단계: 즉시 state 업데이트 (사용자는 바로 다음 단계로)
  setState(tempState);

  // 3단계: 백그라운드에서 백엔드 저장 (기다리지 않음)
  createHouseInBackend(tempState).then((result) => {
    if (result.success && result.houseId) {
      console.log('[AppContext] ✅ House saved to backend:', result.houseId);
      // ID가 바뀌었다면 업데이트 (보통은 같음)
      if (result.houseId !== tempHouseId) {
        setState(prev => ({ ...prev, houseId: result.houseId }));
      }
    } else {
      console.warn('[AppContext] ⚠️ Backend save failed, using temp ID');
    }
  }).catch((error) => {
    console.error('[AppContext] ❌ Backend error:', error);
  });
};

  // Update existing House Info (for Edit Mode)
  const updateHouseInfo = (userName: string, houseName: string) => {
    setState(prev => {
      const updatedUser = { ...prev.currentUser, name: userName, avatar: generateInitialsAvatar(userName) };
      const updatedRoomies = prev.roomies.map(r => 
        r.id === updatedUser.id ? { ...r, name: userName, avatar: updatedUser.avatar } : r
      );

      const newState = {
        ...prev,
        houseName,
        currentUser: updatedUser,
        roomies: updatedRoomies
      };
      
      syncToBackend(newState);
      return newState;
    });
  };

  const loadHouseData = async (houseId: string): Promise<boolean> => {
    console.log('[AppContext] 🔵 loadHouseData START - houseId:', houseId);
    
    try {
      console.log('[AppContext] 📡 Calling getHouseFromBackend...');
      const result = await getHouseFromBackend(houseId);
      
      console.log('[AppContext] 📥 getHouseFromBackend returned:', {
        success: result.success,
        hasData: !!result.data,
        dataKeys: result.data ? Object.keys(result.data) : []
      });
      
      if (!result.success) {
        console.error('[AppContext] ❌ Backend request failed');
        return false;
      }
      
      if (!result.data) {
        console.error('[AppContext] ❌ No data in successful response');
        return false;
      }

      // Validate that we have essential data
      const hasEssentialData = result.data.houseName || result.data.roomies?.length > 0;
      if (!hasEssentialData) {
        console.error('[AppContext] ❌ Data exists but lacks essential fields:', result.data);
        return false;
      }

      console.log('[AppContext] ✅ Data validated, setting state...');
      console.log('[AppContext] 📊 Loaded data:', {
        houseName: result.data.houseName,
        roomiesCount: result.data.roomies?.length,
        tasksCount: result.data.tasks?.length,
        memo: result.data.houseMemo ? 'exists' : 'empty'
      });
      
      // Set state with loaded data
      const newState = {
        ...result.data,
        houseId: houseId,
        isSetup: false // Keep in edit mode
      };

      console.log('[AppContext] 🔄 Calling setState with newState');
      setState(newState);
      
      console.log('[AppContext] ✅ setState completed successfully');
      return true;
      
    } catch (error) {
      console.error('[AppContext] 💥 Exception in loadHouseData:', error);
      console.error('[AppContext] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return false;
    }
  };

  const addRoommate = (name: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        roomies: [...prev.roomies, {
          id: `u_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name,
          avatar: generateInitialsAvatar(name),
          isCurrentUser: false
        }]
      };
      syncToBackend(newState);
      return newState;
    });
  };

  const removeRoommate = (id: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        roomies: prev.roomies.filter(r => r.id !== id)
      };
      syncToBackend(newState);
      return newState;
    });
  };

  const updateRoommateName = (id: string, name: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        roomies: prev.roomies.map(r => r.id === id ? { ...r, name, avatar: generateInitialsAvatar(name) } : r)
      };
      syncToBackend(newState);
      return newState;
    });
  };

  const calculateRuleLogic = (
    ruleData: { assignmentType: 'Rotate' | 'Fixed'; assigneeIds: string[] },
    allRoomies: User[]
  ) => {
    const { assignmentType, assigneeIds } = ruleData;
    let nextAssigneeId = undefined;
    let rotationOrder = undefined;
    let primaryAssigneeId = assigneeIds[0];

    if (assignmentType === 'Rotate') {
      const memberIds = allRoomies.map(r => r.id);
      let startIndex = memberIds.indexOf(primaryAssigneeId);
      if (startIndex === -1) {
         startIndex = 0;
         primaryAssigneeId = memberIds[0];
      }
      rotationOrder = memberIds;
      const nextIndex = (startIndex + 1) % memberIds.length;
      nextAssigneeId = memberIds[nextIndex];
    }
    return { primaryAssigneeId, nextAssigneeId, rotationOrder };
  };

  const addRule = (ruleData: { title: string; frequency: string; specificDay: string; assignmentType: 'Rotate' | 'Fixed'; assigneeIds: string[] }) => {
    setState(prev => {
      const { title, frequency, specificDay, assignmentType, assigneeIds } = ruleData;
      const { primaryAssigneeId, nextAssigneeId, rotationOrder } = calculateRuleLogic({ assignmentType, assigneeIds }, prev.roomies);

      const newTask: Task = {
        id: `t_${Date.now()}_${Math.random()}`,
        title,
        type: TaskType.ROLE,
        assigneeId: primaryAssigneeId,
        assignees: assignmentType === 'Fixed' ? assigneeIds : undefined,
        dueDate: specificDay, 
        completed: false,
        frequency,
        specificDay,
        assignmentType,
        nextAssigneeId,
        rotationOrder
      };
      
      const newState = { ...prev, tasks: [...prev.tasks, newTask] };
      syncToBackend(newState);
      return newState;
    });
  };

  const updateTask = (taskId: string, ruleData: { title: string; frequency: string; specificDay: string; assignmentType: 'Rotate' | 'Fixed'; assigneeIds: string[] }) => {
    setState(prev => {
      const { title, frequency, specificDay, assignmentType, assigneeIds } = ruleData;
      const { primaryAssigneeId, nextAssigneeId, rotationOrder } = calculateRuleLogic({ assignmentType, assigneeIds }, prev.roomies);

      const updatedTasks = prev.tasks.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          title,
          frequency,
          specificDay,
          assignmentType,
          assigneeId: primaryAssigneeId,
          assignees: assignmentType === 'Fixed' ? assigneeIds : undefined,
          nextAssigneeId,
          rotationOrder
        };
      });

      const newState = { ...prev, tasks: updatedTasks };
      syncToBackend(newState);
      return newState;
    });
  };

  const deleteTask = (taskId: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        tasks: prev.tasks.filter(t => t.id !== taskId)
      };
      syncToBackend(newState);
      return newState;
    });
  };

  const setHouseMemo = (memo: string) => {
    setState(prev => {
      const newState = { ...prev, houseMemo: memo };
      syncToBackend(newState);
      return newState;
    });
  };

  const completeOnboarding = () => {
    setState(prev => ({ ...prev, isSetup: true }));
  };

  const updateStockStatus = (id: string, status: StockStatus) => {
    setState(prev => ({
      ...prev,
      stock: prev.stock.map(item => 
        item.id === id ? { ...item, status, updatedAt: 'Just now' } : item
      )
    }));
  };

  const toggleTaskCompletion = (id: string) => {
    setState(prev => {
      const updatedTasks = prev.tasks.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      return { ...prev, tasks: updatedTasks };
    });
  };

  const addExpense = (expense: Expense) => {
    setState(prev => ({
      ...prev,
      expenses: [expense, ...prev.expenses]
    }));
  };

  return (
    <AppContext.Provider value={{ 
      ...state, 
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
      updateStockStatus, 
      toggleTaskCompletion, 
      addExpense,
      loadHouseData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};