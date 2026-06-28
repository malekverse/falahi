'use client'

import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react'
import type { Millimes } from '@filahi/types'

export interface CartItem {
  inventoryItemId: number
  productName: string
  category: string
  quantity: number
  unit: string
  unitPriceMillimes: Millimes
  locationName: string
  farmerId: string
}

interface CartState {
  items: CartItem[]
  deliveryAddress: string
  deliveryNotes: string
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'SET_DELIVERY_ADDRESS'; payload: string }
  | { type: 'SET_DELIVERY_NOTES'; payload: string }
  | { type: 'CLEAR_CART' }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.inventoryItemId === action.payload.inventoryItemId)
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.inventoryItemId === action.payload.inventoryItemId
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i,
          ),
        }
      }
      return { ...state, items: [...state.items, action.payload] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.inventoryItemId !== action.payload) }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.inventoryItemId !== action.payload.id) }
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.inventoryItemId === action.payload.id ? { ...i, quantity: action.payload.quantity } : i,
        ),
      }
    }
    case 'SET_DELIVERY_ADDRESS':
      return { ...state, deliveryAddress: action.payload }
    case 'SET_DELIVERY_NOTES':
      return { ...state, deliveryNotes: action.payload }
    case 'CLEAR_CART':
      return { items: [], deliveryAddress: '', deliveryNotes: '' }
    default:
      return state
  }
}

interface CartContextValue {
  state: CartState
  addItem: (item: CartItem) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  setDeliveryAddress: (address: string) => void
  setDeliveryNotes: (notes: string) => void
  clearCart: () => void
  totalMillimes: number
  itemCount: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], deliveryAddress: '', deliveryNotes: '' })

  const addItem = useCallback((item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item }), [])
  const removeItem = useCallback((id: number) => dispatch({ type: 'REMOVE_ITEM', payload: id }), [])
  const updateQuantity = useCallback((id: number, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } }), [])
  const setDeliveryAddress = useCallback((address: string) => dispatch({ type: 'SET_DELIVERY_ADDRESS', payload: address }), [])
  const setDeliveryNotes = useCallback((notes: string) => dispatch({ type: 'SET_DELIVERY_NOTES', payload: notes }), [])
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), [])

  const totalMillimes = state.items.reduce(
    (sum, item) => sum + item.unitPriceMillimes * item.quantity,
    0,
  )

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        setDeliveryAddress,
        setDeliveryNotes,
        clearCart,
        totalMillimes,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
