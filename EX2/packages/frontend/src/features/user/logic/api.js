const BASE_URL = '/api/users';

// Mock API logic for user authentication (to be replaced with actual fetch)
export const loginUser = async (credentials) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.email && credentials.password) {
        resolve({
          user: {
            id: '1',
            name: credentials.email.split('@')[0],
            role: credentials.email.includes('child') ? 'child' : 'parent',
          },
          token: 'mock-jwt-token-123'
        });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 1000);
  });
};

export const registerUser = async (userData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userData.email && userData.password && userData.name) {
        resolve({
          user: {
            id: '1',
            name: userData.name,
            role: userData.role || 'parent',
          },
          token: 'mock-jwt-token-123'
        });
      } else {
        reject(new Error('Missing fields'));
      }
    }, 1000);
  });
};
