import type {
  TypedWidgetUpdater,
} from '@/stores/widgetSettings/widgetActions/types'
import {
  type VideoWidgetType,
  type FontWeight,
  type MobileTrigger,
  type Position,
} from '@lemnity/widget-config/widgets/video-widget'
import { buildVideoWidgetSettings } from './defaults'
import type { ColorScheme, Icon } from '@lemnity/widget-config/widgets/base'

export const createVideoWidgetActions = (
  updateWidget: TypedWidgetUpdater<VideoWidgetType>
) => ({
  // WidgetAppearenceSchema
  setVideoWidgetCompanyLogoEnabled: (enabled: boolean) =>
    updateWidget(widget => ({
      ...widget,
      appearence: { ...widget.appearence, companyLogoEnabled: enabled }
    })),
  setVideoWidgetCompanyLogoUrl: (url: string | undefined) =>
    updateWidget(widget => ({
      ...widget,
      appearence: { ...widget.appearence, companyLogoUrl: url }
    })),
  setVideoWidgetCompanyLogoSize: (size: number) =>
    updateWidget(widget => ({
      ...widget,
      appearence: { ...widget.appearence, companyLogoSize: size }
    })),
  setVideoWidgetColorScheme: (colorScheme: ColorScheme) =>
    updateWidget(widget => ({
      ...widget,
      appearence: { ...widget.appearence, colorScheme }
    })),
  setVideoWidgetBackgroundColor: (color: string) =>
    updateWidget(widget => ({
      ...widget,
      appearence: { ...widget.appearence, backgroundColor: color }
    })),
  setVideoWidgetBorderRadius: (radius: number) =>
    updateWidget(widget => ({
      ...widget,
      appearence: { ...widget.appearence, borderRadius: radius }
    })),
  setVideoWidgetPosition: (position: Position) =>
    updateWidget(widget => ({
      ...widget,
      appearence: { ...widget.appearence, position }
    })),

  // VideoSettingsSchema
  setVideoWidgetVideos: (videos: string[]) =>
    updateWidget(widget => ({
      ...widget,
      videoSettings: { ...widget.videoSettings, videos: videos.slice(0, 3) }
    })),
  addVideoWidgetVideo: (url: string) =>
    updateWidget(widget => ({
      ...widget,
      videoSettings: {
        ...widget.videoSettings,
        videos: [...widget.videoSettings.videos, url].slice(0, 3)
      }
    })),
  removeVideoWidgetVideo: (index: number) =>
    updateWidget(widget => ({
      ...widget,
      videoSettings: {
        ...widget.videoSettings,
        videos: widget.videoSettings.videos.filter((_, i) => i !== index)
      }
    })),
  setVideoWidgetPosterEnabled: (posterEnabled: boolean) =>
    updateWidget(widget => ({
      ...widget,
      videoSettings: { ...widget.videoSettings, posterEnabled }
    })),
  setVideoWidgetPosterUrl: (url: string | undefined) =>
    updateWidget(widget => ({
      ...widget,
      videoSettings: { ...widget.videoSettings, posterUrl: url }
    })),
  setVideoWidgetMuted: (muted: boolean) =>
    updateWidget(widget => ({
      ...widget,
      videoSettings: { ...widget.videoSettings, muted }
    })),
  setVideoWidgetLoop: (loop: boolean) =>
    updateWidget(widget => ({
      ...widget,
      videoSettings: { ...widget.videoSettings, loop }
    })),
  setVideoWidgetShowControls: (showControls: boolean) =>
    updateWidget(widget => ({
      ...widget,
      videoSettings: { ...widget.videoSettings, showControls }
    })),
  setVideoWidgetShowProgressBar: (showProgressBar: boolean) =>
    updateWidget(widget => ({
      ...widget,
      videoSettings: { ...widget.videoSettings, showProgressBar }
    })),

  // InfoSettingsSchema (нижний оверлей)
  setVideoWidgetInfoScreenTitle: (title: string) =>
    updateWidget(widget => ({
      ...widget,
      infoSettings: { ...widget.infoSettings, title }
    })),
  setVideoWidgetInfoScreenTitleFontWeight: (weight: FontWeight) =>
    updateWidget(widget => ({
      ...widget,
      infoSettings: { ...widget.infoSettings, titleFontWeight: weight }
    })),
  setVideoWidgetInfoScreenTitleColor: (titleColor: string) =>
    updateWidget(widget => ({
      ...widget,
      infoSettings: { ...widget.infoSettings, titleColor }
    })),
  setVideoWidgetInfoScreenButtonText: (buttonText: string) =>
    updateWidget(widget => ({
      ...widget,
      infoSettings: { ...widget.infoSettings, buttonText }
    })),
  setVideoWidgetInfoScreenButtonFontColor: (buttonFontColor: string) =>
    updateWidget(widget => ({
      ...widget,
      infoSettings: { ...widget.infoSettings, buttonFontColor }
    })),
  setVideoWidgetInfoScreenButtonBackgroundColor: (buttonBackgroundColor: string) =>
    updateWidget(widget => ({
      ...widget,
      infoSettings: { ...widget.infoSettings, buttonBackgroundColor }
    })),
  setVideoWidgetInfoScreenIcon: (icon: Icon) =>
    updateWidget(widget => ({
      ...widget,
      infoSettings: { ...widget.infoSettings, icon }
    })),
  setVideoWidgetInfoScreenLink: (link: string) =>
    updateWidget(widget => ({
      ...widget,
      infoSettings: { ...widget.infoSettings, link }
    })),

  // MobileSchema
  setVideoWidgetMobileEnabled: (mobileEnabled: boolean) =>
    updateWidget(widget => ({
      ...widget,
      mobileSettings: { ...widget.mobileSettings, mobileEnabled }
    })),
  setVideoWidgetMobileTriggerType: (triggerType: MobileTrigger) =>
    updateWidget(widget => ({
      ...widget,
      mobileSettings: { ...widget.mobileSettings, triggerType }
    })),
  setVideoWidgetMobileImageUrl: (imageUrl: string | undefined) =>
    updateWidget(widget => ({
      ...widget,
      mobileSettings: { ...widget.mobileSettings, imageUrl }
    })),
  setVideoWidgetMobileTriggerText: (triggerText: string) =>
    updateWidget(widget => ({
      ...widget,
      mobileSettings: { ...widget.mobileSettings, triggerText }
    })),
  setVideoWidgetMobileTriggerFontColor: (triggerFontColor: string) =>
    updateWidget(widget => ({
      ...widget,
      mobileSettings: { ...widget.mobileSettings, triggerFontColor }
    })),
  setVideoWidgetMobileTriggerBackgroundColor: (triggerBackgroundColor: string) =>
    updateWidget(widget => ({
      ...widget,
      mobileSettings: { ...widget.mobileSettings, triggerBackgroundColor }
    })),

  setVideoWidgetFormEnabled: (formEnabled: boolean) =>
    updateWidget(widget => ({ ...widget, formEnabled })),

  setVideoWidgetFormTitleFontSize: (formTitleFontSize: number) =>
    updateWidget(widget => ({ ...widget, formTitleFontSize })),

  setVideoWidgetBrandingEnabled: (brandingEnabled: boolean) =>
    updateWidget(widget => ({ ...widget, brandingEnabled })),

  resetVideoWidgetColors: () =>
    updateWidget(widget => {
      const defaults = buildVideoWidgetSettings()
      return {
        ...widget,
        appearence: {
          ...widget.appearence,
          backgroundColor: defaults.appearence.backgroundColor,
        },
        infoSettings: {
          ...widget.infoSettings,
          titleColor: defaults.infoSettings.titleColor,
          buttonFontColor: defaults.infoSettings.buttonFontColor,
          buttonBackgroundColor: defaults.infoSettings.buttonBackgroundColor,
        },
      }
    }),
})
