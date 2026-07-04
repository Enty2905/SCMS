import { createAsyncThunk } from '@reduxjs/toolkit'

import {
  fetchConsumables,
  createConsumable,
  updateConsumable,
  deleteConsumable,
} from '../services/consumable.service.js'
import {
  fetchSpareParts,
  createSparePart,
  updateSparePart,
  deleteSparePart,
} from '../services/sparepart.service.js'

/**
 * @param {{ tab: 'consumable'|'sparepart', keyword?: string, page?: number, size?: number }}
 */
export const fetchMaterials = createAsyncThunk(
  'materials/fetchList',
  async ({ tab, keyword, page = 0, size = 10 }) => {
    if (tab === 'sparepart') {
      return fetchSpareParts(keyword, page, size)
    }
    return fetchConsumables(keyword, page, size)
  },
)

/**
 * @param {{ tab: 'consumable'|'sparepart', data: object }}
 */
export const createMaterial = createAsyncThunk(
  'materials/create',
  async ({ tab, data }) => {
    if (tab === 'sparepart') {
      return createSparePart(data)
    }
    return createConsumable(data)
  },
)

/**
 * @param {{ tab: 'consumable'|'sparepart', id: string, data: object }}
 */
export const updateMaterial = createAsyncThunk(
  'materials/update',
  async ({ tab, id, data }) => {
    if (tab === 'sparepart') {
      return updateSparePart(id, data)
    }
    return updateConsumable(id, data)
  },
)

/**
 * @param {{ tab: 'consumable'|'sparepart', id: string }}
 */
export const deleteMaterial = createAsyncThunk(
  'materials/delete',
  async ({ tab, id }) => {
    if (tab === 'sparepart') {
      return deleteSparePart(id)
    }
    return deleteConsumable(id)
  },
)
