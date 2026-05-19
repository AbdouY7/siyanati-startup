// useVehicleStore.js - Zustand store for vehicles
import { create } from "zustand";
import {
  getUserVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getBrands,
  getModelsByBrand,
} from "../services/vehicleService"; // adjust path as needed

const useVehicleStore = create((set, get) => ({
  vehicles: [],
  brands: [],
  models: [],
  loading: false,
  brandsLoading: false,
  modelsLoading: false,
  error: null,

  fetchVehicles: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getUserVehicles();
      set({ vehicles: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchBrands: async () => {
    set({ brandsLoading: true });
    try {
      const data = await getBrands();
      set({ brands: data, brandsLoading: false });
    } catch (err) {
      set({ brandsLoading: false });
    }
  },

  fetchModelsByBrand: async (brandId) => {
    set({ modelsLoading: true, models: [] });
    try {
      const data = await getModelsByBrand(brandId);
      set({ models: data, modelsLoading: false });
    } catch (err) {
      set({ modelsLoading: false });
    }
  },

  // ✅ UPDATED: Accept optional imageFile as second parameter
  addVehicle: async (vehicleData, imageFile = null) => {
    set({ loading: true, error: null });
    try {
      const newVehicle = await createVehicle(vehicleData, imageFile);
      set((state) => ({
        vehicles: [...state.vehicles, newVehicle],
        loading: false,
      }));
      return newVehicle;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // ✅ UPDATED: Accept optional imageFile as third parameter
  editVehicle: async (vehicleId, vehicleData, imageFile = null) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateVehicle(vehicleId, vehicleData, imageFile);
      set((state) => ({
        vehicles: state.vehicles.map((v) => (v.id === vehicleId ? updated : v)),
        loading: false,
      }));
      return updated;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  removeVehicle: async (vehicleId) => {
    set({ loading: true, error: null });
    try {
      await deleteVehicle(vehicleId);
      set((state) => ({
        vehicles: state.vehicles.filter((v) => v.id !== vehicleId),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  clearModels: () => set({ models: [] }),
}));

export default useVehicleStore;
