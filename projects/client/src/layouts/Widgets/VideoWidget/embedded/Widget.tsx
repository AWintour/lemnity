import type { Ref } from 'react'

import VideoWidget, { type VideoWidgetVariant } from '../VideoWidget'

export type WidgetProps = {
  ref: Ref<HTMLDivElement>
  focused: boolean
  announementVariant: VideoWidgetVariant
  onAnnouncementButtonPress: () => void
}

const Widget = ({ ref, ...props }: WidgetProps) => {
  return (
    <VideoWidget
      ref={ref}
      variant={props.announementVariant}
      focused={props.focused}
      onButtonPress={props.onAnnouncementButtonPress}
    />
  )
}

export default Widget
