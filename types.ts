
export enum StockStatus {
  EMPTY = 'Empty',
  LOW = 'Low',
  OKAY = 'Okay',
  PLENTY = 'Plenty'
}

export enum TaskType {
  ROLE = 'Role',
  ONE_OFF = 'OneOff',
  PAYMENT = 'Payment'
}

export interface User {
  id: string;
  name: string;
  avatar: string; // URL
  isCurrentUser: boolean;
}

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  assigneeId: string; // Current person responsible (or primary contact)
  assignees?: string[]; // For fixed tasks with multiple people
  dueDate: string; 
  completed: boolean;
  
  // Enhanced Rule Properties
  frequency?: string; // "Daily", "Weekly", "Bi-weekly", "Monthly"
  specificDay?: string; // "Monday", "1st", etc.
  assignmentType?: 'Rotate' | 'Fixed';
  nextAssigneeId?: string; // For rotating roles
  rotationOrder?: string[]; // Array of User IDs in order
  
  amount?: number;
}

export interface StockItem {
  id: string;
  name: string;
  category: 'Household' | 'Groceries' | 'Cleaning';
  status: StockStatus;
  updatedAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  payerId: string;
  date: string;
}

export interface AppState {
  isSetup: boolean;
  houseId: string | null; // For DB syncing
  houseName: string;
  houseMemo?: string;
  currentUser: User;
  roomies: User[];
  tasks: Task[];
  stock: StockItem[];
  expenses: Expense[];
}
