import { create } from 'zustand';

export const useToastStore = create((set) => ({
	toast: null,
	showToast: (message, options = {}) =>
		set(() => ({
			toast: {
				id: Date.now(),
				message,
				tone: options.tone || 'success',
				duration: Number(options.duration || 2200),
			},
		})),
	hideToast: () => set({ toast: null }),
}));