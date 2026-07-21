import { useMemo, type ReactNode } from 'react'
import { GuiProvider } from '@hanzo/gui'
import { IamProvider, useIam } from '@hanzo/iam/react'
import { BaseProvider } from '@hanzo/base/react'
import guiConfig from './gui.config'
import { iamConfig } from './iam.config'
import { baseAs } from './lib/base'

/**
 * Bridges the IAM session into Hanzo Base: builds a BaseClient carrying the
 * signed-in user's IAM token and re-creates it whenever the token changes, so
 * every useQuery/useMutation under it is scoped to that user's org.
 */
function BaseBridge({ children }: { children: ReactNode }) {
  const { accessToken } = useIam()
  const client = useMemo(() => baseAs(accessToken), [accessToken])
  return <BaseProvider client={client}>{children}</BaseProvider>
}

/**
 * The one provider stack, in the order the canonical Hanzo surfaces ship:
 * gui (design system) → IAM (identity) → Base (data). Curriculum fixes the
 * `light` theme — a resume is a paper document, and light prints clean; wrap a
 * subtree in <Theme name="dark"> to invert it.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <GuiProvider config={guiConfig} defaultTheme="light">
      <IamProvider config={iamConfig}>
        <BaseBridge>{children}</BaseBridge>
      </IamProvider>
    </GuiProvider>
  )
}
