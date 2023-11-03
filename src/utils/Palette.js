import { darkTheme, events, lightTheme } from './config'

// 画布颜色、线条配置
const Palette = ({ ctx, onChange }) => {
  const mediaMatch = window.matchMedia('(prefers-color-scheme: dark)')
  const onMediaChange = (e) => {
    const isDark = e.matches
    ctx.strokeStyle = isDark ? darkTheme.fg : lightTheme.fg
    onChange?.(events.theme, isDark)
  }

  const destroy = () => {
    mediaMatch.removeEventListener('change', onMediaChange)
  }

  onMediaChange(mediaMatch)
  mediaMatch.addEventListener('change', onMediaChange)

  return {
    destroy,
  }
}

export default Palette
