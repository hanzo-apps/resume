import { useEffect, useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, SizableText, Button } from '@hanzo/gui'
import { Resume } from './resume'
import { Editor } from './editor'

type Mode = 'resume' | 'editor'

/** True while the browser print dialog is open, so the app can hide its chrome. */
function usePrinting() {
  const [printing, setPrinting] = useState(false)
  useEffect(() => {
    const on = () => setPrinting(true)
    const off = () => setPrinting(false)
    window.addEventListener('beforeprint', on)
    window.addEventListener('afterprint', off)
    return () => {
      window.removeEventListener('beforeprint', on)
      window.removeEventListener('afterprint', off)
    }
  }, [])
  return printing
}

/**
 * Signed-in shell: a slim toolbar (Resume ⇄ Editor, Print, Sign out) over the
 * two views. On print the toolbar is removed, so a clean resume prints alone.
 */
export function Home() {
  const { user, logout } = useIam()
  const [mode, setMode] = useState<Mode>('resume')
  const printing = usePrinting()
  const who = user?.displayName || user?.name || user?.email || 'you'

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor="$color2">
      {printing ? null : (
        <XStack
          alignItems="center"
          justifyContent="space-between"
          gap="$4"
          flexWrap="wrap"
          paddingHorizontal="$5"
          paddingVertical="$3"
          backgroundColor="$background"
          borderBottomWidth={1}
          borderColor="$borderColor"
        >
          <XStack alignItems="baseline" gap="$3">
            <SizableText fontSize={18} fontWeight="800" letterSpacing={-0.5} color="$color12">
              Curriculum
            </SizableText>
            <SizableText fontSize={13} color="$color10">
              {who}
            </SizableText>
          </XStack>

          <XStack alignItems="center" gap="$2" flexWrap="wrap">
            <Segmented mode={mode} onChange={setMode} />
            <Button size="$3" disabled={mode !== 'resume'} onPress={() => window.print()}>
              Print
            </Button>
            <Button size="$3" chromeless onPress={() => logout()}>
              Sign out
            </Button>
          </XStack>
        </XStack>
      )}

      <YStack flex={1} paddingHorizontal="$4">
        {mode === 'resume' ? <Resume onEdit={() => setMode('editor')} /> : <Editor />}
      </YStack>
    </YStack>
  )
}

/** Two-state pill toggle between the resume and the editor. */
function Segmented({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const opts: { value: Mode; label: string }[] = [
    { value: 'resume', label: 'Resume' },
    { value: 'editor', label: 'Editor' },
  ]
  return (
    <XStack borderWidth={1} borderColor="$borderColor" borderRadius="$10" padding="$1" gap="$1">
      {opts.map((o) => {
        const on = mode === o.value
        return (
          <Button
            key={o.value}
            size="$2"
            borderRadius="$10"
            backgroundColor={on ? '$color12' : 'transparent'}
            onPress={() => onChange(o.value)}
          >
            <Button.Text fontSize={13} fontWeight="600" color={on ? '$background' : '$color11'}>
              {o.label}
            </Button.Text>
          </Button>
        )
      })}
    </XStack>
  )
}
