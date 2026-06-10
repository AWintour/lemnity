import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {
  Project as ApiProject,
  CreateProjectDto,
  UpdateProjectDto,
  Widget,
  CreateWidgetDtoTypeEnum
} from '@lemnity/api-sdk'
import * as projectsService from '@/services/projects'
import * as widgetsService from '@/services/widgets'

export interface MetricDetails {
  value: number
  desktop: number
  mobile: number
}

export interface ProjectMetrics {
  visitors: MetricDetails
  impressions: MetricDetails
  conversions: MetricDetails
  activity: MetricDetails
}

export interface Project {
  id: string
  name: string
  websiteUrl: string
  enabled: boolean
  widgets: Widget[]
  metrics: ProjectMetrics
  createdAt: Date
}

type ProjectsState = {
  projects: Project[]
  isLoading: boolean
  error: string | null
  hasLoaded: boolean
}
type ProjectsActions = {
  loadProjects: () => Promise<void>
  ensureLoaded: () => Promise<void>
  createProject: (title: string, websiteUrl: string, enabled?: boolean) => Promise<void>
  toggleProjectEnabled: (id: string, enabled: boolean) => Promise<void>
  updateProject: (
    id: string,
    patch: { title?: string; websiteUrl?: string; enabled?: boolean }
  ) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  // Widget actions
  createWidget: (
    projectId: string,
    name: string,
    type: CreateWidgetDtoTypeEnum,
    config?: Record<string, unknown>
  ) => Promise<Widget>
  toggleWidgetEnabled: (projectId: string, widgetId: string, enabled: boolean) => Promise<void>
  updateWidget: (
    projectId: string,
    widgetId: string,
    updates: { name?: string; config?: object }
  ) => Promise<void>
  saveWidgetConfig: (projectId: string, widgetId: string, config: object) => Promise<Widget>
  deleteWidget: (projectId: string, widgetId: string) => Promise<void>
}
export type ProjectsStore = ProjectsState & ProjectsActions

const initialProjects: Project[] = []

function mapApiToStoreProject(p: ApiProject): Project {
  return {
    id: p.id,
    name: p.title,
    websiteUrl: p.websiteUrl,
    enabled: p.enabled,
    widgets: p.widgets || [],
    createdAt: new Date(p.createdAt),
    metrics: {
      visitors: { value: 0, desktop: 0, mobile: 0 },
      impressions: { value: 0, desktop: 0, mobile: 0 },
      conversions: { value: 0, desktop: 0, mobile: 0 },
      activity: { value: 0, desktop: 0, mobile: 0 }
    }
  }
}

