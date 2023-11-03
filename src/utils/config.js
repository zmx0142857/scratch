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

export const lightTheme = {
  fg: '#222',
  bg: '#f2f2f2',
}

export const darkTheme = {
  fg: '#f2f2f2',
  bg: '#222',
}
