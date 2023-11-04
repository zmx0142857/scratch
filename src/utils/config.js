export const events = {
  historyLength: 0,
  undoLength: 1,
  theme: 2, // 深色主题切换
  dragEnd: 3,
  click: 4, // 点击画布
  doubleClick: 5,
}

export const commands = {
  stroke: 0,
  beginPath: 1,
  moveTo: 2,
  lineTo: 3,
  clearRect: 4,
}
// 逆映射
Object.entries(commands).forEach(([k, v]) => commands[v] = k)

export const colors = {
  light: {
    fg: '#222',
    bg: '#f2f2f2',
    mesh: '#eee',
  },
  dark: {
    fg: '#f2f2f2',
    bg: '#222',
    mesh: '#333',
  },
}

export const zooms = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0, 3.0, 4.0, 6.0, 8.0, 10.0]
export const minZoom = Math.min(...zooms)
export const maxZoom = Math.max(...zooms)

export const bgTypes = {
  mesh: 0,
  blank: 1,
}
