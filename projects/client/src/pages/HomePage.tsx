import Header from '@/layouts/Header/Header'
import DashboardLayout from '@/layouts/DashboardLayout/DashboardLayout'
import Stats from '@/layouts/Stats/Stats'
import HomePageBanner from '@/layouts/HomePageBanner/HomePageBanner'
import AddProjectsBlock from '@/layouts/AddProjectsBlock/AddProjectsBlock'
import ProjectList from '@/layouts/ProjectList/ProjectList'
import AddProjectModal from '@/layouts/AddProjectsBlock/AddProjectModal'
import { useState, useCallback, useEffect } from 'react'
import { useProjectsStore } from '@/stores/projectsStore'
import useUserStore from '@/stores/userStore'
import { Button } from '@heroui/button'
import chatboxIcon from '@/assets/icons/chatbox.svg'
// import MaintenancePage from './MaintenancePage'
// import CenteredLayout from '@/layouts/CenteredLayout'


import { useAppDispatch, useAppSelector } from '@/stores/redux/hooks'
import { fetchPaymentPlansThunk, fetchUserPaymentInfoThunk, selectPaymentInfoFetchStatus, selectPaymentPlansFetchStatus } from '@/stores/redux/paymentSlice'

const HomePage = () => {
  const projects = useProjectsStore(s => s.projects)
  const createProject = useProjectsStore(s => s.createProject)
  const user = useUserStore(s => s.user)
  const userName = user?.name || ''

  const dispatch = useAppDispatch()

  const paymentInfoFetchStatus = useAppSelector(selectPaymentInfoFetchStatus)
  const paymentPlansFetchStatus = useAppSelector(selectPaymentPlansFetchStatus)

  useEffect(() => {
    if (paymentInfoFetchStatus === 'idle') {
      dispatch(fetchUserPaymentInfoThunk())
    }
  }, [dispatch, paymentInfoFetchStatus])
  
  useEffect(() => {
    if (paymentPlansFetchStatus === 'idle') {
      dispatch(fetchPaymentPlansThunk())
    }
  }, [dispatch, paymentPlansFetchStatus])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const handleOpen = useCallback(() => setIsModalOpen(true), [])
  const handleClose = useCallback(() => setIsModalOpen(false), [])

  const handleAddProject = useCallback(
    async (name: string, url: string, enabled: boolean = true) => {
      await createProject(name, url, enabled)
      setIsModalOpen(false)
    },
    [createProject]
  )

  const rightPanel = (
    <Button isIconOnly variant="flat" radius="full" onPress={() => alert('chat')}>
      <img src={chatboxIcon} alt="Chat" className="w-[22px] h-[22px]" />
    </Button>
  )

  return (
    // <CenteredLayout>
    //   <MaintenancePage />
    // </CenteredLayout>
    <div className="h-full flex flex-col">
      <Header />
      <DashboardLayout rightPanel={rightPanel}>
        <div className="flex flex-col gap-[1px]">
          <span className="text-xl font-roboto">Здравствуйте, {userName}</span>
          {/* <span className="text-sm text-gray-500">Маркетолок компании "Вкусняшки"</span> */}
        </div>
        <hr className="border-[#C0C0C0]" />
        <div className="flex flex-row">
          <div className="mr-2.5">
            <Stats />
          </div>
          <div className="h-full grow">
            <HomePageBanner />
          </div>
        </div>
        <hr className="border-[#C0C0C0]" />
        {projects.length > 0 ? (
          <ProjectList onCreateClick={handleOpen} />
        ) : (
          <AddProjectsBlock onCreateClick={handleOpen} />
        )}
        <AddProjectModal
          isOpen={isModalOpen}
          onClose={handleClose}
          onAddProject={handleAddProject}
        />
      </DashboardLayout>
    </div>
  )
}

export default HomePage
