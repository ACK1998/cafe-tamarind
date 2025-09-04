import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../config/constants';

const useStore = create(
  persist(
    (set, get) => ({
      // Cart state
      cart: [],
      cartTotal: 0,
      
      // User state
      user: null,
      token: null,
      
      // Add item to cart
      addToCart: (item, quantity = 1) => {
        set((state) => {
          const existingItem = state.cart.find(cartItem => cartItem._id === item._id);
          
          if (existingItem) {
            const updatedCart = state.cart.map(cartItem =>
              cartItem._id === item._id
                ? { ...cartItem, quantity: cartItem.quantity + quantity }
                : cartItem
            );
            
            return {
              cart: updatedCart,
              cartTotal: updatedCart.reduce((total, item) => total + (item.price * item.quantity), 0)
            };
          } else {
            const newCart = [...state.cart, { ...item, quantity }];
            return {
              cart: newCart,
              cartTotal: newCart.reduce((total, item) => total + (item.price * item.quantity), 0)
            };
          }
        });
      },
      
      // Remove item from cart
      removeFromCart: (itemId) => {
        set((state) => {
          const updatedCart = state.cart.filter(item => item._id !== itemId);
          return {
            cart: updatedCart,
            cartTotal: updatedCart.reduce((total, item) => total + (item.price * item.quantity), 0)
          };
        });
      },
      
      // Update item quantity
      updateQuantity: (itemId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return get().removeFromCart(itemId);
          }
          
          const updatedCart = state.cart.map(item =>
            item._id === itemId ? { ...item, quantity } : item
          );
          
          return {
            cart: updatedCart,
            cartTotal: updatedCart.reduce((total, item) => total + (item.price * item.quantity), 0)
          };
        });
      },
      
      // Clear cart
      clearCart: () => {
        set({ cart: [], cartTotal: 0 });
      },
      
      // Get cart item count
      getCartItemCount: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0);
      },
      
      // User management
      setUser: (user, token) => {
        set({ user, token });
        if (token) {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        }
      },
      
      getUser: () => {
        return get().user;
      },
      
      getToken: () => {
        return get().token;
      },
      
      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      },
      
      isAuthenticated: () => {
        return !!get().token;
      }
    }),
    {
      name: 'cafe-tamarind-store',
      partialize: (state) => ({
        cart: state.cart,
        cartTotal: state.cartTotal,
        user: state.user,
        token: state.token
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize token from localStorage if not in state
        if (state && !state.token) {
          const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
          if (storedToken) {
            state.token = storedToken;
          }
        }
      }
    }
  )
);

export default useStore;
