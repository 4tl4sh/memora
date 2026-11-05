import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

// jsdom no implementa <dialog>.showModal() ni los popovers: se simulan lo justo
// para que los diálogos se abran, se cierren y avisen con el evento close
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.open) return
    this.open = false
    this.dispatchEvent(new Event('close'))
  }
}
if (!HTMLElement.prototype.showPopover) {
  HTMLElement.prototype.showPopover = () => {}
  HTMLElement.prototype.hidePopover = () => {}
}
