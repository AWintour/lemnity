import { cn } from '@heroui/theme'

import SvgIcon from '@/components/SvgIcon'
import lemnityBlackLogo from '@/assets/logos/lemnity-black-logo.svg'

type CompanyLogoProps = {
  black?: boolean,
  companyLogo?: string
}

const CompanyLogo = ({ black, companyLogo }: CompanyLogoProps) => {
  return (
    <>
      {companyLogo && companyLogo.length > 0
        ? <img
            src={companyLogo}
            alt="Company Logo"
            className="w-42 h-9.5 object-contain"
          />
        : <div className={cn(
            'w-42 h-9.5',
            black ? 'fill-black text-black' : 'fill-white text-white'
          )}>
            <SvgIcon src={lemnityBlackLogo} alt="Company Logo" />
          </div>
      }
    </>
  )
}

export default CompanyLogo
