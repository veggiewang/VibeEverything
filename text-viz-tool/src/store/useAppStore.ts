import { create } from 'zustand';
import type { AppState, ParsedData, VisualizationType, VisualizationConfig } from '../types';

const initialState = {
  rawText: '',
  parsedData: null,
  currentVisualization: null,
  visualizationConfig: null,
  isLoading: false,
  error: null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setRawText: (text: string) => set({ rawText: text, error: null }),

  setParsedData: (data: ParsedData) => set({ parsedData: data, error: null }),

  setVisualization: (type: VisualizationType, config?: Partial<VisualizationConfig>) =>
    set(() => ({
      currentVisualization: type,
      visualizationConfig: {
        type,
        title: config?.title,
        colors: config?.colors || ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'],
        fontSize: config?.fontSize || 14,
        width: config?.width || 800,
        height: config?.height || 600,
        customOptions: config?.customOptions || {},
      },
      error: null,
    })),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error, isLoading: false }),

  reset: () => set(initialState),
}));
