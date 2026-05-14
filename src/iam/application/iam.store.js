import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { iamApi } from '../infrastructure/iam-api.js'
import { UserAssembler } from '../infrastructure/user.assembler.js'

export const useIamStore = defineStore('iam', () => {
  const currentUser = ref(null)
  const token       = ref(localStorage.getItem('gc_token') || null)
  const errors      = ref([])
  const loading     = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!currentUser.value)

  // Rehydrate user from localStorage on cold load
  const savedUser = localStorage.getItem('gc_user')
  if (savedUser) {
    try { currentUser.value = JSON.parse(savedUser) } catch {}
  }

  // US08 – Inicio de Sesión
  async function login(email, password) {
    errors.value = []
    loading.value = true
    try {
      const res = await iamApi.login(email, password)
      const users = res.data
      if (!users || users.length === 0) {
        errors.value = ['invalidCredentials']
        return false
      }
      const user = UserAssembler.toEntity(users[0])
      currentUser.value = user
      token.value = `mock-jwt-${user.id}`
      localStorage.setItem('gc_token', token.value)
      localStorage.setItem('gc_user', JSON.stringify(user))
      return true
    } catch (e) {
      errors.value = ['invalidCredentials']
      return false
    } finally {
      loading.value = false
    }
  }

  // US06 / US07 – Registro de Empresa Minera / Joyería
  async function register(data) {
    errors.value = []
    loading.value = true
    try {
      const res = await iamApi.register(data)
      const user = UserAssembler.toEntity(res.data)
      currentUser.value = user
      token.value = `mock-jwt-${user.id}`
      localStorage.setItem('gc_token', token.value)
      localStorage.setItem('gc_user', JSON.stringify(user))
      return true
    } catch (e) {
      errors.value = ['registerError']
      return false
    } finally {
      loading.value = false
    }
  }

  // US10 – Gestión de Perfil Corporativo
  async function updateProfile(data) {
    if (!currentUser.value?.id) return false
    errors.value = []
    loading.value = true
    try {
      const res = await iamApi.updateProfile(currentUser.value.id, data)
      const user = UserAssembler.toEntity(res.data)
      currentUser.value = user
      localStorage.setItem('gc_user', JSON.stringify(user))
      return true
    } catch (e) {
      errors.value = ['updateError']
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    currentUser.value = null
    token.value = null
    localStorage.removeItem('gc_token')
    localStorage.removeItem('gc_user')
  }

  return { currentUser, token, errors, loading, isAuthenticated, login, register, updateProfile, logout }
})
