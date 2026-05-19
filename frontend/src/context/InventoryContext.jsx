import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createMaterial as apiCreateMaterial,
  deleteMaterial as apiDeleteMaterial,
  getMaterials as apiGetMaterials,
  updateMaterial as apiUpdateMaterial,
  createProduct as apiCreateProduct,
  deleteProduct as apiDeleteProduct,
  getProducts as apiGetProducts,
  updateProduct as apiUpdateProduct,
} from '../api.js';

const InventoryContext = createContext(null);

const DEFAULT_UNITS = ['kg', 'container', 'liters', 'packets', 'pieces', 'boxes'];

export function InventoryProvider({ children }) {
  const [materials, setMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState(DEFAULT_UNITS);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorMaterials, setErrorMaterials] = useState(null);
  const [errorProducts, setErrorProducts] = useState(null);

  const fetchMaterials = async () => {
    setLoadingMaterials(true);
    setErrorMaterials(null);
    try {
      const data = await apiGetMaterials();
      setMaterials(data);
    } catch (err) {
      setErrorMaterials(err?.message || 'Could not load materials');
    } finally {
      setLoadingMaterials(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    setErrorProducts(null);
    try {
      const data = await apiGetProducts();
      setProducts(data);
    } catch (err) {
      setErrorProducts(err?.message || 'Could not load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchProducts();
  }, []);

  const addMaterial = async (data) => {
    const material = await apiCreateMaterial(data);
    setMaterials((arr) => [...arr, material]);
    return material;
  };

  const updateMaterial = async (id, data) => {
    const material = await apiUpdateMaterial(id, data);
    setMaterials((arr) => arr.map((item) => (item.id === id ? material : item)));
    return material;
  };

  const deleteMaterial = async (id) => {
    await apiDeleteMaterial(id);
    setMaterials((arr) => arr.filter((item) => item.id !== id));
  };

  const addUnit = (unit) => {
    const clean = unit.trim().toLowerCase();
    if (!clean) return;
    setUnits((arr) => (arr.includes(clean) ? arr : [...arr, clean]));
  };

  const addProduct = async (data) => {
    const product = await apiCreateProduct(data);
    setProducts((arr) => [...arr, product]);
    await fetchMaterials();
    return product;
  };

  const updateProduct = async (id, data) => {
    const product = await apiUpdateProduct(id, data);
    setProducts((arr) => arr.map((item) => (item.id === id ? product : item)));
    return product;
  };

  const deleteProduct = async (id) => {
    await apiDeleteProduct(id);
    setProducts((arr) => arr.filter((item) => item.id !== id));
  };

  const getMaterial = (id) => materials.find((m) => m.id === id);
  const costPerUnit = (mat) => (mat && mat.quantity > 0 ? mat.totalCost / mat.quantity : 0);
  const productCost = (product) =>
    product.materials.reduce((sum, u) => {
      const m = getMaterial(u.materialId);
      return sum + costPerUnit(m) * u.quantity;
    }, 0);

  const stats = useMemo(
    () => ({
      totalMaterials: materials.length,
      totalProducts: products.length,
      totalInventoryValue: materials.reduce((s, m) => s + (Number(m.totalCost) || 0), 0),
      lowStockCount: materials.filter((m) => m.quantity > 0 && m.quantity < 5).length,
      outOfStockCount: materials.filter((m) => m.quantity <= 0).length,
    }),
    [materials, products]
  );

  return (
    <InventoryContext.Provider
      value={{
        materials,
        products,
        units,
        loadingMaterials,
        loadingProducts,
        errorMaterials,
        errorProducts,
        fetchMaterials,
        fetchProducts,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        addUnit,
        addProduct,
        updateProduct,
        deleteProduct,
        getMaterial,
        costPerUnit,
        productCost,
        stats,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => useContext(InventoryContext);
