import { defineStore } from 'pinia'
import { ref } from 'vue'
import { consumerApi } from '../infrastructure/consumer-api.js'
import { ConsumerPieceAssembler } from '../infrastructure/consumer-piece.assembler.js'

export const useConsumerStore = defineStore('consumer', () => {
  const pieces  = ref([])
  const errors  = ref([])
  const loading = ref(false)

  async function fetchPieces(ownerId) {
    loading.value = true
    try {
      const params = ownerId ? { ownerId } : {}
      const res = await consumerApi.getPieces(params)
      pieces.value = ConsumerPieceAssembler.toEntities(res)
    } catch {
      errors.value = ['fetchError']
    } finally {
      loading.value = false
    }
  }

  async function linkPiece(data) {
    errors.value = []
    loading.value = true
    try {
      const payload = { ...data, status: 'Activo', purchaseDate: new Date().toISOString() }
      const res = await consumerApi.linkPiece(payload)
      const piece = ConsumerPieceAssembler.toEntity(res.data)
      pieces.value.unshift(piece)
      return piece
    } catch {
      errors.value = ['linkError']
      return null
    } finally {
      loading.value = false
    }
  }

  return { pieces, errors, loading, fetchPieces, linkPiece }
})
