import { User, Company, Expense, UserRole, ExpenseStatus, ApprovalRule } from '../types';

const STORAGE_KEYS = {
  USERS: 'em_users',
  COMPANY: 'em_company',
  EXPENSES: 'em_expenses',
  SESSION: 'em_session',
  RULES: 'em_rules',
  HAS_SEEDED: 'em_has_seeded'
};

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockDatabase {
  constructor() {
    this.seed();
  }

  private seed() {
    if (localStorage.getItem(STORAGE_KEYS.HAS_SEEDED)) return;

    // Create Initial Company
    const companyId = crypto.randomUUID();
    const company: Company = {
      id: companyId,
      name: 'Global Tech Industries',
      country: 'United States',
      currency: 'USD'
    };
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(company));

    // Create Users
    const adminId = crypto.randomUUID();
    const managerId = crypto.randomUUID();
    const empId = crypto.randomUUID();

    const users: User[] = [
      {
        id: adminId,
        name: 'Admin User',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        companyId,
        password: 'password'
      },
      {
        id: managerId,
        name: 'Sarah Manager',
        email: 'manager@example.com',
        role: UserRole.MANAGER,
        companyId,
        password: 'password',
        managerId: adminId
      },
      {
        id: empId,
        name: 'John Employee',
        email: 'employee@example.com',
        role: UserRole.EMPLOYEE,
        companyId,
        password: 'password',
        managerId: managerId
      }
    ];
    this.saveUsers(users);

    // Create Sample Expenses
    const expenses: Expense[] = [
      {
        id: crypto.randomUUID(),
        userId: empId,
        amount: 45.00,
        currency: 'USD',
        convertedAmount: 45.00,
        category: 'Meals',
        description: 'Team Lunch',
        merchant: 'Burger King',
        date: new Date().toISOString().split('T')[0],
        status: ExpenseStatus.PENDING,
        approverId: managerId,
        history: []
      },
      {
        id: crypto.randomUUID(),
        userId: empId,
        amount: 1200.00,
        currency: 'USD',
        convertedAmount: 1200.00,
        category: 'Software',
        description: 'Yearly Subscription',
        merchant: 'Adobe',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        status: ExpenseStatus.PENDING,
        approverId: managerId, // Should escalate based on logic, but initially assigned to manager
        history: []
      },
      {
        id: crypto.randomUUID(),
        userId: managerId,
        amount: 150.00,
        currency: 'USD',
        convertedAmount: 150.00,
        category: 'Travel',
        description: 'Taxi to Airport',
        merchant: 'Uber',
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        status: ExpenseStatus.APPROVED,
        history: [{ action: 'APPROVED', actorName: 'Admin User', date: new Date().toISOString() }]
      }
    ];
    this.saveExpenses(expenses);

    localStorage.setItem(STORAGE_KEYS.HAS_SEEDED, 'true');
  }

  private getUsers(): User[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  private saveUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  private getExpenses(): Expense[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  }

  private saveExpenses(expenses: Expense[]) {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }

  // --- Auth & Company ---

  async registerCompany(companyName: string, country: string, currency: string, adminName: string, adminEmail: string, password: string): Promise<User> {
    await delay(500);
    const companyId = crypto.randomUUID();
    const company: Company = { id: companyId, name: companyName, country, currency };
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(company));

    // Create Admin
    const admin: User = {
      id: crypto.randomUUID(),
      name: adminName,
      email: adminEmail,
      role: UserRole.ADMIN,
      companyId,
      password 
    };
    
    this.saveUsers([admin]);
    return admin;
  }

  async login(email: string, password: string): Promise<User | null> {
    await delay(500);
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
      return user;
    }
    return null;
  }

  getCurrentUser(): User | null {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || 'null');
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  getCompany(): Company | null {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPANY) || 'null');
  }

  // --- User Management ---

  async createUser(currentUser: User, newUser: Partial<User>): Promise<User> {
    await delay(300);
    if (currentUser.role !== UserRole.ADMIN) throw new Error("Unauthorized");
    
    const users = this.getUsers();
    const user: User = {
      id: crypto.randomUUID(),
      companyId: currentUser.companyId,
      name: newUser.name!,
      email: newUser.email!,
      password: newUser.password!,
      role: newUser.role!,
      managerId: newUser.managerId
    };
    users.push(user);
    this.saveUsers(users);
    return user;
  }

  getAllUsers(): User[] {
    return this.getUsers();
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  // --- Expenses ---

  async submitExpense(expenseData: Partial<Expense>, currentUser: User): Promise<Expense> {
    await delay(500);
    const expenses = this.getExpenses();
    const company = this.getCompany();

    // Determine initial approver (User's manager, or Admin if no manager)
    let initialApproverId = currentUser.managerId;
    if (!initialApproverId) {
        // If no manager, find an admin
        const admin = this.getUsers().find(u => u.role === UserRole.ADMIN);
        initialApproverId = admin?.id;
    }

    const expense: Expense = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      amount: expenseData.amount!,
      currency: expenseData.currency || company?.currency || 'USD',
      convertedAmount: expenseData.amount, // Simplified: Assume 1:1 if same, otherwise we'd call API
      category: expenseData.category!,
      description: expenseData.description!,
      merchant: expenseData.merchant || 'Unknown',
      date: expenseData.date!,
      receiptImage: expenseData.receiptImage,
      status: ExpenseStatus.PENDING,
      approverId: initialApproverId,
      history: [{
        action: 'SUBMITTED',
        actorName: currentUser.name,
        date: new Date().toISOString(),
        comment: 'Expense submitted'
      }]
    };

    expenses.push(expense);
    this.saveExpenses(expenses);
    return expense;
  }

  getExpensesForUser(userId: string): Expense[] {
    return this.getExpenses().filter(e => e.userId === userId);
  }

  getPendingApprovals(managerId: string): Expense[] {
    return this.getExpenses().filter(e => e.approverId === managerId && e.status === ExpenseStatus.PENDING);
  }

  // For Admin Dashboard: Get all expenses associated with the company
  getCompanyExpenses(companyId: string): Expense[] {
    const users = this.getUsers().filter(u => u.companyId === companyId);
    const userIds = users.map(u => u.id);
    return this.getExpenses().filter(e => userIds.includes(e.userId));
  }

  getAllExpenses(): Expense[] {
    return this.getExpenses();
  }

  async processExpense(expenseId: string, action: 'APPROVE' | 'REJECT', comment: string, actor: User): Promise<void> {
    await delay(300);
    const expenses = this.getExpenses();
    const idx = expenses.findIndex(e => e.id === expenseId);
    if (idx === -1) return;

    const expense = expenses[idx];
    
    // Add history
    expense.history.push({
      action: action,
      actorName: actor.name,
      date: new Date().toISOString(),
      comment
    });

    if (action === 'REJECT') {
      expense.status = ExpenseStatus.REJECTED;
      expense.approverId = undefined;
    } else {
      // Logic for Multi-level approval mock
      // If amount > 1000 and current approver is NOT admin, escalate to Admin
      if (expense.amount > 1000 && actor.role !== UserRole.ADMIN) {
         const admin = this.getUsers().find(u => u.role === UserRole.ADMIN);
         if (admin) {
           expense.approverId = admin.id;
           expense.status = ExpenseStatus.ESCALATED; // Intermediate state
           expense.history.push({
             action: 'ESCALATED',
             actorName: 'System',
             date: new Date().toISOString(),
             comment: 'High value expense escalated to Admin'
           });
         } else {
           expense.status = ExpenseStatus.APPROVED;
           expense.approverId = undefined;
         }
      } else {
        expense.status = ExpenseStatus.APPROVED;
        expense.approverId = undefined;
      }
    }

    expenses[idx] = expense;
    this.saveExpenses(expenses);
  }
}

export const db = new MockDatabase();