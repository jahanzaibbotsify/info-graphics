import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    theme: 'light'
  },
  mutations: {
    setTheme(state, theme) {
      state.theme = theme
    }
  },
  actions: {
    toggleTheme({ commit, state }) {
      const newTheme = state.theme === 'light' ? 'dark' : 'light'
      commit('setTheme', newTheme)
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }
  },
  modules: {
  }
}) 