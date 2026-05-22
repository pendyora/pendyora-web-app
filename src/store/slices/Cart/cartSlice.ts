import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import {
  apiAddToCart,
  apiAddToCheckout,
  apiAddToWishList,
  apiGetCartList,
  apiGetLoalCartList,
  apiGetWishList,
  apiRemoveCart,
  apiVerifyCoupon,
} from '@/services/cartService';

const initialState: any = {
  cartProducts: [] as any,
  wishlistProducts: [] as any,
  wishlistAPIProducts: [] as any,
  productCounts: 0,
  checkoutDetails: [],
  loading: false,
  couponData: null,
  guestDetails: [],
};

export const verifyCoupon = createAsyncThunk('cart/verifyCoupon', async (couponData: any, { rejectWithValue }) => {
  try {
    const response = await apiVerifyCoupon(couponData);
    return response.data;
  } catch (error: any) {
    return error;
  }
});
export const fetchCartProducts = createAsyncThunk('cart/fetchCartProducts', async ({ data }: { data: any }, { rejectWithValue }) => {
  try {
    const response = await apiAddToCart(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchCheckoutProducts = createAsyncThunk('cart/checkout/fetchCheckoutProducts', async ({ data }: { data: any }, { rejectWithValue }) => {
  try {
    const response = await apiAddToCheckout(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchCartProductsList = createAsyncThunk('cart/fetchCartProductsList', async (_, { rejectWithValue }) => {
  try {
    const response = await apiGetCartList();
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchLocalCartProductsList = createAsyncThunk(
  'cart/products/fetchLocalCartProductsList',
  async ({ data }: { data: any }, { rejectWithValue }) => {
    // console.log("data-=-=--->", data);

    try {
      const response = await apiGetLoalCartList(data);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchRemoveProduct = createAsyncThunk('cart/:id/fetchRemoveProduct', async (id: any, { rejectWithValue }) => {
  // console.log("data-=-=--->", data);

  try {
    const response = await apiRemoveCart(id);
    // console.log("resssponseeeee-->", response);

    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const fetchWishListProducts = createAsyncThunk('cart/fetchWishListProducts', async (data: string, { rejectWithValue }) => {
  try {
    const response = await apiGetWishList(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const AddWishListProducts = createAsyncThunk('cart/AddWishListProducts', async ({ data }: { data: any }, { rejectWithValue }) => {
  try {
    const response = await apiAddToWishList(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartProducts: (state) => {
      state.cartProducts = [];
      state.productCounts = 0;
    },
    clearWishlistProducts: (state) => {
      state.wishlistProducts = [];
    },
    clearCouponData: (state) => {
      state.couponData = null;
    },
    addCartProductCounts: (state, action) => {
      // console.log("action--->", action);

      state.productCounts = action?.payload || 0;
    },
    setCartProducts: (state, action) => {
      state.cartProducts = action?.payload || [];
    },
    setWishlistProducts: (state, action) => {
      state.wishlistProducts = action?.payload || [];
    },
    setGuestDetails: (state, action) => {
      state.guestDetails = action?.payload || [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartProducts.fulfilled, (state) => {
        state.loading = false;
        // console.log("action---->", action.payload.data);
        // state.cartProducts = action.payload.data;
      })
      .addCase(fetchCartProducts.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch products';
      })
      .addCase(fetchCartProductsList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartProductsList.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.cartProducts = action.payload.data;
        state.productCounts = action.payload.data?.length || 0;
      })
      .addCase(fetchCartProductsList.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch products';
      })
      .addCase(fetchLocalCartProductsList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLocalCartProductsList.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // console.log("action--->", action);
        state.cartProducts = action.payload.data;
        state.productCounts = action.payload.data?.length || 0;
      })
      .addCase(fetchLocalCartProductsList.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch products';
      })
      .addCase(fetchRemoveProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRemoveProduct.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // console.log("action--->", action);
        state.cartProducts = action.payload.data;
        state.productCounts = action.payload.data?.length ?? 0;
      })
      .addCase(fetchRemoveProduct.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch products';
      })
      .addCase(fetchCheckoutProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCheckoutProducts.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // console.log("action--->", action);
        state.checkoutDetails = action.payload.data;
      })
      .addCase(fetchCheckoutProducts.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch products';
      })
      .addCase(fetchWishListProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishListProducts.fulfilled, (state, action: PayloadAction<any>) => {
        // console.log("action--->", action);
        state.wishlistAPIProducts = action.payload.data;
        state.wishlistProducts = action.payload.data?.map((category: any) => {
          return {
            name: category.name.toUpperCase(), // Convert category name to uppercase
            jewelry: category.jewelry.map((item: any) => {
              const carat_image = item.skuDetails?.carat_images || [];
              const jewelryTypeName = item?.subTypeDetails?.parent_code;
              const jewelryTypeData = jewelryTypeName?.toLowerCase()?.replace('_', '-');
              const jewelryDetails = item?.jewelryDetails?.[0];
              return {
                jewelry_id: item.id,
                sku_master_id: item.skuDetails.id,
                slug: item?.is_customizable ? item.skuDetails.sku_slug : `${jewelryTypeData}/premade?slug=${item.skuDetails.sku_slug}`,
                productPrice: item.skuDetails.selling_price,
                productName: item.fullTitle,
                variation_to_show: item?.variation_to_show,
                variation_details: item?.variation_details,
                jewelryDetails,
                jewelryTypeData,
                is_customizable: item?.is_customizable,
                productHoverImage: carat_image[1] ? `${carat_image[1]}` : '/images/no_images.svg', // Placeholder hover image URL
                productImage: carat_image[0] ? `${carat_image[0]}` : '/images/no_images.svg', // Placeholder image URL
                isWishlist: item?.wishlist_id, // Assuming false for all items, can be adjusted if needed
                jewelry_type: category?.name.toUpperCase(), // Assuming jewelry type is the same as category name
                discount_type: item?.skuDetails?.discount_type,
                discount_value: item?.skuDetails?.discount_value,
                discounted_price: item?.skuDetails?.discounted_price,
                specialProductTitles: item?.specialProductTitles,
              };
            }),
          };
        });
        state.loading = false;
      })
      .addCase(fetchWishListProducts.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch products';
      })
      .addCase(AddWishListProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(AddWishListProducts.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(AddWishListProducts.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch products';
      })
      .addCase(verifyCoupon.fulfilled, (state, action: PayloadAction<any>) => {
        state.couponData = action.payload.data;
      })
      .addCase(verifyCoupon.rejected, (state, action: PayloadAction<any>) => {
        state.error = action.payload || 'Failed to verify coupon';
      });
  },
});

// Export actions to be used in components
export const {
  clearCartProducts,
  clearWishlistProducts,
  addCartProductCounts,
  setCartProducts,
  setWishlistProducts,
  clearCouponData,
  setGuestDetails,
  /* Add any additional actions if needed */
} = cartSlice.actions;

export default cartSlice.reducer;
