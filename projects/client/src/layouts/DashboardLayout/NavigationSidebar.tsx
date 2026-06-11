import './NavigationSidebar.css'
import iconProjects from '@/assets/icons/projects.svg'
import iconSuccessList from '@/assets/icons/success-list.svg'
import iconWallet from '@/assets/icons/wallet.svg'
import iconPaperAirplane from '@/assets/icons/paper-airplane.svg'
import iconEnvelope from '@/assets/icons/open-envelope.svg'
import iconTelephone from '@/assets/icons/telephone-call.svg'
import iconStatistics from '@/assets/icons/statistics-circle-chart.svg'
import { Listbox, ListboxItem } from '@heroui/listbox'
import { Tooltip } from '@heroui/tooltip'
import SvgIcon from '@/components/SvgIcon'
import iconDocumentation from '@/assets/icons/doc.svg'
import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useSidebarStore } from '@/stores/sidebarStore'
import { Button } from '@heroui/button'
import { useLocation } from 'react-router-dom'
import { getNewRequestsCount } from '@/services/requests'
import { cn } from '@heroui/theme'
import { useViewportWidth } from '@/hooks/useViewportWidth'
import { useProjectsStore } from '@/stores/projectsStore'
import { WidgetTypeEnum } from '@lemnity/api-sdk'

// Общий личный кабинет lemnity.ru. «Оплата и тарифы» уводит в раздел «Тарифы» ЛК.
// target=_top: app встроен в iframe кабинета — навигируем верхнее окно (весь ЛК);
// в standalone-режиме это обычный переход. Домен настраивается через VITE_LK_URL.
const LK_URL = import.meta.env.VITE_LK_URL || 'https://lemnity.ru'

interface MenuItem {
  key: string
  icon: ReactNode
  label: string
  badge?: string | number
  href?: string
  target?: string
}

