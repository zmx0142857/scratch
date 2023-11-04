import { bgTypes, colors, events } from './config'
import { bgType } from '~/store'

// 画布颜色、线条配置
const Palette = (painter) => {
  const mediaMatch = window.matchMedia('(prefers-color-scheme: dark)')

  let theme
  const onMediaChange = (e) => {
    theme = e.matches ? 'dark' : 'light'
    painter.ctx.strokeStyle = colors[theme].fg
    painter.ctx.fillStyle = colors[theme].bg
    painter.onChange?.(events.theme, theme)
  }

  const paintBg = () => {
    const bg = bgType()
    switch (bg) {
      case bgTypes.blank: break
      case bgTypes.mesh: {
        const meshSize = 20
        const { width, height } = painter.canvas
        const { ctx } = painter
        const style = ctx.strokeStyle
        ctx.strokeStyle = colors[theme].mesh
        ctx.beginPath()
        for (let x = meshSize; x < width; x += meshSize) {
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
        }
        for (let y = meshSize; y < height; y += meshSize) {
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
        }
        ctx.stroke()
        ctx.strokeStyle = style
        break
      }
      default: break
    }
  }

  const init = () => {
    onMediaChange(mediaMatch)
    mediaMatch.addEventListener('change', onMediaChange)
  }

  const destroy = () => {
    mediaMatch.removeEventListener('change', onMediaChange)
  }

  return {
    init,
    destroy,
    paintBg,
  }
}

export default Palette
