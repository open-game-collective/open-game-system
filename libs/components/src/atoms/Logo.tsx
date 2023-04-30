import { Text } from './Text';
import * as React from "react"
import { SVGProps } from "react"

export const Logo = () => {
  return <Text css={{ fontFamily: '$WoodChop' }}>Explorers Club</Text>;
};


export const CompanyLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    xmlSpace="preserve"
    style={{
      fillRule: "evenodd",
      clipRule: "evenodd",
      strokeLinejoin: "round",
      strokeMiterlimit: 2,
    }}
    viewBox="0 0 840 135"
    {...props}
  >
    <use xlinkHref="#a" width={840} height={135} />
    <defs>
      <image
        xlinkHref="data:image/png;base64,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"
        id="a"
        width={840}
        height={135}
      />
    </defs>
  </svg>
)
