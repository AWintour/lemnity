import SvgIcon from '@/components/SvgIcon'
import iconAdd from '@/assets/icons/add.svg'

type IconProps = {
  color: string
}

export const FabMenuAddIcon = ({ color }: IconProps) => (
  <div style={{ color: color }} className="">
    <div className="w-7.5 h-7.5">
      <SvgIcon src={iconAdd} className="rotate-45" />
    </div>
  </div>
)
