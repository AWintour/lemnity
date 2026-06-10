import React, { useCallback } from 'react'
import SvgIcon from '@/components/SvgIcon'
import addIcon from '../../assets/icons/add.svg'

const AddProjectsBlock: React.FC<{ onCreateClick?: () => void }> = ({ onCreateClick }) => {
  const handleOpen = useCallback(() => onCreateClick?.(), [onCreateClick])

  const promoBlock = () => {
    return (
      <div className="w-full flex flex-row gap-2.5 min-h-[210px] py-2.5">
        <div className="flex"></div>

        <div className="flex flex-col text-left flex-1 gap-5.5 p-2.5 justify-center items-center  ">
          <h1 className="text-[40px] font-medium leading-[1.24] text-center tracking-[-0.25px] max-w-[850px]">
            Эффективные <span className="text-[#1A52DB]">виджеты</span> для роста продаж и базы
            клиентов
          </h1>
          <p className="text-xl leading-6 tracking-[-0.25px] flex items-center text-center  font-normal max-w-[850px]">
            Внедряйте современные решения для всплывающих окон, чтобы повысить количество лидов,
            расширить базу подписчиков и укрепить клиентскую аудиторию.
          </p>
        </div>
      </div>
    )
  }

  const addProjectButton = () => {
    return (
      <div className="flex flex-col justify-center items-center self-stretch p-0 gap-[30px] ">
        <div className="font-normal text-[25px] text-center text-[#777777]">
          <p className="flex leading-[30px] tracking-[0.005em]">
            У вас нет собранных проектов с виджетами.
          </p>
          <p>Для этого добавьте свой первый проект</p>
        </div>
        <button
          onClick={handleOpen}
          className="bg-[#E8E8E8] group box-border flex flex-col justify-center items-center
            text-[#C0C0C0] font-roboto
            p-4 gap-[10px] w-[510px] h-[127px] rounded-[14px]
            transition-colors duration-200
            border border-dashed border-2 border-[#8781E5] hover:border-purple-400
            bg-[#8781E5] hover:bg-purple-50
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          <div
            className="w-[26px] h-[26px] rounded-full flex items-center justify-center
           group-hover:text-purple-600 transition-colors duration-200 "
          >
            <SvgIcon size={'26px'} src={addIcon} />
          </div>
          <span className="text-base font-normal text-[#8781E5] font-semibold">
            Добавить проект
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[15px]">
      {promoBlock()}
      {addProjectButton()}
    </div>
  )
}

export default AddProjectsBlock
