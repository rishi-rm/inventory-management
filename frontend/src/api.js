import axios from 'axios';
import { clearStoredAccess, getStoredAccessPin } from './access.js';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const pin = getStoredAccessPin();
  if (pin) {
    config.headers = {
      ...config.headers,
      'x-access-pin': pin,
    };
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || '';

    if (status === 401 && !requestUrl.endsWith('/access')) {
      clearStoredAccess();
      if (typeof window !== 'undefined' && window.location.pathname !== '/unlock') {
        window.location.replace('/unlock');
      }
    }

    return Promise.reject(error);
  }
);

export async function verifyAccessPin(pin) {
  const response = await api.post('/access', { pin });
  return response.data;
}

function normalizeMaterial(material) {
  return {
    ...material,
    id: material._id,
    totalCost: material.unitCost,
  };
}

function normalizeProduct(product) {
  return {
    ...product,
    id: product._id,
    materials: product.materials.map((item) => {
      const material = item.material;
      const materialId = material?._id || material?.id || item.materialId || material;
      return {
        materialId,
        quantity: item.quantity,
      };
    }),
  };
}

function toApiMaterial(payload) {
  const { totalCost, ...rest } = payload;
  return {
    ...rest,
    unitCost: totalCost,
  };
}

function toApiProduct(payload) {
  return {
    ...payload,
    materials: payload.materials.map((item) => ({
      material: item.materialId,
      quantity: item.quantity,
    })),
  };
}

export async function getMaterials() {
  const response = await api.get('/materials');
  return response.data.data.map(normalizeMaterial);
}

export async function createMaterial(material) {
  const response = await api.post('/materials', toApiMaterial(material));
  return normalizeMaterial(response.data.data);
}

export async function updateMaterial(id, material) {
  const response = await api.put(`/materials/${id}`, toApiMaterial(material));
  return normalizeMaterial(response.data.data);
}

export async function deleteMaterial(id) {
  await api.delete(`/materials/${id}`);
}

export async function getProducts() {
  const response = await api.get('/products');
  return response.data.data.map(normalizeProduct);
}

export async function createProduct(product) {
  const response = await api.post('/products', toApiProduct(product));
  return normalizeProduct(response.data.data);
}

export async function updateProduct(id, product) {
  const response = await api.put(`/products/${id}`, toApiProduct(product));
  return normalizeProduct(response.data.data);
}

export async function deleteProduct(id) {
  await api.delete(`/products/${id}`);
}
