// Mock data for development
const mockUsers = [
  { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active' },
  { id: 2, name: 'Vital Officer', email: 'officer@example.com', role: 'officer', status: 'active' },
  { id: 3, name: 'Data Analyst', email: 'analyst@example.com', role: 'statistician', status: 'active' },
  { id: 4, name: 'New User', email: 'new@example.com', role: 'user', status: 'pending' },
];

const mockRecords = [
  { id: 1, type: 'birth', name: 'John Doe', date: '2025-10-15', status: 'Approved' },
  { id: 2, type: 'death', name: 'Jane Smith', date: '2025-10-16', status: 'Pending' },
  { id: 3, type: 'marriage', name: 'John & Jane', date: '2025-10-17', status: 'Approved' },
  { id: 4, type: 'divorce', name: 'Mike & Sarah', date: '2025-10-18', status: 'Rejected' },
];

export const getAdminStats = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    totalUsers: mockUsers.length,
    activeToday: mockUsers.filter(u => u.status === 'active').length,
    pendingApprovals: mockUsers.filter(u => u.status === 'pending').length,
    totalRecords: mockRecords.length,
    recentActivity: [
      { id: 1, description: 'New user registered: New User', timestamp: new Date().toISOString() },
      { id: 2, description: 'Vital record updated: John Doe (Birth)', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
      { id: 3, description: 'User logged in: admin@example.com', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    ]
  };
};

export const getOfficerStats = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    totalRecords: mockRecords.length,
    pendingReview: mockRecords.filter(r => r.status === 'Pending').length,
    approved: mockRecords.filter(r => r.status === 'Approved').length,
    rejected: mockRecords.filter(r => r.status === 'Rejected').length,
    recentRecords: mockRecords
  };
};

export const getUsers = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { data: mockUsers };
};

export const updateUserStatus = async (userId, status) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const user = mockUsers.find(u => u.id === userId);
  if (user) {
    user.status = status;
    return { data: user };
  }
  throw new Error('User not found');
};
