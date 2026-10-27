import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;
  if (envUrl && typeof envUrl === 'string') {
    return `${envUrl.replace(/\/+$/, '')}/api/v1`;
  }
  return '/api/v1';
};

export const apiSlice = createApi({
  reducerPath: 'atelierApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
    credentials: 'include',
    prepareHeaders: (headers) => {
      const adminSession = localStorage.getItem('fashion_admin_session');
      const token = adminSession
        ? (localStorage.getItem('fashion_admin_token') || localStorage.getItem('atelier_token'))
        : (localStorage.getItem('atelier_token') || localStorage.getItem('fashion_admin_token'));
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      if (adminSession) {
        headers.set('x-admin-dev', 'true');
      }
      return headers;
    },
  }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: [
    'Product',
    'Order',
    'CustomDossier',
    'User',
    'AdminMetrics',
    'Notification',
    'Inquiry',
    'Wishlist',
    'Coupon',
    'Category',
    'Review',
    'Setting',
  ],
  endpoints: (builder) => ({
    // Products
    getProducts: builder.query({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id, slug }) => ({ type: 'Product', id: _id || slug })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    getProductById: builder.query({
      query: (idOrSlug) => `/products/${idOrSlug}`,
      providesTags: (result, error, idOrSlug) => [{ type: 'Product', id: idOrSlug }],
    }),
    getCategorySummary: builder.query({
      query: () => '/products/categories/summary',
      providesTags: [{ type: 'Product', id: 'SUMMARY' }],
    }),

    // Orders
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: [
        { type: 'Order', id: 'LIST' },
        { type: 'Order', id: 'ADMIN_LIST' },
        'AdminMetrics',
        'User',
      ],
    }),
    getOrderByNumber: builder.query({
      query: (orderNumber) => `/orders/${orderNumber}`,
      providesTags: (result, error, orderNumber) => [{ type: 'Order', id: orderNumber }],
    }),
    getMyOrders: builder.query({
      query: () => '/orders/my-orders',
      providesTags: [{ type: 'Order', id: 'LIST' }],
    }),

    // AI Custom Design Studio
    uploadSketch: builder.mutation({
      query: (formData) => ({
        url: '/custom-studio/upload-sketch',
        method: 'POST',
        body: formData,
      }),
    }),
    generateAIConcepts: builder.mutation({
      query: (parameters) => ({
        url: '/custom-studio/generate',
        method: 'POST',
        body: { parameters },
      }),
    }),
    consultFashionAssistant: builder.mutation({
      query: ({ message, history, currentDesignState }) => ({
        url: '/custom-studio/assistant-chat',
        method: 'POST',
        body: { message, history, currentDesignState },
      }),
    }),
    submitCustomDossier: builder.mutation({
      query: (dossierData) => ({
        url: '/custom-studio/submit',
        method: 'POST',
        body: dossierData,
      }),
      invalidatesTags: [
        { type: 'CustomDossier', id: 'LIST' },
        { type: 'CustomDossier', id: 'ADMIN_LIST' },
        'AdminMetrics',
      ],
    }),
    getDossierByRef: builder.query({
      query: (refCode) => `/custom-studio/dossier/${refCode}`,
      providesTags: (result, error, refCode) => [{ type: 'CustomDossier', id: refCode }],
    }),
    getMyDossiers: builder.query({
      query: () => '/custom-studio/my-dossiers',
      providesTags: [{ type: 'CustomDossier', id: 'LIST' }],
    }),

    // Authentication & Profile
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    getWishlist: builder.query({
      query: () => '/auth/wishlist',
      providesTags: ['Wishlist', 'User'],
    }),
    toggleWishlist: builder.mutation({
      query: (productId) => ({
        url: '/auth/wishlist/toggle',
        method: 'POST',
        body: { productId },
      }),
      invalidatesTags: ['Wishlist', 'User'],
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: `/auth/reset-password/${token}`,
        method: 'POST',
        body: { password },
      }),
      invalidatesTags: ['User'],
    }),


    // Admin Operations
    getDashboardMetrics: builder.query({
      query: () => '/admin/dashboard-metrics',
      providesTags: ['AdminMetrics'],
    }),
    getAdminDossiers: builder.query({
      query: (status) => ({
        url: '/admin/custom-dossiers',
        params: status ? { status } : undefined,
      }),
      providesTags: [{ type: 'CustomDossier', id: 'ADMIN_LIST' }],
    }),
    updateTailorQuote: builder.mutation({
      query: ({ id, ...quoteData }) => ({
        url: `/admin/custom-dossiers/${id}/quote`,
        method: 'PATCH',
        body: quoteData,
      }),
      invalidatesTags: [{ type: 'CustomDossier', id: 'ADMIN_LIST' }, 'AdminMetrics'],
    }),
    getAdminOrders: builder.query({
      query: (status) => ({
        url: '/admin/orders',
        params: status ? { status } : undefined,
      }),
      providesTags: [{ type: 'Order', id: 'ADMIN_LIST' }],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status, trackingCode }) => ({
        url: `/admin/orders/${id}/status`,
        method: 'PATCH',
        body: { status, trackingCode },
      }),
      invalidatesTags: [{ type: 'Order', id: 'ADMIN_LIST' }, 'AdminMetrics'],
    }),
    createProduct: builder.mutation({
      query: (productData) => ({
        url: '/admin/products',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: [
        { type: 'Product', id: 'LIST' },
        { type: 'Product', id: 'SUMMARY' },
        'Category',
        'AdminMetrics',
      ],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...productData }) => ({
        url: `/admin/products/${id}`,
        method: 'PUT',
        body: productData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id: 'LIST' },
        { type: 'Product', id },
        { type: 'Product', id: 'SUMMARY' },
        'Category',
        'AdminMetrics',
      ],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id: 'LIST' },
        { type: 'Product', id },
        { type: 'Product', id: 'SUMMARY' },
        'Category',
        'AdminMetrics',
      ],
    }),

    getPatrons: builder.query({
      query: () => '/admin/patrons',
      providesTags: ['User'],
    }),

    // Dossier Consultation Message
    addDossierMessage: builder.mutation({
      query: ({ refCode, message }) => ({
        url: `/custom-studio/dossier/${refCode}/message`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: (result, error, { refCode }) => [
        { type: 'CustomDossier', id: refCode },
        { type: 'CustomDossier', id: 'LIST' },
        { type: 'CustomDossier', id: 'ADMIN_LIST' },
      ],
    }),

    // Notifications & Advisories
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Customer Inquiries / Official Emails
    submitInquiry: builder.mutation({
      query: (inquiryData) => ({
        url: '/inquiries',
        method: 'POST',
        body: inquiryData,
      }),
      invalidatesTags: [{ type: 'Inquiry', id: 'LIST' }, 'AdminMetrics'],
    }),
    getInquiries: builder.query({
      query: () => '/inquiries',
      providesTags: [{ type: 'Inquiry', id: 'LIST' }],
    }),
    updateInquiryStatus: builder.mutation({
      query: ({ id, status, replyNotes }) => ({
        url: `/inquiries/${id}/status`,
        method: 'PATCH',
        body: { status, replyNotes },
      }),
      invalidatesTags: [{ type: 'Inquiry', id: 'LIST' }],
    }),
    deleteInquiry: builder.mutation({
      query: (id) => ({
        url: `/inquiries/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Inquiry', id: 'LIST' }],
    }),

    // Coupons & Vouchers
    getCoupons: builder.query({
      query: () => '/coupons',
      providesTags: ['Coupon'],
    }),
    createCoupon: builder.mutation({
      query: (couponData) => ({
        url: '/coupons',
        method: 'POST',
        body: couponData,
      }),
      invalidatesTags: ['Coupon'],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/coupons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Coupon'],
    }),
    validateCoupon: builder.mutation({
      query: ({ code, subtotal }) => ({
        url: '/coupons/validate',
        method: 'POST',
        body: { code, subtotal },
      }),
    }),

    // Categories
    getCategories: builder.query({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: '/categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // Product Reviews
    getProductReviews: builder.query({
      query: (idOrSlug) => `/products/${idOrSlug}/reviews`,
      providesTags: (result, error, idOrSlug) => [{ type: 'Review', id: idOrSlug }],
    }),
    createProductReview: builder.mutation({
      query: ({ idOrSlug, ...reviewData }) => ({
        url: `/products/${idOrSlug}/reviews`,
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: (result, error, { idOrSlug }) => [
        { type: 'Review', id: idOrSlug },
        { type: 'Product', id: idOrSlug },
      ],
    }),

    // System Settings
    getSettings: builder.query({
      query: () => '/settings',
      providesTags: ['Setting'],
    }),
    updateSettings: builder.mutation({
      query: (settingsData) => ({
        url: '/settings',
        method: 'PUT',
        body: settingsData,
      }),
      invalidatesTags: ['Setting'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetCategorySummaryQuery,
  useCreateOrderMutation,
  useGetOrderByNumberQuery,
  useGetMyOrdersQuery,
  useUploadSketchMutation,
  useGenerateAIConceptsMutation,
  useConsultFashionAssistantMutation,
  useSubmitCustomDossierMutation,
  useGetDossierByRefQuery,
  useGetMyDossiersQuery,
  useAddDossierMessageMutation,
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useLogoutMutation,
  useGetDashboardMetricsQuery,
  useGetAdminDossiersQuery,
  useUpdateTailorQuoteMutation,
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetPatronsQuery,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useSubmitInquiryMutation,
  useGetInquiriesQuery,
  useUpdateInquiryStatusMutation,
  useDeleteInquiryMutation,
  useGetWishlistQuery,
  useToggleWishlistMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useDeleteCouponMutation,
  useValidateCouponMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetProductReviewsQuery,
  useCreateProductReviewMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} = apiSlice;


