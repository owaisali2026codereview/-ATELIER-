import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  gender: 'all', // 'all' | 'men' | 'women' | 'kids'
  selectedSizes: [],
  selectedFabrics: [],
  priceRange: [1000, 40000],
  inStockOnly: false,
  sortBy: 'featured', // 'featured' | 'price-asc' | 'price-desc' | 'newest'
  gridColumns: 4 // 3 or 4
};

export const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setGenderFilter: (state, action) => {
      state.gender = action.payload;
    },
    toggleSizeFilter: (state, action) => {
      const size = action.payload;
      if (state.selectedSizes.includes(size)) {
        state.selectedSizes = state.selectedSizes.filter((s) => s !== size);
      } else {
        state.selectedSizes.push(size);
      }
    },
    toggleFabricFilter: (state, action) => {
      const fabric = action.payload;
      if (state.selectedFabrics.includes(fabric)) {
        state.selectedFabrics = state.selectedFabrics.filter((f) => f !== fabric);
      } else {
        state.selectedFabrics.push(fabric);
      }
    },
    setPriceRange: (state, action) => {
      state.priceRange = action.payload;
    },
    setInStockOnly: (state, action) => {
      state.inStockOnly = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setGridColumns: (state, action) => {
      state.gridColumns = action.payload;
    },
    resetFilters: (state) => {
      state.selectedSizes = [];
      state.selectedFabrics = [];
      state.priceRange = [1000, 40000];
      state.inStockOnly = false;
      state.sortBy = 'featured';
    }
  }
});

export const {
  setGenderFilter,
  toggleSizeFilter,
  toggleFabricFilter,
  setPriceRange,
  setInStockOnly,
  setSortBy,
  setGridColumns,
  resetFilters
} = filterSlice.actions;

export default filterSlice.reducer;