export const useProjectsStore = create<ProjectsStore>()(
  devtools(
    persist(
      (set, get) => ({
        projects: initialProjects,
        isLoading: false,
        error: null,
        hasLoaded: false,

        loadProjects: async () => {
          set({ isLoading: true, error: null }, false, 'projects/load:start')
          try {
            const projects = await projectsService.listProjects()
            const mapped = projects
              .map(mapApiToStoreProject)
              .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            set(
              { projects: mapped, isLoading: false, hasLoaded: true },
              false,
              'projects/load:success'
            )
          } catch {
            set(
              { isLoading: false, error: 'Failed to load projects', hasLoaded: true },
              false,
              'projects/load:error'
            )
          }
        },

        ensureLoaded: async () => {
          const { hasLoaded, isLoading } = get()
          if (hasLoaded || isLoading) return
          await get().loadProjects()
        },

        createProject: async (title, websiteUrl, enabled = true) => {
          set({ isLoading: true, error: null }, false, 'projects/create:start')
          try {
            const payload: CreateProjectDto = { title, websiteUrl, enabled }
            const created = await projectsService.createProject(payload)
            const mapped = mapApiToStoreProject(created)
            set(
              state => ({ projects: [mapped, ...state.projects], isLoading: false }),
              false,
              'projects/create:success'
            )
          } catch (e) {
            set(
              { isLoading: false, error: 'Failed to create project' },
              false,
              'projects/create:error'
            )
            throw e // ВАЖНО: пробрасываем, чтобы модалка не закрылась
          }
        },

        toggleProjectEnabled: async (id: string, enabled: boolean) => {
          set({ error: null }, false, 'projects/toggle:start')
          try {
            const patch: UpdateProjectDto = { enabled }
            const updated = await projectsService.updateProject(id, patch)
            const mapped = mapApiToStoreProject(updated)
            set(
              state => ({ projects: state.projects.map(p => (p.id === id ? mapped : p)) }),
              false,
              'projects/toggle:success'
            )
          } catch {
            set({ error: 'Failed to update project' }, false, 'projects/toggle:error')
          }
        },

        updateProject: async (id, patch) => {
          set({ error: null }, false, 'projects/update:start')
          try {
            const updated = await projectsService.updateProject(id, patch as UpdateProjectDto)
            const mapped = mapApiToStoreProject(updated)
            set(
              state => ({ projects: state.projects.map(p => (p.id === id ? mapped : p)) }),
              false,
              'projects/update:success'
            )
          } catch (e) {
            set({ error: 'Failed to update project' }, false, 'projects/update:error')
            throw e // пробрасываем, чтобы модалка не закрылась при ошибке
          }
        },

        deleteProject: async (id: string) => {
          set({ error: null }, false, 'projects/delete:start')
          try {
            await projectsService.deleteProject(id)
            set(
              state => ({ projects: state.projects.filter(p => p.id !== id) }),
              false,
              'projects/delete:success'
            )
          } catch (e) {
            set({ error: 'Failed to delete project' }, false, 'projects/delete:error')
            throw e
          }
        },

        // Widget actions
        createWidget: async (
          projectId: string,
          name: string,
          type: CreateWidgetDtoTypeEnum,
          config?: Record<string, unknown>
        ) => {
          set({ isLoading: true, error: null }, false, 'projects/widget/create:start')
          try {
            const created = await widgetsService.createWidget({
              projectId,
              name,
              type,
              enabled: false,
              config
            })
            set(
              state => ({
                projects: state.projects.map(p =>
                  p.id === projectId ? { ...p, widgets: [...p.widgets, created] } : p
                ),
                isLoading: false
              }),
              false,
              'projects/widget/create:success'
            )
            return created
          } catch (error) {
            set(
              { isLoading: false, error: 'Failed to create widget' },
              false,
              'projects/widget/create:error'
            )
            throw error
          }
        },

        toggleWidgetEnabled: async (projectId: string, widgetId: string, enabled: boolean) => {
          set({ error: null }, false, 'projects/widget/toggle:start')
          try {
            const updated = await widgetsService.toggleWidgetEnabled(widgetId, enabled)
            set(
              state => ({
                projects: state.projects.map(p =>
                  p.id === projectId
                    ? { ...p, widgets: p.widgets.map(w => (w.id === widgetId ? updated : w)) }
                    : p
                )
              }),
              false,
              'projects/widget/toggle:success'
            )
          } catch (error) {
            set({ error: 'Failed to toggle widget' }, false, 'projects/widget/toggle:error')
            throw error
          }
        },

        updateWidget: async (
          projectId: string,
          widgetId: string,
          updates: { name?: string; config?: object }
        ) => {
          set({ error: null }, false, 'projects/widget/update:start')
          try {
            const updated = await widgetsService.updateWidget(widgetId, updates)
            set(
              state => ({
                projects: state.projects.map(p =>
                  p.id === projectId
                    ? { ...p, widgets: p.widgets.map(w => (w.id === widgetId ? updated : w)) }
                    : p
                )
              }),
              false,
              'projects/widget/update:success'
            )
          } catch (error) {
            set({ error: 'Failed to update widget' }, false, 'projects/widget/update:error')
            throw error
          }
        },

        saveWidgetConfig: async (projectId: string, widgetId: string, config: object) => {
          set({ error: null }, false, 'projects/widget/save-config:start')
          try {
            const updated = await widgetsService.updateWidget(widgetId, { config })
            set(
              state => ({
                projects: state.projects.map(p =>
                  p.id === projectId
                    ? { ...p, widgets: p.widgets.map(w => (w.id === widgetId ? updated : w)) }
                    : p
                )
              }),
              false,
              'projects/widget/save-config:success'
            )
            return updated
          } catch (error) {
            set(
              { error: 'Failed to save widget config' },
              false,
              'projects/widget/save-config:error'
            )
            throw error
          }
        },

        deleteWidget: async (projectId: string, widgetId: string) => {
          set({ error: null }, false, 'projects/widget/delete:start')
          try {
            await widgetsService.deleteWidget(widgetId)
            set(
              state => ({
                projects: state.projects.map(p =>
                  p.id === projectId
                    ? { ...p, widgets: p.widgets.filter(w => w.id !== widgetId) }
                    : p
                )
              }),
              false,
              'projects/widget/delete:success'
            )
          } catch (error) {
            set({ error: 'Failed to delete widget' }, false, 'projects/widget/delete:error')
            throw error
          }
        }
      }),
      {
        name: 'projectsStore',
        // Keep cached projects for fast reload; transient flags stay ephemeral
        partialize: state => ({ projects: state.projects })
      }
    ),
    { name: 'projectsStore' }
  )
)
