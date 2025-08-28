export const getUser = () => {
  try { 
    return JSON.parse(localStorage.getItem('auth_user') || 'null');
  } catch { 
    return null; 
  }
};

export const setUser = (obj) => {
  localStorage.setItem('auth_user', JSON.stringify(obj));
};

export const clearUser = () => {
  localStorage.removeItem('auth_user');
};
