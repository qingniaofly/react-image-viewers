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
    minScale?: number // 最小缩放比例
    maxScale?: number // 最大缩放比例
    perRotate?: number // 每次旋转角度
    minRotate?: number // 最小旋转角度
    maxRotate?: number // 最大旋转角度
    translateTouchType?: 'mousewheel' | 'ctrl+mousewheel' | string // 滚轮缩放触发类型
}

declare const ReactImageViewer: React.ComponentType<IReactImageViewerProps>
export default ReactImageViewer