const NavigationSidebar = () => {
  const { isVisible, hide } = useSidebarStore()
  const location = useLocation()
  const viewportWidth = useViewportWidth()
  const previousWidthRef = useRef(viewportWidth)

  const [newRequestsCount, setNewRequestsCount] = useState<number | null>(null)

  // Вкладка «Звонки» появляется только когда есть включённый виджет «Обратный звонок».
  const projects = useProjectsStore(s => s.projects)
  const ensureProjectsLoaded = useProjectsStore(s => s.ensureLoaded)
  useEffect(() => {
    void ensureProjectsLoaded()
  }, [ensureProjectsLoaded])
  const hasEnabledCallback = useMemo(
    () => projects.some(p => p.widgets.some(w => w.type === WidgetTypeEnum.CALLBACK && w.enabled)),
    [projects]
  )

  useEffect(() => {
    if (previousWidthRef.current >= 1350 && viewportWidth < 1350 && isVisible) {
      hide()
    }
    previousWidthRef.current = viewportWidth
  }, [viewportWidth, isVisible, hide])

  const activeKey = (() => {
    const path = location.pathname
    if (path.startsWith('/analytics')) return 'analytics'
    if (path.startsWith('/calls')) return 'calls'
    if (path.startsWith('/requests')) return 'requests'
    if (path.startsWith('/projects')) return 'projects'
    if (path === '/' || path.startsWith('/dashboard')) return 'projects'
    return 'projects'
  })()

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const count = await getNewRequestsCount()
        if (!isMounted) return
        setNewRequestsCount(count)
      } catch {
        if (!isMounted) return
        setNewRequestsCount(null)
      }
    }

    void load()

    const intervalId = window.setInterval(() => {
      void load()
    }, 30_000)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        key: 'projects',
        icon: (
          <div className="w-5.5 h-5.5">
            <SvgIcon src={iconProjects} size={'22px'} className={'text-black '} />
          </div>
        ),
        label: 'Проекты',
        href: '/'
      },
      {
        key: 'analytics',
        icon: <img src={iconStatistics} alt="Аналитика" className="w-5 h-5" />,
        label: 'Аналитика',
        href: '/analytics'
      },
      {
        key: 'requests',
        icon: (
          <div className="w-5.5 h-5.5">
            <SvgIcon src={iconSuccessList} size={'22px'} className={'text-black '} />
          </div>
        ),
        label: 'Заявки',
        badge: newRequestsCount && newRequestsCount > 0 ? newRequestsCount : undefined,
        href: '/requests'
      },
      ...(hasEnabledCallback
        ? [
            {
              key: 'calls',
              icon: (
                <div className="w-5.5 h-5.5">
                  <SvgIcon src={iconTelephone} size={'22px'} className={'text-black '} />
                </div>
              ),
              label: 'Звонки',
              href: '/calls'
            } as MenuItem
          ]
        : []),
      {
        key: 'payment',
        icon: (
          <div className="w-5.5 h-5.5">
            <SvgIcon src={iconWallet} size={'22px'} className={'text-black '} />
          </div>
        ),
        label: 'Оплата и тарифы',
        href: `${LK_URL}/pricing`,
        target: '_top'
      }
    ],
    [newRequestsCount, hasEnabledCallback]
  )

  const getFooter = () => (
    <div className="rounded-[10px] border border-[#ECEAEA] flex flex-col justify-between px-2.5 pt-1.25 pb-2.5">
      <div className="flex items-center gap-3.5">
        <div className="flex-1 rounded-lg relative">
          <p className="font-normal text-[16px] leading-4.75 text-default-900 text-center">
            Техническая поддержка
          </p>
        </div>
      </div>
      <a href="mailto:hello@lemnity.ru?subject=У меня возникли проблемы или вопросы по работе в личном кабинете.&body=Опишите подробно возникшую проблему или свой вопрос:">
        <Button
          radius="sm"
          color="default"
          variant="solid"
          className="w-full h-8.75 rounded-[5px] font-normal text-base mt-2.5 bg-[#E7E8EA]"
        >
          Написать
        </Button>
      </a>
      <a
        href="mailto:support@lemnity.ru"
        className="mt-2 text-sm leading-5.5 text-[#292D32] text-center font-bold underline "
      >
        support@lemnity.ru
      </a>
      <div className="flex justify-center gap-4 mt-2">
        <button className="text-default-400 hover:text-default-600 transition-colors">
          <a href="https://t.me/lemnity_ru" target="_blank">
            <img src={iconPaperAirplane} alt="Телеграм" className="w-4 h-4" />
          </a>
        </button>
        <button className="text-default-400 hover:text-default-600 transition-colors">
          <a href="mailto:support@lemnity.ru" target="_blank">
            <img src={iconEnvelope} alt="Почта" className="w-4 h-4" />
          </a>
        </button>
        <button className="text-default-400 hover:text-default-600 transition-colors">
          <a href="tel:+79821300012" target="_blank">
            <img src={iconTelephone} alt="Телефон" className="w-4 h-4" />
          </a>
        </button>
      </div>
    </div>
  )

  const getExpandedMenu = useCallback(
    (menuItems: MenuItem[]) => {
      return (
        <Listbox
          aria-label="Navigation menu"
          // defaultSelectedKeys={['analytics']} // почему-то not working
          variant="flat"
          classNames={{
            list: 'p-0 gap-2.5',
            base: 'p-0'
          }}
        >
          {menuItems.map(item => (
            <ListboxItem
              key={item.key}
              startContent={item.icon}
              href={item.href || '/'}
              target={item.target}
              classNames={{
                title: 'text-base',
                base: cn(
                  'h-[42px] px-4 gap-2.5 rounded-[5px] text-black data-[selectable=true]:focus:bg-[#E8E8E8] data-[hover=true]:bg-[#E8E8E8]',
                  activeKey === item.key ? 'bg-default-200' : ''
                )
              }}
              endContent={
                item.badge && (
                  <span className="bg-[#3BB240] text-white text-[9px] font-normal px-2.5 py-0.5 leading-3.5 rounded-full h-[18px] text-center">
                    {typeof item.badge === 'number' && item.badge > 999
                      ? '999+'
                      : String('+ ' + item.badge)}
                  </span>
                )
              }
            >
              {item.label}
            </ListboxItem>
          ))}
        </Listbox>
      )
    },
    [activeKey]
  )

  return (
    <aside
      className={`${isVisible ? 'w-60 px-4.75' : 'w-16 px-3'} h-full flex flex-col justify-between py-4.5 rounded-l-[14px] sidebar-bg transition-all duration-300 ease-in-out`}
    >
      <nav className="flex flex-col gap-2.5">
        {!isVisible ? (
          <div className="flex flex-col gap-2.5">
            {menuItems.map(item => (
              <Tooltip key={item.key} content={item.label} placement="right">
                <a
                  href={item.href || '#'}
                  target={item.target}
                  className={`flex items-center justify-center w-10 h-10.5 rounded-[5px] hover:bg-default-100 transition-colors relative ${activeKey === item.key ? 'bg-default-200' : ''}`}
                >
                  {item.icon}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-success text-white text-[9px] font-normal px-1.5 py-0.5 leading-3.5 rounded-full h-[18px] text-center min-w-[18px]">
                      {typeof item.badge === 'number' && item.badge > 999
                        ? '999+'
                        : String(item.badge)}
                    </span>
                  )}
                </a>
              </Tooltip>
            ))}
          </div>
        ) : (
          getExpandedMenu(menuItems)
        )}

        <hr className="w-full h-px mx-auto border-0 bg-default-300" />
      </nav>

      {isVisible && (
        <>
          <a
            href="https://help.lemnity.ru"
            target="_blank"
            className="relative h-10.5 gap-2 flex flex-row justify-center items-center mt-auto mb-2.5"
          >
            <span className="relative text-normal group">
              <div className="absolute right-full mr-2.5 top-1/2 -translate-y-1/2">
                <SvgIcon src={iconDocumentation} size={'20px'} />
              </div>
              Документация
            </span>
          </a>
          {getFooter()}
        </>
      )}
    </aside>
  )
}

export default memo(NavigationSidebar)
