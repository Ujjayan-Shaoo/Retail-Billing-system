import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8080/api' });

// Attach JWT token automatically to every request
API.interceptors.request.use(config => {
  const stored = localStorage.getItem('retail_auth');
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Content-Type'] = 'application/json';
  return config;
});

// Auto-logout on 401
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('retail_auth');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login:    (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
};

export const productAPI = {
  getAll:    ()         => API.get('/products'),
  search:    (name)     => API.get(`/products/search?name=${name}`),
  getLowStock: ()       => API.get('/products/low-stock'),
  create:    (data)     => API.post('/products', data),
  update:    (id, data) => API.put(`/products/${id}`, data),
  delete:    (id)       => API.delete(`/products/${id}`),
};

export const customerAPI = {
  getMe:     ()         => API.get('/customers/me'),
  getAll:    ()         => API.get('/customers'),
  getById:   (id)       => API.get(`/customers/${id}`),
  getOrders: (id)       => API.get(`/customers/${id}/orders`),
  create:    (data)     => API.post('/customers', data),
  update:    (id, data) => API.put(`/customers/${id}`, data),
  delete:    (id)       => API.delete(`/customers/${id}`),
};

export const orderAPI = {
  getAll:       ()    => API.get('/orders'),
  getById:      (id)  => API.get(`/orders/${id}`),
  getByInvoice: (inv) => API.get(`/orders/invoice/${inv}`),
  getDashboard: ()    => API.get('/orders/dashboard'),
  getMyOrders:  ()    => API.get('/orders/my'),
  create:       (data) => API.post('/orders', data),
};

export default API;
