const BASE_URL = '/api/users';

export const registerParent = async ({ name, email, password }) => {
  const res = await fetch(`${BASE_URL}/parents/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'שגיאה בהרשמה');
  }
  return res.json();
};

export const loginParent = async ({ email, password }) => {
  const res = await fetch(`${BASE_URL}/parents/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'שגיאה בהתחברות הורה');
  }
  return res.json();
};

export const loginChild = async ({ username, pin }) => {
  const res = await fetch(`${BASE_URL}/children/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, pin }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'שגיאה בהתחברות תלמיד');
  }
  return res.json();
};

export const getChildren = async (token) => {
  const res = await fetch(`${BASE_URL}/children`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'שגיאה בטעינת ילדים');
  }
  return res.json();
};

export const addChild = async (childData, token) => {
  const res = await fetch(`${BASE_URL}/children`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(childData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'שגיאה בהוספת ילד');
  }
  return res.json();
};
