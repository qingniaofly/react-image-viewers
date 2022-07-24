export interface IReactImageViewStyleChangeProps {
    scale?: number
    translateX?: number
    translateY?: number
    rotateZ?: number
}

export interface IReactImageViewCallback {
    isDebug?: boolean
    timeout?: number
    onLoadStart?: (url: string) => void
    onLoad?: (image: HTMLImageElement) => void
    onLoadError?: (err) => void
    onStyleChange?: (opts: IReactImageViewStyleChangeProps) => void
}

export interface IReactImageViewerProps extends IReactImageViewCallback {
    className?: string
    url?: string
}

declare const ReactImageViewer: React.ComponentType<IReactImageViewerProps>
export default ReactImageViewer
