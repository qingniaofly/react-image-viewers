export interface IReactImageViewStyleChangeProps {
    scale?: number
    translateX?: number
    translateY?: number
    rotateZ?: number
}

export interface IReactImageViewConfig {
    isDebug?: boolean
    timeout?: number
    onLoadStart?: (url: string) => void
    onLoad?: (image: HTMLImageElement) => void
    onLoadError?: (err) => void
    onStyleChange?: (opts: IReactImageViewStyleChangeProps) => void
}

export interface IReactImageViewerProps extends IReactImageViewConfig {
    className?: string
    url?: string
    config?: IImageViewerStyleUpdateConfig
}

interface IImageViewerStyleUpdateConfig {
    perScale?: number // 每次缩放比例
    perSmallScale?: number // 缩小的时候，每次缩放比例，如果与per不相等，则用此值
    perLargeScale?: number // 放大的时候，每次缩放比例，如果与per不相等，则用此值
    minScale?: number // 最小缩放比例
    maxScale?: number // 最大缩放比例
    scaleTouch?: string[] // 'mousewheel' | 'shift+mousewheel' | 'alt+mousewheel' | 'ctrl+shift+mousewheel' | 'ctrl+alt+mousewheel' | 'ctrl+arrow' | 'shift+arrow' | 'alt+arrow' // 触发方式
    perRotate?: number // 每次旋转角度
    minRotate?: number // 最小旋转角度
    maxRotate?: number // 最大旋转角度
    translateTouch?: string[] // string[] // 'mousemove' | 'shift+mousemove' | 'alt+mousemove' | 'ctrl+shift+mousemove' | 'ctrl+alt+mousemove' // 触发方式
}

declare const ReactImageViewer: React.ComponentType<IReactImageViewerProps>
export default ReactImageViewer
