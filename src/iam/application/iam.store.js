import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { iamApi } from '../infrastructure/iam-api.js'

export const useIamStore = defineStore('iam', () => {
  const currentUser = ref(null)
  const token       = ref(localStorage.getItem('gc_token') || null)
  const errors      = ref([])
  const loading     = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!currentUser.value)

  const savedUser = localStorage.getItem('gc_user')
  if (savedUser) {
    try { currentUser.value = JSON.parse(savedUser) } catch {}
  }

  localStorage.removeItem('gc_saved_card')

  // US08 – Sign In
  async function login(username, password) {
    errors.value = []
    loading.value = true
    try {
      const res = await iamApi.signIn(username, password)
      const { token: jwt, ...user } = res.data
      token.value = jwt
      currentUser.value = user
      localStorage.setItem('gc_token', jwt)
      localStorage.setItem('gc_user', JSON.stringify(user))
      return true
    } catch (e) {
      errors.value = ['invalidCredentials']
      return false
    } finally {
      loading.value = false
    }
  }

  // US06 / US07 – Mining Company / Jewelry Company Registration
  async function register(data) {
    errors.value = []
    loading.value = true
    try {
      const res = await iamApi.signUp(data)
      const user = res.data
      const signInRes = await iamApi.signIn(data.username, data.password)
      const { token: jwt, ...profile } = signInRes.data
      token.value = jwt
      currentUser.value = { ...user, ...profile }
      localStorage.setItem('gc_token', jwt)
      localStorage.setItem('gc_user', JSON.stringify(currentUser.value))
      return true
    } catch (e) {
      if (e?.response?.status === 409) errors.value = ['emailTaken']
      else errors.value = ['registerError']
      return false
    } finally {
      loading.value = false
    }
  }

  // US10 – Corporate Profile Management
  async function updateProfile(data) {
    if (!currentUser.value?.userId) return false
    errors.value = []
    loading.value = true
    try {
      const res = await iamApi.updateProfile(currentUser.value.userId, data)
      currentUser.value = { ...currentUser.value, ...res.data }
      localStorage.setItem('gc_user', JSON.stringify(currentUser.value))
      return true
    } catch (e) {
      errors.value = ['updateError']
      return false
    } finally {
      loading.value = false
    }
  }

  // US02 – Support for plan upgrade from subscriptions bounded context
  function applyPlanUpgrade(planKey) {
    if (!currentUser.value) return
    currentUser.value = { ...currentUser.value, plan: planKey }
    localStorage.setItem('gc_user', JSON.stringify(currentUser.value))
  }

  function logout() {
    currentUser.value = null
    token.value = null
    localStorage.removeItem('gc_token')
    localStorage.removeItem('gc_user')
  }

  return { currentUser, token, errors, loading, isAuthenticated, login, register, updateProfile, applyPlanUpgrade, logout }
})
